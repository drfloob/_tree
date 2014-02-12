/* global define, describe, it, expect, jasmine */

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
    
    describe('_tree.batch', function () {
        it('executes one callback for multiple parseAndAddChild', function () {
            var t, newT, spy;
            spy = jasmine.createSpy('spy');
            t = _tree.create({callbacks: {afterUpdate: [spy]}});
            expect(spy.calls.length).toBe(1);

            newT = t.batch()
                .root().parseAndAddChild({name: 'batch 0'})
                .root().parseAndAddChild({name: 'batch 1'})
                .root().parseAndAddChild({name: 'batch 2'})
                .end();
            
            expect(spy.calls.length).toBe(2);
            expect(newT.equals(t)).toBe(true);

            expect(newT.root().children().length).toBe(3);
            expect(newT.root().children()[0].data()).toEqual({name: 'batch 0'});
            expect(newT.root().children()[1].data()).toEqual({name: 'batch 1'});
            expect(newT.root().children()[2].data()).toEqual({name: 'batch 2'});
        });

        it('executes one callback for multiple addChildNode', function () {
            var t, t2, newT, spy;
            spy = jasmine.createSpy('spy');
            t = _tree.create({callbacks: {afterUpdate: [spy]}});
            expect(spy.calls.length).toBe(1);

            t2 = _tree.inflate(['', [0,1,2]], _tree.inflate.byAdjacencyList);

            newT = t.batch()
                .root().addChildNode(t2.root().children()[0])
                .root().addChildNode(t2.root().children()[1])
                .root().addChildNode(t2.root().children()[2])
                .end();
            
            expect(spy.calls.length).toBe(2);
            expect(newT.equals(t)).toBe(true);

            expect(newT.root().children().length).toBe(3);
            expect(newT.root().children()[0].data()).toEqual(0);
            expect(newT.root().children()[1].data()).toEqual(1);
            expect(newT.root().children()[2].data()).toEqual(2);
        });

        it('executes one callback for multiple remove', function () {
            var t, newT, spy;
            spy = jasmine.createSpy('spy');
            t = _tree.inflate(['rt', [1,2,3,'winner']], _tree.inflate.byAdjacencyList, {callbacks: {afterUpdate: [spy]}});
            expect(spy.calls.length).toBe(1);

            // Note the reverse order of the child index:
            // [2,1,0]. Since we're updating the list in place, to do
            // delete children in order would require indexes:
            // [0,0,0], since deleting the zeroth element moves
            // element 1 to element 0.
            newT = t.batch()
                .root().children()[2].remove()
                .root().children()[1].remove()
                .root().children()[0].remove()
                .end();
            
            expect(spy.calls.length).toBe(2);
            expect(newT.equals(t)).toBe(true);

            expect(newT.root().children().length).toBe(1);
            expect(newT.root().children()[0].data()).toEqual('winner');
        });

        it('executes one callback for multiple data', function () {
            var t, newT, spy;
            spy = jasmine.createSpy('spy');
            t = _tree.inflate(['rt', [0,1,2]], _tree.inflate.byAdjacencyList, {callbacks: {afterUpdate: [spy]}});
            expect(spy.calls.length).toBe(1);

            newT = t.batch()
                .root().data('changed rt')
                .root().children()[0].data('changed 0')
                .root().children()[1].data('changed 1')
                .end();
            
            expect(spy.calls.length).toBe(2);
            expect(newT.equals(t)).toBe(true);

            expect(newT.root().children().length).toBe(3);
            expect(newT.root().data()).toBe('changed rt');
            expect(newT.root().children()[0].data()).toEqual('changed 0');
            expect(newT.root().children()[1].data()).toEqual('changed 1');
            expect(newT.root().children()[2].data()).toEqual(2); // unchanged
        });


        it('executes one callback for everything', function () {
            var t, t2, newT, spy;
            spy = jasmine.createSpy('spy');
            t = _tree.inflate(['rt', [0,1,2,'winner']], _tree.inflate.byAdjacencyList, {callbacks: {afterUpdate: [spy]}});
            expect(spy.calls.length).toBe(1);

            t2 = _tree.inflate(['', ['a', 'b', 'c']], _tree.inflate.byAdjacencyList);

            newT = t.batch()
            // data
                .root().data('changed rt')
                .root().children()[0].data('changed 0')
                .root().children()[1].data('changed 1')

            // remove
                .root().children()[2].remove()
                .root().children()[1].remove()
                .root().children()[0].remove()
    
            // addChildNode
                .root().addChildNode(t2.root().children()[0])
                .root().addChildNode(t2.root().children()[1])
                .root().addChildNode(t2.root().children()[2])

            // parseAndAddChild
                .root().parseAndAddChild([{name: 'batch 0'}])
                .root().parseAndAddChild([{name: 'batch 1'}])
                .root().parseAndAddChild([{name: 'batch 2'}])

                .end();
            
            expect(spy.calls.length).toBe(2);
            expect(newT.equals(t)).toBe(true);

            expect(newT.root().children().length).toBe(7);
            expect(newT.root().data()).toBe('changed rt');
            expect(newT.root().children()[0].data()).toEqual('winner');
            expect(newT.root().children()[1].data()).toEqual('a');
            expect(newT.root().children()[2].data()).toEqual('b');
            expect(newT.root().children()[3].data()).toEqual('c');
            expect(newT.root().children()[4].data()).toEqual({name: 'batch 0'});
            expect(newT.root().children()[5].data()).toEqual({name: 'batch 1'});
            expect(newT.root().children()[6].data()).toEqual({name: 'batch 2'});
        });
    });
}));