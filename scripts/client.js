require("angular");
var host = require("./host");

var app = angular.module("ydke", []);

var socket = new WebSocket("ws://localhost:1981");

app.controller("buzzer", ["$scope", function($scope) {
  
  $scope.send = function(type, data) {
    socket.send(JSON.stringify({
      type: type,
      data: data
    }));
  };
  
  socket.addEventListener("message", function(event) {
    var msg = JSON.parse(event.data);
    
    console.log(msg);
    
    switch (msg.type) {
      case "question":
        $scope.question = msg.data;
        break;
      case "result":
        $scope.question = null;
        $scope.correct = msg.data ? "yes" : "no";
        break;
      case "reset":
        $scope.question = null;
        $scope.correct = null;
        break;
    }
    
    $scope.$apply();
  });
  
}]);