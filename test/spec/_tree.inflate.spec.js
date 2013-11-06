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
        module.exports = factory(require('_tree'));
    } else {
        // Browser globals (root is window)
        factory(root._tree);
    }
}(this, function (_tree) {

    'use strict';


    describe('_tree.inflate', function () {
        describe('.byKey', function () {
            it('is the default', function () {
                var tree, root;
                tree = _tree.inflate({n: 1, children: [{n: 2}]});
                root = tree.root();
                expect(root.data().n).toBe(1);
                expect(root.children().length).toBe(1);
                expect(root.children()[0].data().n).toBe(2);
                expect(root.children()[0].children().length).toBe(0);
            });
            it('works with default child attribute name', function () {
                var tree, root;
                tree = _tree.inflate({n: 1, children: [{n: 2}]}, _tree.inflate.byKey());
                root = tree.root();
                expect(root.data().n).toBe(1);
                expect(root.children().length).toBe(1);
                expect(root.children()[0].data().n).toBe(2);
                expect(root.children()[0].children().length).toBe(0);
            });
            it('works with different child attribute names', function () {
                var tree, root;
                tree = _tree.inflate({n: 1, k: [{n: 2}]}, _tree.inflate.byKey('k'));
                root = tree.root();
                expect(root.data().n).toBe(1);
                expect(root.children().length).toBe(1);
                expect(root.children()[0].data().n).toBe(2);
                expect(root.children()[0].children().length).toBe(0);
            });
        });
    });

}));