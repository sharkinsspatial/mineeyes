var map = L.mapbox.map('map', 'sharkins.map-uwias8cf');
var geojson = {type:'FeatureCollection', features:[]};
$.ajax('http://api.geonames.org/rssToGeoRSS?feedUrl=https%3A%2F%2Fnews.google.com%2Fnews%2Ffeeds%3Fgl%3Dca%26q%3Dperu%2Bmining%2Bprotests%26um%3D1%26ie%3DUTF-8%26output%3Drss%26num%3D30&username=sharkinsgis&feedLanguage=en&country=pe').done(function(xml) {
    $(xml).find('item').each(function(){
       //console.log($(this).children('title').text());
       createFeature(this);
   });
console.log(geojson);   
});
function createFeature(xmlitem){
    var feature = {type: 'Feature', properties:{}};
    console.log($(xmlitem).children('title').text());
    feature.properties.title = $(xmlitem).children('title').text();
    coords = [$(xmlitem).children('geo\\:long'),$(xmlitem).children('geo\\:lat')];
    feature.properties.coordinates = coords;  
    geojson.features.push(feature);
} 
