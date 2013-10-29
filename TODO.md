# Implementation

 * Implement _tree.equals
 * Implement _node.equals
 * Implement _node.delete
 * Implement _node.findByData
 * Make _tree.__* and _node.__* properties truly private (they're
   already frozen; make them non-enumerable)
 * Decide on an error practice; Normalize codebase and make errors
   explicit in the API.
 * Change the name of _tree.inflate.byAdjacencyList to not be
   misleading.
 * Error (or whatever) if adjacency list has root siblings.

# Tests

 * refactor spec.js into multiple files
 
# Quality

 * Find a performance testing framework
 * Setup independent performance tests
 * Setup performance comparisons between libraries

# Infrastructure

 * get continuous integration setup
 * get test coverage info setup
 * integrate docco with grunt, add to build

# Nice-to-haves

 * implement more tree builtin behaviors
   - balanced binary tree
   - red black tree
 * implement a tree visualizer
 * wire up some visual examples in jsfiddle


