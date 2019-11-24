//* Pages
function loadHome (req, res) {
  console.log('Received a request for /');

  res.render('pages/index')
}

function loadAssignments (req, res) {
  console.log('Received a request for /assignments');

  res.render('pages/assignments')
}

module.exports = {
  loadHome: loadHome,
  loadAssignments: loadAssignments,
};