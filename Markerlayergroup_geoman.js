/* Overlay Layers 'geoitanalytics:Village_Point', */

/* global layerswitcher */

var markers = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    //disableClusteringAtZoom: 16
});



/* Overlay Layers */
var highlight = L.geoJson(null);


var highlight = L.geoJson(null);

var highlightStyle = {
    stroke: false,
    fillColor: "#00FFFF",
    fillOpacity: 0.7,
    radius: 10
};

//var markerClusters = new L.MarkerClusterGroup(null);
/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    //disableClusteringAtZoom: 18
});

/* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
var theaterLayer = L.geoJson(null);
var theaters = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        var title = feature.properties.Applicatio;
        var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>NOC7A ID</th><td>" + feature.properties.Applicatio + "</td></tr>" + "<tr><th>District</th><td>" + feature.properties.District + "</td></tr>" + "<tr><th>Grant Date</th><td>" + feature.properties.GrantDate + "</td></tr>" + "<tr><th>Killa No</th><td>" + feature.properties.KillaNo + "</td></tr>" + "<table>";
       var  marker= L.marker(latlng, { title: feature.properties.District, riseOnHover: true });
        marker.bindPopup(content);
        markers.addLayer(marker);
    }
    //onEachFeature: function (feature, layer) {
    //    if (feature.properties) {
    //        var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.enfID + "</td></tr>" + "<tr><th>Hadbast No</th><td>" + feature.properties.District + "</td></tr>" + "<tr><th>Distict Name</th><td>" + feature.properties.Dist_Code + "</td></tr>" + "<tr><th>Rev Code</th><td>" + feature.properties.Rev_Code + "</td></tr>" + "<table>";
    //        layer.on({
    //            click: function (e) {
    //                $("#feature-title").html(feature.properties.enfID);
    //                $("#feature-info").html(content);
    //                $("#featureModal").modal("show");
    //                //highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
    //            }
    //        });
    //        //$("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="Scripts/bootleaf/assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.Name_Rev_E + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
    //        //theaterSearch.push({
    //        //    name: layer.feature.properties.Name_Rev_E,
    //        //    address: layer.feature.properties.Name_Censu,
    //        //    source: "Theaters",
    //        //    id: L.stamp(layer),
    //        //    lat: layer.feature.geometry.coordinates[1],/Scripts/dashboardgeojson/Revestate1.geojson
    //        //    lng: layer.feature.geometry.coordinates[0]
    //        //});
    //    }
    //}
});


$.getJSON("/geoScripts/dashboardgeojson/noc7a.geojson", function (data) {
    theaters.addData(data);
//    map.addLayer(theaterLayer);
});
//////////////////////////////////////////////////
/* Empty layer placeholder to add to layer control for listening when to add/remove museums to markerClusters layer */
var museumLayer = L.geoJson(null);
var museums = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: "/geoScripts/bootleaf/assets/img/museum.png",
                iconSize: [24, 28],
                iconAnchor: [12, 28],
                popupAnchor: [0, -25]
            }),
            title: feature.properties.Case_ID,
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Case_ID + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.Use + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.Owner + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
            layer.on({
                click: function (e) {
                    $("#feature-title").html(feature.properties.Case_ID);
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");

                }
            });

        }
    }
});
$.getJSON("/geoScripts/dashboardgeojson/CLU_boundary.geojson", function (data) {
   // var test = data.toGetJSON() // make a Feature Collection
   // centroid = turf.centroid(data); // takes a Feature Collection
    museums.addData(data);

});



/////////////////////////////////////////////////////////////
map = L.map("map", {
    zoom: 8,
    center: [29.5, 76.0856],
    maxZoom: 24,
    layers: [markerClusters, highlight],
    tap: false,
    zoomControl: false
    //attributionControl: "TCP"
});
//define Drawing toolbar options

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


// add leaflet.pm controls to the map
//map.pm.controlsVisible();

map.pm.addControls(options);
pmColor = new L.PMColor(map);
//map.pm.setGlobalOptions({ snappable: false }); 
map.pm.removeControls(false);
map.pm.setLang('en');
//

//// enable polygon Draw Mode
//map.pm.enableDraw('Polygon', {
//    snappable: true,
//    snapDistance: 20,
//});

//// disable Draw Mode
//map.pm.disableDraw();
//map.pm.setGlobalOptions({
//    measurements: { measurement: true, displayFormat: 'metric', showTooltip: true, area:true },

//});



/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
    highlight.clearLayers();
});
/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function (e) {
    if (e.layer === theaterLayer) {
        markerClusters.addLayer(theaters);
    }
    if (e.layer === museumLayer) {
        markerClusters.addLayer(museums);
    }
});

map.on("overlayremove", function (e) {
    if (e.layer === theaterLayer) {
        markerClusters.removeLayer(theaters);
    }
    if (e.layer === museumLayer) {
        markerClusters.removeLayer(museums);
    }
});



/* Larger screens get expanded layer control and visible sidebar */
//if (document.body.clientWidth <= 767) {
//    var isCollapsed = true;
//} else {
//    var isCollapsed = false;
//}

var baseLayers = {

};

