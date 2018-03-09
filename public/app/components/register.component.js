(function() {
  'use strict';
  angular.module('app')
    .component('register', {
      templateUrl: './app/templates/register.template.html',
      controller : function registerController($location, authService, userService){

        var vm = this;

        vm.register = function(){
          vm.error = false;
          vm.disabled = true;


          authService.register(vm.registerForm.username, vm.registerForm.password, vm.registerForm.email)
            .then(function(response){
              userService.sendUserName(response.data.username);
              $location.path('/chat');
              vm.disabled = false;
              vm.registerForm = {};
            })
            .catch(function(response){
              vm.error = true;
              vm.errorMessage = "Something went wrong!";
              vm.disabled = false;
              vm.registerForm = {};
            });
        }
      }
    });
}());
