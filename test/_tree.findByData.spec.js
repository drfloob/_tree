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

    describe('_tree.findNodeByData', function () {
        describe('on an empty tree', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.create();
            });

            it('finds nothing when searching for nothing', function () {
                expect(tree.findNodeByData()).toBeFalsy();
            });

            it('finds nothing when searching for null', function () {
                expect(tree.findNodeByData(null)).toBeFalsy();
            });

            it('finds nothing when searching for the root id', function () {
                expect(tree.findNodeByData(0)).toBeFalsy();
            });

            it('finds nothing when searching for the tree itself', function () {
                expect(tree.findNodeByData(tree)).toBeFalsy();
            });
        });

        describe('on a root-only tree', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.create();
                tree = tree.root().data('funky');
            });

            it('finds nothing when searching for nothing', function () {
                expect(tree.findNodeByData()).toBeFalsy();
            });

            it('finds nothing when searching for null', function () {
                expect(tree.findNodeByData(null)).toBeFalsy();
            });

            it('finds nothing when searching for the root id', function () {
                expect(tree.findNodeByData(0)).toBeFalsy();
            });

            it('finds nothing when searching for the tree itself', function () {
                expect(tree.findNodeByData(tree)).toBeFalsy();
            });
            
            it('finds the root node when searching for it', function () {
                expect(tree.findNodeByData('funky')).toBe(tree.root());
            });

        });


        describe('with non-unique data', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.inflate(
                    [{name: 'pops'}, [
                        {name: 'jr'}, [{name: 'gjr'}],
                        {name: 'jr'}, [{name: 'gjr'}],
                        {name: 'gjr'}
                    ]],
                    _tree.inflate.byAdjacencyList);
            });
            

            it('finds unique data just fine', function () {
                expect(tree.findNodeByData({name: 'pops'})).toBe(tree.root());
            });

            it('finds the leftmost matching child by default', function () {
                var node = tree.findNodeByData({'name': 'jr'});
                expect(node).toBe(tree.root().children()[0]);
                expect(node).not.toBe(tree.root().children()[1]);
            });

            it('finds the leftmost matching descendent by default', function () {
                var node = tree.findNodeByData({name: 'gjr'});
                expect(node).toBe(tree.root().children()[0].children()[0]);
                expect(node).not.toBe(tree.root().children()[1].children()[0]);
                expect(node).not.toBe(tree.root().children()[2]);
            });

            it('finds the shallowest matching child using breadth-first, preorder search', function () {
                var node = tree.findNodeByData({name: 'gjr'}, tree.walk.bfpre);
                expect(node).toBe(tree.root().children()[2]);
                expect(node).not.toBe(tree.root().children()[0].children()[0]);
                expect(node).not.toBe(tree.root().children()[1].children()[0]);
            });

            it('finds the leftmost matching child on the deepest level using breadth-first, postorder search', function () {
                var node = tree.findNodeByData({name: 'gjr'}, tree.walk.bfpost);
                expect(node).toBe(tree.root().children()[0].children()[0]);
                expect(node).not.toBe(tree.root().children()[1].children()[0]);
                expect(node).not.toBe(tree.root().children()[2]);

                node = tree.findNodeByData({name: 'jr'}, tree.walk.bfpost);
                expect(node).toBe(tree.root().children()[0]);
                expect(node).not.toBe(tree.root().children()[1]);
            });

        });
    });
    
}));