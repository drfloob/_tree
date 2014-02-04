/* global define, describe, it, expect */

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
        module.exports = factory(require('../../src/_tree'), require('underscore'));
    } else {
        // Browser globals (root is window)
        factory(root._tree, root._);
    }
}(this, function (_tree, _) {
    'use strict';

    describe('serialize examples', function () {
        describe('adjacency list', function () {
            it('serializes back to itself', function () {

                // Holy shit this is nasty

                var tree, walkMethod, serialized;

                tree = _tree.inflate([1, [2, [3]]], _tree.inflate.byAdjacencyList);

                walkMethod = function(node, parent) {
                    parent = parent || [];
                    parent.push(node.data());
                    if (node.children().length > 0) {
                        var kids = [];
                        _.each(node.children(), function(c){ return walkMethod(c, kids);});
                        parent.push(kids);
                    }
                    return parent;
                };

                serialized = walkMethod(tree.root());
                expect(serialized).toEqual([1, [2, [3]]]);
            });
        });
    });

}));