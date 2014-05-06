var app = angular.module('portfolioApp', ["firebase"]);

app.factory('Items', function($firebase) {
	var itemsService = {};
  var REF = new Firebase("https://burning-fire-6770.firebaseio.com/");

	itemsService.getAll = function() {
     return $firebase(REF)
  };

  itemsService.add = function($title, $desc) {
    REF.push({title: $title, desc: $desc});
  }

  return itemsService;
});

app.controller('MainCtrl', function ($scope, Items) {
    // Initialize item object
    $scope.item = {};

    // hide the input form by default
    $scope.inputFormVisible = false;

    $scope.items = Items.getAll();

    $scope.createItem = function() {
      Items.add($scope.item.title, $scope.item.desc)
      $scope.inputFormVisible = false;
      $scope.item = {};
    };
  });
