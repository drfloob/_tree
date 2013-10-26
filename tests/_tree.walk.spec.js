/*global jasmine, describe, it, expect, beforeEach, _tree, _ */
'use strict';

var _tree = require("_tree");

describe("_tree.walk", function () {

    describe("on an empty tree", function () {
        var tree;

        beforeEach(function () {
            tree = _tree.create();
        });

        describe("with method _tree.walk.dfpre", function () {
            it("finds only the root node", function () {
                var ids = [];
                tree.walk(function (n) { ids.push(n.__id); }, _tree.walk.dfpre);

                expect(ids.length).toBe(1);
                expect(ids[0]).toBe(1);
            });
        });

        describe("with method _tree.walk.dfpost", function () {
            it("finds only the root node", function () {
                var ids = [];
                tree.walk(function (n) { ids.push(n.__id); }, _tree.walk.dfpost);

                expect(ids.length).toBe(1);
                expect(ids[0]).toBe(1);
            });
        });

        describe("with method _tree.walk.bfpre", function () {
            it("finds only the root node", function () {
                var ids = [];
                tree.walk(function (n) { ids.push(n.__id); }, _tree.walk.bfpre);

                expect(ids.length).toBe(1);
                expect(ids[0]).toBe(1);
            });
        });

        describe("with method _tree.walk.bfpost", function () {
            it("finds only the root node", function () {
                var ids = [];
                tree.walk(function (n) { ids.push(n.__id); }, _tree.walk.bfpost);

                expect(ids.length).toBe(1);
                expect(ids[0]).toBe(1);
            });
        });

    });



    describe("on a complicated tree", function () {
        var tree;

        beforeEach(function () {
            tree = _tree.inflate([1, [2, 3, [4, 5], 6, [7, [8, 9], 10, [11, [12]]]]],
                                 _tree.inflate.byAdjacencyList);
        });

        describe("with method _tree.walk.dfpre", function () {
            it("finds all nodes in the correct order", function () {
                var vals = [];
                tree.walk(function (n) { vals.push(n.data()); }, _tree.walk.dfpre);
                expect(vals).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
            });
        });

        describe("with method _tree.walk.dfpost", function () {
            it("finds all nodes in the correct order", function () {
                var vals = [];
                tree.walk(function (n) { vals.push(n.data()); }, _tree.walk.dfpost);
                expect(vals).toEqual([2, 4, 5, 3, 8, 9, 7, 12, 11, 10, 6, 1]);
            });
        });

        describe("with method _tree.walk.bfpre", function () {
            it("finds all nodes in the correct order", function () {
                var vals = [];
                tree.walk(function (n) { vals.push(n.data()); }, _tree.walk.bfpre);
                expect(vals).toEqual([1, 2, 3, 6, 4, 5, 7, 10, 8, 9, 11, 12]);
            });
        });

        describe("with method _tree.walk.bfpost", function () {
            it("finds all nodes in the correct order", function () {
                var vals = [];
                tree.walk(function (n) { vals.push(n.data()); }, _tree.walk.bfpost);
                expect(vals).toEqual([12, 8, 9, 11, 4, 5, 7, 10, 2, 3, 6, 1]);
            });
        });

    });

});
