var Hapi = require('hapi');
var Path = require('path');
var _ = require('lodash');
var Joi = require('joi');

var mongoose = require('mongoose');

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

var validation = {
	name: Joi.string().min(5).max(30).required(),
	email: Joi.string().email(),
	password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
	another_password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
	sex: Joi.number().min(1).max(2)
};

var register = function (request, reply) {
	mongoose.connect('mongodb://localhost/af');

	var schema = {
		name: String
		, email: String
		, password: String
		, sex: Number
		, createdDate: { type: Date, default: Date.now }
	};

	var Member = mongoose.model('Members', schema);

	delete request.payload.another_password;

	var user = new Member(request.payload);

	user.save(function (err, result) {
		if (err) {
			console.log(err);
			var context = {
				title: 'Registration Page',
				error: 'Failed to register, please try again'
			};
			reply.view('register', context);
		}
		else {
			console.log('Registered.');
			reply.redirect('/');
		}
	});
};

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

// server.route({
// 	method: 'POST',
// 	path: '/',
// 	handler: function (request, reply) {
// 		request.payload.search;
// 	},
// });

server.route({
	method: 'GET',
	path: '/register',
	handler: function (request, reply) {
		var context = {
			title: 'Registration Page'
		};
		reply.view('register', context);
	}
});

server.route({
	method: 'POST',
	path:  '/register',
	handler: register,
	config: {
    validate: {
	  	payload: validation
	  }
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