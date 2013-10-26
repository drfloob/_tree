/*global jasmine, describe, it, expect, beforeEach, _tree, _ */
'use strict';
var _tree = require("_tree");

describe("_tree.deflate", function () {
    describe(".toKey", function () {

        it("returns `undefined` on an empty tree", function () {
            var tree = _tree.create();
            expect(tree.deflate()).toBeUndefined();
        });

        describe("on a trivial tree", function () {
            var tree, orig = {key: 'value'};
            beforeEach(function () {
                tree = _tree.inflate(orig);
            });

            it("returns the original object unchanged", function () {
                var defl;
                defl = tree.deflate();
                
                expect(defl).toEqual(orig);
                expect(defl.key).toBeDefined();
                expect(defl.key).toEqual('value');
            });
        });

        describe("on a simple tree", function () {
            var tree, 
            orig = {n: 1, k: [{n: 2}, {n: 3}]};

            beforeEach(function () {
                tree = _tree.inflate(orig, _tree.inflate.byKey('k'));
            });

            it("returns the original object unchanged", function () {
                var defl;
                defl = tree.deflate();
                
                expect(defl).toEqual(orig);
                expect(defl.key).toBeDefined();
                expect(defl.key).toEqual('value');
            });
        });


        describe("on a complex tree", function () {
            var tree, 
            orig = {n: 1, k: [
                {n: 2}, 
                {n: 3, k: [
                    {n: 4, k: [{n: 5}]}, 
                    {n: 6}]
                },
                {n: 7}
            ]};

            beforeEach(function () {
                tree = _tree.inflate(orig, _tree.inflate.byKey('k'));
            });

            it("returns the original object unchanged", function () {
                var defl;
                defl = tree.deflate();
                
                expect(defl).toEqual(orig);
                expect(defl.key).toBeDefined();
                expect(defl.key).toEqual('value');
            });
            
        });
    });
});


