import express from 'express';
import Queue from '../model/queue.js';
import bodyParser from 'body-parser';
import bearer from '../middleware/bearer-auth.js';
import superagent from 'superagent';

const taskRouter = module.exports = express.Router();

taskRouter.get('/queue', (req, res, next) => {
  //get a list of tasks for the group
})

taskRouter.post('/queue', bearer, (req, res, next) => {
  //post a new task
})

taskRouter.put('/queue', bearer, (req, res, next) => {
  //update a task as completed/not completed
  //completed tasks get the user_ID in completedBy
  //uncompleted tasks have the user_ID removed.
  //each task belongs to the group from which the user is posting.


})

/*

  Task router will
    >create new tasks
        -new tasks have
            -name
            -completed - no by default
            -group_ID

    >complete task
        -marks task as completed: true
        -updated completedBy to contain the user_ID of the user who completed.

    >delete task
        -completely removes the task

*/
