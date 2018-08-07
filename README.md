# General Heatmap
This is a Nodejs web application using Arcgis Javascript API. It is a simple tool which can be modified to display any zone-to-zone matrix.
## Set Up
1. Download this folder
2. Browse to the root of the folder
3. Open the terminal and run 'npm install'
4. 'npm intall express --save'
5. 'npm install http-errors --save'
6. 'npm install fs --save'
7. Put your csv data into './public/data' folder. The data should be a zone-to-zone matrix. You can name the csv file to anything you want, and the App will show you a title with that csv file name. For example, if you put 'Auto Travel.csv' into the data folder, then the App will be named as 'Auto Travel' when browsing it.
8. The data must have the same format as the example data located in './public/dataExample/Auto Time.csv'. If you browse the csv file through Excel, [0,0] should be empty, but not something like 'z/z'. If your [0,0] is not empty, you have to manually delete it.

## Run
1. 'npm start'
2. Browse to 'https://localhost:3033'





