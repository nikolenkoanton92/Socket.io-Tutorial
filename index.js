var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var usernames = {};

var rooms = ['sublime', 'atom', 'react'];

io.sockets.on('connection', function(socket) {
  socket.on('addUser', function(username) {
    socket.username = username;

    socket.room = 'sublime';
    usernames[username] = username;

    socket.join('sublime');

    socket.emit('updatechat', 'SERVER', 'you have connected to sublime');

    socket.broadcast.to('sublime').emit('updatechat', 'SERVER', username + 'has connected to this room');

    socket.emit('updaterooms', rooms, 'sublime');
  });

  socket.on('sendchat', function(data) {

    io.sockets.in(socket.room).emit('updatechat', socket.username, data);
  });

  socket.on('switchRoom', function(newroom) {
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);

    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + 'has left this room');

    socket.room = newroom;
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
    socket.emit('updaterooms', rooms, newroom);
  });

  socket.on('disconnect', function() {
    delete usernames[socket.username];

    io.sockets.emit('updateusers', usernames);

    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});
http.listen(3000, function() {
  console.log('listening on *:3000');
});

// io.on('connection', function(socket) {
//   socket.on('chat message', function(msg) {
//     console.log('message: ' + msg);
//   });
//   console.log('a user connected');
//   socket.on('disconnect', function() {
//     console.log('user disconnected');
//   });
// });
