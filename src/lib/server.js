'use strict'

// DEPENDENCIES
import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import * as mongo from './mongo.js'

import authRouter from '../router/auth.js'
import userRouter from '../router/user.js'
import groupRouter from '../router/group.js'
import taskRouter from '../router/task.js'
import fourOhFour from '../middleware/four-oh-four.js'
import statsRouter from '../router/stats.js'
import errorHandler from '../middleware/error-middleware.js'

// STATE
const app = express()

app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, Authorization, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials',  true);
  req.header('Access-Control-Request-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.all('*', (req, res) => res.sendStatus(404))
// global middleware
app.use(morgan('dev'))

// routers

app.use(userRouter)
app.use(authRouter)
app.use(groupRouter)
app.use(taskRouter)
// app.use(statsRouter)



// handle errors
app.use(fourOhFour)
app.use(errorHandler)

const state = {
  isOn: false,
  http: null,
}

// INTERFACE
export const start = (port) => {
  return new Promise((resolve, reject) => {
    if (state.isOn)
      return reject(new Error('USAGE ERROR: the state is on'))
    state.isOn = true
    mongo.start()
    .then(() => {
      state.http = app.listen(port || process.env.PORT, () => {
        console.log('__SERVER_UP__', process.env.PORT)
        resolve()
      })
    })
    .catch(reject)
  })
}

export const stop = () => {
  return new Promise((resolve, reject) => {
    if(!state.isOn)
      return reject(new Error('USAGE ERROR: the state is off'))
    return mongo.stop()
    .then(() => {
      state.http.close(() => {
        console.log('__SERVER_DOWN__')
        state.isOn = false
        state.http = null
        resolve()
      })
    })
    .catch(reject)
  })
}
