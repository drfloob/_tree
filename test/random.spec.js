/*global define, jasmine, describe, it, expect, beforeEach */

define(['_tree', 'underscore'], function (_tree, _) {

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
            expect(infTree.root().children()).toEqual(Object.freeze([]));
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
                    expect(tree.root().children()).toEqual(Object.freeze([]));
                });

                it('is frozen', function () {
                    expect(Object.isFrozen(tree)).toBe(true);
                    expect(Object.isFrozen(tree.root())).toBe(true);

                    var modRoot = function () {
                        tree.root = null;
                    };
                    expect(modRoot).toThrow();
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
                    expect(tree.root().children()).toEqual(Object.freeze([]));
                });

                it('is frozen', function () {
                    expect(Object.isFrozen(tree)).toBe(true);
                    expect(Object.isFrozen(tree.root())).toBe(true);

                    var modRoot = function () {
                        tree.root = null;
                    };
                    expect(modRoot).toThrow();
                });

                it('does not have its data frozen', function () {
                    expect(Object.isFrozen(tree.root().data())).toBe(false);
                });

                it('is unaware of changes in its linked data', function () {
                    data.b = 'test';
                    expect(tree.root().data().b).toEqual('test');

                    data.children = [{'name': 'newKid'}];
                    expect(tree.root().data().children.length).toEqual(1);
                    expect(tree.root().children()).toEqual(Object.freeze([]));
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
});