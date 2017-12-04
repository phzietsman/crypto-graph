# crypto-graph
Graphical aggregated view on the state of **#crypto**s.

## Data Sources

* https://api.coinmarketcap.com/v1/ticker/?limit=100, as the base off which we start building the graph
* https://min-api.cryptocompare.com/data/all/coinlist, add some secondary info and get images :confused: [1]
* https://eidoo.io/erc20-tokens-list/, scrape this page to get a list of ERC tokens :confused: [2]
* `customcatagories.json`, for some extra niceness

## Maintaining `customcatagories.json`

This list is used to maintain relationships between **#crypto**s that cannot be derived from the available APIs. We use the IDs as provided by the [coinmarketcap API](https://api.coinmarketcap.com/v1/ticker/?limit=10) to create the links.

Current catagories maintained:
* `root_of` : when a coin is related to another token (eg. Bitcoin is the root of Bitcoin Cash or Litecoin)
* `privacy` : toekns / coin that has an emphisizes privacy / annonimity
 

## Todo

Extra catagories
* Remove **PoW/PoS** node and replace with two links, one to **PoS** and another to **PoW**
* Cleaned up version of **Algorithm**
* Make a distiction between **meta-coins** and **alt-coin**

Other
* node size based on some formula. It must be more than just market cap, maybe number of connected edges?

CORS :confused:
1. Cannot get the images using the links from the API

