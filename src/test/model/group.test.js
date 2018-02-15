'use strict';

import expect from 'expect';
import mongoose from 'mongoose';
import Group from '../../model/group';

mongoose.connect(process.env.MONGODB_URI);

let testGroup = new Group({"name":"mockGroup"});
let id = testGroup._id;
// Test 1. If records get created
describe('Group Model', () => {
  it('should create a record', () =>{
    expect(testGroup.name).toEqual('mockGroup');
    expect(testGroup._id).toEqual(id);
  })

  it ('sould save a record to the DB', ()=>{
   let group =  testGroup.save()
    Group.findOne({_id:group._id})
    .then(group=>{
        expect(group._id).toEqual(testGroup._id);
        mongoose.disconnect();
    })
    .catch(console.error)
    mongoose.disconnect();
   })  
})
