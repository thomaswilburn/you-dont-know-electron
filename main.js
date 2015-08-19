var app = require("app");
var BrowserWindow = require("browser-window");
var ip = require("ip");
var ipc = require("ipc");
var WSServer = require("ws").Server;

//the server module starts the Hapi server to bootstrap the UI
require("./server");

var players = [];

var host = {
  waiting: true,
  index: -1,
  questions: require("./questions.json"),
  ip: ip.address()
};

//we have to wait for the app to be ready, so we can use IPC properly
app.on("ready", function() {
  
  //open the host window for the main UI
  var window = new BrowserWindow({ width: 800, height: 800 });
  window.loadUrl("file://" + __dirname + "/host.html");
  
  // window.openDevTools();

  //when we update the host UI, it's pretty much just a dump of raw state
  var update = function() {
    window.webContents.send("update", {
      players: players,
      state: host
    });
  };
  window.webContents.on("did-finish-load", update);

  //when we get a message from a client, update the game accordingly
  var onSocket = function(packet, flags) {
    var msg = JSON.parse(packet);
    var self = this;
    
    switch (msg.type) {
      //this lets players change their display name
      case "rename":
        this.name = msg.data
        break;

      //when an answer comes in...
      case "answer":
        //check against the right answer...
        var question = host.questions[host.index];
        var answer = question.answers.filter(function(a) { return a.correct }).pop();
        var correct = msg.data == answer.text;
        if (correct) {
          //advance the score and broadcast a message to all other clients so they can't buzz in
          host.answered = self.name;
          self.score++;
          players.forEach(function(player) {
            player.send("state", player == self ? "correct" : "closed");
          });
        } else {
          //otherwise, tell the client they were wrong
          self.send("state", "wrong");
        }
        break;
    }
    //after all messages, update the main UI just be safe
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
    
    //TODO: there's currently no limit on players, and we don't stop people from joining late
    players.push(player);
    console.log("A new player has appeared! %s players connected", players.length);
    update();

    //bind to the player object when handling messages    
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

  //"next" actually triggers next question AND starts the quiz initially
  ipc.on("next", function() {
    host.waiting = false;
    nextQuestion();
  });

});