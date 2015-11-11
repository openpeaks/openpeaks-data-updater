'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;
var Data = require('../data');
var request = require('../request');
var updateSeqs = require('./update_seqs');
var env = {
	QUANDL_API_KEY: process.env.QUANDL_API_KEY
};

function updateItem(url, dataset, topic) {
	console.log('updateItem', url);
	return request({
			url: url,
			json: true
		})
		.then(function(result) {
			if (result.body && result.body.dataset) {
				result = result.body.dataset;
				dataset = _.pick(dataset, 'id', 'code', 'name', 'frequency');
				dataset.url = url;
				dataset.data = result.data;
				dataset.topic = topic;

				return updateSeqs(dataset);
			}
		});
}

module.exports = function update(dataset) {
	console.log(dataset.id);
	if (dataset.inactive) {
		return Promise.resolve();
	}

	var topics = Data.topics.topicsByType(dataset.topic);

	var compiled = _.template(dataset.url, {
		interpolate: /{{([\s\S]+?)}}/g
	});

	return Promise.each(topics, function(topic) {
		var item = {
			env: env
		};
		item[topic.type] = topic;
		var url = compiled(item);

		return updateItem(url, dataset, topic);
	});
};
