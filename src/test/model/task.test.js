'use strict';

import expect from 'expect';
import mongoose from 'mongoose';
import Task from '../../model/task';

let testTask = new Task({"name":"Dishes - do them!", "group_ID":"0000"});
let id = (testTask._id);

testTask.save();

// Test 1. If records get created
describe('Task Model', () => {
  
  mongoose.connect(process.env.MONGODB_URI);
  
  it('should create a task', () =>{
    expect(testTask.name).toEqual('Dishes - do them!');
    expect(testTask.group_ID).toEqual('0000');
    expect(testTask._id).toEqual(id);
  })

  it ('sould save a task record to the DB', ()=>{
      Task.findOne({_id:id})
      .then(task=>{
        console.log('created task', task)
          expect(task._id).toEqual(id);
      })
      .catch(console.error)
  })
  it ('sould remove a task record from the DB', ()=>{ 
    Task.remove({_id:id})
    .then(()=>{
      Task.findOne({_id:id})
      .then(task=> expect(task._id).toEqual(undefined))  
      mongoose.disconnect();
    })
    .catch(err=> {
      console.error;
      mongoose.disconnect()
    });  
  })
})