import React from 'react';
import Plot from 'react-plotly.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      traces: [[]],
      size: 5,
      opacity: [],
      level: 0,
      leveltoId: [[]],
      childToParent: [],
      x: [[[]]],
      y: [[[]]],
      z: [[[]]],
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    let self = this;

    var folder = "data/002/" //change this line to change the set of data being used
    var clustering3d = new XMLHttpRequest();
    clustering3d.open("GET", folder + 'clustering3d.txt', false); //creates get request for the text files of clustering3d.txt
    clustering3d.onreadystatechange = function ()
    {
        if(clustering3d.readyState === 4)
        {
            if(clustering3d.status === 200 || clustering3d.status === 0)
            {
              var merging3d = new XMLHttpRequest();
              merging3d.open("GET", folder + 'merging3d.txt', false); //creates get request for the text files of merging3d.txt
              merging3d.onreadystatechange = function ()
              {
                  if(merging3d.readyState === 4)
                  {
                      if(merging3d.status === 200 || merging3d.status === 0)
                      {
                        var merging3dText = merging3d.responseText.split('\n');

                        for (var i = 1; i < merging3dText.length; i++) {
                          var line = merging3dText[i].split(';');

                          self.state.childToParent[line[0]] = line[1];
                        }
                      }
                  }
              }

              alert("Got Merging Data");
              merging3d.send(null);

              var clusters3d = new XMLHttpRequest();
              clusters3d.open("GET", folder + 'clusters3d.txt', false);
              clusters3d.onreadystatechange = function ()
              {
                  if(clusters3d.readyState === 4)
                  {
                      if(clusters3d.status === 200 || clusters3d.status === 0)
                      {
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

                        alert("Got ID to Level");

                        self.state.leveltoId = lvl;
                        self.setState({leveltoId: self.state.leveltoId});

                        // eslint-disable-next-line
                        for (var i = 0; i < self.state.leveltoId.length; i++) {
                         self.state.opacity.push(0.8); // sets opacity to 0.8 for every subplot
                        }

                        self.setState({opacity: self.state.opacity});

                        var x = [[[]]];
                        var y = [[[]]];
                        var z = [[[]]];

                        var clustering3dText = clustering3d.responseText;

                        // eslint-disable-next-line
                        for (var i = 2; i < clustering3dText.split('\n').length-1; i++) {
                          var arr = clustering3dText.split('\n')[i].split(' ');
                          if (arr[3] !== undefined) {
                            // eslint-disable-next-line
                            var id = arr[3].split(';')[1]

                            if (x[0][id] === undefined) {
                              x[0][id] = [];
                              y[0][id] = [];
                              z[0][id] = [];
                            }

                            x[0][id].push(arr[1]);
                            y[0][id].push(arr[2]);
                            z[0][id].push(arr[3].split(';')[0]);
                          }
                        }

                        alert("Got Initial Plot View");

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

                        alert("Generated All Plot Views");

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

                            if (idtoLvl[i] >= j) {
                              var trace = {
                                x: x[j][i], y: y[j][i], z: z[j][i],
                                mode: 'markers',
                                //legendgroup: 'Level ' + idtoLvl[i],
                                marker: {
                                  size: self.state.size,
                                  symbol: tempShape,
                                  color: tempColor,
                                  //color: "#"+((1<<24)*Math.random()|0).toString(16),
                                  line: {
                                    color: 'rgb(217, 217, 217)',
                                    width: 0.5
                                  },
                                  opacity: self.state.opacity
                                },
                                type: 'scatter3d',
                                name: tempName + ' ' + i + ' (Level ' + idtoLvl[i] + ')'
                              };

                              if (self.state.traces[j] === undefined) {
                                self.state.traces[j] = [];
                              }
                              self.state.traces[j].push(trace);
                            }
                          }
                        }

                        alert("Created Plot Traces");


                        self.setState({traces: self.state.traces});
                      }
                  }
              }
              clusters3d.send(null);

            }
        }
    }
    clustering3d.send(null);
  }

  componentDidMount() {
    this.updateWindowDimensions();
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
    for (var i = 0; i < this.state.leveltoId[event.target.id].length; i++) {
      if (this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]] !== undefined) {
        // eslint-disable-next-line
        this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]].marker.opacity = event.target.value;
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
    for (var i = 0; i < this.state.leveltoId[event.target.id].length; i++) {
      if (this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]] !== undefined) {
        // eslint-disable-next-line
        if (this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]].visible === "legendonly") {
          // eslint-disable-next-line
          this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]].visible = "true";
          event.target.innerText = "Hide Level " + event.target.id;
        } else {
          // eslint-disable-next-line
          this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]].visible = "legendonly";
          event.target.innerText = "Show Level " + event.target.id;
        }
      }
    }

    this.setState({traces: this.state.traces})
  }

  reset() {
    for (var i = 0; i < this.state.leveltoId.length; i++) {
      for (var j = 0; j < this.state.leveltoId[i].length; j++) {
        //console.log(this.state.traces[this.state.level]);
        if (this.state.traces[i][this.state.leveltoId[i][j]] !== undefined) {
          // eslint-disable-next-line
          this.state.traces[i][this.state.leveltoId[i][j]].marker.opacity = 0.8;
          // eslint-disable-next-line
          this.state.opacity[j] = 0.8;
        }
      }
    }

    this.setState({opacity: this.state.opacity});
    this.setState({size: 5});
    this.setState({level: 0});
  }

  render() {
    if ((this.state.traces[this.state.level] !== null || this.state.traces[this.state.level] !== []) && this.state.leveltoId !== [[]] && this.state.leveltoId !== undefined) {
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
            {
              lvltoId.map((lvltoId, index) =>
                <div key={index}>
                  <br/>
                  <button onClick={this.toggleLevel.bind(this)} id={index}>Hide Level {index}</button>
                </div>
              )
            }
            <br/>
            <br/>
            <button onClick={this.reset.bind(this)}>Reset</button>
            <br/>
            <br/>
            {/*<p>Created by Tanay Sonthalia</p>*/}
          </div>
        </div>
      );
    } else {
      return(null);
    }
  }
}

export default App;
