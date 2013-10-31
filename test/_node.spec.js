/*global define, describe, beforeEach, it, expect */

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


    describe('_node hidden properties', function () {
        var tree, root;
        beforeEach(function() {
            tree = _tree.inflate({});
            root = tree.root();
        });

        it('are not enumerable', function () {
            expect(root.propertyIsEnumerable('__id')).toBe(false);
            expect(root.propertyIsEnumerable('__tree')).toBe(false);
            expect(root.propertyIsEnumerable('__data')).toBe(false);
            expect(root.propertyIsEnumerable('__children')).toBe(false);
        });

        it('are not writable', function () {
            expect(function(){root.__id = 0;}).toThrow();
            expect(function(){root.__tree = 0;}).toThrow();
            expect(function(){root.__data = 0;}).toThrow();
            expect(function(){root.__children = 0;}).toThrow();
        });

        it('are not configurable', function () {
            expect(function(){delete root.__id;}).toThrow();
            expect(function(){delete root.__tree;}).toThrow();
            expect(function(){delete root.__data;}).toThrow();
            expect(function(){delete root.__children;}).toThrow();
            expect(root.__id).toBeDefined();
            expect(root.__tree).toBeDefined();
            expect(root.__data).toBeDefined();
            expect(root.__children).toBeDefined();
        });
    });
 

    // This does not pass on PhantomJS
    describe('node.children', function () {
        it('is immutable', function () {

            var tree, kids, tmpLen;
            tree = _tree.inflate({a: 1, children: [{a: 2}]});
            kids = tree.root().children();
            tmpLen = kids.length;

            expect(Object.isFrozen(kids)).toBe(true);

            try {
                kids.push('test');
            } catch (e) {
                // firefox 25 throws TypeError: kids.push(...) is not extensible
                // chrome doesn't throw
            }
            expect(tmpLen).toEqual(kids.length);
            expect(kids[1]).toBeUndefined();
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
            expect(newTree.findNodeByData({name: 'gjrx'})).toEqual(false);
        });

        it('can delete a child node with children', function () {
            var newTree = tree.root().children()[0].delete();

            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toBe(2);

            expect(newTree.findNodeByData({name: 'jr1'})).toBe(false);
            expect(newTree.findNodeByData({name: 'gjr1'})).toBe(false);

            expect(newTree.findNodeByData({name: 'jr2'})).not.toBe(false);
            expect(newTree.findNodeByData({name: 'gjr2'})).not.toBe(false);
        });

        it('rearranges the children array', function () {
            var newTree = tree.root().children()[0].delete();

            expect(newTree.root().children().length).toBe(2);
            expect(newTree.findNodeByData({name: 'jr1'})).toBe(false);
            expect(newTree.findNodeByData({name: 'jr2'})).toBe(newTree.root().children()[0]);
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
}));

