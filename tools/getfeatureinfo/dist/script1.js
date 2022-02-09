init();
geojsonOpts = {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.divIcon({
                className: feature.properties.amenity,
                iconSize: L.point(16, 16),
                html: feature.properties.amenity[0].toUpperCase(),
            })
        }).bindPopup(feature.properties.amenity + '<br><b>' + feature.properties.name + '</b>');
    }
};

function init() {

    var url = "https://mis.tcpharyana.gov.in/geoserver/gwc/service/wms/",
    services = {
      //layer1_name:{title:"layer1_title",properties:{property1_name:"property1_title",property2_name:"property2_title"}}
      states: {
        title: "USA Population",
        properties: { STATE_ABBR: "State Code", STATE_NAME: "State Name" }
      },
      poly_landmarks: {
        title: "Manhattan (NY) Landmarks",
        properties: { LAND: "Landmark Code", LANAME: "Landmark Name" }
      }
    },
    geojson,
    osm = L.tileLayer(
      /*
     https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
     http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
     http://{s}.tile.osm.org/{z}/{x}/{y}.png
     */
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        /*
     https://openstreetmap.org
     http://openstreetmap.org
     https://osm.org
     http://osm.org
     */
        attribution:
          '&copy; <a target="_blank" href="https://openstreetmap.org" title="&copy; OpenStreetMap contributors">OpenStreetMap</a> contributors'
      }
    ),
    states = L.tileLayer.wms(url, {
      layers: "geoitanalytics:Dist_Bnd",
      format: "image/png", // 'image/jpeg' (default), 'image/png' (makes it transparent)
      transparent: true
    }),
    poly_landmarks = L.tileLayer.wms(url, {
      layers: "geoitanalytics:Contr_Area",
      format: "image/png",
      transparent: true
     
    }),
    base = {
      OSM: osm
    },
    overlays = {
      "USA Population": states,
      "Manhattan (NY) Landmarks": poly_landmarks
    },
    map = L.map("map", {
      center: [29, 77],
      zoom: 8,
      layers: [osm, states]
    });
  L.control.layers(base, overlays).addTo(map);





map.on("popupclose", function (e) {
    if (geojson) {
        map.removeLayer(geojson);
    }
});

    map.on("click", function (e) {

        var _layers = this._layers,
          layers = [],
          versions = [],
          styles = [];

        for (var x in _layers) {
            var _layer = _layers[x];
            if (_layer.wmsParams) {
                layers.push(_layer.wmsParams.layers);
                versions.push(_layer.wmsParams.version);
                styles.push(_layer.wmsParams.styles);
            }
        }

        var loc = e.latlng,
          xy = e.containerPoint, // xy = this.latLngToContainerPoint(loc,this.getZoom())
          size = this.getSize(),
          bounds = this.getBounds(),
          crs = this.options.crs,
          sw = crs.project(bounds.getSouthWest()),
          ne = crs.project(bounds.getNorthEast()),
          obj = {
              service: "WMS", // WMS (default)
              version: versions[0],
              request: "GetFeatureInfo",
              layers: "geoitanalytics:Dist_Bnd",
              styles: styles[0],
              // bbox: bounds.toBBoxString(), // works only with EPSG4326, but not with EPSG3857
              bbox: sw.x + "," + sw.y + "," + ne.x + "," + ne.y, // works with both EPSG4326, EPSG3857
              width: size.x,
              height: size.y,
              query_layers: layers,
              info_format: "application/json", // text/plain (default), application/json for JSON (CORS enabled servers), text/javascript for JSONP (JSONP enabled servers)
              feature_count: 5 // 1 (default)
              //exceptions: 'application/json', // application/vnd.ogc.se_xml (default)
              // format_options: 'callback: parseResponse' // callback: parseResponse (default), use only with JSONP enabled servers, when you want to change the callback name
          };
        if (parseFloat(obj.version) >= 1.3) {
            obj.crs = crs.code;
            obj.i = xy.x;
            obj.j = xy.y;
        } else {
            obj.srs = crs.code;
            obj.x = xy.x;
            obj.y = xy.y;
        }
        $.ajax({
            url: url + L.Util.getParamString(obj, url, true),
            // dataType: 'jsonp', // use only with JSONP enabled servers
            // jsonpCallback: 'parseResponse', // parseResponse (default), use only with JSONP enabled servers, change only when you changed the callback name in request using format_options: 'callback: parseResponse'
            success: function (data,status, xhr) {
                //var html = "You Clicked @ " + loc + "<br/>";

                if (geojson) {
                    map.removeLayer(geojson);
                }

                if (data.features) {
                    var features = data.features;
                    if (features.length) {
                        html += "Feature(s) Found: " + features.length;

                        //geojson = L.geoJSON(data).addTo(map); // works only with EPSG4326, but EPSG3857 doesn't highlights geometry, so we used proj4, proj4leaflet to convert geojson from EPSG3857 to EPSG4326
                        geojson = L.Proj.geoJson(data).addTo(map); // works with both EPSG4326, EPSG3857

                        for (var i in features) {
                            var feature = features[i];


                            var properties = feature.properties;

                            var html = '<br/><table><caption>' + feature.id + '</caption>';
                            html += '<thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>';
                            for (var x in properties) {
                                if (x != 'bbox') {
                                    html += '<tr><th>' + x + '</th><td>' + properties[x] + '</td></tr>';
                                }
                            }
                            html += '</tbody></table>';

                        }
                    } else {
                     html += "No Features Found.";
                     }
                } else {
                html += "Failed to Read the Feature(s).";
                }
                map.openPopup(html, loc, { maxHeight: 250 });
            },
            error: function (xhr, status, err) {
                if (geojson) {
                    map.removeLayer(geojson);
                }

            }
        });
    });
}

// JavaScript source code
