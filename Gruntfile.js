/* global module, require */
module.exports = function(grunt) {

    'use strict';
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '    (c) 2013 A.J. Heller\n' +
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
            tests: { src: ['test/spec/**/*.js'] }
        },
        jsonlint: {
            'pkg': { src: ['package.json', 'bower.json'] }
        },
        
        // for grunt-template-jasmine-requirejs
        connect: { test: { options: { port: 8042, keepalive: false } },
                   manual: { options: { port: 8043,
                                        keepalive: true,
                                        debug: true,
                                        hostname: '*'
                                      }
                           }
                 },
        jasmine: {
            run: {
                src: ['src/**/*.js'],
                options: {
                    keepRunner: true,
                    specs: ['test/spec/**/*.js'],
                    host: 'http://127.0.0.1:8042',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'src/',
                            paths: { 'underscore': '../test/vendor/underscore-min' },
                            shim: { 'underscore': { exports: '_' } }
                        }
                    }
                }
            },
            cover: {
                src: ['src/**/*.js'],
                options: {
                    keepRunner: true,
                    specs: ['test/spec/**/*.js'],
                    host: 'http://127.0.0.1:8042',
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'coverage/coverage.json',
                        report: 'coverage',
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: {
                                baseUrl: '.grunt/grunt-contrib-jasmine/src/',
                                paths: { 'underscore': '../../../test/vendor/underscore-min' },
                                shim: { 'underscore': { exports: '_' } }
                            }
                        }
                    }
                }
            }
        },
        jasmine_node: {
            specFolders: ['test/spec'],
            forceExit: true
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
            adjList: { src: ['benchmark/**/adjList_*.js'] },
            removeAll: {src: ['benchmark/**/removeAll*.js']}
        },
        copy: {
            licenses: {
                files: [
                    {src: 'node_modules/backbone/LICENSE', dest: 'LICENSE.backbone'}
                ]
            },
            docco: {
                files: [
                    {src: 'LICENSE', dest: 'docs/LICENSE'},
                    {src: 'node_modules/backbone/LICENSE', dest: 'docs/LICENSE.backbone'}
                ]
            },
            vendor: {
                files: [
                    {src: 'node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.1/jasmine.css', dest: 'test/vendor/jasmine.css'},
                    {src: 'node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.1/jasmine.js', dest: 'test/vendor/jasmine.js'},
                    {src: 'node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.1/jasmine-html.js', dest: 'test/vendor/jasmine-html.js'},
                    {src: 'node_modules/jasmine-reporters/src/jasmine.tap_reporter.js', dest: 'test/vendor/jasmine.tap_reporter.js'},
                    {src: 'node_modules/underscore/underscore-min.js', dest: 'test/vendor/underscore-min.js'}
                ]
            }
        },
        markdown: {
            readme: {
                files: [{src: 'README.md', dest: 'README.html'}],
                options: { gfm: true, highlight: 'auto' }
            }
        },
        bump: {
            options: {
                files: ['bower.json', 'package.json'],
                commit: false,
                push: false,
                createTag: false
            }
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-bump');


    grunt.registerTask('phantom_test', ['copy:vendor', 'connect:test', 'jasmine:run']);
    grunt.registerTask('phantom_cover', ['copy:vendor', 'connect:test', 'jasmine:cover']);
    grunt.registerTask('test', ['jasmine_node']);
    grunt.registerTask('docs', ['docco', 'copy:docco']);
    grunt.registerTask('build', ['jshint', 'jsonlint', 'test', 'copy:licenses', 'uglify', 'compare_size', 'docs']);
    
    grunt.registerTask('default', ['build', 'docs', 'phantom_cover']);

};
