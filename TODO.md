# Implementation

 * Implement _tree.deflate
 * Implement _tree.equals
 * Implement _node.equals
 * Implement _node.delete
 * Implement _node.contains
 * Implement _node.sample (what should that even do?)
 * Make _tree.__* properties truly private (they're already frozen; make them non-enumerable)
 * Eliminate _tree's internal nextTreeId state. Replace with some functional uniker.
 * Decide on an error practice; Normalize codebase and make errors explicit in the API.
 * Change the name of _tree.inflate.byAdjacencyList to not be misleading.
 * Error (or whatever) if adjacency list has root siblings.

# Tests

 * refactor spec.js into multiple files

# Quality

 * Find a performance testing framework
 * Setup independent performance tests
 * Setup performance comparisons between libraries

# Docs

 * build docco docs from the cmdline

# Infrastructure

 * jslint from the command line
 * minify (and gzip) from the command line
 * jasmine test from the cmd line

# Nice-to-haves

 * implement more tree builtin behaviors
   - balanced binary tree
   - red black tree

