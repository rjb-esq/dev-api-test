var async = require('async');
var request = require('request');

// Build the queries here to keep the rest of the code clean, and to make it easy to update if needed.
var walmartAPIKey = `rm25tyum3p9jm9x9x7zxshfa`;
var walmartQueryStart =`http://api.walmartlabs.com/v1/search?apiKey=${walmartAPIKey}&query=`;
var walmartQueryEnd = `&sort=price&order=asc`;

var bestBuyAPIKey = `pfe9fpy68yg28hvvma49sc89`;
var bestBuyQueryStart=`https://api.bestbuy.com/v1/products(name=`;
var bestBuyQueryEnd = `*)?apiKey=${bestBuyAPIKey}&sort=salePrice.asc&format=json`;

// Searches for the lowest priced item from either BestBuy or WalMart that contains the 
// strings passed into the request. The more precise you are with your terms, the better.
// WalMart searches are very, very loose and. BestBuy searches were EXACT match of entire 
// title until adding a wildcard into the search. Was unsure which to use. Put in wildcard
// to make it more useful.
exports.findLowestPriceByProductName = function(req, res) {
	var walmartItem;
	var walmartPrice;
	var walmartError;

	var bestBuyItem;
	var bestBuyPrice;
	var bestBuyError;

	// Must be called asynchronously or else you'll just get empty results.
	async.parallel([
		// Call to WalMart API.
		function(callback) {
			// Build the Query.
			var walmartQuery = walmartQueryStart + req.query.name + walmartQueryEnd;

			// Execute the request.
			request(walmartQuery, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					walmartResponse = JSON.parse(body); 
			
					// WalMart gives a message instead of returning a null result for 'items'.
					if(walmartResponse.message !== "Results not found!") {
						walmartItem = walmartResponse.items[0];
						walmartPrice = walmartItem.salePrice;
						callback(false, walmartPrice);
					}else{
						walmartError = true;
						callback(false, null);
					}
				}
			})
		},
		
		// Call to BestBuy API.
		function(callback) {
			// Build the Query.
			var bestBuyQuery = bestBuyQueryStart + req.query.name + bestBuyQueryEnd;

			// Execute the request.
			request(bestBuyQuery, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					bestBuyResponse = JSON.parse(body);
					bestBuyItem = bestBuyResponse.products[0];
					if(bestBuyItem != null) {
						bestBuyPrice = bestBuyItem.salePrice;
						callback(false, bestBuyPrice);
					} else {
						bestBuyError = true;
						callback(false, null);
					}
				}
			})
		}
	], // End parallel function call.
		
		function(err, results) {
			if(walmartError === true && bestBuyError === true) {
				// Give generic error to check for if neither site gives a result.
				return res.json({Error: "No Results Found"});
			} else if (walmartError === true) {
				// Automatically return BestBuy result if no WalMart Result
				return res.json({
					name: bestBuyItem.name,
					price: bestBuyPrice,
					currency: "CAD",
					location: "BestBuy"
				});
			} else if (bestBuyError === true) {
				// Automatically return WalMart result if no BestBuy Result
				return res.json({
					name: walmartItem.name,
					price: walmartPrice,
					currency: "CAD",
					location: "WalMart"
				});
			} else {
				// Compare the prices if both returned result. 
				// Flipped a coin for equal prices: BestBuy wins a tie.
				if (bestBuyPrice > walmartPrice) {
					return res.json({
						name: walmartItem.name,
						price: walmartPrice,
						currency: "CAD",
						location: "WalMart"
					});
				} else {
					return res.json({
						name: bestBuyItem.name,
						price: bestBuyPrice,
						currency: "CAD",
						location: "BestBuy"
					});
				}
			}
		}
	);
}