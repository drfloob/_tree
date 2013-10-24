/*global window, document, jasmine, describe, it, expect, beforeEach, _tree, _ */

describe("_tree.walk", function () {
    describe("with method _tree.walk.dfpre", function () {
        it("is the default walk method", function () {
            expect(_tree.create().defaults.walk).toEqual(_tree.walk.dfpre);
        });

        describe("on an empty tree", function () {
            var tree;

            beforeEach(function () {
                tree = _tree.create();
            });

            it("finds only the root node", function () {
                var ids = [];
                tree.walk(function(n){ ids.push(n.__id); });

                expect(ids.length).toBe(1);
                expect(ids[0]).toBe(1);
            });
        });

        describe("on a simple tree", function () {
            var tree;

            beforeEach(function () {
                tree = _tree.inflate([1, [2, 3, [4,5], 6]], _tree.inflate.byAdjacencyList);
            });

            it("finds all nodes in the correct order", function () {
                var vals = [];
                tree.walk(function(n){ vals.push(n.data()); });
                expect(vals).toEqual([1,2,3,4,5,6]);
            });
        });

    });
});
