const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
// use any file in this folder
// look here for a match
  .use(express.static(path.join(__dirname, 'public')))
// setting up the views
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
// specific page request
//* ROOT
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
