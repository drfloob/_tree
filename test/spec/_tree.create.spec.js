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

    describe('_tree.create', function () {
        var tree;
        beforeEach(function () {
            tree = _tree.create();
        });
        it('returns something that smells like a tree', function () {
            expect(tree.root).toEqual(jasmine.any(Function));
            expect(tree.root().data).toEqual(jasmine.any(Function));
            expect(tree.root().__tree).toEqual(tree);
        });

        it('is equivalent to a _tree.inflate call', function () {
            var infTree = _tree.inflate();
            // Right now, we can only sniff at identity

            expect(infTree.defaults).toEqual(tree.defaults);
            expect(infTree.root().__id).toEqual(tree.root().__id);
            expect(infTree.root().data()).toEqual(tree.root().data());
            expect(infTree.root().data()).toBeUndefined();
            expect(infTree.root().children()).toEqual(tree.root().children());
        });
        describe('with an inflate method default', function () {

            beforeEach(function () {
                tree = _tree.create({inflate: _tree.inflate.byKey('k')});
            });

            it('returns something that smells like a tree', function () {
                expect(tree.root).toEqual(jasmine.any(Function));
                expect(tree.root().data).toEqual(jasmine.any(Function));
                expect(tree.root().__tree).toEqual(tree);
            });

            it('inflates one child correctly', function () {
                var newTree = tree.root().parseAndAddChild({'hork': 'dork'});
                expect(newTree === tree).toBeFalsy();

                expect(newTree.root().children().length).toBe(1);
                expect(tree.root().children().length).toBe(0);

                expect(newTree.root().children()[0].data().hork).toBeDefined();
            });

            it('has a root that can accept data', function () {
                var newTree = tree.root().data('test');
                expect(newTree === tree).toBeFalsy();
                expect(newTree.root().data()).toEqual('test');
                expect(tree.root().data()).toBeUndefined();
            });
        });
    });

}));