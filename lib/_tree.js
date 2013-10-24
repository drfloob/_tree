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
        // API-only methods
        'inflate': null,
        'clone': null,
        'create': null,

        // Instance and API methods
        'deflate': null,
        'defaults': null,
        'walk': null,
        'root': null,
        'add': null,
        'find': null,
        'contains': null,
        'sample': null
    };

    // And this is the API definition for each node in the tree.
    _node = {
        'delete': null,
        'addChild': null,
        'addChildTree': null,
        'data': null,
        'parent': null,
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
    _tree.inflate = function (Object, Method, Defaults) {

        // You can specify the default behaviour of your tree via the
        // Defaults argument. Anything you don't specify will use the
        // standard default.
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
        return _tree.inflate(null, null, Defaults);
    }


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



    _tree.find = function (Tree, Node) {
        // TODO: consider the need to eliminate assumption that data
        // objects can only appear once in a tree.

        console.log('finding node',Node,'in tree', Tree);
        if (!Node.data())
            throw new Error("internal error: wtf");
        var found = false;
        Tree.walk (function (VNode) {
            if (!found && VNode.data() === Node.data()) {
                found = VNode;
            }
        });
        if (!found)
            throw new Error(["Internal error: Node not found in Tree", Node, Tree])
        return found;
    };



    _tree.walk = function (Tree, Callback, Method) {
        Method = Method || Tree.defaults.walk;
        var _this, 
        qs=[];

        _this = {
            'push': function(Nodes) {
                qs = qs.concat(Nodes);
            },
            'queue': function(Nodes) {
                qs = Nodes.concat(qs);
            },
            'recurse': function(Nodes) {
                _.each(Nodes, function(n) {
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
        if (!Node.parent())
            this.push([Node]);
        this.push(Node.children());
        this.recurse(Node.children());
    };

    _tree.walk.bfpost = function (Node) {
        if (!Node.parent())
            this.queue([Node]);
        this.queue(Node.children());
        this.recurse(Node.children());
    };





    // TODO: grow the stump.
    _tree.deflate = function(){};
    _tree.deflate.toKey = function(){};




    // ## Node definition


    // The data method is both a getter and setter, depending on how
    // it's used.
    _node.data = function (tree, node, Obj) {
        if (!Obj) {
            // If Obj isn't submitted, it's used as a getter.
            return node.__data;
        }

        var newTree;

        // Otherwise, it's used as a setter. Setting the data on a
        // node triggers the creation of a whole new tree.
        console.log('cloning tree', tree);
        newTree = __makeMutableTreeClone_mustFinalizeYourself(tree);
        console.log('compare trees', newTree, tree);
        var newNode = newTree.find(node);
        if(!newNode)
            throw new Error(["Internal Error: Node not found in new tree", node, newTree]);
        newNode.__data = Obj;
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };

    // A simple getter for node children.
    _node.children = function (Tree, Node) {
        return Node.__children || [];
    };

    

    // To add a child node, an object representing the node data is
    // parsed as if it were a new tree and then added as the last
    // child of the parent.
    //
    // Returns a new Tree
    _node.addChild = function (Tree, ParentNode, Object, Method) {
        Method = Method || Tree.defaults().inflate;
        var childTree = new Tree(Tree.defaults, Object, Method);

        // Mutable Magic
        NewTree = __makeMutableTreeClone_mustFinalizeYourself(Tree);
        var newNode = NewTree.find(ParentNode);
        if(!newNode)
            throw new Error(["Internal Error: Node not found in new tree", Node, NewTree]);
        newNode.__children.push(childTree.root());
        __finalizeMutableTreeClone(NewTree);
        return NewTree;
    };







    // ## INTERNAL
    //
    // The next chunk of code is entirely made up of internal
    // functions and private static data.


    // Dev notes: Raw object state that needs to be monitored
    // _tree: [__root]
    // _node: [__tree, __children]
    
    function __inflate(Tree, Object, Method, Parent) {
        var thisnode = new Node(Tree), 
        _this;
        Tree.__root = thisnode;

        _this = {
            // This function immediately replaces the tree after
            // setting data on the current node
            emit: function (Data) {
                Tree = thisnode.data(Data);
                thisnode = Tree.find(thisnode);
            },
            // Calling this immediately processes a set of
            // to-be-parsed child node objects, replacing the tree
            children: function (Nodes) {
                // console.log('childrening')
                var treeAndparent = _.reduce(Nodes, function (treeAndParent, visitedObject) { 
                    var tmpTree = treeAndParent[0];
                    var tmpPar = treeAndParent[1];
                    tmpTree = tmpPar.addChild(visitedObject, Method);
                    tmpPar = tmpTree.find(tmpPar);
                    return [tmpTree, tmpPar];
                }, [Tree, thisnode]);

                Tree = treeAndParent[0];
                thisnode = treeAndParent[1];
                },
            // Processing sibling nodes usually won't be necessary,
            // since processing all child nodes from the root catches
            // everything. But if you need it, you can call this
            // method.
            siblings: function (Nodes) {
                // TODO: error if no Parent
                var treeAndParent = _.reduce(Nodes, function (treeAndParent, visitedObject) { 
                    var tmpTree = treeAndParent[0];
                    var tmpPar = treeAndParent[1];
                    tmpTree = tmpPar.addChild(visitedObject, Method);
                    tmpPar = tmpTree.find(tmpPar);
                    return [tmpTree, tmpPar];
                }, [Tree, Parent]);
                Tree = treeAndParent[0];
                Parent = treeAndParent[1];
            }
        };

        console.log('before inflating', thisnode)
        Method.call(_this, Object);
        console.log('after inflating', thisnode)
        return thisnode;
    }


    // The definition of an immutable Tree object.
    Tree = function (Defaults, Obj, Method) {
        this.defaults = Defaults;
        
        if (!!Obj && !!Method) {
            // Obj is inflated via Method, if supplied
            console.log('inflating', Obj, 'with method', Method);
            this.__root = __inflate(this, Obj, Method);
        } else {
            this.__root = new Node(this);
        }

        // Object.freeze(this);
    };
    // A static copy constructor which takes a(n) (im)mutable tree and
    // returns a mutable clone.
    Tree.clone = function(tree) {
        var newTree = new Tree(tree.defaults);
        newTree.__root = Node.clone(newTree, tree.root());
        return newTree;
    };

    _.chain(_tree)
        .omit(['inflate', 'clone', 'create'])
        .each(function (fn, key) {
            // Most public API methods are mixed in to Tree.prototype
            // here, partially bound so that the first argument is
            // already set to the Tree instance.

            Tree.prototype[key] = function () {
                if (_.isNull(fn))
                    console.log('tree null fn', key);
                return _.partial(fn, this).apply(this, _.toArray(arguments));
            };
        });


    // The definition of an immutable Node object.
    Node = function (Tree) {
        // TODO: make private
        this.__tree = Tree;
        this.__data = null;
        this.__children = [];
        // Object.freeze(this);
    };
    Node.clone = function(newTree, node) {
        var newNode = new Node(newTree);
        newNode.__data = node.__data;
        newNode.__children = _.map(node.children(), _.partial(Node.clone, newTree));
        return newNode;
    };
    _.each(_node, function (fn, key) {
        Node.prototype[key] = function () {
            // Similarly, the Node public API is bound to the
            // prototype of each Node.
            return _.partial(fn, this.__tree, this).apply(this, _.toArray(arguments));
        };
    });


    function __makeMutableTreeClone_mustFinalizeYourself(oldTree) {
        
        function __makeMutableChildClones(OldNode) {
            if (_.isUndefined(OldNode))
                throw new Error("Internal Error: nodes should always be defined");
            var NewNode = new Node(null);
            NewNode.__data = OldNode.data();
            NewNode.__children = _.map(OldNode.children(), __makeMutableChildClones);
            return NewNode;
        }

        var NewTree = new Tree(oldTree.defaults);
        NewTree.__root = __makeMutableChildClones(oldTree.root());
        return NewTree;
    }

    // Before returning a mutable cloned tree, it needs to be
    // frozen. Additionally, all the nodes need a reference to their
    // tree.
    function __finalizeMutableTreeClone(Tree) {

        function __finalizeMutableChildNodes(Node) {
            Node.__tree = Tree;
            Object.freeze(Node);
            _.each(Node.children(), __finalizeMutableChildNodes);
        }

        Object.freeze(Tree);
        __finalizeMutableChildNodes(Tree.root());
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