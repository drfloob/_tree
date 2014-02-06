[![Build Status](https://travis-ci.org/drfloob/_tree.png?branch=master)](https://travis-ci.org/drfloob/_tree)

**Table of Contents**

 * [Intro](#_tree)
 * [Example](#example)
 * [Quality Metrics](#quality-metrics)
 * [API](#api)
 * [Building](#building)
 * [Development Stuff](#development-stuff)
 * [Contributing](#contributing)

**Additional Links**

 * [Homepage][home]
 * [Annotated source code][annsrc]
 * [Live in-browser tests][tests]



# _tree

This library provides an immutable tree model (data structure)
implementation and a pluggable tree behavior for hierarchical data. It
maintains zero internal state, does not alter your data, and does not
trample on the global scope (unless you tell it to).

`_tree` supports AMD (RequireJs), Node, and global-script loading
scenarios.


## Example

```javascript
'use strict';
var patronage, familyTree, charlie, chuckFamilyTree, printLineage, logger;

patronage = {'name': 'Jake', 'children': [
    {'name': 'Jake Jr.'},
    {'name': 'T.V.'},
    {'name': 'Charlie'},
    {'name': 'Viola'}
]};
familyTree = _tree.inflate(patronage);

// log all familyTree updates
logger = function(tree) {
    console.log('tree update detected', tree);
};
familyTree = familyTree.on('afterUpdate', logger);
// logs 'tree update detected [ ... ]'

// add a child, and save the new tree.
familyTree = familyTree.root().parseAndAddChild({'name': 'Kim Kil Wam'});
// logs 'tree update detected [ ... ]'

// Prints the tree with everyone's name and their father's name
printLineage = function(node) {
    var origin = ', origin unknown';
    if (node.parent()) {
        origin = 'is the child of ' + node.parent().data().name;
    }
    console.log(node.data().name, origin);
};

familyTree.walk(printLineage);

// Charlie goes by Chuck now
charlie = familyTree.findNodeByData({name: 'Charlie'});
chuckFamilyTree = charlie.data({'name': 'Chuck'});
// logs 'tree update detected [ ... ]'

// Make sure Chuck's name is changed in the new tree ...
chuckFamilyTree.walk(printLineage);

// ... and *not* in the old tree
familyTree.walk(printLineage);


// before going out of scope, prevent memory leaks by unbinding the logger
familyTree.off('afterUpdate', logger);
chuckFamilyTree.off('afterUpdate', logger); 
```

To get a feel for the library, check out the
[tests](https://github.com/drfloob/_tree/tree/master/test/spec/) and
[**run them in your browser**](http://tree.drfloob.com/_SpecRunner.html). The
[annotated source code](http://tree.drfloob.com/docs/_tree.html) is
also available.


## Quality Metrics



**Tests**: All tests pass for:

 * Chrome: >= 12
 * Firefox: >= 4
 * NodeJS >= 0.8
 * Internet Explorer: >= 9<sup>[note](#note-strict-mode)</sup>
 * Safari 6
 * iPhone 5, 4S (6.0)
 * Kindle Fire 2
 * iPad mini
 * Samsung Galaxy Nexus
 * Epiphany: >= 3.6.1

The following environments do not support immutability, whether via
`Object.freeze` or `Object.defineProperty`. `_tree` is fully usable,
but object immutability tests are skipped, and mutability is asserted
instead (to make the environment's behavior clear).

 * Opera: 11.*, 12.*
 * Safari: 5.0.6, 5.1
 * PhantomJS
 * iPad: 2, 3rd
 * iPhone 4S (5.1)
 * Rekonq >= 0.9.2

IE7 and below are currently untested and unsupported. The test
framework doesn't currently support IE8.

You can run tests at the command line via PhantonJS with `grunt
phantom_test`, or via Node with `grunt test`

<a name="note-strict-mode"></a> 

Keep in mind that IE9 doesn't support strict mode. Trying to alter an
immutable object will fail silently. Altering a `_tree` in a modern
browser under `strict mode` throws an error.



**Performance**: On an Intel Core 2 CPU T5600 @ 1.83GHz, 3GB Memory,
  Debian wheezy:

```
$ grunt benchmark:all
Running "benchmark:all" (benchmark) task

Running suite 1024 Deep - vs - 1024 Wide [benchmark/1024deep_vs_1024wide.js]...
>> 1024 wide x 9.80 ops/sec ±6.74% (29 runs sampled)
>> 1024 deep x 8.11 ops/sec ±7.41% (25 runs sampled)
Fastest test is 1024 wide at 1.21x faster than 1024 deep

Running suite 30 Deep - vs - 30 Wide [benchmark/30deep_vs_30wide.js]...
>> 30 wide x 363 ops/sec ±2.04% (90 runs sampled)
>> 30 deep x 363 ops/sec ±2.37% (90 runs sampled)
Fastest tests are 30 wide,30 deep

Running suite Big list inflations [benchmark/adjList_inflate_big.js]...
>> 11 kids x 925 ops/sec ±2.52% (91 runs sampled)
>> complex x 894 ops/sec ±2.45% (93 runs sampled)
Fastest test is 11 kids at 1.03x faster than complex

Running suite Inflate empty vs simple lists [benchmark/adjList_inflate_empty.js]...
>> empty obj x 7,043 ops/sec ±2.78% (90 runs sampled)
>> simple obj x 7,098 ops/sec ±2.81% (90 runs sampled)
Fastest tests are simple obj,empty obj

Running suite Inflating lists with children [benchmark/adjList_inflate_kids.js]...
>> one child x 4,274 ops/sec ±2.53% (92 runs sampled)
>> two children x 3,146 ops/sec ±2.48% (97 runs sampled)
>> three children x 2,436 ops/sec ±2.72% (93 runs sampled)
Fastest test is one child at 1.36x faster than two children

Running benchmark create tests [benchmark/object_create.js]...
>> create tests x 7,433 ops/sec ±7.59% (21 runs sampled)

Running suite Big object inflations [benchmark/object_inflate_big.js]...
>> 11 kids x 1,015 ops/sec ±2.85% (91 runs sampled)
>> complex x 933 ops/sec ±2.06% (93 runs sampled)
Fastest test is 11 kids at 1.09x faster than complex

Running suite Inflate empty vs simple objects [benchmark/object_inflate_empty.js]...
>> empty obj x 7,963 ops/sec ±2.50% (89 runs sampled)
>> simple obj x 8,090 ops/sec ±2.19% (94 runs sampled)
Fastest test is simple obj at 1.02x faster than empty obj

Running suite Inflating objects with children [benchmark/object_inflate_kids.js]...
>> one kid x 4,680 ops/sec ±2.32% (96 runs sampled)
>> two kids x 3,362 ops/sec ±2.06% (96 runs sampled)
>> three kids x 2,640 ops/sec ±2.26% (97 runs sampled)
Fastest test is one kid at 1.39x faster than two kids

Running benchmark A big tree and a bunch of stuff done to it [benchmark/realworld.js]...
>> A big tree and a bunch of stuff done to it x 72,709,918 ops/sec ±6.09% (74 runs sampled)
```



**Test Coverage**: [Close to 100%][coverage].

Test coverage is measured for PhantomJS. Branches for Node and global
script definitions aren't executed, nor are the
`Object.defineProperty` fallbacks, so coverage is slightly
misreported.

Coverage is analyzed by running `grunt phantom_cover`. You can view the
coverage report locally at `coverage/index.html`.




## API

The `_tree` library exposes the following functions:

 * `create([defaults])`: creates an empty `Tree`
 * `inflate(object [, method [, defaults]])`: parses your data into a
   `Tree`
 * `fromNode(node [, defaults])`: creates a new tree using a `Node`
   from another tree.

All of the `_tree` methods return a `Tree` object, which has the
following methods: 

 * `root()`: returns the root `Node`
 * `walk(callback [, walkMethod, [, startNode]])`: traverses the
   `Tree`, executing a callback for each node in the order you specify
 * `equals(otherTree)`: determines if two `Tree`s are related clones.
 * `findNode`: finds the equivalent `Node` in a tree (works across
   clones)
 * `findNodeByData(matchData)`: finds the first `Node` containing
   matching data, even if supplied with a partial match.
 * `containsNode(node)`: returns `boolean` whether the `Node` exists in the
   `Tree`
 * `containsData(data)`: returns `boolean` whether the data exists in
   any `Node` in the `Tree`. Works for partial matches.
 * `moveNode(movingNode, toParentNode)`: move a `Node` and its
   descendants from one point in the tree to another.
 * `off('afterUpdate', callback)` or `off('afterUpdate', [callbacks])`:
   unregisters callbacks.
 * `mixin({tree: [], node: []}`: mixes an object into your tree and
   all of your nodes, respectively. Mixins are rebound to the new tree
   on all tree modifications. Note that all nodes will share the same
   mixin object.
 
The `Tree` consists of `Node`s, which have the following API:
 
 * `data([data])`: gets or sets the data on a node. Setting data
   generates a new `Tree`.
 * `children()`: returns the child `Node`s of a node
 * `parent()`: returns the `Node`'s parent
 * `tree()`: returns the `Node`'s tree
 * `id()`: returns the tree-unique internal id of the `Node`
 * `parseAndAddChild(obj [, inflateMethod])`: parses an object (much
   like inflate) and adds it as a child of the `Node`. Returns a new
   `Tree`.
 * `addChildNode(node)`: adds a `Node` as a child. Errors are thrown
   if the `Node` already exists in the tree. Returns a new `Tree`.
 * `equals(otherNode)`: returns `boolean` that representse the
   clone-agnostic equality of nodes.
 * `remove()`: removes a `Node` from the tree, returning a new `Tree`.
 * `on('afterUpdate', callback)` or `on('afterUpdate', [callbacks])`:
   register callbacks for the afterUpdate event, which is called after
   a new/updated tree is finalized.


## Building

Requirements: `Node` and `grunt`

```
git clone https://github.com/drfloob/_tree.git
cd _tree
npm install
grunt --force
```



## Development Stuff

> "Computing's core challenge is how not to make a mess of it. ... All
> unmastered complexity is of our own making; there is no one else to
> blame and so we had better learn how not to introduce the complexity
> in the first place."
> 
> -- <cite>[Edsger W. Dijkstra][EWD1243]</cite>

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
[home]: http://tree.drfloob.com/
[annsrc]: http://tree.drfloob.com/docs/_tree.html
[tests]: http://tree.drfloob.com/_SpecRunner.html
[coverage]: http://tree.drfloob.com/coverage/
