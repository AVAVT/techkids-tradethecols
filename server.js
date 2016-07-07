var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname));

var allTanks = [];
var tankById = function(id, killOnSight){
  for(var i=0;i<allTanks.length;i++){
    if(allTanks[i].id == id){
      return killOnSight ? allTanks.splice(i, 1)[0] : allTanks[i];
    }
  }

  return null;
}

function compare(a,b) {
  if (a.score < b.score)
    return 1;
  if (a.score > b.score)
    return -1;
  return 0;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket){
  console.log('user connected');
  
  socket.on('login', function(msg){
    var response = {
      score: 0,
      username : msg,
      position : {
        x : Math.random()*3200,
        y : Math.random()*600,
      },
      id : socket.id,
      enemies : allTanks.slice()
    }
    response.top3 = allTanks.slice(0,3);
    socket.emit('connected', response);
    socket.broadcast.emit('newPlayerJoined', response);
    
    response.top3 = undefined;
    delete response.enemies;
  
    allTanks.push(response);
  });
  
  socket.on('tankMove', function(msg){
    var tank = tankById(socket.id);
    if(tank){
      tank.position.x = msg.position.x;
      tank.position.y = msg.position.y;
    }
    
    socket.broadcast.emit('tankMoved', msg);
  });

  socket.on('tankFire', function(msg){
    socket.broadcast.emit('tankFired', msg);
  });

  socket.on('tankDie', function(msg){
    var killer = tankById(msg.killerId);
    killer.score += 1;
    allTanks.sort(compare);
    msg.top3 = allTanks.slice(0,3);
    socket.broadcast.emit('tankDied', msg);
  });
  
  socket.on('playerAfk', function(msg){
    socket.broadcast.emit('playerAfk', msg);
    var player = tankById(msg.id);
    if(player) player.afk = true;
  });
  
  socket.on('playerReturn', function(msg){
    socket.broadcast.emit('playerReturn', msg);
    var player = tankById(msg.id);
    if(player) player.afk = false;
  });

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.id);
    if(tankById(socket.id, true)){
      socket.broadcast.emit('playerDisconnected', {id : socket.id});
    }
  });
});

http.listen(8080, function(){
  console.log('Server started. Listening on *:8080');
});
