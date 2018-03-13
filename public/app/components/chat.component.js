(function() {
  'use strict';
  angular.module('app')
    .component('chat', {
      css: './app/styles/chat.css',
      templateUrl: './app/templates/chat.template.html',
      controller: function chatController($scope, $location, authService, userService, moment, Notification) {

        var clientSocket;
        let vm = this;
        vm.username = userService.getUserName();
        if (vm.username != null) {
          clientSocket = io();
        }

        vm.onlineUsers = [];
        vm.sendToAll = true
        vm.toUsername = "";
        vm.publicChat = true;
        vm.privateChat = false;
        vm.selectedIndex;
        vm.pvtMessageList = [];
        vm.disabled = true;
        let connectedUsersList = [];

        vm.logout = function() {
          authService.logout()
            .then(function() {
              if (vm.username) {
                clientSocket.disconnect();
              }
              $location.path('/login');
            });
        }

        if (vm.username === null) {
          vm.logout();
        }


        clientSocket.on('connect', function() {
          clientSocket.emit('tellEveryone', {
            user: vm.username
          }, function() {
            $scope.$apply();
          });
        });


        clientSocket.on('hiEveryone', function(msg) {
          let user_index = vm.onlineUsers.findIndex(x => x.username === msg.user.username)
          if (user_index === -1) {
            vm.onlineUsers.push(msg.user);
          } else {
            vm.onlineUsers[user_index].socket = msg.user.socket;
          }
          Notification.info(msg.message.text);
          $scope.$apply()
        });

        clientSocket.on('newJoin', function(msg) {
          vm.pvtMessageList = msg.pastConversations;
          msg.pastConversations.forEach(function(conversation) {
            if (conversation.userone === vm.username) {
              connectedUsersList.push({
                user: conversation.usertwo,
                conversation_id: conversation.conversation
              });
            } else if (conversation.usertwo === vm.username) {
              connectedUsersList.push({
                user: conversation.userone,
                conversation_id: conversation.conversation
              });
            }
          });
          let user_index = msg.onlineUsers.findIndex(x => x.username === vm.username);
          msg.onlineUsers.splice(user_index, 1);
          vm.onlineUsers = msg.onlineUsers;
          Notification.success(msg.message.text);
          $scope.$apply();
        });

        //-------------------------started typing and stopped typing messages---------------
        var typing = false;
        var timeout = undefined;

        function timeoutFunction() {
          typing = false;
          clientSocket.emit('stoppedTyping');
        };

        vm.onKeyDown = function() {
          if (typing === false) {
            typing = true;
            if (vm.sendToAll === false) {
              clientSocket.emit('startedTyping', {
                userone: vm.username,
                usertwo: vm.toUsername
              });
              timeout = setTimeout(timeoutFunction, 500);
            }
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 500);
          }
        }

        clientSocket.on('userTyping', function(data) {
          vm.typingUser = data;
          $scope.$apply();
        })

        clientSocket.on('userNotTyping', function() {
          vm.typingUser = "asp";
          $scope.$apply();
        })

        //--------------------------------pvt chat logic--------------------------------



        vm.sendToOne = function(toUsername) {
          vm.disabled = false;
          vm.sendToAll = false;
          vm.toUsername = toUsername;
          vm.publicChat = false;
          vm.privateChat = true;
          vm.glued = true;

          if (connectedUsersList.findIndex(x => x.user === toUsername) != -1) {
            vm.selectedIndex = connectedUsersList.findIndex(x => x.user === toUsername);
          } else {
            if (connectedUsersList.length === 0) {
              vm.selectedIndex = 0;
            } else {
              vm.selectedIndex = connectedUsersList.length;
            }
          }
        };

        vm.sendMessage = function() {
          vm.glued = true;
          vm.sendMessageToOne(vm.toUsername);
        };

        vm.sendMessageToOne = function(toUsername) {

          let currentConversation = null;
          if (connectedUsersList.findIndex(x => x.user === toUsername) != -1) {
            currentConversation = connectedUsersList[connectedUsersList.findIndex(x => x.user === toUsername)].conversation_id;
          }

          let index = vm.pvtMessageList.findIndex(x => x.conversation === currentConversation);
          let userIndex = vm.onlineUsers.findIndex(x => x.username === toUsername);
          let message = {
            from: vm.username,
            to: toUsername,
            text: vm.text,
            type: "pvt",
            toSocket: vm.onlineUsers[userIndex].socket
          }
          if (index != -1) {
            clientSocket.emit('sendMessageTo', {
                message: message,
                firstMessage: false,
                conversation: currentConversation
              },
              function(data) {
                vm.pvtMessageList[index].messages.push(data.message);
                vm.text = "";
                $scope.$apply();
              })
          } else {

            let conversation = {
              userone: vm.username,
              usertwo: toUsername,
              message: message
            }

            clientSocket.emit('sendMessageTo', {
                conversation: conversation,
                firstMessage: true
              },
              function(data) {
                connectedUsersList.push({
                  user: toUsername,
                  conversation_id: data.conversation.conversation
                });
                vm.pvtMessageList.push(data.conversation);
                vm.text = "";
                $scope.$apply();
              });
          }
        };

        clientSocket.on('receiveIncomingMsg', function(msg) {
          let index = vm.pvtMessageList.findIndex(x => x.conversation === msg.conversation);
          if (index != -1) {
            vm.pvtMessageList[index].messages.push(msg.message);
            $scope.$apply();
          } else {
            connectedUsersList.push({
              user: msg.userone,
              conversation_id: msg.conversation
            });
            vm.pvtMessageList.push(msg)
            $scope.$apply();
          }
        });

        vm.messagePosition = function(from) {
          if (from === vm.username) {
            return "message-main-sender";
          } else {
            return "message-main-receiver";
          }
        }

        vm.messageOwner = function(from) {
          if (from === vm.username) {
            return "sender";
          } else {
            return "receiver";
          }
        }

        //--------------------------------pvt chat logic--------------------------------


        clientSocket.on('userDisconnected', function(msg) {
          let index = vm.onlineUsers.findIndex(x => x.username === msg.disconnectedUser);
          Notification.info(msg.message.text);
          vm.onlineUsers[index].socket = 'offline';
          $scope.$apply();
        });

      }
    });
}());
