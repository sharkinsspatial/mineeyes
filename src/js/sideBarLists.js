var sideBarLists = (function($, L, document) {
    var _projectsList = $('<ul/>', {'id': 'projectslist'});
    var _articlesList = $('<ul/>', {'id': 'articleslist'});
    var _earthquakesList = $('<ul/>', {'id': 'earthquakeslist'});
    var _filteredProjectsList = $('<ul/>', {'id': 'filteredprojectslist'});
    var _metersConversionConstant = 1000;
    var _sliderMinimumDistanceConstant = 10;

    function init() {
        earthquakes = $('#earthquakes');
        $('#projects').append(_projectsList);
        $('#articles').append(_articlesList);
        earthquakes.append(_earthquakesList);
        $('#filteredprojects').append(_filteredProjectsList);
        earthquakesLabel = $('#earthquakeslabel');
        filteredprojectsLabel = $('#filteredprojectslabel');
    }

    function addProjectListItem(geojson) {
        addProjectItem(geojson, _projectsList);
    }

    function addFilteredProjectListItem(geojson) {
        addProjectItem(geojson, _filteredProjectsList);
    }

    function addProjectItem(geojson, ul) {
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
        //_projectsList.append(listItem);
        ul.append(listItem);
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

    function addEarthquakeListItems(data) {
        $.each(data.features, function(index, feature) {
            var titleComponents = feature.properties.title.split(' - ');
            var time = new Date(feature.properties.time);
            var magnitudeSpan = $('<span/>', {
                html: feature.properties.mag
            });
            var titleSpan = $('<span/>', {
                html: titleComponents[1]
            }).addClass('earthquaketitle');
            var listItem = $('<li/>', {
                'id': feature.id,
                'datetime': time
            });
            var sliderDiv = $('<div/>').addClass('slider');
            var damageDistanceSpan = $('<span/>').addClass('sub');
            sliderDiv.slider({
                    orientation: 'horizontal',
                    range: 'min',
                    value: 1,
                    min: _sliderMinimumDistanceConstant,
                    max: 500,
                    change: function(e, ui) {
                        damageDistanceSpan.text(ui.value + ' KM');
                        var id = $(e.target).parent().attr('id');
                        var event = 'earthquakeDistanceSliderChange';
                        var distanceMeters = ui.value * _metersConversionConstant;
                        $(document).trigger(event, [id, distanceMeters]);
                        //Hack for manual manipulation of slider
                        if (e.originalEvent) {
                            var activateEvent = 'earthquakesActivated';
                            $(document).trigger(activateEvent, [id]);
                        }
                    }
            });
            sliderDiv.slider('disable');
            damageDistanceSpan.text(sliderDiv.slider('value') + ' KM');
            listItem.append(titleSpan);
            listItem.append(sliderDiv);
            listItem.append(damageDistanceSpan);
            listItem.on('click', click);
            _earthquakesList.append(listItem);
        });
    }
    
    function deactivatePrevious(id, source) {
        var selector = '#' + source + ' li.active'; 
        var event = source + 'Deactivated';
        var previousActiveLi = $(selector);
        var previousActiveLiId = previousActiveLi.attr('id');
        if (id != previousActiveLiId) {
            var sliderDiv = previousActiveLi.children('div').first();
            sliderDiv.slider('disable');
            sliderDiv.slider('value', _sliderMinimumDistanceConstant);

            $(document).trigger(event, previousActiveLiId);
            previousActiveLi.removeClass('active');
        }
    }

    function scrollTo(id, source) {
        var scrollPosition = 0;
        deactivatePrevious(id, source);
        var divSelector = '#' + source;
        var activeSelector = '#' + source + 'list' + ' #' + id;
        var div = $(divSelector);
        var activeLi = $(activeSelector);
        activeLi.addClass('active');
        var sliderDiv = activeLi.children('div').first();
        sliderDiv.slider('enable');
        div.scrollTop(1);
        scrollPosition = activeLi.position().top;
        if (div.attr('id') == 'earthquakes') {
            scrollPosition = activeLi.position().top - earthquakesLabel.outerHeight();
            console.log(earthquakesLabel.outerHeight());
            console.log(scrollPosition);
        }
        if (div.attr('id') == 'filteredprojects') {
            var offsetHeight = filteredprojectsLabel.outerHeight() + 
                earthquakes.outerHeight() + earthquakesLabel.outerHeight();
            console.log(offsetHeight);
            scrollPosition = activeLi.position().top - offsetHeight;
        }
        div.animate({
            duration: 'slow',
            scrollTop: scrollPosition
        });
    }
    
    function click(e) { 
        var source = $(e.target).parent().closest('div').attr('id');
        var id = $(e.target).closest('li').attr('id');
        deactivatePrevious(id, source);
        var event = source + 'Activated';
        var activeLi = $(this);
        activeLi.addClass('active');
        var sliderDiv = activeLi.children('div').first();
        sliderDiv.slider('enable');
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
        addFilteredProjectListItem: addFilteredProjectListItem,
        addEarthquakeListItems: addEarthquakeListItems,
        sortByAlpha: sortByAlpha,
        sortByDate: sortByDate,
        scrollTo: scrollTo,
        displayProjectsError: displayProjectsError,
        displayArticlesError: displayArticlesError
    };
})($, L, this.document);
