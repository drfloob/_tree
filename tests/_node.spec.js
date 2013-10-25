var _tree = require("_tree"),
    _ = require("underscore");

describe("_node.children", function () {
    it("is immutable", function () {
        var tree, push, kids, tmpLen;
        tree = _tree.inflate({a: 1, children: [{a: 2}]});
        expect(Object.isFrozen(tree.root().children())).toBeTruthy();

        kids = tree.root().children();
        push = function () {
            kids.push(1)
        };
        
        tmpLen = kids.length;
        expect(push).toThrow();
        expect(tmpLen).toEqual(kids.length);
    });
});