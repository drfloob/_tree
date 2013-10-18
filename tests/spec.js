/*jslint nomen: true, todo: true */
/*global window, document, jasmine, describe, it, expect, beforeEach, _tree */

'use strict';

describe("The _tree module", function () {
    it("is defined", function () {
        expect(_tree).toBeDefined();
    });
});


describe("an inflated tree", function () {
    describe("using all tree defaults", function () {
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

                var modRoot = function () {
                    tree.root = null;
                };
                expect(modRoot).toThrow();
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