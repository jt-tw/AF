var argv = require('yargs')
				.usage('Usage: $0 --file input_file --output output_file')
				.demand(['file', 'output'])
				.alias('file', 'f')
				.alias('output', 'o')
				.argv;

var Path = require('path');
var Fs = require('fs');
var Q = require('q');
var xml2js = require('xml2js');

var file = Path.join(__dirname, argv.file);

Q.nfcall(Fs.readFile, file, "utf-8")
	.then(function (data) {
		var parser = new xml2js.Parser({ explicitRoot: false });
		return Q.nfcall(parser.parseString, data);
	})
	.then(function (data) {
		return Q.nfcall(Fs.writeFile, argv.output, JSON.stringify(data, null, 3));
	})
	.catch(function (err) {
		console.log(err);
	})
	.fin(function () {
		console.log("Successfully write xml to file '%s'", argv.output);
	});