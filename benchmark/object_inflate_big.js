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
        name: 'Big object inflations',
        maxTime: 1,
        tests: {
            '11 kids': function() {
                _tree.inflate({a: 1, children: [{a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}]});
            },
            'complex': function () {
                _tree.inflate({a: 1, children: [
                    {a: 2}, 
                    {a: 3, children: [
                        {a: 4}, 
                        {a: 5}]}, 
                    {a: 6, children: [
                        {a: 7, children: [
                            {a: 8}, 
                            {a: 9}]}, 
                        {a: 10, children: [
                            {a: 11, children: [
                                {a: 12}]}]}]}]});
            }
        }
    };
}));