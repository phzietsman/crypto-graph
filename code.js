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

  var erctokensUrl = "https://cors.io/?" + "https://eidoo.io/erc20-tokens-list/";
  var erctokens = $.ajax({
    url: erctokensUrl, // curated list of erc20 / 223 tokens
    type: 'GET',
    dataType: 'text'
  });

  var cytoscapeStyles = $.ajax({
    url: './style.cycss',
    type: 'GET',
    dataType: 'text'
  });


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

    var totalMarketCap = coinmarketcapData.reduce( (acc, el) => acc + Number(el.market_cap_usd) , 0 );


    var merged = coinmarketcapData.reduce((acc, x) => {

      var data = cryptocompareData[mapMismatchedSymbols(x.symbol)];

      if (!data) {
        console.log('Missing data', x);
        return acc;
      }

      x.premined = data ? data.FullyPremined : "?";
      x.name = data ? data.FullName : "?";
      x.algorithm = data ? data.Algorithm : "?";
      x.proof_type = data ? data.ProofType : "?";
      x.image_url = data ? `https://cors.io/?https://www.cryptocompare.com${data.ImageUrl}` : "https://cryptocoin.news/wp-content/uploads/2017/08/cropped-CC.png";

      if(data) {
        var mult = Math.log10(x.market_cap_usd  );
        
        x.dim = mult * 10 / 2; 
      } else {
        x.dim = 40;
      }
      
      x.type = "crypto";

      acc.push({ data: x });
      console.log("DIM", x.dim);
      return acc;

    }, []);

    var proofs = ["PoW/PoS", "PoW", "PoS", "Tangle", "None / Other"];

    var algorithms = merged.reduce((acc, el) => {
      acc[el.data.algorithm] = el.data.algorithm;
      return acc;
    }, {});

    console.log(merged);

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


    initCy(elements, styles);

  }

  function initCy(elements, styles) {

    var loading = document.getElementById('loading');
    loading.classList.add('loaded');

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),

      layout: {
        name: 'cose',
        directed: true,
        roots: '#pos',
        padding: 10
      },

      style: styles,
      elements: elements,

      boxSelectionEnabled: false,
      autounselectify: true,
      minZoom: 0.5,
      maxZoom: 4,
    });

    function highlight(node) {

      var allElements = cy.elements();

      allElements.removeClass('hidden');
      allElements.removeClass('highlighted');

      if (!node.length) {
        var resetLayout = allElements.makeLayout({
          name: 'cose',
          directed: true,
          roots: '#pos',
          padding: 10
        });

        resetLayout.run();

        return;
      }

      var nhood = node.closedNeighborhood();
      var others = allElements.not(nhood);

      others.addClass('hidden');
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
        padding: 50
      });

      l.run();
    }

    cy.on('tap', function (evt) {
      
      highlight(evt.target);
      hideNodeInfo();

    });

    cy.on('tap', 'node[type="crypto"]',function (evt) {

      if( evt.target.length ){
        showNodeInfo( evt.target );
      }

    });

    
  }

  function showNodeInfo( node ){
    $('#info').html( infoWidget( node.data() ) ).show();
  }

  function hideNodeInfo(){
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

});
