var express = require('express');
var apiCalls = require('./routes/productSearch')

var express = express();

// Simple display message for root directory.
express.get('/', function (req, res) {
  res.send('This is the Blue Spurs programming test for Ryan Boyce. Written 2017-05-01');
})

// Meat of the program goes here.
express.get('/product/search', apiCalls.findLowestPriceByProductName)

// Chose port 8081 to listen on. Figured it was a safe one to use.
express.listen(8081);

// Message to display as a sanity check to show user server is running.
console.log('Currently running on port 8081!')