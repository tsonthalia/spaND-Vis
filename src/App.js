import React from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      traces: [[]],
      size: 5,
      opacity: [0.8,0.8,0.8],
      level: 0,
      leveltoId: [[]],
      childToParent: [],
      x: [[[]]],
      y: [[[]]],
      z: [[[]]],
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    let self = this;

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", 'data/clustering3d.txt', false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
              var merging3d = new XMLHttpRequest();
              merging3d.open("GET", 'data/merging3d.txt', false);
              merging3d.onreadystatechange = function ()
              {
                  if(merging3d.readyState === 4)
                  {
                      if(merging3d.status === 200 || merging3d.status === 0)
                      {
                        var allText = merging3d.responseText.substr(13).split('\n');

                        for (var i = 0; i < allText.length; i++) {
                          var line = allText[i].split(';');

                          self.state.childToParent[line[0]] = line[1];
                        }
                      }
                  }
              }
              merging3d.send(null);

              var cluster3d = new XMLHttpRequest();
              cluster3d.open("GET", 'data/clusters3d.txt', false);
              cluster3d.onreadystatechange = function ()
              {
                  if(cluster3d.readyState === 4)
                  {
                      if(cluster3d.status === 200 || cluster3d.status === 0)
                      {
                        var id = [];
                        var lvl = [[]]; // Holds ID and corresponding levels
                        var mergeLvl = [];
                        var name = [];

                        var idtoLvl = [[]];

                        var allText = cluster3d.responseText.substr(21).split('\n');

                        for (var i = 0; i < allText.length-1; i++) {
                          var curr = allText[i].split(';')
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

                        self.state.leveltoId = lvl;
                        self.setState({leveltoId: self.state.leveltoId});

                        // for (var i = 0; i < lvl.length; i++) {
                        //   var xAtLvl = "";
                        //   var yAtLvl = "";
                        //   var zAtLvl = "";
                        //
                        //   for (var j = 0; j < lvl[i].length; j++) {
                        //     xAtLvl += x[lvl[i][j]] + ","
                        //     yAtLvl += y[lvl[i][j]] + ","
                        //     zAtLvl += z[lvl[i][j]] + ","
                        //   }
                        //
                        //   // var trace = {
                        //   //   x: xAtLvl.split(','), y: yAtLvl.split(','), z: zAtLvl.split(','),
                        //   //   mode: 'markers',
                        //   //   marker: {
                        //   //     size: self.state.size,
                        //   //     color: "#"+((1<<24)*Math.random()|0).toString(16),
                        //   //     line: {
                        //   //       color: 'rgb(217, 217, 217)',
                        //   //       width: 0.5
                        //   //     },
                        //   //     opacity: self.state.opacity
                        //   //   },
                        //   //   type: 'scatter3d',
                        //   //   name: 'Value ' + i
                        //   // };
                        //   //
                        //   // self.state.traces.push(trace);
                        // }

                        var x = [[[]]];
                        var y = [[[]]];
                        var z = [[[]]];

                        var allText = rawFile.responseText.substr(14);

                        for (var i = 0; i < allText.split('\n').length-1; i++) {
                          var arr = allText.split('\n')[i].split(' ');
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

                        for (var i = 1; i < lvl.length; i++) {
                          for (var j = x[i-1].length-1; j >= 0; j--) {
                            if (x[i] === undefined) {
                              x[i] = [[]];
                              y[i] = [[]];
                              z[i] = [[]];
                            }

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
                          }
                        }

                        self.state.x = x;
                        self.state.y = y;
                        self.state.z = z;

                        for (var j = 0; j < x.length; j++) {
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


                        self.setState({traces: self.state.traces});
                      }
                  }
              }
              cluster3d.send(null);

            }
        }
    }
    rawFile.send(null);
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
    console.log(event.target.id);

    for (var i = 0; i < this.state.leveltoId[event.target.id].length; i++) {
      if (this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]] !== undefined) {
        this.state.traces[this.state.level][this.state.leveltoId[event.target.id][i]].marker.opacity = event.target.value;
      }
    }

    this.state.opacity[event.target.id] = event.target.value;
    this.setState({opacity: this.state.opacity});
  }

  // changeOpacity0(event) {
  //   this.state.traces[0].marker.opacity = event.target.value;
  //
  //   this.state.opacity[0] = event.target.value;
  //   this.setState({opacity: this.state.opacity});
  // }
  //
  // changeOpacity1(event) {
  //   this.state.traces[1].marker.opacity = event.target.value;
  //
  //   this.state.opacity[1] = event.target.value;
  //   this.setState({opacity: this.state.opacity});
  // }
  //
  // changeOpacity2(event) {
  //   this.state.traces[2].marker.opacity = event.target.value;
  //
  //   this.state.opacity[2] = event.target.value;
  //   this.setState({opacity: this.state.opacity});
  // }

  changeLevel(event) {
    this.setState({level: event.target.value})


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
          <Plot
            data={this.state.traces[this.state.level]}
            layout={{width: this.state.width/4*3, height: (this.state.height)/6*5, title: 'spaND Visualization', showlegend: true, scene:{xaxis: {range:[0,10]}, yaxis: {range:[0,10]}, zaxis: {range:[0,10]}}}}
          />
          <div className="slidecontainer" style={{position:"absolute", marginLeft:(this.state.width)/4*3 + 100 + "px", marginTop:-(this.state.height)/6*5 + 100 + "px"}}>
            Level: {this.state.level}
            <br/>
            <input type="range" min="0" max={this.state.leveltoId.length-1} step="1" value={this.state.level} className="slider" id="myRange" onChange={this.changeLevel.bind(this)}/>
            <br/>
            <br/>
            Size: {this.state.size}
            <br/>
            <input type="range" min="1" max="10" value={this.state.size} className="slider" id="myRange" onChange={this.changeSize.bind(this)}/>
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
          </div>
        </div>
      );
    } else {
      return(null);
    }
  }
}

// Opacity of Level 0: {this.state.opacity[0]}
// <br/>
// <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[0]} className="slider" id="myRange" onChange={this.changeOpacity0.bind(this)}/>
// <br/>
// <br/>
// Opacity of Level 1: {this.state.opacity[1]}
// <br/>
// <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[1]} className="slider" id="myRange" onChange={this.changeOpacity1.bind(this)}/>
// <br/>
// <br/>
// Opacity of Level 2: {this.state.opacity[2]}
// <br/>
// <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[2]} className="slider" id="myRange" onChange={this.changeOpacity2.bind(this)}/>
// <br/>
// <br/>

export default App;
