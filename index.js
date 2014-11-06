var Hapi = require('hapi');
var Path = require('path');
var _ = require('lodash');

var server = new Hapi.Server(8001);

var data = [
	{
		id: 1,
		name: 'Practical Node.js: Building Real-World Scalable Web Apps',
		image: 'http://ecx.images-amazon.com/images/I/41pquei3uWL._AA160_.jpg'
	},
	{
		id: 2,
		name: 'Node.js in Action',
		image: 'http://ecx.images-amazon.com/images/I/51twwFigyiL._AA160_.jpg'
	},
	{
		id: 3,
		name: 'Node.js the Right Way: Practical, Server-Side JavaScript That Scales',
		image: 'http://ecx.images-amazon.com/images/I/51csKbX1NhL._AA160_.jpg'
	},
	{
		id: 4,
		name: 'Pro ASP.NET MVC 5',
		image: 'http://ecx.images-amazon.com/images/I/51ZaZX%2BvpDL._AA160_.jpg'
	}
];

server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		var context = {
			title: 'Taskworld by Dummy',
			header: 'Home',
			books: data
		};
		reply.view('index', context);
	}
});

server.route({
	method: 'GET',
	path: '/search',
	handler: function (request, reply) {
		var keyword = request.query.keyword;
		var result = _.filter(data, function (book) {
			var reg = new RegExp(keyword, 'i');
			return book.name.match(reg) != null;
		});
		reply(result);
	}
});

server.route({
	method: 'POST',
	path: '/',
	handler: function (request, reply) {
		request.payload.search;
	}
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: false
        }
    }
});

server.views({
	engines: {
		htm: require('handlebars')
	},
	path: Path.join(__dirname, '/static/templates')
});

server.start();