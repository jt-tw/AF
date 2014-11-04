var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server(8000);

server.views({
    engines: {
        htm: require('handlebars')
    },
    path: Path.join(__dirname, 'views'),
    isCached: false
});

server.route({
    method: 'GET',
    path: '/',
    handler: {
    	view: {
    		template: 'index',
    		context: {
    			title: 'My home page',
                header: 'My favorite pages',
                sites: [
                    { name: 'ESPN FC', link: 'http://www.espnfc.com/' },
                    { name: 'soccersuck', link: 'http://www.ssballthai.in.th/' }
                ]
    		}
    	}
    }
});

server.start();