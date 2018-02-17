'use strict';
const PORT = 5000;
require('dotenv').config();
import express,{Router} from 'express';
import mongoose from 'mongoose';
import expect from 'expect';
import superagent from 'superagent';
import Task from '../../model/task';
import Group from '../../model/group';
import taskRouter from '../../router/task';

mongoose.Promise = require('bluebird');

const server = require('express')();
server.use(taskRouter);


server.use((err, req, res, next ) => {
    res.status(err.statusCode||500).send(err.message||'server error')
})

beforeAll(()=>{
    server.listen(PORT);
    mongoose.connect(process.env.MONGODB_URI);
})

afterAll(()=>{
    server.close();
    mongoose.connection.close();
})

describe('Task router:', ()=>{
    let taskID='';
    let group = new Group({name:"testGroup"})
    let groupID = group._id;
    group.save();

    it('should respond with a 404 for unregistered paths ',()=>{
        return superagent
        .post(`localhost:${PORT}/si`)
        .set({"Content-Type":"application/json"})
        .send({name:"test"})
        .then(Promise.reject)
        .catch(res=>{
            expect(res.status).toEqual(404);
            expect(res.message).toBe('Not Found')
        })
    })

    it('post should respond with the body content for a post request with a valid body',()=>{
        return superagent 
        .post(`http://localhost:${PORT}/task`)
        .set({'Content-Type':'application/json'})
        .send({name:'test task', group_ID:groupID})
        .then(res => {
            // console.log("POST::::", res.body)
            expect(res.body.name).toBe('test task');
            // expect(res.body.group_ID).toBe(groupID);
            taskID = res.body._id;
        })
        .catch(err => console.log("in post:::::", err.message))
    })

    it ('GET tasks should return a list of tasks with a group ID', ()=>{
        return superagent
        .get(`http://localhost:${PORT}/tasks/${groupID}`)
        .then(res => {
            // console.log("in get::: res.body[0]", res.body[0])
            expect(res.body).not.toBe(undefined);
            expect(res.body[0].group_ID).toEqual(groupID)
            expect(res.body[0].name).toBe('test task')
        })
        .catch(err=>{
            console.log('in put:::', err)
        })
    })

    it ('PUT should update a record in db', ()=>{  
        let id = taskID;
        return superagent
        .put(`http://localhost:${PORT}/task/${id}`)
        .set({"Content-Type":"application/json"})
        .send({name:`edited task`, group_ID:groupID})
            .then( res =>{
                // console.log('in put::::', res.body)
                expect(res.body.name).toEqual('edited task')
            })
            .catch(()=>{
                console.log('id:::', id)})  
    })

    it ('DELETE  should delete a record in db', ()=>{
            return superagent
            .delete
            (`http://localhost:${PORT}/task/${taskID}`)
            .then(res=>{
                // console.log(res.body)
                expect (res.text).toEqual("Success!")
                mongoose.disconnect();
            })
            .catch(()=>{
                mongoose.disconnect();
            })
    })
     mongoose.disconnect();
})
