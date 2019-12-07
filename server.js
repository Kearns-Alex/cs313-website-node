//* All of these need to be npm install *** --save for the project
// npm install express --save
// npm install express-session --save
// npm install bcrypt --save
// npm install ejs --save
// npm install pg --save

const express = require('express');
const path = require('path');
var session = require('express-session');

//* Controller libraries
const homeController = require("./controllers/homeController.js");
const postalController = require("./controllers/postalController.js");
const chatroomController = require("./controllers/chatroomController.js");

const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())                        // support for json ecodded bodies
  .use(express.urlencoded({extended: true}))  // support url encoded bodies
  .use(session({
    secret: "It's a secret to everyone!",
    resave: false,
    saveUninitialized: true
  }))

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
  .get('/refresh-rooms', chatroomController.refresh)
  .get('/search-rooms', chatroomController.search)
  .post('/create-rooms', chatroomController.create)
  .get('/check-password', chatroomController.check)
  .get('/check-password-submit', chatroomController.checkChatPassword)
  .get('/chat', chatroomController.loadChat)
  .get('/chat-refresh', chatroomController.refreshChat)
  .post('/chat-send', chatroomController.postChat)


//* Set up the servers app and port
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))