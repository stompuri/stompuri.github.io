var app = angular.module('portfolioControllers', ["firebase", "ngAnimate"]);
/* FILTERS */
// Filter portfolio items by text
app.filter('listToArray', function() {
  return function(items, searchText) {
    var filtered = [];
    angular.forEach(items, function(item) {
      if(typeof(item) != "function" && item != "items") {
        if(searchText) {
          if(
            item.title.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
            item.platform.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
            item.desc.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
            item.lang.toLowerCase().indexOf(searchText.toLowerCase()) > -1
          ){
            filtered.push(item);
          }
        } else {
          filtered.push(item);
        }
        
      }
    });

    return filtered;
  };
});

/* CONSTANTS: */
app.constant('FIREBASE', {
  url: "https://burning-fire-6770.firebaseio.com/"
});

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

app.factory('PhotoService',
  function(FIREBASE, $firebase) {
    var REF = new Firebase(FIREBASE.url + 'pano/');
    return $firebase(REF);
  }
);

app.factory('FileService',
  function(FIREBASE, $firebase) {
    var REF = new Firebase(FIREBASE.url + 'file/');
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

app.factory('PhotoUploadService', function() {
  return {url: null, hash: null};
});

app.factory('FileUploadService', function() {
  return {url: null, hash: null};
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
      restrict: 'E',/*
      transclude: true,
      replace: true,*/
      templateUrl: 'views/item.html'
    };
  }
]);

app.directive('stphotoinput', ['FIREBASE', 'PhotoUploadService',
  function(FIREBASE, uploadService) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        target: '@target',
        accept: '@accept'
      },
      templateUrl: 'views/fileinput.html',
      link: function($scope, element, attrs) {
        element.bind('change', function(event) {
          var f = event.target.files[0];
          var reader = new FileReader();
          $scope.upload = uploadService;
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
                if(document.getElementById("pano-" + attrs['target'])) {
                  document.getElementById("pano-" + attrs['target']).src = e.target.result;
                }
                $scope.upload.url = e.target.result;
                $scope.upload.hash = hash + '/filePayload';
              });
            };
          })(f, $scope);
          reader.readAsDataURL(f);
        });
      }
    }
  }
]);

