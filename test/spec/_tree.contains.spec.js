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
}(this, function (_tree, _) {
    'use strict';
    
    describe('_tree.containsNode', function () {
        var tree;

        beforeEach(function () {
            tree = _tree.inflate([1, [2,3]], _tree.inflate.byAdjacencyList);
        });

        it('finds all nodes', function () {
            expect(tree.containsNode(tree.root())).toBe(true);
            expect(tree.containsNode(tree.root().children()[0])).toBe(true);
            expect(tree.containsNode(tree.root().children()[1])).toBe(true);
        });

        it('does not find non-existant nodes', function () {
            var otherTree = _tree.create();
            expect(tree.containsNode(otherTree.root())).toBe(false);
        });

        it('throws on non-nodes', function () {
            expect(tree.containsNode).toThrow();
            expect(_.bind(tree.containsNode, tree, null)).toThrow();
            expect(_.bind(tree.containsNode, tree, 0)).toThrow();
            expect(_.bind(tree.containsNode, tree, {})).toThrow();
            expect(_.bind(tree.containsNode, tree, 'test')).toThrow();
        });
    });

    describe('_tree.containsData', function () {
        it('works trivially', function () {
            var tree = _tree.inflate([1, [2,3]], _tree.inflate.byAdjacencyList);

            expect(tree.containsData(0)).toBe(false);
            expect(tree.containsData(1)).toBe(true);
            expect(tree.containsData(2)).toBe(true);
            expect(tree.containsData(3)).toBe(true);
            expect(tree.containsData(4)).toBe(false);
        });

        it('finds nothing in an empty tree', function () {
            var tree = _tree.create();
            expect(tree.containsData()).toBe(false);
            expect(tree.containsData(null)).toBe(false);
            expect(tree.containsData(0)).toBe(false);
            expect(tree.containsData(tree)).toBe(false);
            expect(tree.containsData(tree.root())).toBe(false);
            expect(tree.containsData(tree.__id)).toBe(false);
            expect(tree.containsData(tree.root().id())).toBe(false);
        });

        it('is not tripped up by ids, nulls, or other related data', function () {
            var tree = _tree.inflate([1], _tree.inflate.byAdjacencyList);

            expect(tree.containsData()).toBe(false);
            expect(tree.containsData(null)).toBe(false);
            expect(tree.containsData(0)).toBe(false);
            expect(tree.containsData(tree)).toBe(false);
            expect(tree.containsData(tree.root())).toBe(false);
            expect(tree.containsData(tree.__id)).toBe(false);
            expect(tree.containsData(tree.root().id())).toBe(false);
            expect(tree.containsData(1)).toBe(true);
        });
    });
}));