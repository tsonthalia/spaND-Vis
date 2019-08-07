# spaND Documentation

This 3D visualization tool was created in order to provide a better understanding of sparsified nested dissection. It was meant to improve on a 2D version that was created using the Bokeh library.

This new 3D visualization tool is built using React.js and Plotly.js. The website is hosted through Firebase at [spand-vis.web.app](https://spand-vis.web.app/).

***

## Table of Contents
1. [Dependecies](#dependencies)
2. [Main Plot](#main-plot)
3. [Diagonal of R Plot](#diagonal-of-r-plot)
4. [Sidebar](#sidebar)
5. [Considerations](#considerations)
6. [Future Improvements](#future-improvements)
7. [Useful References](#useful-references)

***

<a name="dependencies"></a>
## Dependencies
<table>
  <tr>
    <th>Name</th>
    <th>Reason</th>
  </tr>
  <tr>
    <td><a href="https://www.npmjs.com/package/react">React.js</a></td>
    <td>
      <ul>
        <li>used as a basic framework for the spaND-Vis web app</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><a href="https://www.npmjs.com/package/react-plotly.js">React-Plotly.js</a></td>
    <td>
      <ul>
        <li>helps convert a plotly chart into a react module so that the chart can be added the the spaND-Vis code</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><a href="https://www.npmjs.com/package/plotly.js-gl3d-dist">Plotly.js-GL3D-Dist</a></td>
    <td>
      <ul>
        <li>allows the program to plot 2d scatterplots, 3d scatterplots, and 3d mesh plots</li>
        <li>a smaller custom package derived from the Plotly.js package</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><a href="https://www.npmjs.com/package/d3">D3</a></td>
    <td>
      <ul>
        <li>helps break down the input files much quicker than a standard XMLHTTPRequest</li>
        <li>requires the input file to be a csv</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><a href="https://www.npmjs.com/package/firebase-tools">Firebase CLI Tools</a></td>
    <td>
      <ul>
        <li>command line tools to deploy web app to Firebase Hosting</li>
      </ul>
    </td>
  </tr>
</table>

***

<a name="main-plot"></a>
## Main Plot
This plot shows all of the data points and will eliminate, merge, and sparsify the data until it reaches the final level. It is used to see how the data set changes as the level of spaND is changed.

* Click → toggles visibility of surface over the cluster that has been clicked on 
* Three-Fingers Movement → move around
* Two-Fingers Up/Down → zoom out/in respectively
* Two-Fingers Right/Left → rotates plot side-to-side

***

<a name="diagonal-of-r-plot"></a>
## Diagonal of R Plot
This plot shows how the rank changes over a number of “steps”.

* Click → isolates cluster that has been clicked on both Diagonal of R Plot and Main Plot
* Double Click → resets the Diagonal of R Plot
* Three-Fingers Movement → selects area to zoom into

***

<a name="sidebar"></a>
## Sidebar
<table>
  <tr>
    <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
    <th>&nbsp;Affected&nbsp;Plot(s)&nbsp;</th>
    <th>Description</th>
  </tr>
  
  <tr>
    <td>Level Slider</td>
    <td>Main Plot <br> Diagonal of R Plot</td>
    <td>
      <ul>
        <li>eliminates lower level points and merges higher level clusters as the level is changed</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Sparsify Slider</td>
    <td>Main Plot</td>
    <td>
      <ul>
        <li>sparsifies points using the Farthest-First Algorithm</li>
        <li>3 options
          <ul>
            <li>All Data → shows all of the data without any sparsification</li>
            <li>Before Sparsification → shows the data before the current level has been sparsified</li>
            <li>After Sparsification → shows the data after the current level has been sparsified</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Show Levels</td>
    <td>Main Plot <br> Diagonal of R Plot</td>
    <td>
      <ul>
        <li>the visibility of a specific level can be toggled by clicking the levels below</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Surfaces</td>
    <td>Main Plot</td>
    <td>
      <ul>
        <li>by using the adjacency list, the tool determines connections that form triangles and plots them using a 3d mesh plot</li>
        <li>user needs to input cluster number and click “Show Surface” to show that surface</li>
        <li>user must click on the surface name under “Click Surface to Remove” in order to remove a surface</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tolerance</td>
    <td>Diagonal of R Plot</td>
    <td>
      <ul>
        <li>draws tolerance line and tells the user how many points are above (on the left) and how many are below (on the right) for the lines that can be seen on the screen</li>
        <li>user must input tolerance value and click “Show Tolerance”</li>
        <li>user can view data by hovering over the end of the newly drawn tolerance line</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Marker Size Slider</td>
    <td>Main Plot</td>
    <td>
      <ul>
        <li>slider value determines marker size of each point</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Opacity Slider(s)</td>
    <td>Main Plot</td>
    <td>
      <ul>
        <li>slider value determines opacity of each level</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Diagonal of R Plot Button</td>
    <td>Diagonal of R Plot</td>
    <td>
      <ul>
        <li>toggles visibility of the Diagonal of R Plot</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Reset Button</td>
    <td>Main Plot <br> Diagonal of R Plot</td>
    <td>
      <ul>
        <li>resets everything to its starting position</li>
      </ul>
    </td>
  </tr>
</table>

***

<a name="considerations"></a>
## Considerations
There are certain considerations to this tool that a user should be aware of before using it.

The tool...
* cannot smoothly handle datasets larger than 80,000 points
* takes a great deal of time while starting up and completing a memory-heavy process
  * most of this time is not spent on the calculations, but rather the rendering of the plot, which is an issue on the react-plotly package side
  * the screen will also usually freeze during this period of time, but it becomes normal as soon as the new data and plots are rendered
* requires a great deal of memory, especially when in production mode (before you run npm run build)
  * memory usage significantly decreases once in development mode
* may have an axis-ratio that isn’t 1:1:1
  * the axis-ratio was probably changed in order to make it easier to see a unique dataset with a compressed point distribution
  * make sure to fix the axis ratio when adding custom data
    * it can be changed by going into App.js → render() → Plot → layout → scene and changing the aspect ratio
* requires certain data files with specific names when being run
  * adjacency.csv
  * coordinates.csv
  * clustering3d.csv
  * merging3d.csv
  * clusters3d.txt
  * stats3d.txt

***

<a name="future-improvements"></a>
## Future Improvements
* more efficient
  * as noted in the “Considerations” section, the tool can be quite slow when rendering (although this seems to be an issue with the react-plotly package, there may be some solution to make the tool more efficient from our side)
* loading bar
  * this could help the user know that some sort of process is happening even though they may just think that the screen is frozen
* any unknown bugs
  * there may be some bugs that I was unable to catch during my testing
* convert all input files to csv format in order to eliminate the need for any XMLHTTPRequests

***

<a name="useful-references"></a>
## Useful References
<table>
  <tr>
    <th>Name</th>
    <th>Link</th>
  </tr>
  
  <tr>
    <td rowspan="2">spaND-Vis</td>
    <td>https://spand-vis.web.app/</td>
  </tr>
  
  <tr>
    <td>https://github.com/tsonthalia/spaND-Vis</td>
  </tr>
  
  <tr>
    <td rowspan="2">spaND Algorithm</td>
    <td>https://arxiv.org/abs/1901.02971</td>
  </tr>
  
  <tr>
    <td>https://github.com/buzzlumberjack/spaND</td>
  </tr>
  
  <tr>
    <td rowspan="2">Plotly.js</td>
    <td>https://plot.ly/javascript/</td>
  </tr>
  
  <tr>
    <td>https://github.com/plotly/plotly.js</td>
  </tr>
  
  <tr>
    <td rowspan="3">React.js</td>
    <td>https://reactjs.org/</td>
  </tr>
  
  <tr>
    <td>https://github.com/facebook/react</td>
  </tr>
  
  <tr>
    <td>https://www.npmjs.com/package/react</td>
  </tr>
  
  <tr>
    <td rowspan="3">React-Plotly.js</td>
    <td>https://plot.ly/javascript/react/</td>
  </tr>
  
  <tr>
    <td>https://github.com/plotly/react-plotly.js/</td>
  </tr>
  
  <tr>
    <td>https://www.npmjs.com/package/react-plotly.js</td>
  </tr>
  
  <tr>
    <td rowspan="2">Plotly.js-GL3D-Dist</td>
    <td>https://github.com/plotly/plotly.js/tree/master/src/plots/gl3d</td>
  </tr>
  
  <tr>
    <td>https://www.npmjs.com/package/plotly.js-gl3d-dist</td>
  </tr>
  
  <tr>
    <td rowspan="3">D3</td>
    <td>https://d3js.org/</td>
  </tr>
  
  <tr>
    <td>https://github.com/d3/d3</td>
  </tr>
  
  <tr>
    <td>https://www.npmjs.com/package/d3</td>
  </tr>
  
  <tr>
    <td rowspan="2">Firebase Hosting</td>
    <td>https://firebase.google.com/docs/hosting</td>
  </tr>
  
  <tr>
    <td>https://www.npmjs.com/package/firebase-tools</td>
  </tr>
  
  <tr>
    <td>Farthest-First Traversal</td>
    <td>https://en.wikipedia.org/wiki/Farthest-first_traversal</td>
  </tr>
  
  <tr>
    <td>Adjacency List</td>
    <td>https://en.wikipedia.org/wiki/Adjacency_list</td>
  </tr>
</table>
