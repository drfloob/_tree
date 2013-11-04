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
        name: '30 Deep - vs - 30 Wide',
        tests: {
            '30 wide': function() {
                _tree.inflate([0, [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]], _tree.inflate.byAdjacencyList);
            },
            '30 deep': function () {
                tree = _tree.inflate([0, [1,[2,[3,[4,[5,[6,[7,[8,[9,[10,[1,[2,[3,[4,[5,[6,[7,[8,[9,[10,[1,[2,[3,[4,[5,[6,[7,[8,[9,[10]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
                                     _tree.inflate.byAdjacencyList);
            }
        }
    };
}));