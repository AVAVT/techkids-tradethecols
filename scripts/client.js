class SocketClient {
  constructor(){
    var that = this;

    this.socket = io();
    this.socket.on('connected', function(msg){
      TankOnline.onConnected(msg);
      that.id = msg.id;
    });

    this.socket.on('tankMoved', function(msg){
      console.log(msg.direction);
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
  die(position){
    var theId = this.id;
    this.socket.emit('tankDie', {
      id: theId,
      position: position
    });
  }
}
