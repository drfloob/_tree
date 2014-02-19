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

    var _tree = {}, Tree, Node, __defaults, extend;

    function __callback(tree, event) {
        var args = Array.prototype.slice.call(arguments, 2);
        _.each(tree.defaults.callbacks[event], function(cb) {
            _.partial(cb, tree).apply(null, args);
        });
    }


    function __preFinalizeTree(tree) {
        // engage mixins before calling the tree pre-finalized
        _.each(tree.defaults.mixins, function(mix) {
            if (mix.tree) {
                _.each(mix.tree, function(f, key) {
                    tree[key] = f;
                });
            }
            if (mix.node) {
                _.each(mix.node, function(f, key) {
                    tree.walk(function(visitNode) {
                        visitNode[key] = f;
                    });
                });
            }
        });

        __setupAncestry(tree);
    }


    // Since tree and nodes are not set until this point, a
    // meaningful ancestry needs to be setup here at this last
    // step.
    function __setupAncestry(tree, node, parent) {
        if (!node) {
            node = tree.root();
        }
        node.__tree = tree;
        if (parent) {
            node.__parent = parent;
        }

        _.each(node.children(), function(c) {__setupAncestry(tree, c, node); });
    }


    // Before returning a mutable cloned tree, it needs to be properly
    // frozen to maintain its immutability guarantee. Also, since
    // trees aren't immutable until all node modifications are done,
    // all nodes need to be given this last-stage reference to the
    // tree.
    function __finalizeMutableTreeClone(tree) {

        // Environments that don't support `Object.freeze` will still
        // work, but without guaranteed tree immutability.
        try { Object.freeze(tree); } catch (e) {}

        // finalizeMutableChildNodes
        tree.walk(function(node) {
            try {
                Object.freeze(node);
                Object.freeze(node.__children);
            } catch (e) {}
        });
        
        // call each afterUpdate callback with the new tree
        __callback(tree, 'afterUpdate');
    }


    function __cloneDefaults(defaults) {
        defaults = defaults ? _.clone(defaults) : {};
        defaults.callbacks = _.defaults(_.clone(defaults.callbacks || {}), __defaults.callbacks);
        defaults.mixins = _.union((defaults.mixins || []), __defaults.mixins);
        defaults = _.defaults(defaults, __defaults);
        return defaults;
    }


    // # Public API
    
    // `_tree.inflate` parses arbitrary tree-like data into an
    // immutable `Tree` object. It handles any kind of tree-like data
    // since the `inflateMethod` argument determines how the data will
    // be parsed. A Handful of inflate methods are included. You can
    // specify the default behaviour of your tree via the `defaults`
    // argument. Anything you don't specify will take the standard
    // default options.
    _tree.inflate = function (obj, inflateMethod, defaults) {
        defaults = __cloneDefaults(defaults);
        inflateMethod = defaults.inflate = inflateMethod || defaults.inflate;

        var tree = new defaults.treeClass(defaults, obj, inflateMethod);
        __preFinalizeTree(tree);
        __callback(tree, 'beforeFreeze');
        __finalizeMutableTreeClone(tree);
        return tree;
    };


    // `_tree.create` creates an empty tree from scratch. Tree-wide
    // `defaults` can also be set here.
    _tree.create = function (defaults) {
        return _tree.inflate(null, null, defaults);
    };


    // Maybe the most natural representation of trees in Javascript
    // can be parsed by this `_tree.inflate` method. It inflates
    // objects that have child arrays bound to some property of the
    // parent object (usually 'children')
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
            this.setNode(new _tree.Node(this.tree, Obj));
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
        this.setNode(new _tree.Node(this.tree, _.first(Obj)));
        if (Obj.length > 1) {
            if (!_.isArray(Obj[1]) || Obj.length > 2) {
                throw 'invalid adjacency list';
            }
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
        if (!_.isArray(Obj) || Obj.length > 1) {
            throw 'invalid leaves list';
        }
        if (_.isArray(_.first(Obj))) {
            this.setNode(new _tree.Node(this.tree));
            this.children(_.map(_.first(Obj), function (n) {return [n];}));
        } else {
            this.setNode(new _tree.Node(this.tree, _.first(Obj)));
        }
    };



    // `_tree.fromNode`, allows the creation of a new tree from an
    // existing `Node`. The new tree is considered to *not* be a clone
    // of the node's original tree.
    _tree.fromNode = function (node, defaults) {
        var tree;
        defaults = __cloneDefaults(defaults);
        tree = new defaults.treeClass(defaults);
        tree.__root = node.constructor.clone(tree, node);
        __preFinalizeTree(tree);
        __callback(tree, 'beforeFreeze');
        __finalizeMutableTreeClone(tree);
        return tree;
    };



    // # Tree
    //
    // This is the `Tree` constructor. It is intended to be used
    // internally, and so it returns a mutable object that must be
    // finalized and frozen before it's returned. For the sake of IE8,
    // and all other environments that don't support
    // Object.definePropert(y|ies), the nasty bit of try/catch here
    // allows `_tree` to function in those environments without the
    // guarantee of immutability.
    Tree = function (defaults, obj, inflateMethod, nextNodeId) {
        var  __id, __nextNodeId, __root;

        this.defaults = defaults;
        __id = _.uniqueId();
        __nextNodeId = nextNodeId || 0;

        try {
            Object.defineProperties(this, {
                '__id': {
                    value: __id,
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                '__nextNodeId': {
                    value: __nextNodeId,
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                '__batch': {
                    value: 0,
                    writable: true,
                    enumerable: false,
                    configurable: false
                }
            });
        } catch (e) {
            this.__id = __id;
            this.__nextNodeId = __nextNodeId;
            this.__batch = 0;
        }
        
        if (!!obj && !!inflateMethod) {
            __root = Tree.inflate(this, obj, inflateMethod);
        } else {
            __root = new Node(this);
        }

        try {
            Object.defineProperties(this, {
                '__root': {
                    writable: true,
                    enumerable: false,
                    configurable: false,
                    value: __root
                }
            });
        } catch (e) {
            this.__root = __root;
        }
    };
    _tree.Tree = Tree;



    // ## Internal Static Tree Methods
    

    // To facilitate immutability, `Tree.clone` provides a static copy
    // constructor that takes a(n) (im)mutable tree and returns a
    // mutable clone. This method provides the base for all Tree
    // modifications.
    Tree.clone = function (tree) {
        var newTree = new tree.constructor(tree.defaults);
        newTree.__root = tree.root().constructor.clone(newTree, tree.root());
        newTree.__nextNodeId = tree.__nextNodeId;
        newTree.__id = tree.__id;
        return newTree;
    };

    // `Tree.inflate` provides the general logic behind object
    // inflation/parsing/deserialization.
    Tree.inflate = function(tree, obj, inflateMethod) {
        var thisnode, _this;

        // thisnode = new Node(tree)

        // When `inflateMethod` is called to navigate `obj`, `this` is
        // bound to the following object:
        //
        //  * `this.setNode(Node)`: Sets the current node. Must be
        //    done before `this.children` is called.
        //  * `this.children([child])`: Calling this immediately
        //    processes and inflates a set of child node objects.
        //
        _this = {
            tree: tree,
            setNode: function(node) {
                thisnode = node;
            },
            children: function (Nodes) {
                _.each(Nodes, function (kidObj) {
                    var kidTree = new tree.constructor(tree.defaults, kidObj, inflateMethod, tree.__nextNodeId);
                    thisnode.__children.push(kidTree.root());
                    kidTree.root().__parent = thisnode;
                    tree.__nextNodeId = kidTree.__nextNodeId;
                });
            }
        };

        tree.__root = thisnode;

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
    Tree.prototype.findNode = function (fromNode, walkMethod, startNode) {
        if (! (fromNode instanceof Node)) {
            throw 'not a node';
        }

        if (!this.equals(fromNode.__tree)) {
            return false;
        }

        var found = false;
        this.walk(function (visitNode) {
            if (!found && fromNode.equals(visitNode)) {
                found = visitNode;
            }
        }, walkMethod, startNode);
        return found;
    };


    // Matches a node by its data using deep comparison, without
    // requiring object equality, via `_.isEqual(node.data(), data)`
    Tree.prototype.findNodeByData = function (data, walkMethod, startNode) {
        var isMatch, keys, found = false;
        if (_.isUndefined(data)) {
            return false;
        }
        if (_.isObject(data) && !_.isArray(data)) {
            keys = _.keys(data);
            isMatch = function(nodeData) {
                if (!_.isObject(nodeData) || _.isArray(nodeData)) {
                    return false;
                }
                return _.isEqual(data, _.partial(_.pick, nodeData).apply(_, keys));
            };
        } else {
            isMatch = function(nodeData) {
                return _.isEqual(data, nodeData);
            };
        }

        this.walk(function (visitNode) {
            if (!found && isMatch(visitNode.__data)) {
                found = visitNode;
            }
        }, walkMethod, startNode);
        return found;
    };


    // This method is the workhorse of the library. It allows you to
    // walk the tree in arbitrary ways (specified by `walkMethod`), and
    // execute `Callback` for every node in the order you specify.
    Tree.prototype.walk = function (Callback, walkMethod, startNode) {
        walkMethod = walkMethod || this.defaults.walk;
        var _this, qs = [], recurList = [], tmpNode;

        if (startNode) {
            if (!this.containsNode(startNode)) {
                throw new Error('startNode does not exist in the tree');
            }
        } else {
            startNode = this.root();
        }

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
        walkMethod.call(_this, startNode);
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


    // Tests for equality of trees across clone
    // lines. Returns `boolean`, whether trees share any clone
    // lineage.
    Tree.prototype.equals = function (otherTree) {
        return (otherTree instanceof Tree) && this.__id === otherTree.__id;
    };

    // A shorthand method to test whether a `Node` exists in the
    // `Tree`. `someNode` can be from any tree clone.
    Tree.prototype.containsNode = function (someNode) {
        return (this.findNode(someNode) instanceof Node);
    };


    // A shorthand method to test whether a node containing this data
    // exists in the `Tree`.
    Tree.prototype.containsData = function(someData) {
        return (this.findNodeByData(someData) instanceof Node);
    };


    // Returns a new `Tree` created by 
    // 
    //  * deleting the `movingNode`, 
    //  * finding the destination parent node in the new `Tree` context, and
    //  * adding the `movingNode` as a child
    Tree.prototype.moveNode = function (movingNode, toParent) {
        return this.batch()
            .findNode(movingNode).remove()
            .findNode(toParent)
            .addChildNode(movingNode)
            .end();
    };


    // Registers callbacks for tree events. Currently, `event` can
    // only be 'afterUpdate', and `callback` can either be a single
    // function or an array of functions.
    //
    // Note that adding callbacks generates a new tree, much as any
    // other tree modification
    Tree.prototype.on = function(event, callback) {
        var newTree, cb;
        newTree = Tree.clone(this);
        cb = _.isArray(callback) ? callback : [callback];
        newTree.defaults.callbacks[event] = newTree.defaults.callbacks[event].concat(cb);
        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };

    // Unregisters callbacks for tree events. Currently, `event` can
    // only be 'afterUpdate', and `callback` can either be a single
    // function or an array of functions. This also generates a new
    // tree.
    Tree.prototype.off = function(event, callback) {
        var newTree, cb;
        newTree = Tree.clone(this);
        cb = _.isArray(callback) ? callback : [callback];
        newTree.defaults.callbacks[event] = _.partial(_.without, newTree.defaults.callbacks[event]).apply(_, cb);
        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };


    // Adds mixin properties and functions to the tree. These mixins
    // are preserved across all tree operations. Be careful, you can
    // overwrite core _tree methods with mixins. No effort is made to
    // protect you there. Namespacing your mixins is probably good
    // practice.
    Tree.prototype.mixin = function(mixin) {
        var newTree;
        newTree = Tree.clone(this);
        if (!_.contains(newTree.defaults.mixins, mixin)) {
            newTree.defaults.mixins.push(mixin);
        }
        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };




    Tree.prototype.batch = function() {
        var batchTree;
        batchTree = Tree.clone(this);
        batchTree.__batch++;
        __preFinalizeTree(batchTree);
        return batchTree;
    };

    Tree.prototype.isBatch = function() {
        return this.__batch > 0;
    };

    Tree.prototype.end = function() {
        if (!this.isBatch()) {
            throw 'Called `tree.end` when not in batch mode.';
        }

        this.__batch--;
        if (!this.isBatch()) {
            __finalizeMutableTreeClone(this);
        }
        return this;
    };

    // # Node
    


    // This defines the `Node` constructor, and much like `Tree`, the
    // resulting object is mutable until just before being exposed to
    // the external world.
    Node = function (tree, data) {
        try {
            Object.defineProperties(this, {
                '__tree': {
                    value: tree,
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                '__data': {
                    value: data,
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                '__children': {
                    value: [],
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                '__id': {
                    value: tree.__nextNodeId,
                    writable: true,
                    enumerable: false,
                    configurable: false
                }
            });
        } catch (e) {
            this.__tree = tree;
            this.__data = undefined;
            this.__children = [];
            this.__id = tree.__nextNodeId;
        }
        tree.__nextNodeId = tree.__nextNodeId + 1;
    };
    _tree.Node = Node;


    // A static copy constructor for `Node` objects, much like
    // `Tree.clone`, but recursive. All child nodes are cloned as
    // well.
    Node.clone = function (newTree, node, differentId) {
        var newNode = new node.constructor(newTree);
        newNode.__data = node.__data;

        newNode.__children = _.map(node.children(), function(c) { return node.constructor.clone(newTree, c, differentId); });
        _.each(newNode.__children, function(c) {c.__parent = newNode;});

        if (!differentId) {
            newNode.__id = node.__id;
            newTree.__nextNodeId--;
        }

        return newNode;
    };

    // effectively subclass any subclass of Node. Modified from
    // [Backbone.js](http://backbonejs.org/docs/backbone.html#section-206),
    // under the [MIT License](LICENSE.backbone)
    extend = function(protoProps, staticProps) {
        var parent, child, Surrogate;
        parent = this;

        // The constructor function for the new subclass is either
        // defined by you (the “constructor” property in your extend
        // definition), or defaulted by us to simply call the parent’s
        // constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }
        
        // Add static properties to the constructor function, if
        //supplied.
        _.extend(child, parent, staticProps);
        
        // Set the prototype chain to inherit from parent, without
        // calling parent‘s constructor function.
        Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();
        
        // Add prototype properties (instance properties) to the
        // subclass, if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }
        
        // Set a convenience property in case the parent’s prototype
        // is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    Tree.extend = Node.extend = extend;





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

        if (this.tree().isBatch()) {
            this.__data = Obj;
            return this.tree();
        }

        newTree = Tree.clone(this.tree());
        newNode = newTree.findNode(this);
        newNode.__data = Obj;

        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __callback(newTree, 'beforeFreeze.data', newNode);
        __finalizeMutableTreeClone(newTree);
        return newTree;
    };



    // A simple getter for node children.
    Node.prototype.children = function () {
        return this.__children;
    };

    // A simple getter for the node's parent. Returns `undefined` if
    // no parent is set.
    Node.prototype.parent = function () {
        return this.__parent;
    };

    // A simple getter for the node's tree. `_tree` is intended for
    // internal use. Presumably, client code will know which tree a
    // node is in, but it may be useful to client code.
    Node.prototype.tree = function () {
        return this.__tree;
    };

    // A simple getter for the node's id. `__id` is intended for
    // internal use, but may also be valuable to client code.
    Node.prototype.id = function () {
        return this.__id;
    };


    // To add a child node, an object representing the node data is
    // parsed as if it were a new tree and then appended to the end of
    // the children array. Remember that a newly-cloned tree is
    // returned, *not* a `Node`.
    Node.prototype.parseAndAddChild = function (childObj, inflateMethod) {
        inflateMethod = inflateMethod || this.__tree.defaults.inflate;
        var childTree, newTree, newNode, tree;
        tree = this.tree();
        childTree = new tree.constructor(tree.defaults, childObj, inflateMethod, tree.__nextNodeId);

        if (tree.isBatch()) {
            this.__children.push(childTree.root());
            tree.__nextNodeId = childTree.__nextNodeId;
            __preFinalizeTree(tree);
            return tree;
        }

        newTree = Tree.clone(tree);
        newNode = newTree.findNode(this);
        newNode.__children.push(childTree.root());
        newTree.__nextNodeId = childTree.__nextNodeId;

        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __callback(newTree, 'beforeFreeze.parseAndAddChild', childTree.root());
        __finalizeMutableTreeClone(newTree);

        return newTree;
    };



    Node.prototype.addChildNode = function(node) {
        var newTree, newParentNode, nodeClone;

        if (this.tree().isBatch()) {
            nodeClone = node.constructor.clone(this.tree(), node, true);
            this.__children.push(nodeClone);
            __preFinalizeTree(this.tree());
            return this.tree();
        }

        newTree = Tree.clone(this.tree());
        newParentNode = newTree.findNode(this);

        newTree.__nextNodeId = this.tree().__nextNodeId;
        nodeClone = node.constructor.clone(newTree, node, true);
        newParentNode.__children.push(nodeClone);

        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __callback(newTree, 'beforeFreeze.addChildNode', nodeClone);
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


    Node.prototype.remove = function () {
        if (this === this.tree().root()) {
            throw new Error('cannot delete the root node');
        }

        var newTree, newNode, parNode;

        if (this.tree().isBatch()) {
            parNode = this.parent();
            parNode.__children = _.without(parNode.__children, this);
            __preFinalizeTree(this.tree());
            return parNode.tree();
        }


        newTree = Tree.clone(this.__tree);
        newNode = newTree.findNode(this);
        parNode = newTree.findNode(this.__parent);

        parNode.__children = _.without(parNode.__children, newNode);
        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __callback(newTree, 'beforeFreeze.remove', parNode);
        __finalizeMutableTreeClone(newTree);

        return newTree;
    };


    // removes all immediate children of this node specified in
    // `kidsToRemove`. 
    Node.prototype.removeAll = function (kidsToRemove) {
        var tree, self, newTree, newNode, newKids;

        tree = this.tree();
        self = this;
        if (this.tree().isBatch()) {
            newKids = _.map(kidsToRemove, function(k) {
                return _.find(self.children(), function(c) {
                    return c.equals(k);
                });
            });
            this.__children = _.difference(this.__children, newKids);
            __preFinalizeTree(this.tree());
            return this.tree();
        }

        newTree = Tree.clone(this.__tree);
        newNode = newTree.findNode(this);
        // it would be great if we could do away with the findNode
        newKids = _.map(kidsToRemove, function(k) {
            return _.find(newNode.children(), function(c) {
                return c.equals(k);
            });
        });

        newNode.__children = _.difference(newNode.__children, newKids);
        __preFinalizeTree(newTree);
        __callback(newTree, 'beforeFreeze');
        __callback(newTree, 'beforeFreeze.removeAll', newNode);
        __finalizeMutableTreeClone(newTree);

        return newTree;
    };



    // Finally, we setup some library-wide defaults.
    __defaults =  {
        'treeClass': _tree.Tree,
        'inflate': _tree.inflate.byKey(),
        'walk': Tree.prototype.walk.dfpre,
        'deleteRecursive': true,
        'callbacks': {'afterUpdate': [],
                      'beforeFreeze': [],
                      'beforeFreeze.data': [],
                      'beforeFreeze.parseAndAddChild': [],
                      'beforeFreeze.addChildNode': [],
                      'beforeFreeze.remove': []
                     },
        'mixins': []
    };

    // And we're done.
    return _tree;
}));
