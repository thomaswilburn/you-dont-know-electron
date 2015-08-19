var app = require("app");
var BrowserWindow = require("browser-window");
var ipc = require("ipc");

var WSServer = require("ws").Server;

require("./server");

var ip = require("ip");

var players = [];

var host = {
  waiting: true,
  index: -1,
  questions: require("./questions.json"),
  ip: ip.address()
};

app.on("ready", function() {
  var window = new BrowserWindow({ width: 800, height: 800 });
  window.loadUrl("file://" + __dirname + "/host.html");
  // window.openDevTools();
  var update = function() {
    window.webContents.send("update", {
      players: players,
      state: host
    });
  };
  window.webContents.on("did-finish-load", update);

  var onSocket = function(packet, flags) {
    var msg = JSON.parse(packet);
    var self = this;
    
    switch (msg.type) {
      case "rename":
        this.name = msg.data
        break;
      case "answer":
        var question = host.questions[host.index];
        var answer = question.answers.filter(function(a) { return a.correct }).pop();
        var correct = msg.data == answer.text;
        if (correct) {
          host.answered = self.name;
          self.score++;
          players.forEach(function(player) {
            player.send("state", player == self ? "correct" : "closed");
          });
        } else {
          self.send("state", "wrong");
        }
        update();
        break;
    }
    update();
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
    update();

    console.log("A new player has appeared! %s players connected", players.length);
    
    sock.on("message", onSocket.bind(player));
    
  });

  var nextQuestion = function() {
    host.index++;
    var item = host.questions[host.index];
    host.text = item ? item.question : "Game over!";
    host.answered = null;
    update();
    players.forEach(function(player) {
      player.send("question", host.questions[host.index]);
    });
  }

  ipc.on("next", function() {
    host.waiting = false;
    nextQuestion();
  });

});