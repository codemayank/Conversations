const express = require('express'),
      app = express(),
      mongoose = require('mongoose'),
      http = require('http').createServer(app),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      session = require('express-session'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      fs = require('fs'),
      path =  require('path'),
      publicPath = path.join(__dirname + '/public'),
      port = process.env.PORT || 3000;


mongoose.connect('mongodb://localhost/chat_app');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(publicPath));
app.use(cookieParser());

fs.readdirSync('./app/models').forEach(function(element){
  if(element.indexOf('.js')){
    require('./app/models/'+element);
  }
});

const user = mongoose.model('User');
app.use(session({
  secret : 'App Secret',
  resave : true,
  saveUninitialized : true,
  httpOnly : true,
  cookie : { secure : false }
}));

//initialize passportjs

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(function(username, password, done){
  user.findOne({username : username}, function(err, user){
    if(err) return done(err);
    if(!user) return done(null, false, {message : 'Incorrect UserName'});
    user.comparePassword(password, function(err, isMatch){
      if(isMatch){
        return done(null, user);
      }else{
        return done(null, false, {message : 'Incorrect Password'});
      }
    });
  });
}));


//FIXME:0 : gives error when 'fails to serialize user into session' when the authentication fails'
passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  user.findById(id, function(err, user){
    done(err, user);
  });
});



fs.readdirSync('./app/controller').forEach(function(element){
        if(element.indexOf('.js')){
          let route = require('./app/controller/'+element);

          route.controller(app);
        }
});

http.listen(port, function(){
  console.log('The server is listening on port ' + port);
});

const socketIo = require('./app/socketIo.js');
socketIo.controller(http);
