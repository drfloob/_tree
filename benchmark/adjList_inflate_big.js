var _tree = require('../src/_tree.js');

module.exports = { 
    name: 'Big list inflations',
    tests: {
        '11 kids': function() {
            _tree.inflate([0, [1,2,3,4,5,6,7,8,9,10,11]], _tree.inflate.byAdjacencyList);
        },
        'complex': function () {
            tree = _tree.inflate([1, [2, 3, [4, 5], 6, [7, [8, 9], 10, [11, [12]]]]],
                                 _tree.inflate.byAdjacencyList);
        }
    }
};
