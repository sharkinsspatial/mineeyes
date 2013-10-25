var map = L.mapbox.map('map', 'sharkins.map-uwias8cf');
var geojson = {type:'FeatureCollection', features:[]};
var geonamesUrl = 'http://api.geonames.org/rssToGeoRSS?feedUrl=https%3A%2F%2Fnews.google.com%2Fnews%2Ffeeds%3Fgl%3Dca%26q%3Dperu%2Bmining%2Bprotests%26um%3D1%26ie%3DUTF-8%26output%3Drss%26num%3D30&username=sharkinsgis&feedLanguage=en&country=pe&addUngeocodedItems=false';
var markerMap = {};
$.ajax(geonamesUrl).done(function(xml) {
    $(xml).find('item').each(function(index){
       if ($(this).children('geo\\:long').length > 0){
           createFeature(index,this);
       }
    });
    console.log(geojson);   
    var markers = L.markerClusterGroup();
    var geoJsonLayer = L.geoJson(geojson, {
        pointToLayer: function (feature, latlng){
            var marker = L.marker(latlng);
            markerMap[feature.properties.id] = marker;
            return marker;
        }});
    markers.addLayer(geoJsonLayer);
    map.addLayer(markers);
    console.log(markerMap);
    map.on('click', function(){
        markers.zoomToShowLayer(markerMap[10], function(){});
    });

    
});
function createFeature(index,xmlitem){
    var feature = {type: 'Feature', properties:{}, geometry:{type: 'Point'}};
    feature.properties.id = index;
    feature.properties.title = $(xmlitem).children('title').text();
    coords = [parseFloat($(xmlitem).children('geo\\:long').text()),
                         parseFloat($(xmlitem).children('geo\\:lat').text())];
    feature.geometry.coordinates = coords;  
    geojson.features.push(feature);
} 
