module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            build: {
                src: [ 'dist' ]
            },
        },
        jasmine: {
            src: ['src/**/sideBarLists.js', 'src/**/services.js', 
                'src/**/markers.js', 'src/**/main.js'],
            options: {
                specs: 'spec/**/*.js',
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
        },
        dom_munger: {
            main: {
                options: {
                    read: [
                        {selector: 'link', attribute: 'href', writeto: 'cssRefs',
                            isPath: true},
                        {selector: 'script', attribute: 'src', writeto: 'jsRefs',
                            isPath: true}
                    ],
                    remove: ['link', 'script'],
                    append: [
                        {selector: 'head',
                            html: "<script src='//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>"},
                        {selector: 'head',
                            html:  "<script src='//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.js'></script>"},
                        {selector: 'head',
                            html: "<script src='js/app-min.js'></script>"},
                        {selector: 'head',
                            html: "<link href='//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.css' rel='stylesheet' />"},
                        {selector: 'head',
                            html: "<link href='css/app-min.css' rel='stylesheet'>"},
                    ]
                },
                src: 'src/index.html',
                dest: 'dist/index.html'
            }
        },
        cssmin: {
            main: {
              src:'<%= dom_munger.data.cssRefs %>', 
              dest:'dist/css/app-min.css'
            }
        },
        uglify: {
            main: {
              src: '<%= dom_munger.data.jsRefs %>', 
              dest:'dist/js/app-min.js'
            }
        },
        copy: {
          images: {
            files: [
              {expand: true, cwd: 'src', src: ['images/*'], dest: 'dist', filter: 'isFile'},
            ]
          },
          fonts: {
              files: [
                  {expand: true, cwd: 'src/css', src: ['fonts/*'], dest: 'dist/css', filter: 'isFile'},
              ]
          }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-dom-munger');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask(
        'build',
        ['jasmine', 'clean', 'dom_munger', 'cssmin', 'uglify', 'copy']
    );
};

