# Implementation

 * create a new tree from the node of another tree.
 * move a node from one spot to another.
 * Make _tree.__* and _node.__* properties truly private (they're
   already frozen; make them non-enumerable)
 * Decide on an error practice; Normalize codebase and make errors
   explicit in the API.
 * Error (or whatever) if adjacency list has root siblings.

# Tests

 * refactor spec.js into multiple files
 
# Quality

 * Setup real-world performance tests
 * Setup performance comparisons between libraries

# Infrastructure

 * get continuous integration setup
 * get test coverage info setup

# Nice-to-haves

 * implement more tree builtin behaviors
   - balanced binary tree
   - red black tree
 * implement a tree visualizer
 * wire up some visual examples in jsfiddle


