/* global define, describe, it, expect, beforeEach, jasmine */

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
    
    describe('_tree.on', function () {
        describe('afterUpdate', function () {
            describe('with callbacks set on creation', function () {
                it('works with one callback', function () {
                    var spy, tree, newTree;
                    spy = jasmine.createSpy('spy');
                    tree = _tree.create({callbacks: { afterUpdate: [spy] }});
                    newTree = tree.root().data('test');

                    expect(spy.identity).toEqual('spy');
                    expect(spy).toHaveBeenCalled();
                });

                it('works with multiple callbacks', function () {
                    var spy1, spy2, spy3, tree, newTree;
                    spy1 = jasmine.createSpy('spy1');
                    spy2 = jasmine.createSpy('spy2');
                    spy3 = jasmine.createSpy('spy3');
                    tree = _tree.create({callbacks: { afterUpdate: [spy1, spy2, spy3] }});
                    newTree = tree.root().data('test');

                    expect(spy1.identity).toEqual('spy1');
                    expect(spy1).toHaveBeenCalled();
                    expect(spy2.identity).toEqual('spy2');
                    expect(spy2).toHaveBeenCalled();
                    expect(spy3.identity).toEqual('spy3');
                    expect(spy3).toHaveBeenCalled();
                });
            });
            
            describe('with callbacks set dynamically', function () {
                it('works with one callback', function () {
                    var spy, tree, newTree;
                    spy = jasmine.createSpy('spy');
                    tree = _tree.create();
                    tree = tree.on('afterUpdate', spy);
                    newTree = tree.root().data('test');

                    expect(spy.identity).toEqual('spy');
                    expect(spy).toHaveBeenCalled();
                });

                it('works with multiple callbacks, one at a time', function () {
                    var spy1, spy2, spy3, tree, newTree;
                    spy1 = jasmine.createSpy('spy1');
                    spy2 = jasmine.createSpy('spy2');
                    spy3 = jasmine.createSpy('spy3');
                    tree = _tree.create();
                    tree = tree.on('afterUpdate', spy1);
                    tree = tree.on('afterUpdate', spy2);
                    tree = tree.on('afterUpdate', spy3);
                    newTree = tree.root().data('test');

                    expect(spy1.identity).toEqual('spy1');
                    expect(spy1).toHaveBeenCalled();
                    expect(spy2.identity).toEqual('spy2');
                    expect(spy2).toHaveBeenCalled();
                    expect(spy3.identity).toEqual('spy3');
                    expect(spy3).toHaveBeenCalled();

                    // each `tree.on` call regenerates the tree, so
                    // the call counts may be suprpising to you.
                    expect(spy1.calls.length).toBe(4);
                    expect(spy2.calls.length).toBe(3);
                    expect(spy3.calls.length).toBe(2);
                });
                
                it('works with multiple callbacks, all at once', function () {
                    var spy1, spy2, spy3, tree, newTree;
                    spy1 = jasmine.createSpy('spy1');
                    spy2 = jasmine.createSpy('spy2');
                    spy3 = jasmine.createSpy('spy3');
                    tree = _tree.create();
                    tree = tree.on('afterUpdate', [spy1, spy2, spy3]);
                    newTree = tree.root().data('test');

                    expect(spy1.identity).toEqual('spy1');
                    expect(spy1).toHaveBeenCalled();
                    expect(spy2.identity).toEqual('spy2');
                    expect(spy2).toHaveBeenCalled();
                    expect(spy3.identity).toEqual('spy3');
                    expect(spy3).toHaveBeenCalled();

                    // since all callbacks were added at the same
                    // time, the call counts should be the same
                    expect(spy1.calls.length).toBe(2);
                    expect(spy2.calls.length).toBe(2);
                    expect(spy3.calls.length).toBe(2);
                });
                
            });

        });

        describe('beforeFreeze', function () {
            it('is called on tree modification', function () {
                var spy, tree;
                spy = jasmine.createSpy('spy');
                tree = _tree.create({callbacks: { beforeFreeze: [spy] }});
                expect(spy.calls.length).toBe(1);

                tree = tree.root().data('test');
                expect(spy.calls.length).toBe(2);

                tree = tree.root().parseAndAddChild({n: 2});
                expect(spy.calls.length).toBe(3);

                tree = tree.root().children()[0].data('test');
                expect(spy.calls.length).toBe(4);
            });

            it('allows modification of the tree before finalizing', function() {
                var tree, cb;
                cb = function(tree) {
                    tree.root().testKey = 'testValue';
                };
                tree = _tree.create({callbacks: { beforeFreeze: [cb] }});
                expect(tree.root().testKey).toBe('testValue');
            });

            describe('.data', function () {
                it('is called on data alteration', function () {
                    var spy, tree;
                    spy = jasmine.createSpy('spy');
                    tree = _tree.create({callbacks: { 'beforeFreeze.data': [spy] }});
                    expect(spy.calls.length).toBe(0);

                    tree = tree.root().data('test');
                    expect(spy.calls.length).toBe(1);
                    
                    tree = tree.root().parseAndAddChild({n: 2});
                    expect(spy.calls.length).toBe(1); // unchanged

                    tree = tree.root().children()[0].data('test');
                    expect(spy.calls.length).toBe(2);
                });

                it('is called with the modified node', function () {
                    var tree, cb, oldNode;
                    cb = function(tree, node) {
                        expect(node.equals(oldNode)).toBe(true);
                        expect(node === oldNode).toBe(false);
                    };
                    tree = _tree.create({callbacks: { 'beforeFreeze.data': [cb] }});
                    oldNode = tree.root();

                    tree.root().data('go');
                    
                });

                it('can modify the tree', function () {
                    var tree, cb;
                    cb = function(tree) {
                        tree.root().testKey = 'testValue';
                    };
                    tree = _tree.inflate(['root', ['child']],
                                         _tree.inflate.byAdjacencyList,
                                         { callbacks: { 'beforeFreeze.data': [cb] }}
                                        );
                    tree = tree.root().children()[0].data('go');

                    expect(tree.root().testKey).toBe('testValue');
                });
            }); // beforeFreeze.data


            describe('.parseAndAddChild', function () {
                it('is called on new child parse', function () {
                    var spy, tree;
                    spy = jasmine.createSpy('spy');
                    tree = _tree.create({callbacks: { 'beforeFreeze.parseAndAddChild': [spy] }});
                    expect(spy.calls.length).toBe(0);

                    tree = tree.root().data('test');
                    expect(spy.calls.length).toBe(0);  // unchanged
                    
                    tree = tree.root().parseAndAddChild({n: 2});
                    expect(spy.calls.length).toBe(1);

                    tree = tree.root().children()[0].data('test');
                    expect(spy.calls.length).toBe(1);  // unchanged
                });

                it('is called with the new child node', function () {
                    var tree, cb, data = {n: 2};
                    cb = function(tree, node) {
                        expect(node.data()).toBe(data);
                    };
                    tree = _tree.create({callbacks: { 'beforeFreeze.parseAndAddChild': [cb] }});
                    tree.root().parseAndAddChild(data);
                    
                });

                it('can modify the tree', function () {
                    var tree, cb;
                    cb = function(tree) {
                        tree.root().testKey = 'testValue';
                    };
                    tree = _tree.create({ callbacks: { 'beforeFreeze.parseAndAddChild': [cb] }});
                    tree = tree.root().parseAndAddChild({n: 2});

                    expect(tree.root().testKey).toBe('testValue');
                });
            }); // beforeFreeze.parseAndAddChild



            describe('.addChildNode', function () {
                it('is only called on child node additions', function () {
                    var spy, tree, tree2;
                    spy = jasmine.createSpy('spy');
                    tree = _tree.create({callbacks: { 'beforeFreeze.addChildNode': [spy] }});
                    tree2 = _tree.inflate(['bort'], _tree.inflate.byAdjacencyList);
                    expect(spy.calls.length).toBe(0);

                    tree = tree.root().data('test');
                    expect(spy.calls.length).toBe(0);  // unchanged
                    
                    tree = tree.root().addChildNode(tree2.root());
                    expect(spy.calls.length).toBe(1);

                    tree = tree.root().children()[0].data('test');
                    expect(spy.calls.length).toBe(1);  // unchanged
                });

                it('is called with the new child node', function () {
                    var tree, tree2, cb;
                    cb = function(tree, node) {
                        // the data object is the same (as in same object in
                        // memory)
                        expect(node.data()).toBe(tree2.root().data());

                        // but note that since the tree is different,
                        // the nodes are not considered to be clones.
                        expect(node.equals(tree2.root())).toBe(false);
                    };
                    tree = _tree.create({callbacks: { 'beforeFreeze.addChildNode': [cb] }});
                    tree2 = _tree.inflate(['bort'], _tree.inflate.byAdjacencyList);
                    tree.root().addChildNode(tree2.root());
                    
                });

                it('can modify the tree', function () {
                    var tree, tree2, cb;
                    cb = function(tree) {
                        tree.root().testKey = 'testValue';
                    };
                    tree = _tree.create({ callbacks: { 'beforeFreeze.addChildNode': [cb] }});
                    tree2 = _tree.inflate(['bort'], _tree.inflate.byAdjacencyList);
                    tree = tree.root().addChildNode(tree2.root());

                    expect(tree.root().testKey).toBe('testValue');
                });
            }); // beforeFreeze.addChildNode




            describe('.remove', function () {
                it('is only called when removing a node', function () {
                    var spy, tree;
                    spy = jasmine.createSpy('spy');
                    tree = _tree.inflate(['bort', ['foo']], _tree.inflate.byAdjacencyList, {callbacks: { 'beforeFreeze.remove': [spy] }});
                    expect(spy.calls.length).toBe(0);

                    tree = tree.root().data('test');
                    expect(spy.calls.length).toBe(0);  // unchanged
                    
                    tree = tree.root().children()[0].remove();
                    expect(spy.calls.length).toBe(1);

                    tree = tree.root().parseAndAddChild([2]);
                    expect(spy.calls.length).toBe(1);  // unchanged
                });

                it('is called with the *parent* of the removed node', function () {
                    var tree, cb;
                    cb = function(tree, node) {
                        expect(node.equals(tree.root())).toBe(true);
                    };
                    tree = _tree.inflate(['bort', ['foo']], _tree.inflate.byAdjacencyList, {callbacks: { 'beforeFreeze.remove': [cb] }});
                    tree.root().children()[0].remove();
                    
                });

                it('can modify the tree', function () {
                    var tree, cb;
                    cb = function(tree) {
                        tree.root().testKey = 'testValue';
                    };
                    tree = _tree.inflate(['bort', ['foo']], _tree.inflate.byAdjacencyList, {callbacks: { 'beforeFreeze.remove': [cb] }});
                    tree = tree.root().children()[0].remove();

                    expect(tree.root().testKey).toBe('testValue');
                });
            }); // beforeFreeze.remove


        });// beforeFreeze

    });


    describe('_tree.off', function () {
        describe('afterUpdate', function () {
            var tree, spy1, spy2, spy3;
            beforeEach(function() {
                spy1 = jasmine.createSpy('spy1');
                spy2 = jasmine.createSpy('spy2');
                spy3 = jasmine.createSpy('spy3');
            });
            describe('with callbacks set on creation', function () {
                it('works with one callback', function () {
                    // note that the callback is called on creation
                    tree = _tree.create({callbacks: { afterUpdate: [spy1]}});
                    expect(spy1.calls.length).toBe(1);

                    // ... and is never called again
                    tree = tree.off('afterUpdate', spy1);
                    expect(spy1.calls.length).toBe(1);
                    tree = tree.root().data('test');
                    expect(spy1.calls.length).toBe(1);
                });

                it('works with multiple callbacks, one by one', function () {
                    // note that the callback is called on creation
                    tree = _tree.create({callbacks: { afterUpdate: [spy1, spy2, spy3]}});
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(1);
                    expect(spy3.calls.length).toBe(1);

                    // and every remaining callback is called when
                    // some other callback is removed
                    tree = tree.off('afterUpdate', spy1);
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(2);
                    expect(spy3.calls.length).toBe(2);

                    tree = tree.off('afterUpdate', spy2);
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(2);
                    expect(spy3.calls.length).toBe(3);

                    tree = tree.off('afterUpdate', spy3);
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(2);
                    expect(spy3.calls.length).toBe(3);

                    // by now, the callbacks are no longer firing
                    tree = tree.root().data('test');
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(2);
                    expect(spy3.calls.length).toBe(3);
                });

                it('works with multiple callbacks, all at once', function () {
                    // note that the callback is called on creation
                    tree = _tree.create({callbacks: { afterUpdate: [spy1, spy2, spy3]}});
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(1);
                    expect(spy3.calls.length).toBe(1);

                    // removing all callbacks at once prevents any from being called
                    tree = tree.off('afterUpdate', [spy1, spy2, spy3]);
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(1);
                    expect(spy3.calls.length).toBe(1);

                    tree = tree.root().data('test');
                    expect(spy1.calls.length).toBe(1);
                    expect(spy2.calls.length).toBe(1);
                    expect(spy3.calls.length).toBe(1);
                });
            });
        });
    });
}));