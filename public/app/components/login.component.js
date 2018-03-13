(function() {
  'use strict';

  angular.module('app')
    .component('login', {
      templateUrl: './app/templates/login.template.html',
      controller: function loginController($location, authService, userService, Flash) {

        let vm = this;
        vm.errorAlert = function(message){
          let id = Flash.create('info', message, 5000, true);
        }

        vm.login = function() {
          vm.error = false;
          vm.disabled = true;

          authService.login(vm.loginForm.username, vm.loginForm.password)
            .then(function(response) {
              userService.sendUserName(response.data.username);
              $location.path('/chat');
              vm.disabled = false;
              vm.loginForm = {};
            })
            .catch(function(response) {
              vm.error = true;
              if(response.status === 500){
                vm.errorAlert('Sorry Something went wrong! please try to login after some time');
              }
              else{
                vm.errorAlert(response.data.err.message);
              }
              vm.disabled = false;
              vm.loginForm = {};
            });
        }
      }
    })
}());
