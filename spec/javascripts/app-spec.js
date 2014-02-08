describe('sortByDate', function() {
    beforeEach(function() {
        setFixtures('<ul id="articlelist"></ul>');
        var pubdateFirst = new Date(2014, 1, 1, 0, 0, 0);
        var pubdateSecond = new Date(2014, 1, 2, 0, 0, 0);
        $('<li/>',{'datetime': pubdateFirst}).appendTo('#articlelist'); 
        $('<li/>',{'datetime': pubdateSecond}).appendTo('#articlelist'); 
    });
    it('should use DOM fixture', function() {
        expect($('li')).toHaveLength(2);
    });
    it('should throw TypeError with undefined elements', function() {
        expect(app.sortByDate.bind(null, null)).toThrowError(TypeError);
    });
    it('should throw Error with empty jQuery selections', function() {
        expect(app.sortByDate.bind($(''), $(''))).toThrow();
    });
    it('should place newest li item on top', function() {
        app.sortByDate($('li'), $('#articlelist'));
        expect($('#articlelist li:nth-child(1)').attr('datetime'))
               .toBeGreaterThan($('#articlelist li:nth-child(2)')
                                  .attr('datetime'));
    });
});
describe('createFeature', function() {
    var markerList;
    var markerMap;
    var xmlItem;
    beforeEach(function() {
        markerList = [];
        markerMap = {};
        var xml = '<item><geo:lat xmlns:geo="test">5.1</geo:lat>' + 
            '<geo:long xmlns:geo="test">1.4</geo:long></item>';
        var xmlDocument = $.parseXML(xml);
        xmlItem = $(xmlDocument).find('item');
    });
    it('should add marker to markerList array', function() { 
        app.createFeature(0, xmlItem, markerList, markerMap);
        expect(markerList.length).toEqual(1);
    });
    it('should throw error with null xmlItem', function() {
        expect(app.createFeature.bind(0, null)).toThrow();
    });
});
