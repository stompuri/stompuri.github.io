var app = angular.module('portfolioControllers', ["firebase"]);
/* CONSTANTS: */
app.constant('FIREBASE', {
  url: "https://burning-fire-6770.firebaseio.com/"
})

/* SERVICES: */
app.factory('LoginService',
  function(FIREBASE, $firebaseSimpleLogin) {
    var REF = new Firebase(FIREBASE.url);
    return $firebaseSimpleLogin(REF);
  }
);

app.factory('AboutService',
  function(FIREBASE, $firebase) {
    var REF = new Firebase(FIREBASE.url + 'about/');
    return $firebase(REF);
  }
);

app.factory('ContactService',
  function(FIREBASE, $firebase) {
    var REF = new Firebase(FIREBASE.url + 'contact/');
    return $firebase(REF);
  }
);

app.factory('ItemsService',
  function(FIREBASE, $firebase) {
    var REF = new Firebase(FIREBASE.url + 'items/');
    return $firebase(REF);
  }
);

/* COMMUNICATION between controllers: */
app.factory('FlashService', function() {
  return {message: null};
});

app.factory('MenuService', function() {
  return 'about';
});

/* DIRECTIVES: */
app.directive('stflash', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      message:'='
    },
    templateUrl: 'views/flash.html',
    link: function(scope, element, attrs) {
      if(attrs['type'] != undefined) {
        element.addClass('alert-' + attrs['type']);
      } else {
        element.addClass('alert-success');
      }
    }
  };
});

app.directive('stitem', ['ItemsService',
  function(firebaseRef) {
    return {
      restrict: 'E',
      templateUrl: 'views/item.html'
    };
  }
]);

app.directive('stfileinput', ['FIREBASE',
  function(FIREBASE) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/fileinput.html',
      link: function($scope, element, attrs) {
        var control = document.getElementById("file-upload");
        control.addEventListener('change', function(event) {
          var f = event.target.files[0];
          var reader = new FileReader();
          $scope.upload = '';

          reader.onload = ( function(theFile, $scope) {
            return function(e) {
              var filePayload = e.target.result;
              // Generate a location that can't be guessed using the file's contents and a random number
              var hash = CryptoJS.SHA256(Math.random() + CryptoJS.SHA256(filePayload));
              var f = new Firebase(FIREBASE.url + 'pano/' + hash + '/filePayload');
              //spinner.spin(document.getElementById('spin'));
              // Set the file payload to Firebase and register an onComplete handler to stop the spinner and show the preview
              f.set(filePayload, function() {
                // Update img src if such found
                if(document.getElementById("pano")) {
                  document.getElementById("pano").src = e.target.result;
                }
                $scope.upload = e.target.result;
              });
            };
          })(f, $scope);
          reader.readAsDataURL(f);
        });
      }
    }
  }
]);

app.directive('stinput', ['ItemsService',
  function(firebaseRef) {
    return {
      restrict: 'E',
      templateUrl: 'views/inputform.html'
    }
  }
]);

/* CONTROLLERS: */
app.controller('MainCtrl', ['$scope', 'FlashService', 'AboutService', 'MenuService',
  function ($scope, flashService, aboutService, menuService) {
    $scope.selected = menuService;
    $scope.flash = flashService;
    $scope.about = aboutService;

    $scope.select = function(item) {
      $scope.flash.message = null;
      $scope.selected = item;
    };
  }
]);

app.controller('AboutCtrl',
  ['LoginService', 'AboutService', 'FlashService', '$scope', '$routeParams',
  function(loginService, aboutService, flashService, $scope, $routeParams) {
    $scope.flash = flashService; // Get ref to flash message
    $scope.about = aboutService; // Get ref to about info
    $scope.loginObj = loginService; // Get ref to login info

    $scope.save = function () {
      // Create & add the item defined by the input form
      $scope.about.$set({
        prefix: $scope.about.prefix,
        name: $scope.about.name,
        text: $scope.about.text,
        link: $scope.about.link,
        imgUrl: $scope.upload
      });

      // Define the flash pop-up
      $scope.flash.message = "About info edited!";
    };
  }
]);

app.controller('ContactCtrl', ['LoginService', '$scope', '$routeParams', 'AboutService', 'ContactService', 'FlashService',
  function(loginService, $scope, $routeParams, aboutService, contactService, flashService) {
    $scope.flash = flashService; // Get ref to flash message
    $scope.about = aboutService; // Get ref to about info
    $scope.contact = contactService; // Get ref to contact info
    $scope.loginObj = loginService; // Get ref to login info

    $scope.save = function () {
      // Create & add the item defined by the input form
      $scope.contact.$set({
        email: $scope.contact.email,
        address: $scope.contact.address,
        phone: $scope.contact.phone
      });

      // Define the flash pop-up
      $scope.flash.message = "Contact info edited!";
    };
  }
]);

app.controller('PortfolioCtrl',
  ['$scope', '$routeParams', 'ItemsService', 'LoginService', 'FlashService',// 'FileUploadService',
  function($scope, $routeParams, firebaseService, loginService, flashService) {
    // Initialize item object
    $scope.item = {};
    $scope.flash = flashService;
    //var spinner = new Spinner({color: '#ddd'});

    // Get login object
    $scope.loginObj = loginService;

    // hide the input form by default
    $scope.inputFormVisible = false;

    // Define the portfolio items:
    // Get all items
    $scope.items = firebaseService;

    // Add new item
    $scope.addItem = function() {
      $scope.items.$add({
        title: $scope.item.title,
        platform: $scope.item.platform,
        year: $scope.item.year,
        loc: $scope.item.loc,
        desc: $scope.item.desc,
        link: $scope.item.link,
        imgUrl: $scope.upload});

      // Define the flash pop-up
      $scope.flash.message = "A new portfolio item '" + $scope.item.title + "' added!";
      // Clear & hide the input form
      $scope.inputFormVisible = false;
      $scope.item = {};
    };

    $scope.deleteItem = function(key) {
      $scope.items.$remove(key);
    };

    $scope.openNewForm = function() {
      $scope.inputFormVisible = !$scope.inputFormVisible;
    };

  }
]);

app.controller('AuthCtrl', ['$scope', 'LoginService', 'FlashService',
  function($scope, loginService, flashService) {
    // Get login object
    $scope.loginObj = loginService;
    $scope.flash = flashService;

    // Initialize empty user object
    $scope.user = {};

    $scope.loginUser = function() {
      if(!$scope.loginObj.user) {
        $scope.loginObj.$login('password', {
          email: $scope.user.email,
          password: $scope.user.password
        }).then(function(user) {
          console.log('Logged in as: ', user.uid);
          console.log("loginUser flash=", $scope.flash);
          // Define the flash pop-up
          $scope.flash.message = "Logged in as '" + $scope.loginObj.user.email + "!";
          //console.log("loginUser flash.after=", $scope.flash);
          // Empty fields
          $scope.user.email = '';
          $scope.user.password = '';
          $scope.user = {};
        }, function(error) {
          console.error('Login failed: ', error);
        });
      }
    }

    $scope.logOut = function() {
      alert($scope.loginObj)
      $scope.loginObj.$logout();
      $scope.selected = menuService;
      $scope.selected = 'about';
    }

    $scope.addUser = function() {
      $scope.loginObj.$createUser($scope.user.email, $scope.user.password);
      console.log('Added user: ', $scope.user.email, ' & ', $scope.user.password);
    }
  }
]);