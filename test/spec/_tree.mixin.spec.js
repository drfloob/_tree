/* global define, describe, it, expect, beforeEach, jasmine */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['_tree'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        /* global module, require */
        module.exports = factory(require('../../src/_tree'));
    } else {
        // Browser globals (root is window)
        factory(root._tree);
    }
}(this, function (_tree) {
    'use strict';

    describe('_tree.mixin', function () {
        describe('set on creation', function () {
            var tree,
            mixin = {
                spy: jasmine.createSpy('spy'),
                getter: function () { return this.root().data(); },
                setter: function(data) { return this.root().data(data); }
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
                spy: jasmine.createSpy('spy'),
                getter: function () { return this.root().data(); },
                setter: function(data) { return this.root().data(data); }
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
    
}));