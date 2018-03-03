const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      mongoose = require('mongoose'),
      user = mongoose.model('User'),
      //FIXME:10 please remove this dependency if not used in the code.
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
          return res.status(500).json({
            //TODO:10 handle the error properly
            err:err
          });
        }
        req.logIn(newUser, function(err){
          if(err){
            return res.status(401).json({
              //TODO:20 handle the error properly
              err:err
            })
          }
          return res.status(200).json({
            status: 'Registration successful'
          })
        });
      });
    }else{
      return res.status(403).json({
        status: 'Some Parameter is missing'
      })
    }
  });

  //login user router
  router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info){
      if(err){
        return next(err);
      }
      if(!user){
          return res.status(401).json({
            err:info
          })
      }
      req.logIn(user, function(err){
        if(err) {
            return res.status(500).json({
              err : 'Could not log in user'
            });
        }
        console.log('logged in');
        return res.status(200).json({
          status: true
        });
      });
    })(req, res, next);
  });

  //logout logic
  router.get('/logout', function(req, res){
    req.logout();
    return res.status(200).json({
      status: 'Bye!'
    });
  });

  //getUser status router
  router.get('/userstatus', function(req, res){
    if(!req.isAuthenticated()){
      console.log('returning false');
      return res.status(200).json({
        status: false
      })
    }
    console.log('jspm');
    return res.status(200).json({
      status: true
    });
  });

  app.use(router);
};
