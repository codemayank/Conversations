(function() {
  'use strict';

  angular.module('app')
    .component('login', {
      templateUrl: './app/templates/login.template.html',
      controller: function loginController($location, authService, userService) {
        let vm = this;

        vm.login = function() {
          vm.error = false;
          vm.disabled = true;

          authService.login(vm.loginForm.username, vm.loginForm.password)
            .then(function(response) {
              //FIXME:20 remove this console.log
              console.log(response);
              userService.sendUserName(response.data.username);
              console.log('redirecting');
              $location.path('/chat');
              vm.disabled = false;
              vm.loginForm = {};
            })
            .catch(function() {
              //FIXME:40 remove this console.log
              console.log('this is happening');
              vm.error = true;
              vm.errorMessage = "Invalid username and/or password";
              vm.disabled = false;
              vm.loginForm = {};
            });
        }
      }
    })

}());
