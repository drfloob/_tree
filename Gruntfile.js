/* global module */
module.exports = function(grunt) {

    'use strict';
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '    (c) 2013 A. J. Heller\n' +
                    '    _tree.js may be freely distributed under the MIT License.\n' +
                    '*/\n',
                mangle: {},
                compress: {},
                sourceMap: 'dist/_tree.min.js.map',
                preserveComments: 'some'
            },
            build: {
                src: '_tree.js',
                dest: 'dist/_tree.min.js'
            }
        },
        compare_size: {
            files: ['_tree.js', 'dist/_tree.min.js']
        },
        jshint: {
            src: {
                src: ['src/**/*.js'],
                options: { jshintrc: '.jshintrc' }
            },
            grunt: {
                src: ['Gruntfile.js'],
                options: { jshintrc: '.jshintrc' }
            },
            tests: {
                src: ['test/**/*.js'],
                options: { jshintrc: '.jshintrc' }
            }
        }
    });
    

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-compare-size');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['uglify']);
};
