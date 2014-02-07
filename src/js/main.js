var app = (function ($,L) {
    var _map;
    var _markers;
    var _markerMap = {};
    var _markersList = [];
    var _activeIcon; 

    function init() {
        _map = L.mapbox.map('map', 'sharkins.map-uwias8cf',{maxZoom:12});
        _activeIcon = new L.Icon.Default({iconUrl: 
                                        './images/marker-icon-red.png'});
        _markers = new L.MarkerClusterGroup({
            spiderfyDistanceMultiplier:1, 
            showCoverageOnHover:false
        });
        var articleList = $('#articlelist');
        $.ajax(buildRSSUrl()).done(function(xml) {
            $(xml).find('item').each(function(index){
                var xmlitem = $(this);
                if (xmlitem.children('geo\\:long').length > 0){
                    createFeature(index, xmlitem);
                    addListItem(index, xmlitem, articleList);
                }
            });
            var listItems = $('#articlelist li');
            sortByDate(listItems, articleList);
            listItems.on('click', articleClick);
            
            _markers.addLayers(_markersList);
            _map.addLayer(_markers);
        });
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
            num: 200
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
    function createFeature(index, xmlitem) {
        var latlng = new L.LatLng(parseFloat(xmlitem
                                             .children('geo\\:lat').text()),
                                  parseFloat(xmlitem
                                             .children('geo\\:long').text())); 
                                  var marker = L.marker(latlng);
                                  _markersList.push(marker);
                                  _markerMap[index] = marker;
    }
    function addListItem(index, xmlitem, articleList) {
        var articleTitle = xmlitem.children('title').text(); 
        var pubdate = new Date(xmlitem.children('pubDate').text());
        var newListItem = $('<li/>', {
            html: articleTitle,
            'id': index,
            'datetime': pubdate  
        });
        articleList.append(newListItem);
    }
    return {
        init: init,
        sortByDate: sortByDate,
        createFeature: createFeature
    };
})($,L);
