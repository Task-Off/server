'use strict'

import express from 'express';
import User from '../model/user.js';
import bodyParser from 'body-parser';
import bearer from '../middleware/bearer-auth.js';
import superagent from 'superagent';

const userRouter = module.exports = express.Router();


//this route returns the entire user, so it also contains group_IDs
userRouter.get('/user', bearer, (req, res, next) => {
  let user = req.user;
  if (user) res.send(user);
  else next();
})


//create route for adding a group_ID to the user
userRouter.put('/user/:group'), bearer, (req, res, next) => {
  //add a group ID to the user's list of IDs.
  //the ID comes from req.id
  //use User.findOneAndUpdate()

})


//Can we can use this route to update any of our user information.
userRouter.put('/user', bearer, bodyParser.json(), (req, res, next) => {

  console.log('req.user is ', req.user);
  if(!req.user) next(400)
  let user = req.user;

  User.findOne({_id: user._id})
    .then(user => {
      if(user){
        Object.assign(user, req.body);
        user.save();
        res.send(user);
      }
    })
    .catch(next);
})
