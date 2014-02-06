/* global define, describe, it, expect, beforeEach, jasmine */

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
        module.exports = factory(require('../../src/_tree'), require('underscore'));
    } else {
        // Browser globals (root is window)
        factory(root._tree, root._);
    }
}(this, function (_tree, _) {
    'use strict';

    describe('_tree.mixin', function () {
        describe('for tree-object mixins', function () {
            describe('set on creation', function () {
                var tree,
                mixin = {
                    tree: {
                        spy: jasmine.createSpy('spy'),
                        getter: function () { return this.root().data(); },
                        setter: function(data) { return this.root().data(data); }
                    }
                };
                beforeEach(function () {
                    tree = _tree.create({mixins: [mixin]});
                    tree = tree.root().data('blort');
                });
                
                it('is mixed in', function () {
                    expect(tree.spy).toBeDefined();
                    expect(tree.getter).toBeDefined();
                    expect(tree.setter).toBeDefined();
                });

                it('can be called', function () {
                    tree.spy();
                    expect(tree.spy).toHaveBeenCalled();
                });

                it('has two-way access to the tree', function() {
                    expect(tree.getter()).toBe('blort');

                    tree = tree.setter('blonk');
                    expect(tree.getter()).toBe('blonk');
                    expect(tree.root().data()).toBe('blonk');
                });
            });


            describe('set dynamically', function () {
                var tree,
                mixin = {
                    tree: {
                        spy: jasmine.createSpy('spy'),
                        getter: function () { return this.root().data(); },
                        setter: function(data) { return this.root().data(data); }
                    }
                };
                beforeEach(function () {
                    tree = _tree.create();
                    tree = tree.root().data('blort');
                    tree = tree.mixin(mixin);
                });
                
                it('can be mixed in', function () {
                    expect(tree.spy).toBeDefined();
                    expect(tree.getter).toBeDefined();
                    expect(tree.setter).toBeDefined();
                });

                it('can be called', function () {
                    tree.spy();
                    expect(tree.spy).toHaveBeenCalled();
                });

                it('has two-way access to the tree', function() {
                    expect(tree.getter()).toBe('blort');

                    tree = tree.setter('blonk');
                    expect(tree.getter()).toBe('blonk');
                    expect(tree.root().data()).toBe('blonk');
                });
            });
        });

        describe('for node object mixins', function () {
            describe('set on creation', function () {
                var tree, mixin;
                
                mixin = {
                    node: {
                        spy: jasmine.createSpy('spy'),
                        nkids: function () { return this.children().length; },
                        setter: function(name) {
                            // returns the same node, rather than the
                            // new tree, for chaining
                            var newTree = this.data(_.defaults({n: name}, this.data()));
                            return newTree.findNode(this);
                        }
                    }
                };

                beforeEach(function () {
                    tree = _tree.inflate({n: 1, 'k': [{n: 2, k: [{n: 3}, {n: 4}]}]}, _tree.inflate.byKey('k'), {mixins: [mixin]});
                });
                
                it('is mixed in', function () {
                    tree.walk(function(n) {
                        expect(n.spy).toBeDefined();
                        expect(n.nkids).toBeDefined();
                        expect(n.setter).toBeDefined();
                    });
                });

                it('can be called', function () {
                    tree.walk(function(n) {
                        n.spy();
                    });
                    expect(mixin.node.spy.calls.length).toBe(4);
                });

                it('can access and modify the tree', function() {

                    var checkFn = function(n, num_kids, nVal) {
                        var newN;
                        expect(n.nkids()).toBe(num_kids);
                        expect(n.data().n).toEqual(nVal);
                        newN = n.setter('blort').setter('crub');
                        expect(newN.data().n).toBe('crub');
                        expect(n.equals(newN)).toBe(true);
                        expect(n.tree() === newN.tree()).toBe(false);
                        return newN.tree();
                    };

                    // Note that since the tree is being updated for
                    // every node, you have to find the next node
                    // based on the latest tree, or lose past changes.

                    tree = checkFn(tree.root(), 1, 1);
                    tree = checkFn(tree.root().children()[0], 2, 2);
                    tree = checkFn(tree.root().children()[0].children()[0], 0, 3);
                    tree = checkFn(tree.root().children()[0].children()[1], 0, 4);
                });
            });


            describe('set dynamically', function () {
                var tree, mixin;
                
                mixin = {
                    node: {
                        spy: jasmine.createSpy('spy'),
                        nkids: function () { return this.children().length; },
                        setter: function(name) {
                            // returns the same node, rather than the
                            // new tree, for chaining
                            var newTree = this.data(_.defaults({n: name}, this.data()));
                            return newTree.findNode(this);
                        }
                    }
                };

                beforeEach(function () {
                    tree = _tree.inflate({n: 1, 'k': [{n: 2, k: [{n: 3}, {n: 4}]}]}, _tree.inflate.byKey('k'));
                    tree = tree.mixin(mixin);
                });
                
                it('is mixed in', function () {
                    tree.walk(function(n) {
                        expect(n.spy).toBeDefined();
                        expect(n.nkids).toBeDefined();
                        expect(n.setter).toBeDefined();
                    });
                });

                it('can be called', function () {
                    tree.walk(function(n) {
                        n.spy();
                    });
                    expect(mixin.node.spy.calls.length).toBe(4);
                });

                it('can access and modify the tree', function() {
                    var checkFn = function(n, num_kids, nVal) {
                        var newN;
                        expect(n.nkids()).toBe(num_kids);
                        expect(n.data().n).toEqual(nVal);
                        newN = n.setter('blort').setter('crub');
                        expect(newN.data().n).toBe('crub');
                        expect(n.equals(newN)).toBe(true);
                        expect(n.tree() === newN.tree()).toBe(false);
                        return newN.tree();
                    };

                    // Note that since the tree is being updated for
                    // every node, you have to find the next node
                    // based on the latest tree, or lose past changes.

                    tree = checkFn(tree.root(), 1, 1);
                    tree = checkFn(tree.root().children()[0], 2, 2);
                    tree = checkFn(tree.root().children()[0].children()[0], 0, 3);
                    tree = checkFn(tree.root().children()[0].children()[1], 0, 4);
                });
            });
        });
    });
    
}));