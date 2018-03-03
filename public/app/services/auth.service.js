(function() {
  'use strict';
  angular.module('app')
    .factory('authService', ['$http', '$q', '$timeout', authService])

  function authService($http, $q, $timeout) {
    var user = null;

    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register
    });

    function isLoggedIn() {
      if (user) {
        console.log(user);
        return true;
      } else {
        return false;
      }
    }

    function getUserStatus() {
      return $http.get('/userstatus')
        .then(function successCallback(response) {
            if (response.data.status) {
              user = true;
            } else {
              user = false;
            }
          },
          function errorCallback(response) {
            user = false;

          })
    }

    function login(username, password) {
      //TODO:30 understand what this line of code does.
      var deferred = $q.defer();

      $http.post('/login', {
          username: username,
          password: password
        })
        .then(function successCallback(response) {
            if (response.status === 200 && response.data.status) {
              //FIXME:50 remove this console.log
              console.log(status);
              user = true;
              deferred.resolve();
            } else {
              //FIXME:60 remove this console.log
              console.log(response);
              user = false;
              deferred.reject();
            }
          },
          function errorCallback(response) {
            //FIXME:70 remove this console.log
            console.log(response);
            user = false;
            deferred.reject();
          })
              //FIXME:80 remove this console.log
          console.log(deferred.promise);
      return deferred.promise;
    }

    function logout() {

      var deferred = $q.defer();
      $http.get('/logout')
        .then(function successCallback(response) {
            user = false;
            deferred.resolve();
          },
          function errorCallback(response) {
            user = false;
            deferred.reject()
          })
      return deferred.promise;
    }

    function register(username, password, email) {
      var deferred = $q.defer();

      $http.post('/register', {
          username: username,
          password: password,
          email: email
        })
        .then(function successCallback() {
            if (response.status === 200 && response.data.status) {
              user = true;
//FIXME:90 remove this console.log
              console.log('login successfull');
              deferred.resolve();
            } else {
              user = false;
              deferred.reject();
            }
          },
          function errorCallback(response) {
            user = false;
            deferred.reject();
          })
      return deferred.promise;
    }
  }
}());
