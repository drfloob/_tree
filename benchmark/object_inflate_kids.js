// [UMD/returnExports.js](https://github.com/umdjs/umd/blob/master/returnExports.js)
// setup for AMD, Node.js, and Global usages.
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../src/_tree'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        /* global module, require */
        module.exports = factory(require('../src/_tree'));
    } else {
        // Browser globals (root is window)
        factory(root._tree);
    }
}(this, function (_tree) {

    return { 
        name: 'Inflating objects with children',
        maxTime: 1,
        tests: {
            'one kid': function() {
                _tree.inflate({'hi': 'there', children: [{'name': 'hork'}]});
            },
            'two kids': function() {
                _tree.inflate({'hi': 'there', children: [{'name': 'hork'}, {'whatever': 'for testing'}]});
            },
            'three kids': function() {
                _tree.inflate({'hi': 'there', children: [{'name': 'hork'}, {'whatever': 'for testing'}, {'why': 'not have another'}]});
            }
        }
    };
}));