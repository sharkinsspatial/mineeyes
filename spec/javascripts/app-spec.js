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
    it('should add marker to markerList', function() { 
        app.articleMarkers.addMarker(0, 0, 0);
        expect(app.articleMarkers.getMarkerList().length).toEqual(1);
    });
    it('should throw error with null lat or long', function() {
        expect(app.articleMarkers.addMarker.bind(0, null, null)).toThrow();
    });
});

describe('app.processRSSXML', function() {
    var xmlDocument;
    beforeEach(function() {
        xmlDocument = generateXMLData(true);
        spyOn(app.articleMarkers, 'addMarker');
        spyOn(app.articleList, 'addListItem');
        app.processRSSXML(xmlDocument);
    });
    it('calls articleMarkers.addMarker', function() {
        expect(app.articleMarkers.addMarker).toHaveBeenCalled();
    });
    it('calls articleMarkers.addMarker once for each xml item', function() {
        expect(app.articleMarkers.addMarker.calls.count()).toEqual(1);
    }); 
    it('calls articleMarkers.addMarker and articleList.addListItem with the ' +
       'same index key', function() {
        var indexKey = 0;
        var xmlItem = $($(xmlDocument).find('item').first().get(0));
        var lat = parseFloat(xmlItem.children('geo\\:lat').text());
        var lon = parseFloat(xmlItem.children('geo\\:long').text());      
        expect(app.articleMarkers.addMarker)
            .toHaveBeenCalledWith(indexKey, lat, lon);
        expect(app.articleList.addListItem)
            .toHaveBeenCalledWith(indexKey, xmlItem);
    });
});

describe('app.processRSSXML with invalid data', function() {
    beforeEach(function() {
        var xmlDocument = generateXMLData(false);
        spyOn(app.articleMarkers, 'addMarker');
        app.processRSSXML(xmlDocument);
    });
    it('does not call articleMarkers.addMarker without geo:long', function() {
        expect(app.articleMarkers.addMarker).not.toHaveBeenCalled();
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
