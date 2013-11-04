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

    function deep(n, rollup) {
        rollup = rollup || [];
        if (n === 0) {
            return rollup;
        }
        if (rollup === []) {
            return deep(n-1, [n]);
        } else {
            return deep(n-1, [n, rollup]);
        }
    }

    function wide(n, rollup) {
        rollup = rollup || [];
        if (n === 0) {
            return [n, rollup];
        }
        rollup.push(n);
        return wide(n-1, rollup);
    }

    var ideep = deep(1024), iwide = wide(1024);

    return { 
        name: '1024 Deep - vs - 1024 Wide',
        tests: {
            '1024 wide': function() {
                _tree.inflate(iwide, _tree.inflate.byAdjacencyList);
            },
            '1024 deep': function () {
                tree = _tree.inflate(ideep, _tree.inflate.byAdjacencyList);
            }
        }
    };
}));