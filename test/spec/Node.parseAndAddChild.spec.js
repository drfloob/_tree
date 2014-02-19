/*global define, describe, beforeEach, it, expect */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['_tree', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        /* global module, require */
        module.exports = factory(require('../../src/_tree'), require('underscore'));
    } else {
        factory(root._tree, root._);
    }
}(this, function (_tree, _) {
    'use strict';

    describe('_tree.Node.prototype.parseAndAddChild', function () {

        it('applies subclasses correctly using the default inflate function', function () {
            var tree, newTree, inflateFn, Base, Branch, Leaf;

            Base = _tree.Node.extend({
                c: function(n) { 
                    if (_.isUndefined(n)) {
                        return this.children();
                    } else {
                        return this.children()[n];
                    }
                }
            });
            Branch = Base.extend();
            Leaf = Base.extend();

            inflateFn = function(obj) {
                if (!_.has(obj, 'c')) {
                    this.setNode(new Leaf(this.tree, obj.n));
                } else {
                    this.setNode(new Branch(this.tree, obj.n));
                    this.children(obj.c);
                }
            };

            // we've already tested this much elsewhere
            tree = _tree.inflate({n: 1, c: [{n: 2}]}, inflateFn);

            expect(tree.root()).toEqual(jasmine.any(Branch));
            expect(tree.root().c(0)).toEqual(jasmine.any(Leaf));
            expect(tree.root()).not.toEqual(jasmine.any(Leaf));
            expect(tree.root().c(0)).not.toEqual(jasmine.any(Branch));


            // this is what is really under test
            newTree = tree.root().parseAndAddChild({n: 3, c: [{n: 4}, {n: 5, c: [{n: 6}]}]});

            expect(newTree.root()).toEqual(jasmine.any(Branch));
            expect(newTree.root().c(0)).toEqual(jasmine.any(Leaf));
            expect(newTree.root().c(1)).toEqual(jasmine.any(Branch));
            expect(newTree.root().c(1).c(0)).toEqual(jasmine.any(Leaf));
            expect(newTree.root().c(1).c(1)).toEqual(jasmine.any(Branch));
            expect(newTree.root().c(1).c(1).c(0)).toEqual(jasmine.any(Leaf));
        });



        it('applies subclasses correctly using the a custom inflate function', function () {
            var tree, newTree, inflateFactory, Base, Branch, Leaf;

            Base = _tree.Node.extend({
                c: function(n) { 
                    if (_.isUndefined(n)) {
                        return this.children();
                    } else {
                        return this.children()[n];
                    }
                }
            });
            Branch = Base.extend();
            Leaf = Base.extend();

            inflateFactory = function(key) {
                return function(obj) {
                    if (!_.has(obj, key)) {
                        this.setNode(new Leaf(this.tree, obj.n));
                    } else {
                        this.setNode(new Branch(this.tree, obj.n));
                        this.children(obj[key]);
                    }
                };
            };


            // we've already tested this much elsewhere
            tree = _tree.inflate({n: 1, c: [{n: 2}]}, inflateFactory('c'));

            expect(tree.root()).toEqual(jasmine.any(Branch));
            expect(tree.root().c(0)).toEqual(jasmine.any(Leaf));
            expect(tree.root()).not.toEqual(jasmine.any(Leaf));
            expect(tree.root().c(0)).not.toEqual(jasmine.any(Branch));


            // this is what is really under test
            newTree = tree.root().parseAndAddChild({n: 3, k: [{n: 4}, {n: 5, k: [{n: 6}]}]}, inflateFactory('k'));

            expect(newTree.root()).toEqual(jasmine.any(Branch));
            expect(newTree.root().c(0)).toEqual(jasmine.any(Leaf));
            expect(newTree.root().c(1)).toEqual(jasmine.any(Branch));
            expect(newTree.root().c(1).c(0)).toEqual(jasmine.any(Leaf));
            expect(newTree.root().c(1).c(1)).toEqual(jasmine.any(Branch));
            expect(newTree.root().c(1).c(1).c(0)).toEqual(jasmine.any(Leaf));


            // ensure the default inflate method is still the
            // original, after using the second argument to
            // parseAndAddChild
            newTree = newTree.root().parseAndAddChild({n: 7, c: [{n: 8}]});

            expect(newTree.root().c(2).data()).toBe(7);
            expect(newTree.root().c(2).c(0).data()).toBe(8);
        });
    });

}));