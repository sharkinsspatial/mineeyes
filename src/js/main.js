var app = (function ($, L, document) {
    var _map;
    var _markers;
    var _markerMap = {};
    var _markerList = [];
    var _activeIcon; 

    function init() {
        _map = L.mapbox.map('map', 'sharkins.map-uwias8cf',{maxZoom:12});
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
                var articleList = processRSSXML(xml);
                var listItems = $('#articlelist li');
                sortByDate(listItems, articleList);
                listItems.on('click', articleClick);
                _markers.addLayers(_markerList);
                _map.addLayer(_markers);
        });
    }
    function processRSSXML(xml) {
        var articleList = $('<ul/>', {'id': 'articlelist'});
        $('#articles').append(articleList);
        $(xml)
            .find('item')
                .each(function(index) {
                    var xmlitem = $(this);
                    if (xmlitem.children('geo\\:long').length > 0) {
                        createFeature(index, xmlitem, _markerList, _markerMap);
                        addListItem(index, xmlitem, articleList);
                    }
                 });
        return articleList;
    }
    function articleClick(e) {
        var previousActiveLi = $('li.active');
        previousActiveMarker = _markerMap[previousActiveLi.attr('id')];  
        if (previousActiveMarker) {
            previousActiveMarker.setIcon(new L.Icon.Default());
        }
        previousActiveLi.removeClass('active');
        var activeLi = $(this);
        activeLi.addClass('active');
        activeMarker = _markerMap[activeLi.attr('id')];
        _markers.zoomToShowLayer(activeMarker, function(){
            activeMarker.setIcon(_activeIcon);
        });    
    }
    function sortByDate(listItems, list) {
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
    function createFeature(index, xmlitem, markerList, markerMap) {
        var latlng = new L.LatLng(parseFloat(xmlitem
                                             .children('geo\\:lat').text()),
                                  parseFloat(xmlitem
                                             .children('geo\\:long').text())); 
                                  var marker = L.marker(latlng);
                                  markerList.push(marker);
                                  markerMap[index] = marker;
    }
    function addListItem(index, xmlitem, articleList) {
        var titleComponents = xmlitem
                                .children('title')
                                .text()
                                .split(' - '); 
        var articleTitle = titleComponents[0];
        var articleOrigin = titleComponents[1];
        var pubdate = new Date(xmlitem.children('pubDate').text());
        var articleOriginUrl = xmlitem.children('link').text();
        var listItem = $('<li/>', {
            html: articleTitle,
            'id': index,
            'datetime': pubdate  
        });
        var itemLink = $('<a/>', {
            html: articleOrigin,
            'href': articleOriginUrl,
            'target': '_blank'
        });
        listItem.append(itemLink);
        articleList.append(listItem);
    }
    return {
        init: init,
        sortByDate: sortByDate,
        createFeature: createFeature
    };
})($, L, this.document);
