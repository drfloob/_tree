/*global define, xdescribe, describe, beforeEach, it, expect */

define(['_tree'], function (_tree) {
    'use strict';

    // disabled to refactor _tree. this does not pass on PhantomJS
    xdescribe('node.children', function () {
        it('is immutable', function () {

            var tree, kids, tmpLen;
            tree = _tree.inflate({a: 1, children: [{a: 2}]});
            expect(Object.isFrozen(tree.root().children())).toBeTruthy();

            kids = tree.root().children();
            
            tmpLen = kids.length;
            kids.push(2);
            expect(tmpLen).toEqual(kids.length);
            expect(kids[1]).toBeUndefined();
            expect(kids[1]).not.toBe(2);
        });
    });

    describe('node.delete', function () {
        var tree;
        beforeEach(function () {
            tree = _tree.inflate(
                [{name: 'pops'}, [
                    {name: 'jr1'}, [{name: 'gjr1'}],
                    {name: 'jr2'}, [{name: 'gjr2'}],
                    {name: 'gjrx'}
                ]],
                _tree.inflate.byAdjacencyList);
        });

        it('cannot delete the root', function () {
            expect(tree.root().delete).toThrow();
        });

        it('can delete a child node with no children', function () {
            var newTree = tree.root().children()[2].delete();
            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toBe(2);
            expect(newTree.findByData({name: 'gjrx'})).toEqual(false);
        });

        it('can delete a child node with children', function () {
            var newTree = tree.root().children()[0].delete();

            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toBe(2);

            expect(newTree.findByData({name: 'jr1'})).toBe(false);
            expect(newTree.findByData({name: 'gjr1'})).toBe(false);

            expect(newTree.findByData({name: 'jr2'})).not.toBe(false);
            expect(newTree.findByData({name: 'gjr2'})).not.toBe(false);
        });

        it('rearranges the children array', function () {
            var newTree = tree.root().children()[0].delete();

            expect(newTree.root().children().length).toBe(2);
            expect(newTree.findByData({name: 'jr1'})).toBe(false);
            expect(newTree.findByData({name: 'jr2'})).toBe(newTree.root().children()[0]);
        });

        it('can delete everything but the root', function () {
            var newTree = tree.root().children()[0].delete()
                .root().children()[0].delete()
                .root().children()[0].delete();
           
            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toEqual(0);
        });

        it('has no effect on the original tree', function () {
            var newTree = tree.root().children()[2].delete();
            expect(tree.root().children()[2].data()).toEqual({name: 'gjrx'});
            expect(newTree.root().children()[2]).toBeUndefined();
        });
    });
});

