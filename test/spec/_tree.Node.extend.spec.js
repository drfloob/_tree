/* global define, describe, it, expect, jasmine */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['_tree', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        /* global module, require */
        module.exports = factory(require('../../src/_tree'), require('underscore'));
    } else {
        factory(root._tree, root._);
    }
}(this, function (_tree) {
    'use strict';

    describe('_tree.Node.extend', function () {

        it('returns something that smells like a Node', function () {
            var cls;
            cls = _tree.Node.extend();

            expect(cls.prototype.children).toBeDefined();
            expect(cls.prototype.children).toEqual(jasmine.any(Function));
        });

        it('has the intended static and prototype properties', function () {
            var cls = _tree.Node.extend({'foo': 1}, {'bar': 2});
            //                     ... ({  proto }, { static });

            expect(cls.prototype.foo).toBeDefined();
            expect(cls.prototype.foo).toBe(1);
            expect(cls.bar).toBeDefined();
            expect(cls.bar).toBe(2);
        });

        it('calls the constructor', function () {
            var Cls, spy, tree, obj;
            spy = jasmine.createSpy('spy');

            // spy constructor, does not satisfy parent constructor
            // requirement.
            Cls = _tree.Node.extend({'constructor': spy});

            // dummy inflate method, just to have a valid root node
            tree = _tree.inflate({}, function() {
                this.setNode(new Cls(this.tree, 'data'));
            });
            obj = tree.root();

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.length).toBe(1);

            // since the cls constructor did not call the parent
            // (Node) constructor, the node will not be set up
            // correctly.
            expect(obj.children()).toBeUndefined();
            expect(obj.data()).toBeUndefined();

            expect(function() {
                obj.parseAndAddChild({});
            }).toThrow();
        });


        it('requires the constructor to call the parent constructor', function () {
            var Cls, tree, obj;

            // trivial constructor, but meets basic constructor
            // requirement of calling the super constructor.
            Cls = _tree.Node.extend({'constructor': function() {
                _tree.Node.apply(this, arguments);
            }});

            // dummy inflate method, just to have a valid root node
            tree = _tree.inflate('root data', null, {inflate: function(data) {
                this.setNode(new Cls(this.tree, data));
            }});
            obj = tree.root();

            expect(obj.data()).toEqual('root data');
            expect(obj.children()).toEqual(jasmine.any(Array));
            expect(obj.children().length).toBe(0);
            expect(function() {
                tree = obj.parseAndAddChild({});
                obj = tree.root();
            }).not.toThrow();
            expect(obj.children().length).toBe(1);
        });

        it('lets the constructor modify the node', function () {
            var Cls, obj;
            Cls = _tree.Node.extend({
                'constructor': function(tree) {
                    _tree.Node.call(this, tree);
                    this.blort = 12345;
                }
            });
            obj = new Cls({});
            expect(obj.blort).toBe(12345);
        });


        it('allows for deep extension', function () {
            var Cls, Cls2, obj;
            Cls = _tree.Node.extend({one: 1});
            Cls2 = Cls.extend({two: 2});
            obj = new Cls2({});

            expect(Cls.prototype.one).toBe(1);

            expect(Cls2.prototype.two).toBe(2);
            expect(Cls2.prototype.one).toBe(1);

            expect(obj.one).toBe(1);
            expect(obj.two).toBe(2);

            expect(obj).toEqual(jasmine.any(_tree.Node));
            expect(obj).toEqual(jasmine.any(Cls));
            expect(obj).toEqual(jasmine.any(Cls2));
        });

    });
    
}));