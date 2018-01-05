const https = require('https');
const cheerio = require('cheerio');

exports.helloWorld = function helloWorld(request, response) {

	response.set('Access-Control-Allow-Origin', "*");
	response.set('Access-Control-Allow-Methods', 'GET, POST');

	https.get('https://coinmarketcap.com/tokens/', (res) => {
		const { statusCode } = res;
		const contentType = res.headers['content-type'];

		let error;
		if (statusCode !== 200) {
			error = new Error('Request Failed.\n' +
				`Status Code: ${statusCode}`);
		} else if (!/^text\/html/.test(contentType)) {
			error = new Error('Invalid content-type.\n' +
				`Expected text/html but received ${contentType}`);
		}

		if (error) {
			response.status(500).send(error.message);
			res.resume();
			return;
		}

		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => { rawData += chunk; });
		res.on('end', () => {
			try {
				const tokens = scrapeERCTokens(rawData);
				response.status(200).send(tokens);
			} catch (e) {
				response.status(500).send(e.message);
			}
		});
	}).on('error', (e) => {
		response.status(500).send(e.message);
	});
};


function scrapeERCTokens(html) {

	let result = [];

	let $ = cheerio.load(html);
	const tableRows = $('tbody').find('tr').each(function (i, elem) {
		const name = $(this).find('.currency-name-container')[0];
		const symbol = $(this).find('.currency-symbol')[0];
		const platform = $(this).find('.platform-name')[0];

		result.push({
			name: $(name).text(),
			symbol: $(symbol).text(),
			platform: $(platform).text()
		});
	});

	return result;
}