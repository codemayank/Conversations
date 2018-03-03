(function() {
  'use strict';
  angular.module('app')
    .component('register', {
      templateUrl: './app/templates/register.template.html',
      controller : function registerController($location, authService){

        var vm = this;

        vm.register = function(){
          vm.error = false;
          vm.disabled = true;

          authService.register(vm.registerForm.username, vm.registerForm.password, vm.registerForm.email)
            .then(function(){
              $location.path('/');
              vm.disabled = false;
              vm.registerForm = {};
            })
            .catch(function(){
              vm.error = true;
              vm.errorMessage = "Something went wrong!";
              vm.disabled = false;
              vm.registerForm = {};
            });
        }
      }
    });
}());
