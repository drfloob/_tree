var _tree = require('../src/_tree.js');

function deep(n, rollup) {
    rollup = rollup || [];
    if (n === 0) {
        return rollup;
    }
    if (rollup === []) {
        return deep(n-1, [n]);
    } else {
        return deep(n-1, [n, rollup]);
    }
}

function wide(n, rollup) {
    rollup = rollup || [];
    if (n === 0) {
        return [n, rollup];
    }
    rollup.push(n);
    return wide(n-1, rollup);
}

var ideep = deep(1024), iwide = wide(1024);

module.exports = { 
    name: '1024 Deep - vs - 1024 Wide',
    tests: {
        '1024 wide': function() {
            _tree.inflate(iwide, _tree.inflate.byAdjacencyList);
        },
        '1024 deep': function () {
            tree = _tree.inflate(ideep, _tree.inflate.byAdjacencyList);
        }
    }
};
