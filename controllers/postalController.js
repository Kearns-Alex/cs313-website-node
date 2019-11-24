//* Pages
function loadHome (req, res) {
  console.log('Received a request for /postal');

  res.render('pages/assignments/postal/postal');
}

function submitRequest (req, res) {
  console.log('Received a request for /postal-submit');

  const thisMailType = req.query.mailType;
  const thisWeight = req.query.weight;

  const thisTotal = calculateRate(thisMailType, thisWeight);
  const params = { 
    mailType : thisMailType, 
    weight : thisWeight, 
    total : thisTotal 
  };

  res.render('pages/assignments/postal/postal-results', params);
}

//* Functions
function calculateRate(type, weight) {
  var total = 0.0;

  switch(type) {
    case "Letters (Stamped)" :
        total = letterRate(.55, weight)
      break;

    case "Letters (Metered)" :
        total = letterRate(.50, weight)
      break;

    case "Large Envelopes (Flats)" :
        total = envelopeRate(weight)
      break;

    case "Postcards" :
        total = .35
      break;

    case "EDDM—Retail" :
        total = .187
      break;

    case "Semipostal Stamps" :
        total = .65
      break;

    case "Keys and Identification Devices" :
        total = keysAndIdentificationDeviceRate(weight)
      break;
  }

  return total.toFixed(2);
}

function letterRate(baseRate, weight) {
  var level = 0
  var additional = .15

  if (weight < 1) {
    level = 0
  } else if (weight < 2) {
    level = 1
  } else if (weight < 3) {
    level = 2
  } else if (weight < 3.5) {
    level = 3
  } else {
    return envelopeRate(weight)
  }

  return baseRate + (additional * level);
}

function envelopeRate(weight) {
  var baseRate = 1.00
  var additional = .15
  var level = 0

  if (weight < 1) {
    level = 0
  } else if (weight < 2) {
    level = 1
  } else if (weight < 3) {
    level = 2
  } else if (weight < 4) {
    level = 3
  } else if (weight < 5) {
    level = 4
  } else if (weight < 6) {
    level = 5
  } else if (weight < 7) {
    level = 6
  } else if (weight < 8) {
    level = 7
  } else if (weight < 9) {
    level = 8
  } else if (weight < 10) {
    level = 9
  } else if (weight < 11) {
    level = 10
  } else if (weight < 12) {
    level = 11
  } else if (weight < 13) {
    level = 12
  } 

  return baseRate + (additional * level);
}

function keysAndIdentificationDeviceRate(weight) {
  var baseRate = 3.60
  var additional = .18
  var level = 0

  if (weight < 4) {
    level = 0
  } else if (weight < 5) {
    level = 1
  } else if (weight < 6) {
    level = 2
  } else if (weight < 7) {
    level = 3
  } else if (weight < 8) {
    level = 4
  } else if (weight < 9) {
    level = 5
  } else if (weight < 10) {
    level = 6
  } else if (weight < 11) {
    level = 7
  } else if (weight < 12) {
    level = 8
  } else if (weight < 13) {
    level = 9
  }

  if (weight < 13) {
    return baseRate + (additional * level);
  } else if (weight < 16) {
    return 8.68;
  } else if (weight < 32) {
    return 10.28;
  }
}

module.exports = {
  loadHome: loadHome,
  submitRequest: submitRequest
};