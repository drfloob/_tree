# Implementation

 * Fix IE9's issues
 * Make _tree.__* and _node.__* properties truly private (they're
   already frozen; make them non-enumerable)
 * Decide on an error practice; Normalize codebase and make errors
   explicit in the API.
 * Error (or whatever) if adjacency list has root siblings.

# Support

 * build a simple supporting website
 * package and host test page
 * package and host docs
 * package and host benchmark page
 * (ask for and) collect test & benchmark stats.

# Tests

 * refactor spec.js into multiple files
 * ensure unique node ids
 * analyze test robustness, outline what needs better testing
 * get continuous integration setup

# Benchmarks

 * Setup performance comparisons between libraries
 
# Nice-to-haves

 * implement more tree builtin behaviors
   - balanced binary tree
   - red black tree
 * implement a tree visualizer
 * wire up some visual examples in jsfiddle
 * benchmark uuid vs _.uniqueId

# For the sake of meta awesomeness

 * analyze how the codebase would differ if javascript had
   type-safety, and static or dynamic type-checking
 * port to haxe; compare expressability, performance, and size.
 
