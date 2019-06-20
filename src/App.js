import React from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      traces: [],
      size: 5,
      opacity: [0.8,0.8,0.8],
      level: 0,
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


              var x = [[]];
              var y = [[]];
              var z = [[]];

              var allText = rawFile.responseText.substr(14);

              for (var i = 0; i < allText.split('\n').length-1; i++) {
                var arr = allText.split('\n')[i].split(' ');
                var id = arr[3].split(';')[1]

                if (x[id] === undefined) {
                  x[id] = [];
                  y[id] = [];
                  z[id] = [];
                }

                x[id].push(arr[1]);
                y[id].push(arr[2]);
                z[id].push(arr[3].split(';')[0]);
              }

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

                        var allText = cluster3d.responseText.substr(21).split('\n');

                        for (var i = 0; i < allText.length-1; i++) {
                          var curr = allText[i].split(';')
                          if (lvl[curr[1]] === undefined) {
                            lvl[curr[1]] = [];
                          }

                          lvl[curr[1]].push(curr[0]);
                          mergeLvl.push(curr[2]);
                          name.push(curr[3]);
                        }

                        for (var i = 0; i < lvl.length; i++) {
                          var xAtLvl = "";
                          var yAtLvl = "";
                          var zAtLvl = "";

                          for (var j = 0; j < lvl[i].length; j++) {
                            xAtLvl += x[lvl[i][j]] + ","
                            yAtLvl += y[lvl[i][j]] + ","
                            zAtLvl += z[lvl[i][j]] + ","
                          }

                          var trace = {
                            x: xAtLvl.split(','), y: yAtLvl.split(','), z: zAtLvl.split(','),
                            mode: 'markers',
                            marker: {
                              size: self.state.size,
                              color: "#"+((1<<24)*Math.random()|0).toString(16),
                              line: {
                                color: 'rgb(217, 217, 217)',
                                width: 0.5
                              },
                              opacity: self.state.opacity
                            },
                            type: 'scatter3d',
                            name: 'Value ' + i
                          };

                          self.state.traces.push(trace);
                        }
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
    for (var i = 0; i < this.state.traces.length; i++) {
      // eslint-disable-next-line
      this.state.traces[i].marker.size = event.target.value
    }

    this.setState({size: event.target.value});
  }

  changeOpacity0(event) {
    this.state.traces[0].marker.opacity = event.target.value;

    this.state.opacity[0] = event.target.value;
    this.setState({opacity: this.state.opacity});
  }

  changeOpacity1(event) {
    this.state.traces[1].marker.opacity = event.target.value;

    this.state.opacity[1] = event.target.value;
    this.setState({opacity: this.state.opacity});
  }

  changeOpacity2(event) {
    this.state.traces[2].marker.opacity = event.target.value;

    this.state.opacity[2] = event.target.value;
    this.setState({opacity: this.state.opacity});
  }

  changeLevel(event) {
    this.setState({level: event.target.value})
  }

  render() {
    if (this.state.traces !== null || this.state.traces !== []) {
      var data = [];

      for (var i = this.state.level-1; i < this.state.traces.length*2-1; i++) {
        if (i%2 === 0) {
          data.push(this.state.traces[i/2])
        }
      }

      return (
        <div>
          <Plot
            data={data}
            layout={{width: this.state.width/4*3, height: (this.state.height)/6*5, title: 'A Lot of Data', showlegend: true}}
          />
          <div className="slidecontainer" style={{position:"absolute", marginLeft:(this.state.width)/4*3 + 100 + "px", marginTop:-(this.state.height)/6*5 + 100 + "px"}}>
            Size: {this.state.size}
            <br/>
            <input type="range" min="1" max="10" value={this.state.size} className="slider" id="myRange" onChange={this.changeSize.bind(this)}/>
            <br/>
            <br/>
            Opacity of Level 0: {this.state.opacity[0]}
            <br/>
            <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[0]} className="slider" id="myRange" onChange={this.changeOpacity0.bind(this)}/>
            <br/>
            <br/>
            Opacity of Level 1: {this.state.opacity[1]}
            <br/>
            <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[1]} className="slider" id="myRange" onChange={this.changeOpacity1.bind(this)}/>
            <br/>
            <br/>
            Opacity of Level 2: {this.state.opacity[2]}
            <br/>
            <input type="range" min="0.1" max="1" step="0.1" value={this.state.opacity[2]} className="slider" id="myRange" onChange={this.changeOpacity2.bind(this)}/>
            <br/>
            <br/>
            Level: {this.state.level}
            <br/>
            <input type="range" min="0" max={(this.state.traces.length * 2) - 1} step="1" value={this.state.level} className="slider" id="myRange" onChange={this.changeLevel.bind(this)}/>
          </div>
        </div>
      );
    } else {
      return(null);
    }
  }
}

export default App;
