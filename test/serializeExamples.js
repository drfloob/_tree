/* global define, describe, it, expect, beforeEach */

define(['_tree', 'underscore'], function (_tree, _) {
    'use strict';

    describe('serialize examples', function () {
        describe('adjacency list', function () {
            it('serializes back to itself', function () {

                // Holy shit this is nasty

                var tree, callback, walkMethod;

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
                }

                var serialized = walkMethod(tree.root());
                expect(serialized).toEqual([1, [2, [3]]]);
            });
        });
    });

});