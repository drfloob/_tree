var _tree = require('../src/_tree.js');

module.exports = {
    name: 'create tests',
    maxTime: 1,
    fn: function() {
        _tree.create();
    }
};
