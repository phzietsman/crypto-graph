var cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'content': 'data(name)',
        'color':'midnightblue'
      })
    .selector('node[NodeType = "mining"]')
      .css({
        'content': 'data(name)',
        'color':'red'
      })
    .selector('node[NodeType = "consensus"]')
      .css({
        'content': 'data(name)',
        'color':'green'
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'width': 4,
        'line-color': '#ddd',
        'target-arrow-color': '#ddd'
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
        { data: { id: 'pow', name: 'proof of work', NodeType:'consensus' } },
        { data: { id: 'pos', name: 'proof of stake', NodeType:'consensus' } },

        // Mining
        { data: { id: 'pre', name: 'pre-mined' , NodeType:'mining' } },
        { data: { id: 'asic', name: 'asic' , NodeType:'mining'  } },
        { data: { id: 'gpu', name: 'gpu' , NodeType:'mining'  } },
        

        // Currencies
        { data: { id: 'btc', name: 'bitcoin' } },
        { data: { id: 'bch', name: 'bitcoin cash' } },
        { data: { id: 'ltc', name: 'litecoin' } },
        { data: { id: 'vtc', name: 'vertcoin' } },

        { data: { id: 'eth', name: 'ethereum' } },
        { data: { id: 'etc', name: 'ethereum classic' } },


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

        // Related to bitcoin
        { data: { id: 'btc_bch', weight: 1, target: 'btc', source: 'bch' } },
        { data: { id: 'btc_ltc', weight: 1, target: 'btc', source: 'ltc' } },
        { data: { id: 'btc_vtc', weight: 1, target: 'btc', source: 'vtc' } },
        
        // Related to Ethereum
        { data: { id: 'eth_etc', weight: 1, target: 'eth', source: 'etc' } },
        


      ]
    },

  layout: {
    name: 'cose',
    directed: true,
    roots: '#pos',
    padding: 10
  }
});
