var argv = require('yargs')
				.usage('Usage: $0 --file file --entity entity --database database --table table')
				.demand(['file', 'entity', 'database', 'table'])
				.alias('file', 'f')
				.alias('entity', 'e')
				.alias('database', 'd')
				.alias('table', 't')
				.argv;				

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : argv.database
  }
});

var bookshelf = require('bookshelf')(knex);

var Path = require('path'),
	 Fs = require('fs'),
	 Q = require('q'),
	 xml2js = require('xml2js')
	 cheerio = require('cheerio')
	 _ = require('lodash');

var file = Path.join(__dirname, argv.file);
var $, document;

Q.nfcall(Fs.readFile, file, "utf-8")
	.then(function (data) {

		$ = cheerio.load(data, { xmlMode: true });

		document = $(argv.entity);
		if (document.length == 0) throw 'No matching entity in the xml file.';

		var schema = {};

		// create schema { name: type }
		document.first().children().each(function (index, element) {
			schema[element.name] = element.attribs['type'];
		});

		var table = function (table) {
			table.increments('id').primary();
	    _.each(_.keys(schema), function (key) {
	    	if (schema[key] == 'integer') {
	    		table.integer(key);
	    	} else {
	    		table.string(key);
	    	}
	    });
		};

		return knex.schema
						.dropTableIfExists(argv.table)
						.createTable(argv.table, table);
	})
	.then(function () {
		var Post = bookshelf.Model.extend({
			tableName: argv.table
		});

		document.each(function(index, entity) {
			var data = {};

			$(entity).children().each(function (index, element) {
				data[element.name] = $(element).text();
			});

			return new Post(data).save().then(function(model) { console.log(JSON.stringify(model, null, 3)); });
		});
	})
	.catch(function (err) {
		console.log(err);
	})
	.done();

	//node index -f input.xml -e post -d af --table post