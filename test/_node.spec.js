/*global define, xdescribe, it, expect */

define(['_tree'], function (_tree) {
    'use strict';

    // disabled to refactor _tree. this does not pass on PhantomJS
    xdescribe('node.children', function () {
        it('is immutable', function () {

            var tree, kids, tmpLen;
            tree = _tree.inflate({a: 1, children: [{a: 2}]});
            expect(Object.isFrozen(tree.root().children())).toBeTruthy();

            kids = tree.root().children();
            
            tmpLen = kids.length;
            kids.push(2);
            expect(tmpLen).toEqual(kids.length);
            expect(kids[1]).toBeUndefined();
            expect(kids[1]).not.toBe(2);
        });
    });
});

