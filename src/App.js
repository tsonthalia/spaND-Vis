import React from 'react';
import Plot from 'react-plotly.js';
//import Plotly from '../node_modules/plotly.js/lib/core.js';
import * as d3 from 'd3';
import * as triangulate from 'delaunay-triangulate';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      folder: "data/A.70.5/", //change this line to change the set of data being used
      width: 0,
      height: 0,
      traces: [[]], //e.g. traces[level][id] will return the trace at that level and with that id
      size: 5,
      opacity: [], //e.g. opacity[level] will return opacity of that level
      level: 0,
      leveltoId: [[]], //e.g. leveltoId[level] will return an array of ids at that level
      idtoLevel: [], //e.g. idtoLevel[id] will return the level with that id
      childToParent: [], //e.g. childToParent[child] will return that child cluster's corresponding parent cluster
      x: [[[]]], //e.g. x[level][id] will return an array of x values at that level on the slider with that id
      y: [[[]]], //e.g. y[level][id] will return an array of y values at that level on the slider with that id
      z: [[[]]], //e.g. z[level][id] will return an array of z values at that level on the slider with that id
      //loadingMessage: "",
      levelTextColor: [],
      hiddenPlots: [],
      currCluster: 0,
      tabs: ["block", "block", "none"],
      toggledSurfaces: [],
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.loadPlot = this.loadPlot.bind(this);
  }

  loadPlot() {
    let self = this;

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
                          //console.log(data);

                          // self.state.loadingMessage = "Getting Merging Data...";
                          // self.setState({loadingMessage: self.state.loadingMessage});

                          console.log("Getting Merging Data...")
                          //self.forceUpdate();

                          var merging3dText = merging3d.responseText.split('\n');

                          for (var i = 1; i < merging3dText.length; i++) {
                            var line = merging3dText[i].split(';');

                            self.state.childToParent[line[0]] = line[1];
                          }

                          self.state.loadingMessage = "Getting Relationship Between ID and Level...";
                          self.setState({loadingMessage: self.state.loadingMessage});

                          console.log("Getting Relationship Between ID and Level...");
                          //alert("Got Merging Data");

                          //var id = [];
                          var lvl = [[]]; // Holds ID and corresponding levels
                          var mergeLvl = []; // Holds merge level
                          var name = []; // Holds name of each cluster

                          var idtoLvl = [[]]; // Holds conversion from id to level

                          var clusters3dText = clusters3d.responseText.split('\n');

                          // eslint-disable-next-line
                          for (var i = 1; i < clusters3dText.length-1; i++) {
                            var curr = clusters3dText[i].split(';')
                            if (lvl[curr[1]] === undefined) {
                              lvl[curr[1]] = [];
                            }
                            if (idtoLvl[curr[0]] === undefined) {
                              idtoLvl[curr[0]] = [];
                            }

                            lvl[curr[1]].push(curr[0]);
                            mergeLvl.push(curr[2]);
                            name.push(curr[3]);

                            idtoLvl[curr[0]].push(curr[1]);
                          }

                          // self.state.loadingMessage = "Getting Initial Plot View...";
                          // self.setState({loadingMessage: self.state.loadingMessage});

                          console.log("Getting Initial Plot View...");
                          //alert("Got ID to Level");

                          self.state.leveltoId = lvl;
                          //self.setState({leveltoId: self.state.leveltoId});

                          self.state.idtoLevel = idtoLvl;
                          //self.setState({idtoLevel: self.state.idtoLevel});

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

                          //self.setState({opacity: self.state.opacity});

                          var x = [[[]]];
                          var y = [[[]]];
                          var z = [[[]]];

                          // eslint-disable-next-line
                          for (var i = 0; i < clustering3dData.length; i++) {
                            if (x[0][clustering3dData[i].id] === undefined) {
                              x[0][clustering3dData[i].id] = [];
                              y[0][clustering3dData[i].id] = [];
                              z[0][clustering3dData[i].id] = [];
                            }

                            x[0][clustering3dData[i].id].push(clustering3dData[i].x);
                            y[0][clustering3dData[i].id].push(clustering3dData[i].y);
                            z[0][clustering3dData[i].id].push(clustering3dData[i].z);
                          }


                          // self.state.loadingMessage = "Getting All Plot Views...";
                          // self.setState({loadingMessage: self.state.loadingMessage});

                          console.log("Getting All Plot Views...");
                          //alert("Got Initial Plot View");

                          //eslint-disable-next-line
                          for (var i = 1; i < lvl.length; i++) {
                            for (var j = x[i-1].length-1; j >= 0; j--) {

                              if (x[i] === undefined) {
                                x[i] = [[]];
                                y[i] = [[]];
                                z[i] = [[]];
                              }

                              if (i !== 1) {
                                if (self.state.childToParent[j] !== undefined && self.state.childToParent[j] !== null && self.state.childToParent[j] !== []) {
                                  if (x[i][self.state.childToParent[j]] === undefined) {
                                    x[i][self.state.childToParent[j]] = [];
                                    y[i][self.state.childToParent[j]] = [];
                                    z[i][self.state.childToParent[j]] = [];
                                  }

                                  // var xTemp = undefined;
                                  // var yTemp = undefined;
                                  // var zTemp = undefined;
                                  //
                                  // if (x[i-1][j] !== undefined) {
                                  //   xTemp = [];
                                  //   yTemp = [];
                                  //   zTemp = [];
                                  //
                                  //   for (var k = 0; k < x[i-1][j].length; k++) {
                                  //     xTemp[k] = Math.round((x[i-1][j][k])/100);
                                  //     yTemp[k] = Math.round((y[i-1][j][k])/100);
                                  //     zTemp[k] = Math.round(z[i-1][j][k]);
                                  //   }
                                  // }

                                  x[i][self.state.childToParent[j]].push.apply(x[i][self.state.childToParent[j]], x[i-1][j]);
                                  y[i][self.state.childToParent[j]].push.apply(y[i][self.state.childToParent[j]], y[i-1][j]);
                                  z[i][self.state.childToParent[j]].push.apply(z[i][self.state.childToParent[j]], z[i-1][j]);
                                }
                              } else {
                                x[1] = x[0];
                                y[1] = y[0];
                                z[1] = z[0];
                              }
                            }
                          }

                          // for (var i = 0; i < z[0].length; i++) {
                          //   console.log(x[0][0][i]);
                          //   console.log(y[0][0][i]);
                          //   console.log(self.state.testCluster[x[0][0][i]][y[0][0][i]]);
                          //   self.state.testCluster[x[0][0][i]][y[0][0][i]] = z[0][0][i]
                          // }

                          //console.log(x[2]);
                          // self.state.loadingMessage = "Creating Plot Traces...";
                          // self.setState({loadingMessage: self.state.loadingMessage});

                          console.log("Creating Plot Traces...");
                          //alert("Generated All Plot Views");

                          self.state.x = x;
                          self.state.y = y;
                          self.state.z = z;

                          // eslint-disable-next-line
                          for (var j = 0; j < x.length; j++) {
                            // eslint-disable-next-line
                            for (var i = 0; i < x[j].length; i++) {
                              var tempName = "";
                              //var tempColor = "";

                              if (name[i].includes("not_fault")) {
                                tempName = "Cluster"
                                //tempColor = '#'+Math.floor(Math.random()*700000+1000000).toString(16);
                              } else {
                                tempName = "Fault"
                                //tempColor = '#'+Math.floor(Math.random()*700000+16000000).toString(16);
                              }

                              if (idtoLvl[i] >= j && x[j][i] !== undefined && x[j][i] !== []) {
                                var trace = {
                                  x: x[j][i], y: y[j][i], z: z[j][i],
                                  mode: 'markers',
                                  //legendgroup: 'Level ' + idtoLvl[i],
                                  marker: {
                                    size: self.state.size,
                                    symbol: 'circle',
                                    //color: tempColor,
                                    color: '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6),
                                    line: {
                                      color: 'rgb(217, 217, 217)',
                                      width: 0.5
                                    },
                                    opacity: self.state.opacity
                                  },
                                  type: 'scatter3d',
                                  id: idtoLvl[i],
                                  name: tempName + ' ' + i + ' (Level ' + idtoLvl[i] + ')'
                                };

                                if (self.state.traces[j] === undefined) {
                                  self.state.traces[j] = [];
                                }

                                //self.state.traces[j][i] = trace;
                                self.state.traces[j].push(trace);
                              }
                            }
                          }

                          //self.state.loadingMessage = "Generating Plot...";
                          console.log("Generating Plot...");
                          //alert("Created Plot Traces");

                          //console.log(self.state.traces);
                          self.setState({traces: self.state.traces});
                        });

                        // NOTE: The below is the old Plotly.d3.csv method of reading a csv file
                        // Plotly.d3.csv(folder + 'clustering3d.csv', function(err, rows){
                        //   function unpack(rows, key) {
                        //   	return rows.map(function(row) {
                        //       return row[key];
                        //     });
                        //   }
                        //
                        //   // self.state.loadingMessage = "Getting Merging Data...";
                        //   // self.setState({loadingMessage: self.state.loadingMessage});
                        //
                        //   console.log("Getting Merging Data...")
                        //   //self.forceUpdate();
                        //
                        //   var merging3dText = merging3d.responseText.split('\n');
                        //
                        //   for (var i = 1; i < merging3dText.length; i++) {
                        //     var line = merging3dText[i].split(';');
                        //
                        //     self.state.childToParent[line[0]] = line[1];
                        //   }
                        //
                        //   self.state.loadingMessage = "Getting Relationship Between ID and Level...";
                        //   self.setState({loadingMessage: self.state.loadingMessage});
                        //
                        //   console.log("Getting Relationship Between ID and Level...");
                        //   //alert("Got Merging Data");
                        //
                        //   //var id = [];
                        //   var lvl = [[]]; // Holds ID and corresponding levels
                        //   var mergeLvl = []; // Holds merge level
                        //   var name = []; // Holds name of each cluster
                        //
                        //   var idtoLvl = [[]]; // Holds conversion from id to level
                        //
                        //   var clusters3dText = clusters3d.responseText.split('\n');
                        //
                        //   // eslint-disable-next-line
                        //   for (var i = 1; i < clusters3dText.length-1; i++) {
                        //     var curr = clusters3dText[i].split(';')
                        //     if (lvl[curr[1]] === undefined) {
                        //       lvl[curr[1]] = [];
                        //     }
                        //     if (idtoLvl[curr[0]] === undefined) {
                        //       idtoLvl[curr[0]] = [];
                        //     }
                        //
                        //     lvl[curr[1]].push(curr[0]);
                        //     mergeLvl.push(curr[2]);
                        //     name.push(curr[3]);
                        //
                        //     idtoLvl[curr[0]].push(curr[1]);
                        //   }
                        //
                        //   // self.state.loadingMessage = "Getting Initial Plot View...";
                        //   // self.setState({loadingMessage: self.state.loadingMessage});
                        //
                        //   console.log("Getting Initial Plot View...");
                        //   //alert("Got ID to Level");
                        //
                        //   self.state.leveltoId = lvl;
                        //   //self.setState({leveltoId: self.state.leveltoId});
                        //
                        //   self.state.idtoLevel = idtoLvl;
                        //   //self.setState({idtoLevel: self.state.idtoLevel});
                        //
                        //   // eslint-disable-next-line
                        //   for (var i = 0; i < self.state.leveltoId.length; i++) {
                        //    self.state.opacity.push(0.8); // sets opacity to 0.8 for every subplot
                        //   }
                        //
                        //   //self.setState({opacity: self.state.opacity});
                        //
                        //   var x = [[[]]];
                        //   var y = [[[]]];
                        //   var z = [[[]]];
                        //
                        //   var xValues = unpack(rows, 'x');
                        //   var yValues = unpack(rows, 'y');
                        //   var zValues = unpack(rows, 'z');
                        //   var idValues = unpack(rows, 'id');
                        //
                        //   // eslint-disable-next-line
                        //   for (var i = 0; i < idValues.length; i++) {
                        //     if (x[0][idValues[i]] === undefined) {
                        //       x[0][idValues[i]] = [];
                        //       y[0][idValues[i]] = [];
                        //       z[0][idValues[i]] = [];
                        //     }
                        //
                        //     x[0][idValues[i]].push(xValues[i]);
                        //     y[0][idValues[i]].push(yValues[i]);
                        //     z[0][idValues[i]].push(zValues[i]);
                        //   }
                        //
                        //   // self.state.loadingMessage = "Getting All Plot Views...";
                        //   // self.setState({loadingMessage: self.state.loadingMessage});
                        //
                        //   console.log("Getting All Plot Views...");
                        //   //alert("Got Initial Plot View");
                        //
                        //   //eslint-disable-next-line
                        //   for (var i = 1; i < lvl.length; i++) {
                        //     for (var j = x[i-1].length-1; j >= 0; j--) {
                        //
                        //       if (x[i] === undefined) {
                        //         x[i] = [[]];
                        //         y[i] = [[]];
                        //         z[i] = [[]];
                        //       }
                        //
                        //       if (i !== 1) {
                        //         if (self.state.childToParent[j] !== undefined && self.state.childToParent[j] !== null && self.state.childToParent[j] !== []) {
                        //           if (x[i][self.state.childToParent[j]] === undefined) {
                        //             x[i][self.state.childToParent[j]] = [];
                        //             y[i][self.state.childToParent[j]] = [];
                        //             z[i][self.state.childToParent[j]] = [];
                        //           }
                        //           x[i][self.state.childToParent[j]].push.apply(x[i][self.state.childToParent[j]], x[i-1][j]);
                        //           y[i][self.state.childToParent[j]].push.apply(y[i][self.state.childToParent[j]], y[i-1][j]);
                        //           z[i][self.state.childToParent[j]].push.apply(z[i][self.state.childToParent[j]], z[i-1][j]);
                        //         }
                        //       } else {
                        //         x[1] = x[0];
                        //         y[1] = y[0];
                        //         z[1] = z[0];
                        //       }
                        //     }
                        //   }
                        //
                        //   //console.log(x[2]);
                        //   // self.state.loadingMessage = "Creating Plot Traces...";
                        //   // self.setState({loadingMessage: self.state.loadingMessage});
                        //
                        //   console.log("Creating Plot Traces...");
                        //   //alert("Generated All Plot Views");
                        //
                        //   self.state.x = x;
                        //   self.state.y = y;
                        //   self.state.z = z;
                        //
                        //   // eslint-disable-next-line
                        //   for (var j = 0; j < x.length; j++) {
                        //     // eslint-disable-next-line
                        //     for (var i = 0; i < x[j].length; i++) {
                        //       var tempName = "";
                        //       var tempShape = "";
                        //       var tempColor = "";
                        //
                        //
                        //       if (name[i].includes("not_fault")) {
                        //         tempName = "Cluster"
                        //         tempShape = "circle"
                        //         tempColor = '#'+Math.floor(Math.random()*700000+1000000).toString(16);
                        //       } else {
                        //         tempName = "Fault"
                        //         tempShape = "square"
                        //         tempColor = '#'+Math.floor(Math.random()*700000+16000000).toString(16);
                        //       }
                        //
                        //       if (idtoLvl[i] >= j && x[j][i] !== undefined) {
                        //         var trace = {
                        //           x: x[j][i], y: y[j][i], z: z[j][i],
                        //           mode: 'markers',
                        //           //legendgroup: 'Level ' + idtoLvl[i],
                        //           marker: {
                        //             size: self.state.size,
                        //             symbol: tempShape,
                        //             color: tempColor,
                        //             line: {
                        //               color: 'rgb(217, 217, 217)',
                        //               width: 0.5
                        //             },
                        //             opacity: self.state.opacity
                        //           },
                        //           type: 'scatter3d',
                        //           id: idtoLvl[i],
                        //           name: tempName + ' ' + i + ' (Level ' + idtoLvl[i] + ')'
                        //         };
                        //
                        //         if (self.state.traces[j] === undefined) {
                        //           self.state.traces[j] = [];
                        //         }
                        //
                        //         //self.state.traces[j][i] = trace;
                        //         self.state.traces[j].push(trace);
                        //       }
                        //     }
                        //   }
                        //
                        //   //self.state.loadingMessage = "Generating Plot...";
                        //   console.log("Generating Plot...");
                        //   //alert("Created Plot Traces");
                        //
                        //   //console.log(self.state.traces);
                        //   self.setState({traces: self.state.traces});
                        // });
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

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  changeSize(event) {
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      // eslint-disable-next-line
      this.state.traces[this.state.level][i].marker.size = event.target.value
    }

    this.setState({size: event.target.value});
  }

  changeOpacity(event) {
    if (this.state.levelTextColor[event.target.id] === 'black') {
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        //console.log(parseInt(this.state.traces[this.state.level][i].id[0]) == event.target.id);
        if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].marker.opacity = event.target.value;
        }
      }

      // eslint-disable-next-line
      this.state.opacity[event.target.id] = event.target.value;
      this.setState({opacity: this.state.opacity});
    } else {
      alert("Cannot Toggle this Slider because Level " + event.target.id + " is no Longer Being Shown.");
    }
  }

  changeLevel(event) { // moving the level slider
    // eslint-disable-next-line
    this.state.hiddenPlots[this.state.level] = "none";
    // eslint-disable-next-line
    this.state.hiddenPlots[event.target.value] = "block";

    for (var i = 0; i < this.state.levelTextColor.length; i++) {
      if (i<event.target.value) {
        // eslint-disable-next-line
        this.state.levelTextColor[i] = "gray";
      } else {
        // eslint-disable-next-line
        this.state.levelTextColor[i] = "black";
      }
    }

    this.setState({level: event.target.value});
  }

  toggleLevel(event) { //whether the level is shown or not
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      //console.log(parseInt(this.state.traces[this.state.level][i].id[0]) == event.target.id);
      if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
        if (this.state.traces[this.state.level][i].visible === false) {
          //console.log(this.state.traces[this.state.level][i]);
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = true;
          // eslint-disable-next-line
          this.state.levelTextColor[event.target.id] = "black";
          //event.target.innerText = "Hide Level " + event.target.id;
        } else {
          //console.log(this.state.traces[this.state.level][i]);
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = false;
          // eslint-disable-next-line
          this.state.levelTextColor[event.target.id] = "gray";
          //event.target.innerText = "Show Level " + event.target.id;
        }
      }
    }

    this.setState({traces: this.state.traces})
  }

  updateCurrCluster(event) {
    this.setState({currCluster: event.target.value});
  }

  toggleTab(event) {
    var str;
    if (event.target.id === "0") {
      str = "Levels";
    } else if (event.target.id === "1") {
      str = "Surfaces";
    } else if (event.target.id === "2") {
      str = "Advanced Tools"
    }

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

  showApproximateSurface(event) {
    var alreadyPresent = false;
    var index = null;
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if ((this.state.traces[this.state.level][i].name.includes("Cluster " + this.state.currCluster + " ") || this.state.traces[this.state.level][i].name.includes("Fault " + this.state.currCluster + " ")) && (!this.state.traces[this.state.level][i].name.includes('highlight'))) {
        index = i;
      }
    }

    if (index != null) {
      // eslint-disable-next-line
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        if (this.state.traces[this.state.level][i].name === this.state.traces[this.state.level][index].name + ' highlight') {
          this.state.traces[this.state.level].splice(i, 1);
          i--;
          alreadyPresent = true;
        } else if (this.state.traces[this.state.level][i].mode === 'lines+markers' && this.state.traces[this.state.level][i].name === this.state.traces[this.state.level][index].name) {
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].mode = 'markers';
          i--;
          alreadyPresent = true;
        }
      }

      if (alreadyPresent) {
        this.state.toggledSurfaces.splice(this.state.toggledSurfaces.indexOf(this.state.traces[this.state.level][index].name), 1); // removes the surface from the list of surfaces shown
      }

      else { // show the surface
        var x = this.state.traces[this.state.level][index].x;
        var y = this.state.traces[this.state.level][index].y;
        var z = this.state.traces[this.state.level][index].z;
        var colorTemp = this.state.traces[this.state.level][index].marker.color;

        var points = [[]];

        // eslint-disable-next-line
        for (var i = 0; i < x.length; i++) {
          points[i] = [];

          points[i].push(x[i]);
          points[i].push(y[i]);
          points[i].push(z[i]);
        }

        // console.log(points);
        //
        // for (var i = 0; i < points.length-1; i++) {
        //   for (var j = i+1; j < points.length; j++) {
        //     if (points[i][0] === points[j][0] && points[i][1] === points[j][1] && points[i][2] === points[j][2]) {
        //       points.splice(j, 1);
        //       j--;
        //       console.log(j);
        //     }
        //   }
        // }

        var triangles = triangulate(points); // triangulate() is imported from a different library

        if (triangles.length === 0) {
          console.log("Drawing Surface over " + this.state.traces[this.state.level][index].name + " with Lines...");
          // eslint-disable-next-line
          this.state.traces[this.state.level][index].mode = 'lines+markers';
        }

        else {
          console.log("Drawing Surface over " + this.state.traces[this.state.level][index].name + " with " + triangles.length + " Tetrahedrons...");
          //console.log(this.state.traces[0][0].x);

          // eslint-disable-next-line
          for (var i = 0; i < triangles.length; i++) {
            var xTemp = [];
            var yTemp = [];
            var zTemp = [];

            for (var j = 0; j < triangles[i].length; j++) {
              xTemp.push(x[triangles[i][j]]);
              yTemp.push(y[triangles[i][j]]);
              zTemp.push(z[triangles[i][j]]);
            }

            var trace = {
              type: 'mesh3d',
              x: xTemp,
              y: yTemp,
              z: zTemp,
              i: [0, 0, 0, 1],
              j: [1, 2, 3, 2],
              k: [2, 3, 1, 3],
              // i: [0],
              // j: [1],
              // k: [2],
              facecolor: [
                colorTemp,
                colorTemp,
                colorTemp,
                colorTemp
              ],
              marker: {
                opacity: 1,
              },
              id: this.state.traces[this.state.level][index].id,
              name: this.state.traces[this.state.level][index].name + ' highlight',

              flatshading: true,
            }

            this.state.traces[this.state.level].push(trace);
          }
        }

        this.state.toggledSurfaces.push(this.state.traces[this.state.level][index].name);
        this.state.toggledSurfaces.sort();

        // this.state.toggledSurfaces.push(this.state.traces[this.state.level][index].name);
        //
        // var newSurface = {
        //   x: this.state.traces[this.state.level][index].x,
        //   y: this.state.traces[this.state.level][index].y,
        //   z: this.state.traces[this.state.level][index].z,
        //   mode: 'markers',
        //   //legendgroup: 'Level ' + idtoLvl[i],
        //   marker: {
        //     size: 30,
        //     symbol: 'circle',
        //     color: this.state.traces[this.state.level][index].marker.color,
        //     line: {
        //       color: 'rgb(217, 217, 217)',
        //       width: 0.5
        //     },
        //     opacity: 0.1
        //   },
        //   id: this.state.traces[this.state.level][index].id,
        //   name: this.state.traces[this.state.level][index].name + ' highlight',
        //   type: 'scatter3d',
        //   showlegend: false,
        //   hoverinfo: 'skip',
        // }
        // this.state.traces[this.state.level].push(newSurface);
      }

      this.setState({traces: this.state.traces});
    }
  }

  showExactSurface(event) {
    var folder = this.state.folder;
    var index = null;
    let self = this;

    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if ((this.state.traces[this.state.level][i].name.includes("Cluster " + this.state.currCluster + " ") || this.state.traces[this.state.level][i].name.includes("Fault " + this.state.currCluster + " ")) && (!this.state.traces[this.state.level][i].name.includes('highlight'))) {
        index = i;
      }
    }

    var currCluster = self.state.traces[self.state.level][index];

    function includesId(idsInCluster, temp) {
      for (var i = 0; i < idsInCluster.length; i++) {
        if (idsInCluster[i].id === Number(temp)) {
          //console.log("true");
          return true;
        }
      }
      return false;
    }

    d3.csv(folder + 'coordinates.csv').then(function(uniqueIdCoordinateData) {
      var uniqueIdCoordinates = [];


      //console.log(uniqueIdCoordinateData);

      for (var i = 0; i < uniqueIdCoordinateData.length; i++) {
        var coordinate = {
          id: Number(uniqueIdCoordinateData[i].id),
          tuple: [Number(uniqueIdCoordinateData[i].x), Number(uniqueIdCoordinateData[i].y), Number(uniqueIdCoordinateData[i].z)],
        }

        uniqueIdCoordinates[uniqueIdCoordinateData[i].id] = coordinate;
      }


      // console.log(uniqueIdCoordinates);
      //console.log(uniqueIdCoordinates.find(findId));


      d3.csv(folder + 'adjacency.csv').then(function(adjacencyData) {
        var adjacencyList = [[]];

        //console.log(adjacencyData);

        for (var i = 0; i < adjacencyData.length; i++) {
          adjacencyList[adjacencyData[i].id] = adjacencyData[i].nbrs.split(' ');
          adjacencyList[adjacencyData[i].id].pop();
        }

        //console.log(adjacencyList);

        var connections = [[]];

        // for (var i = 2; i < 3; i++) {
        //   console.log(adjacencyList[i]);
        //   for (var j = 0; j < adjacencyList[i].length; j++) {
        //     //console.log(adjacencyList[adjacencyList[i][j]]);
        //     for (var k = 0; k < adjacencyList[adjacencyList[i][j]].length; k++) {
        //       //console.log(adjacencyList[adjacencyList[i][j]]);
        //       if (adjacencyList[i].includes(adjacencyList[adjacencyList[i][j]][k])) {
        //         if (i !== adjacencyList[i][j] && i !== adjacencyList[adjacencyList[i][j]][k] && adjacencyList[i][j] !== adjacencyList[adjacencyList[i][j]][k]) {
        //           console.log(i + ", " + adjacencyList[i][j] + ", " + adjacencyList[adjacencyList[i][j]][k])
        //           connections.push([i, adjacencyList[i][j], adjacencyList[adjacencyList[i][j]][k]]);
        //         }
        //       }
        //     }
        //   }
        // }

        console.log("Converting Coordinates to IDs...");
        //console.log(currCluster);
        var idsInCluster = [];
        // eslint-disable-next-line
        for (var i = 0; i < currCluster.x.length; i++) {
          //console.log(uniqueIdCoordinates[i].tuple[0] + ", " + Number(currCluster.x[i]));
          // eslint-disable-next-line
          function findId(coord) {
            //console.log(coord.tuple[0] + ", " + Number(currCluster.x[i]));
            var xDiff = Math.abs(coord.tuple[0] - Number(currCluster.x[i]));
            var yDiff = Math.abs(coord.tuple[1] - Number(currCluster.y[i]));
            var zDiff = Math.abs(coord.tuple[2] - Number(currCluster.z[i]));

            if(xDiff < 0.0001 && yDiff < 0.0001 && zDiff < 0.0001) {
                return true;
            }

            // if (coord.tuple[0] === Number(currCluster.x[i]) && coord.tuple[1] === Number(currCluster.y[i]) && coord.tuple[2] === Number(currCluster.z[i])) {
            //   return true;
            // }

            return false;
          }

          var tempId = uniqueIdCoordinates.find(findId);

          if (tempId === undefined) {
            console.log("ERR: Did not find ID for point at index " + i + ". There is most likely something wrong with public/" + folder + "coordinates.csv or public/" + folder + "clustering3d.csv");
          } else {
            idsInCluster.push(tempId);
          }
        }

        // console.log(idsInCluster);

        var prevToNewId = [];
        // eslint-disable-next-line
        for (var i = 0; i < idsInCluster.length; i++) {
          prevToNewId[idsInCluster[i].id] = i;
        }

        console.log("Getting Connections Between Points...");

        var connectionsT = [[]];
        connectionsT[0] = [];
        connectionsT[1] = [];
        connectionsT[2] = [];

        // eslint-disable-next-line
        for (var i = 0; i < idsInCluster.length; i++) {
          var currId = idsInCluster[i].id;

          for (var j = 0; j < adjacencyList[currId].length-1; j++) {
            if (adjacencyList[currId][j] > currId && includesId(idsInCluster, adjacencyList[currId][j])) {
              for (var k = j+1; k < adjacencyList[currId].length; k++) {
                if (adjacencyList[currId][k] > adjacencyList[currId][j] && includesId(idsInCluster, adjacencyList[currId][k]) && adjacencyList[adjacencyList[currId][j]].includes(adjacencyList[currId][k])) {
                  //console.log("Hello there");
                  if (Number(currId) !== Number(adjacencyList[currId][j]) && currId !== Number(adjacencyList[currId][k]) && Number(adjacencyList[currId][j]) !== Number(adjacencyList[currId][k])) {
                    //console.log(i + ", " + Number(adjacencyList[i][j]) + ", " + Number(adjacencyList[i][k]));
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

        connections.shift();

        var trace = {
          type: 'mesh3d',
          x: currCluster.x,
          y: currCluster.y,
          z: currCluster.z,
          i: connectionsT[0],
          j: connectionsT[1],
          k: connectionsT[2],
          // i: [0],
          // j: [1],
          // k: [2],
          // facecolor: [
          //   currCluster.marker.color,
          //   currCluster.marker.color,
          //   currCluster.marker.color,
          //   currCluster.marker.color
          // ],
          color: currCluster.marker.color,
          marker: {
            opacity: 1,
          },
          id: currCluster.id,
          name: currCluster.name + ' highlight',

          flatshading: true,
        }

        self.state.traces[self.state.level].push(trace);

        console.log("Plotting Surface from " + currCluster.name + "...");
        //console.log(self.state.traces);

        self.state.toggledSurfaces.push(currCluster.name);
        self.state.toggledSurfaces.sort();

        self.setState({traces: self.state.traces});
      });
    });
  }

  removeSurface(event) {
    var removed = false;
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if (this.state.traces[this.state.level][i].name === this.state.toggledSurfaces[event.target.id] + ' highlight') {
        //console.log(i);
        this.state.traces[this.state.level].splice(i, 1);
        i--;
        // console.log(this.state.traces[this.state.level].length);

        removed = true;
      } else if (this.state.traces[this.state.level][i].mode === 'lines+markers' && this.state.traces[this.state.level][i].name === this.state.toggledSurfaces[event.target.id]) {
        //console.log(i);
        // eslint-disable-next-line
        this.state.traces[this.state.level][i].mode = 'markers';
        removed = true;
      }
    }

    // console.log(this.state.traces[this.state.level]);

    if (removed) {
      this.state.toggledSurfaces.splice(event.target.id, 1);
    }

    this.setState({traces: this.state.traces});
  }

  reset() {
    for (var i = 0; i < this.state.traces.length; i++) {
      for (var j = 0; j < this.state.traces[i].length; j++) {
        //console.log(parseInt(this.state.traces[this.state.level][i].id[0]) == event.target.id);
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

  render() {
    if (this.state.traces[this.state.level] !== null && this.state.traces[this.state.level].length !== 0 && this.state.traces[this.state.level] !== undefined && this.state.leveltoId !== [[]] && this.state.leveltoId !== undefined) {
      var data = [];

      for (var i = this.state.level; i < this.state.leveltoId.length; i++) {
        if (this.state.leveltoId[i] !== undefined) {
          for (var j = 0; j < this.state.leveltoId[i].length; j++) {
            //console.log(this.state.traces[this.state.level]);
            if (this.state.traces[this.state.level][this.state.leveltoId[i][j]] !== undefined) {
              data.push(this.state.traces[this.state.level][this.state.leveltoId[i][j]])
            }
          }
        }
      }

      var traces = this.state.traces;
      var lvltoId = this.state.leveltoId;

      return (
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
                      //title: 'spaND Visualization',
                      showlegend: true,
                      scene: {
                        aspectmode:'manual',
                        aspectratio: {
                          x:2,
                          y:2,
                          z:1
                        },
                        xaxis: {
                          autorange: true,
                          //range:[0,10]
                        },
                        yaxis: {
                          autorange: true,
                          //range:[0,10]
                        },
                        zaxis: {
                          autorange: true,
                          //range:[0,10]
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
                  <button onClick={this.showExactSurface.bind(this)}>Show Exact Surface</button>
                  <button onClick={this.showApproximateSurface.bind(this)}>Show Approximate Surface</button>
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
