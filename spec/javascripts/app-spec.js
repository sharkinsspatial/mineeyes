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

describe('app.processProjectsData with invalid data', function() {
    var projectMarkers;
    beforeEach(function() {
        sideBarLists.init();
        projectMarkers = new markers.ProjectMarkers();
        var esriData = generateESRIData(false);
        spyOn(sideBarLists, 'addProjectListItem');
        app.processProjectsData(esriData, projectMarkers, sideBarLists);
    });
    it('does not call sideBarLists.addProjectListItem with invalid x coord', function() {
        expect(sideBarLists.addProjectListItem).not.toHaveBeenCalled();
    });
});

describe('app.processProjectsData', function() {
    var projectMarkers;
    beforeEach(function() {
        sideBarLists.init();
        projectMarkers = new markers.ProjectMarkers();
        var esriData = generateESRIData(true);
        spyOn(sideBarLists, 'addProjectListItem');
        app.processProjectsData(esriData, projectMarkers, sideBarLists);
    });
    it('should call sideBarLists.addProjectListItem once for each valid feature', function() {
        expect(sideBarLists.addProjectListItem.calls.count()).toEqual(1);
    });
});

