/* global define, describe, it, expect, beforeEach */

define(['_tree'], function (_tree) {
    'use strict';
    
    describe('_tree.containsNode', function () {
        it('works trivially', function () {
            var tree = _tree.inflate([1, [2,3]], _tree.inflate.byAdjacencyList),
            otherTree = _tree.create();

            expect(tree.containsNode(tree.root())).toBe(true);
            expect(tree.containsNode(tree.root().children()[0])).toBe(true);
            expect(tree.containsNode(tree.root().children()[1])).toBe(true);
            expect(tree.containsNode(otherTree.root())).toBe(false);
        });
    });

    describe('_tree.containsData', function () {
        // TODO: empty tree look for null
        // TODO: nonempty tree look for null

        it('works trivially', function () {
            var tree = _tree.inflate([1, [2,3]], _tree.inflate.byAdjacencyList);

            expect(tree.containsData(0)).toBe(false);
            expect(tree.containsData(1)).toBe(true);
            expect(tree.containsData(2)).toBe(true);
            expect(tree.containsData(3)).toBe(true);
            expect(tree.containsData(4)).toBe(false);
        });
    });

});