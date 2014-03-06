var app = (function ($, L, document) {
    var _map;
    var _markers;
    var _markerMap = {};
    var _markerList = [];
    var _activeIcon; 
    var _defaultIcon;

    function init() {
        articleList.init();
        _map = L.mapbox.map('map', 'sharkins.map-uwias8cf', {maxZoom:12});
        _map.on('ready', function() {
            var miniMap = new L.Control.MiniMap(L.mapbox.tileLayer(
                'sharkins.hc52c67l'), {position: 'bottomleft'})
                .addTo(_map);
        });
        _defaultIcon = new L.Icon.Default();
        _activeIcon = new L.Icon.Default({iconUrl: 
                                        './images/marker-icon-red.png'});
        _markers = new L.MarkerClusterGroup({
            spiderfyDistanceMultiplier:1, 
            showCoverageOnHover:false
        });

        $(document)
            .hide()
            .ajaxStart(function() {
                $('#ajaxloader').show();
            })
            .ajaxStop(function() {
                $('#ajaxloader').hide();
            });

        $.ajax(buildRSSUrl())
            .done(function(xml) {
                processRSSXML(xml);
                _markers.addLayers(_markerList);
                _map.addLayer(_markers);
        });
        $(document).on('articleMarkerClick', function(e, id) {
            articleList.scrollToArticle(id);
        });
        $(document).on('articleDeactivated', function(e, id) {
            articleMarkers.deactivateMarker(id);
        });
        $(document).on('articleActivated', function(e, id) { 
            articleMarkers.activateMarker(id);
        });
    }
    function processRSSXML(xml) {
        $(xml)
            .find('item')
                .each(function(index) {
                    var xmlitem = $(this);
                    if (xmlitem.children('geo\\:long').length > 0) {
                        articleMarkers.createMarker(
                            index, xmlitem, _markerList, _markerMap);
                        articleList.addListItem(index, xmlitem);
                    }
                 });
        articleList.sortByDate();
    }
    
    //function markerClick(e) {
        //clearActive();
        //var articles = $('#articles');
        //var activeLi = $('#articlelist' + ' #' + this.options.id);
        //articles.scrollTop(0);
        //articles.animate({
            //duration: 'slow',
            //scrollTop: activeLi.position().top
        //});
        //activeLi.addClass('active');
        //this.setIcon(_activeIcon);
    //}
    //function clearActive() {
        //var previousActiveLi = $('li.active');
        //previousActiveMarker = _markerMap[previousActiveLi.attr('id')];  
        //if (previousActiveMarker) {
            //previousActiveMarker.setIcon(_defaultIcon);
        //}
        //previousActiveLi.removeClass('active');
    //} 
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
            feedLanguage: 'en',
            country: 'pe',
            addUngeocodedItems: 'false'
        };
        geonamesUrl = geonamesUrl + '?' + buildQueryString(geonamesParams);
        return geonamesUrl;
    }
     
    var articleMarkers = (function ($, document) {
        function createMarker(index, xmlitem, markerList, markerMap) {
            var latlng = new L.LatLng(parseFloat(xmlitem
                                                 .children('geo\\:lat').text()),
                                                 parseFloat(xmlitem.
                                                 children('geo\\:long').text()));
            var marker = L.marker(latlng, {id: index});
            //marker.on('click', markerClick);
            marker.on('click', function() {
                this.setIcon(_activeIcon);
                $(document).trigger('articleMarkerClick', [this.options.id]);
            }); 
            markerList.push(marker);
            markerMap[index] = marker;
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
            createMarker: createMarker,
            activateMarker: activateMarker,
            deactivateMarker: deactivateMarker
        };
    })($, document);

    var articleList = (function ($, document) {
        var _list;
        function init() {
            _list = $('<ul/>', {'id': 'articlelist'});
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
            else {
                throw new Error('Invalid list and target div');
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
            articles.scrollTop(0);
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
            //activeMarker = _markerMap[activeLi.attr('id')];
            //_markers.zoomToShowLayer(activeMarker, function(){
                //activeMarker.setIcon(_activeIcon);
            //});
        }

        return {
            init: init,
            addListItem: addListItem,
            sortByDate: sortByDate,
            scrollToArticle: scrollToArticle
        };
    })($, document);

    return {
        init: init
    };
})($, L, this.document);
