var _tree = require('../src/_tree.js');

module.exports = { 
    name: 'Big object inflations',
    maxTime: 1,
    tests: {
        '11 kids': function() {
            _tree.inflate({a: 1, children: [{a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}, {a: 1}]});
        },
        'complex': function () {
            _tree.inflate({a: 1, children: [
                {a: 2}, 
                {a: 3, children: [
                    {a: 4}, 
                    {a: 5}]}, 
                {a: 6, children: [
                    {a: 7, children: [
                        {a: 8}, 
                        {a: 9}]}, 
                    {a: 10, children: [
                        {a: 11, children: [
                            {a: 12}]}]}]}]});
        }
    }
};
