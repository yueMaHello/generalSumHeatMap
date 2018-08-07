var map;
var geoJsonLayer1;
var SOV_AUTO_Time_AM_Cr_mf1 = '../data/'+title+'.csv';
var dataMatrix;
var popEmp;
var travelTypeDict = {};
var q = d3.queue();
var check = false;
var largestIndividualArray = [];
var sort = [];
var selectZone = '101'; //default
var hoverZone;
console.log(title+'.csv')
q.defer(d3.csv,SOV_AUTO_Time_AM_Cr_mf1).await(brushMap);
function brushMap(error,sov_auto_time){
    dataMatrix = buildMatrixLookup(sov_auto_time);
    require([
      "esri/geometry/Polyline",
      "esri/geometry/Extent",
      "dojo/dom-construct",
      "esri/tasks/query",
      "esri/dijit/Popup",
      "esri/dijit/PopupTemplate",
      "dojo/dom-class",
      "esri/dijit/BasemapToggle",
      "esri/dijit/Legend",
        "../externalJS/geojsonlayer.js",
        "esri/map", "esri/layers/FeatureLayer",
        "esri/InfoTemplate", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
        "esri/renderers/ClassBreaksRenderer",
        "esri/Color", "dojo/dom-style", "dojo/domReady!"
    ], function(Polyline,
      Extent,domConstruct,
      Query,Popup, PopupTemplate,domClass,BasemapToggle,Legend,
        GeoJsonLayer,Map, FeatureLayer,
        InfoTemplate, SimpleFillSymbol,SimpleLineSymbol,
        ClassBreaksRenderer,
        Color, domStyle
    ) {
        var connections = [];
        
        var popup = new Popup({  
          fillSymbol:
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 0, 0]), 2)
        }, domConstruct.create("div"));
  
        map = new Map("map", {
            basemap: "dark-gray-vector",
            center: [-113.4909, 53.5444],
            zoom: 9,
            minZoom:6,
            infoWindow: popup,
            slider: false
        });
        map.setInfoWindowOnClick(true);
        
        var toggle = new BasemapToggle({
           map: map,
           basemap: "streets"
         }, "viewDiv");
         
         toggle.startup();
         
        var template = new InfoTemplate();
        template.setContent(getTextContent);
      
        var featureLayer = new FeatureLayer("https://services8.arcgis.com/FCQ1UtL7vfUUEwH7/arcgis/rest/services/newestTAZ/FeatureServer/0?token=zwpope-UYmNeuAwyc7QdyY3CtnSR3zD05XyI45tDO27Xza7jjV6mY12x-jU6leaGFEN1DTvH092WhWyC5LmwHxpaVePomdQhkPd86OblRRtzO-LAzKP4mtjKJNEpS4XMpCYydXMlXN24O7H1MxUT99Ay_ztPJDRRU5ZO_uKZf-3IJDEEPVPSPTTYloiTYMGiMrup6UeuP_h4fhCFYtnHD2rzjAj2vRvBDSc5j0gIPIoi9iqMsBlkYatgXsV-gLj0",{
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            infoTemplate: template
        });
        featureLayer.on('click',function(evt){
            var graphic = evt.graphic;
            selectZone = graphic.attributes.TAZ_New;
            var query = new Query();
            query.geometry = pointToExtent(map, event.mapPoint, 10);
            var deferred = featureLayer.selectFeatures(query,
              FeatureLayer.SELECTION_NEW);
            map.infoWindow.setFeatures([deferred]);
            map.infoWindow.show(event.mapPoint);
            featureLayer.redraw();
        })
        featureLayer.on('mouse-over',function(evt){
            var graphic = evt.graphic;
            hoverZone = graphic.attributes.TAZ_New;
            var access;
            if(check === false){
              access = dataMatrix[selectZone][hoverZone];
            }
            else{
              access = dataMatrix[hoverZone][selectZone];
            }
            
            map.infoWindow.setTitle("<b>Zone Number: </b>"+hoverZone);
            if(typeof(access)!=='undefined'){
              map.infoWindow.setContent("<b><font size=\"3\"> Value:</font> </b>"+ "<font size=\"4\">"+access.toFixed(2)+"</font>");
            }
            else{
              map.infoWindow.setContent("<b><font size=\"3\"> Value:</font> </b>"+ "<font size=\"4\">"+'undefined'+"</font>");
            }
            map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
        });
        var accessibilityResult = [];
        largestIndividualArray = findRangeForIndividualCalcultion('what');
        sort = Object.values(largestIndividualArray).sort((prev,next)=>prev-next); //from smallest to largest
        var chunkZones = 89;        
        var symbol = new SimpleFillSymbol(); 
        var renderer = new ClassBreaksRenderer(symbol, function(feature){
          if(check === false){
            return dataMatrix[selectZone][feature.attributes.TAZ_New];
          }
          else{
            return dataMatrix[feature.attributes.TAZ_New][selectZone];
          }
       });
       // renderer.addBreak(-Infinity,0, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([153, 153, 153,0.90])));
       renderer.addBreak(0, sort[chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([255, 255, 255,0.90])));
       renderer.addBreak(sort[chunkZones], sort[2*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([	249, 238, 237,0.90])));
       renderer.addBreak(sort[2*chunkZones], sort[3*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([243, 224, 219,0.90])));
       renderer.addBreak(sort[3*chunkZones], sort[4*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([237, 214, 202,0.90])));
       renderer.addBreak( sort[4*chunkZones], sort[5*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([225, 200, 170,0.90])));
       renderer.addBreak( sort[5*chunkZones],  sort[6*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([213, 196, 141,0.90])));
       renderer.addBreak( sort[6*chunkZones],  sort[7*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([207, 197, 127,0.90])));
       renderer.addBreak(sort[7*chunkZones], sort[8*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([201, 199, 113,0.90])));
       renderer.addBreak(sort[8*chunkZones], sort[9*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([185, 195, 101,0.90])));
       renderer.addBreak(sort[9*chunkZones], sort[10*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([168, 189, 88,0.90])));
       renderer.addBreak(sort[10*chunkZones], sort[11*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([149, 183, 77,0.90])));
       renderer.addBreak(sort[11*chunkZones], sort[12*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([129, 177, 66,0.90])));
       renderer.addBreak(sort[12*chunkZones], sort[13*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([109, 171, 55,0.90])));
       renderer.addBreak(sort[13*chunkZones], sort[14*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([87, 165, 45,0.90])));
       renderer.addBreak(sort[14*chunkZones], sort[15*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([	66, 159, 36,0.90])));
       renderer.addBreak(sort[15*chunkZones], sort[16*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([44, 153, 27,0.90])));  
       renderer.addBreak(sort[16*chunkZones], sort[17*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([	37, 121, 24,0.90])));
       renderer.addBreak(sort[17*chunkZones], sort[18*chunkZones], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([11, 106, 18,0.90])));
       renderer.addBreak(sort[18*chunkZones], Infinity, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([5, 80, 15,0.90])));
       featureLayer.setRenderer(renderer);

    
        $('#legendDiv').append('<div class="legendClass" id = "legendid" </div>');  
        var legend = new Legend({
          map: map,
          layerInfos: [{ layer: featureLayer, title: 'Legend' }]
        }, 'legendid');
      
        map.on('load',function(){
            map.addLayer(featureLayer);
              legend.startup();
            featureLayer.redraw();
        });


        function pointToExtent (map, point, toleranceInPixel) {
          var pixelWidth = map.extent.getWidth() / map.width;
          var toleranceInMapCoords = toleranceInPixel * pixelWidth;
          return new Extent(point.x - toleranceInMapCoords,
                            point.y - toleranceInMapCoords,
                            point.x + toleranceInMapCoords,
                            point.y + toleranceInMapCoords,
                            map.spatialReference);
        }
        function getTextContent (graphic) {
          var speciesName = "<b>Value: </b><br/>" +
                          "<i>" + accessibilityResult[graphic.attributes.TAZ_New] + "</i>";
          return  speciesName;
        }
        $("#interact").click(function(e, parameters) {
        
            if($("#interact").is(':checked')){
                check = true;
                featureLayer.redraw();  
            }
            else{
              check = false;
              featureLayer.redraw();

            }
        });

    });


}

