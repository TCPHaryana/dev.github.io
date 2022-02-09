/* 
 * Click to change this license
 * Click to edit this template
 */
/****** Object:  Search panel Code    Script Date: 06-01-2022 10:01:26 ******/

/* global geojson, Wkt, layercontrol */
$(document).ready(function () {
/////////////////////////////////Search Panel  Distict ////////////////////////////////////
    $.getJSON('/api/districtsearch', function (data) {
        //alert("Akshay");
        var dist = document.getElementById("district");
        var distCA = document.getElementById("districtCA");
        var distUA = document.getElementById("districtUA");
        var distDP = document.getElementById("districtDP");
        //Add the Options to the DropDownList.
        for (var i = 0; i < data.length; i++) {
            dist.options[i + 1] = new Option(data[i].Name, data[i].Dist_Code);
            distCA.options[i + 1] = new Option(data[i].Name, data[i].Dist_Code);
            distUA.options[i + 1] = new Option(data[i].Name, data[i].Dist_Code);
            distDP.options[i + 1] = new Option(data[i].Name, data[i].Dist_Code);
            // var option = document.createElement("OPTION");
        }
    });
/////////////////////////////////Search Panel District Revenue////////////////////////////////////
    $("#district").change(function () {
        var rev = document.getElementById("revenue");
        var length = rev.options.length;
        for (i = length - 1; i >= 0; i--) {
            rev.options[i] = null;
        }
        var Dist_Code = $(this).val();
        //  alert(district_code);
        var url = "api/revenuesearch";
        url += "?Dist_Code=" + Dist_Code;
        //alert(url);
        rev.options[0] = new Option('Select Village', "");

        $('#murraba').children('option:not(:first)').remove();
        $('#revenue').children('option:not(:first)').remove();
        $('#khasra').children('option:not(:first)').remove();

        //  alert(url);
        $.getJSON(url, function (data) {
            var rev1 = document.getElementById("revenue");
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                rev1.options[i + 1] = new Option(data[i].Name_Rev_Estate, data[i].Rev_Code);
            }
        });

    });

/////////////////////////////////Search Panel  District Revenue Murraba Change////////////////////////////////////

    $("#revenue").change(function () {
         load_query3();
         layercontrol.toggleLayer("Revenue Estate Name (Label)", !0);
//alert('Akshay');
        var murraba = document.getElementById("murraba");
        var length = murraba.options.length;
        for (i = length - 1; i >= 0; i--) {
            murraba.options[i] = null;
        }
        var Rev_Code = $(this).val();
        //  alert(district_code);
        var url = "api/murrabasearch";
        url += "?Rev_Code=" + Rev_Code;
        //alert(url);
        murraba.options[0] = new Option('Murraba No', "");
        $("#murraba").children('option:not(:first)').remove();
        $("#khasra").children('option:not(:first)').remove();

        //  alert(url);
        $.getJSON(url, function (data) {
            var murraba1 = document.getElementById("murraba");
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                murraba1.options[i + 1] = new Option(data[i].Rect_No, data[i].Rev_Code);
            }
        });

    });
/////////////////////////////////Search Panel District Revenue Murraba Khasra Change////////////////////////////////////
    $("#murraba").change(function () {
        load_query2();
        layercontrol.toggleLayer("Rectangle Number (Label)", !0);
        layercontrol.toggleLayer("Revenue Estate Name (Label)", !1);
//alert('Akshay');
        var khasra = document.getElementById("khasra");
        var length = khasra.options.length;
        for (i = length - 1; i >= 0; i--) {
            khasra.options[i] = null;
        }
        var Rev_Code = $(this).val();
        //alert($(this).text());  $( "#murraba option:selected" ).text();
        var Rect_No = $("#murraba :selected").text();
        //  alert(district_code);
        var url = "api/khasrasearch";
        url += "?Rect_No=" + Rect_No + "&Rev_Code=" + Rev_Code;
        //alert(url);
        khasra.options[0] = new Option('Khasra No', "");
        //  alert(url);
        $.getJSON(url, function (data) {
            var khasra1 = document.getElementById("khasra");
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                khasra1.options[i + 1] = new Option(data[i].Khasra_No, data[i].Khasra_No);
            }
        });

    });
