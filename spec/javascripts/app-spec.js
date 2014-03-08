describe('app.articleList.sortByDate', function() {
    beforeEach(function() {
        setFixtures('<div id="articles"></div>');
    });
    it('should use DOM fixture', function() {
        expect($('#articles')).toHaveLength(1);
    });
    it('should place newest li item on top', function() {
        app.articleList.init();  
        var pubdateFirst = new Date(2014, 1, 1, 0, 0, 0);
        var pubdateSecond = new Date(2014, 1, 2, 0, 0, 0);
        $('<li/>',{'datetime': pubdateFirst}).appendTo('#articlelist'); 
        $('<li/>',{'datetime': pubdateSecond}).appendTo('#articlelist'); 
        app.articleList.sortByDate();
        expect($('#articlelist li:nth-child(1)').attr('datetime'))
               .toBeGreaterThan($('#articlelist li:nth-child(2)')
                                  .attr('datetime'));
    });
});

describe('app.articleMarkers.addMarker', function() {
    var xmlItem;
    beforeEach(function() {
        var xml = '<item><geo:lat xmlns:geo="test">5.1</geo:lat>' + 
            '<geo:long xmlns:geo="test">1.4</geo:long></item>';
        var xmlDocument = $.parseXML(xml);
        xmlItem = $(xmlDocument).find('item');
    });
    it('should add marker to markerList', function() { 
        app.articleMarkers.addMarker(0, xmlItem);
        expect(app.articleMarkers.getMarkerList().length).toEqual(1);
    });
});
