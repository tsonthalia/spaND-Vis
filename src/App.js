import React from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.loadPlot = this.loadPlot.bind(this);
  }

  loadPlot() {
    let self = this;

    var folder = "data/002/" //change this line to change the set of data being used
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
                        Plotly.d3.csv(folder + 'clustering3d.csv', function(err, rows){
                          function unpack(rows, key) {
                          	return rows.map(function(row) {
                              return row[key];
                            });
                          }

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

                          var id = [];
                          var lvl = [[]]; // Holds ID and corresponding levels
                          var mergeLvl = []; // Holds merge level
                          var name = []; // Holds name of each cluster

                          var idtoLvl = [[]]; // Holds conversion from id to level

                          var clusters3dText = clusters3d.responseText.split('\n');

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
                          }

                          //self.setState({opacity: self.state.opacity});

                          var x = [[[]]];
                          var y = [[[]]];
                          var z = [[[]]];

                          var xValues = unpack(rows, 'x');
                          var yValues = unpack(rows, 'y');
                          var zValues = unpack(rows, 'z');
                          var idValues = unpack(rows, 'id');

                          for (var i = 0; i < idValues.length; i++) {
                            if (x[0][idValues[i]] === undefined) {
                              x[0][idValues[i]] = [];
                              y[0][idValues[i]] = [];
                              z[0][idValues[i]] = [];
                            }

                            x[0][idValues[i]].push(xValues[i]);
                            y[0][idValues[i]].push(yValues[i]);
                            z[0][idValues[i]].push(zValues[i]);
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
                              var tempShape = "";
                              var tempColor = "";


                              if (name[i].includes("not_fault")) {
                                tempName = "Cluster"
                                tempShape = "circle"
                                tempColor = '#'+Math.floor(Math.random()*700000+1000000).toString(16);
                              } else {
                                tempName = "Fault"
                                tempShape = "square"
                                tempColor = '#'+Math.floor(Math.random()*700000+16000000).toString(16);
                              }

                              if (idtoLvl[i] >= j && x[j][i] !== undefined) {
                                var trace = {
                                  x: x[j][i], y: y[j][i], z: z[j][i],
                                  mode: 'markers',
                                  //legendgroup: 'Level ' + idtoLvl[i],
                                  marker: {
                                    size: self.state.size,
                                    symbol: tempShape,
                                    color: tempColor,
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
  }

  changeLevel(event) {
    this.setState({level: event.target.value})
  }

  toggleLevel(event) { //whether the level is shown or not
    for (var i = 0; i < this.state.traces[this.state.level].length; i++) {
      //console.log(parseInt(this.state.traces[this.state.level][i].id[0]) == event.target.id);
      if (this.state.traces[this.state.level][i] !== undefined && this.state.traces[this.state.level][i].id[0] === event.target.id) {
        if (this.state.traces[this.state.level][i].visible === false) {
          //console.log(this.state.traces[this.state.level][i]);
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = true;
          event.target.style.color = "black";
          //event.target.innerText = "Hide Level " + event.target.id;
        } else {
          //console.log(this.state.traces[this.state.level][i]);
          // eslint-disable-next-line
          this.state.traces[this.state.level][i].visible = false;
          event.target.style.color = "gray";
          //event.target.innerText = "Show Level " + event.target.id;
        }
      }
    }

    this.setState({traces: this.state.traces})
  }

  // expandList(event) {
  //   if (this.state.collapsed[event.target.id] === "none") {
  //     event.target.innerHTML = "&#8897;"
  //     this.state.collapsed[event.target.id] = "block";
  //   } else {
  //     event.target.innerHTML = "&#8827;"
  //     this.state.collapsed[event.target.id] = "none";
  //   }
  //
  //   this.setState({collapsed: this.state.collapsed});
  // }

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
      }
    }


    this.setState({opacity: this.state.opacity});
    this.setState({size: 5});
    this.setState({level: 0});
  }

  render() {
    if (this.state.traces[this.state.level] !== null && this.state.traces[this.state.level].length !== 0 && this.state.traces[this.state.level] !== undefined && this.state.leveltoId !== [[]] && this.state.leveltoId !== undefined) {
      var data = [];

      for (var i = this.state.level; i < this.state.leveltoId.length; i++) {
        for (var j = 0; j < this.state.leveltoId[i].length; j++) {
          //console.log(this.state.traces[this.state.level]);
          if (this.state.traces[this.state.level][this.state.leveltoId[i][j]] !== undefined) {
            data.push(this.state.traces[this.state.level][this.state.leveltoId[i][j]])
          }
        }
      }

      var lvltoId = this.state.leveltoId;

      //console.log(this.state.traces[this.state.level].length);

      return (
        <div>
          <h1 id="title" style={{textAlign: "center", fontFamily: "Trebuchet MS"}}>spaND Visualization</h1>
          <Plot
            data={this.state.traces[this.state.level]}
            layout={{
              width: this.state.width/4*3,
              height: (this.state.height)/6*5,
              //title: 'spaND Visualization',
              showlegend: true,
              scene: {
                aspectmode:'cube',
                xaxis: {
                  autorange: false,
                  range:[0,10]
                },
                yaxis: {
                  autorange: false,
                  range:[0,10]
                },
                zaxis: {
                  autorange: false,
                  range:[0,10]
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
          <div className="slidecontainer" style={{marginLeft:(this.state.width)/4*3 + 100 + "px", marginTop:-(this.state.height)/6*5 + 100 + "px"}}>
            Level: {this.state.level}
            <br/>
            <input type="range" min="0" max={this.state.leveltoId.length-1} step="1" value={this.state.level} className="slider" id="myRange" onChange={this.changeLevel.bind(this)}/>
            <br/>
            <br/>
            Size: {this.state.size}
            <br/>
            <input type="range" min="1" max="20" value={this.state.size} className="slider" id="myRange" onChange={this.changeSize.bind(this)}/>
            <br/>
            <br/>
            {
              lvltoId.map((lvltoId, index) =>
                <div key={index}>
                  Opacity of Level {index}: {this.state.opacity[index]}
                  <br/>
                  <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[index]} className="slider" id={index} onChange={this.changeOpacity.bind(this)}/>
                  <br/>
                  <br/>
                </div>
              )
            }
            <p style={{margin: 0}}>Toggle Levels:</p>
            <ul style={{margin: 0}}>
              {
                lvltoId.map((curr, index) =>
                  <div key={index}>
                    <li onClick={this.toggleLevel.bind(this)} id={index}>Level {index}</li>
                  </div>
                )
              }
            </ul>
            <br/>
            <button onClick={this.reset.bind(this)}>Reset</button>
            <br/>
            <br/>
          </div>
        </div>
      );
    } else {
      // if (this.state.loadingMessage !== "") {
      //   console.log(this.state.loadingMessage);
      // }
      return(
        <div>
          <h2>Loading...</h2>
          <p>(Check Developer Console for More Information)</p>
        </div>
      );
    }
  }
}

export default App;
