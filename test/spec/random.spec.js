/*global define, jasmine, describe, it, expect, beforeEach */

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
        module.exports = factory(require('_tree'));
    } else {
        // Browser globals (root is window)
        factory(root._tree);
    }
}(this, function (_tree) {

    'use strict';

    describe('An inflated tree', function () {
        describe('with default settings', function () {
            describe('from an empty object', function () {
                var tree;
                beforeEach(function () {
                    tree = _tree.inflate({});
                });

                it('is setup properly', function () {
                    expect(tree).toBeDefined();
                });

                it('has a root function', function () {
                    expect(tree.root).toEqual(jasmine.any(Function));
                });

                it('has correct root data', function () {
                    expect(tree.root().data).toEqual(jasmine.any(Function));
                    expect(tree.root().data()).toEqual({});

                    // Fixed bug: Node was returning data, not __data
                    expect(tree.root().data).not.toEqual(tree.root().data());
                });

                it('has a root with no children', function () {
                    expect(tree.root().children().length).toEqual(0);
                });

            });

            describe('from a simple object', function () {
                var tree, data;
                beforeEach(function () {
                    data = {'name': 'hork'};
                    tree = _tree.inflate(data);
                });

                it('has a root function', function () {
                    expect(tree.root).toEqual(jasmine.any(Function));
                });

                it('has correct root data', function () {
                    expect(tree.root().data).toEqual(jasmine.any(Function));
                    expect(tree.root().data()).toEqual({'name': 'hork'});
                });

                it('has a root with no children', function () {
                    var arr = [];
                    (Object.freeze || Object)(arr);
                    expect(tree.root().children()).toEqual(arr);
                });

                it('is unaware of changes in its linked data', function () {
                    var arr = [];
                    (Object.freeze || Object)(arr);

                    data.b = 'test';
                    expect(tree.root().data().b).toEqual('test');

                    data.children = [{'name': 'newKid'}];
                    expect(tree.root().data().children.length).toEqual(1);
                    expect(tree.root().children()).toEqual(arr);
                });

            });
        });
    });


}));