const mongoose = require('mongoose');


let messageSchema = new mongoose.Schema({
  conversation : String,
  userone : String,
  usertwo : String,
  messages : [{from : String, to : String, text: String, msgtype : String, createdAt : Date}]

});

mongoose.model("Messages", messageSchema);
