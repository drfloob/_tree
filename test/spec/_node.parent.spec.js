/*global define, describe, it, expect */

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

    describe('_node.parent', function () {
        it('returns undefined for root nodes', function () {
            var tree = _tree.create();
            expect(tree.root().parent()).toBeUndefined();
        });

        it('finds the root from its children', function () {
            var tree = _tree.inflate([1, [2, 3]], _tree.inflate.byAdjacencyList);
            expect(tree.root().children()[0].parent()).toBe(tree.root());
            expect(tree.root().children()[1].parent()).toBe(tree.root());

            // extra sanity check for inflate.byAdjacencyList
            expect(tree.root().parent()).toBeUndefined();
        });
    });

}));