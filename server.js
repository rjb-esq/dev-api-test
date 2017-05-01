var http = require('http');
var express = require('express');
var apiCalls = require('./routes/productSearch')

var app = express();

// Simple display message for root directory.
app.get('/', function (req, res) {
  res.send('This is the dev test for Ryan Boyce');
})

// Meat of the program goes here.
app.get('/product/search', apiCalls.findLowestPriceByProductName)

// Test Functions to ensure keys are populating correctly.
app.get('/bestBuyKey', apiCalls.getBestBuyKey)
app.get('/walmartKey', apiCalls.getWalMartKey)

// Chose port 8081 to listen on. 
app.listen(8081);

// Message to display as a sanity check to show user server is running.
console.log('Currently running on port 8081!')