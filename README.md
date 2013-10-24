# A tree data structure library for Javascript

## Purpose:

> "Computing's core challenge is how not to make a mess of it."
> *--Edsger W. Dijkstra, [EWD1243][]*

This library provides a standalone tree model implementation as well
as a pluggable tree behavior for your own data structures. It does
this without maintaining any internal state. This design choice has a
number of benefits:

 * all state can be managed directly by *your* application
 * all functions are [referentially transparent][REFTRAN]
 * all operations are idempotent.
 * tests can be implemented simply
 * the library should perform identically in parallel environments


## Core development principles:

 * Referential transparency
 * Immutable data structures
 * Zero internal state
 * Zero side effects

## Secondary design goals:

 * All logical operations have pluggable behaviors
 * All operations have sane defaults
 * Performance isn't impractically bad
 * AMD, Node, and global-script compatible


--------------------------------------------------------------------------------

## Dependencies

[Underscore.js][_]

## Additional Development Dependencies

[docco][]

--------------------------------------------------------------------------------

## Building

TODO

--------------------------------------------------------------------------------

## Simple Usage Example

```
var Patronage, FamilyTree;

Patronage = {'name': 'Jake', 'kids': [{'name': 'Jake Jr.'}, {'name': 'T.V.'}, {'name': 'Charlie'}, {'name': 'Viola'}]};
FamilyTree = _tree.inflate(Patronage);

// FamilyTree is immutable. You need to capture the return value to //
see your changes. If nothing holds a reference to the old tree, it
will be garbage collected.
FamilyTree = FamilyTree.addChild(FamilyTree.root(), {'name': 'Kim Kil Wam'});

// Log the tree, with everyone's name and their father's name
FamilyTree.walk(function(node) {
    var origin = 'origin unknown';
    if (_.has(node), 'parent'))
        origin = 'is the child of ' + node.parent.data.name;
    console.log(node.data.name, origin);
});

// Throws an error. Recursive deletion needs to be made explicit.
FamilyTree = FamilyTree.delete(FamilyTree.root())
// This is the explicit version.
FamilyTree = FamilyTree.delete(FamilyTree.root(), true)
// You can also use the `_tree` methods directly.
FamilyTree = _tree.delete(FamilyTree, _tree.root(FamilyTree), true);


```



--------------------------------------------------------------------------------

## Defaults

Without defining your own defaults or callbacks for the `inflate`,
`deflate`, `walk`, and `delete` methods, the following methods are
used by default:


```
{
    'inflate': _tree.inflate.byKey()
    , 'deflate': _tree.deflate.toKey()
    , 'walk': _tree.walk.dfpre
    , 'deleteRecursive': false
}
```

--------------------------------------------------------------------------------

## API for Node Objects

### `_tree.Node.parent()`
### `_tree.Node.children()`
### `_tree.Node.data()`
### `_tree.Node.delete()`
### `_tree.Node.addChild()`
### `_tree.Node.addChildTree()`


--------------------------------------------------------------------------------

## API for a _Tree Object


## `_tree.inflate(Object [, Method [, Defaults]])`

Parses an arbitrary object into a `_tree` data structure. If you
supply a Defaults object -- format shown above -- they will supply the
default methods in all tree functions for this tree.

If you need more control over the parsing of your object, you can
supply a custom inflate method that accepts your object and returns a
`_tree` data structure.

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


















[EWD1243]: http://www.cs.utexas.edu/users/EWD/transcriptions/EWD12xx/EWD1243.html
[REFTRAN]: https://en.wikipedia.org/wiki/Referential_transparency_(computer_science)
[_]: http://underscorejs.org/
[docco]: http://jashkenas.github.io/docco/
