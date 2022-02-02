/* Overlay Layers */
var highlight = L.geoJson(null);

var highlightStyle = {
    stroke: false,
    fillColor: "#00FFFF",
    fillOpacity: 0.7,
    radius: 10
};

var markerClusters = new L.MarkerClusterGroup(null);
/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
var theaterLayer = L.geoJson(null);
var theaters = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: "Scripts/bootleaf/assets/img/marker-icon.png",
                iconSize: [24, 28],
                iconAnchor: [12, 28],
                popupAnchor: [0, -25]
            }),
            title: feature.properties.Name_Rev_E,
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Name_Censu + "</td></tr>" + "<tr><th>Hadbast No</th><td>" + feature.properties.Hadbast_No + "</td></tr>" + "<tr><th>Distict Name</th><td>" + feature.properties.Dist_Code + "</td></tr>" + "<tr><th>Rev Code</th><td>" + feature.properties.Rev_Code + "</td></tr>" + "<table>";
            layer.on({
                click: function (e) {
                    $("#feature-title").html(feature.properties.Name_Rev_E);
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");
                    //highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
            //$("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="Scripts/bootleaf/assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.Name_Rev_E + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            //theaterSearch.push({
            //    name: layer.feature.properties.Name_Rev_E,
            //    address: layer.feature.properties.Name_Censu,
            //    source: "Theaters",
            //    id: L.stamp(layer),
            //    lat: layer.feature.geometry.coordinates[1],
            //    lng: layer.feature.geometry.coordinates[0]
            //});
        }
    }
});
$.getJSON("Scripts/dashboardgeojson/Revestate1.geojson", function (data) {
    theaters.addData(data);
    map.addLayer(theaterLayer);
});
//////////////////////////////////////////////////
/* Empty layer placeholder to add to layer control for listening when to add/remove museums to markerClusters layer */
var museumLayer = L.geoJson(null);
var museums = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: "Scripts/bootleaf/assets/img/museum.png",
                iconSize: [24, 28],
                iconAnchor: [12, 28],
                popupAnchor: [0, -25]
            }),
            title: feature.properties.NAME,
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
            layer.on({
                click: function (e) {
                    $("#feature-title").html(feature.properties.NAME);
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");
                    highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
          
        }
    }
});
$.getJSON("Scripts/bootleaf/data/DOITT_MUSEUM_01_13SEPT2010.geojson", function (data) {
    museums.addData(data);
});


/////////////////////////////////////////////////////////////
var map = L.map("map", {
    zoom: 8,
    center: [29, 77],
    maxZoom: 19,
    layers: [markerClusters, highlight],
    zoomControl: true,
    drawControl: !1,
    attributionControl: false
});
guideLayers = [];
map.addLayer(drawnItems);
//define Drawing toolbar options

var options = {
    position: "topleft",
    draw: {
        metric: !0,
        polyline: {
            showLength: !0,
            guideLayers: guideLayers,
            shapeOptions: {
                color: "red",
                weight: 5
            }
        },
        polygon: {
            showLength: !0,
            showArea: !0,
            allowIntersection: !1,
            guideLayers: guideLayers,
            //shapeOptions: {
            //    color: "blue",
            //    weight: 1
            //}
        },
        circle: !1,
        circlemarker: !1,
        rectangle: !1,
        marker: !1
    },
    edit: {
        featureGroup: drawnItems,
        remove: !0
    }
},

 drawControl = new L.Control.Draw(options);
