/* global define, describe, it, expect, beforeEach */

define(['_tree'], function (_tree) {
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

        });

    });
});
