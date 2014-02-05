require.config({
    paths: {
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min'
    }
});

require(['src/_tree', 'underscore'], function(_tree, _) {

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

    for(var i = 0; i < 100; i++) {
        _tree.inflate(iwide, _tree.inflate.byAdjacencyList);
    }

    console.log('done');

});