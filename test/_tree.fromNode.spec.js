/* global define, describe, it, expect, beforeEach */

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
        root._tree = factory(root._tree, root._);
    }
}(this, function (_tree, _) {
    'use strict';
    
    describe('_tree.fromNode', function () {

        it('does not maintain tree equality', function () {
            var tree = _tree.create(),
            rn = tree.root(),
            newTree = _tree.fromNode(rn);

            expect(newTree.equals(tree)).toBe(false);
        });


        it('does not maintain node equality', function () {
            var tree = _tree.create(),
            rn = tree.root(),
            newTree = _tree.fromNode(rn);

            expect(rn.equals(newTree.root())).toBe(false);
        });


        it('throws an error if a non-node is given', function () {
            expect(_tree.fromNode).toThrow();
            expect(_.bind(_tree.fromNode, null)).toThrow();
            expect(_.bind(_tree.fromNode, 1)).toThrow();
            expect(_.bind(_tree.fromNode, [1, [2]])).toThrow();
        });

        throw new Error('not finished');
    });

}));