map.addControl(drawControl);
map.on("draw:created", function (e) {
    var t = plylines = 0;
    drawnItems.getLayers().length >= 1 && drawnItems.eachLayer(function (e) {
        e instanceof L.Polygon ? t += 1 : plylines += 1
    });
    var a = e.layerType;
    if (layer = e.layer, "polygon" === a) {
        if (t >= 1) return void alert("INFO: You Cant draw Site twice!");
        GetSelection(layer);

        var n, o, r = [],
            l = layer.getLatLngs();
        drawnItems.addLayer(layer),
        guideLayers.push(layer);

        var i = layer.toGeoJSON();
        siteArea = turf.area(i);
        for (var s = 0; s < l.length; s++) {
            var d = l[s];
            if (d.length)
                for (var g = 0; g < d.length; g++) n = (n = L.latLng(d[g].lat, d[g].lng)).utm(), r.push(n), 0 === g && (d[g].lng, d[g].lat, o = (o = L.latLng(d[g].lat, d[g].lng)).utm());
            else n = (n = L.latLng(d[s].lat, d[s].lng)).utm(), r.push(n), 0 === s && (d[s].lng, d[s].lat, o = (o = L.latLng(d[s].lat, d[s].lng)).utm())
        }
        json = r.join(", ") + ", " + o, alert("Please Draw your frontage now")
    }
    if ("polyline" === a) {
        if (plylines >= 1) return void alert("INFO: You Cant draw Frontage twice!");
        drawnItems.addLayer(layer), guideLayers.push(layer);
        var u = null,
            c = 0;
        $.each(layer._latlngs, function (e, t) {
            null != u ? (c += u.distanceTo(t), u = t) : u = t
        }), distFrontage = c.toFixed(2), FrontageWKT = toWKT(layer);
        var y = turf.along(layer.toGeoJSON(), distFrontage / 2, {
            units: "meters"
        }),
            m = L.latLng(y.geometry.coordinates[1], y.geometry.coordinates[0]);
        m = m.utm(), FrontageWKT = toWKT(layer) + "~POINT(" + m.x.toFixed(1) + " " + m.y.toFixed(1) + ")", $.confirm({
            title: "Have you marked your site and frontage ?",
            content: '<p>If you have demarcated your site and frontage then click on "Yes proceed now" button!.</p>',
            buttons: {
                someButton: {
                    text: "Yes Proceed now",
                    btnClass: "btn-green",
                    action: function () {
                        0 !== distFrontage ? json ? save(distFrontage, FrontageWKT) : alert("ERROR: Draw your site first!!") : alert("ERROR: Mark your site Frontage!")
                    }
                },
                close: {
                    text: "Cancel",
                    btnClass: "btn-red",
                    action: function () { }
                }
            }
        })
    }
    layer.showMeasurements()
}), map.on("draw:editvertex", function (e) {
    drawnItems.eachLayer(function (e) {
        e.updateMeasurements()
    })
}), map.on("draw:edited", function (e) {
    e.layers.eachLayer(function (e) {
        if (e.updateMeasurements(), e instanceof L.Polyline && !(e instanceof L.Polygon)) {
            drawnItems.addLayer(e), guideLayers.push(e);
            var t = null,
                a = 0;
            $.each(e._latlngs, function (e, n) {
                null != t ? (a += t.distanceTo(n), t = n) : t = n
            }), e.bindPopup(a.toFixed(2) + " meters"), e.openPopup(), distFrontage = a.toFixed(2);
            var n = turf.along(e.toGeoJSON(), distFrontage / 2, {
                units: "meters"
            }),
                o = L.latLng(n.geometry.coordinates[1], n.geometry.coordinates[0]);
            o = o.utm(), FrontageWKT = toWKT(e) + "~POINT(" + o.x.toFixed(1) + " " + o.y.toFixed(1) + ")"
        }
        if (e instanceof L.Polygon && !(e instanceof L.Rectangle)) {
            GetSelection(e);
            var r, l, i = [],
                s = e.getLatLngs();
            drawnItems.addLayer(e), guideLayers.push(e);
            var d = e.toGeoJSON();
            siteArea = turf.area(d);
            for (var g = 0; g < s.length; g++) {
                var u = s[g];
                if (u.length)
                    for (var c = 0; c < u.length; c++) r = (r = L.latLng(u[c].lat, u[c].lng)).utm(), i.push(r), 0 === c && (u[c].lng, u[c].lat, l = (l = L.latLng(u[c].lat, u[c].lng)).utm());
                else r = (r = L.latLng(u[g].lat, u[g].lng)).utm(), i.push(r), 0 === g && (u[g].lng, u[g].lat, l = (l = L.latLng(u[g].lat, u[g].lng)).utm())
            }
            json = i.join(", ") + ", " + l
        }
    }), $.confirm({
        title: "Have you marked your site and frontage ?",
        content: '<p>If you have demarcated your site and frontage then click on "Yes proceed now" button!.</p>',
        buttons: {
            someButton: {
                text: "Yes Proceed now",
                btnClass: "btn-green",
                action: function () {
                    0 !== distFrontage ? json ? save(distFrontage, FrontageWKT) : alert("ERROR: Draw your site first!!") : alert("ERROR: Mark your site Frontage!")
                }
            },
            close: {
                text: "Cancel",
                btnClass: "btn-red",
                action: function () { }
            }
        }
    })
}), map.on("draw:deleted", function (e) {
    drawnItems.getLayers().length
}), 

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


