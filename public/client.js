(function(global, dom, url){

	"use strict";

	var cache = {}; 
	var calculate = dom.getElementById('calculate')
	var result = dom.getElementById('result')
	var rates = dom.getElementById("rates");
	var socket = io.connect(url.origin);

	socket.on('rate', updateRate);
	socket.on('connect', showDogeLogo);
	calculate.addEventListener('keyup', updateResult, false);

	function updateRate(data) {
		var rate = getRate(data);
		var className = getClassName(rate.data.amount, data.amount);
		var innerHTML = getHtml(data);
		rate.node.className = className;
		rate.node.innerHTML = innerHTML;
		rate.data = data;
		updateResult({ type: className ? 'ratechange' : 'rateupdate' });
	}

	function updateResult(event) {
		var oldResult, newResult, className;
		var value = parseFloat(calculate.value);
		if (cache.DOGE && cache.BTC && value > 0) {
			value = value * cache.DOGE.data.amount * cache.BTC.data.amount;
			newResult = value.toFixed(2);
			result.innerHTML = newResult + ' USD';
			if (event.type === 'ratechange') {
				oldResult = parseFloat(result.innerHTML.split(' ').shift()) || newResult;
				className = getClassName(oldResult, newResult);
				result.className = className;
			}
		} else {
			result.innerHTML = 'DOGE';
		}
	}

	function getClassName(before, after) {
		if (before > after) return 'bear';
		if (before > after) return 'bull';
		return '';
	}

	function getHtml(data) {
		return ['<strong>',data.name,'/',data.currency,'</strong>',data.amount].join('');
	}

	function getRate(data) {
		if (data.name in cache) {
			return cache[data.name];
		} else {
			var node = dom.createElement('li');
			rates.appendChild(node);
			return cache[data.name] = {
				node: node,
				data: data
			};
		}
		
	}

	function showDogeLogo() {
		dom.querySelector('header').className = 'ready';
	}
	  

})(window, document, location);