/* global define, describe, it, expect, beforeEach */

define(['_tree'], function (_tree) {
    'use strict';
    
    describe('Tree.moveNode', function () {
        it('works trivially', function () {
            var tree, newTree, movingNode, toNode, expectedId;

            tree = _tree.inflate([1, [2, [3,4], 5, [6,7]]], _tree.inflate.byAdjacencyList);
            movingNode = tree.findNodeByData(2);
            toNode = tree.findNodeByData(7);
            newTree = tree.moveNode(movingNode, toNode);
            expectedId = tree.__nextNodeId;

            expect(newTree.root().children().length).toEqual(1);
            expect(newTree.root().children()[0].children()[1].children()[0].data()).toEqual(2);
            expect(newTree.root().children()[0].children()[1].children()[0].id()).toEqual(expectedId);
        });
    });

});