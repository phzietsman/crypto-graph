$(function () {


  var coinmarketcap = $.ajax({
    url: 'https://api.coinmarketcap.com/v1/ticker/?limit=100', // top 100 coins by coinmarketcap
    type: 'GET',
    dataType: 'json'
  });

  var cryptocompare = $.ajax({
    url: 'https://min-api.cryptocompare.com/data/all/coinlist', // all crytpos by cryptocompare
    type: 'GET',
    dataType: 'json'
  });


  // Merged
  // 24h_volume_usd:"3601850000.0"
  // algorithm:"SHA256"
  // available_supply:"16695075.0"
  // id:"bitcoin"
  // last_updated:"1511366651"
  // market_cap_usd:"137294787425"
  // max_supply:"21000000.0"
  // name:"Bitcoin (BTC)"
  // percent_change_1h:"0.18"
  // percent_change_7d:"14.4"
  // percent_change_24h:"-0.69"
  // premined:"0"
  // price_btc:"1.0"
  // price_usd:"8223.67"
  // proof_type:"PoW"
  // rank:"1"
  // symbol:"BTC"
  // total_supply:"16695075.0"



  // when both graph export json and style loaded, init cy
  Promise.all([coinmarketcap, cryptocompare]).then(buildElements);

  function initCy(elements) {

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),

      layout: {
        name: 'cose',
        directed: true,
        roots: '#pos',
        padding: 10
      },

      style: getCytoStyle(),
      elements: elements,



      boxSelectionEnabled: false,
      autounselectify: true,
      minZoom: 0.5,
      maxZoom: 4,
    });
  }


  function buildElements(then) {
    var coinmarketcapData = then[0];
    var cryptocompareData = then[1].Data;




    var merged = coinmarketcapData.reduce( (acc,x) => {

      var data = cryptocompareData[mapMismatchedSymbols(x.symbol)];

      if(!data) {
        console.log('Missing data', x);
        return acc;
      }

      x.premined = data ? data.FullyPremined : "?";
      x.name = data ? data.FullName : "?";
      x.algorithm = data ? data.Algorithm : "?";
      x.proof_type = data ? data.ProofType : "?";

      acc.push({data:x});
      return acc;

    }, []);

    var proofs = merged.reduce( (acc, el) =>  {
      
      var proof = getProof(el.data.proof_type);
      
      acc[proof] = proof;
      return  acc;
    },{});

    var algorithms = merged.reduce( (acc, el) =>  { 
      acc[el.data.algorithm] = el.data.algorithm;
      return  acc;
    }, {});

    console.log(merged);

    var elements = {
      nodes : [],
      edges: []
    };

    // Add default nodes
    Object.keys(proofs).forEach( x => {
      elements.nodes.push({ data: { type: 'consensus', id: x, name: x } });
    });

    elements.nodes.push({ data: { type: 'premined', id: 'premined', name: 'Pre Mined' } });

    elements.nodes = elements.nodes.concat(merged);

    // Add Edges
    merged.forEach( x => {


      elements.edges.push({ data: { id: `${getProof(x.data.proof_type)}_${x.data.id}`, weight: 1, target: getProof(x.data.proof_type), source: x.data.id, type: "consensus" } });

      if(x.data.premined === "1")
        elements.edges.push({ data: { id: `premined_${x.data.id}`, weight: 1, target: 'premined', source: x.data.id, type:"premined" } });





    });


    initCy(elements);

  }



  function getProof(proof) {

    proof = proof.toUpperCase();

    if(proof.includes("POW") && proof.includes("POS"))
       return "PoW/PoS"

    if(proof.includes("POW"))
        return "PoW"

    if(proof.includes("POS"))
        return "PoS"
      
    
    return proof;
  }

  function getCytoStyle() {
    return cytoscape.stylesheet()

      .selector('core')
      .css({
        'active-bg-color': '#fff',
        'active-bg-opacity': '0.333'
      })


      .selector('node')
      .css({
        'content': 'data(name)',
        'color': 'midnightblue',
        'width': 40,
        'height': 40,
        'font-size': 10,
        'font-weight': 'bold',
        'min-zoomed-font-size': 4,

        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#000',
        'text-outline-width': 2,
        'text-outline-color': '#fff',
        'text-outline-opacity': 1,
        'overlay-color': '#fff'
      })


      .selector('edge')
      .css({
        'curve-style': 'haystack',
        'haystack-radius': 0,

        'opacity': 0.333,
        'width': 2,

        'z-index': 0,

        'overlay-opacity': 0,
        'events': 'no',

        'target-arrow-shape': 'triangle',
        'line-color': '#ddd',
        'target-arrow-color': '#ddd'
      })

      .selector('edge[type = "priv"]')
      .css({
        'line-color': 'red',
        'opacity': 0.333,
        'z-index': 9,

      })

      .selector('edge[type = "consensus"]')
      .css({
        'line-color': 'green',
        'opacity': 0.333,
        'z-index': 9,

      })

      .selector('edge[type = "premined"]')
      .css({
        'line-color': 'magenta',
        'opacity': 0.333,
        'z-index': 9,

      })

      .selector('node[type = "premined"]')
      .css({
        'content': 'data(name)',
        'color': 'magenta'
      })

      .selector('node[type = "focus_privacy"]')
      .css({
        'content': 'data(name)',
        'color': 'red'
      })



      .selector('node[type = "consensus"]')
      .css({
        'content': 'data(name)',
        'color': 'green'
      })



      .selector('.highlighted')
      .css({
        'background-color': '#61bffc',
        'line-color': '#61bffc',
        'target-arrow-color': '#61bffc',
        'transition-property': 'background-color, line-color, target-arrow-color',
        'transition-duration': '0.5s'
      });
  }

  function mapMismatchedSymbols(symbol) {
    if(symbol === "MIOTA")
      return "IOT";

    if(symbol === "BCC")
      return "BCCOIN";

    return symbol;
  }


});


