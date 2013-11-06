/*global define, describe, it, expect */

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
}(this, function (_tree, _) {

    'use strict';


    describe('Node ids', function () {
        it('are working in general', function () {
            var tree = _tree.inflate({n: 1});
            expect(tree.root().__id).not.toBe(null);
            expect(tree.root().__id).toEqual(0);
        });

        it('are unique after initial tree inflation', function () {
            var tree, ids;
            tree = _tree.inflate(
                {n: 1, k: [
                    {n: 1, k: [
                        {n: 1, k: []}, {n: 1, k: []}
                    ]},
                    {n: 1, k: [
                        {n: 1, k: []}, {n: 1, k: []}
                    ]}
                ]},
                _tree.inflate.byKey('k'));
            ids = [];
            tree.walk(function (n) {
                ids.push(n.id());
            });
            expect(ids).toEqual(_.uniq(ids));
            expect(_.uniq(ids).length).toBe(7);
        });

        it('are unique after parsed additions', function () {
            var tree, ids = [];
            tree = _tree.inflate(
                {n: 1, k: [
                    {n: 1, k: [{n: 1}, {n: 1}]},
                    {n: 1, k: [{n: 1}, {n: 1}]}
                ]},
                _tree.inflate.byKey('k'));
            
            tree = tree.root().parseAndAddChild({n: 1});
            tree.walk(function (n) {
                ids.push(n.id());
            });
            expect(ids).toEqual(_.uniq(ids));
            expect(_.uniq(ids).length).toBe(8);
        });

        it('are unique after node additions', function () {
            var tree, tree2, ids = [];
            tree = _tree.inflate(
                {n: 1, k: [
                    {n: 1, k: [{n: 1}, {n: 1}]},
                    {n: 1, k: [{n: 1}, {n: 1}]}
                ]},
                _tree.inflate.byKey('k'));
            
            // tree2 should have overlapping node ids with tree
            tree2 = _tree.inflate({n: 1, k: [{n: 1}]}, _tree.inflate.byKey('k'));

            // adding a childNode should reestablish valid ids
            tree = tree.root().addChildNode(tree2.root());

            tree.walk(function (n) {
                ids.push(n.id());
            });
            expect(ids).toEqual(_.uniq(ids));
            expect(_.uniq(ids).length).toBe(9);
        });

        // this is the most nonsensical assertion here, present only
        // for completeness' sake.
        it('are unique after tree deletions', function () {
            var tree, ids = [];
            tree = _tree.inflate(
                {n: 1, k: [
                    {n: 1, k: [{n: 1}, {n: 1}]},
                    {n: 1, k: [{n: 1}, {n: 1}]}
                ]},
                _tree.inflate.byKey('k'));
            

            // adding a childNode should reestablish valid ids
            tree = tree.root().children()[0].remove();

            tree.walk(function (n) {
                ids.push(n.id());
            });
            expect(ids).toEqual(_.uniq(ids));
            expect(ids.length).toBe(4);
        });

        it('are unique after moving nodes', function () {
            var tree, n3, n2, ids = [];
            tree = _tree.inflate(
                {n: 1, k: [
                    {n: 2, k: [{n: 1}, {n: 1}]},
                    {n: 3, k: [{n: 1}, {n: 1}]}
                ]},
                _tree.inflate.byKey('k'));
            
            n2 = tree.root().children()[0];
            n3 = tree.root().children()[1];
            
            // adding a childNode should reestablish valid ids
            tree = tree.moveNode(n3, n2);

            tree.walk(function (n) {
                ids.push(n.id());
            });
            expect(ids).toEqual(_.uniq(ids));
            expect(_.uniq(ids).length).toBe(7);
        });

    });
}));