/*global define, describe, it, expect, beforeEach */

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


    describe('_tree.inflate', function () {
        describe('.byKey', function () {
            var tree, root, data;
            beforeEach(function () {
                data = {n: 1, children: [{n: 2}]};
                tree = _tree.inflate(data);
                root = tree.root();
            });
            it('is the default', function () {
                expect(root.data().n).toBe(1);
                expect(root.children().length).toBe(1);
                expect(root.children()[0].data().n).toBe(2);
                expect(root.children()[0].children().length).toBe(0);
            });
            it('works with default child attribute name', function () {
                expect(root.data().n).toBe(1);
                expect(root.children().length).toBe(1);
                expect(root.children()[0].data().n).toBe(2);
                expect(root.children()[0].children().length).toBe(0);
            });
            it('works with different child attribute names', function () {
                expect(root.data().n).toBe(1);
                expect(root.children().length).toBe(1);
                expect(root.children()[0].data().n).toBe(2);
                expect(root.children()[0].children().length).toBe(0);
            });
            it('is unaware of changes in its linked data', function () {
                var arr = [];
                (Object.freeze || Object)(arr);

                data.b = 'test';
                expect(tree.root().data().b).toEqual('test');

                data.children = [{'name': 'newKid'}];
                expect(tree.root().children()[0].data()).toEqual({n: 2});
            });
        });

        describe('.byAdjacencyList', function () {
            it('fails on root siblings', function () {
                expect(function () {_tree.inflate([0, [1,2], 'bad'], _tree.inflate.byAdjacencyList);}).toThrow();
                expect(function () {_tree.inflate([0, 'bad'], _tree.inflate.byAdjacencyList);}).toThrow();
            });
            it('works on empty trees', function () {
                var tree;
                tree = _tree.inflate([], _tree.inflate.byAdjacencyList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBeUndefined();
                expect(tree.root().children().length).toBe(0);
            });
            it('works on trivial trees', function () {
                var tree;
                tree = _tree.inflate(['test'], _tree.inflate.byAdjacencyList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBe('test');
                expect(tree.root().children().length).toBe(0);
            });
            it('works on verbose trivial trees', function () {
                var tree;
                tree = _tree.inflate(['test', []], _tree.inflate.byAdjacencyList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBe('test');
                expect(tree.root().children().length).toBe(0);
            });
            it('works on simple trees', function () {
                var tree;
                tree = _tree.inflate(['test', ['test2']], _tree.inflate.byAdjacencyList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBe('test');
                expect(tree.root().children().length).toBe(1);
                expect(tree.root().children()[0].data()).toBe('test2');
            });
        });


        describe('.onlyLeavesList', function () {
            it('works trivially', function () {
                var tree, root, c2;
                tree = _tree.inflate([['child1', ['child3']]], _tree.inflate.onlyLeavesList);
                root = tree.root();
                c2 = root.children()[1];

                expect(root.data()).toBeUndefined();

                expect(root.children().length).toBe(2);
                expect(root.children()[0].data()).toBe('child1');

                expect(c2.data()).toBeUndefined();
                expect(c2.children().length).toBe(1);
                expect(c2.children()[0].data()).toBe('child3');

            });
            it('fails on root siblings', function () {
                expect(function () {_tree.inflate([0, 'bad'], _tree.inflate.onlyLeavesList);}).toThrow();
            });
            it('works on empty trees', function () {
                var tree;
                tree = _tree.inflate([], _tree.inflate.onlyLeavesList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBeUndefined();
                expect(tree.root().children().length).toBe(0);
            });
            it('works on root-only trees', function () {
                var tree;
                tree = _tree.inflate(['test'], _tree.inflate.onlyLeavesList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBe('test');
                expect(tree.root().children().length).toBe(0);
            });
            it('works on single-child trees', function () {
                var tree;
                tree = _tree.inflate([['test']], _tree.inflate.onlyLeavesList);
                expect(tree.root().data).toBeDefined();
                expect(tree.root().data()).toBeUndefined();
                expect(tree.root().children().length).toBe(1);
                expect(tree.root().children()[0].data()).toBe('test');
            });
        });
    });

}));