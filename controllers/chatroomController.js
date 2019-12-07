//* Variables
require('dotenv').config();
const { Pool } = require("pg");
const bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync();

//* the connection string DATABASE_URL is found in the .env file
const connectionString = 'postgres://kmxeareumdzepa:fd3366aa131d7f7628d27c3e8be3099c0401a4a59dda8f012685bff62733a2e8@ec2-54-227-251-33.compute-1.amazonaws.com:5432/dc0im1dt2s4blc?ssl=true'
const pool = new Pool({
  connectionString: connectionString
});

//* Pages
function loadHome(req, res) {
  console.log('Received a request for /chat-login');

  if (req.session.username && req.session.userid) {
    console.log('Redirecting to the rooms');

    res.redirect('/chat-rooms');
    res.end;
    return;
  }

  var param = {
    message: ""
  };

  res.render('pages/assignments/chatroom/chat-login', param);
  res.end();
}

function checkLogin(req, res) {
  console.log('Received a POST request for /chat-login-check');

  const username = req.body.username;
  const password = req.body.password;
  const button = req.body.submit[0];

  console.log(username + " : " + password);
  console.log("button : " + button);

  // check that we have recieved values to work with
  if (!username.trim() || username == "" ||
      !password.trim() || password == "") {
    console.log('missing information');

    // Let the user know they need to fill out the textboxes
    var param = {
      message: "Please fill out both textboxes"
    };

    res.render('pages/assignments/chatroom/chat-login', param)
    res.end();
    return;
  }

  // check to see if we need to create a new user
  if (button == 'create') {
    createUser(res, req, username, password);
  } else {
    checkUser(res, req, username, password);
  }
}

function loadChatrooms(req, res) {
  console.log('Received a request for /chat-rooms');

  // check to see if we are logged in or not
  if (!req.session.username || !req.session.userid) {
    console.log('Redirecting to the login');

    res.redirect('/chat-login');
    res.end();
    return;
  }

  console.log(req.session.username + ":" + req.session.userid);

  var param = {
    username: req.session.username,
    id: req.session.userid
  };

  console.log('rendering the page ...');

  res.render('pages/assignments/chatroom/chat-rooms', param)
  res.end();
  return;
}

function loadChatPassword(req, res) {
  console.log('Received a request for /check-password');

  // check to see if we are logged in or not
  if (!req.session.username || !req.session.userid) {
    console.log('Redirecting to the login');

    res.redirect('/chat-login');
    res.end();
    return;
  }

  var roomid = req.query.submit[0];

  console.log();
  console.log(`pre roomid: ${roomid}`);
  console.log();

  // this is our continual check if we keep entering the wrong password to keep
  // the room id associated
  // if the roomid is not in the POST data, then it is in our session
  if (roomid == '' && req.session.roomid !== '') {
    roomid = req.session.roomid;
  } else {
    req.session.roomid = roomid;
  }

  console.log();
  console.log(`post roomid: ${roomid}`);
  console.log();

  // set up our query to select the record from our table
  var sql = `
  SELECT 
    room_password 
  , room_name
  FROM room 
  WHERE room_id = $1`;

  // prepare our statement
  var params = [roomid];

  queryAsync(sql, params, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err).end();
      return;
    }

    var hash = data[0]['room_password'];
    var name = data[0]['room_name'];

    var param = {
      roomid: roomid,
      room: name,
      username: req.session.username,
      userid: req.session.userid
    };

    // check to see how many rows we have
    if ('' == hash) {
      console.log(`We have no password`);

      console.log(`redirecting to chat room`);
      

      res.redirect(`/chat?roomid=${roomid}&room=${name}&username=${req.session.username}&userid=${req.session.userid}`);
      res.end();
      return;
    }

    res.render('pages/assignments/chatroom/password-helper', param);
    res.end();
  });

}