/////////////////////////////////Search Panel ////////////////////////////////////
    $("#khasra").change(function () {
        load_query();
        layercontrol.toggleLayer("Rectangle Number (Label)", !1);
        layercontrol.toggleLayer("Khasra Boundary", !0);

    });

    function load_query() {
        $("#divLoading").addClass('show');
        //var Khasra_No = document.getElementById("khasra").value;
        var Khasra_No = $("#khasra :selected").text();
        //var Rect_No = document.getElementById("khasra").value;
        var Rect_No = $("#murraba :selected").text();
        var Rev_Code = document.getElementById("murraba").value;
        $.ajax({
            cache: false,
            url: "/api/searchdataget",
            data: {_token: $("input[name$='_token']").val(),
                credentials: "same-origin",
                Rev_Code: Rev_Code,
                Rect_No: Rect_No,
                Khasra_No: Khasra_No},
            dataType: "json",
            type: "GET",
            success: function (e) {
                $("#divLoading").removeClass('show');
                (zoomTokhasra(e[0].WKT));

            }
        });
    }
    ;
    function load_query2() {
        $("#divLoading").addClass('show');
        //var Khasra_No = document.getElementById("khasra").value;
        //var Khasra_No = $("#khasra :selected").text();
        //var Rect_No = document.getElementById("khasra").value;
        var Rect_No = $("#murraba :selected").text();
        var Rev_Code = document.getElementById("murraba").value;
        $.ajax({
            cache: false,
            url: "/api/searchdatamurraba",
            data: {_token: $("input[name$='_token']").val(),
                credentials: "same-origin",
                Rev_Code: Rev_Code,
                Rect_No: Rect_No},
            dataType: "json",
            type: "GET",
            success: function (e) {
                $("#divLoading").removeClass('show');
                (zoomTokhasra(e[0].WKT));
            }
        });
    }
    ;
    
   function load_query3() {
        $("#divLoading").addClass('show');
        //var Khasra_No = document.getElementById("khasra").value;
        //var Khasra_No = $("#khasra :selected").text();
        //var Rect_No = document.getElementById("khasra").value;
        //var Rect_No = $("#revenue :selected").text();
        var Rev_Code = document.getElementById("revenue").value;
        
        $.ajax({
            cache: false,
            url: "/api/searchdatarevenue",
            data: {_token: $("input[name$='_token']").val(),
                credentials: "same-origin",
                Rev_Code: Rev_Code
                },
            dataType: "json",
            type: "GET",
            success: function (e) {
                $("#divLoading").removeClass('show');
                (zoomTokhasra(e[0].WKT));
            }
        });
    }
    ;

    function zoomTokhasra(e) {
        if (geojsonlay) {
            map.removeLayer(geojsonlay);
        }
        var t = new Wkt.Wkt(),
                n = e;
        if (-1 !== n.indexOf("GEOMETRYCOLLECTION")) {
            var a = n.substring(n.lastIndexOf("POLYGON ((") + 1, n.lastIndexOf("))"));
            n = "POLYGON ((" + a + "))";
        }
        t.read(n);
        for (var o = t.toJson().coordinates[0], r = [], l = 0; l < o.length; l++) {
            var i = L.utm({x: o[l][0], y: o[l][1], zone: 43, band: "N"}).latLng();
            r.push(i.lng + " " + i.lat);
        }
        (n = "POLYGON ((" + r + "))"), t.read(n), (n = t.toJson());
        geojsonlay = new L.geoJSON(n, {style: {color: "white", weight: 3, fillColor: "#00c3ff", opacity: 0.5}}).addTo(map);
        map.fitBounds(geojsonlay.getBounds());
    }
    ;

//    $.getJSON("{{asset("storage / upload / shapefiles / districts / atd_district_level.geojson")}}", function (data) {
//        // add GeoJSON layer to the map once the file is loaded
//        L.geoJson(data, {
//
//            style: {color: "#999", weight: 2, fillColor: "#00ad79", fillOpacity: .6},
//
//            onEachFeature: function (feature, layer) {
//                layer.bindPopup("<strong>" + feature.properties['DISTRICT'])
//            }
//
//        }).addTo(map);
//    });
            
    $("#clear_search").click(function () {
        $("input:text").val("");
        map.removeLayer(selectedRevenue);
    });

    $("#clearall").click(function () {
        //var dist = document.getElementById("district");
        //$('#district').children('option:not(:first)').remove();
        // jQuery('#district').html('<option value="-1">Select District</option>');
        //dist.options = new Option('Select District', "");
        //$('#murraba').children('option:not(:first)').remove();
        //$('#revenue').children('option:not(:first)').remove();
        //$('#khasra').children('option:not(:first)').remove();
        //map.removeLayer(geojsonlay);
        $("#district").val("-1");
        $('#murraba').children('option:not(:first)').remove();
        $('#revenue').children('option:not(:first)').remove();
        $('#khasra').children('option:not(:first)').remove();
        if (geojsonlay) {
            map.removeLayer(geojsonlay);
        }
    });
