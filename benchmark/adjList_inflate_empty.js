var _tree = require('../src/_tree.js');

module.exports = { 
    name: 'Inflate empty vs simple lists',
    tests: {
        'empty obj': function() {
            _tree.inflate([], _tree.inflate.byAdjacencyList);
        },
        'simple obj': function() {
            _tree.inflate([1], _tree.inflate.byAdjacencyList);
        }
    }
};