function checkChatPassword(req, res) {
  // set up our query to select the record from our table
  var sql = `
  SELECT 
    room_password 
  , room_name
  FROM room 
  WHERE room_id = $1`;

  // prepare our statement
  //var params = [req.query.id];
  var params = [req.query.submit];

  queryAsync(sql, params, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err).end();
      return;
    }

    var hash = data[0]['room_password'];
    var name = data[0]['room_name'];
    var password = req.query.password;

    // check to see if the password matches
    if (!bcrypt.compareSync(password, hash)) {
      console.log(`Wrong password`);
      var param = {
        roomid: req.query.submit,
        room: req.query.room,
        username: req.session.username,
        userid: req.session.userid,
        message: "Password was incorrect. Please try again"
      };

      res.render('pages/assignments/chatroom/password-helper', param)
      res.end();
      return;
    }

    console.log(`redirecting to chat room`);

    res.redirect(`/chat?roomid=${req.query.submit}&room=${name}&username=${req.session.username}&userid=${req.session.userid}`);
    res.end();
  });
}

function loadChat(req, res) {
  // check to see if we are logged in or not
  if (!req.session.username || !req.session.userid) {
    console.log('Redirecting to the login');

    res.redirect('/chat-login');
    res.end();
    return;
  }

  console.log(`roomid=${req.query.roomid}`);
  roomid = req.query.roomid;
  console.log(`room=${req.query.room}`);
  room = req.query.room;
  console.log(`username=${req.query.username}`);
  username = req.query.username;
  console.log(`userid=${req.query.userid}`);
  userid = req.query.userid;

  var param = {
    roomid: roomid,
    room: room,
    username: username,
    userid: userid
  };
  
  res.render('pages/assignments/chatroom/chat', param);
  res.end();
}

//* Functions
function createUser(res, req, username, password) {
  createUserAsync(username, password, function (error) {
    if (error) {
      var param = {
        message: error
      };

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    checkUser(res, req, username, password);
  });
}

function createUserAsync(username, password, callback) {
  const sql = "INSERT INTO users (user_name, user_password) VALUES ($1, $2)";

  var hash = bcrypt.hashSync(password, salt);

  const params = [username, hash];
  
  pool.query(sql, params, function(err, results) {
    if (err) {
      console.log('Username has already been taken. Please choose another.');
      console.log(err);

      callback("Username has already been taken. Please choose another.");
      return;
    }

    // log that we created the user.
    console.log('Created: ' + username + " " + password);
    callback(null);
    return;
  })
}

function checkUser(res, req, username, password) {
  checkUserAsync(username, function (error, data) {
    if (error || data == null) {
      var param = {
        message: error
      };

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    // check to see that we got a row back
    if (data.length != 1) {
      console.log('No returned results');
      var param = {
        message: "Incorrect Username/Password"
      };

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    // we have returned results to look through

    console.log("Data: " + data[0].user_password);
    console.log("Data: " + data[0].user_id);

    // check that the password provided matches the one in the database
    if (!bcrypt.compareSync(password, data[0].user_password)) {
      console.log(password + " != " + data[0].user_password);
      var param = {
        message: "Incorrect Username/Password"
      };

      res.render('pages/assignments/chatroom/chat-login', param)
      res.end();
      return;
    }

    // we only want to move on if we have passed each check
    req.session.username = username;
    req.session.password = password;
    req.session.userid = data[0].user_id;
    req.session.save();

    res.redirect('/chat-rooms')
    res.end();
    return; 
  });
}

function checkUserAsync(username, callback) {
  const sql = "SELECT user_password, user_id FROM users WHERE user_name = $1";
  const params = [username];

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

function refreshRooms(req, res) {
  console.log(`received a GET request for /refresh-rooms`);

  const sql = `
SELECT 
  r.room_id
, r.room_name
, u.user_name
, r.room_password 
FROM room r 
LEFT JOIN users u ON (r.user_id = u.user_id) 
ORDER BY r.room_id`;

  queryAsync(sql, [], function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err).end();
      return;
    }

    // format the results into the html table structure
    var html_text = roomHTML(data);

    // send the html back to the xhttp request
    res.status(200).send(html_text).end();
  });
  
}

function searchRooms(req, res) {
  console.log(`received a GET request for /search-rooms with: ${req.query.searchName}`);

  const params = [`%${req.query.searchName}%`];

  const sql = `
  SELECT 
  r.room_id
, r.room_name
, u.user_name
, r.room_password 
FROM room r 
LEFT JOIN users u ON (r.user_id = u.user_id)
WHERE r.room_name ILIKE $1::text
ORDER BY r.room_id`;

  queryAsync(sql, params, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err).end();
      return;
    }

    // format the results into the html table structure
    var html_text = roomHTML(data);

    // send the html back to the xhttp request
    res.status(200).send(html_text).end();
  });
  
}

