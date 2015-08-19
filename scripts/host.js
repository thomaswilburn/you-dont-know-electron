var ipc = window.require("ipc");
require("angular");

var app = angular.module("ydke", []);

app.controller("host", ["$scope", function($scope) {

  ipc.on("update", function(data) {
    
    // console.log(data);

    //when new state comes in, stomp the existing object and update UI
    //it's a very dumb client model
    if (typeof data == "string") data = JSON.parse(data);
    for (var k in data) $scope[k] = data[k];

    $scope.$apply();
  });

  $scope.next = function() {
    ipc.send("next");
  }

}]);