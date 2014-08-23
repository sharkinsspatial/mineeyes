var app = (function($, L, document) {
    function init() {
        sideBarLists.init();
        articleMarkers = new markers.ArticleMarkers();
        projectMarkers = new markers.ProjectMarkers();
        earthquakeMarkers = new markers.EarthquakeMarkers();
        var map = L.mapbox.map('map', 'sharkins.map-uwias8cf', {maxZoom:12});
        map.on('ready', function() {
            var miniMap = new L.Control.MiniMap(L.mapbox.tileLayer(
                'sharkins.hc52c67l'), {position: 'bottomleft'})
                .addTo(map);
        });
        var articlesDiv = $('#articles');
        var projectsDiv = $('#projects');
        var mapDiv = $('#map');

        $(document)
            .hide()
            .ajaxSend(function(event, request, settings) {
                var parser = document.createElement('a');
                parser.href = settings.url;
                if (parser.hostname == 'api.geonames.org') {
                    articlesDiv.addClass('csspinner traditional');
                    mapDiv.addClass('csspinner traditional');
                }
                else if (parser.hostname == 'geocatmin.ingemmet.gob.pe') {
                    projectsDiv.addClass('csspinner traditional');
                    mapDiv.addClass('csspinner traditional');
                }
            })
            .ajaxComplete(function(event, request, settings) {
                var parser = document.createElement('a');
                parser.href = settings.url;
                if (parser.hostname == 'api.geonames.org') {
                    articlesDiv.removeClass('csspinner traditional');
                }
                else if (parser.hostname == 'geocatmin.ingemmet.gob.pe') {
                    projectsDiv.removeClass('csspinner traditional');
                }

            })
            .ajaxStop(function() {
                mapDiv.removeClass('csspinner traditional');
            });

        $('#showSidebar').click(function(e) {
            $('#sidebar').toggleClass('active');
            e.stopPropagation();
        });

        $('#hideSidebar').click(function(e) {
            $('#sidebar').toggleClass('active');
        });
 
        $(document).on('articleMarkerClick', function(e, id) {
            sideBarLists.scrollTo(id, 'articles');
        });

        $(document).on('projectMarkerClick', function(e, id) {
            sideBarLists.scrollTo(id, 'projects');
        });
        
        $(document).on('articlesDeactivated', function(e, id) {
            articleMarkers.deactivateMarker(id);
        });

        $(document).on('projectsDeactivated', function(e, id) {
            projectMarkers.deactivateMarker(id);
        });
        
        $(document).on('articlesActivated', function(e, id) { 
            articleMarkers.activateMarker(id);
            $('#sidebar').toggleClass('active');
        }); 

        $(document).on('projectsActivated', function(e, id) {
            projectMarkers.activateMarker(id);
            $('#sidebar').toggleClass('active');
        });

        $(document).on('earthquakesActivated', function(e, id) {
            console.log(id);
            var latlng = earthquakeMarkers.activateMarker(id, 100000);
            map.setView(latlng, 10);
        });
                 
        $("input[name='radio']").on('change', function() {
            if (this.id == 'tab-articles') {
                map.addLayer(articleMarkers);
                map.removeLayer(earthquakeMarkers);
                map.removeLayer(projectMarkers);
                articlesDiv.show();
                projectsDiv.hide();
            }
            else if (this.id == 'tab-projects') {
                map.removeLayer(articleMarkers);
                map.removeLayer(earthquakeMarkers);
                map.addLayer(projectMarkers);
                projectsDiv.show();
                articlesDiv.hide();
            }
            else if (this.id == 'tab-earthquakes') {
                map.removeLayer(articleMarkers);
                map.removeLayer(projectMarkers);
                map.addLayer(earthquakeMarkers);
            }
        });

        services.fetchProjectsData()
        .done(function(data) {
            processProjectsData(data, projectMarkers, sideBarLists);
        })
        .fail(function() {
            sideBarLists.displayProjectsError();
        });
        
        services.fetchNewsData()
        .then(function(data) {
            processRSSXML(data, articleMarkers, sideBarLists);
        })
        .then(function() {
            sideBarLists.sortByDate();
            if  ($('#tab-articles').is(':checked')) {
                map.addLayer(articleMarkers);
            }
        })
        .fail(function() {
            sideBarLists.displayArticlesError();
        });

        services.fetchEarthquakesData()
        .done(function(data) {
            earthquakeMarkers.addData(data);
            sideBarLists.addEarthquakeListItems(data);
        });
    }

    function processProjectsData(data, projectMarkers, sideBarLists) {
        var geojson = {
                type: 'FeatureCollection',
                features: []
            };
        $.each(data.features, function(index, esriFeature) {
            if (!isNaN(esriFeature.geometry.x) && !isNaN(
                esriFeature.geometry.y)) {
                    var feature = Terraformer.ArcGIS.parse(esriFeature);
                    geojson.features.push(feature);
                    sideBarLists.addProjectListItem(feature);
            }
        });
        projectMarkers.addMarkers(geojson);
        sideBarLists.sortByAlpha();
    }

    function processRSSXML(xml, articleMarkers, sideBarLists) {
        $(xml)
            .find('item')
                .each(function(index) {
                    var xmlitem = $(this);
                    if (xmlitem.children('geo\\:long').length > 0) {
                        var lat = parseFloat(xmlitem
                                             .children('geo\\:lat').text());
                        var lon = parseFloat(xmlitem
                                             .children('geo\\:long').text());

                        articleMarkers.addMarker(index, lat, lon);
                        sideBarLists.addArticleListItem(index, xmlitem);
                    }
                 });
    }

    return {
        init: init,
        processProjectsData: processProjectsData,
        processRSSXML: processRSSXML
   };
})($, L, this.document);
