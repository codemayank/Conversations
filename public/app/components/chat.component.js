(function() {
  'use strict';
  angular.module('chatModule')
    .component('chat', {
      templateUrl : './app/templates/chat.template.html',
      controller : function chatController(authService){
        //TODO: write the chat logic here!

        var vm = this;

        var socket = io();

        socket.on('connect', function(){
          console.log('connected to the server');
        });

        socket.on('disconnect', function(){
          console.log('disconnected from the server');
        })

        vm.logout = function(){
          authService.logout()
            .then(function(){
              $location.path('/login');
            });
      }

      }
    })
}());
