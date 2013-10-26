/*
    _tree.js 0.1.0
    (c) 2013 A. J. Heller
    _tree.js may be freely distributed under the MIT License.
*/
/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.  
*/

// [UMD/returnExports.js](https://github.com/umdjs/umd/blob/master/returnExports.js)
// setup for AMD, Node.js, and Global usages.
(function (root, factory) {
    'use strict';
    var define;

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


    // A rfc4122-compatible GUID generator, from
    // [broofa](http://stackoverflow.com/a/2117523)
    function uuid () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    // Before returning a mutable cloned tree, it needs to be
    // frozen. And all the nodes need a reference to their proper
    // tree.
    function __finalizeMutableTreeClone(tree) {

        function __finalizeMutableChildNodes(node) {
            node.__tree = tree;
            Object.freeze(node);
            Object.freeze(node.__children);
            _.each(node.children(), __finalizeMutableChildNodes);
        }

        Object.freeze(tree);
        __finalizeMutableChildNodes(tree.root());
    }


    // ## "Headers"
    
    // This is the `_tree` API
    _tree = {
        // These two methods are used in the `_tree` API only, and are
        // not mixed in to `Tree` objects.
        'inflate': null,
        'create': null,

        // The rest are used as `_tree` API methods and as `Tree`
        // instance methods.
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

    // This is the `Node` API for each node in a `_tree`.
    _node = {
        'delete': null,
        'addChild': null,
        'data': null,
        'parent': null,
        'equals': null,
        'children': null
    };


    // # Public API Implementation
    //
    // This next chunk of code defines the public methods of the _tree
    // library, beginning with its main entrypoints.
    

    // ### _tree.inflate
    // 
    // Inflate parses tree-like data into a `_tree` data structure for
    // you to work with. It does so without modifying your object
    // whatsoever, and can handle any tree data structure you can
    // define.
    //
    // You can specify the default behaviour of your tree via the
    // `Defaults` argument. Anything you don't specify will take the
    // standard default options.
    //
    // Inflate handles all forms of tree-like data by making the
    // object parsing logic fully pluggable. You can define your own
    // parsing `Method`, or use one of the handful of built-ins.
    _tree.inflate = function (obj, Method, Defaults) {
        Defaults = _.defaults(_.clone(Defaults || {}), __defaults);

        Method = Defaults.inflate = Method || Defaults.inflate;

        var tree = new Tree(Defaults, obj, Method);
        __finalizeMutableTreeClone(tree);
        return tree;
    };


    // ### _tree.create
    // 
    // This creates an empty tree from scratch. Tree-wide `Defaults` can
    // also be set here.
    _tree.create = function (Defaults) {
        return _tree.inflate(null, null, Defaults);
    };


    // ### _tree.inflate.byKey
    // 
    // Maybe the most natural representation of trees in Javascript
    // can be parsed by this method. It inflates chains of objects
    // that have child arrays bound to some property of the parent
    // object (usually 'children')
    //
    // For example, it parses an object like this:
    //
    //     {'name': parent, 
    //      'children': [
    //          {'name': 'child1'}, 
    //          {'name': 'child2', 'children': [
    //              {'name': 'child3'}]
    //          }]
    //     }
    //
    // into a tree like this:
    //
    //     parent
    //         child1
    //         child2
    //             child3
    _tree.inflate.byKey = function (Key) {
        Key = Key || "children";
        return function (Obj) {
            this.emit(Obj);
            if (_.has(Obj, Key)) {
                this.children(Obj[Key]);
            }
        };
    };


    // ### _tree.inflate.byAdjacencyList
    //
    // This inflation method parses a wonky sort of array, wherein
    // every entry is either a node, or an array containing the
    // children of the previous node. An example to clarify:
    //
    // It parses an array like this:
    //
    //     ['parent', ['child1', 'child2', ['child3']]]
    //
    // into a tree like this:
    //
    //     parent
    //         child1
    //         child2
    //             child3
    _tree.inflate.byAdjacencyList = function (Obj) {
        var kids, tmpObj, i;
        this.emit(_.first(Obj));
        if (Obj.length > 1 && _.isArray(Obj[1])) {
            kids = Obj[1];
            for (i = 0; i < kids.length; i++) {
                tmpObj = [kids[i]];
                if (kids.length > 1 && _.isArray(kids[i + 1])) {
                    tmpObj.push(kids[i + 1]);
                    i++;
                }
                this.children([tmpObj]);
            }
        }
    };


    // ### _tree.inflate.onlyLeavesList
    //
    // If your tree only keeps data for leaf nodes, you can use this
    // inflation method to parse arrays like this:
    //
    //     [[child1, [child3]]]
    //
    // into trees like this:
    //
    //     <no data>
    //         child1
    //         <no data>
    //             child3
    //
    _tree.inflate.onlyLeavesList = function (Obj) {
        if (_.isArray(_.first(Obj))) {
            this.children(_.first(Obj));
        } else {
            this.emit(_.first(Obj));
        }
    };


    // ### _tree.root
    //
    // A getter for the root `Node` of the tree.
    _tree.root = function (Tree) {
        return Tree.__root;
    };


    // ### _tree.findNode
    //
    // Find a node in a tree by internal id correlation, and return
    // the Node or `false` if no match was found. This can be used to
    // find a matching node in a cloned tree, since ids are designed
    // to be invariant across clones.
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


    // ### _tree.walk
    //
    // This method is the workhorse of the library. It allows you to
    // walk the tree in arbitrary ways (specified by `Method`), and
    // execute `Callback` for every node in the order you specify.
    _tree.walk = function (Tree, Callback, Method) {
        Method = Method || Tree.defaults.walk;
        var _this, qs = [], recurList = [], tmpNode;

        // In `Method`, `this` will be bound to the following object. To
        // see how it's used, scan the built-in walk methods below.
        _this = {

            // Adds nodes to the end of the callback list.
            'queue': function (Nodes) {
                qs = qs.concat(Nodes);
            },

            // Adds nodes to the front of the callback list.
            'push': function (Nodes) {
                qs = Nodes.concat(qs);
            },

            // Recurses immediately on the set of nodes.
            'recurse': function (Nodes) {
                _.each(Nodes, function (n) {
                    Method.call(_this, n);
                });
            },

            // Adds a set of nodes to the end of a list of nodes to
            // recurse on next.
            //
            // Note that a `pushRecurse` method isn't needed because
            // `_this.recurse` effectively does the same thing as
            // pushing the set of Nodes to the front of the visitation
            // list.
            'queueRecurse': function (Nodes) {
                recurList = recurList.concat(Nodes);
            }
        };

        // Before executing any callbacks, an ordered list of nodes
        // (`qs`) is generated. In some cases, `Method` many not be
        // able to evaluate all nodes in one pass, so `recurList` is
        // used to track which nodes to visit in the next pass.  It
        // can take as many passes as required.
        Method.call(_this, Tree.root());
        while (recurList.length > 0) {
            tmpNode = recurList.shift();
            Method.call(_this, tmpNode);
        }
        // Finally, `Callback` is called for each node, in order.
        _.each(qs, Callback);
    };


    // ### _tree.walk.dfpre
    //
    // The is the implementation of the built-in depth-first,
    // pre-order traversal algorithm. It is setup as the default walk
    // method.
    _tree.walk.dfpre = function (Node) {
        this.queue(Node);
        this.recurse(Node.children());
    };

    // ### _tree.walk.dfpost
    //
    // Depth-first, post-order traversal algorithm.
    _tree.walk.dfpost = function (Node) {
        this.recurse(Node.children());
        this.queue(Node);
    };


    // ### _tree.walk.bfpre
    //
    // Breadth-first, pre-order traversal algorithm.
    _tree.walk.bfpre = function (Node) {
        if (!Node.parent()) {
            this.queue([Node]);
        }
        this.queue(Node.children());
        this.recurse(Node.children());
    };

    // ### _tree.walk.bfpost
    //
    // Breadth-first, post-order traversal algorithm.
    _tree.walk.bfpost = function (Node) {
        if (!Node.parent()) {
            this.push([Node]);
        }
        this.push(Node.children());
        var rev = _.clone(Node.children());
        rev.reverse();
        this.queueRecurse(rev);
    };


    // ### _node.data
    //
    // The data method is both a getter and setter, depending on how
    // it's used. 
    //
    // If Obj isn't submitted, it's used as a getter.
    // 
    // Otherwise, it's used as a setter. Setting the data on a node
    // triggers the creation of a tree clone. Modifications are done
    // to the mutable clone, and the entire tree is returned after
    // being made immutable.
    _node.data = function (tree, node, Obj) {

        if (!Obj) {
            return node.__data;
        }

        var newTree, newNode;

        newTree = Tree.clone(tree);
        newNode = newTree.findNode(node);
        if (!newNode) {
            throw new Error(["Internal Error: Node not found in new tree", node, newTree]);
        }
        newNode.__data = Obj;
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };

    // ### _node.children
    // 
    // A simple getter for node children.
    _node.children = function (tree, node) {
        return node.__children || [];
    };


    // ### _node.addChild
    // 
    // To add a child node, an object representing the node data is
    // parsed as if it were a new tree and then appended to the end of
    // the children array.
    _node.addChild = function (tree, ParentNode, Obj, Method) {
        Method = Method || tree.defaults.inflate;
        var childTree, newTree, newNode;
        childTree = new Tree(tree.defaults, Obj, Method, tree.__nextNodeId);

        newTree = Tree.clone(tree);
        newNode = newTree.findNode(ParentNode);
        if (!newNode) {
            throw new Error(["Internal Error: Node not found in new tree", ParentNode, newTree]);
        }
        newNode.__children.push(childTree.root());
        childTree.root().__parent = newNode;
        newTree.__nextNodeId = childTree.__nextNodeId;

        __finalizeMutableTreeClone(newTree);

        // As with all `_node` editing methods, a newly-cloned tree
        // is returned.
        return newTree;
    };


    // ### _node.parent
    // 
    // Returns the node's parent, or `undefined`
    _node.parent = function (tree, node) {
        return node.__parent;
    };



    // ## INTERNAL
    //
    // The next chunk of code consists entirely of internal functions
    // and private static data.
    

    // `__inflate` provides the general logic behind object
    // inflation/parsing/deserialization.
    function __inflate(tree, Object, Method) {
        var thisnode = new Node(tree), _this;
        tree.__root = thisnode;

        // When `Method` is called to navigate the submitted tree-like
        // object, `this` is set to the following object.
        _this = {

            // Sets data on the current node
            emit: function (Data) {
                thisnode.__data = Data;
            },

            // Calling this immediately processes a set of child node
            // objects.
            children: function (Nodes) {
                _.each(Nodes, function (kidObj) {
                    var kidTree = new Tree(tree.defaults, kidObj, Method, tree.__nextNodeId);
                    thisnode.__children.push(kidTree.root());
                    kidTree.root().__parent = thisnode;
                    tree.__nextNodeId = kidTree.__nextNodeId;
                });
            }
        };

        Method.call(_this, Object);
        return thisnode;
    }


    // The definition of an immutable Tree object.
    Tree = function (Defaults, Obj, Method, nextId) {
        this.defaults = Defaults;
        this.__id = uuid();
        this.__nextNodeId = nextId || 1;

        // `Obj` is inflated via `Method`, if supplied
        if (!!Obj && !!Method) {
            this.__root = __inflate(this, Obj, Method);
        } else {
            this.__root = new Node(this);
        }
    };

    // A static copy constructor which takes a(n) (im)mutable tree and
    // returns a mutable clone. This provides the base for all
    // modifications in `_tree`.
    Tree.clone = function (tree) {
        var newTree = new Tree(tree.defaults);
        newTree.__root = Node.clone(newTree, tree.root());
        newTree.__id = tree.__id;
        return newTree;
    };

    // Most public API methods are mixed in to `Tree.prototype` here,
    // partially bound so that the first argument is already set to
    // the `Tree` instance the method is bound to.
    _.chain(_tree)
        .omit(['inflate', 'clone', 'create'])
        .each(function (fn, key) {
            Tree.prototype[key] = function () {
                if (_.isNull(fn)) {
                    throw new Error("Tree method not yet implemented: " + key);
                }
                return _.partial(fn, this).apply(this, _.toArray(arguments));
            };
        });


    // The definition of an immutable Node object.
    Node = function (tree) {
        this.__tree = tree;
        this.__data = undefined;
        this.__children = [];
        this.__id = tree.__nextNodeId;
        tree.__nextNodeId = tree.__nextNodeId + 1;
    };
    // A static copy constructor for `Node` objects, much like
    // `Tree.clone`, but recursive. All child nodes are cloned as
    // well.
    Node.clone = function (newTree, node) {
        var newNode = new Node(newTree);
        newNode.__data = node.__data;
        newNode.__children = _.map(node.children(), _.partial(Node.clone, newTree));
        newNode.__id = node.__id;
        return newNode;
    };
    // Similarly, the `Node` public API is mixed in to the
    // `Node.prototype`. All methods require both a `Tree` and `Node`
    // reference, so both are bound to the methods beforehand.
    _.each(_node, function (fn, key) {
        Node.prototype[key] = function () {
            return _.partial(fn, this.__tree, this).apply(this, _.toArray(arguments));
        };
    });

    // Finally, we setup some library-wide defaults.
    __defaults =  {
        'inflate': _tree.inflate.byKey(),
        'deflate': _tree.deflate.toKey(),
        'walk': _tree.walk.dfpre,
        'deleteRecursive': true
    };

    // And we're done.
    return _tree;
}));
