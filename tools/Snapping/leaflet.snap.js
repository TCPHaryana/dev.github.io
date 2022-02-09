(function () {

            L.Handler.MarkerSnap = L.Handler.extend({
                options: {
                    snapDistance: 20, // in pixels
                    snapVertices: true
                },

                initialize: function (map, marker, options) {
                    L.Handler.prototype.initialize.call(this, map);
                    this._markers = [];
                    this._guides = [];

                    if (arguments.length == 2) {
                        if (!(marker instanceof L.Class)) {
                            options = marker;
                            marker = null;
                        }
                    }

                    L.Util.setOptions(this, options || {});

                    if (marker) {
                        // new markers should be draggable !
                        if (!marker.dragging) marker.dragging = new L.Handler.MarkerDrag(marker);
                        marker.dragging.enable();
                        this.watchMarker(marker);
                    }

                    // Convert snap distance in pixels into buffer in degres, for searching around mouse
                    // It changes at each zoom change.
                    function computeBuffer() {
                        this._buffer = map.layerPointToLatLng(new L.Point(0, 0)).lat -
                                       map.layerPointToLatLng(new L.Point(this.options.snapDistance, 0)).lat;
                    }
                    map.on('zoomend', computeBuffer, this);
                    map.whenReady(computeBuffer, this);
                    computeBuffer.call(this);
                },

                enable: function () {
                    this.disable();
                    for (var i = 0; i < this._markers.length; i++) {
                        this.watchMarker(this._markers[i]);
                    }
                },

                disable: function () {
                    for (var i = 0; i < this._markers.length; i++) {
                        this.unwatchMarker(this._markers[i]);
                    }
                },

                watchMarker: function (marker) {
                    if (this._markers.indexOf(marker) == -1)
                        this._markers.push(marker);
                    marker.on('move', this._snapMarker, this);
                },

                unwatchMarker: function (marker) {
                    marker.off('move', this._snapMarker, this);
                    delete marker['snap'];
                },

                addGuideLayer: function (layer) {
                    for (var i = 0, n = this._guides.length; i < n; i++)
                        if (L.stamp(layer) === L.stamp(this._guides[i]))
                            return;
                    this._guides.push(layer);
                },

                _snapMarker: function (e) {
                    var marker = e.target,
                        latlng = marker.getLatLng(),
                        snaplist = [];

                    function isDifferentLayer(layer) {
                        if (layer.getLatLng) {
                            return L.stamp(marker) !== L.stamp(layer);
                        } else {
                            if (layer.editing && layer.editing._enabled) {
                                var points = layer.editing._verticesHandlers[0]._markerGroup.getLayers();
                                for (var i = 0, n = points.length; i < n; i++) {
                                    if (L.stamp(points[i]) === L.stamp(marker)) { return false; }
                                }
                            }
                        }

                        return true;
                    }

                    function processGuide(guide) {
                        if ((guide._layers !== undefined) &&
                            (typeof guide.searchBuffer !== 'function')) {
                            // Guide is a layer group and has no L.LayerIndexMixin (from Leaflet.LayerIndex)
                            for (var id in guide._layers) {
                                processGuide(guide._layers[id]);
                            }
                        }
                        else if (typeof guide.searchBuffer === 'function') {
                            // Search snaplist around mouse
                            var nearlayers = guide.searchBuffer(latlng, this._buffer);
                            snaplist = snaplist.concat(nearlayers.filter(function (layer) {
                                return isDifferentLayer(layer);
                            }));
                        }
                            // Make sure the marker doesn't snap to itself or the associated polyline layer
                        else if (isDifferentLayer(guide)) {
                            snaplist.push(guide);
                        }
                    }

                    for (var i = 0, n = this._guides.length; i < n; i++) {
                        var guide = this._guides[i];
                        processGuide.call(this, guide);
                    }

                    var closest = this._findClosestLayerSnap(this._map,
                                                             snaplist,
                                                             latlng,
                                                             this.options.snapDistance,
                                                             this.options.snapVertices);

                    closest = closest || { layer: null, latlng: null };
                    this._updateSnap(marker, closest.layer, closest.latlng);
                },

                _findClosestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
                    return L.GeometryUtil.closestLayerSnap(map, layers, latlng, tolerance, withVertices);
                },

                _updateSnap: function (marker, layer, latlng) {
                    if (layer && latlng) {
                        marker._latlng = L.latLng(latlng);
                        marker.update();
                        if (marker.snap != layer) {
                            marker.snap = layer;
                            if (marker._icon) L.DomUtil.addClass(marker._icon, 'marker-snapped');
                            marker.fire('snap', { layer: layer, latlng: latlng });
                        }
                    }
                    else {
                        if (marker.snap) {
                            if (marker._icon) L.DomUtil.removeClass(marker._icon, 'marker-snapped');
                            marker.fire('unsnap', { layer: marker.snap });
                        }
                        delete marker['snap'];
                    }
                }
            });


            if (!L.Edit) {
                // Leaflet.Draw not available.
                return;
            }


            L.Handler.PolylineSnap = L.Edit.Poly.extend({

                initialize: function (map, poly, options) {
                    var that = this;

                    L.Edit.Poly.prototype.initialize.call(this, poly, options);
                    this._snapper = new L.Handler.MarkerSnap(map, options);
                    poly.on('remove', function () {
                        that.disable();
                    });
                },

                addGuideLayer: function (layer) {
                    this._snapper.addGuideLayer(layer);
                },

                _initHandlers: function () {
                    this._verticesHandlers = [];
                    for (var i = 0; i < this.latlngs.length; i++) {
                        this._verticesHandlers.push(new L.Edit.PolyVerticesEditSnap(this._poly, this.latlngs[i], this.options));
                    }
                }
            });

            L.Edit.PolyVerticesEditSnap = L.Edit.PolyVerticesEdit.extend({
                _createMarker: function (latlng, index) {
                    var marker = L.Edit.PolyVerticesEdit.prototype._createMarker.call(this, latlng, index);

                    // Treat middle markers differently
                    var isMiddle = index === undefined;
                    if (isMiddle) {
                        // Snap middle markers, only once they were touched
                        marker.on('dragstart', function () {
                            this._poly.snapediting._snapper.watchMarker(marker);
                        }, this);
                    }
                    else {
                        this._poly.snapediting._snapper.watchMarker(marker);
                    }
                    return marker;
                }
            });

            L.EditToolbar.SnapEdit = L.EditToolbar.Edit.extend({
                snapOptions: {
                    snapDistance: 15, // in pixels
                    snapVertices: true
                },

                initialize: function (map, options) {
                    L.EditToolbar.Edit.prototype.initialize.call(this, map, options);

                    if (options.snapOptions) {
                        L.Util.extend(this.snapOptions, options.snapOptions);
                    }

                    if (Array.isArray(this.snapOptions.guideLayers)) {
                        this._guideLayers = this.snapOptions.guideLayers;
                    } else if (options.guideLayers instanceof L.LayerGroup) {
                        this._guideLayers = this.snapOptions.guideLayers.getLayers();
                    } else {
                        this._guideLayers = [];
                    }
                },

                addGuideLayer: function (layer) {
                    var index = this._guideLayers.findIndex(function (guideLayer) {
                        return L.stamp(layer) === L.stamp(guideLayer);
                    });

                    if (index === -1) {
                        this._guideLayers.push(layer);
                        this._featureGroup.eachLayer(function (layer) {
                            if (layer.snapediting) { layer.snapediting._guides.push(layer); }
                        });
                    }
                },

                removeGuideLayer: function (layer) {
                    var index = this._guideLayers.findIndex(function (guideLayer) {
                        return L.stamp(layer) === L.stamp(guideLayer);
                    });

                    if (index !== -1) {
                        this._guideLayers.splice(index, 1);
                        this._featureGroup.eachLayer(function (layer) {
                            if (layer.snapediting) { layer.snapediting._guides.splice(index, 1); }
                        });
                    }
                },

                clearGuideLayers: function () {
                    this._guideLayers = [];
                    this._featureGroup.eachLayer(function (layer) {
                        if (layer.snapediting) { layer.snapediting._guides = []; }
                    });
                },

                _enableLayerEdit: function (e) {
                    L.EditToolbar.Edit.prototype._enableLayerEdit.call(this, e);

                    var layer = e.layer || e.target || e;

                    if (!layer.snapediting) {
                        if (layer.getLatLng) {
                            layer.snapediting = new L.Handler.MarkerSnap(layer._map, layer, this.snapOptions);
                        } else {
                            if (layer.editing) {
                                layer.editing._verticesHandlers[0]._markerGroup.clearLayers();
                                delete layer.editing;
                            }

                            layer.editing = layer.snapediting = new L.Handler.PolylineSnap(layer._map, layer, this.snapOptions);
                        }

                        for (var i = 0, n = this._guideLayers.length; i < n; i++) {
                            layer.snapediting.addGuideLayer(this._guideLayers[i]);
                        }
                    }

                    layer.snapediting.enable();
                }
            });

            L.Draw.Feature.SnapMixin = {
                _snap_initialize: function () {
                    this.on('enabled', this._snap_on_enabled, this);
                    this.on('disabled', this._snap_on_disabled, this);
                },

                _snap_on_enabled: function () {
                    if (!this.options.guideLayers) {
                        return;
                    }

                    if (!this._mouseMarker) {
                        this._map.on('layeradd', this._snap_on_enabled, this);
                        return;
                    } else {
                        this._map.off('layeradd', this._snap_on_enabled, this);
                    }

                    if (!this._snapper) {
                        this._snapper = new L.Handler.MarkerSnap(this._map);
                        if (this.options.snapDistance) {
                            this._snapper.options.snapDistance = this.options.snapDistance;
                        }
                        if (this.options.snapVertices) {
                            this._snapper.options.snapVertices = this.options.snapVertices;
                        }
                    }

                    for (var i = 0, n = this.options.guideLayers.length; i < n; i++)
                        this._snapper.addGuideLayer(this.options.guideLayers[i]);

                    var marker = this._mouseMarker;

                    this._snapper.watchMarker(marker);

                    // Show marker when (snap for user feedback)
                    var icon = marker.options.icon;
                    marker.on('snap', function (e) {
                        marker.setIcon(this.options.icon);
                        marker.setOpacity(1);
                    }, this)
                          .on('unsnap', function (e) {
                              marker.setIcon(icon);
                              marker.setOpacity(0);
                          }, this);

                    marker.on('click', this._snap_on_click, this);
                },

                _snap_on_click: function (e) {
                    if (this._markers) {
                        var markerCount = this._markers.length,
                            marker = this._markers[markerCount - 1];
                        if (this._mouseMarker.snap) {
                            if (e) {
                                // update the feature being drawn to reflect the snapped location:
                                marker.setLatLng(e.target._latlng);
                                if (this._poly) {
                                    var polyPointsCount = this._poly._latlngs.length;
                                    this._poly._latlngs[polyPointsCount - 1] = e.target._latlng;
                                    this._poly.redraw();
                                }
                            }

                            L.DomUtil.addClass(marker._icon, 'marker-snapped');
                        }
                    }
                },

                _snap_on_disabled: function () {
                    delete this._snapper;
                },
            };

            L.Draw.Feature.include(L.Draw.Feature.SnapMixin);
            L.Draw.Feature.addInitHook('_snap_initialize');

        })();



        // Packaging/modules magic dance.
        (function (factory) {
            var L;
            if (typeof define === 'function' && define.amd) {
                // AMD
                define(['leaflet'], factory);
            } else if (typeof module !== 'undefined') {
                // Node/CommonJS
                L = require('leaflet');
                module.exports = factory(L);
            } else {
                // Browser globals
                if (typeof window.L === 'undefined')
                    throw 'Leaflet must be loaded first';
                factory(window.L);
            }
        }(function (L) {
            "use strict";

            L.Polyline._flat = L.LineUtil.isFlat || L.Polyline._flat || function (latlngs) {
                // true if it's a flat array of latlngs; false if nested
                return !L.Util.isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
            };



            L.GeometryUtil = L.extend(L.GeometryUtil || {}, {


                distance: function (map, latlngA, latlngB) {
                    return map.latLngToLayerPoint(latlngA).distanceTo(map.latLngToLayerPoint(latlngB));
                },


                distanceSegment: function (map, latlng, latlngA, latlngB) {
                    var p = map.latLngToLayerPoint(latlng),
                       p1 = map.latLngToLayerPoint(latlngA),
                       p2 = map.latLngToLayerPoint(latlngB);
                    return L.LineUtil.pointToSegmentDistance(p, p1, p2);
                },


                readableDistance: function (distance, unit) {
                    var isMetric = (unit !== 'imperial'),
                        distanceStr;
                    if (isMetric) {
                        // show metres when distance is < 1km, then show km
                        if (distance > 1000) {
                            distanceStr = (distance / 1000).toFixed(2) + ' km';
                        }
                        else {
                            distanceStr = Math.ceil(distance) + ' m';
                        }
                    }
                    else {
                        distance *= 1.09361;
                        if (distance > 1760) {
                            distanceStr = (distance / 1760).toFixed(2) + ' miles';
                        }
                        else {
                            distanceStr = Math.ceil(distance) + ' yd';
                        }
                    }
                    return distanceStr;
                },


                belongsSegment: function (latlng, latlngA, latlngB, tolerance) {
                    tolerance = tolerance === undefined ? 0.2 : tolerance;
                    var hypotenuse = latlngA.distanceTo(latlngB),
                        delta = latlngA.distanceTo(latlng) + latlng.distanceTo(latlngB) - hypotenuse;
                    return delta / hypotenuse < tolerance;
                },

                length: function (coords) {
                    var accumulated = L.GeometryUtil.accumulatedLengths(coords);
                    return accumulated.length > 0 ? accumulated[accumulated.length - 1] : 0;
                },

                accumulatedLengths: function (coords) {
                    if (typeof coords.getLatLngs == 'function') {
                        coords = coords.getLatLngs();
                    }
                    if (coords.length === 0)
                        return [];
                    var total = 0,
                        lengths = [0];
                    for (var i = 0, n = coords.length - 1; i < n; i++) {
                        total += coords[i].distanceTo(coords[i + 1]);
                        lengths.push(total);
                    }
                    return lengths;
                },


                closestOnSegment: function (map, latlng, latlngA, latlngB) {
                    var maxzoom = map.getMaxZoom();
                    if (maxzoom === Infinity)
                        maxzoom = map.getZoom();
                    var p = map.project(latlng, maxzoom),
                       p1 = map.project(latlngA, maxzoom),
                       p2 = map.project(latlngB, maxzoom),
                       closest = L.LineUtil.closestPointOnSegment(p, p1, p2);
                    return map.unproject(closest, maxzoom);
                },


                closest: function (map, layer, latlng, vertices) {

                    var latlngs,
                        mindist = Infinity,
                        result = null,
                        i, n, distance, subResult;

                    if (layer instanceof Array) {
                        // if layer is Array<Array<T>>
                        if (layer[0] instanceof Array && typeof layer[0][0] !== 'number') {
                            // if we have nested arrays, we calc the closest for each array
                            // recursive
                            for (i = 0; i < layer.length; i++) {
                                subResult = L.GeometryUtil.closest(map, layer[i], latlng, vertices);
                                if (subResult.distance < mindist) {
                                    mindist = subResult.distance;
                                    result = subResult;
                                }
                            }
                            return result;
                        } else if (layer[0] instanceof L.LatLng
                                    || typeof layer[0][0] === 'number'
                                    || typeof layer[0].lat === 'number') { // we could have a latlng as [x,y] with x & y numbers or {lat, lng}
                            layer = L.polyline(layer);
                        } else {
                            return result;
                        }
                    }

                    // if we don't have here a Polyline, that means layer is incorrect
                    // see https://github.com/makinacorpus/Leaflet.GeometryUtil/issues/23
                    if (!(layer instanceof L.Polyline))
                        return result;

                    // deep copy of latlngs
                    latlngs = JSON.parse(JSON.stringify(layer.getLatLngs().slice(0)));

                    // add the last segment for L.Polygon
                    if (layer instanceof L.Polygon) {
                        // add the last segment for each child that is a nested array
                        var addLastSegment = function (latlngs) {
                            if (L.Polyline._flat(latlngs)) {
                                latlngs.push(latlngs[0]);
                            } else {
                                for (var i = 0; i < latlngs.length; i++) {
                                    addLastSegment(latlngs[i]);
                                }
                            }
                        };
                        addLastSegment(latlngs);
                    }

                    // we have a multi polygon / multi polyline / polygon with holes
                    // use recursive to explore and return the good result
                    if (!L.Polyline._flat(latlngs)) {
                        for (i = 0; i < latlngs.length; i++) {
                            // if we are at the lower level, and if we have a L.Polygon, we add the last segment
                            subResult = L.GeometryUtil.closest(map, latlngs[i], latlng, vertices);
                            if (subResult.distance < mindist) {
                                mindist = subResult.distance;
                                result = subResult;
                            }
                        }
                        return result;

                    } else {

                        // Lookup vertices
                        if (vertices) {
                            for (i = 0, n = latlngs.length; i < n; i++) {
                                var ll = latlngs[i];
                                distance = L.GeometryUtil.distance(map, latlng, ll);
                                if (distance < mindist) {
                                    mindist = distance;
                                    result = ll;
                                    result.distance = distance;
                                }
                            }
                            return result;
                        }

                        // Keep the closest point of all segments
                        for (i = 0, n = latlngs.length; i < n - 1; i++) {
                            var latlngA = latlngs[i],
                                latlngB = latlngs[i + 1];
                            distance = L.GeometryUtil.distanceSegment(map, latlng, latlngA, latlngB);
                            if (distance <= mindist) {
                                mindist = distance;
                                result = L.GeometryUtil.closestOnSegment(map, latlng, latlngA, latlngB);
                                result.distance = distance;
                            }
                        }
                        return result;
                    }

                },


                closestLayer: function (map, layers, latlng) {
                    var mindist = Infinity,
                        result = null,
                        ll = null,
                        distance = Infinity;

                    for (var i = 0, n = layers.length; i < n; i++) {
                        var layer = layers[i];
                        if (layer instanceof L.LayerGroup) {
                            // recursive
                            var subResult = L.GeometryUtil.closestLayer(map, layer.getLayers(), latlng);
                            if (subResult.distance < mindist) {
                                mindist = subResult.distance;
                                result = subResult;
                            }
                        } else {
                            // Single dimension, snap on points, else snap on closest
                            if (typeof layer.getLatLng == 'function') {
                                ll = layer.getLatLng();
                                distance = L.GeometryUtil.distance(map, latlng, ll);
                            }
                            else {
                                ll = L.GeometryUtil.closest(map, layer, latlng);
                                if (ll) distance = ll.distance;  // Can return null if layer has no points.
                            }
                            if (distance < mindist) {
                                mindist = distance;
                                result = { layer: layer, latlng: ll, distance: distance };
                            }
                        }
                    }
                    return result;
                },

                nClosestLayers: function (map, layers, latlng, n) {
                    n = typeof n === 'number' ? n : layers.length;

                    if (n < 1 || layers.length < 1) {
                        return null;
                    }

                    var results = [];
                    var distance, ll;

                    for (var i = 0, m = layers.length; i < m; i++) {
                        var layer = layers[i];
                        if (layer instanceof L.LayerGroup) {
                            // recursive
                            var subResult = L.GeometryUtil.closestLayer(map, layer.getLayers(), latlng);
                            results.push(subResult);
                        } else {
                            // Single dimension, snap on points, else snap on closest
                            if (typeof layer.getLatLng == 'function') {
                                ll = layer.getLatLng();
                                distance = L.GeometryUtil.distance(map, latlng, ll);
                            }
                            else {
                                ll = L.GeometryUtil.closest(map, layer, latlng);
                                if (ll) distance = ll.distance;  // Can return null if layer has no points.
                            }
                            results.push({ layer: layer, latlng: ll, distance: distance });
                        }
                    }

                    results.sort(function (a, b) {
                        return a.distance - b.distance;
                    });

                    if (results.length > n) {
                        return results.slice(0, n);
                    } else {
                        return results;
                    }
                },


                layersWithin: function (map, layers, latlng, radius) {
                    radius = typeof radius == 'number' ? radius : Infinity;

                    var results = [];
                    var ll = null;
                    var distance = 0;

                    for (var i = 0, n = layers.length; i < n; i++) {
                        var layer = layers[i];

                        if (typeof layer.getLatLng == 'function') {
                            ll = layer.getLatLng();
                            distance = L.GeometryUtil.distance(map, latlng, ll);
                        }
                        else {
                            ll = L.GeometryUtil.closest(map, layer, latlng);
                            if (ll) distance = ll.distance;  // Can return null if layer has no points.
                        }

                        if (ll && distance < radius) {
                            results.push({ layer: layer, latlng: ll, distance: distance });
                        }
                    }

                    var sortedResults = results.sort(function (a, b) {
                        return a.distance - b.distance;
                    });

                    return sortedResults;
                },


                closestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
                    tolerance = typeof tolerance == 'number' ? tolerance : Infinity;
                    withVertices = typeof withVertices == 'boolean' ? withVertices : true;

                    var result = L.GeometryUtil.closestLayer(map, layers, latlng);
                    if (!result || result.distance > tolerance)
                        return null;

                    // If snapped layer is linear, try to snap on vertices (extremities and middle points)
                    if (withVertices && typeof result.layer.getLatLngs == 'function') {
                        var closest = L.GeometryUtil.closest(map, result.layer, result.latlng, true);
                        if (closest.distance < tolerance) {
                            result.latlng = closest;
                            result.distance = L.GeometryUtil.distance(map, closest, latlng);
                        }
                    }
                    return result;
                },


                interpolateOnPointSegment: function (pA, pB, ratio) {
                    return L.point(
                        (pA.x * (1 - ratio)) + (ratio * pB.x),
                        (pA.y * (1 - ratio)) + (ratio * pB.y)
                    );
                },

                interpolateOnLine: function (map, latLngs, ratio) {
                    latLngs = (latLngs instanceof L.Polyline) ? latLngs.getLatLngs() : latLngs;
                    var n = latLngs.length;
                    if (n < 2) {
                        return null;
                    }

                    // ensure the ratio is between 0 and 1;
                    ratio = Math.max(Math.min(ratio, 1), 0);

                    if (ratio === 0) {
                        return {
                            latLng: latLngs[0] instanceof L.LatLng ? latLngs[0] : L.latLng(latLngs[0]),
                            predecessor: -1
                        };
                    }
                    if (ratio == 1) {
                        return {
                            latLng: latLngs[latLngs.length - 1] instanceof L.LatLng ? latLngs[latLngs.length - 1] : L.latLng(latLngs[latLngs.length - 1]),
                            predecessor: latLngs.length - 2
                        };
                    }

                    // project the LatLngs as Points,
                    // and compute total planar length of the line at max precision
                    var maxzoom = map.getMaxZoom();
                    if (maxzoom === Infinity)
                        maxzoom = map.getZoom();
                    var pts = [];
                    var lineLength = 0;
                    for (var i = 0; i < n; i++) {
                        pts[i] = map.project(latLngs[i], maxzoom);
                        if (i > 0)
                            lineLength += pts[i - 1].distanceTo(pts[i]);
                    }

                    var ratioDist = lineLength * ratio;

                    // follow the line segments [ab], adding lengths,
                    // until we find the segment where the points should lie on
                    var cumulativeDistanceToA = 0, cumulativeDistanceToB = 0;
                    for (var i = 0; cumulativeDistanceToB < ratioDist; i++) {
                        var pointA = pts[i], pointB = pts[i + 1];

                        cumulativeDistanceToA = cumulativeDistanceToB;
                        cumulativeDistanceToB += pointA.distanceTo(pointB);
                    }

                    if (pointA == undefined && pointB == undefined) { // Happens when line has no length
                        var pointA = pts[0], pointB = pts[1], i = 1;
                    }

                    // compute the ratio relative to the segment [ab]
                    var segmentRatio = ((cumulativeDistanceToB - cumulativeDistanceToA) !== 0) ? ((ratioDist - cumulativeDistanceToA) / (cumulativeDistanceToB - cumulativeDistanceToA)) : 0;
                    var interpolatedPoint = L.GeometryUtil.interpolateOnPointSegment(pointA, pointB, segmentRatio);
                    return {
                        latLng: map.unproject(interpolatedPoint, maxzoom),
                        predecessor: i - 1
                    };
                },


                locateOnLine: function (map, polyline, latlng) {
                    var latlngs = polyline.getLatLngs();
                    if (latlng.equals(latlngs[0]))
                        return 0.0;
                    if (latlng.equals(latlngs[latlngs.length - 1]))
                        return 1.0;

                    var point = L.GeometryUtil.closest(map, polyline, latlng, false),
                        lengths = L.GeometryUtil.accumulatedLengths(latlngs),
                        total_length = lengths[lengths.length - 1],
                        portion = 0,
                        found = false;
                    for (var i = 0, n = latlngs.length - 1; i < n; i++) {
                        var l1 = latlngs[i],
                            l2 = latlngs[i + 1];
                        portion = lengths[i];
                        if (L.GeometryUtil.belongsSegment(point, l1, l2, 0.0001)) {
                            portion += l1.distanceTo(point);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        throw "Could not interpolate " + latlng.toString() + " within " + polyline.toString();
                    }
                    return portion / total_length;
                },


                reverse: function (polyline) {
                    return L.polyline(polyline.getLatLngs().slice(0).reverse());
                },


                extract: function (map, polyline, start, end) {
                    if (start > end) {
                        return L.GeometryUtil.extract(map, L.GeometryUtil.reverse(polyline), 1.0 - start, 1.0 - end);
                    }

                    // Bound start and end to [0-1]
                    start = Math.max(Math.min(start, 1), 0);
                    end = Math.max(Math.min(end, 1), 0);

                    var latlngs = polyline.getLatLngs(),
                        startpoint = L.GeometryUtil.interpolateOnLine(map, polyline, start),
                        endpoint = L.GeometryUtil.interpolateOnLine(map, polyline, end);
                    // Return single point if start == end
                    if (start == end) {
                        var point = L.GeometryUtil.interpolateOnLine(map, polyline, end);
                        return [point.latLng];
                    }
                    // Array.slice() works indexes at 0
                    if (startpoint.predecessor == -1)
                        startpoint.predecessor = 0;
                    if (endpoint.predecessor == -1)
                        endpoint.predecessor = 0;
                    var result = latlngs.slice(startpoint.predecessor + 1, endpoint.predecessor + 1);
                    result.unshift(startpoint.latLng);
                    result.push(endpoint.latLng);
                    return result;
                },


                isBefore: function (polyline, other) {
                    if (!other) return false;
                    var lla = polyline.getLatLngs(),
                        llb = other.getLatLngs();
                    return (lla[lla.length - 1]).equals(llb[0]);
                },


                isAfter: function (polyline, other) {
                    if (!other) return false;
                    var lla = polyline.getLatLngs(),
                        llb = other.getLatLngs();
                    return (lla[0]).equals(llb[llb.length - 1]);
                },


                startsAtExtremity: function (polyline, other) {
                    if (!other) return false;
                    var lla = polyline.getLatLngs(),
                        llb = other.getLatLngs(),
                        start = lla[0];
                    return start.equals(llb[0]) || start.equals(llb[llb.length - 1]);
                },


                computeAngle: function (a, b) {
                    return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI);
                },


                computeSlope: function (a, b) {
                    var s = (b.y - a.y) / (b.x - a.x),
                        o = a.y - (s * a.x);
                    return { 'a': s, 'b': o };
                },


                rotatePoint: function (map, latlngPoint, angleDeg, latlngCenter) {
                    var maxzoom = map.getMaxZoom();
                    if (maxzoom === Infinity)
                        maxzoom = map.getZoom();
                    var angleRad = angleDeg * Math.PI / 180,
                        pPoint = map.project(latlngPoint, maxzoom),
                        pCenter = map.project(latlngCenter, maxzoom),
                        x2 = Math.cos(angleRad) * (pPoint.x - pCenter.x) - Math.sin(angleRad) * (pPoint.y - pCenter.y) + pCenter.x,
                        y2 = Math.sin(angleRad) * (pPoint.x - pCenter.x) + Math.cos(angleRad) * (pPoint.y - pCenter.y) + pCenter.y;
                    return map.unproject(new L.Point(x2, y2), maxzoom);
                },


                bearing: function (latlng1, latlng2) {
                    var rad = Math.PI / 180,
                        lat1 = latlng1.lat * rad,
                        lat2 = latlng2.lat * rad,
                        lon1 = latlng1.lng * rad,
                        lon2 = latlng2.lng * rad,
                        y = Math.sin(lon2 - lon1) * Math.cos(lat2),
                        x = Math.cos(lat1) * Math.sin(lat2) -
                            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

                    var bearing = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
                    return bearing >= 180 ? bearing - 360 : bearing;
                },


                destination: function (latlng, heading, distance) {
                    heading = (heading + 360) % 360;
                    var rad = Math.PI / 180,
                        radInv = 180 / Math.PI,
                        R = 6378137, // approximation of Earth's radius
                        lon1 = latlng.lng * rad,
                        lat1 = latlng.lat * rad,
                        rheading = heading * rad,
                        sinLat1 = Math.sin(lat1),
                        cosLat1 = Math.cos(lat1),
                        cosDistR = Math.cos(distance / R),
                        sinDistR = Math.sin(distance / R),
                        lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 *
                            sinDistR * Math.cos(rheading)),
                        lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR *
                            cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
                    lon2 = lon2 * radInv;
                    lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
                    return L.latLng([lat2 * radInv, lon2]);
                },

                angle: function (map, latlngA, latlngB) {
                    var pointA = map.latLngToContainerPoint(latlngA),
                        pointB = map.latLngToContainerPoint(latlngB),
                        angleDeg = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180 / Math.PI + 90;
                    angleDeg += angleDeg < 0 ? 360 : 0;
                    return angleDeg;
                },


                destinationOnSegment: function (map, latlngA, latlngB, distance) {
                    var angleDeg = L.GeometryUtil.angle(map, latlngA, latlngB),
                        latlng = L.GeometryUtil.destination(latlngA, angleDeg, distance);
                    return L.GeometryUtil.closestOnSegment(map, latlng, latlngA, latlngB);
                },
            });

            return L.GeometryUtil;

        }));