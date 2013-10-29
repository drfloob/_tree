/* global module, require */
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
                src: 'src/_tree.js',
                dest: 'dist/_tree.min.js'
            }
        },
        compare_size: {
            files: ['src/_tree.js', 'dist/_tree.min.js']
        },
        jshint: {
            options: { jshintrc: '.jshintrc' },
            src: { src: ['src/**/*.js'] },
            grunt: { src: ['Gruntfile.js'] },
            tests: { src: ['test/**/*.js'] }
        },
        jsonlint: {
            'pkg': { src: ['package.json'] }
        },
        
        // for grunt-template-jasmine-requirejs
        connect: { test: { options: { port: 8042, keepalive: false } },
                   manual: { options: { port: 8042, keepalive: true } }
                 },
        jasmine: {
            all: {
                src: 'src/**/*.js',
                options: {
                    // keepRunner: true,
                    specs: 'test/**/*.js',
                    host: 'http://127.0.0.1:8042',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'src/',
                            paths: { 'underscore': '/node_modules/underscore/underscore-min' },
                            shim: { 'underscore': { exports: '_' } }
                        }
                    }
                }
            }
        },
        docco: {
            main: {
                src: ['src/**/*.js'],
                options: {
                    output: 'docs/'
                }
            }
        },
        benchmark: {
            all: { src: ['benchmark/**/*.js'] },
            object: { src: ['benchmark/**/object_*.js'] },
            adjList: { src: ['benchmark/**/adjList_*.js'] }
        }
    });
    

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-compare-size');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-benchmark');


    grunt.registerTask('test', ['connect:test', 'jasmine']);
    grunt.registerTask('build', ['jshint', 'jsonlint', 'connect:test', 'jasmine', 'uglify', 'compare_size', 'docco']);

    grunt.registerTask('default', ['build']);

};
