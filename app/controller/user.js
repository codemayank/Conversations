const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      mongoose = require('mongoose'),
      user = mongoose.model('User');


module.exports.controller = function(app){

  //register user route
  router.post('/register', function(req, res){
    if(req.body.username && req.body.email && req.body.password){
      let newUser = new user({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password,
      });
      newUser.save(function(err){
        if(err){
          return res.status(500).json({
            err:err
          });
        }
        req.logIn(newUser, function(err){
          if(err){
            return res.status(401).json({
              err:err
            })
          }
          return res.status(200).json({
            status: true,
            username : req.user.username
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
              err : err
            });
        }
        return res.status(200).json({
          status: true,
          username : req.user.username,
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
      return res.status(200).json({
        status: false
      })
    }
    return res.status(200).json({
      status: true,
      username : req.user.username
    });
  });

  app.use(router);
};
