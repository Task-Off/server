'use strict';
const PORT = 5000;
require('dotenv').config();
import express,{Router} from 'express';
import mongoose from 'mongoose';
import expect from 'expect';
import superagent from 'superagent';
import Group from '../../model/group';
import User from '../../model/user';
import groupRouter from '../../router/group';

mongoose.Promise = require('bluebird');

const server = require('express')();
server.use(groupRouter);


server.use((err, req, res, next ) => {
    res.status(err.statusCode||500).send(err.message||'server error')
})

const API = 'http://localhost:5000/group';
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"

beforeAll(()=>{
    // server.listen(PORT);
    mongoose.connect(process.env.MONGODB_URI)
})

afterAll(()=>{
    server.close();
    mongoose.connection.close();
})

describe("Group router ", ()=>{
    
    let testUser = new User({
        username: "testUser",
        email:"testUser1@gmail.com"
    });
    testUser.save();
    let userIdToUse = testUser._id;

    let testGroup = new Group({
        name: "testGroup",
        alias:"some-unique-alias"
    });
    testGroup.save();
   
    it ('POST should respond with 400 if no body', ()=>{
        superagent
        .post(`API`)
        .set('Authorization', `Bearer ${token}`,{'content-type':'application/json'})
        .send({})
        .end((err, res) => {
            expect(err.status).toNotEqual(undefined);
        })
    })

    it('POST should return user with the group data assigned, if the group name is provided', () => {
        superagent
        .post(`${API}/post`)
        .set('Authorization', `Bearer ${token}`)
        .set({'content-type':'application/json'})
        .send({"name": "testGroup", "alias": "some-unique-alias", "createdBy":userIdToUse, "user_IDs": userIdToUse})
        .then(res => {
          console.log("testUser is: ", testUser)
          console.log("Users groups:  ", testUser.groupNames);
          expect(testUser.groupNames.length).notToEqual(0);
          expect(testUser.groupAliases.length).notToEqual(0);
          expect(testUser.groupNames[0]).toEqual("testGroup");
          testGroupId = testUser.group_IDs[0];
        })
        .catch(err => {
            console.log(err.message, err.status);
        })
    }) 

    // it('DELETE should delete group or unsubscribe user provided groupID and userID', () => {  
    //     superagent
    //     .delete(`${API}/delete/${testGroup._id}`)
    //     .set('Authorization', `Bearer ${token}`)
    //     .set({'content-type':'application/json'})
    //     .send({'id':testUser._id})
    //     .end((err,res)=>{
          
    //         mongoose.disconnect();
    //     })
    // })   
    mongoose.disconnect(); 
})