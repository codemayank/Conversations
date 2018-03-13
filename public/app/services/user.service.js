(function() {
  'use strict';

  angular.module('app')
    .factory('userService', [userService])

    function userService(){
      var userName = null;
      return{
        sendUserName : sendUserName,
        getUserName : getUserName
      }

      function getUserName(){
        return userName;
      }

      function sendUserName(username){
        userName = username;
      }
    }
}());
