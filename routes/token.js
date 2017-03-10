'use strict';

const express = require('express');
const bcrypt = require('bcrypt-as-promised');
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');


// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex.js')

// YOUR CODE HERE
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
//
const token = jwt.sign({
    data: 'bar'
}, 'secret', {
    expiresIn: '1h'
});

router.get('/token', (req, res) => {
    if (req.body.length === undefined) {
        res.set('Content-type', 'application/json');
        res.status(200).send('false');
    }
});
//
// router.post('/token', (req, res, next) => {
//     return knex('users')
//         .where('email', req.body.email)
//         .then((user) => {
//
//             if (!user[0]) {
//                 res.set('Content-type', 'text/plain');
//                 return res.status(400).send('Bad email or password');
//             };
//           //    if (req.body.password){
//           //   return bcrypt.compare(req.body.password, user[0].hashed_password)
//           //   .then((comparedPassword) => {
//           //     // console.log(comparedPassword);
//           //     if (comparedPassword === false) {
//           //       res.set('Content-Type', 'text/plain');
//           //       return res.status(400).send('Bad email or password')
//           //     }
//           //   })
//           //   .catch((err) => {
//           //     next(err);
//           //   });
//           // }
//         })
//         .catch((err) => {
//             next(err)
//         })
// });

router.post('/users', (req, res, next) => {
    if (!req.body.email) {
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Email must not be blank');
    }

    if (!req.body.password || req.body.passwod < 8) {
        res.set('Content-type', 'text/plain');
        return res.status(400).send('Password must be at least 8 characters long');
    }
    bcrypt.hash(req.body.password, 12)
        .then((hashed_password) => {
            return knex('users')
                .where('email', req.body.email)
                .then((userEmail) => {
                    if (userEmail[0]) {
                        res.set('Content-type', 'text/plain');
                        return res.status(400).send('Email already exists');
                    }
                    return userEmail;
                })
                .then((user) => {
                    return knex('users')
                        .insert({
                            first_name: req.body.firstName,
                            last_name: req.body.lastName,
                            email: req.body.email,
                            hashed_password: hashed_password
                        }, '*');
                })
                .then((users) => {
                    // console.log(users);
                    const user = users[0];
                    delete user.hashed_password;
                    res.send(camelizeKeys(user));
                })
                .catch((err) => {
                    next(err);
                });
        });
});

module.exports = router;
