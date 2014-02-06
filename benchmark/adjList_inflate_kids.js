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
        name: 'Inflating lists with children',
        tests: {
            'one child': function() {
                _tree.inflate([1, [2]], _tree.inflate.byAdjacencyList);
            },
            'two children': function() {
                _tree.inflate([1, [2, 3]], _tree.inflate.byAdjacencyList);
            },
            'four children': function() {
                _tree.inflate([1, [2, 3, 4, 5]], _tree.inflate.byAdjacencyList);
            },
            'eight children': function() {
                _tree.inflate([1, [2, 3, 4, 5, 6, 7, 8, 9]], _tree.inflate.byAdjacencyList);
            },
            'sixteen children': function() {
                _tree.inflate([1, [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19]], _tree.inflate.byAdjacencyList);
            }
        }
    };
}));