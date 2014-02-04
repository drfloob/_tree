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