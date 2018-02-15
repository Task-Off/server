'use strict';

import expect from 'expect';
import mongoose from 'mongoose';
import User from '../../model/user';
mongoose.connect(process.env.MONGODB_URI);

let testUser = new User({"username": "Princess Ariel"});
let id = (testUser._id);

// Test 1. If records get created
describe('User Model', () => {

  it('should create a user record', () =>{
    expect(testUser.username).toEqual('Princess Ariel');
    expect(testUser._id).toEqual(id);
  })

  it ('sould save a record to the DB', ()=>{
    testUser.save();
    User.findOne({_id:id})
    .then(user=>{
        expect(user._id).toEqual(id);
        mongoose.disconnect();
    })
    .catch(console.error)
    mongoose.disconnect();
   }) 
   it ('sould remove a user record from the DB', ()=>{ 
        User.remove({_id:id})
        .then(()=>{
          User.findOne({_id:id})
          .then(user=> expect(user._id).toEqual(undefined))  
          mongoose.disconnect();
        })
        .catch(err=> {
          console.error;
          mongoose.disconnect()
        });
    })
    mongoose.disconnect()
})

