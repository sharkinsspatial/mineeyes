module.exports = function(grunt) {
    //Project configuration.
    grunt.initConfig({
        jasmine : {
            src : 'src/**/*.js',
            options : {
                specs : 'spec/**/*.js',
                vendor: ['src/js/vendor/*.js']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jasmine');
};
