'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;
var Data = require('../data');
var Seqs = require('../seqs');

function ensureSetExists(set) {
	set = _.pick(set, 'id', 'name');

	return Seqs.control.createSet(set)
		.catch(function(error) {
			if (error.code !== 'ConditionalCheckFailedException') {
				return Promise.reject(error);
			}
		});
}

function getItemDate(frequency, item) {
	if (frequency === 'annual') {
		return item[0].substr(0, 4);
	}
	return item[0];
}

function formatSetItem(set, item, topic) {
	var data = {
		setId: set.id
	};
	var date = getItemDate(set.frequency, item);
	if (set.type === 'value') {
		data.range = date;
		data.value = item[set.column];
		data.sequenceId = topic.id;
	} else if (set.type === 'topic') {
		data.range = item[set.column];
		data.value = topic.id;
		data.sequenceId = date;
	}

	return data;
}

module.exports = function(dataset) {
	var sets = Data.seqs.getSetsBySource(dataset.id);
	return Promise.each(sets, function(set) {
		return ensureSetExists(set)
			.then(function() {
				return Promise.each(dataset.data, function(item) {
						var data = formatSetItem(set, item, dataset.topic);
						return Seqs.control.createValue(data);
					})
					.catch(function(dataError) {
						console.log('dataError', dataError.code);
					});
			});
	});
};
