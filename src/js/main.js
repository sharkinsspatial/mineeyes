var app = (function () {
    var map;
    var markerMap = {};
    var markersList = [];
    function init() {
        map = L.mapbox.map('map', 'sharkins.map-uwias8cf',{maxZoom:12});
        $.ajax(buildRSSUrl()).done(function(xml) {
            $(xml).find('item').each(function(index){
                if ($(this).children('geo\\:long').length > 0){
                    createFeature(index,this);
                    addListItem(index, this);
                }
            });
            sortByDate($('li'),$('articlelist'));

            $('#articlelist li').click(function(e) {
                previousActiveMarker = markerMap[$('li.active').attr('id')];  
                if (previousActiveMarker)
                    previousActiveMarker.setIcon(new L.Icon.Default());
                $('li.active').removeClass('active');
                $(this).addClass('active');
                activeMarker = markerMap[$(this).attr('id')];
                markers.zoomToShowLayer(activeMarker, function(){
                    activeMarker.setIcon(activeIcon);
                });    
            });

            var activeIcon = new L.Icon.Default({
                iconUrl: './images/marker-icon-red.png'
            });

            var markers = new L.MarkerClusterGroup({
                spiderfyDistanceMultiplier:1, 
                showCoverageOnHover:false
            });
            markers.addLayers(markersList);
            map.addLayer(markers);
        });
    }
    function sortByDate(list,div) {
        list.sort(function(a,b) {
            return new Date($(a).attr('datetime')) - new Date($(b).attr('datetime'));
        }).each(function() {
            div.prepend(this);
        }); 
    }
    function buildRSSUrl() {
        function buildQueryString(data) {
            var params = [];
            for (var d in data)
                params.push(d + '=' + data[d]);
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
    function createFeature(index,xmlitem) {
        var latlng = new L.LatLng(parseFloat($(xmlitem).children('geo\\:lat').text()),
                                  parseFloat($(xmlitem).children('geo\\:long').text())); 
                                  var marker = L.marker(latlng);
                                  markersList.push(marker);
                                  markerMap[index] = marker;
    }
    function addListItem(index, xmlitem) {
        var articleTitle = $(xmlitem).children('title').text(); 
        var pubdate = new Date($(xmlitem).children('pubDate').text());
        var newListItem = $('<li/>', {
            html: articleTitle,
            'id': index,
            'datetime': pubdate  
        });
        $('#articlelist').append(newListItem);
    }
    return {
        init: init
    };
})();
