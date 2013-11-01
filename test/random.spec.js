/*global define, jasmine, describe, it, expect, beforeEach */

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
        factory(root._tree, root._);
    }
}(this, function (_tree, _) {

    'use strict';

    describe('The _tree module', function () {
        it('is defined', function () {
            expect(_tree).toBeDefined();
        });
    });

    describe('Node ids', function () {
        it('are working in general', function () {
            var tree = _tree.inflate({n: 1});
            expect(tree.root().__id).not.toBe(null);
            expect(tree.root().__id).toEqual(0);
        });
        it('are unique after initial tree inflation', function () {
            var tree, ids;
            tree = _tree.inflate({n: 1, k: [
                {n: 1, k: [
                    {n: 1, k: []}, {n: 1, k: []}
                ]},
                {n: 1, k: [
                    {n: 1, k: []}, {n: 1, k: []}
                ]}
            ]},
                                 _tree.inflate.byKey('k'));
            ids = [];
            tree.walk(function (n) {
                ids.push(n.__id);
            });
            expect(ids).toEqual(_.uniq(ids));
        });
    });

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

    describe('An inflated tree', function () {
        describe('with default settings', function () {
            describe('from an empty object', function () {
                var tree;
                beforeEach(function () {
                    tree = _tree.inflate({});
                });

                it('is setup properly', function () {
                    expect(tree).toBeDefined();
                });

                it('has a root function', function () {
                    expect(tree.root).toEqual(jasmine.any(Function));
                });

                it('has correct root data', function () {
                    expect(tree.root().data).toEqual(jasmine.any(Function));
                    expect(tree.root().data()).toEqual({});

                    // Fixed bug: Node was returning data, not __data
                    expect(tree.root().data).not.toEqual(tree.root().data());
                });

                it('has a root with no children', function () {
                    var arr = [];
                    if (Object.freeze) {
                        Object.freeze(arr);
                    }
                    expect(tree.root().children()).toEqual(arr);
                });

                it('is frozen', function () {

                    // IE9 doesn't support `Object.isFrozen`. If
                    // present, ensure it works. If not, check
                    // frigidity another way.
                    if (Object.isFrozen) {
                        expect(Object.isFrozen(tree)).toBe(true);
                        expect(Object.isFrozen(tree.root())).toBe(true);
                    }

                    // Whether strict mode is enforced or not is not a
                    // concern, only whether the data can be modified.
                    try { tree.__root = null; } catch(e){}

                    expect(tree.root()).not.toBeNull();
                });
            });

            describe('from a simple object', function () {
                var tree, data;
                beforeEach(function () {
                    data = {'name': 'hork'};
                    tree = _tree.inflate(data);
                });

                it('has a root function', function () {
                    expect(tree.root).toEqual(jasmine.any(Function));
                });

                it('has correct root data', function () {
                    expect(tree.root().data).toEqual(jasmine.any(Function));
                    expect(tree.root().data()).toEqual({'name': 'hork'});
                });

                it('has a root with no children', function () {
                    var arr = [];
                    (Object.freeze || Object)(arr);
                    expect(tree.root().children()).toEqual(arr);
                });

                it('is frozen', function () {

                    // IE9 doesn't support `Object.isFrozen`. If
                    // present, ensure it works. If not, check
                    // frigidity another way.
                    if (Object.isFrozen) {
                        expect(Object.isFrozen(tree)).toBe(true);
                        expect(Object.isFrozen(tree.root())).toBe(true);
                    }

                    // Whether strict mode is enforced or not is not a
                    // concern, only whether the data can be modified.
                    try { tree.__root = null; } catch(e){}

                    expect(tree.root()).not.toBeNull();
                });

                it('does not have its data frozen', function () {
                    expect(Object.isFrozen(tree.root().data())).toBe(false);
                });

                it('is unaware of changes in its linked data', function () {
                    var arr = [];
                    (Object.freeze || Object)(arr);

                    data.b = 'test';
                    expect(tree.root().data().b).toEqual('test');

                    data.children = [{'name': 'newKid'}];
                    expect(tree.root().data().children.length).toEqual(1);
                    expect(tree.root().children()).toEqual(arr);
                });

            });
        });
    });




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