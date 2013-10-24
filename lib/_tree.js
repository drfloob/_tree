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

    var _tree, _node, Tree, Node, __defaults, nextTreeId = 1;

    // This is the API definition for the main tree object.
    _tree = {
        // API-only methods
        'inflate': null,
        'create': null,

        // Instance and API methods
        'deflate': null,
        'defaults': null,
        'walk': null,
        'root': null,
        'add': null,
        'find': null,
        'equals': null,
        'contains': null,
        'sample': null
    };

    // And this is the API definition for each node in the tree.
    _node = {
        'delete': null,
        'addChild': null,
        'data': null,
        'parent': null,
        'equals': null,
        'children': null
    };




    // # Public API
    //
    // This next chunk of code defines the public methods of the _tree
    // library, beginning with its main entrypoints.


    // ### _tree.inflate and _tree.create
    // 
    // Inflate parses tree-like data into a `_tree` data structure for
    // you to work with. It does so without modifying your object
    // whatsoever, and can handle any tree data structure you can
    // define.
    _tree.inflate = function (obj, Method, Defaults) {

        // You can specify the default behaviour of your tree via the
        // Defaults argument. Anything you don't specify will use the
        // standard default.
        Defaults = _.defaults(_.clone(Defaults || {}), __defaults);

        // Inflate can handle arbitrary forms of tree-like data by
        // allowing you to define your own object parsing
        // method. There are also a handful of built-in methods you
        // can choose from.
        // 
        // This method is also made the default inflater for
        // subsequent parsing (like in _node.addChild)
        Method = Defaults.inflate = Method || Defaults.inflate;

        // console.log('inflating', obj);
        var tree = new Tree(Defaults, obj, Method);
        __finalizeMutableTreeClone(tree);
        return tree;
    };


    // This creates an empty tree from scratch. Tree-wide defaults can
    // also be set here.
    _tree.create = function (Defaults) {
        return _tree.inflate(null, null, Defaults);
    };


    /**
     * The canonical representation of trees in Javascript can be
     * parsed by this method. It inflates chains of objects where
     * children are specified as a arrays bound to some property of
     * the parent object (usually the 'children' property)
     *
     * For example, it parses an object like this:
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
                this.children(Obj[Key]);
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
        // TODO: test to ensure there's only 1 root node
        var kids, tmpObj;
        this.emit(_.first(Obj));
        if (Obj.length > 1 && _.isArray(Obj[1])) {
            kids = Obj[1];
            for (var i = 0; i < kids.length; i++) {
                tmpObj = [kids[i]];
                if (kids.length > 1 && _.isArray(kids[i+1])) {
                    tmpObj.push(kids[i+1]);
                    i++;
                }
                // var e = new Error();
                // console.log('Obj', Obj);
                // console.log('tmpObj', tmpObj, e.stack);
                this.children([tmpObj]);
            }
        }
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
    };


    // A getter for the root of the tree. The root is just a node like
    // any other.
    _tree.root = function (Tree) {
        return Tree.__root;
    };


    // Find a node in a tree by id correlation, and returns the Node
    // or `false` if no match was found. This can be used to find a
    // matching node in a cloned tree from another clone's Node, since
    // ids are designed to be invariant across tree clones.
    _tree.findNode = function (tree, Node) {
        if (Node.__tree.__id !== tree.__id) {
            return false;
        }
        var found = false;
        tree.walk(function (VNode) {
            if (!found && VNode.__id === Node.__id) {
                found = VNode;
            }
        });
        return found;
    };


    // This method is the workhorse of the application. It allows you
    // to walk the tree in arbitrary ways, and execute a callback for
    // every node in the order you specify.
    _tree.walk = function (Tree, Callback, Method) {
        Method = Method || Tree.defaults.walk;
        var _this, qs = [];

        // In your Method callback, `this` will be bound to this
        // object. To see how it's used, scan the builtin walk methods
        // defined below.
        _this = {
            'push': function (Nodes) {
                qs = qs.concat(Nodes);
            },
            'queue': function (Nodes) {
                qs = Nodes.concat(qs);
            },
            'recurse': function (Nodes) {
                _.each(Nodes, function (n) {
                    Method.call(_this, n);
                });
            }
        };

        Method.call(_this, Tree.root());
        _.each(qs, Callback);
    };


    _tree.walk.dfpre = function (Node) {
        this.push(Node);
        this.recurse(Node.children());
    };

    _tree.walk.dfpost = function (Node) {
        this.recurse(Node.children());
        this.push(Node);
    };


    _tree.walk.bfpre = function (Node) {
        if (!Node.parent()) {
            this.push([Node]);
        }
        this.push(Node.children());
        this.recurse(Node.children());
    };

    _tree.walk.bfpost = function (Node) {
        if (!Node.parent()) {
            this.queue([Node]);
        }
        this.queue(Node.children());
        this.recurse(Node.children());
    };





    // TODO: grow the stump.
    _tree.deflate = function () {};
    _tree.deflate.toKey = function () {};




    // ## Node definition


    // The data method is both a getter and setter, depending on how
    // it's used.
    _node.data = function (tree, node, Obj) {
        if (!Obj) {
            // If Obj isn't submitted, it's used as a getter.
            return node.__data;
        }

        var newTree, newNode;

        // Otherwise, it's used as a setter. Setting the data on a
        // node triggers the creation of a whole new tree.
        newTree = Tree.clone(tree);
        newNode = newTree.findNode(node);
        if (!newNode) {
            throw new Error(["Internal Error: Node not found in new tree", node, newTree]);
        }
        newNode.__data = Obj;
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };

    // A simple getter for node children.
    _node.children = function (tree, node) {
        return node.__children || [];
    };


    // To add a child node, an object representing the node data is
    // parsed as if it were a new tree and then added as the last
    // child of the parent.
    //
    // Returns a new Tree
    _node.addChild = function (tree, ParentNode, Obj, Method) {
        Method = Method || tree.defaults.inflate;
        var childTree, newTree, newNode;
        childTree = new Tree(tree.defaults, Obj, Method, tree.__nextNodeId);

        // Mutable Magic
        newTree = Tree.clone(tree);
        newNode = newTree.findNode(ParentNode);
        if (!newNode) {
            throw new Error(["Internal Error: Node not found in new tree", ParentNode, newTree]);
        }
        newNode.__children.push(childTree.root());
        childTree.root().__parent = newNode;
        newTree.__nextNodeId = childTree.__nextNodeId;

        __finalizeMutableTreeClone(newTree);
        return newTree;
    };


    // Returns the node's parent, or undefined
    _node.parent = function(tree, node) {
        return node.__parent;
    }





    // ## INTERNAL
    //
    // The next chunk of code is entirely made up of internal
    // functions and private static data.


    // Dev notes: Raw object state that needs to be monitored
    // _tree: [__root]
    // _node: [__tree, __children]

    function __inflate(tree, Object, Method) {
        var thisnode = new Node(tree), _this;
        tree.__root = thisnode;

        _this = {
            // Sets data on the current node
            emit: function (Data) {
                thisnode.__data = Data;
            },
            // Calling this immediately processes a set of
            // to-be-parsed child node objects
            children: function (Nodes) {
                console.log('childrening', Nodes, tree)
                _.each(Nodes, function (kidObj) {
                    var kidTree = new Tree(tree.defaults, kidObj, Method, tree.__nextNodeId);
                    console.log('kidTree', kidTree);
                    thisnode.__children.push(kidTree.root());
                    kidTree.root().__parent = thisnode;
                    tree.__nextNodeId = kidTree.__nextNodeId;
                });
            }
        };

        // console.log('before inflating', thisnode)
        Method.call(_this, Object);
        // console.log('after inflating', thisnode)
        return thisnode;
    }


    // The definition of an immutable Tree object.
    Tree = function (Defaults, Obj, Method, nextId) {
        this.defaults = Defaults;
        this.__id = nextTreeId++;
        this.__nextNodeId = nextId || 1;

        if (!!Obj && !!Method) {
            // Obj is inflated via Method, if supplied
            // console.log('inflating', Obj, 'with method', Method);
            this.__root = __inflate(this, Obj, Method);
        } else {
            this.__root = new Node(this);
        }
    };
    // A static copy constructor which takes a(n) (im)mutable tree and
    // returns a mutable clone.
    Tree.clone = function (tree) {
        var newTree = new Tree(tree.defaults);
        nextTreeId--;
        newTree.__root = Node.clone(newTree, tree.root());
        newTree.__id = tree.__id;
        return newTree;
    };

    _.chain(_tree)
        .omit(['inflate', 'clone', 'create'])
        .each(function (fn, key) {
            // Most public API methods are mixed in to Tree.prototype
            // here, partially bound so that the first argument is
            // already set to the Tree instance.

            Tree.prototype[key] = function () {
                if (_.isNull(fn)) {
                    console.log('tree null fn', key);
                }
                return _.partial(fn, this).apply(this, _.toArray(arguments));
            };
        });


    // The definition of an immutable Node object.
    Node = function (tree) {
        // TODO: make private
        this.__tree = tree;
        this.__data = undefined;
        this.__children = [];
        this.__id = tree.__nextNodeId;
        tree.__nextNodeId = tree.__nextNodeId + 1;
    };
    Node.clone = function (newTree, node) {
        var newNode = new Node(newTree);
        newNode.__data = node.__data;
        newNode.__children = _.map(node.children(), _.partial(Node.clone, newTree));
        newNode.__id = node.__id;
        return newNode;
    };
    _.each(_node, function (fn, key) {
        Node.prototype[key] = function () {
            // Similarly, the Node public API is bound to the
            // prototype of each Node.
            return _.partial(fn, this.__tree, this).apply(this, _.toArray(arguments));
        };
    });


    // Before returning a mutable cloned tree, it needs to be
    // frozen. Additionally, all the nodes need a reference to their
    // tree.
    function __finalizeMutableTreeClone(tree) {

        function __finalizeMutableChildNodes(node) {
            // console.log(node, Object.isFrozen(node));
            node.__tree = tree;
            Object.freeze(node);
            _.each(node.children(), __finalizeMutableChildNodes);
        }

        Object.freeze(tree);
        __finalizeMutableChildNodes(tree.root());
    }


    __defaults =  {
        'inflate': _tree.inflate.byKey(),
        'deflate': _tree.deflate.toKey(),
        'walk': _tree.walk.dfpre,
        'deleteRecursive': true
    };


    return _tree;
}));

/*
[returnExports]: https://github.com/umdjs/umd/blob/master/returnExports.js
*/