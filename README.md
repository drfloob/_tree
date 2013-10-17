A functional tree data structure library.

Core principles:

 * Referential transparency
 * Zero state
 * Immutable data structures

Secondary design goals:

 * Object parsing is pluggable
 * Tree walking logic is pluggable
 * Sane defaults for all actions
 * AMD compatible

--------------------------------------------------------------------------------

## Dependencies

Underscore.js

--------------------------------------------------------------------------------

## Defaults

```
{
    'inflate': _tree.inflate.byKey()
	, 'deflate': _tree.deflate.toKey()
	, 'walk': _tree.walk.dfpre
	, 'deleteRecursive': true
}
```

--------------------------------------------------------------------------------

## Simple Example

```
var Lineage = {'name': 'Jake', 'kids': [{'name': 'Jake Jr.'}, {'name': 'T.V.'}, {'name': 'Charlie'}, {'name': 'Viola'}]}
var tree = _tree.inflate(Lineage);
tree = _tree.addChild(tree, _tree.root(tree), {'name': 'Kim Kil Wam'});
_tree.walk(tree, function(node) {
    if (_.has(node), 'parent') {
		console.log(node.data.name, 'is the child of', node.parent.data.name);
	} else {
		console.log(node.data.name, 'origin unknown');
	}
});
```



--------------------------------------------------------------------------------

## API for a _Tree.Node Object

### `_tree.Node.parent`
### `_tree.Node.children`


--------------------------------------------------------------------------------

## API for a _Tree Object


## `_tree.inflate(Object [, Defaults [, Method]])`

Parses an arbitrary object into a _tree data structure. If you supply
Defaults, they will be used in all subsequent tree function for this
tree. Optionally, you can also include a custom inflate method that
accepts your object and returns a _tree data structure.

Builtin inflate methods:

 * `_tree.inflate.byKey([Key])`: returns a function that finds a child
   array under the `Key` attribute of the current Object, and parses
   them in turn. The default `Key` is `"children"`
 * `_tree.inflate.byAdjacencyList`: is a function that emits the head of
   the list, inflates the second entry as children if it's an array,
   and otherwise inflates the rest as siblings.
 * `_tree.inflate.onlyLeavesList`: is a function that creates "null"
   nodes for non-leaf nodes, treating each nested list as a group
   under a "null" parent.

If you define your own inflate method, when it is called, `this` will
be bound to:

#### `this.emit(Data)`

Assigns data to the current _tree.Node

#### `this.children([Obj]) -> tree`

Inflates a list of objects in order as children of the current node.

#### `this.siblings([Obj]) -> _tree`

Inflates a list of objects in order as siblings of the current node.


### Examples:

#### `_tree.inflate.byAdjacencyList`
```
var MyObject = ['hi', ['emacs']]
var MyTree = _tree.inflate(MyObject, function(Obj) {
    emit(_.first(Obj));
	var sibs = _.rest(Obj);
	if (_.isArray(_.first(sibs))) {
		this.children(_.first(sibs));
		sibs = _.rest(sibs);
	}
	this.siblings(sibs);
})

```
OR
```
var MyObject = ['hi', ['emacs']]
var MyTree = _tree.inflate(MyObject, _tree.inflate.byAdjacencyList);
```

#### `_tree.inflate.byKey([Key])`
```
var MyObject = {'text': 'hi', 'kids': ['emacs', {'text': 'heterogeneous child', 'children': []}}]}
var MyTree = _tree.inflate(MyObject, function(Obj) {
    emit(Obj);
	if (_.has(Obj, 'children')) {
		this.children(Obj.children);
    }
})

```
OR
```
var MyObject = {'text': 'hi', 'kids': ['emacs', {'text': 'heterogeneous child', 'children': []}}]}
var MyTree = _tree.inflate(MyObject, _tree.inflate.byKey('kids'));
```


