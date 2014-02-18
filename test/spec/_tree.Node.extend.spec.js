/* global define, describe, it, expect, jasmine */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['_tree'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../../src/_tree'));
    } else {
        factory(root._tree);
    }
}(this, function (_tree) {
    'use strict';

    describe('_tree.Node.extend', function () {

        it('returns something that smells like a Node', function () {
            var cls, obj;
            cls = _tree.Node.extend();

            expect(cls.prototype.children).toBeDefined();
            expect(cls.prototype.children).toEqual(jasmine.any(Function));
        });

        it('has the deserid properties', function () {
            var cls = _tree.Node.extend({
                'foo': function(){}
            });
            expect(cls.prototype.foo).toBeDefined();
            expect(cls.prototype.foo).toEqual(jasmine.any(Function));
        });

        it('calls the init function', function () {
            var cls, spy, obj;
            spy = jasmine.createSpy('spy');
            cls = _tree.Node.extend({
                'init': spy
            });
            obj = new cls({});

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.length).toBe(1);
        });

        it('lets the init function modify the node', function () {
            var cls, obj;
            cls = _tree.Node.extend({
                'init': function(tree) {
                    this.blort = 12345;
                }
            });
            obj = new cls({});
            
            expect(obj.blort).toBeDefined();
            expect(obj.blort).toBe(12345);
        });


        it('lets you define your model', function () {
            var cls, obj;
            var TodoCls = _tree.Node.extend({
                isCompleted: function() {
                    return this.data().completed;
                },
                complete: function() {
                    return this.data(_.extend(this.data(), {completed: true}));
                }
            });
        });

    });
    
}));