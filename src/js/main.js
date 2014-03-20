var app = (function ($, L, document) {
    function init() {
        articleList.init();
        projectMarkers.init();
        var map = L.mapbox.map('map', 'sharkins.map-uwias8cf', {maxZoom:12});
        map.on('ready', function() {
            var miniMap = new L.Control.MiniMap(L.mapbox.tileLayer(
                'sharkins.hc52c67l'), {position: 'bottomleft'})
                .addTo(map);
        });

        $(document)
            .hide()
            .ajaxStart(function() {
                $('#ajaxloader').show();
            })
            .ajaxStop(function() {
                $('#ajaxloader').hide();
            });

        $('#showSidebar').click(function(e) {
            $('#sidebar').toggleClass('active');
            e.stopPropagation();
        });
 
        $(document).on('articleMarkerClick', function(e, id) {
            articleList.scrollToArticle(id);
        });

        $(document).on('articleDeactivated', function(e, id) {
            articleMarkers.deactivateMarker(id);
        });

        $(document).on('articleActivated', function(e, id) { 
            articleMarkers.activateMarker(id);
            $('#sidebar').toggleClass('active');
        }); 
        
        googleNewsSearch.fetchData().then(processRSSXML).then(function() {
            articleList.sortByDate();
            map.addLayer(articleMarkers.getMarkerLayer());
        });
        
        $("input[name='radio']").on("change", function () {
            if (this.id == 'tab-articles') {
                map.addLayer(articleMarkers.getMarkerLayer());
                map.removeLayer(projectMarkers.getMarkerLayer());
            }
            else if (this.id == 'tab-projects') {
                map.removeLayer(articleMarkers.getMarkerLayer());
                map.addLayer(projectMarkers.getMarkerLayer());
            }
            else if (this.id == 'tab-earthquakes') {
                map.removeLayer(articleMarkers.getMarkerLayer());
                map.removeLayer(projectMarkers.getMarkerLayer());
            }
        });
    }
    
    function processRSSXML(xml) {
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
                            articleList.addListItem(index, xmlitem);
                        }
                     });
    }

    var googleNewsSearch = (function () {
        function buildRSSUrl() {
            function buildQueryString(data) {
                var params = [];
                for (var d in data) {
                    params.push(d + '=' + data[d]);
                }
                return params.join('&');
            } 
            var googleUrl = 'https://news.google.com/news/feeds';
            var googleParams = {
                gl: 'ca',
                q: 'peru+mining+protests',
                um: 1,
                ie: 'UTF-8',
                output: 'rss',
                num: 40
            }; 
            var encodedGoogleUrl = encodeURIComponent(googleUrl + '?' + 
                                                      buildQueryString(googleParams));
            var geonamesUrl = 'http://api.geonames.org/rssToGeoRSS';
            var geonamesParams = {
                feedUrl: encodedGoogleUrl,
                username: 'sharkinsgis',
                feedLanguage: 'en', country: 'pe',
                addUngeocodedItems: 'false'
            };
            geonamesUrl = geonamesUrl + '?' + buildQueryString(geonamesParams);
            return geonamesUrl;
        }

        function fetchData() {
            return $.ajax(buildRSSUrl());
        }

        return {
            fetchData: fetchData
        };
    })();
    
    var projectMarkers = (function () { 
        var _list = $('<ul/>', {'id': 'projects'});
        function init() {
            $('#projects').append(_list);
        }

        var projectURL = "http://geocatmin.ingemmet.gob.pe/arcgis/rest/services/SERV_CARTERA_PROYECTOS_MINEROS/MapServer/0";
        var _markers = new L.MarkerClusterGroup(
                {spiderfyDistanceMultiplier:1, showCoverageOnHover:false}
        );
        
        function addListItem(geojson) {
            var listItem = $('<li/>', {
                html: geojson.properties.EMPRESA,
                'id': geojson.properties.OBJECTID
            });
            _list.append(listItem);
        }

        var clusteredFeatureLayer = new L.esri.clusteredFeatureLayer(
            projectURL, {
                cluster: _markers,
                onEachMarker: addListItem  
        });

        function getMarkerLayer() {
            return clusteredFeatureLayer;
        }

        return {
            init: init,
            getMarkerLayer: getMarkerLayer
        };
    })();


    var articleMarkers = (function () {
        var _markerMap = {};
        var _markerList = [];
        var _defaultIcon = new L.Icon.Default();
        var _activeIcon = new L.Icon.Default({iconUrl: 
                                             './images/marker-icon-red.png'});
        var _markers = new L.MarkerClusterGroup(
                {spiderfyDistanceMultiplier:1, showCoverageOnHover:false}
        );
        
        function addMarker(index, lat, lon) {
            var latlng = new L.LatLng(lat, lon);
            var marker = L.marker(latlng, {id: index});
            marker.on('click', function() {
                this.setIcon(_activeIcon);
                $(document).trigger('articleMarkerClick', [this.options.id]);
            }); 
            _markerList.push(marker);
            _markerMap[index] = marker;
        }
        
        function getMarkerLayer() {
            var layers = _markers.getLayers();
            if (layers.length === 0) {
                _markers.addLayers(_markerList);
            }
            return _markers;
        }
        
        function getMarkerList() {
            return _markerList;
        }
        
        function activateMarker(id) {
            var activeMarker = _markerMap[id];
            _markers.zoomToShowLayer(activeMarker, function(){
                activeMarker.setIcon(_activeIcon);
            });
        }

        function deactivateMarker(id) {
            var previousActiveMarker = _markerMap[id];  
            if (previousActiveMarker) {
                previousActiveMarker.setIcon(_defaultIcon);
            }
        }
        
        return {
            addMarker: addMarker,
            getMarkerLayer: getMarkerLayer,
            getMarkerList: getMarkerList,
            activateMarker: activateMarker,
            deactivateMarker: deactivateMarker
        };
    })();

    var articleList = (function () {
        var _list = $('<ul/>', {'id': 'articlelist'});
        function init() {
            $('#articles').append(_list);
        }

        function addListItem(index, xmlitem) {
            var titleComponents = xmlitem
                                    .children('title')
                                    .text()
                                    .split(' - '); 
            var articleTitle = titleComponents[0];
            var articleOrigin = titleComponents[1];
            var pubdate = new Date(xmlitem.children('pubDate').text());
            var articleOriginUrl = xmlitem.children('link').text();
            var articleSpan = $('<span/>', {
                html: articleTitle
            });
            var listItem = $('<li/>', {
                html: articleSpan,
                'id': index,
                'datetime': pubdate  
            });
            var itemLink = $('<a/>', {
                html: articleOrigin,
                'href': articleOriginUrl,
                'target': '_blank'
            });
            listItem.on('click', articleClick);
            listItem.append(itemLink);
            _list.append(listItem);
        }

        function sortByDate() {
            var listItems = $('#articlelist li');
            var list = _list;
            if(listItems.length && list.length) {
                listItems.sort(function(a,b) {
                    return new Date($(a).attr('datetime')) - 
                        new Date($(b).attr('datetime'));
                }).each(function() {
                    list.prepend(this);
                }); 
            }
        }

        function deactivatePreviousArticle() {
            var previousActiveLi = $('li.active');
            $(document).trigger('articleDeactivated', 
                                [previousActiveLi.attr('id')]);
            previousActiveLi.removeClass('active');
        }
        
        function scrollToArticle(id) {
            deactivatePreviousArticle();
            var articles = $('#articles');
            var activeLi = $('#articlelist' + ' #' + id);
            activeLi.addClass('active');
            articles.scrollTop(8);
            articles.animate({
                duration: 'slow',
                scrollTop: activeLi.position().top
            });
        }

        function articleClick(e) { 
            deactivatePreviousArticle();
            var activeLi = $(this);
            activeLi.addClass('active');
            $(document).trigger('articleActivated', [activeLi.attr('id')]);
        }

        return {
            init: init,
            addListItem: addListItem,
            sortByDate: sortByDate,
            scrollToArticle: scrollToArticle
        };
    })();

    return {
        init: init,
        processRSSXML: processRSSXML,
        articleList: articleList,
        articleMarkers: articleMarkers
    };
})($, L, this.document);