function onEachFeature(e, t) {
    drawnItems.addLayer(t), t.showMeasurements();
}
function onEachFeature1(e, t) {
    drawnItems.addLayer(t), t.showMeasurements(), t instanceof L.Polygon && (siteArea = turf.area(e));
}
function GetSelection(e) {
    var t, a, n, o, r, i;
    (r = 0),
        (t = selectedRevenue.toGeoJSON()),
        (a = turf.union(...t.features)),
        (n = turf.buffer(a, 25, { units: "meters" })),
        null != (o = turf.intersect(e.toGeoJSON(), n)) && (r = turf.area(o)),
        (i = turf.area(e.toGeoJSON())),
        0 == r ? alert("Whole Site is marked Outside!!") : r < i && alert(parseFloat(i - r).toFixed(2) + " Sqm. area of Site is marked Outside!!");
};

/* Larger screens get expanded layer control and visible sidebar */
//if (document.body.clientWidth <= 767) {
//    var isCollapsed = true;
//} else {
//    var isCollapsed = false;
//}

var baseLayers = {

};

var groupedOverlays = {
    "Points of Interest": {
        "<img src='Scripts/bootleaf/assets/img/marker-icon.png' width='24' height='28'>&nbsp; Revestate": theaterLayer,
        "<img src='Scripts/bootleaf/assets/img/museum.png' width='24' height='28'>&nbsp;Licence Boundary": museumLayer
    }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
    position: "bottomleft"
}).addTo(map);



layercontrol = new L.Control.AccordionLegend({
    position: "topright",
    title: "Layer Panel",
    content: LAYERS_AND_LEGENDS
}).addTo(map);

layercontrol.expandUI("Layer Panel").toggleLayer("District Boundary", !0).toggleLayer("Google Satellite", !0);
map.addLayer(drawnItems);
flag = !1;
distFrontage = 0;
guideLayers = [];
//zoom_bar = new L.Control.ZoomBar({
//    position: "bottomright"
//}).addTo(map);
layercontrol.getContainer().addEventListener("mouseover", function () {
    map.dragging.disable()
}), layercontrol.getContainer().addEventListener("mouseout", function () {
    map.dragging.enable()
}),
$("#hiddenWKT").val("");
var myStylee = {
    color: "green",
    weight: 1
};
// Control 2: This add a scale to the map
L.control.betterscale({
    position: "bottomright"
}).addTo(map);
//////////////////////////////////////////////////
var customActionToPrint = function (context, mode) {
    return function () {
        window.alert("We are printing the MAP. Let's do Custom print here!");
        context._printCustom(mode);
    }
}


/////////////////////////////////////////////////////////////////
map.on("zoomend", function () {
    var e = map.getZoom();
    e < 14 && layercontrol.toggleLayer("Rectangle Boundary", !1).toggleLayer("Khasra Boundary", !1).toggleLayer("Khasra Number (Label)", !1).toggleLayer("Rectangle Number (Label)", !1).toggleLayer("Roads RoW", !1),
        e >= 14 && layercontrol.toggleLayer("Rectangle Boundary", !0).toggleLayer("Khasra Boundary", !0).toggleLayer("Khasra Number (Label)", !0).toggleLayer("Rectangle Number (Label)", !0).toggleLayer("Roads RoW", !0);
});
