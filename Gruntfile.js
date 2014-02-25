module.exports = function(grunt) {
    //Project configuration.
    grunt.initConfig({        
        jasmine : {
            src : 'src/**/main.js',
            options : {
                specs : 'spec/**/*.js',
                vendor: ['src/js/vendor/mapbox.js',
                    'src/js/vendor/leaflet.markercluster.js',
                    'src/js/vendor/jquery-1.11.0.min.js',
                    'src/js/vendor/Control.MiniMap.js']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jasmine');
};
