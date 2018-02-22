const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let UserSchema = new mongoose.Schema({
  username : {
    type: String,
    required : true,
    unique : true
  },
  email : {
    type : String,
    required : true,
    unique : true
  },
  password :{
    type : String,
    required : true
  }

});

UserSchema.pre('save', function(next){
  let user = this;
  if(!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function(userPassword, cb){
  bcrypt.compare(userPassword, this.password, function(err, isMatch){
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

mongoose.model("User", UserSchema);
