'use strict';

require('dotenv').load();

var Seqs = require('./seqs');
var updater = require('./updater');


function update() {
	return Seqs.createTables().then(updater.update);
}

update()
	.then(function() {
		console.log('DONE!');
	});
