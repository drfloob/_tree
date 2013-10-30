/* global define, describe, it, expect, beforeEach */

define(['_tree', 'underscore'], function (_tree, _) {
    'use strict';

    describe('tree.walk', function () {

        describe('on an empty tree', function () {
            var tree;

            beforeEach(function () {
                tree = _tree.create();
            });

            describe('with method tree.walk.dfpre', function () {
                it('finds only the root node', function () {
                    var ids = [];
                    expect(tree).toBeDefined();
                    expect(tree.walk).toBeDefined();
                    tree.walk(function (n) { ids.push(n.__id); }, tree.walk.dfpre);

                    expect(ids.length).toBe(1);
                    expect(ids[0]).toBe(0);
                });
            });

            describe('with method tree.walk.dfpost', function () {
                it('finds only the root node', function () {
                    var ids = [];
                    tree.walk(function (n) { ids.push(n.__id); }, tree.walk.dfpost);

                    expect(ids.length).toBe(1);
                    expect(ids[0]).toBe(0);
                });
            });

            describe('with method tree.walk.bfpre', function () {
                it('finds only the root node', function () {
                    var ids = [];
                    tree.walk(function (n) { ids.push(n.__id); }, tree.walk.bfpre);

                    expect(ids.length).toBe(1);
                    expect(ids[0]).toBe(0);
                });
            });

            describe('with method tree.walk.bfpost', function () {
                it('finds only the root node', function () {
                    var ids = [];
                    tree.walk(function (n) { ids.push(n.__id); }, tree.walk.bfpost);

                    expect(ids.length).toBe(1);
                    expect(ids[0]).toBe(0);
                });
            });

        });



        describe('on a complicated tree', function () {
            var tree;

            beforeEach(function () {
                tree = _tree.inflate([1, [2, 3, [4, 5], 6, [7, [8, 9], 10, [11, [12]]]]],
                                     _tree.inflate.byAdjacencyList);
            });

            describe('with method tree.walk.dfpre', function () {
                it('finds all nodes in the correct order', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.dfpre);
                    expect(vals).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                });
            });

            describe('with method tree.walk.dfpost', function () {
                it('finds all nodes in the correct order', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.dfpost);
                    expect(vals).toEqual([2, 4, 5, 3, 8, 9, 7, 12, 11, 10, 6, 1]);
                });
            });

            describe('with method tree.walk.bfpre', function () {
                it('finds all nodes in the correct order', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.bfpre);
                    expect(vals).toEqual([1, 2, 3, 6, 4, 5, 7, 10, 8, 9, 11, 12]);
                });
            });

            describe('with method tree.walk.bfpost', function () {
                it('finds all nodes in the correct order', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.bfpost);
                    expect(vals).toEqual([12, 8, 9, 11, 4, 5, 7, 10, 2, 3, 6, 1]);
                });
            });


            describe('starting from non-root', function () {
                it('throws if node does not exist', function () {
                    var otherTree = _tree.create(),
                    rt = otherTree.root();
                    
                    expect(_.bind(tree.walk, this, function(){}, tree.walk.dfpre, rt)).toThrow();
                });

                it('walks the root fine', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.dfpre, tree.root());
                    expect(vals).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                });

                it('walks a single node', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.dfpre, tree.root().children()[0]);
                    expect(vals).toEqual([2]);
                });

                it('walks a subtree', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.dfpre, tree.root().children()[1]);
                    expect(vals).toEqual([3, 4, 5]);
                });

                it('walks a different subtree', function () {
                    var vals = [];
                    tree.walk(function (n) { vals.push(n.data()); }, tree.walk.dfpre, tree.root().children()[2]);
                    expect(vals).toEqual([6, 7, 8, 9, 10, 11, 12]);
                });

            });

        });

    });
});
