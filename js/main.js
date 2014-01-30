var map = L.mapbox.map('map', 'sharkins.map-uwias8cf',{maxZoom:12});
var geonamesUrl = 'http://api.geonames.org/rssToGeoRSS?feedUrl=https%3A%2F%2Fnews.google.com%2Fnews%2Ffeeds%3Fgl%3Dca%26q%3Dperu%2Bmining%2Bprotests%26um%3D1%26ie%3DUTF-8%26output%3Drss%26num%3D30&username=sharkinsgis&feedLanguage=en&country=pe&addUngeocodedItems=false';
var markerMap = {};
var markersList = [];
$.ajax(geonamesUrl).done(function(xml) {
    $(xml).find('item').each(function(index){
       if ($(this).children('geo\\:long').length > 0){
           console.log(this);
           createFeature(index,this);
           addListItem(index, this);
       }
    });
    
    $('li').sort(function(a,b) {
        return new Date($(a).attr('datetime')) - new Date($(b).attr('datetime'));
    }).each(function() {
        $('#articlelist').prepend(this);
    });
    
    $('#articlelist li').click(function(e) {
        $('li.active').removeClass('active');
        $(this).addClass('active');
        markers.zoomToShowLayer(markerMap[$(this).attr('id')], function(){});    
    });


    var markers = new L.MarkerClusterGroup({spiderfyDistanceMultiplier:1, 
                                           showCoverageOnHover:false});
    markers.addLayers(markersList);
    map.addLayer(markers);
    console.log(markerMap);

});
function createFeature(index,xmlitem){
    var latlng = new L.LatLng(parseFloat($(xmlitem).children('geo\\:lat').text()),
                         parseFloat($(xmlitem).children('geo\\:long').text())); 
    var marker = L.marker(latlng);
    markersList.push(marker);
    markerMap[index] = marker;
}
function addListItem(index, xmlitem){
    var articleTitle = $(xmlitem).children('title').text(); 
    var pubdate = new Date($(xmlitem).children('pubDate').text());
    var newListItem = $('<li/>', {
        html: articleTitle,
        'id': index,
        'datetime': pubdate  
    });
    $('#articlelist').append(newListItem);
}
