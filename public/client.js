/*global io */
(function(global, dom, url){

	"use strict";

	var calculate = dom.getElementById('calculate');
	var type      = dom.getElementById('type');
	var result    = dom.getElementById('result');
	var rates     = dom.getElementById("rates");
	var socket    = io.connect(url.origin);
	var cache     = {};

	socket.on('datakey', listenForData);
	socket.on('connect', showDogeLogo);
	calculate.addEventListener('keyup', updateResult, false);
	type.addEventListener('change', updateResult, false);

	function updateResult() {
		var usingBtc, usingLtc, typeName;
		var value = parseFloat(calculate.value);
		var conv  = type.options[type.selectedIndex].value;
		if (isNaN(value) || value < 0 || Object.keys(cache).length < 4) {
			result.className = '';
		} else {
			result.className = 'ready';
			usingBtc = cache['doge/btc'].price * cache['btc/usd'].price;
			usingLtc = cache['doge/ltc'].price * cache['ltc/usd'].price;
			if (conv === 'doge_usd') {
				typeName = " USD";
				usingBtc *= value;
				usingLtc *= value;
			} else {
				typeName = " DOGE";
				usingBtc = value / usingBtc;
				usingLtc = value / usingLtc;
			}
			if (usingBtc > usingLtc) {
				result.innerHTML = usingBtc.toFixed(2).toString() + typeName + " <small>via BTC</small>";
			} else {
				result.innerHTML = usingLtc.toFixed(2).toString() + typeName + " <small>via LTC</small>";
			}
		}
	}

	function listenForData(datakey) {
		socket.on(datakey, processData);
	}

	function processData(data) {
		data.forEach(processDatum);
	}

	function processDatum(datum) {
		var old  = datum.id in cache ? cache[datum.id] : null;
		var rate = cache[datum.id] = newRate(datum);
		if (old) {
			var oldPrice   = old.datum.price;
			var newPrice   = rate.datum.price;
			rate.className = oldPrice > newPrice ? 'bear' : (oldPrice < newPrice ? 'bull' : '');
			rates.replaceChild(rate, old);
		} else {
			rates.appendChild(rate);
		}
		updateResult();
	}

	function newRate(datum) {
		var li      = dom.createElement('li');
		var strong  = dom.createElement('strong');
		var span    = dom.createElement('span');
		var a       = dom.createElement('a');
		var price   = parseFloat(datum.price);
		strong.innerText = datum.id;
		a.href  = "http://" + datum.best_market + ".com";
		a.innerText  = datum.best_market;
		span.innerText =  price.toString();
		li.appendChild(strong);
		li.appendChild(span);
		li.appendChild(a);
		li.datum = datum;
		li.price = price;
		return li;
	}

	function showDogeLogo() {
		dom.querySelector('header').className = 'ready';
	}

})(window, document, location);