class SocketClient {
  constructor(username){
    var that = this;

    this.socket = io();
    this.socket.emit('login', username);
    
    this.socket.on('connected', function(msg){
      TankOnline.onConnected(msg);
      setInterval(function(){that.ping();}, 500);
      that.id = msg.id;
    });
    
    this.socket.on('loggedIn', function(msg){
      TankOnline.onLoggedIn(msg);
    });
    
    this.socket.on('tankMoved', function(msg){
      TankOnline.onPlayerMoved(msg);
    });

    this.socket.on('tankFired', function(msg){
      TankOnline.onPlayerFired(msg);
    });

    this.socket.on('tankDied', function(msg){
      TankOnline.onPlayerDied(msg);
    });

    this.socket.on('newPlayerJoined', function(msg){
      TankOnline.onNewPlayerJoined(msg);
    });

    this.socket.on('playerDisconnected', function(msg){
      console.log('Player disconnected: '+ msg.id);
      TankOnline.onPlayerDisconnected(msg);
    });
    
    this.socket.on('playerAfk', function(msg){
      TankOnline.onPlayerAFK(msg);
    });
    
    this.socket.on('playerReturn', function(msg){
      TankOnline.onPlayerReturn(msg);
    });
    
    this.socket.on('aPong', function(msg){
      TankOnline.reportLatency(msg);
    });
  }

  fire(position, direction){
    var theId = this.id;
    this.socket.emit('tankFire', {
      id: theId,
      position: position,
      direction: direction
    });
  }
  move(position, direction){
    var theId = this.id;
    this.socket.emit('tankMove', {
      id: theId,
      position: position,
      direction: direction
    });
  }
  die(killer){
    var theId = this.id;
    this.socket.emit('tankDie', {
      id: theId,
      killerId: killer
    });
  }
  
  playerAfk(){
    var theId = this.id;
    this.socket.emit('playerAfk', {
      id: theId
    });
  }
  playerReturn(){
    var theId = this.id;
    this.socket.emit('playerReturn', {
      id: theId
    });
  }
  
  ping(){
    this.socket.emit('aPing', TankOnline.game.time.now);
  }
}
