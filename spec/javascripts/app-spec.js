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

