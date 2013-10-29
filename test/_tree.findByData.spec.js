/* global define, describe, it, expect, beforeEach */

define(['_tree'], function (_tree) {
    'use strict';

    describe('_tree.findByData', function () {
        describe('on an empty tree', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.create();
            });

            it('finds nothing when searching for nothing', function () {
                expect(tree.findByData()).toBeFalsy();
            });

            it('finds nothing when searching for null', function () {
                expect(tree.findByData(null)).toBeFalsy();
            });

            it('finds nothing when searching for the root id', function () {
                expect(tree.findByData(0)).toBeFalsy();
            });

            it('finds nothing when searching for the tree itself', function () {
                expect(tree.findByData(tree)).toBeFalsy();
            });
        });

        describe('on a root-only tree', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.create();
                tree = tree.root().data('funky');
            });

            it('finds nothing when searching for nothing', function () {
                expect(tree.findByData()).toBeFalsy();
            });

            it('finds nothing when searching for null', function () {
                expect(tree.findByData(null)).toBeFalsy();
            });

            it('finds nothing when searching for the root id', function () {
                expect(tree.findByData(0)).toBeFalsy();
            });

            it('finds nothing when searching for the tree itself', function () {
                expect(tree.findByData(tree)).toBeFalsy();
            });
            
            it('finds the root node when searching for it', function () {
                expect(tree.findByData('funky')).toBe(tree.root());
            });

        });


        describe('with non-unique data', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.inflate([{'name': 'pops'}, [{'name': 'jr'}, {'name': 'jr'}]], _tree.inflate.byAdjacencyList);
            });


            it('finds the leftmost matching child by default', function () {
                var node = tree.findByData({'name': 'jr'});
                expect(node).toBe(tree.root().children()[0]);
                expect(node).not.toBe(tree.root().children()[1]);
            });

            it('finds the shallowest matching child using breadth first search', function () {
                var node = tree.findByData({'name': 'jr'});
                throw new Error('supplying a walk fn is not supported');
            });


        });
    });
    
});