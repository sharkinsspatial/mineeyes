var sideBarLists = (function() {
    var _projectsList = $('<ul/>', {'id': 'projectslist'});
    var _articlesList = $('<ul/>', {'id': 'articleslist'});
    function init() {
        $('#projects').append(_projectsList);
        $('#articles').append(_articlesList);
    }

    function addProjectListItem(geojson) {
        function normalizeText(str) {
            var sentenceCase = str.replace(/\w\S*/g, 
                function(results){return results.charAt(0).toUpperCase() + 
                    results.substr(1).toLowerCase();
                });
            var normalizedAbbr = sentenceCase.replace(/[a-z]\./g, 
                function(results) {
                    return results.toUpperCase();
            });
            var normalizedAscii = normalizedAbbr.replace('?', 'ñ');
            return normalizedAscii;
        }
        
        function capitalizeFirstLetter(string) {
            var lower = string.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1); 
        }

        var company = normalizeText(geojson.properties.EMPRESA);
        var projectState = capitalizeFirstLetter(geojson.properties.ESTADO);
        var projectSpan = $('<span/>', {
            html: company
        });
        var stateSpan = $('<span/>', {
            html: projectState
        }).addClass('sub');
        var listItem = $('<li/>', {
            html: projectSpan,
            'id': geojson.properties.OBJECTID
        });
        listItem.append(stateSpan);
        listItem.on('click', click);
        _projectsList.append(listItem);
    }
    
    function addArticleListItem(index, xmlitem) {
        var titleComponents = xmlitem
                                .children('title')
                                .text()
                                .split(' - '); 
        var articleTitle = titleComponents[0];
        var articleOrigin = titleComponents[1];
        var pubdate = new Date(xmlitem.children('pubDate').text());
        var articleOriginUrl = xmlitem.children('link').text();
        var articleSpan = $('<span/>', {
            html: articleTitle
        });
        var listItem = $('<li/>', {
            html: articleSpan,
            'id': index,
            'datetime': pubdate  
        });
        var itemLink = $('<a/>', {
            html: articleOrigin,
            'href': articleOriginUrl,
            'target': '_blank'
        });
        listItem.on('click', click);
        listItem.append(itemLink);
        _articlesList.append(listItem);
    }

    function deactivatePrevious(source) {
        var selector = '#' + source + ' li.active'; 
        var event = source + 'Deactivated';
        var previousActiveLi = $(selector);
        $(document).trigger(event, 
                            [previousActiveLi.attr('id')]);
        previousActiveLi.removeClass('active');
    }

    function scrollTo(id, source) {
        deactivatePrevious(source);
        var divSelector = '#' + source;
        var activeSelector = '#' + source + 'list' + ' #' + id;
        var div = $(divSelector);
        var activeLi = $(activeSelector);
        activeLi.addClass('active');
        div.scrollTop(8);
        div.animate({
            duration: 'slow',
            scrollTop: activeLi.position().top
        });
    }
    
    function click(e) { 
        var source = $(e.target).parent().closest('div').attr('id');
        deactivatePrevious(source);
        var event = source + 'Activated';
        var activeLi = $(this);
        activeLi.addClass('active');
        $(document).trigger(event, [activeLi.attr('id')]);
    }
    
    function sortByAlpha() {
        var listItems = _projectsList.children('li');
        var list = _projectsList;
        if (listItems.length && list.length) {
            listItems.sort(function(a,b) {
                var textA = $(a).text();
                var textB = $(b).text();
                var compare;
                if (textA < textB) {
                    compare = -1;
                } 
                else if (textA > textB) {
                    compare = 1;
                }
                else {
                    compare = 0;
                }
                return compare;
            }).each(function() {
                list.append(this);
            });
        }
    }

    function sortByDate() {
        var listItems = _articlesList.children('li');
        var list = _articlesList;
        if(listItems.length && list.length) {
            listItems.sort(function(a,b) {
                return new Date($(a).attr('datetime')) - 
                    new Date($(b).attr('datetime'));
            }).each(function() {
                list.prepend(this);
            }); 
        }
    }

    function displayProjectsError() {
        var errorSpan = $('<span/>', {
            id: 'projectsError',
            html: 'There was a problem retrieving projects from the server' 
        });
        $('#projects').prepend(errorSpan);
    }

    function displayArticlesError() {
        var errorSpan = $('<span/>', {
            id: 'articlesError',
            html: 'There was a problem retrieving articles from the server' 
        });
        $('#articles').prepend(errorSpan);
    }
    return {
        init: init,
        addArticleListItem: addArticleListItem,
        addProjectListItem: addProjectListItem,
        sortByAlpha: sortByAlpha,
        sortByDate: sortByDate,
        scrollTo: scrollTo,
        displayProjectsError: displayProjectsError,
        displayArticlesError: displayArticlesError
    };
})();
