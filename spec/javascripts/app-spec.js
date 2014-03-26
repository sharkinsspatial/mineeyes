describe('app.sideBarLists.sortByDate', function() {
    beforeEach(function() {
        setFixtures('<div id="articles"></div>');
    });
    it('should use DOM fixture', function() {
        expect($('#articles')).toHaveLength(1);
    });
    it('should place newest li item on top', function() {
        app.sideBarLists.init();  
        var pubdateFirst = new Date(2014, 1, 1, 0, 0, 0);
        var pubdateSecond = new Date(2014, 1, 2, 0, 0, 0);
        $('<li/>',{'datetime': pubdateFirst}).appendTo('#articleslist'); 
        $('<li/>',{'datetime': pubdateSecond}).appendTo('#articleslist'); 
        app.sideBarLists.sortByDate();
        expect($('#articleslist li:nth-child(1)').attr('datetime'))
               .toBeGreaterThan($('#articleslist li:nth-child(2)')
                                  .attr('datetime'));
    });
});

describe('app.ArticleMarkers.addMarker', function() {
    var articleMarkers;
    beforeEach(function() {
        articleMarkers = new app.ArticleMarkers();
    });
    it('should add marker to markerList', function() { 
        articleMarkers.addMarker(0, 0, 0);
        expect(articleMarkers.getMarkerList().length).toEqual(1);
    });
    it('should throw error with null lat or long', function() {
        expect(articleMarkers.addMarker.bind(0, null, null)).toThrow();
    });
});

describe('app.processRSSXML', function() {
    var xmlDocument;
    var articleMarkers;
    beforeEach(function() {
        xmlDocument = generateXMLData(true);
        articleMarkers = new app.ArticleMarkers();
        spyOn(articleMarkers, 'addMarker');
        app.sideBarLists.init();
        spyOn(app.sideBarLists, 'addArticleListItem');
        app.processRSSXML(xmlDocument, articleMarkers, app.sideBarLists);
    });
    it('calls articleMarkers.addMarker', function() {
        expect(articleMarkers.addMarker).toHaveBeenCalled();
    });
    it('calls articleMarkers.addMarker once for each xml item', function() {
        expect(articleMarkers.addMarker.calls.count()).toEqual(1);
    }); 
    it('calls articleMarkers.addMarker and sideBarLists.addArticleListItem ' +
       'with the same index key', function() {
        var indexKey = 0;
        var xmlItem = $($(xmlDocument).find('item').first().get(0));
        var lat = parseFloat(xmlItem.children('geo\\:lat').text());
        var lon = parseFloat(xmlItem.children('geo\\:long').text());      
        expect(articleMarkers.addMarker)
            .toHaveBeenCalledWith(indexKey, lat, lon);
        expect(app.sideBarLists.addArticleListItem)
            .toHaveBeenCalledWith(indexKey, xmlItem);
    });
});

describe('app.processRSSXML with invalid data', function() {
    var articleMarkers;
    beforeEach(function() {
        articleMarkers = new app.ArticleMarkers();
        app.sideBarLists.init();
        var xmlDocument = generateXMLData(false);
        spyOn(articleMarkers, 'addMarker');
        app.processRSSXML(xmlDocument, articleMarkers, app.sideBarLists);
    });
    it('does not call articleMarkers.addMarker without geo:long', function() {
        expect(articleMarkers.addMarker).not.toHaveBeenCalled();
    });
});

function generateXMLData(valid) {
    var xml;
    if (valid) {
        xml = '<item><geo:lat xmlns:geo="test">5.1</geo:lat>' + 
            '<geo:long xmlns:geo="test">1.4</geo:long></item>';
    } else {
        xml = '<item><geo:lat xmlns:geo="test">5.1</geo:lat></item>';
    }
    var xmlDocument = $.parseXML(xml);
    return xmlDocument;
}
