(function() {
  'use strict';
//TODO: IMP when the user reloads the chat page he should be prompted an alert message and redirected to the login page.
angular.module('app')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/login',
        access:{restricted : false}
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
