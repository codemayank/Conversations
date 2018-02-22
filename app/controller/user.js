const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      mongoose = require('mongoose'),
      user = mongoose.model('User'),
      appResponse = require('./../../library/response');

module.exports.controller = function(app){

  //register user route
  router.post('/register', function(req, res){
    if(req.body.username && req.body.email && req.body.password){
      let newUser = new user({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
      });
      newUser.save(function(err){
        if(err){
          //please write better error handling.
          let response = appResponse.generateResponse(true, 'We could not register you at this moment please try again', 500, null);
          res.send(response);
        }
        req.logIn(newUser, function(err){
          if(err){
            let response = appResponse.generateResponse(true, 'Unauthorized', 401, null);
            res.send(response);
          }
          let response = appResponse.generateResponse(false, 'Registration Success', 304, req.user);
          res.send(response);
        });
      });
    }else{
      let response = appResponse.generateResponse(true, 'Some Parameter missing', 403, null);
      res.send(response);
    }
  });

  //login user router
  router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info){
      if(err) return next(err);
      if(!user){
        let response = appResponse.generateResponse(true, 'Wrong Credentials please check your user name or password', 403, null)
      }
      req.logIn(user, function(err){
        if(err){
          let response = appResponse(true, 'Sorry we could not log you in', 500, null);
          res.send(response);
        }
        let response = appResponse.generateResponse(false, 'Login Success', 304, req.user);
        res.send(response);
      });
    })(req, res, next);
  });

  //logout logic
  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.use(router);
};
