(function() {
  'use strict';
  angular.module('app')
    .component('chat', {
      templateUrl: './app/templates/chat.template.html',
      controller: function chatController($scope, $location, authService, userService) {
        //TODO: write the chat logic here!

        var clientSocket = io();
        let vm = this;
        vm.username = userService.getUserName();

        vm.onlineUsers = [];
        vm.pubMessageList = [];

        clientSocket.on('connect', function() {
          clientSocket.emit('tellEveryone', {
            user: vm.username
          }, function(){
            console.log('recevied callback tell everyone');
            $scope.$apply();
          });
        });


        clientSocket.on('hiEveryone', function(msg) {
          console.log('hiEveryone')
          vm.onlineUsers.push(msg.user);
          vm.pubMessageList.push(msg.message);
          console.log(vm.pubMessageList);
          $scope.$apply()
        });

        clientSocket.on('newJoin', function(msg) {
          console.log('got new join', msg);
          vm.onlineUsers = msg.onlineUsers;
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
            } else {
              clientSocket.emit('startedTyping', {
                userone: vm.username,
                usertwo: null
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
          vm.typingUser = "";
          $scope.$apply();
        })

        //-------------------------started typing and stopped typing messages---------------

        //--------------------------------pvt chat logic--------------------------------
        vm.sendToAll = true
        vm.toUsername = "";
        vm.publicChat = true;
        vm.privateChat = false;
        vm.selectedIndex;
        vm.pvtMessageList = [];
        let connectedUsersList = [];

        vm.sendToOne = function(toUsername) {
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

        vm.sendToAll = function() {
          vm.sendToAll = true;
          vm.toUsername = "";
          vm.publicChat = true;
          vm.privateChat = false;
        };

        vm.sendMessage = function() {
          if (vm.sendToAll) {
            vm.sendMessageToAll();
          } else {
            vm.sendMessageToOne(vm.toUsername);
          }
        };

        //create conversation id


        //FIXME: check requirement of userone and usertwo fields in conversation object and type field in the message object.
        vm.sendMessageToOne = function(toUsername) {
          let startNewConversation = false;
          let currentConversation = null;
          if(connectedUsersList.findIndex(x => x.user === toUsername) != -1){
            console.log('continues with current connection');
            startNewConversation = false;
            currentConversation = connectedUsersList[connectedUsersList.findIndex(x => x.user === toUsername)].conversation_id;
            console.log(currentConversation);
          }else{
            console.log('starts new connection');
            startNewConversation = true
          }

          let index = vm.pvtMessageList.findIndex(x => x.conversation === currentConversation);
          console.log(vm.pvtMessageList);
          console.log(index);
          let message = {
            from: vm.username,
            to: toUsername,
            text: vm.text,
            type: "pvt"
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
          let index = vm.pvtMessageList.findIndex(x => x.conversation === msg.conversation);
          console.log(index);
          if (index != -1) {
            vm.pvtMessageList[index].messages.push(msg.message)
            console.log(vm.pvtMessageList);
            $scope.$apply();
          } else {
            connectedUsersList.push({user : msg.conversation.userone, conversation_id : msg.conversation.conversation});
            console.log(connectedUsersList);
            vm.pvtMessageList.push(msg.conversation)
            console.log(vm.pvtMessageList);
            $scope.$apply();
          }
        });

        //--------------------------------pvt chat logic--------------------------------


        clientSocket.on('userDisconnected', function(msg) {
          let index = vm.onlineUsers.findIndex(x => x.socket === msg.disconnectedUser);
          vm.onlineUsers.splice(index, 1);
          $scope.$apply();
        });

        vm.logout = function() {
          authService.logout()
            .then(function() {
              clientSocket.disconnect();
              $location.path('/login');
            });
        }
      }
    });
}());
