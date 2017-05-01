var http = require('http');
var request = require('request');
var bestBuyAPIKey = `pfe9fpy68yg28hvvma49sc89`;
var bestBuyQueryStart=`https://api.bestbuy.com/v1/products(name=`;
var bestBuyQueryEnd = `*)?apiKey=${bestBuyAPIKey}&sort=salePrice.asc&format=json`

var walmartAPIKey = `rm25tyum3p9jm9x9x7zxshfa`;
var walmartQueryStart=`http://api.walmartlabs.com/v1/search?apiKey=${walmartAPIKey}`;

exports.findLowestPriceByProductName = function(req, res) {
	// Build the Query
	var walmartQuery = walmartQueryStart + `&query=${req.query.name}&sort=price&order=asc`;
	var walmartItem;
	var walmartPrice;
	var walmartError;
	request(walmartQuery, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			walmartResponse = JSON.parse(body); // Print the response
			if(walmartResponse.message !== "Results not found!") {
				walmartItem = walmartResponse.items[0];
				walmartPrice = walmartItem.salePrice;
				console.log(walmartPrice);
			}else{
				console.log("No WalMart Results");
				walmartError = true;
			}
			res.json({walmartSalePrice: walmartPrice});
		}
	})

	// Build the Query
	var bestBuyQuery = bestBuyQueryStart + req.query.name + bestBuyQueryEnd;
	var bestBuyItem;
	var bestBuyPrice;
	var bestBuyError;
	request(bestBuyQuery, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			bestBuyResponse = JSON.parse(body); // Print the response
			bestBuyItem = bestBuyResponse.products[0];
			console.log(bestBuyItem);
			if(bestBuyItem != null) {
				bestBuyPrice = bestBuyItem.salePrice;
				console.log(bestBuyPrice);
			} else {
				console.log("No BestBuy Results");
				bestBuyError = true;
			}
		}
	})
	
	if(walmartError === true && bestBuyError === true) {
		console.log("Both Errored");
		res.json({Error: "No Results Found"});
	} else if (walmartError === true) {
		console.log("Walmart Error");
		res.json({bestBuySalePrice: bestBuyPrice});
	} else if (bestBuyError === true) {
		console.log("BestBuy Error");
		res.json({walmartSalePrice: walmartPrice});
	} else {
		console.log("Both returned");
		if (bestBuyPrice > walmartPrice) {
			res.json({walmartSalePrice: walmartPrice});
		} else {
			res.json({bestBuySalePrice: bestBuyPrice});
		}
	}
}

exports.getBestBuyKey = function(req, res) {
	res.send(bestBuyAPIKey)
}

exports.getWalMartKey = function(req, res) {
	res.send(walmartAPIKey)
}

// Apple iPod Touch 4th Generation