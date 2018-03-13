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
      var deferred = $q.defer();

      $http.post('/login', {
          username: username,
          password: password
        })
        .then(function successCallback(response) {
            if (response.status === 200 && response.data.status) {
              user = true;
              deferred.resolve(response);
            } else {
              user = false;
              deferred.reject(response);
            }
          },
          function errorCallback(response) {
            user = false;
            deferred.reject(response);
          })
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
        .then(function successCallback(response) {
            if (response.status === 200 && response.data.status) {
              user = true;
              console.log('login successfull');
              deferred.resolve(response);
            } else {
              user = false;
              deferred.reject(response);
            }
          },
          function errorCallback(response) {
            user = false;
            console.log(response);
            deferred.reject(response);
          })
      return deferred.promise;
    }
  }
}());
