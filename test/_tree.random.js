/* global define, describe, it, expect, beforeEach */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['_tree', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        /* global module, require */
        module.exports = factory(require('_tree'), require('underscore'));
    } else {
        // Browser globals (root is window)
        factory(root._tree, root._);
    }
}(this, function (_tree) {
    'use strict';
    
    describe('_tree hidden properties', function () {
        var tree;
        beforeEach(function() {
            tree = _tree.create();
        });

        it('are not enumerable', function () {
            expect(tree.propertyIsEnumerable('__id')).toBe(false);
            expect(tree.propertyIsEnumerable('__root')).toBe(false);
            expect(tree.propertyIsEnumerable('__nextNodeId')).toBe(false);
        });

        it('are not writable', function () {
            expect(function(){tree.__id = 0;}).toThrow();
            expect(function(){tree.__root = 0;}).toThrow();
            expect(function(){tree.__nextNodeId = 0;}).toThrow();
        });

        it('are not configurable', function () {
            expect(function(){delete tree.__id;}).toThrow();
            expect(function(){delete tree.__root;}).toThrow();
            expect(function(){delete tree.__nextNodeId;}).toThrow();
            expect(tree.__id).toBeDefined();
            expect(tree.__root).toBeDefined();
            expect(tree.__nextNodeId).toBeDefined();
        });
    });
 
}));