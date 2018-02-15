'use strict';
const PORT = 5000;
require('dotenv').config();
import express,{Router} from 'express';
import mongoose from 'mongoose';
import expect from 'expect';
import superagent from 'superagent';
import Task from '../../model/task';
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

    it('should respond with a 404 for unregistered paths ',()=>{
        return superagent
        .post(`localhost:${PORT}/si`)
        .set({"Content-Type":"application/json"})
        .send({"name":"test"})
        .then(Promise.reject)
        .catch(res=>{
            expect(res.status).toEqual(404);
            expect(res.message).toBe('Not Found')
        })
    })

    let idForGet;
    let groupID = '5a7a04a22a1b52cf493006dc';
    it('post should respond with the body content for a post request with a valid body',()=>{
        superagent 
        .post(`http://localhost:${PORT}/task`)
        // .set({'Content-Type':'application/json'})
        .send({'name':'test task', 'group_ID':groupID})
        .then((res) => {
            console.log('in post, res::::::::::::: ' , res.body)
            expect(res.body.name).toBe('test task');
            expect(res.body.group_ID).toBe(groupID)
            idForGet = res.body.id;
        })
        .catch(err=> console.log(err.message))
        // .catch(err => console.log(err))
    })

    it ('GET tasks should return a list of tasks with a group ID', ()=>{
        
        superagent
        .get(`http://localhost:${PORT}/tasks/${groupID}`)
        .end((err, res) => {
            expect(res.body).not.toBe(null);
            expect(res.body.groupID).toEqual(groupID)
        })
    })

    it ('PUT should update a record in db', ()=>{  
        superagent
        .put(`http://localhost:${PORT}/task`)
        .set({"Content-Type":"application/json"})
        .send({'completedBy':`iryna`})
            .then(()=>{
                superagent
                .get(`http://localhost:${PORT}/tasks/${groupID}`)
                .end((err, res) => {
                expect(res.body).not.toBe(null);
                expect(res.body.completedBy).toEqual('hello')
            })
        })   
    })

    it ('DELETE  should delete a record in db', ()=>{
        superagent
        .post(`http://localhost:${PORT}/task`)
        .set({'Content-Type':'application/json'})
        .send({'name':'test task two', 'group_ID':groupID})
        .then(res =>{
            superagent
            .delete
            (`http://localhost:${PORT}/task/${res.task._id}`)
            .then(res=>{
                console.log(res.body)
                expect (res.text).toEqual("Success!")
                mongoose.disconnect();
            })
            .catch(()=>{
                mongoose.disconnect();
            })
        })
    })
})
