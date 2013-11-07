/*global define, describe, it, expect, beforeEach */

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

    describe('immutability tests', function () {

        var ensureTreeImmutability, ensureNodeImmutable;

        describe('node.children', function () {
            it('is immutable', function () {

                var tree, kids, tmpLen;
                tree = _tree.inflate({a: 1, children: [{a: 2}]});
                kids = tree.root().children();
                tmpLen = kids.length;

                expect(Object.isFrozen(kids)).toBe(true);

                // firefox 25 throws TypeError: kids.push(...) is not
                // extensible. Chrome doesn't throw. _tree doesn't
                // care either way.
                try { kids.push('test'); } catch (e) {}

                // PhantomJS claims to support Object.freez, but
                // fails for Arrays
                expect(kids.length).toEqual(tmpLen);
                expect(kids[1]).toBeUndefined();
            });
        });

        ensureTreeImmutability = function (dat) {
            it('is frozen', function () {
                expect(Object.isFrozen(dat.tree)).toBe(true);
            });
            describe('.root()', function () {
                it('is frozen', function () {
                    expect(Object.isFrozen(dat.tree.root())).toBe(true);
                });
                it('cannot be modified', function () {
                    try { dat.tree.__root = null; } catch(e){}
                    expect(dat.tree.root()).not.toBeNull();
                    try { dat.tree.__id = null; } catch(e){}
                    expect(dat.tree.__id).not.toBeNull();
                    try { dat.tree.__nextNodeId = null; } catch(e){}
                    expect(dat.tree.__nextNodeId).not.toBeNull();
                });
            });
        };
        
        describe('_tree.create', function () {
            var dat = {};
            beforeEach(function () {
                dat.tree = _tree.create();
            });
            ensureTreeImmutability(dat);
        });
        
        describe('empty _tree.inflate', function () {
            var dat = {};
            beforeEach(function () {
                dat.tree = _tree.inflate({});
            });
            ensureTreeImmutability(dat);
        });

        describe('trivial _tree.inflate', function () {
            var dat = {}, data;
            beforeEach(function () {
                data = {name: 'test'};
                dat.tree = _tree.inflate(data);
            });
            ensureTreeImmutability(dat);
            it('does not have its data frozen', function () {
                expect(Object.isFrozen(dat.tree.root().data())).toBe(false);
            });
        });

        describe('simple _tree.inflate', function () {
            var dat = {}, data;
            beforeEach(function () {
                data = {name: 'test', children: [{name: 'kid 1'}]};
                dat.tree = _tree.inflate(data);
            });
            ensureTreeImmutability(dat);
            it('does not have its data frozen', function () {
                expect(Object.isFrozen(dat.tree.root().data())).toBe(false);
            });
            describe('children', function () {
                it('is a frozen array', function () {
                    expect(Object.isFrozen(dat.tree.root().children())).toBe(true);
                });
                it('contains one frozen node', function () {
                    expect(Object.isFrozen(dat.tree.root().children()[0])).toBe(true);
                });
            });
        });


        ensureNodeImmutable = function(node) {
            try { node.__tree = null; } catch(e){}
            expect(node.__tree).not.toBeNull();
            try { node.__data = null; } catch(e){}
            expect(node.data()).not.toBeNull();
            try { node.__children = null; } catch(e){}
            expect(node.children()).not.toBeNull();
            try { node.__id = null; } catch(e){}
            expect(node.id()).not.toBeNull();
        };

        describe('the root node', function () {
            it('cannot be modified', function () {
                var tree = _tree.create(),
                root = tree.root();
                ensureNodeImmutable(root);
            });
        });

        describe('the first child node', function () {
            it('cannot be modified', function () {
                var tree = _tree.inflate({children: [{}]}),
                kid = tree.root().children()[0];
                ensureNodeImmutable(kid);
            });
        });

        describe('the second child node', function () {
            it('cannot be modified', function () {
                var tree = _tree.inflate({children: [{}, {}]}),
                kid = tree.root().children()[1];
                ensureNodeImmutable(kid);
            });
        });
    });

}));