# _tree

> "Computing's core challenge is how not to make a mess of it. ... All
> unmastered complexity is of our own making; there is no one else to
> blame and so we had better learn how not to introduce the complexity
> in the first place."
> 
> -- <cite>[Edsger W. Dijkstra][EWD1243]</cite>

This library provides an immutable tree model (data structure)
implementation and a pluggable tree behavior for hierarchical data. It
maintains zero internal state, does not alter your data, and does not
trample on the global scope (unless you tell it to).

`_tree` supports AMD (RequireJs), Node, and global-script loading
scenarios.

## Example

```javascript
'use strict';
var patronage, familyTree, charlie, chuckFamilyTree, printLineage;

patronage = {'name': 'Jake', 'children': [
    {'name': 'Jake Jr.'},
    {'name': 'T.V.'},
    {'name': 'Charlie'},
    {'name': 'Viola'}
]};
familyTree = _tree.inflate(patronage);

// add a child, and save the new tree.
familyTree = familyTree.root().parseAndAddChild({'name': 'Kim Kil Wam'});

// Prints the tree with everyone's name and their father's name
printLineage = function(node) {
    var origin = ', origin unknown';
    if (node.parent())
        origin = 'is the child of ' + node.parent().data().name;
    console.log(node.data().name, origin);
};

familyTree.walk(printLineage);

// Charlie goes by Chuck now
charlie = familyTree.findNodeByData({name: 'Charlie'});
chuckFamilyTree = charlie.data({'name': 'Chuck'});

// Make sure Chuck's name is changed in the new tree ...
chuckFamilyTree.walk(printLineage);

// ... and *not* in the old tree
familyTree.walk(printLineage);

```

To get a feel for the library, check out the
[tests](https://github.com/drfloob/_tree/tree/master/test). Also, the
`docs/` folder contains the annotated source code. Website coming
soon!


## Quality Metrics



**Tests**: All tests pass for:

 * Chrome: 26 - current
 * Firefox: 10 - current
 * Internet Explorer: 9<sup>[note](#note-strict-mode)</sup> - current
 * Safari 6
 * iPhone 5, 4S (6.0)
 * Kindle Fire 2
 * iPad mini
 * Samsung Galaxy Nexus

The following environments do not support immutability, whether via
`Object.freeze` or `Object.defineProperty`. `_tree` is fully usable,
but object immutability tests fail:

 * Internet Explorer 8
 * Opera: 12.*
 * Safari: 5.0.6, 5.1
 * PhantomJS
 * iPad: 2, 3rd
 * iPhone 4S (5.1)

IE7 and below are currently untested and unsupported. 

You can run tests at the command line via PhantonJS with: `grunt test`

<a name="note-strict-mode"></a> 

Keep in mind that IE9 doesn't support strict mode. Trying to alter an
immutable object will fail silently. Altering a `_tree` in a modern
browser under `strict mode` throws an error.



**Performance**: On an Intel Core 2 CPU T5600 @ 1.83GHz, 3GB Memory,
  using Chrome 30 on Debian Wheezy:

 * 1024 node trees can be inflated at ~15/sec
 * 30 node trees can be inflated at ~600/sec
 * 11 node trees can be inflated at ~1,500/sec
 * empty trees can be created at ~12,000/sec

You can run the benchmarks with `grunt benchmark:all`



**Coverage**: Test coverage is currently only measured for
PhantomJS. Branches for Node and global script definitions aren't
executed, nor are the `Object.defineProperty` fallbacks.

Current PhantomJS coverage is at 94% statements, 93% branches, 98%
functions, and 94% lines.

Coverage is analyzed by running `grunt cover`. You can view the
coverage report locally at `coverage/index.html`.




## API

The `_tree` library exposes the following functions:

 * `create`: creates an empty `Tree`
 * `inflate`: parses your data into a `Tree`
 * `fromNode`: creates a new tree using a `Node` from another tree

All of the `_tree` methods return a `Tree` object, which has the
following methods: 

 * `root`: returns the root `Node`
 * `walk`: traverses the `Tree`, executing a callback for each node in
   the order you specify
 * `equals`: determines if two `Tree`s are related clones.
 * `findNode`: finds the equivalent `Node` in a tree (works across
   clones)
 * `findNodeByData`: finds the first `Node` containing matching data
 * `containsNode`: returns `boolean` whether the `Node` exists in the
   `Tree`
 * `containsData`: returns `boolean` whether the data exists in any
   `Node` in the `Tree`
 * `moveNode`: move a `Node` and its descendants from one point in the
   tree to another.
 
The `Tree` consists of `Node`s, which have the following API:
 
 * `data`: gets or sets the data on a node. Setting data generates a new `Tree`.
 * `children`: returns the child `Node`s of a node
 * `parent`: returns the `Node`'s parent
 * `tree`: returns the `Node`'s tree
 * `id`: returns the tree-unique internal id of the `Node`
 * `parseAndAddChild`: parses an object (much like inflate) and adds
   it as a child of the `Node`. Returns a new `Tree`.
 * `addChildNode`: adds a `Node` as a child. Errors are thrown if the
   `Node` already exists in the tree. Returns a new `Tree`.
 * `equals`: returns `boolean` that representse the clone-agnostic
   equality of nodes.
 * `remove`: removes a `Node` from the tree, returning a new `Tree`.



## Building

Requirements: `Node` and `grunt`

```
git clone https://github.com/drfloob/_tree.git
cd _tree
npm install
grunt --force
```



## Development Stuff

`_tree` does not maintain any internal state, which has a number of
benefits:

 * all state can be managed directly by your application
 * all functions are [referentially transparent][REFTRAN]
 * all operations are idempotent
 * tests can be implemented easily
 * the library should perform identically in parallel environments

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





## Contributing

Please do.



[EWD1243]: http://www.cs.utexas.edu/users/EWD/transcriptions/EWD12xx/EWD1243.html
[REFTRAN]: https://en.wikipedia.org/wiki/Referential_transparency_(computer_science)
[_]: http://underscorejs.org/
[docco]: http://jashkenas.github.io/docco/
