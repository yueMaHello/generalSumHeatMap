# General Static Heatmap
This is a Nodejs web application using Arcgis Javascript API. It is a simple tool which can be modified to display any 'zone,value' vector.
## Set Up:
#### From Github:
1. If you haven't downloaded Nodejs on your computer, you need to download it and add it into PATH.
2. Download this folder
3. Browse to the root of the folder
4. Open the terminal/cmd and go to the root of the App './generalSumHeatmap'. 
5. Type 'npm install'
6. Type 'npm intall express --save'
7. Type 'npm install http-errors --save'
8. Type 'npm install fs --save'
9. Put your csv data into './public/data' folder. You can see the orginal data is provided.
10. The data must have the same format as the example data located in './public/data/OtoD' and './public/data/DtoO'. Details about replace dataset will be discussed in 'Tips' section
#### From Lab Computer I
1. Everything has been set up on Computer I
2. Put your csv data into './public/data' folder. You can see the orginal data is provided.
3. The data must have the same format as the example data located in './public/data/OtoD' and './public/data/DtoO'. Details about replace dataset will be discussed in 'Tips' section
## Run
1. Use terminal/cmd to go to the root of the App './generalSumHeatmap'. 
2. Type 'npm start'
2. Browse 'http://localhost:3039' or http://162.106.202.155:3039/

## Tips:
#### If you want to replace the current dataset:
 1. In the './public/data' folder, you can find two subfolders ('./DtoO' and './OtoD'). You should put your newest dataset into these two subfolders. If it is an 'Origin to Destination' file, you should put it into './OtoD' folder. If it is a 'Destination to Origin' file, you should put it into './DtoO' folder. You should not change the dataset format (no header row in the CSV file).
 2. You may observe that the dataset name in the example is 'test_D.csv' and 'test_O.csv'. It means you should also follow this naming rule. The app will renew its name based on the csv file you provide, for example, if you put 'Logsum_D.csv' file into './public/data/DtoO' folder, the app will treat 'Logsum' as its name. The dash line '_' in the name is very important, please don't miss it.  
 3. After you change the dataset, you should go to the terminal, terminate it if it is running, and rerun it by typing 'npm start'. If you forget to do this step, the app will run into error.
 4. Only one csv file is allowed in each subfolders.
 
#### If you want to make another new App renderring a new csv file at another port other than '3039':
 1. Copy and paste all the content into a new folder
 2. Open './generalSumHeatMap/bin/www.js' file, and search for '3039'
 3. Simply change '3039' to another four-digits number (5025, 4022 or such).
 4. Then, just follow the procedure in the 'Run' section.
 5. If you are blocked or meet error after typing 'npm start', most probably, the port you change in 'www.js' has already been occupied by another app. Please change to another port number in './generalSumHeatMap/bin/www.js'.

#### If you want to update the TravelZoneLayer shape file:
 1. The map layer is not stored in localhost. It is stored in the arcgis online server.
 2. In './public/javascript/test.js', you can find the current travel zone layer: 'https://services8.arcgis.com/FCQ1UtL7vfUUEwH7/arcgis/rest/services/newestTAZ/FeatureServer/0'. If you want to change it to another layer, you can create you own arcgis online account and upload the layer to the arcgis server. You need to replace the url into a new one. You can also ask Sandeep to access Yue Ma's arcgis account.
 
#### If you want to change the legend:
1. Open './public/javascripts/test.js' file, search 'readerer.addBreak' to show that part of code.
2. Right now, the break points all are calculated based on data of zone[101]. It can adjust the legend to suit different dataset. If you want to change the break points, you could just manually change 'sort[chunkZone]' to some specific value. 
      For exampe:
      * renderer.addBreak(0, 70, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([255, 255, 255,0.90])));
      * renderer.addBreak(70, 150, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([249, 238, 237,0.90])));
      
#### If you want to change the legend color:
1. Open './public/javascripts/test.js' file, search 'readerer.addBreak' to show that part of code.
2. Change 'new Color([255, 255, 255,0.90])' to some other RGB color.
      
#### Woops, the App can't run after changing a new dataset:
 1. You need to restart the server from terminal/cmd (Rerun 'npm start').
