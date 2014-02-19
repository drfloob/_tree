/* global define, describe, it, expect, jasmine */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['_tree', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        /* global module, require */
        module.exports = factory(require('../../src/_tree'), require('underscore'));
    } else {
        factory(root._tree, root._);
    }
}(this, function (_tree, _) {
    'use strict';

    describe('_tree as your data model', function() {

        it('is pretty powerful', function() {
            var Todo, TodoList, inflateFn, data, todoList;

            // This example is a stripped-down version of the data
            // model required for a [TodoMVC](http://todomvc.com/)
            // implementation.


            // `Todo` is the class definition behind every todo list
            // entry. The API lets you retrieve the name, mark the
            // task completed, and check whether it's completed or
            // not.
            Todo = _tree.Node.extend({
                isCompleted: function() {
                    return this.data().completed;
                },
                complete: function() {
                    return this.data(_.extend(this.data(), {completed: true}));
                },
                name: function() {
                    return this.data().name;
                },
                serialize: function() {
                    return JSON.parse(JSON.stringify(this.data()));
                }
            });


            // The tree object itself models the TodoList, with custom
            // 'list' methods built into this subclass.
            //
            // If you wanted to, you could implement the TodoList
            // methods on the root node with a TodoList extension of
            // Node (as above). Using a tree subclass, however, allows
            // you to write `TodoList.completeAll()` instead of
            // `TodoList.root().completeAll()`.
            TodoList = _tree.Tree.extend({
                completeAll: function() {
                    var t = this.batch();
                    _.each(t.root().children(), function(k) {
                        k.data(_.defaults({completed: true}, k.data()));
                    });
                    return t.end();
                },
                name: function() {
                    return this.root().data().listName;
                },
                getTodos: function(n) {
                    var c = this.root().children();
                    if(_.isUndefined(n)) {
                        return c;
                    }
                    return c[n];
                },
                serialize: function() {
                    var ret = {listName: this.name(),
                               todos: _.map(this.getTodos(),
                                            function(t) {
                                                return t.serialize();
                                            })
                              };
                    return JSON.parse(JSON.stringify(ret));
                }
            });

            // The inflate method walks the data we intend to inflate,
            // providing construction logic for our custom Node
            // classes. The root node isn't special, but each of
            // root's children must be created as Todo objects.
            inflateFn = function(obj) {
                if (obj.listName) {
                    this.setNode(new _tree.Node(this.tree, obj));
                } else {
                    this.setNode(new Todo(this.tree, obj));
                }
                if (_.has(obj, 'todos')) {
                    this.children(obj.todos);
                }
            };
            
            // here's the serialized data we plan to inflate into a
            // TodoList-flavored tree.
            data = {
                listName: 'my list',
                todos: [
                    {name: 'finish _tree', completed: false},
                    {name: 'put away dishes', completed: false},
                    {name: 'do yoga', completed: true}
                ]
            };

            // and this is where it all comes together.
            todoList = _tree.inflate(data, inflateFn, {treeClass: TodoList});

            
            expect(todoList.name()).toBe('my list');
            expect(todoList.getTodos(0).name()).toBe('finish _tree');
            expect(todoList.getTodos(0).isCompleted()).toBe(false);

            expect(todoList.completeAll).toBeDefined();
            expect(todoList.completeAll).toEqual(jasmine.any(Function));
            expect(todoList.getTodos().length).toBe(3);

            todoList = todoList.completeAll();

            // ensure all todos have been completed
            _.each(todoList.getTodos(), function(k) {
                expect(k.isCompleted()).toBe(true);
            });

            // serialize test
            todoList = todoList.batch()
                .getTodos(0).remove()
                .getTodos(0).remove()
                .end();
            
            expect(todoList.serialize())
                .toEqual({
                    listName: 'my list',
                    todos: [
                        {name: 'do yoga', completed: true}
                    ]
                });
        });

    });

}));