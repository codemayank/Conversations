(function() {
  'use strict';
  angular.module('app')
    .component('register', {
      templateUrl: './app/templates/register.template.html',
      controller : function registerController($location, authService, userService, Flash){

        var vm = this;

        vm.errorAlert = function(message){
          let re1 = /username_1/g;
          let re2 = /email_1/g;
          if(re1.test(message.err.errmsg)){
            let id = Flash.create('info', `The username '${message.err.op.username}' already exists please register with a different username`, 5000, true);
          }
          if(re2.test(message.err.errmsg)){
            let id = Flash.create('info', `the e-mail '${message.err.op.email}' is already registered.`)
          }
        }
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
              console.log(response);
              vm.error = true;
              if(response.status === 500){
                vm.errorAlert('Sorry Something went wrong! please try to login after some time');
              }
              else{
                vm.errorAlert(response.data);
              }
              vm.errorMessage = "Something went wrong!";
              vm.disabled = false;
              vm.registerForm = {};
            });
        }
      }
    });
}());
