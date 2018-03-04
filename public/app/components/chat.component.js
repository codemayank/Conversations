(function() {
  'use strict';
  angular.module('chatModule')
    .component('chat', {
      templateUrl : './app/templates/chat.template.html',
      controller : function chatController($scope, $location, authService, userService){
        //TODO: write the chat logic here!

        var vm = this;

        var socket = io();

        var username = userService.getUserName();
        console.log(username);

        socket.on('connected', function(){
          //FIXME: remove this console.log
            console.log('connected fired');
            // socket.emit('userJoined');

        });

        socket.emit('userJoined');

        socket.on('disconnected', function(){
          console.log('user has disconnected');
        })

        vm.messages = [];
        socket.on('message', function(message){
          console.log('message', message);
          vm.messages.push(message);
          console.log(vm.messages);
          $scope.$apply();
        })

        vm.newMessage = function(e){
            vm.disabled = true;
            socket.emit('createMessage', {
              from: 'User',
              text: vm.text
            }, function(){
              vm.disabled = false;
              vm.text = "";
              $scope.$apply();
            })
        }

        vm.logout = function(){
          authService.logout()
            .then(function(){
              socket.disconnect();
              $location.path('/login');
            });
      }

      }
    })
}());
