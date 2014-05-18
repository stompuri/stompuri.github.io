'use strict';

var portfolioApp = angular.module('portfolioApp', [
  'ngRoute',
  'portfolioControllers'
]);

portfolioApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl'
      })
      .when('/portfolio', {
        templateUrl: 'views/portfolio.html',
        controller: 'PortfolioCtrl'
      })
      .when('/debug', {
        templateUrl: 'views/debug.html',
        controller: 'DebugCtrl'
      })
      .otherwise({
        redirectTo: '/about'
      }
    );
  }
]);
