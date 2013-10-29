/* global define, describe, it, expect, beforeEach */

define(['_tree'], function (_tree) {
    'use strict';

    describe('_tree.findByData', function () {
        describe('on an empty tree', function () {
            var tree;
            beforeEach(function () {
                tree = _tree.create();
            });

            it('finds nothing when searching for nothing', function () {
                expect(tree.findByData()).toBeFalsy();
            });
        });
    });
    
});