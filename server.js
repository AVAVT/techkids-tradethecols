var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname));

var allTanks = [];
var tankById = function(id, killOnSight){
  for(var i=0;i<allTanks.length;i++){
    if(allTanks[i].id == id){
      var result = allTanks[i];
      if(killOnSight) allTanks.splice(i, 1);
      return result;
    }
  }

  return null;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket){
  console.log('user connected');
  var response = {
    position : {
      x : Math.random()*3200,
      y : Math.random()*600,
    },
    id : socket.id,
    enemies : allTanks.slice()
  }

  socket.emit('connected', response);
  socket.broadcast.emit('newPlayerJoined', response);
  delete response.enemies;

  allTanks.push(response);

  socket.on('tankMove', function(msg){
    var tank = tankById(socket.id);
    tank.position.x = msg.position.x;
    tank.position.y = msg.position.y;
    socket.broadcast.emit('tankMoved', msg);
  });

  socket.on('tankFire', function(msg){
    socket.broadcast.emit('tankFired', msg);
  });

  socket.on('tankDie', function(msg){
    socket.broadcast.emit('tankDied', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.id);
    if(tankById(socket.id, true)){
      socket.broadcast.emit('playerDisconnected', {id : socket.id});
    }
  });
});

http.listen(6969, function(){
  console.log('Server started. Listening on *:6969');
});
