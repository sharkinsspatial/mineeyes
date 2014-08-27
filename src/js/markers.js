var markers = (function($, L, document) {
    var clusterMarkers = {
        _markerMap: null,
        _defaultIcon: null,
        _activeIcon: null,
        activateMarker: function(id) {
            var activeMarker = this._markerMap[id];
            var activeIcon = this._activeIcon;
            this.zoomToShowLayer(activeMarker, function(){
                activeMarker.setIcon(activeIcon);
            });
        },
        deactivateMarker: function(id) {
            var previousActiveMarker = this._markerMap[id];  
            if (previousActiveMarker) {
                previousActiveMarker.setIcon(this._defaultIcon);
            }
        }
    };
    var initialize = function(options) {
                this._markerMap = {};
                this._defaultIcon = new L.Icon.Default();
                this._activeIcon = new L.Icon.Default({iconUrl: 
                                             './images/marker-icon-red.png'});
                L.MarkerClusterGroup.prototype.initialize.call(this, options);        
    };
    function ProjectMarkers() {
        var projectMarkers = L.MarkerClusterGroup.extend({
            includes: clusterMarkers,
            initialize: initialize,
            addMarkers: function(geojson) {
                var that = this;
                var geoJsonLayer = L.geoJson(geojson, { 
                    pointToLayer: function(feature, latlng) {
                        var marker = L.marker(latlng, {id: feature.id});
                        var activeIcon = that._activeIcon;
                        marker.on('click', function() {
                            this.setIcon(activeIcon);
                            $(document).trigger('projectMarkerClick', [this.options.id]);
                        });
                        that._markerMap[feature.id] = marker;
                        return marker;
                    }
                });
                this.addLayer(geoJsonLayer);
            }
        });
        return new projectMarkers({spiderfyDistanceMultiplier:1,
                                  showCoverageOnHover:false});
    }

    function ArticleMarkers() {
        var articleMarkers = L.MarkerClusterGroup.extend({
            includes: clusterMarkers,
            initialize: initialize,
            addMarker: function(index, lat, lon) {
                var latlng = new L.LatLng(lat, lon);
                var marker = L.marker(latlng, {id: index});
                var activeIcon = this._activeIcon;
                marker.on('click', function() {
                    this.setIcon(activeIcon);
                    $(document).trigger('articleMarkerClick', [this.options.id]);
                }); 
                this._markerMap[index] = marker;
                this.addLayer(marker);
            }
        });
        return new articleMarkers({spiderfyDistanceMultiplier:1,
                                  showCoverageOnHover:false});
    }

    function EarthquakeMarkers() {
        var earthquakeMarkers = L.GeoJSON.extend({
            _markerMap: {},
            initialize: function(data, options) {
                L.GeoJSON.prototype.initialize.call(this,data, {
                    onEachFeature: L.Util.bind(this._onEachFeature, this)
                });
            },
            options: {
                    pointToLayer: function(feature, latlng) {
                        return L.circle(latlng, 10000);
                    }
                },
                _onEachFeature: function(feature, layer) {
                    layer.options.id = feature.id;
                    this._markerMap[feature.id] = layer;
                    layer.on('click', function() {
                        $(document).trigger('earthquakeMarkerClick', [this.options.id]);
                    });
                },
                changeMarkerRadius: function(id, radius) {
                    var activeMarker = this._markerMap[id];
                    activeMarker.setRadius(radius);
                },
                activateMarker: function(id) {
                    var activeMarker = this._markerMap[id];
                    activeMarker._map.fitBounds(activeMarker.getBounds());
                }
            });
            return new earthquakeMarkers(null);
    }

    return {
        ProjectMarkers: ProjectMarkers,
        ArticleMarkers: ArticleMarkers,
        EarthquakeMarkers: EarthquakeMarkers
    };
})($, L, this.document);
