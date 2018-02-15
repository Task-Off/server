'use strict'

import express from 'express';
import Task from '../model/task.js';
import User from '../model/user';
import bodyParser from 'body-parser';
// import bearer from '../middleware/bearer-auth.js';
// import superagent from 'superagent';
import Group from '../model/group.js'


const taskRouter = module.exports = express.Router();

//get a list of tasks by groupID
taskRouter.get('/tasks/:groupID', (req, res, next) => {

  if(!req.params.groupID) next(400);
  let groupID = req.params.groupID;
  
  //Get all the tasks for the requested group
  Task.find({group_ID: groupID})
    .then( tasks => {
      if(tasks) res.send(tasks); 
    })
    .catch(next)
})
 
//save a new task
taskRouter.post('/task',  bodyParser.json(), (req, res, next) => {

  if(!req.body.name) next(400);

  let groupID = req.body.group_ID;

  //First get the group name, to add to task record afterwards
  Group.findById(groupID)
    .then(group => {return group.name; })
    .then(groupName => {
      let task = new Task({
        "name": req.body.name,
        "group_ID": groupID,
        "groupName": groupName
      })
      return task.save();
    })
    .then(task => res.send(task))
    .catch(next)
})

taskRouter.put('/task/:id', bodyParser.json(), (req, res, next) => {
  //console.log('@@@@@@@@in put task router: req.body::::', req.body);
  let task = new Task({
    "name": req.body.name,
    "group_ID": req.body.group_ID
  })
   //updating task
   Task.findOne({_id:req.params.id})
   .then( task => {
     // console.log('task found:', task.name, 'req.body:::', req.body)
     Object.assign(task, req.body);
     task.save();
     res.send(task)
   })  
   .catch(next); 

  //adding checked task to completed tasks array in user model
  if (req.body.completed){
    User.findOne({_id:req.body.completedBy})
        .then(user => {
          if(user){
            Object.assign(user, {completedTasks:[...user.completedTasks, req.body._id]});
            user.save();
            // console.log('user model after updating::::', user)
          }
        })
        .catch(err => console.log(err))
  } else {
    //removing unchecked tasks from completed tasks array in user model
    User.findOne({_id:req.body.completedBy})
        .then(user => {
          if(user){
            // console.log('use before uncheck:::', user)
            user.completedTasks = user.completedTasks.filter(task => {return task!==req.body._id})
            user.save();
          //  console.log('user model after unchecking::::', user)
          }
        })
        .catch(err => console.log(err))
  }
})
  
taskRouter.delete('/task/:id',   (req, res, next) => {
    // console.log('in delete task router: req.body, id::::', req.params._id)

    //delete a task
    Task.remove({_id:req.params.id})
     .then(()=>res.send('success!'))
     .catch(next)

    //if task is deleted, delete from all user's lists of completed tasks
    User.find({})
        .then(user => user.forEach(element => {
          element.completedTasks = element.completedTasks.filter(id => {return id!==req.params._id})
          element.save();
          console.log('user model after delete task::::', user)
        }))
        .catch(err => console.log(err))  
})
