module.exports.controller = function(server){


  //1.get the list of all on-line users.
    //
  const mongoose = require('mongoose');
  const {generateMessage} = require('../library/message');
  const {isRealString} = require('../library/validation');
  const events = require('events');
  const io = require('socket.io')(server);
  const messageStoreEmitter = new events.EventEmitter();
  const messagesCollection = mongoose.model('Messages');
  const users = mongoose.model('User');

  const numberOflisteners = events.EventEmitter.listenerCount(messageStoreEmitter, 'receiveConversations');
  console.log('number of listeners receiveconversations', numberOflisteners);

  let ID = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  let connectedUsers = [];
  let rooms = [];
  io.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected');
    let username = "";

    //event fired for initial login,
    socket.on('tellEveryone', (msg, callback) => {
      username = msg.user;
      let userObj = {
        socket : socket.id,
        username : username
      };


      console.log('connectedUsers', connectedUsers);
      messageStoreEmitter.emit('sendConversations', msg.user);
      messageStoreEmitter.once('receiveConversations', (data) => {
        console.log('printing data =>', data);
        console.log(userObj);
        let welcomeMessage = generateMessage('Server', 'hello ' + username + ' you are now online.');
        socket.emit('newJoin', {onlineUsers : connectedUsers, message : welcomeMessage, pastConversations : data});
        connectedUsers.push(userObj);
      })

      console.log('listeners receive conversation', events.listenerCount(messageStoreEmitter, 'receiveConversations'));


      let notifyMessage = generateMessage('Server', username + ' is now online.');
      socket.broadcast.emit('hiEveryone', {user : userObj, message : notifyMessage});
      callback('');

    });

    //once message is received from the sender transfer it to the database.

    socket.on('sendMessageTo', (data, callback) => {
      console.log(data);

      if(!data.firstMessage){

        let index = connectedUsers.findIndex(x => x.username === data.message.to);
        let toSocket = connectedUsers[index].socket;
        let message = generateMessage(data.message.from, data.message.to, data.message.text, data.message.type);
        io.to(toSocket).emit('receiveIncomingMsg', {conversation : data.conversation, message : message});
        callback({message});
        messageStoreEmitter.emit('storeMessage', {conversation : data.conversation, message : message});
      }else{
        let index = connectedUsers.findIndex(x => x.username === data.conversation.message.to);
        let toSocket = connectedUsers[index].socket;
        let message = generateMessage(data.conversation.message.from, data.conversation.message.to, data.conversation.message.text, data.conversation.message.type);
        let id = ID();
        let conversation = {
          conversation : id,
          userone : data.conversation.userone,
          usertwo : data.conversation.usertwo,
          messages : [{conversation : id, message : message}]
        }
        io.to(toSocket).emit('receiveIncomingMsg', {conversation});
        callback({conversation});
        messageStoreEmitter.emit('storeConversation', {conversation});
      }
    });

    socket.on('startedTyping', (data) => {

      if(data.usertwo != null){
        let index = connectedUsers.findIndex(x => x.username === data.usertwo);
        let toSocket = connectedUsers[index].socket;
        io.to(toSocket).emit('userTyping', data.userone);
      }else{
        socket.broadcast.emit('userTyping', data.userone);
      }
    })

    socket.on('stoppedTyping', () =>{
      socket.broadcast.emit('userNotTyping');
    })

    socket.on('createMessage', (msg, callback) => {
      message = generateMessage(msg.from, msg.text);
      console.log(msg);
      io.emit('newMessage', {message : message});
      callback('');
    })

    socket.on('disconnect', () => {
      disconnectedUser = "";
      for(let i = 0; i < connectedUsers.length; i++){
        if(connectedUsers[i].socket === socket.id){
          disconnectedUser = connectedUsers[i].socket;
          connectedUsers.splice(i, 1);
          break;
        }
      }
      //FIXME: goodby message not shown.
      let goodByeMessage = generateMessage('Server', disconnectedUser + " has disconnected.")
      socket.broadcast.emit('userDisconnected', {disconnectedUser : disconnectedUser, message : goodByeMessage});
      disconnectedUser = "";
    })

})

//logic to store messages / conversations in the database.
messageStoreEmitter.on('storeConversation', (data) =>{

    let newConversation = new messagesCollection({
      conversation : data.conversation.conversation,
      userone : data.conversation.userone,
      usertwo : data.conversation.usertwo,
      messages : [data.conversation.messages[0].message]
    })
    newConversation.save(function(err){
      if(err){
        messageStoreEmitter.emit('error', err)
      }
      console.log('document successfully saved');
    });
});

messageStoreEmitter.on('storeMessage', (data) => {
  messagesCollection.findOneAndUpdate({conversation : data.conversation}, {$push : {messages : data.message}}, (err, addedMessage) =>{
    if(err){
      messageStoreEmitter.emit('error', err);
      console.log(err);
    }
    console.log('message added successfully');
  })
});


messageStoreEmitter.on('sendConversations', (data) => {
  console.log('a', data);

  messagesCollection.find({$or : [{"userone" : data}, {"usertwo" : data}]}, (err, foundMessages) => {
    if(err){
      console.log('found error');
      console.log(err);
      messageStoreEmitter.emit('receiveConversations', err);
    }else{
      console.log('b');
      console.log('found Messages =>', foundMessages);
      console.log('found messages executed');
      messageStoreEmitter.emit('receiveConversations', foundMessages);
    }
  });
})

messageStoreEmitter.on('error', (error) =>{
  console.log('there has been an error', error);
})

}