var elements = {
  nodes: [
    // Consensus
    { data: { id: 'pow', name: 'proof of work', NodeType: 'consensus' } },
    { data: { id: 'pos', name: 'proof of stake', NodeType: 'consensus' } },

    // Mining
    { data: { id: 'pre', name: 'pre-mined', NodeType: 'mining' } },
    { data: { id: 'asic', name: 'asic', NodeType: 'mining' } },
    { data: { id: 'gpu', name: 'gpu', NodeType: 'mining' } },

    // Focus 
    { data: { id: 'priv', name: 'privacy', NodeType: 'focus_privacy' } },
    // { data: { id: 'entr', name: 'enterprise', NodeType: 'focus_privacy' } },
    // { data: { id: 'xchg', name: 'exchange', NodeType: 'focus_privacy' } },
    // { data: { id: 'asst', name: 'assets', NodeType: 'focus_privacy' } },


    // Currencies
    { data: { id: 'btc', name: 'bitcoin' } },
    { data: { id: 'bch', name: 'bitcoin cash' } },
    { data: { id: 'ltc', name: 'litecoin' } },
    { data: { id: 'vtc', name: 'vertcoin' } },
    { data: { id: 'dcr', name: 'decred' } },
    { data: { id: 'zen', name: 'zencash' } },
    { data: { id: 'nav', name: 'nav coin' } },
    { data: { id: 'nxs', name: 'nexus' } },
    { data: { id: 'bdl', name: 'bitdeal' } },
    { data: { id: 'doge', name: 'dogecoin' } },
    { data: { id: 'mona', name: 'monacoin' } },
    { data: { id: 'xvg', name: 'verge' } },
    { data: { id: 'dash', name: 'dash' } },
    { data: { id: 'pivx', name: 'pivx' } },


    { data: { id: 'xrp', name: 'ripple' } },

    { data: { id: 'eth', name: 'ethereum' } },
    { data: { id: 'etc', name: 'ethereum classic' } },
    { data: { id: 'neo', name: 'neo' } },

    { data: { id: 'xmr', name: 'monero' } },
    { data: { id: 'etn', name: 'electroneum' } },

    { data: { id: 'xzc', name: 'zcoin' } },
    { data: { id: 'btcd', name: 'bitcoindark' } },
    { data: { id: 'smart', name: 'smartcash' } },



    { data: { id: 'miota', name: 'iota' } },

  ],

  edges: [
    // By consensus
    { data: { id: 'pow_btc', type: 'consensus', weight: 1, target: 'pow', source: 'btc' } },
    { data: { id: 'pow_eth', type: 'consensus', weight: 1, target: 'pow', source: 'eth' } },
    { data: { id: 'pow_miota', type: 'consensus', weight: 1, target: 'pow', source: 'miota' } },

    { data: { id: 'pos_eth', type: 'consensus', weight: 1, target: 'pos', source: 'eth' } },


    // By Mining
    { data: { id: 'asic_btc', weight: 1, target: 'asic', source: 'btc' } },
    { data: { id: 'gpu_eth', weight: 1, target: 'gpu', source: 'eth' } },

    { data: { id: 'pre_miota', weight: 1, target: 'pre', source: 'miota' } },
    { data: { id: 'pre_xrp', weight: 1, target: 'pre', source: 'xrp' } },

    // Related to bitcoin
    { data: { id: 'btc_bch', weight: 1, target: 'btc', source: 'bch' } },
    { data: { id: 'btc_ltc', weight: 1, target: 'btc', source: 'ltc' } },
    { data: { id: 'btc_vtc', weight: 1, target: 'btc', source: 'vtc' } },
    { data: { id: 'btc_dcr', weight: 1, target: 'btc', source: 'dcr' } },
    { data: { id: 'btc_zen', weight: 1, target: 'btc', source: 'zen' } },
    { data: { id: 'btc_nav', weight: 1, target: 'btc', source: 'nav' } },
    { data: { id: 'btc_nxs', weight: 1, target: 'btc', source: 'nxs' } },
    { data: { id: 'btc_bdl', weight: 1, target: 'btc', source: 'bdl' } },
    { data: { id: 'btc_dash', weight: 1, target: 'btc', source: 'dash' } },
    { data: { id: 'btc_doge', weight: 1, target: 'btc', source: 'doge' } },

    { data: { id: 'doge_mona', weight: 1, target: 'doge', source: 'mona' } },
    { data: { id: 'doge_xvg', weight: 1, target: 'doge', source: 'xvg' } },

    { data: { id: 'dash_pivx', weight: 1, target: 'dash', source: 'pivx' } },

    // Related to Ethereum
    { data: { id: 'eth_etc', weight: 1, target: 'eth', source: 'etc' } },
    { data: { id: 'eth_neo', weight: 1, target: 'eth', source: 'neo' } },

    // Related to other
    { data: { id: 'xmr_etn', weight: 1, target: 'xmr', source: 'etn' } },
    { data: { id: 'xzc_btcd', weight: 1, target: 'xzc', source: 'btcd' } },
    { data: { id: 'xzc_smart', weight: 1, target: 'xzc', source: 'smart' } },




    // Focus
    // Privacy
    { data: { id: 'priv_zen', type: 'priv', weight: 1, target: 'priv', source: 'zen' } },
    { data: { id: 'priv_nav', type: 'priv', weight: 1, target: 'priv', source: 'nav' } },
    { data: { id: 'priv_xvg', type: 'priv', weight: 1, target: 'priv', source: 'xvg' } },
    { data: { id: 'priv_dash', type: 'priv', weight: 1, target: 'priv', source: 'dash' } },
    { data: { id: 'priv_xmr', type: 'priv', weight: 1, target: 'priv', source: 'xmr' } },
    { data: { id: 'priv_xzc', type: 'priv', weight: 1, target: 'priv', source: 'xzc' } },



  ]
};