#### `_tree.inflate.onlyLeavesList`
```
var MyObject = [['hi', ['emacs']]]
var MyTree = _tree.inflate(MyObject, function(Obj) {
	if (_.isArray(_.first(Obj))) {
		this.children(_.first(Obj));
	} else {
		this.emit(_.first(Obj))
	}
	this.siblings(_.rest(Obj));
})

```
OR
```
var MyObject = [['hi', ['emacs']]]
var MyTree = _tree.inflate(MyObject, _tree.inflate.onlyLeavesList)
```




## `_tree.deflate(_tree [, Method])`

Serializes a tree into a form of your choosing. You can inflate a tree
in from format and deflate to another quick easily.

Optionally, you can include a custom deflate method that accepts a
tree and returns a serialized object of your design.

Builtin deflate methods:

 * `_tree.deflate.toAdjacencyList`
 * `_tree.deflate.toKey([Key])`: key defaults to `'children'`
 * `_tree.deflate.toOnlyLeavesList`




## `_tree.walk(_tree, Function [, Method])`

Walks a tree, executing a callback function on every node
encountered. The default walk method is a depth first, pre-order
traversal.

Optionally, you can include a custom walk method that accepts a tree
and defines (given methods attached to `this`) a partial ordering of
nodes to walk next.

Builtin walk methods:

 * `_tree.walk.dfpre`: depth first pre-order
 * `_tree.walk.dfpost`: depth first post-order
 * `_tree.walk.bfpre`: breadth first pre-order
 * `_tree.walk.bfpost`: breadth first post-order

If you define your own walk method, when it is called, `this` will
be bound to:

#### `this.queue([_tree.Node])`

Visit these nodes next, as in a depth first traversal.

#### `this.push([_tree.Node])`

Visit these nodes last, as in a breadth first traversal.

#### `this.insert([_tree.Node], Function)`

Inserts the Nodes in arbitrary positions in the list of Nodes to
visit, according to the provided function. The function receives an
immutable copy of the list of Nodes to visit and returns a new list of
nodes to visit. `this` is bound to the current node being visited.


### Examples:

#### `_tree.walk.dfpre`
```
var MyTree = _tree.inflate(['hi', ['emacs']], _tree.inflate.byAdjacencyList)
var MyVisitor = function(node) {console.log(node.data)}
_tree.walk(MyTree, MyVisitor, function(NodeList) {
    return this.children.concat(NodeList);
})
```
OR
```
var MyTree = _tree.inflate(['hi', ['emacs']], _tree.inflate.byAdjacencyList)
var MyVisitor = function(node) {console.log(node.data)}
_tree.walk(MyTree, MyVisitor, _tree.walk.dfpre)
```


#### `_tree.walk.dfpost`
```
var MyTree = _tree.inflate(['hi', ['emacs']], _tree.inflate.byAdjacencyList)
var MyVisitor = function(node) {console.log(node.data)}
_tree.walk(MyTree, MyVisitor, function(NodeList) {
    return NodeList.concat(this.children);
})
```
OR
```
var MyTree = _tree.inflate(['hi', ['emacs']], _tree.inflate.byAdjacencyList)
var MyVisitor = function(node) {console.log(node.data)}
_tree.walk(MyTree, MyVisitor, _tree.walk.dfpost)
```




## `_tree.root(_tree)`


## `_tree.add(_tree, Value [, IsGoodHereFunction [, WalkFunction]])`

Inserts a node into the tree. The location of the new node is
determined by the `IsGoodHereFunction` executed for each on a walk of
the tree. When the `IsGoodHereFunction` returns a position, the walk
is finished. An optional walk function can be supplied.

`IsGoodHereFunction` must return one of:

 * `false`: keep walking
 * `'before'`: insert as sibling before the current node
 * `'after'`: insert as sibling after the current node
 * `'child'`: insert as the last child of the current node
 
 TODO: create builtin balanced binary tree method


## `_tree.addChild(_tree, ParentNode, Value)`

Inserts a new node as the last child of `ParentNode` with value `Value`.


## `_tree.delete(_tree, Node [, Recursive])`

Deletes a node from a tree. If Recursive is false, an error will be
thrown if the node has any children.

--------------------------------------------------------------------------------


















