//* Variables
require('dotenv').config();
const { Pool } = require("pg");

//* the connection string DATABASE_URL is found in the .env file
const connectionString = 'postgres://kmxeareumdzepa:fd3366aa131d7f7628d27c3e8be3099c0401a4a59dda8f012685bff62733a2e8@ec2-54-227-251-33.compute-1.amazonaws.com:5432/dc0im1dt2s4blc?ssl=true'
const pool = new Pool({connectionString: connectionString})

//* Pages
function loadHome(req, res) {
  console.log('Received a request for /chat-login');

  var param = {message: ""};

  res.render('pages/assignments/chatroom/chat-login', param)
  res.end()
}

function checkLogin(req, res) {
  console.log('Received a POST request for /chat-login-check');

  const username = req.body.username;
  const password = req.body.password;
  const button = req.body.submit[0];

  console.log(username + " : " + password);
  console.log("button : " + button);

  // check that we have recieved values to work with
  if (!username.trim() || username == ""
  || !password.trim() || password == "") {
    console.log('missing information');
    // Let the user know they need to fill out the textboxes
    var param = {message: "Please fill out both textboxes"};

    res.render('pages/assignments/chatroom/chat-login', param)
    res.end();
    return;
  }

  // check to see if we need to create a new user
  if (button == 'create') {
    createUser(username, password, function (error) {
      if (error) {
        var param = {message: error};

        res.render('pages/assignments/chatroom/chat-login', param)
        res.end();
        return;
      }
    });
  }

  // check to see if the username and password are correct
  checkUser(username, password, function (error, result) {
    if (error || result == null) {
      var param = {message: error};

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    console.log("Data: " + result[0].user_password);
    console.log("Data: " + result[0].user_id);

    // check to see that we got a row back
    if (result.length != 1) {
      console.log('No returned results');
      var param = {message: "Incorrect Username/Password"};

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    // check that the password provided matches the one in the database
    if (result[0].user_password != password) {
      console.log("Looking for: " + result[0].user_password);
      var param = {message: "Incorrect Username/Password"};

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    // we only want to move on if we have passed each check
    req.session.username = username;
    req.session.password = password;
    req.session.id = result[0].user_id;

    res.redirect('/chat-rooms')
    res.end();
    return; 
  });
}

function loadChatrooms(req, res) {
  console.log('Received a request for /chat-rooms');

  // check to see if we are logged in or not
  if (!req.session.username) {
    var param = {message: ""};

    res.render('pages/assignments/chatroom/chat-login', param)
    res.end()
  }

  var param = {username: req.session.username,
  id: req.session.id};

  res.render('pages/assignments/chatroom/chat-rooms', param)
}

//* Functions
function createUser(name, pass, callback) {
  const sql = "INSERT INTO users (user_name, user_password) VALUES ($1, $2)";
  const params = [name, pass];
  
  pool.query(sql, params, function(err, results) {
    if (err) {
      console.log('Username has already been taken. Please choose another.');
      console.log(err);

      callback("Username has already been taken. Please choose another.");
      return;
    }
    console.log('Created: ' + name + " " + pass);
    callback(null);
    return;
  })
}

function checkUser(name, pass, callback) {
  const sql = "SELECT user_password, user_id FROM users WHERE user_name = $1";
  const params = [name];

  pool.query(sql, params, function(err, results) {
    if (err) {
      console.log('Error in query: ');
      console.log(err);

      callback("Error in query: " + err, null);
      return;
    }

    console.log("Found result: " + JSON.stringify(results.rows));

    callback(null, results.rows);
    return;
  })
}

module.exports = {
  loadHome: loadHome,
  checkLogin: checkLogin,
  loadChatrooms: loadChatrooms
};