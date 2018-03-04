module.exports.controller = function(server){


  //1.get the list of all on-line users.
    //

  const {generateMessage} = require('../library/message');
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('new user connected');
    console.log(socket.id);

    socket.on('userJoined', (data) => {
      socket.emit('message', generateMessage('Admin', 'Welcome to the chat app'));
      socket.broadcast.emit('message', generateMessage('Admin', data + ' is now online'));
    });

    socket.on('createMessage', (message, callbacchatk)=>{
      console.log(message);
      io.emit('message', generateMessage(message.from, message.text));
      callback('')
    });


    socket.on('disconnect', () => {
      console.log('The user has disconnected');
      socket.broadcast.emit('message', generateMessage('Admin', 'a user has left the chat'));
    });

  })
}
