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
    url: './customcatagories.json', // all crytpos by cryptocompare
    type: 'GET',
    dataType: 'json'
  });


  var cytoscapeStyles = $.ajax({
    url: './style.cycss',
    type: 'GET',
    dataType: 'text'
  });


  // when both graph export json and style loaded, init cy
  Promise.all([coinmarketcap, cryptocompare, customcats,cytoscapeStyles]).then(buildElements);

  function buildElements(then) {
    var coinmarketcapData = then[0];
    var cryptocompareData = then[1].Data;
    var customcatsData = then[2];
    var styles = then[3];

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

    var proofs = ["PoW/PoS", "PoW", "PoS", "Tangle", "None / Other"];

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
    proofs.forEach( x => {
      elements.nodes.push({ data: { type: 'consensus', id: x, name: x } });
    });

    elements.nodes.push({ data: { type: 'premined', id: 'premined', name: 'Pre Mined' } });

    elements.nodes.push({ data: { type: 'privacy', id: 'privacy', name: 'Privacy' } });


    elements.nodes = elements.nodes.concat(merged);

    // Add Edges
    merged.forEach( x => {


      elements.edges.push({ data: { id: `${getProof(x.data.proof_type)}_${x.data.id}`, weight: 1, target: getProof(x.data.proof_type), source: x.data.id, type: "consensus" } });

      // Link premined
      if(x.data.premined === "1") {
        elements.edges.push({ data: { id: `premined_${x.data.id}`, weight: 1, target: 'premined', source: x.data.id, type:"premined" } });
      }

      // Link related coins
      if(customcatsData[x.data.id]) {

        customcatsData[x.data.id].data.forEach( relationship => {
          
          elements.edges.push({ data: { id: `${x.data.id}_${relationship}`, weight: 1, target: x.data.id, source: relationship, type:"root_of" } });

        });
      }

      // Link privacy 
      if(customcatsData.privacy.data.find( prv => prv === x.data.id)) {
        elements.edges.push({ data: { id: `privacy_${x.data.id}`, weight: 1, target: "privacy", source: x.data.id, type:"privacy" } });        
      }



    });


    initCy(elements, styles);

  }

  function initCy(elements, styles) {

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
  }

  function getProof(proof) {

    proof = proof.toUpperCase();

    if(proof.includes("POW") && proof.includes("POS"))
       return "PoW/PoS";

    if(proof.includes("POW"))
        return "PoW";

    if(proof.includes("POS"))
        return "PoS";
    
    if(proof.includes("TANGLE"))
        return "Tangle";

    return "None / Other";

  }

  function mapMismatchedSymbols(symbol) {
    if(symbol === "MIOTA")
      return "IOT";

    if(symbol === "BCC")
      return "BCCOIN";

    return symbol;
  }

});
