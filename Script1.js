// JavaScript source code
$(function () {
    $("html").removeClass("no-js");
    var autocompleteResults = [
      {
          title: [],
          extract: [],
          pageId: []
      }
    ], results = [], filteredAutocompleteResults = [];

    var capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    var changeText2 = function (e) {
        var request = $("input").val() + String.fromCharCode(e.which);
        $("#instant-search").text(request);

        var getAutocompleteResults = function (callback) {
            $.ajax({
                url: "https://en.wikipedia.org/w/api.php",
                data: {
                    format: "json",
                    action: "query",
                    generator: "search",
                    gsrlimit: 6,
                    prop: "extracts",
                    origin: "*",
                    exintro: false,
                    explaintext: false,
                    exsentences: 1,
                    gsrsearch: $("#search").val().trim()
                },
                beforeSend: function () {
                    $(".loading").show();
                },
                success: function (d) {
                    $(".loading").hide(); // padaryta bus dar loading animacija

                    autocompleteResults[0].title = [];
                    autocompleteResults[0].extract = [];
                    autocompleteResults[0].pageId = [];

                    if (d.query.pages) {
                        $.each(d.query.pages, function (i) {
                            autocompleteResults[0].title.push(d.query.pages[i].title);
                            autocompleteResults[0].extract.push(d.query.pages[i].extract);
                            autocompleteResults[0].pageId.push(d.query.pages[i].pageid);
                        });
                    }

                    autocompleteResults[0].title.sort(function (a, b) {
                        var nameA = a.toUpperCase();
                        var nameB = b.toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }

                        return 0;
                    });

                    autocompleteResults[0].title = autocompleteResults[0].title.map(
                      function (i) {
                          return i.toLowerCase();
                      }
                    );

                    filteredAutocompleteResults = autocompleteResults[0].title.filter(function (i) {
                        return (
                          i !=
                          $("#instant-search")
                            .text()
                            .trim()
                            .toLowerCase()
                        );
                    });

                    for (var i = 0; i < autocompleteResults[0].title.length; i++) {
                        results[i] = {
                            label: filteredAutocompleteResults[i],
                            extract: autocompleteResults[0].extract[i],
                            pageId: autocompleteResults[0].pageId[i]
                        };
                    }

                    callback(autocompleteResults[0]);
                },
                error: function () {
                    alert(
                      "AJAX Request failed. Please try again or contact using email n3olukas@gmail.com."
                    );
                },
                datatype: "json",
                cache: false
            });
        };

        $("#search").autocomplete({
            source: function (request, response) {
                getAutocompleteResults(function (d) {
                    if (results.length == 5) {
                        response(results);
                    } else {
                        response(results.slice(0, 5));
                    }
                });
            },
            response: function () {
                if ($("#instant-search").text()) {
                    $("table").css("display", "table");
                    $(".wikisearch-container").css("margin-top", 100);
                }
            },
            close: function () {
                if (!$(".ui-autocomplete").is(":visible")) {
                    $(".ui-autocomplete").show();
                }
            },
            focus: function () {
                return false;
            },
            delay: 0,
            select: function (e, ui) {

                $('#instant-search').text(ui.item.label);
                $('#search').val(ui.item.label);
                $("#search").autocomplete("option", "source", function (request, response) {


                    $.ajax({
                        url: "https://en.wikipedia.org/w/api.php",
                        data: {
                            format: "json",
                            action: "query",
                            generator: "search",
                            gsrlimit: 6,
                            prop: "extracts",
                            origin: "*",
                            exintro: false,
                            explaintext: false,
                            exsentences: 1,
                            gsrsearch: $("#search").val().trim()
                        },
                        beforeSend: function () {
                            $(".loading").show();
                        },
                        success: function (d) {
                            $(".loading").hide(); // padaryta bus dar loading animacija

                            autocompleteResults[0].title = [];
                            autocompleteResults[0].extract = [];
                            autocompleteResults[0].pageId = [];

                            if (d.query.pages) {
                                $.each(d.query.pages, function (i) {
                                    autocompleteResults[0].title.push(d.query.pages[i].title);
                                    autocompleteResults[0].extract.push(d.query.pages[i].extract);
                                    autocompleteResults[0].pageId.push(d.query.pages[i].pageid);
                                });
                            }

                            autocompleteResults[0].title.sort(function (a, b) {
                                var nameA = a.toUpperCase();
                                var nameB = b.toUpperCase();
                                if (nameA < nameB) {
                                    return -1;
                                }
                                if (nameA > nameB) {
                                    return 1;
                                }

                                return 0;
                            });

                            autocompleteResults[0].title = autocompleteResults[0].title.map(
                              function (i) {
                                  return i.toLowerCase();
                              }
                            );

                            filteredAutocompleteResults = autocompleteResults[0].title.filter(function (i) {
                                return (
                                  i !=
                                  $("#instant-search")
                                    .text()
                                    .trim()
                                    .toLowerCase()
                                );
                            });

                            for (var i = 0; i < autocompleteResults[0].title.length; i++) {
                                results[i] = {
                                    label: filteredAutocompleteResults[i],
                                    extract: autocompleteResults[0].extract[i],
                                    pageId: autocompleteResults[0].pageId[i]
                                };
                            }
                        },
                        error: function () {
                            alert(
                              "AJAX Request failed. Please try again or contact using email n3olukas@gmail.com."
                            );
                        },
                        datatype: "json",
                        cache: false
                    });

                    response(autocompleteResults[0].title);



                });

                // WORKS BUT IT SHOULD BE A DYNAMIC ARRAY FROM THE "D" OBJECT
                // response(["anarchism", "anarchist black cross", "black rose (symbolism)", "communist symbolism", "political symbolism"]);


                $("#search").autocomplete("search", ui.item.label);












                if ($(".search-results").css("opacity") != 1) {
                    $(".search-results h4").text(capitalizeFirstLetter(ui.item.label));
                    $(".search-results p").text(ui.item.extract);
                    $(".search-results a").prop(
                      "href",
                      "https://en.wikipedia.org/?curid=" + ui.item.pageId
                    );
                    $(".search-results").css("opacity", 1);
                } else if (
                  $(".search-results h4")
                    .text()
                    .toLowerCase() != ui.item.label
                ) {
                    $(".search-results").css("opacity", 0);
                    setTimeout(function () {
                        $(".search-results h4").text(capitalizeFirstLetter(ui.item.label));
                        $(".search-results p").text(ui.item.extract);
                        $(".search-results a").prop(
                          "href",
                          "https://en.wikipedia.org/?curid=" + ui.item.pageId
                        );
                        $(".search-results").css("opacity", 1);
                    }, 500);
                }
                return false;
            },
            open: function () {
                $(".ui-menu-item-wrapper").on("click", function () {
                    $("tr:first-child, .ui-menu-item-wrapper").css({
                        "background-color": "#fff",
                        color: "#000"
                    });
                    $(this).css({ "background-color": "#ffc800", color: "#fff" });
                });

                $(".ui-menu-item-wrapper").mouseleave(function () {
                    $(this)
                      .children()
                      .removeClass("ui-state-active");
                });

                $(".ui-menu-item-wrapper").hover(
                  function () {
                      if ($(this).css("background-color") != "rgb(255, 200, 0)") {
                          $(this).css({ "background-color": "#0ebeff", color: "#fff" });
                      }
                  },
                  function () {
                      if ($(this).css("background-color") != "rgb(255, 200, 0)") {
                          $(this).css({ "background-color": "#fff", color: "#000" });
                      }
                  }
                );
                $("tr:first-child").css({
                    "background-color": "#ffc800",
                    color: "#fff"
                });
            },
            create: function () {
                $(this).data("ui-autocomplete")._renderItem = function (ul, item) {
                    return $("<li>")
                      .append(
                        '<div class="ui-menu-item-wrapper"><div class="autocomplete-first-field"><i class="fa fa-search" aria-hidden="true"></i></div><div class="autocomplete-second-field three-dots">' +
                          item.label +
                          "</div></div>"
                      )
                      .appendTo(ul);
                };
            }
        });
    };

    var changeText1 = function (e) {
        if (
          /[-a-z0-90áãâäàéêëèíîïìóõôöòúûüùçñ!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\s\/]+/gi.test(
            String.fromCharCode(e.which)
          )
        ) {
            $("input").on("keypress", changeText2);
        }

        var getInputSelection = function (input) {
            var start = 0,
              end = 0;
            input.focus();
            if (
              typeof input.selectionStart == "number" &&
              typeof input.selectionEnd == "number"
            ) {
                start = input.selectionStart;
                end = input.selectionEnd;
            } else if (document.selection && document.selection.createRange) {
                var range = document.selection.createRange();
                if (range) {
                    var inputRange = input.createTextRange();
                    var workingRange = inputRange.duplicate();
                    var bookmark = range.getBookmark();
                    inputRange.moveToBookmark(bookmark);
                    workingRange.setEndPoint("EndToEnd", inputRange);
                    end = workingRange.text.length;
                    workingRange.setEndPoint("EndToStart", inputRange);
                    start = workingRange.text.length;
                }
            }
            return {
                start: start,
                end: end,
                length: end - start
            };
        };

        switch (e.key) {
            case "Backspace":
            case "Delete":
                e = e || window.event;
                var keyCode = e.keyCode;
                var deleteKey = keyCode == 46;
                var sel, deletedText, val;
                val = this.value;
                sel = getInputSelection(this);
                if (sel.length) {
                    // 0 kai paprastai trini po viena o 1 ar daugiau kai select su pele trini
                    $("#instant-search").text(
                      val.substr(0, sel.start) + val.substr(sel.end)
                    );
                } else {
                    $("#instant-search").text(
                      val.substr(0, deleteKey ? sel.start : sel.start - 1) +
                        val.substr(deleteKey ? sel.end + 1 : sel.end)
                    );
                }
                break;
            case "Enter":
                if ($("#instant-search").text()) {
                    console.log("Redirecting...");
                }
                break;
        }

        if (!$("#instant-search").text()) {
            $("table, .ui-autocomplete").hide();
            $(".wikisearch-container").css("margin-top", "");
        }

        if (
          $(".ui-menu-item-wrapper").hasClass("ui-state-active") &&
          (e.key == "ArrowRight" || e.key == "ArrowLeft")
        ) {
            $(".ui-autocomplete").autocomplete(""); // Error metas console ir taip neturėtų būti bet nežinau kaip padaryti kad pasirinkus elementą su <-- ar --> nepadarytų tik vieno rezultato todėl paliekam laikinai ;)
        }
    };

    $("input").on("keydown", changeText1);

    $("input").on("input", function (e) {
        $("#instant-search").text($("#search").val());
    });

    $("tr:first-child").on("click", function () {
        $(".ui-menu-item-wrapper").css({
            "background-color": "#fff",
            color: "#000"
        });
        $(this).css({ "background-color": "#ffc800", color: "#fff" });
        $("#search").val($("#instant-search").text());
        /*if ($('.search-results').css('opacity') != 1) {
          $('.search-results h4').text('Klaida');
          $('.search-results p').text(ui.item.extract);
          $('.search-results a').prop('href', 'https://en.wikipedia.org/?curid=' + ui.item.pageId);
          $('.search-results').css('opacity', 1);
        } else {
          $('.search-results').css('opacity', 0);
          setTimeout(function() {
            $('.search-results h4').text(capitalizeFirstLetter(ui.item.label));
            $('.search-results p').text(ui.item.extract);
            $('.search-results a').prop('href', 'https://en.wikipedia.org/?curid=' + ui.item.pageId);
            $('.search-results').css('opacity', 1);
          }, 500);
        }  */
    });

    $("table").hover(
      function () {
          if ($("tr:first-child").css("background-color") != "rgb(255, 200, 0)") {
              $("tr:first-child").css({
                  "background-color": "#0ebeff",
                  color: "#fff"
              });
          }
      },
      function () {
          if ($("tr:first-child").css("background-color") != "rgb(255, 200, 0)") {
              $("tr:first-child").css({ "background-color": "#fff", color: "#000" });
          }
      }
    );
    $(".search-results-container").append(
      '<div class="search-results"><h4>DJ Title</h4><p>DJ Description</p></div>'
    );
    $("body").addClass("loaded");
});
