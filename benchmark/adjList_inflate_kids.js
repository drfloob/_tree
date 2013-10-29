var _tree = require('../src/_tree.js');

module.exports = { 
    name: 'Inflating lists with children',
    tests: {
        'one child': function() {
            _tree.inflate([1, [2]], _tree.inflate.byAdjacencyList);
        },
        'two children': function() {
            _tree.inflate([1, [2, 3]], _tree.inflate.byAdjacencyList);
        },
        'three children': function() {
            _tree.inflate([1, [2, 3, 4]], _tree.inflate.byAdjacencyList);
        }
    }
};
