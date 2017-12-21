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

  var customcats = $.ajax({
    url: './customcatagories.json',
    type: 'GET',
    dataType: 'json'
  });

  // var erctokensUrl = "https://cors.io/?" + "https://eidoo.io/erc20-tokens-list/";
  // var erctokensUrl = "http://crossorigin.me/" + "https://eidoo.io/erc20-tokens-list/";
  var erctokensUrl = "./eidoo.io";
  // var erctokensUrl = "https://eidoo.io/erc20-tokens-list/";

  var erctokens = $.ajax({
    crossDomain: true,
    url: erctokensUrl, // curated list of erc20 / 223 tokens
    type: 'GET',
    dataType: 'text'
  });

  var cytoscapeStyles = $.ajax({
    url: './style.cycss',
    type: 'GET',
    dataType: 'text'
  });

  var concentricLayout = {
    name: 'concentric',

    fit: true,
    animate: true,
    animationDuration: 500,
    animationEasing: 'linear',
    avoidOverlap: true,
    concentric: function (node) {
      if (node.data("type") === 'consensus' || node.data("type") === 'privacy' || node.data("type") === 'premined')
        return 11;
      else {
        var rank = node.data("rank");
        var level = 0;
        switch (true) {
          case rank <= 10:
            level = 10;
            break;

          case rank <= 20:
            level = 9;
            break;

          case rank <= 30:
            level = 8;
            break;

          case rank <= 40:
            level = 7;
            break;

          case rank <= 50:
            level = 6;
            break;

          case rank <= 60:
            level = 5;
            break;

          case rank <= 70:
            level = 4;
            break;

          case rank <= 80:
            level = 3;
            break;

          case rank <= 90:
            level = 2;
            break;

          case rank <= 100:
            level = 1;
            break;
        }

        return level;
      }
    },
    levelWidth: function () { return 1; },
    padding: 50,
    spacingFactor: 2,
  };

  var coseLayout = {
    name: 'cose',
  
    // Called on `layoutready`
    ready: function(){},
  
    // Called on `layoutstop`
    stop: function(){},
    
    // Whether to animate while running the layout
    // true : Animate continuously as the layout is running
    // false : Just show the end result
    // 'end' : Animate with the end result, from the initial positions to the end positions
    animate: true,
  
    // Easing of the animation for animate:'end'
    animationEasing: undefined,
  
    // The duration of the animation for animate:'end'
    animationDuration: undefined,
  
    // A function that determines whether the node should be animated
    // All nodes animated by default on animate enabled
    // Non-animated nodes are positioned immediately when the layout starts
    animateFilter: function ( node, i ){ return true; },
  
  
    // The layout animates only after this many milliseconds for animate:true
    // (prevents flashing on fast runs)
    animationThreshold: 250,
  
    // Number of iterations between consecutive screen positions update
    // (0 -> only updated on the end)
    refresh: 20,
  
    // Whether to fit the network view after when done
    fit: true,
  
    // Padding on fit
    padding: 30,
  
    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    boundingBox: undefined,
  
    // Excludes the label when calculating node bounding boxes for the layout algorithm
    nodeDimensionsIncludeLabels: false,
  
    // Randomize the initial positions of the nodes (true) or use existing positions (false)
    randomize: false,
  
    // Extra spacing between components in non-compound graphs
    componentSpacing: 40,
  
    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: function( node ){ return 400000; },
  
    // Node repulsion (overlapping) multiplier
    nodeOverlap: 10,
  
    // Ideal edge (non nested) length
    idealEdgeLength: function( edge ){ return 100; },
  
    // Divisor to compute edge forces
    edgeElasticity: function( edge ){ return 250; },
  
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 1.2,
  
    // Gravity force (constant)
    gravity: 1,
  
    // Maximum number of iterations to perform
    numIter: 1000,
  
    // Initial temperature (maximum node displacement)
    initialTemp: 1000,
  
    // Cooling factor (how the temperature is reduced between consecutive iterations
    coolingFactor: 0.99,
  
    // Lower temperature threshold (below this point the layout will end)
    minTemp: 1.0,
  
    // Pass a reference to weaver to use threads for calculations
    weaver: false
  };

  var layoutOptions = coseLayout;
  var layoutMemory = null;

  // when both graph export json and style loaded, init cy
  Promise.all([cytoscapeStyles, coinmarketcap, cryptocompare, customcats, erctokens]).then(buildElements);

  var lastHighlighted = null;
  var lastUnhighlighted = null;

  function buildElements(then) {
    var styles = then[0];
    var coinmarketcapData = then[1];
    var cryptocompareData = then[2].Data;
    var customcatsData = then[3];
    var erctokensHTML = then[4];
    var ERC20List = scrapeERCTokens(erctokensHTML);

    var totalMarketCap = coinmarketcapData.reduce((acc, el) => acc + Number(el.market_cap_usd), 0);


    var merged = coinmarketcapData.reduce((acc, x) => {

      var data = cryptocompareData[mapMismatchedSymbols(x.symbol)];

      if (!data) {
        console.error('Missing data', x);
        return acc;
      }

      x.premined = data ? data.FullyPremined : "?";
      x.name = data ? data.FullName : "?";
      x.algorithm = data ? data.Algorithm : "?";
      x.proof_type = data ? data.ProofType : "?";
      x.image_url = `./images/${x.symbol.toLowerCase()}.png`;

      if (data) {
        var mult = Math.log10(x.market_cap_usd);

        x.dim = mult * 10 / 2;
      } else {
        x.dim = 40;
      }

      x.type = "crypto";

      acc.push({ data: x });
      // console.log("DIM", x.dim);
      return acc;

    }, []);

    var proofs = ["PoW/PoS", "PoW", "PoS", "Tangle", "None / Other"];

    var algorithms = merged.reduce((acc, el) => {
      acc[el.data.algorithm] = el.data.algorithm;
      return acc;
    }, {});


    console.info("Crypto Data", merged);

    var elements = {
      nodes: [],
      edges: []
    };

    // Add default nodes
    proofs.forEach(x => {
      elements.nodes.push({ data: { type: 'consensus', id: x, name: x } });
    });

    elements.nodes.push({ data: { type: 'premined', id: 'premined', name: 'Pre Mined' } });
    elements.nodes.push({ data: { type: 'privacy', id: 'privacy', name: 'Privacy' } });
    // elements.nodes.push({ data: { type: 'erc2x_token', id: 'erc2x_token', name: 'ERC20 Token' } });


    elements.nodes = elements.nodes.concat(merged);

    // Add Edges
    merged.forEach(x => {

      var proofType = getProof(x.data.proof_type);

      if (proofType !== "None / Other") {
        elements.edges.push({ data: { id: `${proofType}_${x.data.id}`, weight: 1, target: proofType, source: x.data.id, type: "consensus" } });
      } else {

        if (ERC20List.find(tok => tok === x.data.symbol)) {
          elements.edges.push({ data: { id: `ethereum_${x.data.id}`, weight: 1, target: "ethereum", source: x.data.id, type: "erc2x_token" } });
        } else {
          elements.edges.push({ data: { id: `${proofType}_${x.data.id}`, weight: 1, target: proofType, source: x.data.id, type: "consensus" } });
        }
      }

      // Link premined
      if (x.data.premined === "1") {
        elements.edges.push({ data: { id: `premined_${x.data.id}`, weight: 1, target: 'premined', source: x.data.id, type: "premined" } });
      }

      // Link related coins
      if (customcatsData[x.data.id]) {

        customcatsData[x.data.id].data.forEach(relationship => {

          elements.edges.push({ data: { id: `${x.data.id}_${relationship}`, weight: 1, target: x.data.id, source: relationship, type: "root_of" } });

        });
      }

      // Link privacy 
      if (customcatsData.privacy.data.find(prv => prv === x.data.id)) {
        elements.edges.push({ data: { id: `privacy_${x.data.id}`, weight: 1, target: "privacy", source: x.data.id, type: "privacy" } });
      }



    });

    initCy(elements, styles, layoutOptions);

  }

  function highlight(node) {

    var allElements = cy.elements();

    allElements.removeClass('faded');
    allElements.removeClass('highlighted');

    if (!node.length) {

      cy.json(layoutMemory);

      // var resetLayout = allElements.makeLayout(layoutOptions);
      // resetLayout.run();

      
      return;
    }

    var nhood = node.closedNeighborhood();
    var others = allElements.not(nhood);

    others.addClass('faded');
    nhood.addClass('highlighted');

    var l = nhood.makeLayout({
      name: 'concentric',
      fit: true,
      animate: true,
      animationDuration: 500,
      animationEasing: 'linear',
      avoidOverlap: true,
      concentric: function (ele) {
        if (ele.same(node)) {
          return 2;
        } else {
          return 1;
        }
      },
      levelWidth: function () { return 1; },
      padding: 50,
      spacingFactor: 3,
    });

    l.run();
  }

  function initCy(elements, styles, layoutOptions) {

    var loading = document.getElementById('loading');
    loading.classList.add('loaded');

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),

      // layout: layoutOptions,

      style: styles,
      elements: elements,

      boxSelectionEnabled: false,
      autounselectify: true,
      minZoom: 0.1,
      maxZoom: 4,
    });

    var layout = cy.layout(layoutOptions);
    
    layout.on('layoutstop', function( event ){
      layoutMemory = cy.json();
    });

    layout.run();

    cy.on('tap', function (evt) {

      highlight(evt.target);
      hideNodeInfo();

    });

    cy.on('tap', 'node[type="crypto"]', function (evt) {

      if (evt.target.length) {
        showNodeInfo(evt.target);
      }

    });


  }

  function showNodeInfo(node) {
    $('#info').html(infoWidget(node.data())).show();
  }

  function hideNodeInfo() {
    $('#info').hide();
  }

  var infoWidget = Handlebars.compile(
    `<script type="text/javascript" src="https://files.coinmarketcap.com/static/widget/currency.js"></script><div class="coinmarketcap-currency-widget" data-currency="{{id}}" data-base="USD" data-secondary="" data-ticker="true" data-rank="true" data-marketcap="true" data-volume="true" data-stats="USD" data-statsticker="false"></div>`
  );

  function getProof(proof) {

    proof = proof.toUpperCase();

    if (proof.includes("POW") && proof.includes("POS"))
      return "PoW/PoS";

    if (proof.includes("POW"))
      return "PoW";

    if (proof.includes("POS"))
      return "PoS";

    if (proof.includes("TANGLE"))
      return "Tangle";

    return "None / Other";

  }

  function scrapeERCTokens(html) {

    var table = html.match(/<table id="tokensTable">([\w\W]*?)<\/table>/)[0];
    var tokenElements = table.match(/<h4>([^\$][\w\W]*?)<\/h4>/g);

    return tokenElements.map(t => t.match(/\((.*)\)/)[1]);
  }

  function mapMismatchedSymbols(symbol) {
    if (symbol === "MIOTA")
      return "IOT";

    if (symbol === "BCC")
      return "BCCOIN";

    return symbol;
  }

  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{name}}</p>'
  ].join(''));


  var lastSearch = "";

  $('#search').typeahead(
    {
      minLength: 2,
      highlight: true,
    },
    {
      name: 'search-dataset',
      source: function (query, cb) {
        function matches(str, q) {
          str = (str || '').toLowerCase();
          q = (q || '').toLowerCase();

          return str.match(q);
        }

        var fields = ['name', 'id', 'proof_type'];

        function anyFieldMatches(n) {
          for (var i = 0; i < fields.length; i++) {
            var f = fields[i];

            if (matches(n.data(f), query)) {
              return true;
            }
          }

          return false;
        }

        function getData(n) {
          var data = n.data();

          return data;
        }

        function sortByName(n1, n2) {
          if (n1.data('name') < n2.data('name')) {
            return -1;
          } else if (n1.data('name') > n2.data('name')) {
            return 1;
          }

          return 0;
        }

        var allNodes = cy.nodes();
        var res = allNodes.stdFilter(anyFieldMatches).sort(sortByName).map(getData);

        cb(res);
      },
      templates: {
        suggestion: infoTemplate
      }
    }).on('typeahead:selected', function (e, entry, dataset) {
      var n = cy.getElementById(entry.id);

      highlight(n);
      showNodeInfo(n);

    }).on('keydown keypress keyup change', _.debounce(function (e) {
      var thisSearch = $('#search').val();

      if (thisSearch !== lastSearch) {
        $('.tt-dropdown-menu').scrollTop(0);

        lastSearch = thisSearch;
      }
    }, 50));



  });