var groupedOverlays = {
    "Marker Cluster Group": {
        "<img src='/geoScripts/bootleaf/assets/img/marker-icon.png' width='24' height='28'>&nbsp; Controlled Area": theaterLayer,
        "<img src='/geoScripts/bootleaf/assets/img/museum.png' width='24' height='28'>&nbsp;Development Plan": museumLayer
    }
};

//var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
//    position: "bottomleft"
//}).addTo(map);



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
    
layercontrol.expandUI("Layer Panel").toggleLayer("District Boundary", !0).toggleLayer("Google Satellite", !0);


//add browserPrint standard controls
//L.control.browserPrint().addTo(map);
//L.control.browserPrint({
//    //printLayer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
//    //    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//    //    subdomains: 'abcd',
//    //    minZoom: 1,
//    //    maxZoom: 16,
//    //    ext: 'png'
//    //}),
//    printModes: ["Landscape"],
//    manualMode: true // use true if it's debug and/or default button is okay for you, otherwise false.
//}).addTo(map);

//document.querySelector("#custom_print_button").addEventListener("click", function () {
//    //var modeToUse = L.control.browserPrint.mode.auto();
//    //map.printControl.print(modeToUse);
//});
/////////////////// Zoom Bar///////////////////



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
//map.addControl(L.control.locate({
//    locateOptions: {enableHighAccuracy: true}
//}));
//var locate = L.geolet({position: 'bottomright'}).addTo(map);
//History_Control= new L.HistoryControl().addTo(map);
//zoom_bar = new L.Control.ZoomBar({position: "bottomleft"}).addTo(map);
//////////////////////////////////////////////////
//L.Control.fileLayerLoad({
//    // Allows you to use a customized version of L.geoJson.
//   // For example if you are using the Proj4Leaflet leaflet plugin,
//    // you can pass L.Proj.geoJson and load the files into the
//    // L.Proj.GeoJson instead of the L.geoJson.
//    layer: L.geoJson,
//  
//    layerOptions: { style: { color: 'red' } },
//    // Add to map after loading (default: true) ?
//    //addToMap: true,
//    // File size limit in kb (default: 1024) ?
//    fileSizeLimit: 1024,
//    // Restrict accepted file formats (default: .geojson, .json, .kml, and .gpx) ?
//    formats: [
//        '.geojson',
//        '.kml'
//    ]
//}).addTo(map);

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


//////////////////////////////////////////////////////
//loadWFS("geoitanalytics:RevEstate_Boundary", "EPSG:4326");
//
////var markers = L.markerClusterGroup({ chunkedLoading: true });
//function loadWFS(layerName, epsg) {
//    var urlString = "https://mis.tcpharyana.gov.in/geoserver/geoitanalytics/ows/";
//    var param = {
//        service: 'WFS',
//        version: '1.0.0',
//        request: 'GetFeature',
//        typeName: layerName,
//        //contentType: "application/json; charset=utf-8",
//        outputFormat: "application/json",
//        maxFeatures: 200,
//        srsName: epsg
//    };
//    var u = urlString + L.Util.getParamString(param, urlString);
//   //console.log(u);
//  // urls = turf.center(u);
//   
//    $.ajax({
//        url: u,
//        dataType: 'json',
//        success: loadWfsHandler,
//        jsonpCallback: 'parseResponse'
//            });
//    function loadWfsHandler(data) {
//        //console.log(data);
//        //a = turf.union(data.features.geometry);
//      //  data = turf.centroid(data);
//        layer = L.geoJson(data, {
//            pointToLayer: function (feature, latlng) {
//                var title = feature.properties.Name_Census;
//   
//                //var marker = L.marker(L.latLng 
//                //    title: feature.properties.Name_Census,
//                //    riseOnHover: true));
//
//                //L.marker([lat, lon]).addTo(map);
//                var marker = L.marker(latlng, { title: feature.properties.Name_Census, riseOnHover: true });
//                //var marker = L.marker(L.latLng(feature.properties.X, feature.properties.Y));
//                    marker.bindPopup(title);
//                    markers.addLayer(marker);
//            }
//        })
//
//    }
//}
//map.addLayer(markers);
///////////////////////////////////////////////



////////////////////////////////////////////////

//control.loader.on('load', function (event) {
//    // event.layer gives you access to the layers you just uploaded!
//
//    // Add to map layer switcher
//    layerswitcher.addOverlay(event.layer, event.filename);
//});
/////////////////////////////////////////////////////////////////
//map.on("zoomend", function () {
//    var e = map.getZoom();
//    e < 14 && layercontrol.toggleLayer("Rectangle Boundary", !1).toggleLayer("Khasra Boundary", !1).toggleLayer("Khasra Number (Label)", !1).toggleLayer("Rectangle Number (Label)", !1).toggleLayer("Roads RoW", !1),
//        e >= 14 && layercontrol.toggleLayer("Rectangle Boundary", !1).toggleLayer("Khasra Boundary", !1).toggleLayer("Khasra Number (Label)", !1).toggleLayer("Rectangle Number (Label)", !1).toggleLayer("Roads RoW", !0);
//});
//On Draw Edit Event

