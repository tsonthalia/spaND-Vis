// Visualization Model created by Tanay Sonthalia

import React from 'react';
import Plot from 'react-plotly.js';
import * as d3 from 'd3';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      folder: "data/A.70.7/", //change this line to change the set of data being used
      width: 0, //width of the updateWindowDimensions
      height: 0, //height of the window
      traces: [[]], //e.g. traces[level][id] will return the trace at that level and with that id
      size: 5, //size of the points on the scatterplot
      opacity: [], //e.g. opacity[level] will return opacity of that level
      level: 0, //current slider level
      leveltoId: [[]], //e.g. leveltoId[level] will return an array of ids at that level
      idtoLevel: [], //e.g. idtoLevel[id] will return the level with that id
      childToParent: [], //e.g. childToParent[child] will return that child cluster's corresponding parent cluster
      // x: [[[]]], //e.g. x[level][id] will return an array of x values at that level on the slider with that id
      // y: [[[]]], //e.g. y[level][id] will return an array of y values at that level on the slider with that id
      // z: [[[]]], //e.g. z[level][id] will return an array of z values at that level on the slider with that id
      levelTextColor: [], //color of each level in the "Show Levels" section (black = level is currently shown, gray = level is currently hidden)
      hiddenPlots: [], //which plot is currently being used (which level on the this.state.traces variable)
      currCluster: 0, //cluster that has been inputted into the textfield to show surfaces
      tabs: ["block", "block", "none"], //display value for the tabs on the sidebar (e.g. Levels, Surfaces, Advanced Tools)
      toggledSurfaces: [], //lists which surfaces are being shown on the side under "Click Surface to Remove"
      adjacencyList: [[]], //holds all connections between points
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.loadPlot = this.loadPlot.bind(this);
  }

  loadPlot() { //loads all of the information that the plot needs
    let self = this; //'this' is undefined in an XMLHttpRequest, so another variable must hold the value so that 'this' can be used

    var folder = this.state.folder;
    var merging3d = new XMLHttpRequest();
    merging3d.open("GET", folder + 'merging3d.txt', false); //creates get request for the text files of merging3d.txt
    merging3d.onreadystatechange = function ()
    {
        if(merging3d.readyState === 4)
        {
            if(merging3d.status === 200 || merging3d.status === 0)
            {
              var clusters3d = new XMLHttpRequest();
              clusters3d.open("GET", folder + 'clusters3d.txt', false);
              clusters3d.onreadystatechange = function ()
              {
                  if(clusters3d.readyState === 4)
                  {
                      if(clusters3d.status === 200 || clusters3d.status === 0)
                      {
                        d3.csv(folder + 'clustering3d.csv').then(function(clustering3dData) {
                          d3.csv(folder + 'coordinates.csv').then(function(uniqueIdCoordinateData) {
                            d3.csv(folder + 'adjacency.csv').then(function(adjacencyData) {
                              //console.log(data);
                              console.group("Initial Loading Sequence");
                              // self.state.loadingMessage = "Getting Merging Data...";
                              // self.setState({loadingMessage: self.state.loadingMessage});
                              console.time("Merging Data");
                              //console.log("Getting Merging Data...")
                              //self.forceUpdate();

                              var merging3dText = merging3d.responseText.split('\n');

                              for (var i = 1; i < merging3dText.length; i++) {
                                var line = merging3dText[i].split(';');

                                self.state.childToParent[line[0]] = line[1]; //gets child cluster to parent cluster values from merging3d.txt file
                              }

                              console.timeEnd("Merging Data");
                              console.time("ID to Level Conversion Table");

                              var lvlToId = [[]]; // Holds ID and corresponding levels
                              var mergeLvl = []; // Holds merge level (currently not being used but stored in case needed in future)
                              var name = []; // Holds name of each cluster

                              var idToLvl = [[]]; // Holds conversion from id to level

                              var clusters3dText = clusters3d.responseText.split('\n');

                              // eslint-disable-next-line
                              for (var i = 1; i < clusters3dText.length-1; i++) {
                                var curr = clusters3dText[i].split(';')
                                if (lvlToId[curr[1]] === undefined) {
                                  lvlToId[curr[1]] = [];
                                }
                                if (idToLvl[curr[0]] === undefined) {
                                  idToLvl[curr[0]] = [];
                                }

                                lvlToId[curr[1]].push(curr[0]); //adds id at index of lvl
                                mergeLvl.push(curr[2]);
                                name.push(curr[3]);

                                idToLvl[curr[0]].push(curr[1]);
                              }

                              self.state.leveltoId = lvlToId;
                              self.state.idtoLevel = idToLvl;

                              console.timeEnd("ID to Level Conversion Table");
                              console.time("Tab Creation");

                              // eslint-disable-next-line
                              for (var i = 0; i < self.state.leveltoId.length; i++) {
                               self.state.opacity.push(0.8); // sets opacity to 0.8 for every subplot
                               self.state.levelTextColor.push("black");

                               if (i===0) {
                                 self.state.hiddenPlots.push("block");
                               } else {
                                 self.state.hiddenPlots.push("none");
                               }
                              }

                              console.timeEnd("Tab Creation");
                              console.time("Initial Plot View");

                              var x = [[[]]]; // holds x coordinate of each point (e.g. x[0][5] gives array of x coordinates at level 0 and id 5)
                              var y = [[[]]]; // holds y coordinate of each point (e.g. y[0][5] gives array of y coordinates at level 0 and id 5)
                              var z = [[[]]]; // holds z coordinate of each point (e.g. z[0][5] gives array of z coordinates at level 0 and id 5)
                              var pointId = [[[]]]; // holds id assigned to each specific point (e.g. pointId[0][5] gives array of ids at level 0 and id 5)

                              // eslint-disable-next-line
                              for (var i = 0; i < clustering3dData.length; i++) {
                                var coordinate = clustering3dData[i];
                                if (x[0][coordinate.id] === undefined) {
                                  x[0][coordinate.id] = [];
                                  y[0][coordinate.id] = [];
                                  z[0][coordinate.id] = [];
                                  pointId[0][coordinate.id] = [];
                                }

                                // adds new points at index 'id'
                                x[0][coordinate.id].push(coordinate.x);
                                y[0][coordinate.id].push(coordinate.y);
                                z[0][coordinate.id].push(coordinate.z);
                                pointId[0][coordinate.id].push(uniqueIdCoordinateData[i].id);
                              }

                              console.timeEnd("Initial Plot View");
                              console.time("All Plot Views");

                              //eslint-disable-next-line
                              for (var i = 1; i < lvlToId.length; i++) {
                                for (var j = x[i-1].length-1; j >= 0; j--) {
                                  if (x[i] === undefined) {
                                    x[i] = [[]];
                                    y[i] = [[]];
                                    z[i] = [[]];
                                    pointId[i] = [[]];
                                  }

                                  if (i !== 1) {
                                    if (self.state.childToParent[j] !== undefined && self.state.childToParent[j] !== null && self.state.childToParent[j] !== []) {
                                      if (x[i][self.state.childToParent[j]] === undefined) {
                                        x[i][self.state.childToParent[j]] = [];
                                        y[i][self.state.childToParent[j]] = [];
                                        z[i][self.state.childToParent[j]] = [];
                                        pointId[i][self.state.childToParent[j]] = [];
                                      }

                                      // pushes new clusters before merging
                                      x[i][self.state.childToParent[j]].push.apply(x[i][self.state.childToParent[j]], x[i-1][j]);
                                      y[i][self.state.childToParent[j]].push.apply(y[i][self.state.childToParent[j]], y[i-1][j]);
                                      z[i][self.state.childToParent[j]].push.apply(z[i][self.state.childToParent[j]], z[i-1][j]);
                                      pointId[i][self.state.childToParent[j]].push.apply(pointId[i][self.state.childToParent[j]], pointId[i-1][j]);
                                    }
                                  } else {
                                    x[1] = x[0];
                                    y[1] = y[0];
                                    z[1] = z[0];
                                    pointId[1] = pointId[0];
                                  }
                                }
                              }

                              console.timeEnd("All Plot Views");
                              console.time("Plot Traces");

                              // self.state.x = x;
                              // self.state.y = y;
                              // self.state.z = z;

                              // eslint-disable-next-line
                              for (var j = 0; j < x.length; j++) {
                                // eslint-disable-next-line
                                for (var i = 0; i < x[j].length; i++) {
                                  var tempName = "";
                                  //var tempColor = ""; //used for custom colors

                                  if (name[i].includes("not_fault")) {
                                    tempName = "Cluster"
                                    //tempColor = '#'+Math.floor(Math.random()*700000+1000000).toString(16);
                                  } else {
                                    tempName = "Fault"
                                    //tempColor = '#'+Math.floor(Math.random()*700000+16000000).toString(16);
                                  }

                                  if (idToLvl[i] >= j && x[j][i] !== undefined && x[j][i] !== []) {
                                    var trace = { // each trace is one cluster
                                      x: x[j][i], y: y[j][i], z: z[j][i], // provides array of x,y,z coordinates for the points in each cluster
                                      mode: 'markers',
                                      //legendgroup: 'Level ' + idToLvl[i],
                                      marker: {
                                        size: self.state.size,
                                        symbol: 'circle',
                                        //color: tempColor,
                                        color: '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6), // randomizes color
                                        line: {
                                          color: 'rgb(217, 217, 217)',
                                          width: 0.5
                                        },
                                        opacity: self.state.opacity
                                      },
                                      type: 'scatter3d',
                                      id: idToLvl[i],
                                      pointIds: pointId[j][i],
                                      name: tempName + ' ' + i + ' (Level ' + idToLvl[i] + ')' // e.g Cluster 5 (Level 0)
                                    };

                                    if (self.state.traces[j] === undefined) {
                                      self.state.traces[j] = [];
                                    }

                                    //self.state.traces[j][i] = trace;
                                    self.state.traces[j].push(trace);
                                  }
                                }
                              }

                              console.timeEnd("Plot Traces");
                              console.time("Adjacency List");

                              var adjacencyList = [[]];

                              // eslint-disable-next-line
                              for (var i = 0; i < adjacencyData.length; i++) {
                                adjacencyList[adjacencyData[i].id] = adjacencyData[i].nbrs.split(' ');
                                adjacencyList[adjacencyData[i].id].pop();
                              }

                              self.state.adjacencyList = adjacencyList;

                              console.timeEnd("Adjacency List");
                              console.groupEnd();
                              //console.time("Generated Plot");
                              //alert("Created Plot Traces");

                              //console.log(self.state.traces);
                              self.setState({traces: self.state.traces});
                            });
                          });
                        });
                      }
                  }
              }
              clusters3d.send(null);
            }
        }
    }

    merging3d.send(null);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    this.loadPlot();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  // componentDidUpdate() {
  //   if (this.state.traces[this.state.level] !== null && this.state.traces[this.state.level].length !== 0 && this.state.traces[this.state.level] !== undefined && this.state.leveltoId !== [[]] && this.state.leveltoId !== undefined) {
  //     setTimeout(function () {
  //       console.timeEnd("Generated Plot");
  //       console.groupEnd();
  //     });
  //   }
  // }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  toggleTab(event) { // on tab click
    var str;

    // Identifies which tab has been clicked
    if (event.target.id === "0") {
      str = "Levels";
    } else if (event.target.id === "1") {
      str = "Surfaces";
    } else if (event.target.id === "2") {
      str = "Advanced Tools"
    }

    // Either hides or shows the tab depending on current tab display
    if (this.state.tabs[Number(event.target.id)] === "none") {
      // eslint-disable-next-line
      this.state.tabs[Number(event.target.id)] = "block";
      event.target.innerHTML = "&#9660; " + str;
      this.setState({tabs: this.state.tabs});
    } else {
      // eslint-disable-next-line
      this.state.tabs[Number(event.target.id)] = "none";
      event.target.innerHTML = "&#9654; " + str;
      this.setState({tabs: this.state.tabs});
    }
  }

  changeLevel(event) { // on level slider move
    // eslint-disable-next-line
    this.state.hiddenPlots[this.state.level] = "none";
    // eslint-disable-next-line
    this.state.hiddenPlots[event.target.value] = "block";

    for (var i = 0; i < this.state.levelTextColor.length; i++) {
      if (i<event.target.value) {
        // eslint-disable-next-line
        this.state.levelTextColor[i] = "gray"; // sets color to gray if the level is less than the current level
      } else {
        // eslint-disable-next-line
        this.state.levelTextColor[i] = "black";
      }
    }

    this.setState({level: event.target.value});
  }

  toggleLevel(event) { //whether the level is shown or not
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
        if (this.state.traces[this.state.level][i].visible === false) { // if not visible, make the level visible
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = true;
          // eslint-disable-next-line
          this.state.levelTextColor[event.target.id] = "black";
        } else { // else hide the level
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = false;
          // eslint-disable-next-line
          this.state.levelTextColor[event.target.id] = "gray";
        }
      }
    }

    this.setState({traces: this.state.traces})
  }

  // showApproximateSurface(event) {
  //   var alreadyPresent = false;
  //   var index = null;
  //   for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
  //     if ((this.state.traces[this.state.level][i].name.includes("Cluster " + this.state.currCluster + " ") || this.state.traces[this.state.level][i].name.includes("Fault " + this.state.currCluster + " ")) && (!this.state.traces[this.state.level][i].name.includes('highlight'))) {
  //       index = i;
  //     }
  //   }
  //
  //   if (index != null) {
  //     // eslint-disable-next-line
  //     for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
  //       if (this.state.traces[this.state.level][i].name === this.state.traces[this.state.level][index].name + ' highlight') {
  //         this.state.traces[this.state.level].splice(i, 1);
  //         i--;
  //         alreadyPresent = true;
  //       } else if (this.state.traces[this.state.level][i].mode === 'lines+markers' && this.state.traces[this.state.level][i].name === this.state.traces[this.state.level][index].name) {
  //         // eslint-disable-next-line
  //         this.state.traces[this.state.level][i].mode = 'markers';
  //         i--;
  //         alreadyPresent = true;
  //       }
  //     }
  //
  //     if (alreadyPresent) {
  //       this.state.toggledSurfaces.splice(this.state.toggledSurfaces.indexOf(this.state.traces[this.state.level][index].name), 1); // removes the surface from the list of surfaces shown
  //     }
  //
  //     else { // show the surface
  //       var x = this.state.traces[this.state.level][index].x;
  //       var y = this.state.traces[this.state.level][index].y;
  //       var z = this.state.traces[this.state.level][index].z;
  //       var colorTemp = this.state.traces[this.state.level][index].marker.color;
  //
  //       var points = [[]];
  //
  //       // eslint-disable-next-line
  //       for (var i = 0; i < x.length; i++) {
  //         points[i] = [];
  //
  //         points[i].push(x[i]);
  //         points[i].push(y[i]);
  //         points[i].push(z[i]);
  //       }
  //
  //       // console.log(points);
  //       //
  //       // for (var i = 0; i < points.length-1; i++) {
  //       //   for (var j = i+1; j < points.length; j++) {
  //       //     if (points[i][0] === points[j][0] && points[i][1] === points[j][1] && points[i][2] === points[j][2]) {
  //       //       points.splice(j, 1);
  //       //       j--;
  //       //       console.log(j);
  //       //     }
  //       //   }
  //       // }
  //
  //       var triangles = triangulate(points); // triangulate() is imported from a different library
  //
  //       if (triangles.length === 0) {
  //         console.log("Drawing Surface over " + this.state.traces[this.state.level][index].name + " with Lines...");
  //         // eslint-disable-next-line
  //         this.state.traces[this.state.level][index].mode = 'lines+markers';
  //       }
  //
  //       else {
  //         console.log("Drawing Surface over " + this.state.traces[this.state.level][index].name + " with " + triangles.length + " Tetrahedrons...");
  //         //console.log(this.state.traces[0][0].x);
  //
  //         // eslint-disable-next-line
  //         for (var i = 0; i < triangles.length; i++) {
  //           var xTemp = [];
  //           var yTemp = [];
  //           var zTemp = [];
  //
  //           for (var j = 0; j < triangles[i].length; j++) {
  //             xTemp.push(x[triangles[i][j]]);
  //             yTemp.push(y[triangles[i][j]]);
  //             zTemp.push(z[triangles[i][j]]);
  //           }
  //
  //           var trace = {
  //             type: 'mesh3d',
  //             x: xTemp,
  //             y: yTemp,
  //             z: zTemp,
  //             i: [0, 0, 0, 1],
  //             j: [1, 2, 3, 2],
  //             k: [2, 3, 1, 3],
  //             // i: [0],
  //             // j: [1],
  //             // k: [2],
  //             facecolor: [
  //               colorTemp,
  //               colorTemp,
  //               colorTemp,
  //               colorTemp
  //             ],
  //             marker: {
  //               opacity: 1,
  //             },
  //             id: this.state.traces[this.state.level][index].id,
  //             name: this.state.traces[this.state.level][index].name + ' highlight',
  //
  //             flatshading: true,
  //           }
  //
  //           this.state.traces[this.state.level].push(trace);
  //         }
  //       }
  //
  //       this.state.toggledSurfaces.push(this.state.traces[this.state.level][index].name);
  //       this.state.toggledSurfaces.sort();
  //
  //       // this.state.toggledSurfaces.push(this.state.traces[this.state.level][index].name);
  //       //
  //       // var newSurface = {
  //       //   x: this.state.traces[this.state.level][index].x,
  //       //   y: this.state.traces[this.state.level][index].y,
  //       //   z: this.state.traces[this.state.level][index].z,
  //       //   mode: 'markers',
  //       //   //legendgroup: 'Level ' + idToLvl[i],
  //       //   marker: {
  //       //     size: 30,
  //       //     symbol: 'circle',
  //       //     color: this.state.traces[this.state.level][index].marker.color,
  //       //     line: {
  //       //       color: 'rgb(217, 217, 217)',
  //       //       width: 0.5
  //       //     },
  //       //     opacity: 0.1
  //       //   },
  //       //   id: this.state.traces[this.state.level][index].id,
  //       //   name: this.state.traces[this.state.level][index].name + ' highlight',
  //       //   type: 'scatter3d',
  //       //   showlegend: false,
  //       //   hoverinfo: 'skip',
  //       // }
  //       // this.state.traces[this.state.level].push(newSurface);
  //     }
  //
  //     this.setState({traces: this.state.traces});
  //   }
  // }

  plotClicked(event) { // on plot clicked event
    this.showSurfaceOnClick(event);
    // if (event.points[0].data.name.includes('highlight')) {
    //   var name = event.points[0].data.name;
    //   var lastIndex = name.lastIndexOf(" ")
    //   alert("Removing Surface over " + name.substring(0, lastIndex));
    // } else {
    //   alert("Drawing Surface over " + event.points[0].data.name);
    // }
  }

  updateCurrCluster(event) { // changes state variable currCluster when "Show Surface" text field is changed
    this.setState({currCluster: event.target.value});
  }

  showSurfaceButton(event) { // on click of "Show Surface"
    var alreadyPresent = false;
    var index = null;
    let self = this;

    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if ((this.state.traces[this.state.level][i].name.includes("Cluster " + this.state.currCluster + " ") || this.state.traces[this.state.level][i].name.includes("Fault " + this.state.currCluster + " ")) && (!this.state.traces[this.state.level][i].name.includes('highlight'))) {
        index = i;
      }
    }

    if (index != null) {
      var currCluster = self.state.traces[self.state.level][index];

      // eslint-disable-next-line
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        if (this.state.traces[this.state.level][i].name === this.state.traces[this.state.level][index].name + ' highlight') {
          alreadyPresent = true;
        }
      }

      if (!alreadyPresent) { // if the surface doesn't exist yet
        console.group("Surface Over " + currCluster.name);

        var adjacencyList = self.state.adjacencyList;
        var pointId = currCluster.pointIds;

        console.time("Previous to New ID Conversion Table");
        var prevToNewId = [];
        // eslint-disable-next-line
        for (var i = 0; i < pointId.length; i++) {
          prevToNewId[pointId[i]] = i;
        }

        console.timeEnd("Previous to New ID Conversion Table");
        console.time("Triangle Counting");

        var connections = [[]]; // shows the connections between nodes as triangles
        var connectionsT = [[]]; // transpose of 'connections' variable
        connectionsT[0] = [];
        connectionsT[1] = [];
        connectionsT[2] = [];

        // eslint-disable-next-line
        for (var i = 0; i < pointId.length; i++) {
          var currId = pointId[i];
          if (adjacencyList[currId] === undefined) { // if the current id doesn't exist
            console.error("Adjacency List at ID " + currId + " is undefined");
          } else { // else find the connections
            for (var j = 0; j < adjacencyList[currId].length-1; j++) {
              if (adjacencyList[currId][j] > currId && pointId.includes(adjacencyList[currId][j])) {
                for (var k = j+1; k < adjacencyList[currId].length; k++) {
                  if (adjacencyList[currId][k] > adjacencyList[currId][j] && pointId.includes(adjacencyList[currId][k]) && adjacencyList[adjacencyList[currId][j]].includes(adjacencyList[currId][k])) {
                    if (Number(currId) !== Number(adjacencyList[currId][j]) && currId !== Number(adjacencyList[currId][k]) && Number(adjacencyList[currId][j]) !== Number(adjacencyList[currId][k])) {
                      connections.push([currId, Number(adjacencyList[currId][j]), Number(adjacencyList[currId][k])]);
                      connectionsT[0].push(prevToNewId[currId]);
                      connectionsT[1].push(prevToNewId[Number(adjacencyList[currId][j])]);
                      connectionsT[2].push(prevToNewId[Number(adjacencyList[currId][k])]);
                    }
                  }
                }
              }
            }
          }
        }

        /* pseudocode for the above algorithm

        Iterate through the list of IDs in the current cluster (currCluster) {
          currId = pointId[i]
          if (adjacency list at currId does not exist) {
            log error
          } else {
            Iterate through the adjacency list for the current ID {
              if (some node A in the adjacency list exists in the cluster && it has an ID greater than currId) {
                Iterate through the adjacency list for the current ID again {
                  if (some node B in the adjacency list of currId also exists in the cluster && node B also exists in the adjacency list of node A && ID of node B is greater than ID of node A) {
                    if (none of the IDs are equal) {
                      add the connection to variable 'connections' and variable 'connectionsT'
                    }
                  }
                }
              }
            }
          }
        }

        */

        connections.shift();

        console.timeEnd("Triangle Counting");
        console.time("3D Mesh Trace");

        if (connections.length > 0) {
          var trace = { // creates a trace for the new surface with i,j,k values of the connections
            type: 'mesh3d',
            x: currCluster.x,
            y: currCluster.y,
            z: currCluster.z,
            i: connectionsT[0],
            j: connectionsT[1],
            k: connectionsT[2],
            color: currCluster.marker.color,
            marker: {
              opacity: 1,
            },
            id: currCluster.id,
            name: currCluster.name + ' highlight',

            flatshading: true,
          }

          self.state.traces[self.state.level].push(trace);
          self.state.toggledSurfaces.push(currCluster.name);
          self.state.toggledSurfaces.sort();

          console.timeEnd("3D Mesh Trace");
        } else if (currCluster.name.includes("Fault")) {
          alert("No connections found. Faults are only connected to lower level points.");
        } else {
          alert("No connections found.");
        }

        console.groupEnd();

        self.setState({traces: self.state.traces});
      } else {
        console.log("Surface Over " + currCluster.name + " Already Exists", "color: #FF0000")
      }
    }
  }

  showSurfaceOnClick(event) {
    var alreadyPresent = false;
    var index = null;
    let self = this;

    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if (this.state.traces[this.state.level][i].name === event.points[0].data.name) {
        index = i;
      }
    }

    if (index != null) {
      var currCluster = self.state.traces[self.state.level][index];

      // eslint-disable-next-line
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        if (this.state.traces[this.state.level][i].name === this.state.traces[this.state.level][index].name && this.state.traces[this.state.level][i].name.includes('highlight')) {
          this.state.traces[this.state.level].splice(i, 1);
          alreadyPresent = true;
        }
      }

      if (!alreadyPresent && this.state.toggledSurfaces.includes(this.state.traces[this.state.level][index].name)) {
        alreadyPresent = true;
      }

      if (!alreadyPresent) {
        console.group("Surface Over " + currCluster.name);

        var adjacencyList = self.state.adjacencyList;
        var pointId = currCluster.pointIds;

        console.time("Previous to New ID Conversion Table");
        var prevToNewId = [];
        // eslint-disable-next-line
        for (var i = 0; i < pointId.length; i++) {
          prevToNewId[pointId[i]] = i;
        }

        console.timeEnd("Previous to New ID Conversion Table");
        console.time("Triangle Counting");

        var connections = [[]];
        var connectionsT = [[]];
        connectionsT[0] = [];
        connectionsT[1] = [];
        connectionsT[2] = [];

        // eslint-disable-next-line
        for (var i = 0; i < pointId.length; i++) {
          var currId = pointId[i];
          if (adjacencyList[currId] === undefined) { // if the current id doesn't exist
            console.error("Adjacency List at ID " + currId + " is undefined");
          } else { // else find the connections
            for (var j = 0; j < adjacencyList[currId].length-1; j++) {
              if (adjacencyList[currId][j] > currId && pointId.includes(adjacencyList[currId][j])) {
                for (var k = j+1; k < adjacencyList[currId].length; k++) {
                  if (adjacencyList[currId][k] > adjacencyList[currId][j] && pointId.includes(adjacencyList[currId][k]) && adjacencyList[adjacencyList[currId][j]].includes(adjacencyList[currId][k])) {
                    if (Number(currId) !== Number(adjacencyList[currId][j]) && currId !== Number(adjacencyList[currId][k]) && Number(adjacencyList[currId][j]) !== Number(adjacencyList[currId][k])) {
                      connections.push([currId, Number(adjacencyList[currId][j]), Number(adjacencyList[currId][k])]);
                      connectionsT[0].push(prevToNewId[currId]);
                      connectionsT[1].push(prevToNewId[Number(adjacencyList[currId][j])]);
                      connectionsT[2].push(prevToNewId[Number(adjacencyList[currId][k])]);
                    }
                  }
                }
              }
            }
          }

          /* pseudocode for the above algorithm

          Iterate through the list of IDs in the current cluster (currCluster) {
            currId = pointId[i]
            if (adjacency list at currId does not exist) {
              log error
            } else {
              Iterate through the adjacency list for the current ID {
                if (some node A in the adjacency list exists in the cluster && it has an ID greater than currId) {
                  Iterate through the adjacency list for the current ID again {
                    if (some node B in the adjacency list of currId also exists in the cluster && node B also exists in the adjacency list of node A && ID of node B is greater than ID of node A) {
                      if (none of the IDs are equal) {
                        add the connection to variable 'connections' and variable 'connectionsT'
                      }
                    }
                  }
                }
              }
            }
          }

          */
        }

        connections.shift();

        console.timeEnd("Triangle Counting");
        console.time("3D Mesh Trace");

        if (connections.length > 0) {
          var trace = {
            type: 'mesh3d',
            x: currCluster.x,
            y: currCluster.y,
            z: currCluster.z,
            i: connectionsT[0],
            j: connectionsT[1],
            k: connectionsT[2],
            color: currCluster.marker.color,
            marker: {
              opacity: 1,
            },
            id: currCluster.id,
            name: currCluster.name + ' highlight',

            flatshading: true,
          }

          self.state.traces[self.state.level].push(trace);
          self.state.toggledSurfaces.push(currCluster.name);
          self.state.toggledSurfaces.sort();

          console.timeEnd("3D Mesh Trace");
        } else if (currCluster.name.includes("Fault")) {
          alert("No connections found. Faults are only connected to lower level points.");
        } else {
          alert("No connections found.");
        }

        console.groupEnd();
        self.setState({traces: self.state.traces});
      } else {
        var name = event.points[0].data.name;
        var lastIndex = name.lastIndexOf(" ")
        console.time("Removing Surface over " + name.substring(0, lastIndex));

        // eslint-disable-next-line
        for (var i = 0; i < self.state.toggledSurfaces.length; i++) {
          if (self.state.toggledSurfaces[i] + ' highlight' === currCluster.name) {
            this.state.toggledSurfaces.splice(i, 1);
          }
        }

        console.timeEnd("Removing Surface over " + name.substring(0, lastIndex));
        self.setState({traces: self.state.traces});
      }
    }
  }

  removeSurface(event) {
    var removed = false;
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if (this.state.traces[this.state.level][i].name === this.state.toggledSurfaces[event.target.id] + ' highlight') {
        //console.log(i);
        this.state.traces[this.state.level].splice(i, 1);
        i--;
        removed = true;
      } else if (this.state.traces[this.state.level][i].mode === 'lines+markers' && this.state.traces[this.state.level][i].name === this.state.toggledSurfaces[event.target.id]) {
        // eslint-disable-next-line
        this.state.traces[this.state.level][i].mode = 'markers';
        removed = true;
      }
    }

    if (removed) {
      this.state.toggledSurfaces.splice(event.target.id, 1);
    }

    this.setState({traces: this.state.traces});
  }

  changeSize(event) { // when size slider is moved
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      // eslint-disable-next-line
      this.state.traces[this.state.level][i].marker.size = event.target.value
    }

    this.setState({size: event.target.value});
  }


  changeOpacity(event) { // when opacity slider(s) is moved
    if (this.state.levelTextColor[event.target.id] === 'black') {
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].marker.opacity = event.target.value; // sets opacity to the value of the slider
        }
      }

      // eslint-disable-next-line
      this.state.opacity[event.target.id] = event.target.value;
      this.setState({opacity: this.state.opacity});
    } else {
      alert("Cannot Toggle this Slider because Level " + event.target.id + " is no Longer Being Shown.");
    }
  }

  reset() {
    for (var i = 0; i < this.state.traces.length; i++) {
      for (var j = 0; j < this.state.traces[i].length; j++) {
        if (this.state.traces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.traces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.traces[i][j].visible = true;
        }

        if (this.state.traces[i][j].name.includes('highlight')) {
          this.state.traces[i].splice(j, 1);
          j--;
        }
      }

      // eslint-disable-next-line
      this.state.levelTextColor[i] = "black";
    }

    // eslint-disable-next-line
    this.state.hiddenPlots[this.state.level] = 'none';
    // eslint-disable-next-line
    this.state.hiddenPlots[0] = 'block';

    this.setState({toggledSurfaces: []});
    this.setState({opacity: this.state.opacity});
    this.setState({size: 5});
    this.setState({level: 0});
  }

  render() { // renders the webpage
    if (this.state.traces[this.state.level] !== null && this.state.traces[this.state.level].length !== 0 && this.state.traces[this.state.level] !== undefined && this.state.leveltoId !== [[]] && this.state.leveltoId !== undefined) { // if all data to plot is present
      // var data = [];
      //
      // for (var i = this.state.level; i < this.state.leveltoId.length; i++) {
      //   if (this.state.leveltoId[i] !== undefined) {
      //     for (var j = 0; j < this.state.leveltoId[i].length; j++) {
      //       if (this.state.traces[this.state.level][this.state.leveltoId[i][j]] !== undefined) {
      //         data.push(this.state.traces[this.state.level][this.state.leveltoId[i][j]])
      //       }
      //     }
      //   }
      // }

      var traces = this.state.traces;
      var lvltoId = this.state.leveltoId;

      return ( // code below is in JSX
        <div>
          <h1 id="title" style={{textAlign: "center", fontFamily: "Trebuchet MS"}}>spaND Visualization</h1>
          <div style={{height: (this.state.height)/10*9}}>
            {
              traces.map((currLevelTrace, index) =>
                <div key={index} style={{display: this.state.hiddenPlots[index]}}>
                  <Plot
                    data={this.state.traces[index]}
                    layout={{
                      width: this.state.width/4*3,
                      height: (this.state.height)/10*9,
                      showlegend: true,
                      scene: {
                        aspectmode:'manual',
                        aspectratio: { // remove this in a normal situation, only being used because current plot is hard to visualize
                          x:2,
                          y:2,
                          z:1
                        },
                        xaxis: {
                          autorange: true,
                          //range:[0,10]  // used to set x-range manually
                        },
                        yaxis: {
                          autorange: true,
                          //range:[0,10] // used to set y-range manually
                        },
                        zaxis: {
                          autorange: true,
                          //range:[0,10] // used to set z-range manually
                        },
                      },
                      margin: {
                        l: 50,
                        r: 50,
                        b: 50,
                        t: 20,
                        pad: 4
                      }
                    }}
                    onClick={this.plotClicked.bind(this)} // onClick -> show the surface for that cluster
                  />
                </div>
              )
            }

            <div className="slidecontainer" style={{marginLeft:(this.state.width)/4*3 + 100 + "px", marginTop:-(this.state.height)/10*9 + 20 + "px"}}>
              <div>
                <button id="0" style={{background: 'none', color: 'inherit', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', outline: 'inherit'}} onClick={this.toggleTab.bind(this)}>&#9660; Levels</button>
                <div style={{display: this.state.tabs[0], marginLeft: 30 + "px", marginTop: 5 + "px"}}>
                  Level: {this.state.level}
                  <br/>
                  <input type="range" min="0" max={this.state.leveltoId.length-1} step="1" value={this.state.level} className="slider" id="myRange" onChange={this.changeLevel.bind(this)}/>

                  <br/>
                  <br/>

                  <p style={{margin: 0}}>Show Levels:</p>
                  <ul style={{margin: 0}}>
                    {
                      lvltoId.map((curr, index) =>
                        <div key={index}>
                          <li onClick={this.toggleLevel.bind(this)} id={index} style={{color: this.state.levelTextColor[index]}}>Level {index}</li>
                        </div>
                      )
                    }
                  </ul>
                </div>
              </div>

              <br/>

              <div>
                <button id="1" style={{background: 'none', color: 'inherit', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', outline: 'inherit'}} onClick={this.toggleTab.bind(this)}>&#9660; Surfaces</button>
                <div style={{display: this.state.tabs[1], marginLeft: 30 + "px", marginTop: 5 + "px"}}>
                  Enter Cluster: <input type="number" value={this.state.currCluster} onChange={this.updateCurrCluster.bind(this)} style={{width: 50 + "px"}}/>
                  <br/>
                  <button onClick={this.showSurfaceButton.bind(this)}>Show Surface</button>
                  {/*<button onClick={this.showApproximateSurface.bind(this)}>Show Approximate Surface</button>*/}
                  <br/>
                  <br/>
                  Click Surface to Remove:
                  <ul style={{margin: 0}}>
                    {
                      this.state.toggledSurfaces.map((curr, index) =>
                        <div key={index}>
                          <li id={index} onClick={this.removeSurface.bind(this)}>{curr}</li>
                        </div>
                      )
                    }
                  </ul>
                </div>
              </div>

              <br/>

              <div>
                <button id="2" style={{background: 'none', color: 'inherit', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', outline: 'inherit'}} onClick={this.toggleTab.bind(this)}>&#9654; Advanced Tools</button>
                <br/>
                <div style={{display: this.state.tabs[2], marginLeft: 30 + "px", marginTop: 5 + "px"}}>
                  Size: {this.state.size}
                  <br/>
                  <input type="range" min="1" max="20" value={this.state.size} className="slider" id="myRange" onChange={this.changeSize.bind(this)}/>
                  <br/>
                  <br/>
                  {
                    lvltoId.map((lvltoId, index) =>
                      <div key={index} style={{color: this.state.levelTextColor[index]}}>
                        Opacity of Level {index}: {this.state.opacity[index]}
                        <br/>
                        <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[index]} className="slider" id={index} onChange={this.changeOpacity.bind(this)}/>
                        <br/>
                        <br/>
                      </div>
                    )
                  }
                </div>
                <br/>
              </div>
              <button style={{borderRadius: 0, borderStyle: 'solid', borderWidth: 2+'px', borderColor: 'red', width: 90+'%', color: 'red', padding: 5+'px'}} onClick={this.reset.bind(this)}>Reset</button>
            </div>
          </div>
        </div>
      );
    } else {
      return(
        <div style={{textAlign: "center"}}>
          <h2>Loading...</h2>
          <p>Depending on the size of the data, this may take a while.</p>
          <p>Check the <strong>Developer Console</strong> for more information.</p>
          <br/>
          <p style={{borderWidth: 3+'px', borderStyle: 'solid', borderColor: 'red', display: 'inline-block', padding: 10+'px'}}>If the page is said to be <strong>unresponsive</strong>, please continue to <strong>wait</strong>.</p>
        </div>
      );
    }
  }
}

export default App;
