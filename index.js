var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'jade');
app.set('views', __dirname);

app.get('/room/:room', function(req, res) {
  var nameOfRoom = req.param('room');
  res.render('index', {
    nameOfRoom: nameOfRoom
  });
});

var usernames = {};

var rooms = {};

io.sockets.on('connection', function(socket) {
  socket.on('addUser', function(username, firstRoom) {
    socket.username = username;
    socket.room = firstRoom;
    rooms[firstRoom] = firstRoom;
    usernames[username] = username;

    socket.join(firstRoom);

    socket.emit('updatechat', 'SERVER', ' you have connected to ' + firstRoom);

    socket.broadcast.to(firstRoom).emit('updatechat', 'SERVER', username + ' has connected to this room');

    socket.emit('updaterooms', rooms, '' + firstRoom);
  });

  socket.on('sendchat', function(data) {

    io.sockets.in(socket.room).emit('updfgdatechat', socket.username, data);
  });

  socket.on('switchRoom', function(newroom) {
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);

    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room');

    socket.room = newroom;
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
    socket.emit('updaterooms', rooms, newroom);
  });

  socket.on('disconnect', function() {
    //delete usernames[socket.username];

    //io.sockets.emit('updateusers', usernames);

    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });
});
http.listen(3000, function() {
  console.log('listening on *:3000');
});
