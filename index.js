
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./helpers/formatDate');
var mysql = require('mysql');
var bodyParser = require("body-parser");

const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers
} = require('./helpers/userHelper');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// this block will run when the client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room, email,createdAt, updatedAt}) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    var sql = `INSERT INTO user 
            (
                userName, email, room, createdAt, updatedAt
            )
            VALUES
            (
                ?, ?, ?, ?, ?
            )`;
connection.query(sql, [username , email, room, createdAt, updatedAt], function (err, data) {
    if (err) {
    console.log("some error occured");
    } else {
      console.log("successfully inserted into db");
         
    }
});

    // General welcome
    socket.emit('message', formatMessage("Lokesh Chat Box", 'Messages are limited to this room! '));

    // Broadcast everytime users connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage("Lokesh Chat Box", `${user.username} has joined the room`)
      );

    // Current active users and room name
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });

  // Listen for client message
  socket.on('chatMessage', msg => {
    const user = getActiveUser(socket.id);
    const username = user.username;
    var createdAt = new Date();
    var updatedAt = new Date();
  
    var sql = `INSERT INTO chat
            (
                userName, message, createdAt, updatedAt
            )
            VALUES
            (
                ?, ?, ?, ?
            )`;
connection.query(sql, [username , msg, createdAt, updatedAt], function (err, data) {
    if (err) {
    console.log("some error occured");
    } else {
      console.log("successfully inserted message into db");
         
    }
});
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("Lokesh Chat Box", `${user.username} has left the room`)
      );

      // Current active users and room name
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      });
    }
  });
});

var connection = mysql.createConnection({
  host: "localhost",
  user:"root1",
  password:"",
  database:"mydb"
});

connection.connect(function(error){
  if(error){
      console.log("Error while connecting to database")
  }
  else{

       console.log("connected");

}});

app.use( express.static( "public" ) );
app.use( express.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.post("/newuser", (req, res)=> {
  // get data from forms and add to the table called user..
  console.log(req);
  var email = req.body.email;
  var userName = req.body.userName;
 
  console.log(email);
  console.log(userName);


//   connection.query("INSERT INTO user (email, userName, room) VALUES", (email, userName, room), function (err, result) {
//   if (err) throw err;
//   console.log("1 record inserted");
// });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));