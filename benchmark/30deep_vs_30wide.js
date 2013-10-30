var _tree = require('../src/_tree.js');

module.exports = { 
    name: '30 Deep - vs - 30 Wide',
    tests: {
        '30 wide': function() {
            _tree.inflate([0, [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]], _tree.inflate.byAdjacencyList);
        },
        '30 deep': function () {
            tree = _tree.inflate([0, [1,[2,[3,[4,[5,[6,[7,[8,[9,[10,[1,[2,[3,[4,[5,[6,[7,[8,[9,[10,[1,[2,[3,[4,[5,[6,[7,[8,[9,[10]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],
                                 _tree.inflate.byAdjacencyList);
        }
    }
};
