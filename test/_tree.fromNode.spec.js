/* global define, describe, it, expect, beforeEach */

define(['_tree'], function (_tree) {
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



        throw new Error('not finished');
    });

});