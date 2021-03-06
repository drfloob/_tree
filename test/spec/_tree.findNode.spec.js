/*global define, describe, it, expect, beforeEach */

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

    describe('_tree.findNode', function () {
        describe('on an empty tree', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.create();
            });

            it('does not find the root node from a different tree', function () {
                var tmpTree, tmpNode;
                tmpTree = _tree.create();
                tmpNode = tmpTree.root();

                expect(tree.findNode(tmpNode)).toBe(false);
            });

            it('finds the root node from a clone', function () {
                var tmpTree, tmpNode;
                tmpTree = tree.root().data('new data');
                tmpNode = tmpTree.root();

                expect(tree.findNode(tmpNode) === tree.root()).toBeTruthy();
            });

            it('does not find non-existant children in a clone', function () {
                var tmpTree, tmpNode;
                tmpTree = tree.root().parseAndAddChild('test data');
                tmpNode = tmpTree.root().children()[0];

                expect(tree.findNode(tmpNode)).toBe(false);
            });
        });


        describe('with walkMethod on a non-unique data tree', function () {
            var tree, methods;
            beforeEach(function () {
                tree = _tree.inflate(
                    [{name: 'pops'}, [
                        {name: 'jr'}, [{name: 'gjr'}],
                        {name: 'jr'}, [{name: 'gjr'}],
                        {name: 'gjr'}
                    ]],
                    _tree.inflate.byAdjacencyList);
                methods = [tree.walk.dfpre, tree.walk.dfpost, tree.walk.bfpre, tree.walk.bfpost];
            });

            // all methods should work identically, but take varying
            // amounts of time to finish.
            _.each(methods, function (method) {
                it('finds unique data just fine', function () {
                    expect(tree.findNode(tree.root(), method)).toBe(tree.root());
                });

                it('finds the leftmost matching child by default', function () {
                    var node = tree.findNode(tree.root().children()[0], method);
                    expect(node).toBe(tree.root().children()[0]);
                    expect(node).not.toBe(tree.root().children()[1]);
                });

                it('finds the leftmost matching descendent by default', function () {
                    var node = tree.findNode(tree.root().children()[0].children()[0], method);
                    expect(node).toBe(tree.root().children()[0].children()[0]);
                    expect(node).not.toBe(tree.root().children()[1].children()[0]);
                    expect(node).not.toBe(tree.root().children()[2]);
                });

            });

        });
    });
    
}));