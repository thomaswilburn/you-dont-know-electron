require("angular");

var app = angular.module("ydke", []);

app.controller("buzzer", ["$scope", "$http", function($scope, $http) {

  var socket;

  $scope.send = function(type, data) {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: type,
      data: data
    }));
  };

  $scope.name = "Anonymous";
  $scope.$watch("name", function() {
    $scope.send("rename", $scope.name);
  });
  
  $http.get("/ip").then(function(response) {

    socket = new WebSocket("ws://" + response.data + ":1981");
    
    socket.addEventListener("message", function(event) {
      var msg = JSON.parse(event.data);
      
      console.log(msg);
      
      switch (msg.type) {
        case "question":
          $scope.question = msg.data;
          break;
        case "state":
          $scope.question = null;
          $scope.state = msg.data
          break;
        case "reset":
          $scope.question = null;
          $scope.state = null;
          break;
      }
      
      $scope.$apply();
    });

  })
  
}]);