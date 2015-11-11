'use strict';

var utils = require('./utils');
var Promise = utils.Promise;
var request = require('request');

module.exports = function(options) {
	return new Promise(function(resolve, reject) {
		request(options, function(error, response, body) {
			if (error) {
				return reject(error);
			}
			resolve({
				response: response,
				body: body
			});
		});
	});
};
