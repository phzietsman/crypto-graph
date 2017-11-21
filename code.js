var cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()

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

    .selector('edge[target = "priv"]')
    .css({
      'line-color': 'red',
      'opacity': 0.333,
      'z-index': 9,

    })

    .selector('node[NodeType = "mining"]')
    .css({
      'content': 'data(name)',
      'color': 'magenta'
    })

        .selector('node[NodeType = "focus_privacy"]')
    .css({
      'content': 'data(name)',
      'color': 'red'
    })



    .selector('node[NodeType = "consensus"]')
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
    }),

  elements: {
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
      { data: { id: 'pow_btc', weight: 1, target: 'pow', source: 'btc' } },
      { data: { id: 'pow_eth', weight: 1, target: 'pow', source: 'eth' } },
      { data: { id: 'pow_miota', weight: 1, target: 'pow', source: 'miota' } },

      { data: { id: 'pos_eth', weight: 1, target: 'pos', source: 'eth' } },


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
      { data: { id: 'priv_zen', weight: 1, target: 'priv', source: 'zen' } },
      { data: { id: 'priv_nav', weight: 1, target: 'priv', source: 'nav' } },
      { data: { id: 'priv_xvg', weight: 1, target: 'priv', source: 'xvg' } },
      { data: { id: 'priv_dash', weight: 1, target: 'priv', source: 'dash' } },
      { data: { id: 'priv_xmr', weight: 1, target: 'priv', source: 'xmr' } },
      { data: { id: 'priv_xzc', weight: 1, target: 'priv', source: 'xzc' } },
      


    ]
  },

  layout: {
    name: 'cose',
    directed: true,
    roots: '#pos',
    padding: 10
  }
});
