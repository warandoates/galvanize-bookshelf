'use strict';

const express = require('express');
const bcrypt = require('bcrypt-as-promised');
const { camelizeKeys, decamelizeKeys } = require('humps');


// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex.js')

// YOUR CODE HERE
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cert = process.env.JWT_KEY;


router.get('/token', (req, res) => {
    if (req.body.length === undefined) {
        res.set('Content-type', 'application/json');
        res.status(200).send('false');
    }
});

router.post('/token', (req, res, next) => {
  return knex('users')
  .then((users) => {
    // console.log(users[0]);
    // console.log('this is reqbody', req.body);
   bcrypt.compare(req.body.password, users[0].hashed_password )
    .then((res) => {
      // console.log(res);
      if(!res) {
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Bad email or password');
      } else {
        return res;
      }
    })
    .then((authOk) => {
      return knex('users')
      .where('email', req.body.email)
      .then((authUser) => {
        delete users[0].hashed_password;


        let claims = {userId: authUser[0].id};
            const token = jwt.sign(claims, cert, {
              expiresIn: '7 days'
            });
            // console.log(token);
            res.cookie('token', token, {path:'/',
              httpOnly: true,
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
              secure: router.get('env') === 'development'
            });
            res.send(camelizeKeys(users[0]));

            // console.log(res.cookies);

      })
      .catch((err) => {
        next(err)
      });
    });
  });

});



// YOUR CODE HERE
// router.post('/token', (req, res, next) => {
//     if (!req.body.email) {
//         res.set('Content-type', 'text/plain');
//         return res.status(400).send('Email must not be blank');
//     }
//
//     if (!req.body.password || req.body.passwod < 8) {
//         res.set('Content-type', 'text/plain');
//         return res.status(400).send('Password must not be blank');
//     }
//     bcrypt.hash(req.body.password, 12)
//         .then((hashed_password) => {
//             return knex('users')
//                 .where('email', req.body.email)
//                 .then((userEmail) => {
//                     if (userEmail[0]) {
//                         res.set('Content-type', 'text/plain');
//                         return res.status(400).send('Email already exists');
//                     }
//                     return userEmail;
//                 })
//                 .then((user) => {
//                     return knex('users')
//                         .insert({
//                             first_name: req.body.firstName,
//                             last_name: req.body.lastName,
//                             email: req.body.email,
//                             hashed_password: hashed_password
//                         }, '*');
//                 })
//                 .then((users) => {
//                     // console.log(users);
//                     const user = users[0];
//                     let claim = {userId: user.id};
//                     const token = jwt.sign(claim, cert, {
//                       expiresIn: '7 days'
//                     });
//                     res.cookie('token', token, {
//                       httpOnly: true,
//                       expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
//                       secure: router.get('env') === 'production'
//                     })
//
//                     delete user.hashed_password;
//                     res.send(camelizeKeys(user));
//                 })
//                 .catch((err) => {
//                     next(err);
//                 });
//         });
// });
module.exports = router;
