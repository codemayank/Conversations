Conversations
=============
A one-to-one chat messenger made using Node.js, Express, MongoDB, socketio and Angularjs.

## Features:

* Send real time private messages to other users connected to the App.
* Messages can be sent to other users even when they are offline, they will see the messages once they are online.
* App shows notifications when a user connects, disconnects from the app.
* shows istyping message when the other user is typing.
* Messages are stored in a database so can be retrieved when the user connects with the application.

Usage
=====

Visit [Conversations](https://gentle-badlands-63404.herokuapp.com) to use the application.

To run the app on local server on your machine.

You will need the following programs
1. Node.js
2. MongoDB

Once you have the above programs installed follow the below steps.

1. clone the repository

```bash
  git clone https://github.com/codemayank/Conversations.git
```
2. Navigate to the directory where the sourcecode for conversations has been downloaded.

3. install all the dependencies.

```bash
  npm install
```
4. Start the MongoDB server by running.

```bash
  ./mongod
```

5. start the app.

```bash
  node server.js
```

6. The app should now be open on localhost port 3000.
7. The app is best viewed on Desktop.
