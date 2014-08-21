describe('markers.ArticleMarkers.addMarker', function() {
    var articleMarkers;
    beforeEach(function() {
        articleMarkers = new markers.ArticleMarkers();
    });
    it('should add marker to layer', function() { 
        articleMarkers.addMarker(0, 0, 0);
        expect(articleMarkers.getLayers().length).toEqual(1);
    });
    it('should throw error with null lat or long', function() {
        expect(articleMarkers.addMarker.bind(0, null, null)).toThrow();
    });
});

