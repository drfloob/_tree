/* global define, describe, it, expect, jasmine */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['_tree'], factory);
    } else if (typeof exports === 'object') {
        /* global module, require */
        module.exports = factory(require('../../src/_tree'));
    } else {
        factory(root._tree);
    }
}(this, function (_tree) {
    'use strict';

    describe('_tree.Tree.prototype.clone', function () {

        it('obeys custom classes', function () {
            var tree, tree2, treeCls;
            
            treeCls = _tree.Tree.extend({one: 1});
            tree = _tree.create({treeClass: treeCls});

            tree2 = _tree.Tree.clone(tree);

            expect(tree2).toEqual(jasmine.any(treeCls));
            expect(tree2.one).toBe(1);
        });

    });

}));