/*global require, describe, it, expect */
'use strict';

var _tree = require('_tree');

describe('_node.children', function () {
    it('is immutable', function () {

        var tree, kids, tmpLen;
        tree = _tree.inflate({a: 1, children: [{a: 2}]});
        expect(Object.isFrozen(tree.root().children())).toBeTruthy();

        kids = tree.root().children();
        
        tmpLen = kids.length;
        kids.push(2);
        expect(tmpLen).toEqual(kids.length);
    });
});