app.directive('stfileinput', ['FIREBASE', 'FileUploadService',
  function(FIREBASE, uploadService) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        target: '@target',
        accept: '@accept'
      },
      templateUrl: 'views/fileinput.html',
      link: function($scope, element, attrs) {
        element.bind('change', function(event) {
          var f = event.target.files[0];
          var reader = new FileReader();
          $scope.upload = uploadService;
          reader.onload = ( function(theFile, $scope) {
            return function(e) {
              var filePayload = e.target.result;
              // Generate a location that can't be guessed using the file's contents and a random number
              var hash = CryptoJS.SHA256(Math.random() + CryptoJS.SHA256(filePayload));
              var f = new Firebase(FIREBASE.url + 'file/' + hash + '/filePayload');
              //spinner.spin(document.getElementById('spin'));
              // Set the file payload to Firebase and register an onComplete handler to stop the spinner and show the preview
              f.set(filePayload, function() {
                // Update img src if such found
                if(document.getElementById("file-" + attrs['target'])) {
                  document.getElementById("file-" + attrs['target']).src = e.target.result;
                }
                $scope.upload.url = e.target.result;
                $scope.upload.hash = hash + '/filePayload';
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
  ['LoginService',
   'AboutService', 
   'FlashService', 
   '$scope', 
   '$routeParams', 
   'PhotoUploadService',
   'FileUploadService', 
   'PhotoService', 
   'MenuService',
  function(loginService, 
           aboutService, 
           flashService, 
           $scope, 
           $routeParams, 
           uploadService,
           fileUploadService,
           photoService,
           menuService
           ) {
    $scope.flash = flashService; // Get ref to flash message
    $scope.about = aboutService; // Get ref to about info
    $scope.loginObj = loginService; // Get ref to login info
    $scope.upload = uploadService; // Get ref to file upload
    $scope.selected = menuService; // Get handle to menu selection
    $scope.selected = 'about'; // Make sure the selection is in 'about'
    $scope.pageClass = 'page-about';
    $scope.contentLoaded = false;

    $scope.about.$on("loaded", function() {
      $scope.contentLoaded = true;
    });

    $scope.save = function () {
      // Delete old image if such exists and we are pushing a new one
      if($scope.about.hash && $scope.upload.hash) {
        $scope.photos = photoService;
        $scope.photos.$remove(about.hash);
      }

      // Set about to point to the new photo (if such exists)
      if($scope.upload.hash) {
        $scope.about.imgUrl = $scope.upload.url;
        $scope.about.hash = $scope.upload.hash;
      }

      // Save the changes
      $scope.about.$save();

      // Define the flash pop-up
      $scope.flash.message = "About info edited!";
    };
  }
]);

app.controller('ContactCtrl',
  ['LoginService', 
   '$scope', 
   '$routeParams', 
   'AboutService', 
   'ContactService', 
   'FlashService',
   'MenuService',
  function(loginService, 
           $scope, 
           $routeParams, 
           aboutService, 
           contactService, 
           flashService,
           menuService
           ) {
    $scope.flash = flashService; // Get ref to flash message
    $scope.about = aboutService; // Get ref to about info
    $scope.contact = contactService; // Get ref to contact info
    $scope.loginObj = loginService; // Get ref to login info
    $scope.selected = menuService; // Get handle to menu selection
    $scope.selected = 'contact'; // Make sure the selection is in 'about'
    $scope.pageClass = 'page-contact';
    
    $scope.contentLoaded = false;

    $scope.about.$on("loaded", function() {
      $scope.contentLoaded = true;
    });

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

app.controller('DebugCtrl',
  ['$scope', '$routeParams', 'FlashService',
  function($scope, $routeParams, flashService) {
    alert(1);
  }
]);

app.controller('PortfolioCtrl',
  ['$scope', 
   '$routeParams', 
   'ItemsService', 
   'LoginService', 
   'FlashService', 
   'FIREBASE', 
   'PhotoUploadService', 
   'PhotoService',
   'MenuService',
  function($scope, 
           $routeParams, 
           firebaseService, 
           loginService, 
           flashService, 
           FIREBASE, 
           uploadService, 
           photoService,
           menuService
           ) {
    // Initialize item object
    $scope.item = {};
    $scope.flash = flashService;
    $scope.upload = uploadService;
    $scope.selected = menuService; // Get handle to menu selection
    $scope.selected = 'portfolio'; // Make sure the selection is in 'about'
    $scope.pageClass = 'page-portfolio';
    $scope.items = firebaseService; // Get all items

    $scope.contentLoaded = false;

    $scope.items.$on("loaded", function() {
      $scope.contentLoaded = true;
    });

    // Get login object
    $scope.loginObj = loginService;

    // hide the input form by default
    $scope.inputFormVisible = false;

    // Add new item
    $scope.addItem = function() {
      $scope.items.$add({
        title: $scope.item.title,
        platform: $scope.item.platform,
        year: $scope.item.year,
        lang: $scope.item.lang,
        loc: $scope.item.loc,
        desc: $scope.item.desc,
        link: $scope.item.link,
        imgUrl: $scope.upload.url,
        hash: $scope.upload.hash
      });

      alert($scope.upload.hash);
      // Define the flash pop-up
      $scope.flash.message = "A new portfolio item '" + $scope.item.title + "' added!";
      // Clear & hide the input form
      $scope.inputFormVisible = false;
      $scope.item = {};
    };

    // Edit item
    $scope.editItem = function(item, uploadService) {
      $scope.upload = uploadService;
      $scope.flash = flashService;

      // Delete old image if such exists and we are pushing a new one
      if(item.hash && $scope.upload.hash) {
        $scope.photos = photoService;
        $scope.photos.$remove(item.hash);
      }

      // Set item to point to the new photo
      if($scope.upload.hash) {
        item.imgUrl = $scope.upload.url;
        item.hash = $scope.upload.hash;
      }

      // Push changes to Firebase
      $scope.items.$save(item.$id);

      // Define the flash pop-up
      $scope.flash.message = "Changes to portfolio item '" + item.title + "' saved!";
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

    // visibility
    $scope.loginShown = false;

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