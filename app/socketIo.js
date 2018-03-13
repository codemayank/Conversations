module.exports.controller = function(server){

  const mongoose = require('mongoose');
  const {generateMessage} = require('../library/message');
  const events = require('events');
  const io = require('socket.io')(server);
  const messageStoreEmitter = new events.EventEmitter();
  const messagesCollection = mongoose.model('Messages');
  const users = mongoose.model('User');

  const numberOflisteners = events.EventEmitter.listenerCount(messageStoreEmitter, 'receiveConversations');

  let ID = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  let connectedUsers = [];
  let rooms = [];

  io.on('connection', (socket) => {
    let username = "";

    socket.on('tellEveryone', (msg, callback) => {
      username = msg.user;
      let user_index = connectedUsers.findIndex(x => x.username === msg.user);

      let notifyMessage = generateMessage('Server', 'All', username + ' is now online.', 'public');
      if(user_index === -1 || connectedUsers.length === 0){
        let userObj = {
          socket : socket.id,
          username : username
        };
          connectedUsers.push(userObj);
          socket.broadcast.emit('hiEveryone', {user : userObj, message : notifyMessage});
      }else{

          connectedUsers[user_index].socket = socket.id;
          socket.broadcast.emit('hiEveryone', {user : connectedUsers[user_index], message : notifyMessage});
      }

      messageStoreEmitter.emit('sendConversations', msg.user);

      messageStoreEmitter.once('receiveConversations', (data) => {
        let welcomeMessage = generateMessage('Server', username, 'hello ' + username + ' you are now online.', 'pvt');
        socket.emit('newJoin', {onlineUsers : connectedUsers, message : welcomeMessage, pastConversations : data});
      })
      callback('');
    });

    socket.on('sendMessageTo', (data, callback) => {


      if(!data.firstMessage){

        let message = generateMessage(data.message.from, data.message.to, data.message.text, data.message.type);
        if(data.message.toSocket != "offline"){
          io.to(data.message.toSocket).emit('receiveIncomingMsg', {conversation : data.conversation, message : message});
        }
        callback({message});
        messageStoreEmitter.emit('storeMessage', {conversation : data.conversation, message : message});
      }else{
        let message = generateMessage(data.conversation.message.from, data.conversation.message.to, data.conversation.message.text, data.conversation.message.type);
        let id = ID();
        let conversation = {
          conversation : id,
          userone : data.conversation.userone,
          usertwo : data.conversation.usertwo,
          messages : [message]
        }
        if(data.conversation.message.toSocket != "offline"){
          io.to(data.conversation.message.toSocket).emit('receiveIncomingMsg', conversation);
        }
        callback({conversation});
        messageStoreEmitter.emit('storeConversation', {conversation});
      }
    });

    socket.on('startedTyping', (data) => {

      if(data.usertwo != null){
        let index = connectedUsers.findIndex(x => x.username === data.usertwo);
        let toSocket = connectedUsers[index].socket;
        io.to(toSocket).emit('userTyping', data.userone);
      }
    })

    socket.on('stoppedTyping', () =>{
      socket.broadcast.emit('userNotTyping');
    })

    socket.on('createMessage', (msg, callback) => {
      message = generateMessage(msg.from, msg.to, msg.text, 'public');
      io.emit('newMessage', {message : message});
      callback('');
    })

    socket.on('disconnect', () => {
      let disconnectedUser = "";

      let index = connectedUsers.findIndex( x => x.socket === socket.id);
      if(index != -1){
        disconnectedUser = connectedUsers[index].username;
        connectedUsers[index].socket = 'offline';
        let goodByeMessage = generateMessage('Server', 'All',  disconnectedUser + " has disconnected.", 'public');
        socket.broadcast.emit('userDisconnected', {disconnectedUser : disconnectedUser, message : goodByeMessage});
      }
      disconnectedUser = "";
    })

})

//logic to store conversations in the database.
messageStoreEmitter.on('storeConversation', (data) =>{

    let newConversation = new messagesCollection({
      conversation : data.conversation.conversation,
      userone : data.conversation.userone,
      usertwo : data.conversation.usertwo,
      messages : data.conversation.messages
    })
    newConversation.save(function(err){
      if(err){
        console.log(err);
      }
    });
});

//logic to store messages in the database
messageStoreEmitter.on('storeMessage', (data) => {
  messagesCollection.findOneAndUpdate({'conversation' : data.conversation}, {$push : {'messages' : data.message}}, (err, addedMessage) =>{
    if(err){
      console.log(err);
    }
  })
});

//logic to retreive messages for a particular user based on their username.
messageStoreEmitter.on('sendConversations', (data) => {

  messagesCollection.find({$or : [{"userone" : data}, {"usertwo" : data}]}, "conversation userone usertwo messages.createdAt messages.from messages.text messages.to messages.msgtype", (err, foundMessages) => {
    if(err){
      console.log(err);
    }else{
      messageStoreEmitter.emit('receiveConversations', foundMessages);
    }
  });
})

}
