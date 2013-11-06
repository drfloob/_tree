/* global module, require */
module.exports = function(grunt) {

    'use strict';
    
    grunt.initConfig({
        // for grunt-template-jasmine-requirejs
        connect: { manual: { options: { port: 8044,
                                        keepalive: true,
                                        debug: true,
                                        hostname: '*'
                                      }
                           }
                 }
    });
    

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-jasmine-node');


    grunt.registerTask('default', ['connect']);

};