/////////////////////////////////////////////////////////////////Search By Controlled Area./////////////////////////////////////////

 $("#districtCA").change(function () {
        var rev = document.getElementById("revenueCA");
        var length = rev.options.length;
        for (i = length - 1; i >= 0; i--) {
            rev.options[i] = null;
        }
        var Dist_Code = $(this).val();
        //  alert(district_code);
        var url = "api/revenuesearch";
        url += "?Dist_Code=" + Dist_Code;
        //alert(url);
        rev.options[0] = new Option('Select Village', "");
        $('#revenueCA').children('option:not(:first)').remove();
        $('#CA').children('option:not(:first)').remove();
       
       // $('#khasra').children('option:not(:first)').remove();

        //  alert(url);
        $.getJSON(url, function (data) {
            var rev1 = document.getElementById("revenueCA");
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                rev1.options[i + 1] = new Option(data[i].Name_Rev_Estate, data[i].Rev_Code);
            }
        });
         ///////////////////////////////////////////
        var CA = document.getElementById("CA");
        var length = CA.options.length;
        for (i = length - 1; i >= 0; i--) {
            CA.options[i] = null;
        }
        
        var Dist_Code = $(this).val();
        //  alert(district_code);
        var url1 = "api/CAsearch2";
        url1 += "?Dist_Code=" + Dist_Code;
        
        CA.options[0] = new Option('Select Controlled Area', "");
        $("#CA").children('option:not(:first)').remove();
        $.getJSON(url1, function (data) {
            var CA1 = document.getElementById("CA");
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                CA1.options[i + 1] = new Option(data[i].CA_Name, data[i].CA_Name);
            }
        });

    });
    
    ///////////////////////////////////////////
        $("#revenueCA").change(function () {
         load_queryCA();
           
         //layercontrol.toggleLayer("Revenue Estate Name (Label)", !0);
//alert('Akshay');
        var CA = document.getElementById("CA");
        var length = CA.options.length;
        for (i = length - 1; i >= 0; i--) {
            CA.options[i] = null;
        }
        var Rev_Code = $(this).val();
        //  alert(district_code);
        var url = "api/CAsearch";
        url += "?Rev_Code=" + Rev_Code;
        //alert(url);
        
        CA.options[0] = new Option('Select Controlled Area', "");
        $("#CA").children('option:not(:first)').remove();
        //$("#khasra").children('option:not(:first)').remove();

        //  alert(url);
        $.getJSON(url, function (data) {
            var CA1 = document.getElementById("CA");
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                CA1.options[i + 1] = new Option(data[i].CA_Name, data[i].CA_Name);
            }
        });

    });
    
   function load_queryCA() {
        $("#divLoading").addClass('show');
        //var Khasra_No = document.getElementById("khasra").value;
        //var Khasra_No = $("#khasra :selected").text();
        //var Rect_No = document.getElementById("khasra").value;
        //var Rect_No = $("#revenue :selected").text();
        var Rev_Code = document.getElementById("revenueCA").value;
        
        $.ajax({
            cache: false,
            url: "/api/searchdatarevenue",
            data: {_token: $("input[name$='_token']").val(),
                credentials: "same-origin",
                Rev_Code: Rev_Code
                },
            dataType: "json",
            type: "GET",
            success: function (e) {
                $("#divLoading").removeClass('show');
                (zoomTokhasra(e[0].WKT));
            }
        });
    }
    ; 
    
  ///////////////////////////////////////////////Urban Area /////////////////////////////////
  
    $("#districtUA").change(function () {
        var UAtype = document.getElementById("UAtype");
        var length = UAtype.options.length;
        for (i = length - 1; i >= 0; i--) {
            UAtype.options[i] = null;
        }
        var Dist_Code = $(this).val();
        //  alert(district_code);
        var url = "api/UAtype";
        url += "?Dist_Code=" + Dist_Code;
        //alert(url);
        UAtype.options[0] = new Option('Select Type of Urban Area', "");
        $('#UAtype').children('option:not(:first)').remove();
        $('#UA').children('option:not(:first)').remove();

        //  alert(url);
        $.getJSON(url, function (data) {
            var UAtype1 = document.getElementById("UAtype");
           
            //Add the Options to the DropDownList.
            for (var i = 0; i < data.length; i++) {
                UAtype1.options[i + 1] = new Option(data[i].Section, data[i].Rev_Code);
               
            }
        });
 
       

    }); 
    
    
});