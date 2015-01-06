var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket) {


  socket.on('chat message', function(msg, cb) {
    //  socket.room = 'Hello';
    //  socket.join('Hello');
    console.log('message: ' + msg);
    socket.broadcast.emit('chat message', msg);
    cb('123');
  });



  // socket.on('chat message', function(msg) {
  //   socket.join('helloworld');
  //   console.log('message: ' + msg);
  //   socket.to('helloworld').emit('chat message', msg);
  //   //io.emit('chat message', msg);
  // });
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});
