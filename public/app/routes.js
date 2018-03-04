(function() {
  'use strict';

angular.module('app')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        template: '<home></home>',
        access: {restricted : true}
      })
      .when('/login', {
        template:'<login></login>',
        access: {restricted : false}
      })
      .when('/register', {
        template: '<register></register>',
        access : {restricted : false}
      })
      .when('/chat', {
        template: '<chat></chat>',
        access : {restricted : true}
      })
      .when('/two', {
        template:'<h1>This is page two!</h1>',
        access : {restricted : false}
      })
      .otherwise({
        redirectTo: '/'
      });
  });


  angular.module('app').run(function($rootScope, $location, $route, authService){
    $rootScope.$on('$routeChangeStart', function(event, next, current){
      authService.getUserStatus()
        .then(function(){
          if(next.access.restricted && !authService.isLoggedIn()){
            //TODO: remove this console.log
            console.log(authService.isLoggedIn())
            $location.path('/login');
            $route.reload();
          };
        });
    });
  });

}());
