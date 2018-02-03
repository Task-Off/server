import express from 'express';
import Group from '../model/group.js';
import bodyParser from 'body-parser';
import bearer from '../middleware/bearer-auth.js';
import superagent from 'superagent';
import User from '../model/user.js'

const groupRouter = module.exports = express.Router();

groupRouter.post('/groups', bearer, (req, res, next) => {
  console.log('create route hit successfully.')

  //this route accepts a post to create.
  //it needs req.body.name which becomes the name for the new group
  //it needs req.user._id to locate and update the user with the new groupID

  group = new Group({name: req.body.name})
  group.save()
    .then( group => {

      User.findById(req.user._id)
        .then(user => {
          let groupIDs = user.group_IDs;
          user.group_IDs = groupIDs.push(group._id);
          user.save()
        })
    })
    .catch(next)
})
