'use strict'

import express from 'express';
import Group from '../model/group';
import User from '../model/user';
import Task from '../router/task';
// import bodyParser from 'body-parser';
// import bearer from '../middleware/bearer-auth';
// import superagent from 'superagent';

const statsRouter = module.exports = express.Router();

//get an array of objects containing task information for each user
statsRouter.get('/stats/:id', (req, res, next) => {
  let table = []
console.log('in backend, stats route ', req.params)
  Group.findOne({_id: req.params.id})
    .then(group => {
      console.log('::::::::::::', group)
      group.user_IDs.forEach(userID => {
        table.push({"id":userID})
      })
      console.log("table: ", table)
      return table
    })
    .then(table =>{
      console.log("in last then: ",table)
      table.forEach( (obj, i) => {
        User.find({_id: obj.id})
          .then(user => {
            let tableLength = 0;
            if(user.completedTasks) retval + user.completedTasks.length();
            table[i].value = tableLength;
            table[i].label = user.firstName;
          })   
      })
      res.send(table)
    })
    .catch(next);
})
    
  //  console.log('::::::::::::', table)
    // <Piechart x={100} y={100} outerRadius={100} innerRadius={50}
    //           data={[{value: 92-34, label: 'Code lines'},
    //                  {value: 34, label: 'Empty lines'}]} />

   
