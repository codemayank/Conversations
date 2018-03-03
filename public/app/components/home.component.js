(function() {
  'use strict';
  angular.module('app')
    .component('home',{
      templateUrl :'./app/templates/home.template.html',
      controller : function mainController($location, authService){
        //FIXME:30 write code for accepting login and signup input and passing it to auth service.
        var vm = this;


        vm.logout = function(){
          authService.logout()
            .then(function(){
              $location.path('/login');
            });
      }

      }
    });
}());
