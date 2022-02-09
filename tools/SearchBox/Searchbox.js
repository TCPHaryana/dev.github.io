/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global Wkt */

function zoomToRevenuebox() {
    map.removeLayer(selectedRevenue);
    var e = new Wkt.Wkt(),
        t = $("#hiddenWKT").val();
    if (-1 !== t.indexOf("GEOMETRYCOLLECTION")) {
        var a = t.substring(t.lastIndexOf("POLYGON ((") + 1, t.lastIndexOf("))"));
        t = "POLYGON ((" + a + "))";
    }
    e.read(t);
    for (var n = e.toJson().coordinates[0], o = [], r = 0; r < n.length; r++) {
        var i = L.utm({ x: n[r][0], y: n[r][1], zone: 43, band: "N" }).latLng();
        o.push(i.lng + " " + i.lat);
    }
    (t = "POLYGON ((" + o + "))"), e.read(t), (t = e.toJson());
    selectedRevenue = new L.geoJSON(t, { style: { color: "#00c3ff", weight: 1, opacity: 1 }, maxZoom: 20 }).addTo(map);
    map.fitBounds(selectedRevenue.getBounds()); 
//    selectedRevenue.addLayer(l);
};

$(document).ready(function () {
    $("#searchbox").autocomplete({
        source: function (e, t) {
            $.ajax({
                url: "/api/getRevSearchResults",
                data: { _token: $("input[name$='_token']").val(), credentials: "same-origin", Name_Census: e.term},
                //data: { Name_Census: e.term },
                dataType: "json",
                type: "GET",
                success: function (e) {
                    $("#hiddenWKT").val(""),
                        t(
                            $.map(e, function (e) {
                                return { label: e.Name_Census + " (" + e.Hadbast_No + ") - " + e.Name + " ", value: e.ID, wkt: e.WKT };
                            })
                        );
                }
            });
        },
        select: function (e, t) {
            return $("#searchbox").val(t.item.label), $("#hiddenWKT").val(t.item.wkt), !1;
        },
        minLength: 1
    });
});


//$(document).ready(function () {
//    $("#searchbox").autocomplete({
//        source: function (e, t) {
//            $.ajax({
//                url: "/api/getRevSearchResults",
//                data: { _token: $("input[name$='_token']").val(), credentials: "same-origin", Name_Census: e.term},
//                //data: { Name_Census: e.term },
//                dataType: "json",
//                type: "GET",
//                success: function (e) {
//                    $("#hiddenWKT").val(""),
//                        t(
//                            $.map(e, function (e) {
//                                 //return { label: e.Owner , value: wkt: e.WKT };
//                                 return { label: e.Owner + " (" + e.Hadbast_No + ") - " + e.Name + " (" + e.Rev_Code + ")", value: e.ID, wkt: e.WKT };
//                            })
//                        );
//                },
//            });
//        },
//        select: function (e, t) {
//            return $("#searchboxOwn").val(t.OwnerName.label), $("#hiddenWKT").val(t.OwnerName.wkt), !1;
//        },
//        minLength: 2,
//    });
//});

//$(document).ready(function () {
//    $("#searchboxOwn").autocomplete({
//        source: function (e, t) {
//            $.ajax({
//                url: "/coreapi/Ownernamesearch",
//                data: { _token: $("input[name$='_token']").val(), credentials: "same-origin", Owner: e.term},
//                //data: { Name_Census: e.term },
//                dataType: "json",
//                type: "GET",
//                success: function (e) {
//                    $("#hiddenWKT").val(""),
//                        t(
//                            $.map(e, function (e) {
//                                return { label: e.Owner , wkt: e.WKT };
//                            })
//                        );
//                }
//            });
//        },
//        select: function (e, t) {
//            return $("#searchboxOwn").val(t.item.label), $("#hiddenWKT").val(t.item.wkt), !1;
//        },
//        minLength: 2
//    });
//});