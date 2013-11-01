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
            // IE9 doesn't throw errors here (no strict mode
            // support). Not what I'm testing.
            try {root.__id = null;} catch(e){}
            try {root.__tree = null;} catch(e){}
            try {root.__data = null;} catch(e){}
            try {root.__children = null;} catch(e){}
            
            // but it does respect the writable setting
            expect(root.__id).not.toBeNull();
            expect(root.__tree).not.toBeNull();
            expect(root.__data).not.toBeNull();
            expect(root.__children).not.toBeNull();
        });

        it('are not configurable', function () {
            // IE9 doesn't throw errors here (no strict mode
            // support). Not what I'm testing.
            try {delete root.__id;} catch(e){};
            try {delete root.__tree;} catch(e){};
            try {delete root.__data;} catch(e){};
            try {delete root.__children;} catch(e){};

            // but it does respect the configurable setting
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

    describe('node.remove', function () {
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
            var msg;
            try {
                tree.root().remove();
            } catch (e) {
                msg = e.message;
            }
            expect(msg).toBe('cannot delete the root node');
        });

        it('can delete a child node with no children', function () {
            var newTree = tree.root().children()[2].remove();
            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toBe(2);
            expect(newTree.findNodeByData({name: 'gjrx'})).toEqual(false);
        });

        it('can delete a child node with children', function () {
            var newTree = tree.root().children()[0].remove();

            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toBe(2);

            expect(newTree.findNodeByData({name: 'jr1'})).toBe(false);
            expect(newTree.findNodeByData({name: 'gjr1'})).toBe(false);

            expect(newTree.findNodeByData({name: 'jr2'})).not.toBe(false);
            expect(newTree.findNodeByData({name: 'gjr2'})).not.toBe(false);
        });

        it('rearranges the children array', function () {
            var newTree = tree.root().children()[0].remove();

            expect(newTree.root().children().length).toBe(2);
            expect(newTree.findNodeByData({name: 'jr1'})).toBe(false);
            expect(newTree.findNodeByData({name: 'jr2'})).toBe(newTree.root().children()[0]);
        });

        it('can delete everything but the root', function () {
            var newTree = tree.root().children()[0].remove()
                .root().children()[0].remove()
                .root().children()[0].remove();
           
            expect(newTree.root().data()).toEqual({name: 'pops'});
            expect(newTree.root().children().length).toEqual(0);
        });

        it('has no effect on the original tree', function () {
            var newTree = tree.root().children()[2].remove();
            expect(tree.root().children()[2].data()).toEqual({name: 'gjrx'});
            expect(newTree.root().children()[2]).toBeUndefined();
        });
    });
}));