function createRoom(req, res) {
  console.log(`received a POST request for /create-rooms with ${req.body.roomName}:${req.body.roomPass}`);

  var userid = req.session.userid;
  var roomName = req.body.roomName;
  var roomPass = req.body.roomPass;
  var hash = '';

  // hash the entered password
  if (roomPass != '') {
    hash = bcrypt.hashSync(roomPass, salt);
  } else {
    hash = roomPass;
  }

  // set up our query to insert the record into our table
  var sql = `
  INSERT INTO room (user_id, room_created, room_name, room_password)
  VALUES ($1, NOW(), $2, $3)`;

  const params = [userid, roomName, hash];
  
  pool.query(sql, params, function(err, results) {
    if (err) {
      console.log('Error in query: ');
      console.log(err);

      res.status(200).send("There was an issue adding the room").end();
      return;
    }
    console.log("added new room");

    res.status(200).send().end();
    return;
  });

}

function queryAsync(sql, params, callback) {
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

function roomHTML(data) {
  var html_text = '';

  data.forEach((obj, index)  => {
    console.log(obj);

    var name = obj['room_name'];
    var creator = obj['user_name'];
    var password = obj['room_password'];
    var id = obj['room_id'];

    html_text += `
    <tr>
      <td width="40%">
          <p>${name}</p>
      </td>
      <td width="30%">
          <p>${creator}</p>
      </td>
      <td width="10%">`;

    if (password !== '') {
      html_text += `
        <img src="/img/lock.png" alt="L" width="25px">`;
    }

    html_text += `
      </td>
      <td width="20%">
        <button type="submit" class="btn btn-success btn-sm btn-block" name="submit[]" value="${id}">Join</button>
      </td>
    </tr>`;

  });

  return html_text;
}

function refreshChat(req, res) {
  console.log(`received a GET request for /chat-refresh with ${req.query.id}`);

  // set up our query to insert the record into our table
  var sql = `
  SELECT 
  m.message
, m.message_created
, u.user_name 
FROM message m 
LEFT JOIN users u ON (m.user_id = u.user_id) 
WHERE room_id=$1
ORDER BY message_created ASC`;

  const params = [req.query.id];
  
  pool.query(sql, params, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err).end();
      return;
    }

    // format the results into the html table structure
    var html_text = messageHTML(data.rows);

    // send the html back to the xhttp request
    res.status(200).send(html_text).end();
  });
}

function messageHTML(data) {
  var html_text = '';

  console.log(data);

  data.forEach((obj, index)  => {
    console.log(obj);

    var user = obj['user_name'];
    var messageCreated = obj['message_created'];
    var message = obj['message'];

    html_text += `
    <tr>
      <td width="30%">
        <p><b>${user}: </b></p>
        <p>${messageCreated}</p>
      </td>
      <td width="70%">
        <p>"${message}"</p>
      </td>
    </tr>`;
  });

  return html_text;
}

function postChat(req, res) {
  console.log(`received a POST request for /chat-send with ${req.body.id}:${req.body.message}`);

  var userid = req.session.userid;
  var roomid = req.body.id;
  var message = req.body.message;

  // set up our query to insert the record into our table
  var sql = `
INSERT INTO message (user_id, room_id, message, message_created)
VALUES ($1, $2, $3, NOW())`;

  const params = [userid, roomid, message];
  
  pool.query(sql, params, function(err, results) {
    if (err) {
      console.log('Error in query: ');
      console.log(err);

      res.status(200).send("There was an issue adding the message").end();
      return;
    }
    console.log("added new message");

    res.status(200).send().end();
    return;
  });
}

module.exports = {
  loadHome: loadHome,
  checkLogin: checkLogin,
  loadChatrooms: loadChatrooms,
  refresh: refreshRooms,
  search: searchRooms,
  create: createRoom,
  check: loadChatPassword,
  checkChatPassword: checkChatPassword,
  loadChat: loadChat,
  refreshChat: refreshChat,
  postChat: postChat
};