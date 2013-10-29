var _tree = require('../src/_tree.js');

module.exports = { 
    name: 'Inflate empty vs simple objects',
    maxTime: 1,
    tests: {
        'empty obj': function() {
            _tree.inflate({});
        },
        'simple obj': function() {
            _tree.inflate({'hi': 'there'});
        }
    }
};
