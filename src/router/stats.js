'use strict'

import express from 'express';
import Group from '../model/groups.js';
import User from '../model/user.js';
import Tasks from '../router/task.js';
import bodyParser from 'body-parser';
import bearer from '../middleware/bearer-auth.js';
import superagent from 'superagent';

const statsRouter = module.exports = express.Router();

//get an array of objects containing task information for each user
statsRouter.get('/stats/:id', bearer, bodyParser.json(), (req, res, next) => {
  let table = []

  Group.find({id: req.params.id})
    .then(group => {
      group.user_ID.map(userID => {
        table.push({_id: userID})
      })
    })

    // <Piechart x={100} y={100} outerRadius={100} innerRadius={50}
    //           data={[{value: 92-34, label: 'Code lines'},
    //                  {value: 34, label: 'Empty lines'}]} />

    table.map( userID, i => {
      User.find({_id: userID})
        .then(user => {
          table[i].value = user.completed;
          table[i].label = user.username;
        })
    })
  res.send(table);

}
