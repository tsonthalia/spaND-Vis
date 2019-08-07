// Visualization Model created by Tanay Sonthalia

import React from 'react';
import * as d3 from 'd3';

import Plotly from 'plotly.js-gl3d-dist';
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      folder: "data/A.70.7/", //change this line to change the set of data being used
      width: 0, //width of the updateWindowDimensions
      height: 0, //height of the window
      traces: [[]], //e.g. traces[level][id] will return the trace at that level and with that id
      beforeSparsifyTraces: [[]],
      afterSparsifyTraces: [[]],
      markerSize: 5, //size of the points on the scatterplot
      opacity: [], //e.g. opacity[level] will return opacity of that level
      level: 0, //current slider level
      leveltoId: [[]], //e.g. leveltoId[level] will return an array of ids at that level
      idtoLevel: [], //e.g. idtoLevel[id] will return the level with that id
      childToParent: [], //e.g. childToParent[child] will return that child cluster's corresponding parent cluster
      levelTextColor: [], //color of each level in the "Show Levels" section (black = level is currently shown, gray = level is currently hidden)
      hiddenPlots: [], //which plot is currently being used (which level on the this.state.traces variable)
      currCluster: 0, //cluster that has been inputted into the textfield to show surfaces
      tabs: ["block", "block", "none"], //display value for the tabs on the sidebar (e.g. Levels, Surfaces, Advanced Tools)
      toggledSurfaces: [], //lists which surfaces are being shown on the side under "Click Surface to Remove"
      adjacencyList: [[]], //holds all connections between points
      statsTraces: [[]], //holds the traces for the Diagonal of R plot
      RDiagDisplay: "none", //whether the Diagonal of R plot is being shown
      rank: [], //array of ranks of each cluster
      size: [], //array of size of each cluster
      sparsified: 0, //value of sparsify cluster
      tolerance: 0.1, //tolerance on the Diagonal of R Plot
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this); //updates Window Dimensions so that the plot can resize properly
    this.loadPlot = this.loadPlot.bind(this); //loads the plot data
  }

  loadPlot() { //loads all of the information that the plot needs
    let self = this; //'this' is undefined in an XMLHttpRequest, so another variable must hold the value so that 'this' can be used

    var folder = this.state.folder; //gets the folder location from the state object
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
                              d3.csv(folder + 'stats3d.csv').then(function(stats3dData) {
                                //console.log(data);
                                console.group("Initial Loading Sequence");
                                console.time("Total");
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
                                console.time("Stats Data");

                                var stats = [[]];
                                var size = [];
                                var rank = [];

                                // eslint-disable-next-line
                                for (var i = 0; i < stats3dData.length; i++) {
                                  var rdiag = stats3dData[i].Rdiag.split(" ");

                                  if (rdiag[0] !== "") {
                                    stats[stats3dData[i].id] = [];

                                    // eslint-disable-next-line
                                    for (var j = 0; j < rdiag.length; j++) {
                                      stats[stats3dData[i].id].push(Math.abs(Number(rdiag[j]))/Math.abs(Number(rdiag[0])));
                                    }
                                  } else {
                                    stats[stats3dData[i].id] = undefined;
                                  }

                                  size[stats3dData[i].id] = stats3dData[i].size;
                                  rank[stats3dData[i].id] = stats3dData[i].rank;
                                }

                                self.state.rank = rank;
                                self.state.size = size;

                                console.timeEnd("Stats Data");
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

                                var x = [[[]]]; // holds x coordinate of each point with all data (e.g. x[0][5] gives array of x coordinates at level 0 and id 5)
                                var y = [[[]]]; // holds y coordinate of each point with all data (e.g. y[0][5] gives array of y coordinates at level 0 and id 5)
                                var z = [[[]]]; // holds z coordinate of each point with all data (e.g. z[0][5] gives array of z coordinates at level 0 and id 5)

                                var beforeSparsifyX = [[[]]]; // holds x coordinate of each point before sparsification (e.g. beforeSparsifyX[0][5] gives array of x coordinates at level 0 and id 5)
                                var beforeSparsifyY = [[[]]]; // holds y coordinate of each point before sparsification (e.g. beforeSparsifyY[0][5] gives array of y coordinates at level 0 and id 5)
                                var beforeSparsifyZ = [[[]]]; // holds z coordinate of each point before sparsification (e.g. beforeSparsifyZ[0][5] gives array of z coordinates at level 0 and id 5)

                                var afterSparsifyX = [[[]]]; // holds x coordinate of each point after sparsification (e.g. afterSparsifyX[0][5] gives array of x coordinates at level 0 and id 5)
                                var afterSparsifyY = [[[]]]; // holds y coordinate of each point after sparsification (e.g. afterSparsifyY[0][5] gives array of y coordinates at level 0 and id 5)
                                var afterSparsifyZ = [[[]]]; // holds z coordinate of each point after sparsification (e.g. afterSparsifyZ[0][5] gives array of z coordinates at level 0 and id 5)

                                var pointId = [[[]]]; // holds id assigned to each specific point with all data (e.g. pointId[0][5] gives array of ids at level 0 and id 5)
                                var beforeSparsifyPointId = [[[]]]; // holds id assigned to each specific point before sparsification (e.g. beforeSparsifyPointId[0][5] gives array of ids at level 0 and id 5)
                                var afterSparsifyPointId = [[[]]]; // holds id assigned to each specific point after sparsification (e.g. afterSparsifyPointId[0][5] gives array of ids at level 0 and id 5)

                                // eslint-disable-next-line
                                for (var i = 0; i < clustering3dData.length; i++) {
                                  var coordinate = clustering3dData[i];
                                  if (x[0][coordinate.id] === undefined) {
                                    x[0][coordinate.id] = [];
                                    y[0][coordinate.id] = [];
                                    z[0][coordinate.id] = [];

                                    beforeSparsifyX[0][coordinate.id] = [];
                                    beforeSparsifyY[0][coordinate.id] = [];
                                    beforeSparsifyZ[0][coordinate.id] = [];

                                    pointId[0][coordinate.id] = [];
                                    beforeSparsifyPointId[0][coordinate.id] = [];
                                    afterSparsifyPointId[0][coordinate.id] = [];
                                  }

                                  // adds new points at index 'id'
                                  x[0][coordinate.id].push(Number(coordinate.x));
                                  y[0][coordinate.id].push(Number(coordinate.y));
                                  z[0][coordinate.id].push(Number(coordinate.z));

                                  beforeSparsifyX[0][coordinate.id].push(Number(coordinate.x));
                                  beforeSparsifyY[0][coordinate.id].push(Number(coordinate.y));
                                  beforeSparsifyZ[0][coordinate.id].push(Number(coordinate.z));

                                  pointId[0][coordinate.id].push(Number(uniqueIdCoordinateData[i].id));
                                  beforeSparsifyPointId[0][coordinate.id].push(Number(uniqueIdCoordinateData[i].id));
                                }

                                // eslint-disable-next-line
                                for (var i = 0; i < beforeSparsifyX[0].length; i++) {
                                  afterSparsifyX[0][i] = [];
                                  afterSparsifyY[0][i] = [];
                                  afterSparsifyZ[0][i] = [];

                                  if (rank[i] !== size[i]) { // if the rank is less than the size, use the Farthest-First Algorithm to ensure an evenly distributed graph
                                    // Farthest-First Algorithm Begins
                                    var random = (Math.random()*(beforeSparsifyX[0][i].length)) | 0; // gets a random num between 0 and the number of points in the cluster

                                    var pointsAdded = [random]; // array of points that will be kept after sparsification

                                    var distances = []; // array of distances from the closest point
                                    distances[random] = undefined;

                                    // eslint-disable-next-line
                                    for (var j = 1; j < rank[i]; j++) {
                                      for (var k = 0; k < beforeSparsifyX[0][i].length; k++) {
                                        if (!pointsAdded.includes(k)) {
                                          var prevIndex = pointsAdded[j-1];
                                          var prevX = beforeSparsifyX[0][i][prevIndex];
                                          var prevY = beforeSparsifyY[0][i][prevIndex];
                                          var prevZ = beforeSparsifyZ[0][i][prevIndex];

                                          var currX = beforeSparsifyX[0][i][k];
                                          var currY = beforeSparsifyY[0][i][k];
                                          var currZ = beforeSparsifyZ[0][i][k];

                                          var newDistance = Math.sqrt(Math.pow(currX-prevX, 2) + Math.pow(currY-prevY, 2) + Math.pow(currZ-prevZ, 2));
                                          if (distances[k] !== null && distances[k] !== undefined) {
                                            distances[k] = Math.min(distances[k], newDistance);
                                          } else {
                                            distances[k] = newDistance;
                                          }
                                        }
                                      }

                                      var maxIndex = 0;
                                      // eslint-disable-next-line
                                      for (var k = 0; k < distances.length; k++) {
                                        if (distances[k] !== undefined && (distances[maxIndex] === undefined || distances[k] > distances[maxIndex])) {
                                          maxIndex = k;
                                        }
                                      }

                                      pointsAdded.push(maxIndex);
                                      distances[maxIndex] = undefined;
                                    }

                                    // Farthest-First Algorithm Ends

                                    // Pseudocode for Farthest-First algorithm seen above
                                    /*
                                      var random = integer between 0 and the number of points in cluster 'i'
                                      var pointsAdded = new array with random as the only values
                                      var distances = currently empty array

                                      Iterate through the loop rank[i] times {
                                        Iterate through points of cluster 'i' {
                                          if (point 'k' hasn't been added to pointsAdded yet) {
                                            Find its distance 'newDistance' from the most recent point added to pointsAdded

                                            if (newDistance is smaller than the current closest distance to point 'k') {
                                              Set newDistance as the value at distances[k]
                                            }
                                          }
                                        }

                                        Find the index 'maxIndex' with the max value in the array 'distances'
                                        Add 'maxIndex' to pointsAdded
                                        Set distances[maxIndex] to undefined
                                      }
                                    */

                                    // eslint-disable-next-line
                                    for (var j = 0; j < pointsAdded.length; j++) {
                                        afterSparsifyX[0][i][j] = beforeSparsifyX[0][i][pointsAdded[j]];
                                        afterSparsifyY[0][i][j] = beforeSparsifyY[0][i][pointsAdded[j]];
                                        afterSparsifyZ[0][i][j] = beforeSparsifyZ[0][i][pointsAdded[j]];

                                        afterSparsifyPointId[0][i][j] = beforeSparsifyPointId[0][i][pointsAdded[j]];
                                    }
                                  } else {
                                    // eslint-disable-next-line
                                    for (var j = 0; j < beforeSparsifyX[0][i].length; j++) {
                                      afterSparsifyX[0][i][j] = beforeSparsifyX[0][i][j];
                                      afterSparsifyY[0][i][j] = beforeSparsifyY[0][i][j];
                                      afterSparsifyZ[0][i][j] = beforeSparsifyZ[0][i][j];

                                      afterSparsifyPointId[0][i][j] = beforeSparsifyPointId[0][i][j];
                                    }
                                  }
                                }

                                console.timeEnd("Initial Plot View");
                                console.time("All Plot Views");

                                //eslint-disable-next-line
                                for (var i = 1; i < lvlToId.length; i++) {
                                  if (i !== 1) {
                                    if (x[i] === undefined) {
                                      x[i] = [[]];
                                      y[i] = [[]];
                                      z[i] = [[]];

                                      beforeSparsifyX[i] = [[]];
                                      beforeSparsifyY[i] = [[]];
                                      beforeSparsifyZ[i] = [[]];

                                      afterSparsifyX[i] = [[]];
                                      afterSparsifyY[i] = [[]];
                                      afterSparsifyZ[i] = [[]];

                                      pointId[i] = [[]];
                                      beforeSparsifyPointId[i] = [[]];
                                      afterSparsifyPointId[i] = [[]];
                                    }

                                    // eslint-disable-next-line
                                    for (var j = x[i-1].length-1; j >= 0; j--) {
                                      if (self.state.childToParent[j] !== undefined && self.state.childToParent[j] !== null && self.state.childToParent[j] !== []) {
                                        if (x[i][self.state.childToParent[j]] === undefined) {
                                          x[i][self.state.childToParent[j]] = [];
                                          y[i][self.state.childToParent[j]] = [];
                                          z[i][self.state.childToParent[j]] = [];

                                          beforeSparsifyX[i][self.state.childToParent[j]] = [];
                                          beforeSparsifyY[i][self.state.childToParent[j]] = [];
                                          beforeSparsifyZ[i][self.state.childToParent[j]] = [];

                                          pointId[i][self.state.childToParent[j]] = [];
                                          beforeSparsifyPointId[i][self.state.childToParent[j]] = [];
                                        }

                                        // pushes new clusters before merging
                                        x[i][self.state.childToParent[j]].push.apply(x[i][self.state.childToParent[j]], x[i-1][j]);
                                        y[i][self.state.childToParent[j]].push.apply(y[i][self.state.childToParent[j]], y[i-1][j]);
                                        z[i][self.state.childToParent[j]].push.apply(z[i][self.state.childToParent[j]], z[i-1][j]);

                                        beforeSparsifyX[i][self.state.childToParent[j]].push.apply(beforeSparsifyX[i][self.state.childToParent[j]], afterSparsifyX[i-1][j]);
                                        beforeSparsifyY[i][self.state.childToParent[j]].push.apply(beforeSparsifyY[i][self.state.childToParent[j]], afterSparsifyY[i-1][j]);
                                        beforeSparsifyZ[i][self.state.childToParent[j]].push.apply(beforeSparsifyZ[i][self.state.childToParent[j]], afterSparsifyZ[i-1][j]);

                                        pointId[i][self.state.childToParent[j]].push.apply(pointId[i][self.state.childToParent[j]], pointId[i-1][j]);
                                        beforeSparsifyPointId[i][self.state.childToParent[j]].push.apply(beforeSparsifyPointId[i][self.state.childToParent[j]], afterSparsifyPointId[i-1][j]);
                                      }
                                    }

                                    // eslint-disable-next-line
                                    for (var j = 0; j < beforeSparsifyX[i].length; j++) {
                                      if (beforeSparsifyX[i][j] !== undefined && beforeSparsifyX[i][j].length !== 0) {
                                        afterSparsifyX[i][j] = [];
                                        afterSparsifyY[i][j] = [];
                                        afterSparsifyZ[i][j] = [];

                                        afterSparsifyPointId[i][j] = [];

                                        if (rank[j] !== size[j]) {
                                          // Farthest-First Algorithm Begins

                                          // eslint-disable-next-line
                                          var random = (Math.random()*(beforeSparsifyX[i][j].length)) | 0;

                                          // eslint-disable-next-line
                                          var pointsAdded = [random];

                                          // eslint-disable-next-line
                                          var distances = [];
                                          distances[random] = undefined;

                                          // eslint-disable-next-line
                                          for (var k = 1; k < rank[j]; k++) {
                                            for (var l = 0; l < beforeSparsifyX[i][j].length; l++) {
                                              if (!pointsAdded.includes(l)) {
                                                // eslint-disable-next-line
                                                var prevIndex = pointsAdded[k-1];
                                                // eslint-disable-next-line
                                                var prevX = beforeSparsifyX[i][j][prevIndex];
                                                // eslint-disable-next-line
                                                var prevY = beforeSparsifyY[i][j][prevIndex];
                                                // eslint-disable-next-line
                                                var prevZ = beforeSparsifyZ[i][j][prevIndex];

                                                // eslint-disable-next-line
                                                var currX = beforeSparsifyX[i][j][l];
                                                // eslint-disable-next-line
                                                var currY = beforeSparsifyY[i][j][l];
                                                // eslint-disable-next-line
                                                var currZ = beforeSparsifyZ[i][j][l];

                                                // eslint-disable-next-line
                                                var newDistance = Math.sqrt(Math.pow(currX-prevX, 2) + Math.pow(currY-prevY, 2) + Math.pow(currZ-prevZ, 2));
                                                if (distances[l] !== null && distances[l] !== undefined) {
                                                  distances[l] = Math.min(distances[l], newDistance);
                                                } else {
                                                  distances[l] = newDistance;
                                                }
                                              }
                                            }

                                            // eslint-disable-next-line
                                            var maxIndex = 0;

                                            // eslint-disable-next-line
                                            for (var l = 0; l < distances.length; l++) {
                                              if (distances[l] !== undefined && (distances[maxIndex] === undefined || distances[l] > distances[maxIndex])) {
                                                maxIndex = l;
                                              }
                                            }

                                            pointsAdded.push(maxIndex);
                                            distances[maxIndex] = undefined;
                                          }

                                          // eslint-disable-next-line
                                          for (var k = 0; k < pointsAdded.length; k++) {
                                              afterSparsifyX[i][j][k] = beforeSparsifyX[i][j][pointsAdded[k]];
                                              afterSparsifyY[i][j][k] = beforeSparsifyY[i][j][pointsAdded[k]];
                                              afterSparsifyZ[i][j][k] = beforeSparsifyZ[i][j][pointsAdded[k]];

                                              afterSparsifyPointId[i][j][k] = beforeSparsifyPointId[i][j][pointsAdded[k]];
                                          }

                                          // Farthest-First Algorithm Ends

                                          // Pseudocode for Farthest-First algorithm seen above
                                          /*
                                            var random = integer between 0 and the number of points in cluster 'j'
                                            var pointsAdded = new array with random as the only values
                                            var distances = currently empty array

                                            Iterate through the loop rank[j] times {
                                              Iterate through points of cluster 'j' {
                                                if (point 'l' hasn't been added to pointsAdded yet) {
                                                  Find its distance 'newDistance' from the most recent point added to pointsAdded

                                                  if (newDistance is smaller than the current closest distance to point 'l') {
                                                    Set newDistance as the value at distances[l]
                                                  }
                                                }
                                              }

                                              Find the index 'maxIndex' with the max value in the array 'distances'
                                              Add 'maxIndex' to pointsAdded
                                              Set distances[maxIndex] to undefined
                                            }
                                          */

                                        } else {
                                          // eslint-disable-next-line
                                          for (var k = 0; k < beforeSparsifyX[i][j].length; k++) {
                                            afterSparsifyX[i][j][k] = beforeSparsifyX[i][j][k];
                                            afterSparsifyY[i][j][k] = beforeSparsifyY[i][j][k];
                                            afterSparsifyZ[i][j][k] = beforeSparsifyZ[i][j][k];

                                            afterSparsifyPointId[i][j][k] = beforeSparsifyPointId[i][j][k];
                                          }
                                        }
                                      }
                                    }
                                  } else {
                                    x[1] = x[0];
                                    y[1] = y[0];
                                    z[1] = z[0];

                                    beforeSparsifyX[1] = beforeSparsifyX[0];
                                    beforeSparsifyY[1] = beforeSparsifyY[0];
                                    beforeSparsifyZ[1] = beforeSparsifyZ[0];

                                    afterSparsifyX[1] = afterSparsifyX[0];
                                    afterSparsifyY[1] = afterSparsifyY[0];
                                    afterSparsifyZ[1] = afterSparsifyZ[0];

                                    pointId[1] = pointId[0];
                                    beforeSparsifyPointId[1] = beforeSparsifyPointId[0];
                                    afterSparsifyPointId[1] = afterSparsifyPointId[0];
                                  }
                                }

                                console.timeEnd("All Plot Views");
                                console.time("Plot Traces");

                                // eslint-disable-next-line
                                for (var i = 0; i < x.length; i++) {
                                  // eslint-disable-next-line
                                  for (var j = 0; j < x[i].length; j++) {
                                    var tempName = "";

                                    var tempColor = 'rgba(' + Math.round(Math.random()*255) + "," + Math.round(Math.random()*255) + "," + Math.round(Math.random()*255) + ", 1)";

                                    if (name[j].includes("not_fault")) {
                                      tempName = "Cluster"
                                    } else {
                                      tempName = "Fault"
                                    }

                                    if (idToLvl[j] >= i) {
                                      if (x[i][j] !== undefined && x[i][j] !== [] && x[i][j].length !== 0) {
                                        var trace = { // each trace is one cluster
                                          x: x[i][j], y: y[i][j], z: z[i][j], // provides array of x,y,z coordinates for the points in each cluster
                                          mode: 'markers',
                                          marker: {
                                            size: self.state.markerSize,
                                            symbol: 'circle',
                                            color: tempColor,
                                            line: {
                                              color: 'rgb(217, 217, 217)',
                                              width: 0.5
                                            },
                                            opacity: self.state.opacity
                                          },
                                          type: 'scatter3d',
                                          id: idToLvl[j],
                                          pointIds: pointId[i][j],
                                          cluster: j,
                                          name: tempName + ' ' + j + ' (Level ' + idToLvl[j] + ')', // e.g Cluster 5 (Level 0)
                                        };

                                        if (self.state.traces[i] === undefined) {
                                          self.state.traces[i] = [];
                                        }

                                        self.state.traces[i].push(trace);

                                        if (stats[j] !== undefined) {
                                          var statsX = Array.apply(null, {length: stats[j].length}).map(Number.call, Number);

                                          // Uncomment below to normalize x-axis of 'Diagonal of R' Plot
                                          /*
                                          // eslint-disable-next-line
                                          for (var k = 0; k < statsX.length; k++) {
                                             statsX[k]/=(statsX.length-1);
                                          }
                                          */

                                          var statsTrace = {
                                            x: statsX,
                                            y: stats[j],
                                            hoverinfo: 'text',
                                            hovertext: Array(stats[j].length).fill(tempName + " " + j + "<br>Size: " + size[j]  + "<br>Rank: " + rank[j] + "<br>Level: " + idToLvl[j]),
                                            line: {
                                              color: tempColor,
                                            },
                                            name: tempName + ' ' + j + ' (Level ' + idToLvl[j] + ')', // e.g Cluster 5 (Level 0)
                                            id: idToLvl[j],
                                            mode: 'lines',
                                            visible: true,
                                          }

                                          if (self.state.statsTraces[i] === undefined) {
                                            self.state.statsTraces[i] = [];
                                          }

                                          self.state.statsTraces[i].push(statsTrace);
                                        }
                                      }

                                      if (beforeSparsifyX[i][j] !== undefined && beforeSparsifyX[i][j] !== [] && beforeSparsifyX[i][j].length !== 0) {
                                        var beforeSparsifyTrace = {
                                          x: beforeSparsifyX[i][j], y: beforeSparsifyY[i][j], z: beforeSparsifyZ[i][j], // provides array of x,y,z coordinates for the points in each cluster
                                          mode: 'markers',
                                          marker: {
                                            size: self.state.markerSize,
                                            symbol: 'circle',
                                            color: tempColor,
                                            line: {
                                              color: 'rgb(217, 217, 217)',
                                              width: 0.5
                                            },
                                            opacity: self.state.opacity
                                          },
                                          type: 'scatter3d',
                                          id: idToLvl[j],
                                          pointIds: beforeSparsifyPointId[i][j],
                                          cluster: j,
                                          name: tempName + ' ' + j + ' (Level ' + idToLvl[j] + ')', // e.g Cluster 5 (Level 0)
                                        };

                                        if (self.state.beforeSparsifyTraces[i] === undefined) {
                                          self.state.beforeSparsifyTraces[i] = [];
                                        }

                                        self.state.beforeSparsifyTraces[i].push(beforeSparsifyTrace);
                                      }

                                      if (afterSparsifyX[i][j] !== undefined && afterSparsifyX[i][j] !== [] && afterSparsifyX[i][j].length !== 0) {
                                        var afterSparsifyTrace = {
                                          x: afterSparsifyX[i][j], y: afterSparsifyY[i][j], z: afterSparsifyZ[i][j], // provides array of x,y,z coordinates for the points in each cluster
                                          mode: 'markers',
                                          marker: {
                                            size: self.state.markerSize,
                                            symbol: 'circle',
                                            color: tempColor,
                                            line: {
                                              color: 'rgb(217, 217, 217)',
                                              width: 0.5
                                            },
                                            opacity: self.state.opacity
                                          },
                                          type: 'scatter3d',
                                          id: idToLvl[j],
                                          pointIds: afterSparsifyPointId[i][j],
                                          cluster: j,
                                          name: tempName + ' ' + j + ' (Level ' + idToLvl[j] + ')', // e.g Cluster 5 (Level 0)
                                        };

                                        if (self.state.afterSparsifyTraces[i] === undefined) {
                                          self.state.afterSparsifyTraces[i] = [];
                                        }

                                        self.state.afterSparsifyTraces[i].push(afterSparsifyTrace);
                                      }
                                    }
                                  }
                                }

                                console.timeEnd("Plot Traces");
                                console.time("Adjacency List");

                                var adjacencyList = [[]];

                                // eslint-disable-next-line
                                for (var i = 0; i < adjacencyData.length; i++) {
                                  var tempAdjacencyListEntry = adjacencyData[i].nbrs.split(' ');
                                  adjacencyList[adjacencyData[i].id] = [];
                                  // eslint-disable-next-line
                                  for (var j = 0; j < tempAdjacencyListEntry.length; j++) {
                                    adjacencyList[adjacencyData[i].id][j] = Number(tempAdjacencyListEntry[j]);
                                  }
                                  adjacencyList[adjacencyData[i].id].pop();
                                }

                                self.state.adjacencyList = adjacencyList;

                                console.timeEnd("Adjacency List");
                                console.timeEnd("Total");
                                console.groupEnd();

                                self.setState({traces: self.state.traces});
                              });
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

    // eslint-disable-next-line
    for (var i = 0; i < this.state.traces.length; i++) {
      for (var j = 0; j < this.state.traces[i].length; j++) {
        if (this.state.traces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.traces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.traces[i][j].visible = true;
        }

        if (this.state.beforeSparsifyTraces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[i][j].visible = true;
        }

        if (this.state.afterSparsifyTraces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[i][j].visible = true;
        }

        if (this.state.statsTraces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.statsTraces[i][j].visible = true;
        }
      }
    }

    this.setState({level: event.target.value});
  }

  sparsify(event) {
    this.setState({sparsified: Number(event.target.value)})
  }

  toggleLevel(event) { //whether the level is shown or not
    var changed = false;
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
        changed = true;
        if (this.state.traces[this.state.level][i].visible === false) { // if not visible, make the level visible
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = true;
        } else { // else hide the level
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = false;
        }
      }

      if (this.state.beforeSparsifyTraces[this.state.level][i] !== undefined && this.state.beforeSparsifyTraces[this.state.level][i].id[0] === event.target.id) {
        changed = true;
        if (this.state.beforeSparsifyTraces[this.state.level][i].visible === false) { // if not visible, make the level visible
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[this.state.level][i].visible = true;
        } else { // else hide the level
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[this.state.level][i].visible = false;
        }
      }

      if (this.state.afterSparsifyTraces[this.state.level][i] !== undefined && this.state.afterSparsifyTraces[this.state.level][i].id[0] === event.target.id) {
        changed = true;
        if (this.state.afterSparsifyTraces[this.state.level][i].visible === false) { // if not visible, make the level visible
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[this.state.level][i].visible = true;
        } else { // else hide the level
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[this.state.level][i].visible = false;
        }
      }

      if (this.state.statsTraces[this.state.level][i] !== undefined && this.state.statsTraces[this.state.level][i].id[0] === event.target.id) {
        changed = true;
        if (this.state.statsTraces[this.state.level][i].visible === false) { // if not visible, make the level visible
          // eslint-disable-next-line
          this.state.statsTraces[this.state.level][i].visible = true;
        } else {
          // eslint-disable-next-line
          this.state.statsTraces[this.state.level][i].visible = false;
        }
      }
    }

    if (changed) {
      if (this.state.levelTextColor[event.target.id] === "gray") {
        // eslint-disable-next-line
        this.state.levelTextColor[event.target.id] = "black";
      } else {
        // eslint-disable-next-line
        this.state.levelTextColor[event.target.id] = "gray";
      }
    }

    this.setState({traces: this.state.traces})
  }

  plotClicked(event) { // on plot clicked event
    this.showSurfaceOnClick(event);
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
        console.time("Total");
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

        /* Pseudocode for the above algorithm

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


        if (connections.length > 0) {
          console.time("3D Mesh Trace");
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
        console.timeEnd("Total");
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
                    if (Number(currId) !== adjacencyList[currId][j] && currId !== adjacencyList[currId][k] && adjacencyList[currId][j] !== adjacencyList[currId][k]) {
                      connections.push([currId, adjacencyList[currId][j], adjacencyList[currId][k]]);
                      connectionsT[0].push(prevToNewId[currId]);
                      connectionsT[1].push(prevToNewId[adjacencyList[currId][j]]);
                      connectionsT[2].push(prevToNewId[adjacencyList[currId][k]]);
                    }
                  }
                }
              }
            }
          }

          /* Pseudocode for above triangle counting

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


        if (connections.length > 0) {
          console.time("3D Mesh Trace");
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

  updateTolerance(event) {
    this.setState({tolerance: event.target.value});
  }

  showToleranceButton(event) {
    var maxLength = 0; //max length of all clusters
    var pointsAbove = 0; //number of points above tolerance line
    var pointsBelow = 0; //number of points below tolerance line

    for (var i = 0; i < this.state.statsTraces[this.state.level].length; i++) {
      var selectedCluster = this.state.statsTraces[this.state.level][i];

      if (selectedCluster.name.includes("Dividing Line")) { //if a dividing lines already exists, remove it
        this.state.statsTraces[this.state.level].splice(i, 1);
        i--;
      }

      else if (selectedCluster.visible === true) { //if the cluster is currently visible on the page
        if (this.state.statsTraces[this.state.level][i].x.length > maxLength) {
          maxLength = this.state.statsTraces[this.state.level][i].x.length;
        }

        var currPointsAbove = 0; //number of points above tolerance line for selected cluster
        var currPointsBelow = 0; //number of points below tolerance line for selected cluster
        for (var j = 0; j < selectedCluster.y.length; j++) {
          if (selectedCluster.y[j] > Number(this.state.tolerance)) {
            currPointsAbove++; //add to currPointsAbove
          } else {
            currPointsBelow = (selectedCluster.y.length - currPointsAbove); //add the remaining number of points to currPointsBelow
            break;
          }
        }
        pointsAbove+=currPointsAbove;
        pointsBelow+=currPointsBelow;
      }
    }

    var dividingLine = { //dividing line trace
      type: 'line',
      xref: 'paper',
      x: [0, maxLength-1],
      y: [Number(this.state.tolerance), Number(this.state.tolerance)],
      line: {
        color: 'rgb(50, 171, 96)',
        width: 4,
        dash: 'dash'
      },
      name: "Dividing Line at " + this.state.tolerance,
      hoverinfo: "text",
      hovertext: Array(2).fill("Dividing Line at " + this.state.tolerance + "<br>Points Above: " + pointsAbove + "<br>Points Below: " + pointsBelow),
    }

    this.state.statsTraces[this.state.level].push(dividingLine); //adds dividing line to statsTraces

    this.setState({statsTraces: this.state.statsTraces});
  }

  changeSize(event) { // when size slider is moved
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      // eslint-disable-next-line
      this.state.traces[this.state.level][i].marker.size = event.target.value;

      if (this.state.beforeSparsifyTraces[this.state.level][i] !== undefined && this.state.beforeSparsifyTraces[this.state.level][i] !== null) {
        // eslint-disable-next-line
        this.state.beforeSparsifyTraces[this.state.level][i].marker.size = event.target.value;
      }

      if (this.state.afterSparsifyTraces[this.state.level][i] !== undefined && this.state.afterSparsifyTraces[this.state.level][i] !== null) {
        // eslint-disable-next-line
        this.state.afterSparsifyTraces[this.state.level][i].marker.size = event.target.value;
      }
    }

    this.setState({markerSize: event.target.value});
  }

  changeOpacity(event) { // when opacity slider(s) is moved
    if (this.state.levelTextColor[event.target.id] === 'black') {
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].marker.opacity = event.target.value; // sets opacity to the value of the slider
        }

        if (this.state.beforeSparsifyTraces[this.state.level][i] !== undefined && this.state.beforeSparsifyTraces[this.state.level][i].id[0] === event.target.id) {
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[this.state.level][i].marker.opacity = event.target.value; // sets opacity to the value of the slider
        }

        if (this.state.afterSparsifyTraces[this.state.level][i] !== undefined && this.state.afterSparsifyTraces[this.state.level][i].id[0] === event.target.id) {
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[this.state.level][i].marker.opacity = event.target.value; // sets opacity to the value of the slider
        }
      }

      // eslint-disable-next-line
      this.state.opacity[event.target.id] = event.target.value;
      this.setState({opacity: this.state.opacity});
    } else {
      alert("Cannot Toggle this Slider because Level " + event.target.id + " is no Longer Being Shown.");
    }
  }

  toggleRDiag(event) {
    if (this.state.RDiagDisplay === "none") {
      this.setState({RDiagDisplay: "block"});
    } else {
      this.setState({RDiagDisplay: "none"});
    }
  }

  showStatsTrace(event) {
    if (!event.points[0].data.name.includes("Dividing Line")) {
      console.log("Isolating " + event.points[0].data.name);
      for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
        if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].name !== undefined && this.state.traces[this.state.level][i].name !== event.points[0].data.name) {
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = false;
        }
        if (this.state.beforeSparsifyTraces[this.state.level][i] !== undefined && this.state.beforeSparsifyTraces[this.state.level][i].name !== event.points[0].data.name) {
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[this.state.level][i].visible = false;
        }
        if (this.state.afterSparsifyTraces[this.state.level][i] !== undefined && this.state.afterSparsifyTraces[this.state.level][i].name !== event.points[0].data.name) {
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[this.state.level][i].visible = false;
        }
        if (this.state.statsTraces[this.state.level][i] !== undefined && this.state.statsTraces[this.state.level][i].name !== event.points[0].data.name) {
          // eslint-disable-next-line
          this.state.statsTraces[this.state.level][i].visible = false;
        }
      }

      this.setState({traces: this.state.traces});
      this.setState({beforeSparsifyTraces: this.state.beforeSparsifyTraces});
      this.setState({afterSparsifyTraces: this.state.afterSparsifyTraces});
      this.setState({stateTraces: this.state.stateTraces});
    }
  }

  resetStatsTrace() {
    console.time("Reset Stats Traces");
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      if (this.state.traces[this.state.level][i] !== undefined) {
        // eslint-disable-next-line
        this.state.traces[this.state.level][i].visible = true;
      }
      if (this.state.beforeSparsifyTraces[this.state.level][i] !== undefined) {
        // eslint-disable-next-line
        this.state.beforeSparsifyTraces[this.state.level][i].visible = true;
      }
      if (this.state.afterSparsifyTraces[this.state.level][i] !== undefined) {
        // eslint-disable-next-line
        this.state.afterSparsifyTraces[this.state.level][i].visible = true;
      }
      if (this.state.statsTraces[this.state.level][i] !== undefined) {
        // eslint-disable-next-line
        this.state.statsTraces[this.state.level][i].visible = true;

        if (this.state.statsTraces[this.state.level][i].name.includes("Dividing Line")) {
          this.state.statsTraces[this.state.level].splice(i, 1);
          i--;
        }
      }
    }

    this.setState({traces: this.state.traces});
    this.setState({beforeSparsifyTraces: this.state.beforeSparsifyTraces});
    this.setState({afterSparsifyTraces: this.state.afterSparsifyTraces});
    this.setState({statsTraces: this.state.statsTraces});

    console.timeEnd("Reset Stats Traces");
  }

  reset() {
    console.time("Reset All");
    for (var i = 0; i < this.state.traces.length; i++) {
      for (var j = 0; j < this.state.traces[i].length; j++) {
        if (this.state.traces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.traces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.traces[i][j].visible = true;

          if (this.state.traces[i][j].name.includes('highlight')) {
            this.state.traces[i].splice(j, 1);
            j--;
          }
        }

        if (this.state.beforeSparsifyTraces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.beforeSparsifyTraces[i][j].visible = true;
        }

        if (this.state.afterSparsifyTraces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[i][j].marker.opacity = event.target.value;
          // eslint-disable-next-line
          this.state.afterSparsifyTraces[i][j].visible = true;
        }

        if (this.state.statsTraces[i][j] !== undefined) {
          // eslint-disable-next-line
          this.state.statsTraces[i][j].visible = true;

          if (this.state.statsTraces[i][j].name.includes("Dividing Line")) {
            this.state.statsTraces[i].splice(j, 1);
            j--;
          }
        }
      }

      // eslint-disable-next-line
      this.state.levelTextColor[i] = "black";
    }

    // eslint-disable-next-line
    this.state.hiddenPlots[this.state.level] = 'none';
    // eslint-disable-next-line
    this.state.hiddenPlots[0] = 'block';

    this.setState({sparsified: 0});
    this.setState({toggledSurfaces: []});
    this.setState({opacity: this.state.opacity});
    this.setState({markerSize: 5});
    this.setState({level: 0});

    console.timeEnd("Reset All");
  }

  render() { // renders the webpage
    if (this.state.traces[this.state.level] !== null && this.state.traces[this.state.level].length !== 0 && this.state.traces[this.state.level] !== undefined && this.state.leveltoId !== [[]] && this.state.leveltoId !== undefined) { // if all data to plot is present
      var statsTraces = this.state.statsTraces;
      var lvltoId = this.state.leveltoId;

      var data;
      var currentSparsification;

      //depending on the sparsification slider, it will choose which sparsification level to use
      if (this.state.sparsified === 0) {
        data = this.state.traces;
        currentSparsification = "All Data";
      } else if (this.state.sparsified === 1) {
        data = this.state.beforeSparsifyTraces;
        currentSparsification = "Before Sparsification";
      } else {
        data = this.state.afterSparsifyTraces;
        currentSparsification = "After Sparsification";
      }

      return ( // code below is in JSX
        <div>
          <h1 id="title" style={{textAlign: "center", fontFamily: "Trebuchet MS"}}>spaND Visualization</h1>
          <div style={{height: (this.state.height)/10*9}}>
            {
              data.map((currLevelTrace, index) =>
                <div key={index} style={{display: this.state.hiddenPlots[index]}}>
                  <Plot
                    data={currLevelTrace}
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

            <div className="slidecontainer" style={{position: "fixed", left:(this.state.width)/4*3 + 100 + "px", top:100 + "px", borderRadius: 0, borderStyle: 'solid', borderWidth: 2+'px', borderColor: 'black', padding: 10+'px'}}>
              <div>
                <button id="0" style={{background: 'none', color: 'inherit', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', outline: 'inherit'}} onClick={this.toggleTab.bind(this)}>&#9660; Levels</button>
                <div style={{display: this.state.tabs[0], marginLeft: 30 + "px", marginTop: 5 + "px"}}>
                  Level: {this.state.level}
                  <br/>
                  <input type="range" min="0" max={this.state.leveltoId.length-1} step="1" value={this.state.level} className="slider" id="myRange" onChange={this.changeLevel.bind(this)}/>

                  <br/>
                  <br/>

                  Sparsify: {currentSparsification}
                  <br/>
                  <input type="range" min="0" max="2" step="1" value={this.state.sparsified} className="slider" id="myRange" onChange={this.sparsify.bind(this)}/>

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
                  Tolerance: <input type="number" value={this.state.tolerance} min="0" max="1" step="any" onChange={this.updateTolerance.bind(this)} style={{width: 50 + "px"}}/>
                  <br/>
                  <button onClick={this.showToleranceButton.bind(this)}>Show Tolerance</button>

                  <br/>
                  <br/>

                  Marker Size: {this.state.markerSize}
                  <br/>
                  <input type="range" min="1" max="20" value={this.state.markerSize} className="slider" id="myRange" onChange={this.changeSize.bind(this)}/>
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
              <button onClick={this.toggleRDiag.bind(this)}>Diagonal of R Plot</button>
              <br/>
              <br/>
              <button style={{borderRadius: 0, borderStyle: 'solid', borderWidth: 2+'px', borderColor: 'red', width: 90+'%', color: 'red', padding: 5+'px', marginLeft: 5+'%'}} onClick={this.reset.bind(this)}>Reset</button>
            </div>
          </div>
          <div style={{display: this.state.RDiagDisplay}}>
            {
              statsTraces.map((currLevelTrace, index) =>
                <div key={index} style={{display: this.state.hiddenPlots[index]}}>
                  <Plot
                    data={currLevelTrace}
                    layout={{
                      width: this.state.width/4*3,
                      height: this.state.height,
                      showlegend: true,
                      hovermode: "closest",
                      yaxis: {
                        type: 'log',
                        exponentformat: 'power',
                      },
                    }}
                    onClick={this.showStatsTrace.bind(this)}
                    onDoubleClick={this.resetStatsTrace.bind(this)}
                  />
                </div>
              )
            }
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
