/*
    Copyright (c) 2013 A. J. Heller
    _tree.js is provided under the MIT License.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use, copy,
    modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
*/
/*global define */
/*jslint nomen: true, todo: true */

// [UMD/returnExports.js][returnExports] setup for AMD, Node.js, and
// Global usages.
(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('underscore'));
    } else {
        // Browser globals (root is window)
        root._tree = factory(root._);
    }
}(this, function (_) {
    'use strict';

    var _tree, _node, Tree, Node, __defaults;

    // This is the API definition for the main tree object.
    _tree = {
        'create': null,
        'inflate': null,
        'deflate': null,
        'walk': null,
        'root': null,
        'add': null,
        'find': null,
        'contains': null,
        'sample': null,
        'clone': null
    };

    // And this is the API definition for each node.
    _node = {
        'delete': null,
        'addChild': null,
        'data': null,
        'children': null
    };





    // ## INTERNAL
    //
    // The next chunk of code is entirely internal functions and
    // private static data.


    
    
    function __inflate(Object, Method, Parent) {
        // TODO: eliminate hidden state
        var thisnode, _this;

        thisnode = new Node();
        _this = {
            emit: function (Data) {
                // console.log('emitting', Data, thisnode.data(Data));
                thisnode = thisnode.data(Data);
            },
            children: function (Nodes) {
                // console.log('childrening')
                thisnode = _.reduce(Nodes, function (par, visitNode) { return par.addChild(__inflate(visitNode, Method, par)); }, thisnode);
            },
            siblings: function (Nodes) {
                // TODO: error if no Parent
                // console/log('siblinging')
                Parent = _.reduce(Nodes, function (par, visitNode) { return par.addChild(__inflate(visitNode, Method, par)); }, Parent);
            }
        };

        Method.call(_this, Object);
        return thisnode;
    }


    // The definition of an immutable Tree object.
    Tree = function (Defaults, Obj, Method) {
        this.defaults = Defaults;

        if (Obj && Method) {
            // Obj is inflated via Method, if supplied
            this.__root = __inflate(Obj, Method);
        }

        Object.freeze(this);
    };

    _.chain(_tree)
        .omit(['inflate'])
        .each(function (fn, key) {
            // Every public API method in _tree is mixed in to
            // Tree.prototype here, and partially bound so that the
            // first argument is already set to the Tree instance.
            Tree.prototype[key] = function () {
                return _.partial(fn, this).apply(this, _.toArray(arguments));
            };
        });


    // The definition of an immutable Node object.
    Node = function () {
        // TODO: implement constructor
        Object.freeze(this);
    };
    _.each(_node, function (fn, key) {
        Node.prototype[key] = function () {
            // Similarly, the Node public API is bound to the
            // prototype of each Node.
            return _.partial(fn, this).apply(this, _.toArray(arguments));
        };
    });




    __defaults =  {
        'inflate': function (Obj) { return (_tree.inflate.byKey()).call(this, Obj); },
        'deflate': function (Obj) { return (_tree.deflate.toKey()).call(this, Obj); },
        'walk': function (tree) { return _tree.walk.dfpre(tree); },
        'deleteRecursive': true
    };





    // # Public API
    //
    // This next chunk of code defines the public methods of the _tree
    // library, beginning with its main entrypoints.


    // ### _tree.inflate and _tree.create
    // 
    // Inflate parses pre-existing into a tree data structure for you
    // to work with. It does so without modifying your object
    // whatsoever, and can handle any tree data structure you can
    // define.
    _tree.inflate = function (Object, Method, Defaults) {

        // You can specify the default behaviour of your tree via the
        // Defaults argument.
        Defaults = _.defaults(_.clone(Defaults || {}), __defaults);

        // Inflate can handle arbitrary forms of tree-like data by
        // allowing you to define your own object parsing
        // method. There are also a handful of built-in methods you
        // can choose from.
        Method = Method || Defaults.inflate;

        return new Tree(Defaults, Object, Method);
    };


    // This creates an empty tree from scratch. Tree-wide defaults can
    // also be set here.
    _tree.create = function (Defaults) {
        return new Tree(Defaults);
    }


    /**
     * The canonical representation of trees in Javascript can be
     * parsed by this method. It inflates chains of objects where
     * children are specified as a arrays bound to some property of
     * the parent object (usually the 'children' property)
     *
     * It parses an object like this:
     *     {'name': parent, 
     *      'children': [
     *          {'name': 'child1'}, 
     *          {'name': 'child2', 'children': [
     *              {'name': 'child3'}]
     *          }]
     *     }
     *
     * into a tree like this:
     *     parent
     *         child1
     *         child2
     *             child3
     */
    _tree.inflate.byKey = function (Key) {
        Key = Key || "children";
        return function (Obj) {
            this.emit(Obj);
            if (_.has(Obj, Key)) {
                this.children(Obj.children);
            }
        };
    };


    /**
     * This inflation method parses a wonky sort of array, wherein
     * every entry is either a node, or an array containing the
     * children of the previous node. This is mabye better seen than
     * described.
     *
     * It parses an array like this:
     *     ['parent', ['child1', 'child2', ['child3']]]
     *
     * into a tree like this:
     *     parent
     *         child1
     *         child2
     *             child3
     */
    _tree.inflate.byAdjacencyList = function (Obj) {
        // TODO: change the name to something more descriptive
        this.emit(_.first(Obj));
        var sibs = _.rest(Obj);
        if (_.isArray(_.first(sibs))) {
            this.children(_.first(sibs));
            sibs = _.rest(sibs);
        }
        this.siblings(sibs);
    };


    /**
     * If your tree only keeps data for leaf nodes, you can use this
     * inflation method to parse arrays like this:
     *     [[child1, [child3]]]
     *
     * into trees like this:
     *     <no data>
     *         child1
     *         <no data>
     *             child3
     */
    _tree.inflate.onlyLeavesList = function (Obj) {
        if (_.isArray(_.first(Obj))) {
            this.children(_.first(Obj));
        } else {
            this.emit(_.first(Obj));
        }
        this.siblings(_.rest(Obj));
    };


    // A getter for the root of the tree. The root is just a node like
    // any other.
    _tree.root = function (Tree) {
        return Tree.__root;
    };



    // ## Node definition


    // The data method is both a getter and setter, depending on how
    // it's used.
    _node.data = function (Node, Obj) {
        if (!Obj) {
            // If Obj isn't submitted, it's used as a getter.
            return Node.__data;
        }

        // Otherwise, it's used as a setter. Setting the data on a
        // node triggers the creation of a whole new tree.

        // TODO: rebuild the whole thing!
        Node.__data = Obj;
        return Node;
    };

    // A simple getter for node children.
    _node.children = function (Node) {
        return Node.__children || [];
    };

    
    
    _node.addChild = function (Node, Child) {
        // TODO: this should be private.
        Node.__children = Node.__children || [];
        Node.__children.append(Child);
        // TODO: rebuild the whole damned thing!
        return Node;
    };

    return _tree;
}));

/*
[returnExports]: https://github.com/umdjs/umd/blob/master/returnExports.js
*/