/*global define */
/*jslint nomen: true, todo: true */

// from https://github.com/umdjs/umd/blob/master/returnExports.js
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

    /**
     * The exported object, and the object mixed into _tree instances
     * 
     * This object provides the API for tree behaviors. This is the
     * header for it, essentially.
     */
    _tree = {
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

    /**
     * The public face of tree Nodes.
     *
     * This provides the API for individual nodes. This is the header
     * for it, essentially.
     */
    _node = {
        'delete': null,
        'addChild': null,
        'data': null,
        'children': null
    };


    //--------------------------------------------------------------------------------
    // INTERNAL
    //--------------------------------------------------------------------------------


    // TODO: eliminate hidden state
    function __inflate(Object, Method, Parent) {
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


    Tree = function (Defaults, Obj, Method) {
        this.defaults = Defaults;
        this.__root = __inflate(Obj, Method);
        Object.freeze(this);
    };
    _.chain(_tree)
        .omit(['inflate'])
        .each(function (fn, key) {
            // console.log(fn, key);
            Tree.prototype[key] = function () {
                return _.partial(fn, this).apply(this, _.toArray(arguments));
            };
        });



    Node = function () {
        // TODO: implement constructor
    };
    _.chain(_node)
    // .omit(['inflate'])
        .each(function (fn, key) {
            // console.log(fn, key);
            Node.prototype[key] = function () {
                // console.log(key, fn, this,  _.toArray(arguments));
                return _.partial(fn, this).apply(this, _.toArray(arguments));
            };
        });




    __defaults =  {
        'inflate': function (Obj) { return (_tree.inflate.byKey()).call(this, Obj); },
        'deflate': function (Obj) { return (_tree.deflate.toKey()).call(this, Obj); },
        'walk': function (tree) { return _tree.walk.dfpre(tree); },
        'deleteRecursive': true
    };



    //--------------------------------------------------------------------------------
    // _TREE IMPLEMENTATION
    //--------------------------------------------------------------------------------

    _tree.inflate = function (Object, Method, Defaults) {
        Defaults = _.defaults(_.clone(Defaults || {}), __defaults);
        Method = Method || Defaults.inflate;

        var tree = new Tree(Defaults, Object, Method);
        return tree;
    };

    // TODO: change name here and in README
    /**
     * Inflation method for parsing wonky "sibling=children" arrays
     *
     * Parses stuff like:
     *   ['parent', ['child1', 'child2', ['child3']]]
     *
     * Into a tree that roughly resembles:
     *   parent
     *       child1
     *       child2
     *           child3
     */
    _tree.inflate.byAdjacencyList = function (Obj) {
        this.emit(_.first(Obj));
        var sibs = _.rest(Obj);
        if (_.isArray(_.first(sibs))) {
            this.children(_.first(sibs));
            sibs = _.rest(sibs);
        }
        this.siblings(sibs);
    };


    /**
     * Inflation method for parsing objects with child arrays
     *
     * Parses stuff like:
     *   {'name': parent, 'children': [{'name': 'child1'}, {'name': 'child2', 'children': [{'name': 'child3'}]}]}
     *
     * Into a tree that roughly resembles:
     *   parent
     *       child1
     *       child2
     *           child3
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
     * Inflation method for parsing objects where only the leaves have
     * data.
     *
     * Parses stuff like:
     *   [[child1, [child3]]]
     *
     * Into a tree that roughly resembles:
     *   <omitted>
     *       child1
     *       <omitted>
     *           child3
     */
    _tree.inflate.onlyLeavesList = function (Obj) {
        if (_.isArray(_.first(Obj))) {
            this.children(_.first(Obj));
        } else {
            this.emit(_.first(Obj));
        }
        this.siblings(_.rest(Obj));
    };



    _tree.root = function (Tree) {
        return Tree.__root;
    };


    // Getter and Setter for node data
    _node.data = function (Node, Obj) {
        // console.log('_node.data', arguments);
        if (!Obj) {
            return Node.__data;
        }
        // TODO: rebuild the whole damned thing!
        Node.__data = Obj;
        return Node;
    };

    // Getter for node children
    _node.children = function (Node) {
        return Node.__children || [];
    };

    _node.addChild = function (Node, Child) {
        // TODO: rebuild the whole damned thing!
        Node.__children = Node.__children || [];
        Node.__children.append(Child);
        return Node;
    };

    return _tree;
}));