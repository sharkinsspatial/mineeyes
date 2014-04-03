describe('sideBarLists.sortByDate', function() {
    beforeEach(function() {
        setFixtures('<div id="articles"></div>');
    });
    it('should use DOM fixture', function() {
        expect($('#articles')).toHaveLength(1);
    });
    it('should place newest li item on top', function() {
        sideBarLists.init();  
        var pubdateFirst = new Date(2014, 1, 1, 0, 0, 0);
        var pubdateSecond = new Date(2014, 1, 2, 0, 0, 0);
        $('<li/>',{'datetime': pubdateFirst}).appendTo('#articleslist'); 
        $('<li/>',{'datetime': pubdateSecond}).appendTo('#articleslist'); 
        sideBarLists.sortByDate();
        expect($('#articleslist li:nth-child(1)').attr('datetime'))
               .toBeGreaterThan($('#articleslist li:nth-child(2)')
                                  .attr('datetime'));
    });
});

