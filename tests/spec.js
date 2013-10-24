/*jslint nomen: true, todo: true */
/*global window, document, jasmine, describe, it, expect, beforeEach, _tree */

'use strict';

describe("The _tree module", function () {
    it("is defined", function () {
        expect(_tree).toBeDefined();
    });
});

describe("_tree.inflate", function() {
    describe(".byKey", function(){
        it("is the default", function(){
            var tree = _tree.inflate({n: 1, children: [{n: 2}]});
            var root = tree.root();
            console.log(root);
            expect(root.data().n).toBe(1);
            expect(root.children().length).toBe(1);
            expect(root.children()[0].data().n).toBe(2);
            expect(root.children()[0].children().length).toBe(0);
        });
        it("works with default child attribute name", function(){
            var tree = _tree.inflate({n: 1, children: [{n: 2}]}, _tree.inflate.byKey());
            var root = tree.root();
            console.log(root);
            expect(root.data().n).toBe(1);
            expect(root.children().length).toBe(1);
            expect(root.children()[0].data().n).toBe(2);
            expect(root.children()[0].children().length).toBe(0);
        });
        it("works with different child attribute names", function(){
            var tree = _tree.inflate({n: 1, k: [{n: 2}]}, _tree.inflate.byKey('k'));
            var root = tree.root();
            console.log(root);
            expect(root.data().n).toBe(1);
            expect(root.children().length).toBe(1);
            expect(root.children()[0].data().n).toBe(2);
            expect(root.children()[0].children().length).toBe(0);
        });
    })
});

describe("Node ids", function() {
    it('are working in general', function() {
        var tree = _tree.inflate({n: 1});
        expect(tree.root().__id).not.toBe(null);
        expect(tree.root().__id).toEqual(1);
    });
    it("are unique after initial tree inflation", function() {
        var tree = _tree.inflate({n: 1, k: [{n: 1, k: [{n: 1, k: []}, {n: 1, k: []}]}, {n: 1, k: [{n: 1, k: []}, {n: 1, k: []}]}]},
                                 _tree.inflate.byKey('k'));
        var ids = [];
        tree.walk(function(n){
            ids.push(n.__id);
        });
        expect(ids).toEqual(_.uniq(ids));
    });
});

describe("An inflated tree", function () {
    describe("with default settings", function () {
        describe("from an empty object", function () {
            var tree;
            beforeEach(function () {
                tree = _tree.inflate({});
            });

            it('is setup properly', function () {
                expect(tree).toBeDefined();
            });

            it("has a root function", function () {
                expect(tree.root).toEqual(jasmine.any(Function));
            });

            it("has correct root data", function () {
                expect(tree.root().data).toEqual(jasmine.any(Function));
                expect(tree.root().data()).toEqual({});

                // Fixed bug: Node was returning data, not __data
                expect(tree.root().data).not.toEqual(tree.root().data());
            });

            it("has a root with no children", function () {
                expect(tree.root().children()).toEqual([]);
            });

            it("is frozen", function () {
                expect(Object.isFrozen(tree)).toBe(true);
                expect(Object.isFrozen(tree.root())).toBe(true);

                var modRoot = function () {
                    tree.root = null;
                };
                expect(modRoot).toThrow();
            });
        });

        describe("from a simple object", function() {
            var tree, data;
            beforeEach(function () {
                data = {'name': 'hork'};
                tree = _tree.inflate(data);
            });

            it("has a root function", function () {
                expect(tree.root).toEqual(jasmine.any(Function));
            });

            it("has correct root data", function () {
                expect(tree.root().data).toEqual(jasmine.any(Function));
                expect(tree.root().data()).toEqual({'name': 'hork'});
            });

            it("has a root with no children", function () {
                expect(tree.root().children()).toEqual([]);
            });

            it("is frozen", function () {
                expect(Object.isFrozen(tree)).toBe(true);
                expect(Object.isFrozen(tree.root())).toBe(true);

                var modRoot = function () {
                    tree.root = null;
                };
                expect(modRoot).toThrow();
            });

            it("does not have its data frozen", function() {
                expect(Object.isFrozen(tree.root().data())).toBe(false);
            });

            it("is unaware of changes in its linked data", function() {
                data.b = "test";
                expect(tree.root().data().b).toEqual("test");

                data.children = [{"name": "newKid"}];
                expect(tree.root().data().children.length).toEqual(1);
                expect(tree.root().children()).toEqual([]);
            });

        });
    });
});






(function () {
    var jasmineEnv, htmlReporter, currentWindowOnload;

    jasmineEnv = jasmine.getEnv();

    htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    currentWindowOnload = window.onload;
    window.onload = function () {
        if (currentWindowOnload) {
            currentWindowOnload();
        }

        document.querySelector('.version').innerHTML = jasmineEnv.versionString();
        jasmineEnv.execute();
    };
}());