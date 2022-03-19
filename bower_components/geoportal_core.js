
map = L.map("map", { center: [29.3, 76.0856], zoomControl: !1, maxZoom: 22, zoom: 8 });


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
var drawnItems = new L.FeatureGroup();

layercontrol.expandUI("Layer Panel").toggleLayer("District Boundary", !0).toggleLayer("Google Satellite", !0);
//add coordinates standard controls
coordinates_text = L.control.coordinates().addTo(map);
// Control 2: This add a scale to the map
Better_Scale = L.control.betterscale({position: "bottomright"}).addTo(map);
Sidebar = L.control.sidebar('side-bar').addTo(map);
Easy_button = L.easyButton('fa-solid fa-magnifying-glass fa-2x', function () {Sidebar.toggle();}).addTo(map);
var zoom_bar = new L.Control.ZoomBar({position: 'bottomright'}).addTo(map);

new L.HistoryControl({
    maxMovesToSave: 100
}).addTo(map);




