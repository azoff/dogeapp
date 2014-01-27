var http  = require('http');
var qs    = require('querystring');
var ns    = require('node-static');
var io    = require('socket.io');

(function(){

	"use strict";

	var TIMEOUT = 60000;
	var DATAKEY = 'such:data';
	var FOLDER  = './public';
	var PORT    = process.env.PORT || 8080;

	var server  = new ns.Server(FOLDER);
	var app     = http.createServer(server.serve.bind(server));
	var channel = io.listen(app); app.listen(PORT);
	var cache;

	function main() {
		getData();
		channel.on('connection', emitCache);
	}

	function getData() {
		requestData(jsonHandler(broadcastData));
	}

	function requestData(handler) {
		var data = qs.stringify({
			pairs: 'doge_ltc,doge_btc,btc_usd,ltc_usd,btc_ltc'
		});
		var post = http.request({
			hostname: 'www.cryptocoincharts.info',
			path: '/v2/api/tradingPairs',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': data.length
			}
		}, handler);
		post.write(data);
		post.end();
	}

	function jsonHandler(handler) {
		return function(res) {
			var body = '';
			res.setEncoding('utf8');
			res.on('data', function (chunk){
				body += chunk;
			});
			res.on('end', function(){
				var json = tryParseJson(body);
				if (json) { handler(json); }
			});
		};
	}

	function tryParseJson(body) {
		try {
			return JSON.parse(body);
		} catch(e) {
			console.error(e);
			return null;
		}
	}

	function broadcastData(data) {
		cache = data;
		channel.sockets.emit(DATAKEY, data);
		setTimeout(getData, TIMEOUT);
	}

	function emitCache(socket) {
		if (cache) {
			socket.emit('datakey', DATAKEY);
			socket.emit(DATAKEY, cache);
		}
	}

	return main;

})()();