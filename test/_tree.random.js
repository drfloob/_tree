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
            try{tree.__id = null;} catch(e){}
            try{tree.__root = null;} catch(e){}
            try{tree.__nextNodeId = null;} catch(e){}

            expect(tree.__id).not.toBeNull();
            expect(tree.__root).not.toBeNull();
            expect(tree.__nextNodeId).not.toBeNull();
        });

        it('are not configurable', function () {
            try{delete tree.__id;}catch(e){}
            try{delete tree.__root;}catch(e){}
            try{delete tree.__nextNodeId;}catch(e){}

            expect(tree.__id).toBeDefined();
            expect(tree.__root).toBeDefined();
            expect(tree.__nextNodeId).toBeDefined();
        });
    });
 
}));