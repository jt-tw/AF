var program = require('commander');
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');

program
	.version('0.0.1')
	.option('-i, --input [input]', 'input file, type of xml')
	.option('-o, --output [output]', 'output file [output.json]', 'output.json')
	.parse(process.argv);

if (!program.input) {
	console.log("Error: input file is missing.");
	program.help();
}

var file = path.join(__dirname, program.input);

fs.readFile(file, function (err, data) {
	if (err) { throw err; }

	var options = {
		explicitRoot: false,
		ignoreAttrs: true,
		explicitArray: false,
	};

	var parser = new xml2js.Parser(options);
	parser.parseString(data, function (err, result) {
		if (err) { throw err; }

		fs.writeFile(program.output, JSON.stringify(result, null, 3), function (err) {
			if (err) { throw err; }

			console.log("Successfully write xml to file '%s'", program.output);
		});
	});
});