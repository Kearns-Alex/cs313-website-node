const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  //* Setting up the views 
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  //* Setting up all of the web pages
  //* HOME PAGE
  .get('/', function(req, res) {
    console.log('Received a request for /');

    res.render('pages/index')
  })
  //* ASSIGNMENTS PAGE
  .get('/assignments', function(req, res) {
    console.log('Received a request for /assignments');

    res.render('pages/assignments')
  })
  //* POSTAL PAGE
  .get('/postal', function(req, res) {
    console.log('Received a request for /postal');

    res.render('pages/postal')
  })
  //* Set up the servers app and port
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))