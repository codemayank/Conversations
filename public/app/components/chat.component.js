(function() {
  'use strict';
  angular.module('app')
    .component('chat', {
      css : './app/styles/chat.css',
      templateUrl: './app/templates/chat.template.html',
      controller: function chatController($scope, $location, authService, userService, Flash, moment) {

        //TODO: write the chat logic here!
        
        var clientSocket;
        let vm = this;
        vm.username = userService.getUserName();
        if(vm.username !=  null){
          clientSocket = io();
        }

        vm.onlineUsers = [];
        vm.pubMessageList = [];
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
              if(vm.username){
                  clientSocket.disconnect();
              }
              $location.path('/login');
            });
        }

        if(vm.username === null){
            vm.logout();
        }

        vm.successAlert = function(message){
          let id = Flash.create('success', message, 2000, true);
        }

        vm.infoAlert = function(message){
          let id = Flash.create('info', message, 2000, true);
        }


        clientSocket.on('connect', function() {
          clientSocket.emit('tellEveryone', {
            user: vm.username
          }, function(){
            console.log('recevied callback tell everyone');
            $scope.$apply();
          });
        });


        clientSocket.on('hiEveryone', function(msg) {
          console.log('hiEveryone');
          let user_index = vm.onlineUsers.findIndex(x => x.username === msg.user.username)
          console.log(user_index);
          console.log(vm.onlineUsers);
          if(user_index === -1){
            console.log('pushing new user');
            vm.onlineUsers.push(msg.user);
          }else{
            vm.onlineUsers[user_index].socket = msg.user.socket;
          }

          console.log(msg.user);
          vm.infoAlert(msg.message.text);
          vm.pubMessageList.push(msg.message);
          console.log(vm.pubMessageList);
          $scope.$apply()
        });

        clientSocket.on('newJoin', function(msg) {
          console.log('got new join', msg);
          vm.pvtMessageList = msg.pastConversations;
          msg.pastConversations.forEach(function(conversation){
            if(conversation.userone === vm.username){
              connectedUsersList.push({user : conversation.usertwo, conversation_id : conversation.conversation});
            }else if(conversation.usertwo === vm.username){
              connectedUsersList.push({user : conversation.userone, conversation_id : conversation.conversation});
            }
          });
          vm.onlineUsers = msg.onlineUsers;
          vm.successAlert(msg.message.text);
          vm.pubMessageList.push(msg.message);
          console.log(vm.pubMessageList);
          $scope.$apply();
        });


        clientSocket.on('newMessage', function(msg) {
          console.log(msg);
          vm.pubMessageList.push(msg.message);
          console.log(vm.pubMessageList);
          $scope.$apply();
        });

        vm.sendMessageToAll = function() {
          clientSocket.emit('createMessage', {
            from: vm.username,
            text: vm.text
          }, function() {
            vm.text = "";
            $scope.$apply();
          });
        }

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
          console.log(data);
          $scope.$apply();
        })

        clientSocket.on('userNotTyping', function() {
          vm.typingUser = "asp";
          $scope.$apply();
        })

        //-------------------------started typing and stopped typing messages---------------

        //--------------------------------pvt chat logic--------------------------------


        vm.sendToOne = function(toUsername) {
          vm.disabled = false;
          vm.sendToAll = false;
          vm.toUsername = toUsername;
          vm.publicChat = false;
          vm.privateChat = true;
          if (connectedUsersList.findIndex(x => x.user === toUsername) != -1) {
            console.log(connectedUsersList);
            vm.selectedIndex = connectedUsersList.findIndex(x => x.user === toUsername);
            console.log(vm.selectedIndex);
          } else {
            if(connectedUsersList.length === 0){
              console.log('this connected users 0')
              vm.selectedIndex = 0;
              console.log(vm.selectedIndex);
            }else{
              vm.selectedIndex = connectedUsersList.length;
              console.log(connectedUsersList);
              console.log(vm.selectedIndex);
            }
          }
        };

        //FIXME if not required remove below commented code.
        // vm.sendToAll = function() {
        //   vm.sendToAll = true;
        //   vm.toUsername = "";
        //   vm.publicChat = true;
        //   vm.privateChat = false;
        // };

        vm.sendMessage = function() {
          //FIXME if not required remove below commented code.
          // if (vm.sendToAll) {
          //   vm.sendMessageToAll();
          // } else {
          //   vm.sendMessageToOne(vm.toUsername);
          // }
          vm.sendMessageToOne(vm.toUsername);
        };

        //create conversation id


        //FIXME: check requirement of userone and usertwo fields in conversation object and type field in the message object.
        vm.sendMessageToOne = function(toUsername) {

          let currentConversation = null;
          if(connectedUsersList.findIndex(x => x.user === toUsername) != -1){
            console.log('continues with current connection');
            currentConversation = connectedUsersList[connectedUsersList.findIndex(x => x.user === toUsername)].conversation_id;
            console.log(currentConversation);
          }

          let index = vm.pvtMessageList.findIndex(x => x.conversation === currentConversation);
          console.log(vm.pvtMessageList);
          console.log(index);
          let userIndex = vm.onlineUsers.findIndex(x => x.username === toUsername);
          let message = {
            from: vm.username,
            to: toUsername,
            text: vm.text,
            type: "pvt",
            toSocket : vm.onlineUsers[userIndex].socket
          }
          if (index != -1) {
            //FIXME : messages directly stored on the client side will not have a time stamp.
            clientSocket.emit('sendMessageTo', {
                message: message,
                firstMessage: false,
                conversation : currentConversation
              },
              function(data) {
                vm.pvtMessageList[index].messages.push(data.message);
                vm.text = "";
                $scope.$apply();
              })
          } else {

            let conversation = {
              userone : vm.username,
              usertwo : toUsername,
              message: message
            }

            console.log(conversation);



            clientSocket.emit('sendMessageTo', {
                conversation: conversation,
                firstMessage: true
              },
              function(data) {
                console.log(data);
                connectedUsersList.push({user : toUsername, conversation_id : data.conversation.conversation});
                vm.pvtMessageList.push(data.conversation);
                console.log(vm.pvtMessageList);
                vm.text = "";
                $scope.$apply();
              });
          }
        };

        clientSocket.on('receiveIncomingMsg', function(msg) {
          console.log(msg);
          let index = vm.pvtMessageList.findIndex(x => x.conversation === msg.conversation);
          console.log(index);
          if (index != -1) {
            vm.pvtMessageList[index].messages.push(msg.message)
            console.log(vm.pvtMessageList);
            $scope.$apply();
          } else {
            connectedUsersList.push({user : msg.userone, conversation_id : msg.conversation});
            console.log(connectedUsersList);
            vm.pvtMessageList.push(msg)
            console.log(vm.pvtMessageList);
            $scope.$apply();
          }
        });

        vm.messagePosition = function(from){
          if(from === vm.username){
            return "message-main-sender";
          }else{
            return "message-main-receiver";
          }
        }

        //--------------------------------pvt chat logic--------------------------------


        clientSocket.on('userDisconnected', function(msg) {
          console.log(msg);
          let index = vm.onlineUsers.findIndex(x => x.username === msg.disconnectedUser);
          vm.infoAlert(msg.message.text);
          vm.onlineUsers[index].socket = 'offline';
          $scope.$apply();
        });


      }
    });
}());
