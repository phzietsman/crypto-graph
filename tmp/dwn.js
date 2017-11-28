
// List from https://min-api.cryptocompare.com/data/all/coinlist
const cryptos = require('./cryptocompare.json');
const fs = require("fs");

// The file will be downloaded to this directory. For example:  + '/mediatheque'
const dest = __dirname + '/images.txt';
var images = [];

for (var crypto in cryptos.Data) {
	if (cryptos.Data.hasOwnProperty(crypto)) {

		var url = `${cryptos.BaseImageUrl}${cryptos.Data[crypto].ImageUrl}\n`;
		images.push(url);
		fs.appendFileSync(dest, url);

	}
}

// run 
// $ cat images.json | xargs -n 1 curl -LO
// to download the files