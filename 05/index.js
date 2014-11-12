var Program = require('commander');
var Path = require('path');
var Fs = require('fs');
var Q = require('q');
var xml2js = require('xml2js');

Program
	.version('0.0.2')
	.option('-f, --file [file]', 'input file, type of xml')
	.option('-o, --output [output]', 'output file [output.json]', 'output.json')
	.parse(process.argv);

if (!Program.file) {
	console.log("Error: input file is missing.");
	Program.help();
}

var file = Path.join(__dirname, Program.file);

Q.nfcall(Fs.readFile, file, "utf-8")
	.then(function (data) {
		var parser = new xml2js.Parser({ explicitRoot: false });
		return Q.nfcall(parser.parseString, data);
	})
	.then(function (data) {
		return Q.nfcall(Fs.writeFile, Program.output, JSON.stringify(data, null, 3));
	})
	.catch(function (err) {
		console.log(err);
	})
	.fin(function () {
		console.log("Successfully write xml to file '%s'", Program.output);
	});