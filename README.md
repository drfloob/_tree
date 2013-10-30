# _tree

A tree data structure library for Javascript.

> "Computing's core challenge is how not to make a mess of it."
> *--Edsger W. Dijkstra, [EWD1243][]*

This library provides a tree model implementation and a pluggable tree
behavior for your data. It maintains *zero* internal state, provides
only immutable objects, and does not alter your data or trample on the
global scope.

`_tree` supports AMD (RequireJs), Node, and global-script loading
scenarios.

## Simple Usage Example

To get a feel for the library, also check out the
[tests](https://github.com/drfloob/_tree/tree/master/test) and read
the
[annotated source](https://rawgithub.com/drfloob/_tree/master/docs/_tree.html)
documentation.


```javascript
'use strict';
var Patronage, FamilyTree;

Patronage = {'name': 'Jake', 'kids': [{'name': 'Jake Jr.'}, {'name': 'T.V.'}, {'name': 'Charlie'}, {'name': 'Viola'}]};
FamilyTree = _tree.inflate(Patronage);

// FamilyTree is immutable. You need to capture the return value to
// see your changes. If nothing holds a reference to the old tree, it
// will be garbage collected.
FamilyTree = FamilyTree.addChild(FamilyTree.root(), {'name': 'Kim Kil Wam'});

// Log the tree, with everyone's name and their father's name
FamilyTree.walk(function(node) {
    var origin = 'origin unknown';
    if (_.has(node), 'parent'))
        origin = 'is the child of ' + node.parent.data.name;
    console.log(node.data.name, origin);
});

// Delete a child node
FamilyTree = FamilyTree.findNodeByData({name: 'Charlie'}).delete();

FamilyTree.findNodeByData({name: 'Charlie'}) === false; // true

```

## Quality Metrics


On an Intel Core 2 CPU T5600 @ 1.83GHz, 3GB ram, running Debian Wheezy:

 * 1024 node trees can be inflated at ~15/sec
 * 30 node trees can be inflated at ~600/sec
 * 11 nodes trees can be inflated at ~1,500/sec
 * empty trees can be created at ~12,000/sec
 
Test coverage is at 98% functions, 94% for statements, 94% lines, and 87% branches.

To execute various tests yourself, see `Gruntfile.js`, and execute:

```bash
grunt test
grunt benchmark:all
grunt cover
```

## API

The `_tree` library exposes the following functions:

 * `create`: creates an empty `Tree`
 * `inflate`: parses your data into a `Tree`
 * `fromNode`: creates a new tree from the given `Node`

All of the `_tree` methods return a `Tree` object, which has the
following methods: 

 * `root`: returns the root `Node`
 * `findNode`: finds the equivalent `Node` in a tree (works across
   clones)
 * `walk`: traverses the `Tree`, executing a callback for each node in
   the order you specify
 * `equals`: determines if two `Tree`s are related clones.
 * `containsNode`: returns `boolean` whether the `Node` exists in the `Tree`
 * `containsData`: returns `boolean` whether the data exists in any `Node` in the `Tree`
 * `moveNode`: move a `Node` and its descendants from one point in the tree to another.
 
The `Tree` consists of `Node`s, which have the following API:
 
 * `data`: gets or sets the data on a node, generating a new `Tree`
 * `children`: returns the child `Node`s of a node
 * `parent`: returns the `Node`'s parent
 * `tree`: returns the `Node`'s tree
 * `id`: get the tree-unique internal id of the `Node`
 * `parseAndAddChild`: parses an object (like inflate) and adds it as
   a child of the `Node`. Returns a new `Tree`.
 * `addChildNode`: adds a `Node` as a child. Errors are thrown if the
   `Node` already exists in the tree. Returns a new `Tree`.
 * `equals`: returns `boolean` determining clone-agnostic equality of
   nodes.
 * `delete`: deletes a `Node` from the tree, returning a new `Tree`.



## Development Principles

`_tree` does not maintain any internal state, which has a number of
benefits:

 * all state can be managed directly by *your* application
 * all functions are [referentially transparent][REFTRAN]
 * all operations are idempotent
 * tests can be implemented easily
 * the library should perform identically in parallel environments
   (providing you manage your own shared data appropriately)

It is also unobtrusive, in that `_tree` does not alter your input
objects in any way, or trample on the global scope by default.

### Core development principles:

 * Referential transparency
 * Immutable data structures
 * Zero internal state
 * Zero side effects in the public API

### Secondary design goals:

 * All logical operations have pluggable behaviors
 * All operations have sane defaults
 * Performance isn't impractically bad
 * AMD, Node, and global-script compatible




## Building

Requirements: `Node` and `grunt`

```
git clone https://github.com/drfloob/_tree.git
cd _tree
npm install
grunt --force
```






## Contributing

Please do.



[EWD1243]: http://www.cs.utexas.edu/users/EWD/transcriptions/EWD12xx/EWD1243.html
[REFTRAN]: https://en.wikipedia.org/wiki/Referential_transparency_(computer_science)
[_]: http://underscorejs.org/
[docco]: http://jashkenas.github.io/docco/
