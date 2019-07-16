# Data

## Adding Custom data
Go to _**public/data**_ and create a new folder.

Add the new data into the new folder. Remember, the following 4 files should be present:
* _clustering3d.csv_
* _coordinates.csv_
* _adjacency.csv_
* _clusters3d.txt_
* _merging3d.txt_
* _stats3d.txt_

After this is complete, open up _**src/App.js**_ and look for the variable _**folder**_.

Change the value of _**folder**_ to`data/<new_folder_name>`( e.g.`folder: data/newFolder`).

Run the program, and the new data will be used!

***

## Naming Your Data

### Part 1 - Type of Data
The first part represents the name of the type of data set (e.g. M = modeled, A = Aquifer)

### Part 2 - Number of Points
The next part represents the number of data points in thousands in the data set (e.g. 50 = 50,000 points)

### Part 3 - Number of Levels
The last part represents the number of levels in the data set (e.g. 10 = 10 levels)
