/* global define, describe, it, expect, beforeEach */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['_tree', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        /* global module, require */
        module.exports = factory(require('_tree'), require('underscore'));
    } else {
        factory(root._tree, root._);
    }
}(this, function (_tree, _) {
    'use strict';

    return {
        supportsImmutability: function() {
            var pt, match;
            if ((pt=navigator.userAgent.indexOf('Midori')) > -1) {
                match = 'Midori/0.4';
                return navigator.userAgent.slice(pt, pt+match.length) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('Epiphany')) > -1) {
                match = 'Epiphany/3.6.1';
                return navigator.userAgent.slice(pt, pt+match.length) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('MSIE')) > -1) {
                match = 'MSIE 9  ';
                return navigator.userAgent.slice(pt, pt+match.length) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('Chrome')) > -1) {
                match = 'Chrome/12';
                return navigator.userAgent.slice(pt, pt+match.length) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('Firefox')) > -1) {
                match = 'Firefox/4 ';
                return navigator.userAgent.slice(pt, pt+match.length) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('Version/')) > -1) {
                return navigator.userAgent.slice(pt, pt+9) >= 'Version/6';
            }
            if ((pt=navigator.userAgent.indexOf('iPhone OS')) > -1) {
                match = 'iPhone OS 5';
                return navigator.userAgent.slice(pt, pt+match.length) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('Apple-iPad')) > -1) {
                match = '901.334';
                var slashIdx = navigator.userAgent.indexOf('/', pt),
                spaceIdx = navigator.userAgent.indexOf(' ', slashIdx);
                return navigator.userAgent.slice(slashIdx+1, spaceIdx) >= match;
            }
            if ((pt=navigator.userAgent.indexOf('Galaxy Nexus')) > -1) {
                return true;
            }
            return false;
        }
    };
}));