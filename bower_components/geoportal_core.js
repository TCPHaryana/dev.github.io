///////////////////////////////////////////////////////////////
map = L.map("map", {
    zoom: 8,
    center: [29.5, 76.0856],
    maxZoom: 24,
    //layers: [markerClusters, highlight],
    tap: false,
    zoomControl: false
    //drawControl: !1,
    //attributionControl: "TCP"
});
////define Drawing toolbar options
//
var options = {
    position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
    drawMarker: true, // adds button to draw markers
    drawPolyline: true, // adds button to draw a polyline
    drawRectangle: true, // adds button to draw a rectangle
    drawPolygon: true, // adds button to draw a polygon
    drawCircle: true, // adds button to draw a cricle
    drawControls: true,
    drawCircleMarker: false,
    editControls: true,
    optionsControls: true,
    customControls: true,
    rotateMode: true,
    oneBlock: false,
    pmIgnore: true,
    cutPolygon: true, // adds button to cut a hole in a polygon
    editMode: true, // adds button to toggle edit mode for all layers
    removalMode: true, // adds a button to remove layers
    snappingOption: true,
    splitMode: true,
    showMeasurements: true,
    showOnHover: true,
    showTooltip: true,
    scaleMode: true

};
//// add leaflet.pm controls to the map
//map.pm.controlsVisible();
//
map.pm.addControls(options);
pmColor = new L.PMColor(map);
//map.pm.setGlobalOptions({ snappable: false }); 
map.pm.removeControls(false);
map.pm.setLang('en');


//map = L.map("map", { center: [29.3, 76.0856], zoomControl: !1, drawControl: !1, maxZoom: 22, zoom: 8 });
//
layercontrol = new L.Control.AccordionLegend({
    position: "topright",
    title: "Layer Panel",
    content: LAYERS_AND_LEGENDS
}).addTo(map);

var layer,
        geojsonlay,
        selectedRevenue = [],
        flag = !1,
        districtName = "";

// FeatureGroup is to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
    position: 'topleft',
    draw: {
        polyline: true,
        polygon: {
            allowIntersection: false, // Restricts shapes to simple polygons 
            drawError: {
                color: '#e1e100', // Color the shape will turn when intersects 
                message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect 
            }
        },
        circle: true, // Turns off this drawing tool 
        rectangle: true,
        marker: true
    },
    edit: {
        featureGroup: drawnItems
    }
});
//map.addControl(drawControl);
layercontrol.expandUI("Layer Panel").toggleLayer("District Boundary", !0).toggleLayer("Google Satellite", !0);

//add coordinates standard controls
coordinates_text = L.control.coordinates().addTo(map);
// Control 2: This add a scale to the map
Better_Scale = L.control.betterscale({position: "bottomright"}).addTo(map);
Sidebar = L.control.sidebar('side-bar').addTo(map);
Easy_button = L.easyButton('fa-solid fa-magnifying-glass fa-2x', function () {Sidebar.toggle();}).addTo(map);
var zoom_bar = new L.Control.ZoomBar({position: 'bottomright'}).addTo(map);
var lc = L.control.locate({
    position: 'bottomright',
    strings: {title: "Show me where I am, yo!"},
    showPopup: true,
    locateOptions: {enableHighAccuracy: true}
}).addTo(map);


var style = {
            color: 'red',
            opacity: 1.0,
            fillOpacity: 1.0,
            weight: 2,
            clickable: false
        };
        L.Control.FileLayerLoad.LABEL = '<img class="icon" src="folder.svg" alt="file icon"/>';
        control = L.Control.fileLayerLoad({
            fitBounds: true,
            layerOptions: {
                style: style,
                pointToLayer: function (data, latlng) {
                    return L.circleMarker(
                        latlng,
                        { style: style }
                    );
                }
            }
        });
control.addTo(map);
 /*
    =============================================================================
    Open Editable Popup
    =============================================================================
    */

    map.on('draw:created', function (event) {
      var layer = event.layer,
          feature = layer.feature = layer.feature || {}; // Intialize layer.feature
          feature.type = feature.type || "Feature"; // Intialize feature.type
      var props = feature.properties = feature.properties || {}; // Intialize feature.properties
      props.title = "my title";
      props.content = "my content";
      var idIW = L.popup();
      var content = '<span><b>Name</b></span><br/>\n\
                    <input id="shapeName" type="text"/><br/><br/><span><b>Description<b/></span><br/><textarea id="shapeDesc" cols="25" rows="5"></textarea><br/><br/><input type="button" id="okBtn" value="Save" onclick="saveIdIW()"/>';
      idIW.setContent(content);
      idIW.setLatLng(layer.getLatLng());
      idIW.openOn(map);
      drawnItems.addLayer(layer);
  });


function saveIdIW() {
        var sName = $('#shapeName').val();
        var sDesc = $('#shapeDesc').val();
        var drawings = drawnItems.getLayers(); //drawnItems is a container for the drawn objects
        drawings[drawings.length - 1].title = sName;
        drawings[drawings.length - 1].content = sDesc;
        map.closePopup();
};
 
var saveButton = L.easyButton('fa-save', function(btn, map){
            // Extract GeoJson from drawnItems 
            var data = drawnItems.toGeoJSON();
            // Stringify the GeoJson
            var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
// Create export
 // document.getElementById('export').setAttribute('href', 'data:' + convertedData);
 // document.getElementById('export').setAttribute('download', 'drawnItems.geojson');
            $.ajax({
                type: 'POST',
                url: "data/markers.geojson",   //url of receiver file on server
                data: convertedData,           //data container
                success: function(data) {
                    alert(data);
                },                              //callback when ajax request finishes
                dataType: "json"                    
              });
}).addTo(map);