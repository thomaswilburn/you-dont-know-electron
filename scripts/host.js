var ipc = window.require("ipc");
require("angular");

var app = angular.module("ydke", []);

app.controller("host", ["$scope", function($scope) {

  ipc.on("update", function(data) {
    
    // console.log(data);

    if (typeof data == "string") data = JSON.parse(data);
    for (var k in data) $scope[k] = data[k];

    $scope.$apply();
  });

  $scope.next = function() {
    ipc.send("next");
  }

}]);