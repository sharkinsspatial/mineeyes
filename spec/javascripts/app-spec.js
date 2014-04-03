describe('app.processRSSXML', function() {
    var xmlDocument;
    var articleMarkers;
    beforeEach(function() {
        xmlDocument = generateXMLData(true);
        articleMarkers = new markers.ArticleMarkers();
        spyOn(articleMarkers, 'addMarker');
        sideBarLists.init();
        spyOn(sideBarLists, 'addArticleListItem');
        app.processRSSXML(xmlDocument, articleMarkers, sideBarLists);
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
        expect(sideBarLists.addArticleListItem)
            .toHaveBeenCalledWith(indexKey, xmlItem);
    });
});

describe('app.processRSSXML with invalid data', function() {
    var articleMarkers;
    beforeEach(function() {
        articleMarkers = new markers.ArticleMarkers();
        sideBarLists.init();
        var xmlDocument = generateXMLData(false);
        spyOn(articleMarkers, 'addMarker');
        app.processRSSXML(xmlDocument, articleMarkers, sideBarLists);
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
