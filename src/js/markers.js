var markers = (function($, L, document) {
    function Markers() {
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
        getMarkerLayer: function() {
            var layers = this._markers.getLayers();
            if (layers.length === 0) {
                this._markers.addLayers(this._markerList);
            }
            return this._markers;
        },
        
        getMarkerList: function(){
            return this._markerList;
        },
        
        activateMarker: function(id) {
            var activeMarker = this._markerMap[id];
            var activeIcon = this._activeIcon;
            this._markers.zoomToShowLayer(activeMarker, function(){
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
    
    function ProjectMarkers() {
        Markers.call(this); 
    } 
    ProjectMarkers.prototype = Object.create(Markers.prototype);    
    ProjectMarkers.prototype.getMarkerLayer = function() {
        return this._markers;
    };
    ProjectMarkers.prototype.addMarkers = function(geojson) {
        var that = this;
        var geoJsonLayer = L.geoJson(geojson, { 
            pointToLayer: function(feature, latlng) {
                var marker = L.marker(latlng, {id: feature.id});
                var activeIcon = that._activeIcon;
                marker.on('click', function() {
                    this.setIcon(activeIcon);
                    $(document).trigger('projectMarkerClick', [this.options.id]);
                });
                that._markerList.push(marker);
                that._markerMap[feature.id] = marker;
                return marker;
            }
        });
        this._markers.addLayer(geoJsonLayer);
    };
       
    function ArticleMarkers() {
        Markers.call(this);
    } 
    ArticleMarkers.prototype = Object.create(Markers.prototype);
    ArticleMarkers.prototype.addMarker = function(index, lat, lon) {
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

    return {
        ProjectMarkers: ProjectMarkers,
        ArticleMarkers: ArticleMarkers
   };

})($, L, this.document);
