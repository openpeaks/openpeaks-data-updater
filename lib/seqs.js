'use strict';

var dataseq = require('dataseq.storage');

var accessService = new dataseq.CacheAccessService();
var controlService = new dataseq.SecureControlService({
	accessService: accessService
});

exports.access = accessService;
exports.control = controlService;
exports.createTables = dataseq.createTables;
