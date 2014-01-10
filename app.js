// http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=132
/*
{
	success: 1,
	return: {
		markets: {
			DOGE: {
				lasttradeprice: "0.00000031"
			}
		}
	}
}
// https://coinbase.com/api/v1/prices/spot_rate
/*
{
	amount: "814.91",
	currency: "USD"
}
*/
var http  = require('http');
var https = require('https');
var ns    = require('node-static');
var io    = require('socket.io');

(function(){

	"use strict";

	var timeout = 3000;
	var server  = new ns.Server('./public');
	var app     = http.createServer(server.serve.bind(server));
	var channel = io.listen(app);

	app.listen(8000);

	updateBitcoinRate();
	updateDogecoinRate();

	function updateBitcoinRate() {
		https.get('https://coinbase.com/api/v1/prices/spot_rate', 
			jsonHandler(emitCoinbaseRate, updateBitcoinRate));
	}

	function updateDogecoinRate() {
		http.get('http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=132', 
			jsonHandler(emitCryptsyRates, updateDogecoinRate));
	}

	function jsonHandler(callback, callee) {
		return function(res) {
			var body = '';
			res.setEncoding('utf8');
			res.on('data', function (chunk){
				body += chunk;
			});
			res.on('end', function(){
				var json = tryParseJson(body);
				if (json) { callback(json); }
				setTimeout(callee, timeout);
			});
		}
	}

	function tryParseJson(body) {
		try {
			return JSON.parse(body);
		} catch(e) {
			console.error(e);
			return null;
		}
	}

	function emitCoinbaseRate(data) {
		data.name = 'BTC';
		emitRate(data);
	}

	function emitCryptsyRates(data) {
		var markets = data.return.markets;
		Object.keys(markets).forEach(function(name){
			emitCryptsyRate(markets[name]);
		});
	}

	function emitCryptsyRate(data) {
		emitRate({
			name: data.primarycode,
			amount: data.lasttradeprice,
			currency: data.secondarycode,
		});
	}

	function emitRate(data) {
		channel.sockets.emit('rate', data);
	}

})();