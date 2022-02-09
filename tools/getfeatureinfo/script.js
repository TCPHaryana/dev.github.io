
function init() {


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
              layers: "geoitanalytics:Contr_Area", 

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
            success: function (data) {
                //var html = "You Clicked @ " + loc + "<br/>";

                if (geojson) {
                    map.removeLayer(geojson);
                }

                if (data.features) {
                    var features = data.features;
                    if (features.length) {
                        html += "Feature(s) Found: " + features.length;

                        geojson = L.geoJSON(data).addTo(map); // works only with EPSG4326, but EPSG3857 doesn't highlights geometry, so we used proj4, proj4leaflet to convert geojson from EPSG3857 to EPSG4326
                        //geojson = L.Proj.geoJson(data).addTo(map); // works with both EPSG4326, EPSG3857

                        for (var i in features) {
                            var feature = features[i];


                            var properties = feature.properties;

                           var  html = '<br/><table><caption>' + feature.id + '</caption>';
                            html += '<thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>';
                            for (var x in properties) {
                                if (x != 'bbox') {
                                    html += '<tr><th>' + x + '</th><td>' + properties[x] + '</td></tr>';
                                }
                            }
                            html += '</tbody></table>';

                        }
                    } //else {
                       // html += "No Features Found.";
                   // }
                } //else {
                    //html += "Failed to Read the Feature(s).";
                //}
                map.openPopup(html, loc, { maxHeight: 250 });
            },
            error: function ( err) {
                if (geojson) {
                    map.removeLayer(geojson);
                }
                
            }
        });
    });
}