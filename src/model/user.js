'use strict';

// DEPENDECIES
import * as bcrypt from 'bcrypt';
import {randomBytes} from 'crypto';
import * as jwt from 'jsonwebtoken';
import createError from 'http-errors';
import {promisify} from '../lib/promisify.js';
import Mongoose, {Schema} from 'mongoose';

// SCHEMA
const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    passwordHash: {type: String},
    tokenSeed: {type: String, unique: true, default: ''},
    group_IDs: [{type: String}],
    groupNames: {type: Array},
    groupAliases: {type: Array},
    completedTasks: {type: Array}, 
    firstName: {type: String}   
});

// INSTANCE METHODS
userSchema.methods.passwordCompare = function(password){
    return bcrypt.compare(password, this.passwordHash)
        .then(success => {
            if (!success) {
                throw createError(401, 'AUTH ERROR: wrong password');
            }
            return this;
        });
};

userSchema.methods.tokenCreate = function(){

    this.tokenSeed = randomBytes(32).toString('base64');
    console.log('token ', this.tokenSeed)
    return this.save()
        .then(user => {
            return jwt.sign({tokenSeed: this.tokenSeed}, process.env.SECRET);
        })
        .then(token => {
            return token;
        });

};

// MODEL
const User = Mongoose.model('user', userSchema);

// STATIC METHODS
User.createFromSignup = function (user) {

    if(!user.password || !user.email || !user.username) {
        return Promise.reject( createError(400, 'VALIDATION ERROR: missing username email or password ') );
    }

    let {password} = user;
    user = Object.assign({}, user, {password: undefined});

    return bcrypt.hash(password, 1)
        .then(passwordHash => {
            let data = Object.assign({}, user, {passwordHash});
            return new User(data).save();
        });

};

User.createFromOAuth = function (OAuthUser) {

  if ( ! OAuthUser || ! OAuthUser.email ) {
      return Promise.reject( createError(400, 'VALIDATION ERROR: missing username email or password ') );
  }

  return User.findOne({email:OAuthUser.email})
      .then(user => {
          if ( ! user ) { throw new Error ("User Not Found"); }
          console.log("Welcome Back", user.username);
          return user;
      })
      .catch( error => {
          // Create the user
          let username = OAuthUser.email.split('@')[0];
          let email = OAuthUser.email;
          let lastInitial = OAuthUser.family_name.length ? OAuthUser.family_name.slice(0, 1) : undefined;
          let firstname = OAuthUser.given_name.length ? OAuthUser.given_name : username;
          let name = (lastInitial && OAuthUser.given_name.length) ? firstname + ' ' + lastInitial : firstname;

          console.log("Welcome To Our World", username);
          return new User({
              username: username,
              email: OAuthUser.email,
              firstName: name
          }).save();
      })

};

// INTERFACE
export default User;
