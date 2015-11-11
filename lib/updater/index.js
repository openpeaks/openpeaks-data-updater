'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var Data = require('../data');
var updateDataset = require('./update_dataset');

exports.update = function() {
	return Promise.each(Data.sources.getDatasets(), updateDataset);
};
