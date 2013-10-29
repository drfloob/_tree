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

/* jshint -W071 */
/* global define */

// [UMD/returnExports.js](https://github.com/umdjs/umd/blob/master/returnExports.js)
// setup for AMD, Node.js, and Global usages.
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        /* global module, require */
        module.exports = factory(require('underscore'));
    } else {
        // Browser globals (root is window)
        root._tree = factory(root._);
    }
}(this, function (_) {
    'use strict';

    var _tree = {}, Tree, Node, __defaults;

    // A rfc4122-compatible GUID generator, with thanks to 
    // [broofa](http://stackoverflow.com/a/2117523)
    function uuid () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            /* jshint bitwise:false */
            // Bitwise logic is intentional here. Chill out, `jshint`
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            /* jshint bitwise:true */
            return v.toString(16);
        });
    }

    // Before returning a mutable cloned tree, it needs to be properly
    // frozen to maintain our guarantee. Also, since node-to-tree
    // references aren't useful until all modifications are done, all
    // nodes need to be given a reference to their tree.
    function __finalizeMutableTreeClone(tree) {

        function __finalizeMutableChildNodes(node, parent) {
            node.__tree = tree;
            if (parent) {
                node.__parent = parent;
            }
            Object.freeze(node);
            Object.freeze(node.__children);
            _.each(node.children(), function (c) {__finalizeMutableChildNodes(c, node); });
        }

        Object.freeze(tree);
        __finalizeMutableChildNodes(tree.root());
    }


    // # Public API
    //
    // This next chunk of code defines the public methods of the _tree
    // library beginning with its main entrypoints.
    

    // `_tree.inflate` parses tree-like data into an immutable `Tree`
    // object for you to work with. It does so without modifying your
    // object whatsoever, and it can handle any tree data structure
    // you define.
    //
    // You can specify the default behaviour of your tree via the
    // `defaults` argument. Anything you don't specify will take the
    // standard default options.
    //
    // `_tree.inflate` handles all forms of tree-like data by making
    // the object parsing logic fully pluggable. You can define your
    // own parsing `inflateMethod`, or use one of the handful of built-ins.
    _tree.inflate = function (obj, inflateMethod, defaults) {
        defaults = _.defaults(_.clone(defaults || {}), __defaults);

        inflateMethod = defaults.inflate = inflateMethod || defaults.inflate;

        var tree = new Tree(defaults, obj, inflateMethod);
        __finalizeMutableTreeClone(tree);
        return tree;
    };


    // `_tree.create` creates an empty tree from scratch. Tree-wide
    // `defaults` can also be set here.
    _tree.create = function (defaults) {
        return _tree.inflate(null, null, defaults);
    };


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
        Key = Key || 'children';
        return function (Obj) {
            this.emit(Obj);
            if (_.has(Obj, Key)) {
                this.children(Obj[Key]);
            }
        };
    };




    // `_tree.inflate.byAdjacencyList` parses a wonky sort of array,
    // wherein every entry is either a node, or an array containing
    // the children of the previous node. An example to clarify:
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


    // If your tree only keeps data for leaf nodes, you can use `_tree.inflate.onlyLeavesList`
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





    // # Tree
    

    // This is the `Tree` constructor. It is intended to be used
    // internally, and so it returns a **mutable object** that must be
    // frozen before it's returned.
    Tree = function (defaults, obj, inflateMethod, nextNodeId) {
        this.defaults = defaults;
        this.__id = uuid();
        this.__nextNodeId = nextNodeId || 0;

        // `obj` is inflated via `inflateMethod`, if supplied
        if (!!obj && !!inflateMethod) {
            this.__root = Tree.inflate(this, obj, inflateMethod);
        } else {
            this.__root = new Node(this);
        }
    };


    // ## Internal Static Tree Methods
    

    // To facilitate immutability, `Tree.clone` provides a static copy
    // constructor that takes a(n) (im)mutable tree and returns a
    // mutable clone. This method provides the base for all Tree
    // modifications.
    Tree.clone = function (tree) {
        var newTree = new Tree(tree.defaults);
        newTree.__root = Node.clone(newTree, tree.root());
        newTree.__id = tree.__id;
        return newTree;
    };

    // `Tree.inflate` provides the general logic behind object
    // inflation/parsing/deserialization.
    Tree.inflate = function(tree, obj, inflateMethod) {
        var thisnode = new Node(tree), _this;
        tree.__root = thisnode;

        // When `inflateMethod` is called to navigate the submitted
        // tree-like object, `this` is bound to this object, exposing
        // the following functionality:
        //
        //  * `this.emit(data)`: Sets the data for the current node.
        //  * `this.children([child])`: Calling this immediately
        //    processes and inflates a set of child node objects.
        //
        _this = {
            emit: function (Data) {
                thisnode.__data = Data;
            },
            children: function (Nodes) {
                _.each(Nodes, function (kidObj) {
                    var kidTree = new Tree(tree.defaults, kidObj, inflateMethod, tree.__nextNodeId);
                    thisnode.__children.push(kidTree.root());
                    kidTree.root().__parent = thisnode;
                    tree.__nextNodeId = kidTree.__nextNodeId;
                });
            }
        };

        inflateMethod.call(_this, obj);
        return thisnode;
    };


    // ## Tree Instance Methods
    


    // A getter for the root `Node` of the tree.
    Tree.prototype.root = function () {
        return this.__root;
    };



    // Find a node in a tree by internal id correlation, and return
    // the Node or `false` if no match was found. This can be used to
    // find a matching node in a cloned tree, since ids are designed
    // to be invariant across clones.
    Tree.prototype.findNode = function (fromNode, walkMethod) {
        if (!this.equals(fromNode.__tree)) {
            return false;
        }

        var found = false;
        this.walk(function (visitNode) {
            if (!found && fromNode.equals(visitNode)) {
                found = visitNode;
            }
        }, walkMethod);
        return found;
    };


    // Matches a node by its data using deep comparison *without*
    // object equality, via `_.isEqual(node.data(), data)`
    Tree.prototype.findNodeByData = function (data, walkMethod) {
        if (_.isUndefined(data)) {
            return false;
        }

        var found = false;
        this.walk(function (visitNode) {
            if (!found && _.isEqual(data, visitNode.__data)) {
                found = visitNode;
            }
        }, walkMethod);
        return found;
    };


    // This method is the workhorse of the library. It allows you to
    // walk the tree in arbitrary ways (specified by `walkMethod`), and
    // execute `Callback` for every node in the order you specify.
    Tree.prototype.walk = function (Callback, walkMethod) {
        walkMethod = walkMethod || this.defaults.walk;
        var _this, qs = [], recurList = [], tmpNode;

        // In `walkMethod`, `this` will be bound to the following
        // object. To see how it's used, scan the built-in walk
        // methods below. Briefly, the binding provides:
        //
        //  * `queue`: Adds nodes to the end of the callback list.
        //  * `push`: Adds nodes to the front of the callback list.
        //  * `recurse`: Recurses immediately on the set of nodes.
        //  * `queueRecurse`: Adds a set of nodes to the end of a list of nodes to recurse on next.
        _this = {

            'queue': function (Nodes) {
                qs = qs.concat(Nodes);
            },
            'push': function (Nodes) {
                qs = Nodes.concat(qs);
            },
            'recurse': function (Nodes) {
                _.each(Nodes, function (n) {
                    walkMethod.call(_this, n);
                });
            },
            'queueRecurse': function (Nodes) {
                recurList = recurList.concat(Nodes);
            }
        };

        // Before executing any callbacks, an ordered list of nodes
        // (`qs`) is generated. In some cases, `walkMethod` many not be
        // able to evaluate all nodes in one pass, so `recurList` is
        // used to track which nodes to visit in the next pass.  It
        // can take as many passes as required.
        walkMethod.call(_this, this.root());
        while (recurList.length > 0) {
            tmpNode = recurList.shift();
            walkMethod.call(_this, tmpNode);
        }
        // Finally, `Callback` is called for each node, in order.
        _.each(qs, Callback);
    };


    // The is the implementation of the built-in depth-first,
    // pre-order traversal algorithm. It is setup as the default walk
    // method.
    Tree.prototype.walk.dfpre = function (Node) {
        this.queue(Node);
        this.recurse(Node.children());
    };

    // Depth-first, post-order traversal algorithm.
    Tree.prototype.walk.dfpost = function (Node) {
        this.recurse(Node.children());
        this.queue(Node);
    };


    // Breadth-first, pre-order traversal algorithm.
    Tree.prototype.walk.bfpre = function (Node) {
        if (!Node.parent()) {
            this.queue([Node]);
        }
        this.queue(Node.children());
        this.recurse(Node.children());
    };

    // Breadth-first, post-order traversal algorithm.
    Tree.prototype.walk.bfpost = function (Node) {
        if (!Node.parent()) {
            this.push([Node]);
        }
        this.push(Node.children());
        var rev = _.clone(Node.children());
        rev.reverse();
        this.queueRecurse(rev);
    };


    // `TreeInstance.equals` tests for equality of trees across clone
    // lines. Returns `boolean`, whether trees share any clone
    // lineage.
    Tree.prototype.equals = function (otherTree) {
        return this.__id === otherTree.__id;
    };

    // A shorthand method to test whether a `Node` exists in the
    // `Tree`. `someNode` can be from any tree clone.
    Tree.prototype.contains = function (someNode) {
        return (this.findNode(someNode) instanceof Node);
    };


    Tree.prototype.sample = function () {
        throw new Error('not implemented');
    };



    // # Node
    


    // This defines the `Node` constructor, and much like `Tree`, the
    // resulting object is mutable until just before being exposed to
    // the external world.
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




    // The `Node.data` method is both a getter and setter, depending
    // on how it's used.
    //
    // If `Obj` isn't submitted, it's used as a getter.
    // 
    // Otherwise, it's used as a setter. Setting the data on a node
    // triggers the creation of a complete tree clone. Modifications
    // are done to the mutable clone, and the entire tree is returned
    // after being made immutable.
    Node.prototype.data = function (Obj) {

        if (!Obj) {
            return this.__data;
        }

        var newTree, newNode;

        newTree = Tree.clone(this.__tree);
        newNode = newTree.findNode(this);
        if (!newNode) {
            throw new Error(['Internal Error: Node not found in new tree', this, newTree]);
        }
        newNode.__data = Obj;
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };

    // A simple getter for node children.
    Node.prototype.children = function () {
        return this.__children || [];
    };

    // A simple getter for the node's parent. Returns `undefined` if
    // no parent is set.
    Node.prototype.parent = function () {
        return this.__parent;
    };


    // To add a child node, an object representing the node data is
    // parsed as if it were a new tree and then appended to the end of
    // the children array. Remember that a newly-cloned tree is
    // returned, *not* a `Node`.
    Node.prototype.addChild = function (childObj, inflateMethod) {
        inflateMethod = inflateMethod || this.__tree.defaults.inflate;
        var childTree, newTree, newNode, tree;
        tree = this.__tree;
        childTree = new Tree(tree.defaults, childObj, inflateMethod, tree.__nextNodeId);

        newTree = Tree.clone(tree);
        newNode = newTree.findNode(this);
        if (!newNode) {
            throw new Error(['Internal Error: Node not found in new tree', this, newTree]);
        }
        newNode.__children.push(childTree.root());
        childTree.root().__parent = newNode;
        newTree.__nextNodeId = childTree.__nextNodeId;

        __finalizeMutableTreeClone(newTree);

        return newTree;
    };


    // `Node.equals` works across clone lines, determining if both
    // nodes *represent* the same node regardless of whether they're
    // the same object in memory.
    Node.prototype.equals = function(otherNode) {
        return this.__tree.equals(otherNode.__tree) &&
            this.__id === otherNode.__id;
    };

    Node.prototype.delete = function () {
        // throw new Error('not implemented');
        if (this === this.__tree.__root) {
            throw new Error('cannot delete the root node');
        }

        var newTree, newNode, parNode;

        newTree = Tree.clone(this.__tree);
        newNode = newTree.findNode(this);
        if (!newNode) {
            throw new Error(['Internal Error: Node not found in new tree', this, newTree]);
        }
        parNode = newTree.findNode(this.__parent);
        if (!parNode) {
            throw new Error(['Internal Error: Node not found in new tree', parNode, newTree]);
        }

        parNode.__children = _.without(parNode.__children, newNode);
        __finalizeMutableTreeClone(newTree);

        return newTree;
    };



    // Finally, we setup some library-wide defaults.
    __defaults =  {
        'inflate': _tree.inflate.byKey(),
        'walk': Tree.prototype.walk.dfpre,
        'deleteRecursive': true
    };

    // And we're done.
    return _tree;
}));
