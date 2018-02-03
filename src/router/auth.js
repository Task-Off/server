'use strict'

import {Router} from 'express';
import User from '../model/user.js';
import bodyParser from 'body-parser';
import basicAuth from '../middleware/basic-auth.js';
import bearerAuth from '../middleware/bearer-auth.js';
import superagent from 'superagent';

let URL = process.env.CLIENT_URL;

export default new Router()

    // TODO: Need routes to GET a user using only their bearer token, and to do a PUT on a user account.
    // TODO: These can go here to get things wired up, but probably belong in a different route that's just for user data

    .post('/signup', bodyParser.json() , (req, res, next) => {
        console.log('hiiiiiii?')
        new User.createFromSignup(req.body)
            .then(user => user.tokenCreate())
            .then(token => {
                res.cookie('X-BBB-Token', token, {domain:process.env.COOKIE_DOMAIN});
                res.send(token);
                console.log('ello!')
            })
            .catch(next);
    })
    
    .get('/usernames/:username', (req, res, next) => {
    
        User.findOne({username: req.params.username})
            .then(user => {
                if(!user) {
                    return res.sendStatus(200);
                }
                return res.sendStatus(409);
            })
            .catch(next);
    })
    
    .get('/login', basicAuth, (req, res, next) => {
        
        req.user.tokenCreate()
            .then((token) => {
                res.cookie('X-BBB-Token', token, {domain:process.env.COOKIE_DOMAIN});
                res.send(token);
            })
            .catch(next);
    })
    
    .get('/oauth/google/code', (req, res, next) => {
         console.log('HELLLLLLLLLLLLLLLLLLLLLO')
        let code = req.query.code;
      
        console.log('(1) code', code);
        console.log('redirect uri is ', process.env.API_URL + 'oauth/google/code')
        
        // exchange the code or a token
        // superagent.post('https://www.googleapis.com/oauth2/v4/token')
        superagent.post('https://id.heroku.com/oauth/token')
            .type('form')
            .send({
                code: code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.API_URL}/oauth/google/code`,
                grant_type: 'authorization_code'
            })
            .then( response => {
                let googleToken = response.body.access_token;
                console.log("(2) google token", googleToken); 
                return googleToken;
            })
            // use the token to get a user
            .then ( token => {
                return superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
                    .set('Authorization', `Bearer ${token}`)
                    .then (response => {
                        let user = response.body;
                        console.log("(3) Google User", user); 
                        return user;
                    })
            })
            .then(googleUser => {
                return User.createFromOAuth(googleUser);
            })
            .then ( user => {                
                return user.tokenCreate();
            })
            .then ( token => {
                res.cookie('X-BBB-Token', token, {domain:process.env.COOKIE_DOMAIN});
                res.redirect(URL);
            }) 
            .catch( error => {
                console.error(error);
                res.redirect(URL);
            });
        
    })
        
;