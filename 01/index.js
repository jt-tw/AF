var Fs = require('fs');
var Util = require('util');

Fs.readFile('data.json', 'utf-8', function (err, data) {
	if (err) throw err;
	var person = JSON.parse(data);

	if (person != null) {
		console.log(Util.format('Full Name: %s %s', person.FirstName, person.LastName));
		console.log(Util.format('Email: %s', person.Email));
	}
});