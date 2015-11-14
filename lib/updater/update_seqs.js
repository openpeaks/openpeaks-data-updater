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
		return parseInt(item[0].substr(0, 4));
	}
	return item[0];
}

function formatSetItem(set, item, topic) {
	var data = {
		setId: set.id
	};
	var date = getItemDate(set.frequency, item);
	var value = item[set.valueColumn];
	if (set.type === 'value') {
		data.range = date;
		data.value = value;
		data.sequenceId = topic.id;
	} else if (set.type === 'topic') {
		data.range = value;
		data.value = topic.id;
		data.sequenceId = date;
	} else if (set.type === 'latest_topic') {
		data.range = value;
		data.value = topic.id;
		data.sequenceId = 'latest';
		data.label = date.toString();
	}

	return data;
}

module.exports = function(dataset) {
	var sets = Data.seqs.getSetsBySource(dataset.id);
	return Promise.each(sets, function(set) {
		if (set.inactive) {
			console.log('set ', set.id, 'is inactive');
			return null;
		}
		return ensureSetExists(set)
			.then(function() {
				var items = dataset.data;
				if (set.count) {
					items = _.take(items, set.count);
				}
				if (set.minValue !== undefined) {
					var icount = items.length;
					items = _.takeWhile(items, function(item) {
						return item[set.valueColumn] > set.minValue;
					});
					console.log('set.minValue', icount, items.length);
				}
				if (items.length === 0) {
					console.log('set ', set.name, 'has 0 items');
				}
				return Promise.each(items, function(item) {
						var data = formatSetItem(set, item, dataset.target);

						return Seqs.control.createValue(data);
					})
					.catch(function(dataError) {
						console.log('dataError', dataError.message);
					});
			});
	});
};
