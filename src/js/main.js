var app = (function ($, L, document) {
    function init() {
        sideBarLists.init();
        articleMarkers = new ArticleMarkers();
        projectMarkers = new ProjectMarkers();
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
        
        googleNewsSearch.fetchData().then(function(data) {
            processRSSXML(data, articleMarkers, sideBarLists);
        }).then(function() {
            sideBarLists.sortByDate();
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
                q: 'peru+mining',
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
     
    function Markers () {
        this._markerMap = {};
        this._markerList = [];
        this._defaultIcon = new L.Icon.Default();
        this._activeIcon = new L.Icon.Default({iconUrl: 
                                             './images/marker-icon-red.png'});
        this._markers = new L.MarkerClusterGroup(
                {spiderfyDistanceMultiplier:1, showCoverageOnHover:false}
        );
    }

    Markers.prototype = {
        getMarkerLayer: function () {
            var layers = this._markers.getLayers();
            if (layers.length === 0) {
                this._markers.addLayers(this._markerList);
            }
            return this._markers;
        },
        
        getMarkerList: function () {
            return this._markerList;
        },
        
        activateMarker: function (id) {
            var activeMarker = this._markerMap[id];
            var activeIcon = this._activeIcon;
            this._markers.zoomToShowLayer(activeMarker, function(){
                activeMarker.setIcon(activeIcon);
            });
        },

        deactivateMarker: function (id) {
            var previousActiveMarker = this._markerMap[id];  
            if (previousActiveMarker) {
                previousActiveMarker.setIcon(this._defaultIcon);
            }
        }
    };
    
    function ProjectMarkers() {
        Markers.call(this);
        var projectURL = "http://geocatmin.ingemmet.gob.pe/arcgis/rest/services/SERV_CARTERA_PROYECTOS_MINEROS/MapServer/0";
        var that = this;
        this._clusteredFeatureLayer = new L.esri.clusteredFeatureLayer(
            projectURL, {
                cluster: that._markers,
                onEachMarker: function (geojson, marker) {
                    sideBarLists.addProjectListItem(geojson);
                    var activeIcon = that._activeIcon;
                    marker.on('click', function() {
                        this.setIcon(activeIcon);
                        $(document).trigger('projectMarkerClick', 
                                            [geojson.properties.OBJECTID]);
                    }); 
                    that._markerList.push(marker);
                    that._markerMap[geojson.properties.OBJECTID] = marker;
                }
            });
    } 
    ProjectMarkers.prototype = Object.create(Markers.prototype);    
    ProjectMarkers.prototype.getMarkerLayer = function () {
        return this._clusteredFeatureLayer;
    };
       
    function ArticleMarkers() {
        Markers.call(this);
    } 
    ArticleMarkers.prototype = Object.create(Markers.prototype);
    ArticleMarkers.prototype.addMarker = function (index, lat, lon) {
        var latlng = new L.LatLng(lat, lon);
        var marker = L.marker(latlng, {id: index});
        var activeIcon = this._activeIcon;
        marker.on('click', function() {
            this.setIcon(activeIcon);
            $(document).trigger('articleMarkerClick', [this.options.id]);
        }); 
        this._markerList.push(marker);
        this._markerMap[index] = marker;
    };

    var sideBarLists = (function () {
        var _projectsList = $('<ul/>', {'id': 'projectslist'});
        var _articlesList = $('<ul/>', {'id': 'articleslist'});
        function init() {
            $('#projects').append(_projectsList);
            $('#articles').append(_articlesList);
        }

        function addProjectListItem(geojson) {
            var listItem = $('<li/>', {
                html: geojson.properties.EMPRESA,
                'id': geojson.properties.OBJECTID
            });
            listItem.on('click', click);
            _projectsList.append(listItem);
        }
        
        function addArticleListItem(index, xmlitem) {
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
            listItem.on('click', click);
            listItem.append(itemLink);
            _articlesList.append(listItem);
        }

        function deactivatePrevious(source) {
            var selector = '#' + source + ' li.active'; 
            var event = source + 'Deactivated';
            var previousActiveLi = $(selector);
            $(document).trigger(event, 
                                [previousActiveLi.attr('id')]);
            previousActiveLi.removeClass('active');
        }

        function scrollTo(id, source) {
            deactivatePrevious(source);
            var divSelector = '#' + source;
            var activeSelector = '#' + source + 'list' + ' #' + id;
            var div = $(divSelector);
            var activeLi = $(activeSelector);
            activeLi.addClass('active');
            div.scrollTop(8);
            div.animate({
                duration: 'slow',
                scrollTop: activeLi.position().top
            });
        }
        
        function click(e) { 
            var source = $(e.target).parent().closest('div').attr('id');
            deactivatePrevious(source);
            var event = source + 'Activated';
            var activeLi = $(this);
            activeLi.addClass('active');
            $(document).trigger(event, [activeLi.attr('id')]);
        }
        
        function sortByDate() {
            var listItems = _articlesList.children('li');
            var list = _articlesList;
            if(listItems.length && list.length) {
                listItems.sort(function(a,b) {
                    return new Date($(a).attr('datetime')) - 
                        new Date($(b).attr('datetime'));
                }).each(function() {
                    list.prepend(this);
                }); 
            }
        }
        return {
            init: init,
            addArticleListItem: addArticleListItem,
            addProjectListItem: addProjectListItem,
            sortByDate: sortByDate,
            scrollTo: scrollTo
        };
    })();
 
    return {
        init: init,
        processRSSXML: processRSSXML,
        sideBarLists: sideBarLists,
        ArticleMarkers: ArticleMarkers
   };
})($, L, this.document);
