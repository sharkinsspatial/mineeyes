module.exports = function(grunt) {
    //Project configuration.
    grunt.initConfig({        
        jasmine : {
            src : ['src/**/sideBarLists.js', 'src/**/services.js', 
                'src/**/markers.js', 'src/**/main.js'],
            options : {
                specs : 'spec/**/*.js',
                vendor: [
                    'src/js/vendor/mapbox.js',
                    'src/js/vendor/Control.MiniMap.js',
                    'src/js/vendor/leaflet.markercluster.js',
                    'src/js/vendor/terraformer.min.js',
                    'src/js/vendor/terraformer-arcgis-parser.min.js',
                    'src/js/vendor/jquery-1.11.0.min.js'
                ],
                helpers: 'spec/helpers/*.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jasmine');
};
