var argv = require('yargs')
				.usage('Usage: $0 --file file --entity entity --database database --table table')
				.demand(['file', 'entity', 'database', 'table'])
				.alias('file', 'f')
				.alias('entity', 'e')
				.alias('database', 'd')
				.alias('table', 't')
				.argv;				

var Q = require('q');
var Fs = require('fs');
var Path = require('path');
var Cheerio = require('cheerio');
var _ = require('lodash');

var knex = require('knex')({
  client: 'mysql',
  connection: {
	 host     : 'localhost',
	 user     : 'root',
	 password : ''
}
});

var file = Path.join(__dirname, 'input.xml');

var traverse = function (content) {
	var $ = Cheerio.load(content, { ignoreWhitespace : true, xmlMode : true });

	var source = $(argv.entity);

	if (source.length == 0 ) throw 'Failed to load entity';

	// each row
	return _.map(source, function (item) {
		return { 'columns': _.map($(item).children(), function (item) {
								return {
									name: item.name,
									value: $(item).text(),
									type: item.attribs.type,
									size: item.attribs.size || 11
								};
							})
		};
	});
};

var create = function (data) {
	var table = function (table) {
		table.increments('id').primary();
    _.each(_.first(data).columns, function (column) {
    	switch (column.type.toLowerCase()) {
    		case 'integer':
    			table.integer(column.name);
    			break;
  			case 'datetime':
  				table.dateTime(column.name);
  				break;
				default:
    			table.string(column.name, column.size)
    			break;
    	};
    });
	};

	return knex
				.schema
				.raw('CREATE DATABASE IF NOT EXISTS ' + argv.database)
				.raw('USE ' + argv.database)
				.dropTableIfExists(argv.table)
				.createTable(argv.table, table)
				.return(data);
};

var insert = function (data) {
	var models = _.map(data, function (row) {
		var data = {};

		_.each(row.columns, function (column) {
			data[column.name] = column.value;
		});

		return data;
	});

	knex.destroy();
	knex = require('knex')({
	  client: 'mysql',
	  connection: {
			 host     : 'localhost',
			 user     : 'root',
			 password : '',
			 database : argv.database
		}
	});

	var bookshelf = require('bookshelf')(knex);

	var Model = bookshelf.Model.extend({ tableName: argv.table });

	var Collection = bookshelf.Collection.extend({ model: Model });
	
	return Collection.forge(models).invokeThen('save');
};

Q.nfcall(Fs.readFile, file, 'utf-8')
	.then(traverse)
	.then(create)
	.then(insert)
	.catch(function (err) {
		console.log(err);
	})
	.fin(function () {
		knex.destroy();
	});

	//node index -f input.xml -e post -d af --table post