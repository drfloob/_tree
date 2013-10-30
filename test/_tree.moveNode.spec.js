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
        root._tree = factory(root._tree, root._);
    }
}(this, function (_tree) {
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

}));