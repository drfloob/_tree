/*global define, describe, beforeEach, it, expect */

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
}(this, function (_tree, _) {
    'use strict';

    describe('_node.addChildNode', function () {
        var tree;
        beforeEach(function () {
            tree = _tree.inflate([1, [2, 3, [4, 5], 6, [7, [8, 9], 10, [11, [12]]]]],
                                 _tree.inflate.byAdjacencyList);
        });

        it('throws if not a node', function () {
            expect(tree.root().addChildNode).toThrow();
            expect(_.bind(tree.root().addChildNode, this, null)).toThrow();
            expect(_.bind(tree.root().addChildNode, this, 1)).toThrow();
            expect(_.bind(tree.root().addChildNode, this, [97, [98, 99]])).toThrow();
        });

        it('throws if the node is already in the tree', function () {
            expect(_.bind(tree.root().addChildNode, this, tree.root())).toThrow();
        });

        it('works trivially', function () {
            var tmpTree = _tree.inflate({'test': 'data'}),
            newTree = tree.root().addChildNode(tmpTree.root());
            
            expect(_.last(newTree.root().children()).data()).toEqual({'test': 'data'});
        });


        it('contains unique ids', function () {
            var vals = [], tmpTree = _tree.inflate({'test': 'data'}),
            newTree = tree.root().addChildNode(tmpTree.root());
            
            newTree.walk(function (n) { vals.push(n.__id); }, tree.walk.dfpre);
            expect(_.uniq(vals)).toEqual(vals);
        });

        it('sets a single node id properly', function () {
            var tmpTree = _tree.inflate({'test': 'data'}),
            expectedId = tree.__nextNodeId,
            newTree = tree.root().addChildNode(tmpTree.root());
            
            expect(newTree.findNodeByData({test: 'data'}).__id).toEqual(expectedId);
            expect(newTree.__nextNodeId).toBe(expectedId+1);
        });


        it('sets a tree of node ids properly', function () {
            var ids = [],
            tmpTree = _tree.inflate(['six', [7, [8, 9], 10, [11, [12]]]],
                                    _tree.inflate.byAdjacencyList),
            expectedSixId = tree.__nextNodeId,
            newTree = tree.root().addChildNode(tmpTree.root());
            
            newTree.walk(function (n) { ids.push(n.__id); }, tree.walk.dfpre, newTree.findNodeByData('six'));
            expect(ids).toEqual([expectedSixId, expectedSixId+1, expectedSixId+2, expectedSixId+3, expectedSixId+4, expectedSixId+5, expectedSixId+6]);
        });


        it('increments nextNodeId properly for one node', function () {
            var tmpTree = _tree.inflate({'test': 'data'}),
            expectedNextId = tree.__nextNodeId+1,
            newTree = tree.root().addChildNode(tmpTree.root());
            
            expect(newTree.__nextNodeId).toBe(expectedNextId);
        });

        it('increments nextNodeId properly for a tree', function () {
            var tmpTree = _tree.inflate(['six', [7, [8, 9], 10, [11, [12]]]],
                                    _tree.inflate.byAdjacencyList),
            expectedNextId = tree.__nextNodeId + 7,
            newTree = tree.root().addChildNode(tmpTree.root());
            
            expect(newTree.__nextNodeId).toBe(expectedNextId);
        });


        
    });
}));