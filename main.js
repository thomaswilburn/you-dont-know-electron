// var app = require("app");
// var BrowserWindow = require("browser-window");
// var ipc = require("ipc");

var WSServer = require("ws").Server;

var client = require("./server");

var players = [];

var onMessage = function(msg, flags) {
  var data = JSON.parse(msg);
  console.log(data);
};

var socket = new WSServer({ port: 1981 });
socket.on("connection", function(sock) {
  var player = {
    name: "Anonymous",
    connection: sock,
    score: 0,
    send: function(type, data) {
      var msg = JSON.stringify({
        type: type,
        data: data
      });
      sock.send(msg);
    }
  };
  
  players.push(player);
  
  sock.on("message", onMessage.bind(player));
  
});