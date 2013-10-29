var _tree = require('../src/_tree.js');

module.exports = { 
    name: 'Inflating objects with children',
    maxTime: 1,
    tests: {
        'one kid': function() {
            _tree.inflate({'hi': 'there', children: [{'name': 'hork'}]});
        },
        'two kids': function() {
            _tree.inflate({'hi': 'there', children: [{'name': 'hork'}, {'whatever': 'for testing'}]});
        },
        'three kids': function() {
            _tree.inflate({'hi': 'there', children: [{'name': 'hork'}, {'whatever': 'for testing'}, {'why': 'not have another'}]});
        }
    }
};