function buildMatrixLookup(arr) {    
    var lookup = {};
    var indexCol = Object.keys(arr[0]).filter(k => k.match(/\s+/) !== null);
    arr.forEach(row => {
        var idx = row[indexCol];
        delete row[indexCol];
        var newRow = {};
        for(var key in row){
            newRow[key] = parseFloat(row[key]);
        }
        lookup[idx] = newRow;
    });
    return lookup;
}


function findRangeForIndividualCalcultion(jobType){
  // var dict = {};
  // var TAZ = 0;
  // for(var k in popEmp){
  //         dict[popEmp[k]['New Zone']] = Number(popEmp[k][jobType]);
  // }
  // 
  //   // Create items array
  // var items = Object.keys(dict).map(function(key) {
  //   return [key, dict[key]];
  // });
  // 
  // // Sort the array based on the second element
  // items.sort(function(first, second) {
  //   return second[1] - first[1];
  // });
  // while(items[items.length-1][1] === 0){ // While the last element is a 0,
  //     items.pop();                  // Remove that last element
  // }
  // 
  // TAZ = items[parseInt(items.length/22)][0];
  // 
  // var largestIndividualArray = individualCaculation(travelTypeDict.A_AM,jobType,TAZ);
  
  // var maxValue=0;
  // var maxTaz=0;
  // 
  // for(var k in dataMatrix){
  //   for(var n in dataMatrix[k]){
  //     console.log(dataMatrix[k][n])
  //     break;
  //     if(dataMatrix[k][n]>maxValue){
  //       maxValue = n;
  //       maxTaz = k;
  //     }
  //   }
  // 
  // }
  // console.log(k)
  return dataMatrix['101'];
}
