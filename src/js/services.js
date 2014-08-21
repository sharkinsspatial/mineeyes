var services = (function() {
    function buildQueryString(data) {
        var params = [];
        for (var d in data) {
            params.push(d + '=' + data[d]);
        }
        return params.join('&');
    }
    
    function buildProjectsUrl() {
        var baseUrl = 'http://geocatmin.ingemmet.gob.pe/' +
        'arcgis/rest/services/SERV_CARTERA_PROYECTOS_MINEROS/MapServer/0/query';
        
        var params = {
           where: 'OBJECTID > 0',
           outFields: 'OBJECTID, EMPRESA, ESTADO',
           OutSR: 4326,
           f: 'json'
        };
        var projectsUrl = baseUrl + '?' + buildQueryString(params);
        return projectsUrl;
    }

    function buildNewsUrl() {
        var googleUrl = 'https://news.google.com/news/feeds';
        var googleParams = {
            gl: 'ca',
            q: 'peru+mining',
            um: 1,
            ie: 'UTF-8',
            output: 'rss',
            num: 40
        }; 
        var encodedGoogleUrl = encodeURIComponent(googleUrl + '?' + 
                                                  buildQueryString(googleParams));
        var geonamesUrl = 'http://api.geonames.org/rssToGeoRSS';
        var geonamesParams = {
            feedUrl: encodedGoogleUrl,
            username: 'sharkinsgis',
            feedLanguage: 'en', country: 'pe',
            addUngeocodedItems: 'false'
        };
        geonamesUrl = geonamesUrl + '?' + buildQueryString(geonamesParams);
        return geonamesUrl;
    }

    function fetchNewsData() {
        return $.ajax(buildNewsUrl());
    }

    function fetchProjectsData() {
        return $.getJSON(buildProjectsUrl());
    }

    function fetchEarthquakesData() {
        return $.getJSON(
            '/data/earthquakes.geojson'
        );
    }

    return {
        fetchNewsData: fetchNewsData,
        fetchProjectsData: fetchProjectsData,
        fetchEarthquakesData: fetchEarthquakesData
    };
})();
