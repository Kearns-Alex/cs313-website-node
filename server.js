//* All of these need to be npm install *** --save for the project
const express = require('express')
const path = require('path')
var session = require('express-session');
//var cookieParser = require('cookie-parser');

//* Controller libraries
const homeController = require("./controllers/homeController.js");
const postalController = require("./controllers/postalController.js");
const chatroomController = require("./controllers/chatroomController.js");

const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())                        // support for json ecodded bodies
  .use(express.urlencoded({extended: true}))  // support url encoded bodies
  //.use(cookieParser())
  .use(session({secret: "Shh, its a secret!"}))

//* Setting up the views 
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

//* Setting up all of the web pages
//* HOME PAGE
  .get('/', homeController.loadHome)
  .get('/assignments', homeController.loadAssignments)

//* POSTAL
  .get('/postal', postalController.loadHome)
  .get('/postal-submit', postalController.submitRequest)

//* CHATROOM
  .get('/chat-login', chatroomController.loadHome)
  .post('/chat-login-check', chatroomController.checkLogin)
  .get('/chat-rooms', chatroomController.loadChatrooms)


//* Set up the servers app and port
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))