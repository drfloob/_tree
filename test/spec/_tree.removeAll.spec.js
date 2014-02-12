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
        module.exports = factory(require('../../src/_tree'), require('underscore'));
    } else {
        // Browser globals (root is window)
        factory(root._tree, root._);
    }
}(this, function (_tree) {
    'use strict';

    describe('node.removeAll', function () {
        var tree;
        beforeEach(function() {
            tree = _tree.inflate(['', [1,2,3,4,5]], _tree.inflate.byAdjacencyList);
        });

        it('removes all matching nodes', function () {
            var newTree, kids;
            kids = [
                tree.root().children()[0],
                tree.root().children()[2],
                tree.root().children()[4],
            ];
            newTree = tree.root().removeAll(kids);

            expect(newTree.equals(tree)).toBe(true);
            expect(newTree.root().children().length).toBe(2);
            expect(newTree.root().children()[0].data()).toBe(2);
            expect(newTree.root().children()[1].data()).toBe(4);
        });

        it('does nothing on empty list', function () {
            var newTree, kids;
            kids = [];
            newTree = tree.root().removeAll(kids);

            expect(newTree.equals(tree)).toBe(true);
            expect(newTree.root().children().length).toBe(5);
            expect(newTree.root().children()[0].data()).toBe(1);
            expect(newTree.root().children()[1].data()).toBe(2);
            expect(newTree.root().children()[2].data()).toBe(3);
            expect(newTree.root().children()[3].data()).toBe(4);
            expect(newTree.root().children()[4].data()).toBe(5);
        });
    });
}));