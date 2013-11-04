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
        name: 'create tests',
        maxTime: 1,
        fn: function() {
            _tree.create();
        }
    };
}));