var map;
// var csvFileName = '../data/'+title+'.csv';
var OtoDDataMatrix;
var DtoODataMatrix;
var q = d3.queue();
var check = false;
var largestIndividualArray = [];
var selectZone = '101'; //default selectZone when you open the browser. 
var hoverZone; //mouse-over zone
var DtoOFileName= '../data/DtoO/'+DtoOFile;
var OtoDFileName = '../data/OtoD/'+OtoDFile;
q.defer(d3.text,OtoDFileName)
  .defer(d3.text,DtoOFileName)
  .await(brushMap);
function brushMap(error,OtoD,DtoO){
    OtoDDataMatrix = buildMatrixLookup(d3.csvParseRows(OtoD));
    DtoODataMatrix = buildMatrixLookup(d3.csvParseRows(DtoO));
    require([
      "esri/geometry/Polyline","esri/geometry/Extent","dojo/dom-construct",
      "esri/tasks/query","esri/dijit/Popup","esri/dijit/PopupTemplate",
      "dojo/dom-class","esri/dijit/BasemapToggle","esri/dijit/Legend",
      "esri/map", "esri/layers/FeatureLayer","esri/InfoTemplate", 
      "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
      "esri/renderers/ClassBreaksRenderer","esri/Color", "dojo/dom-style", "dojo/domReady!"
    ], function(Polyline,Extent,domConstruct,
      Query,Popup, PopupTemplate,
      domClass,BasemapToggle,Legend,
      Map, FeatureLayer,InfoTemplate, 
      SimpleFillSymbol,SimpleLineSymbol,
      ClassBreaksRenderer,Color, domStyle
    ) {
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
        //toggle the basemap
        var toggle = new BasemapToggle({
           map: map,
           basemap: "streets"
         }, "viewDiv");
         
         toggle.startup();
         
        var template = new InfoTemplate();

        //travelZonelayer
        
       var travelZonelayer = new FeatureLayer("https://services8.arcgis.com/FCQ1UtL7vfUUEwH7/arcgis/rest/services/newestTAZ/FeatureServer/0",{
           mode: FeatureLayer.MODE_SNAPSHOT,
           outFields: ["*"],

       });
        //LRT layer
        var lrtFeatureLayer = new FeatureLayer("https://services8.arcgis.com/FCQ1UtL7vfUUEwH7/arcgis/rest/services/LRT/FeatureServer/0",{
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
        });
        changeScale()
        map.on('load',function(){
            map.addLayer(travelZonelayer);
            map.addLayer(lrtFeatureLayer);
            legend.startup();
            travelZonelayer.redraw();
        });

        travelZonelayer.on('mouse-over',function(evt){
            var graphic = evt.graphic;
            hoverZone = graphic.attributes.TAZ_New;
            var access;
            if(check === false){
              access = OtoDDataMatrix[hoverZone];
            }
            else{
              access = DtoODataMatrix[hoverZone];
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

       //legend  
        $('#legendDiv').append('<div class="legendClass" id = "legendid" </div>');  
        var legend = new Legend({
          map: map,
          layerInfos: [{ layer: travelZonelayer, title: 'Legend' }]
        }, 'legendid');

        function pointToExtent (map, point, toleranceInPixel) {
          var pixelWidth = map.extent.getWidth() / map.width;
          var toleranceInMapCoords = toleranceInPixel * pixelWidth;
          return new Extent(point.x - toleranceInMapCoords,
                            point.y - toleranceInMapCoords,
                            point.x + toleranceInMapCoords,
                            point.y + toleranceInMapCoords,
                            map.spatialReference);
        }
    
        //'origin to destination' or 'destination to origin
        $("#interact").click(function(e, parameters) {
            if($("#interact").is(':checked')){
                check = true;
                $('#sliderNote').html("D&nbspto&nbspO");

                changeScale();
                travelZonelayer.redraw();  
            }
            else{
              check = false;
              $('#sliderNote').html("O&nbspto&nbspD");

              changeScale();
              travelZonelayer.redraw();

            }
        });
        function changeScale(){
              var symbol = new SimpleFillSymbol(); 
              var valueArray;
              if(check === false){
                valueArray =  Object.values(OtoDDataMatrix).sort(function(a, b){return a - b});  
              }
              else{
                valueArray =  Object.values(DtoODataMatrix).sort(function(a, b){return a - b});
              }
              var chunksize = 90;

              var renderer = new ClassBreaksRenderer(symbol, function(feature){
                //if 'var check' is false, then show origin to destination
                if(check === false){
            
                  return OtoDDataMatrix[feature.attributes.TAZ_New];
                }
                //else, destination to origin
                else{
                  //return dataMatrix[feature.attributes.TAZ_New][selectZone];
              
                    return DtoODataMatrix[feature.attributes.TAZ_New];
      
                  }
              });
              
              renderer.addBreak(-Infinity, valueArray[chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([255, 255, 255,0.90])));
              renderer.addBreak(valueArray[chunksize], valueArray[2*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([	249, 238, 237,0.90])));
              renderer.addBreak(valueArray[2*chunksize],valueArray[3*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([243, 224, 219,0.90])));
              renderer.addBreak(valueArray[3*chunksize],valueArray[4*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([237, 214, 202,0.90])));
              renderer.addBreak(valueArray[4*chunksize], valueArray[5*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([225, 200, 170,0.90])));
              renderer.addBreak(valueArray[5*chunksize],valueArray[6*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([213, 196, 141,0.90])));
              renderer.addBreak(valueArray[6*chunksize], valueArray[7*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([207, 197, 127,0.90])));
              renderer.addBreak(valueArray[7*chunksize],valueArray[8*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([201, 199, 113,0.90])));
              renderer.addBreak(valueArray[8*chunksize],valueArray[9*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([185, 195, 101,0.90])));
              renderer.addBreak(valueArray[9*chunksize],valueArray[10*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([168, 189, 88,0.90])));
              renderer.addBreak(valueArray[10*chunksize],valueArray[11*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([149, 183, 77,0.90])));
              renderer.addBreak(valueArray[11*chunksize],valueArray[12*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([129, 177, 66,0.90])));
              renderer.addBreak(valueArray[12*chunksize],valueArray[13*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([109, 171, 55,0.90])));
              renderer.addBreak(valueArray[13*chunksize], valueArray[14*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([87, 165, 45,0.90])));
              renderer.addBreak(valueArray[14*chunksize], valueArray[15*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([	66, 159, 36,0.90])));
              renderer.addBreak(valueArray[15*chunksize], valueArray[16*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([44, 153, 27,0.90])));
              renderer.addBreak(valueArray[16*chunksize], valueArray[17*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([	37, 121, 24,0.90])));
              renderer.addBreak(valueArray[17*chunksize], valueArray[18*chunksize], new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([11, 106, 18,0.90])));
              renderer.addBreak(valueArray[18*chunksize], Infinity, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.1]),1)).setColor(new Color([5, 80, 15,0.90])));
              travelZonelayer.setRenderer(renderer);      

              travelZonelayer.redraw();
            }
            
    });
}

//convert csv array into good format(zone-to-zone).
function buildMatrixLookup(arr) {    
  var lookup = {};
  for(var i in arr){
    lookup[arr[i][0]] = Number(arr[i][1]);
  }
  return lookup;
}
