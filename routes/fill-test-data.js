var TestData = require('../models/test-data/test-data');
/*
 * GET parent components.
 */
exports.start = function(req, res){
    TestData.start();
    res.send("FILLING WITH TEST DATA!");
};