'use strict';

const express = require('express');
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const {camelizeKeys,decamelizeKeys} = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();
const jwt = require('jsonwebtoken');
const cert = process.env.JWT_KEY;


// YOUR CODE HERE
router.post('/users', (req, res, next) => {
    if (!req.body.email) {
        res.set('Content-type', 'text/plain');
        res.status(400).send('Email must not be blank');
    }

    if (!req.body.password || req.body.passwod < 8) {
        res.set('Content-type', 'text/plain');
        res.status(400).send('Password must be at least 8 characters long');
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
                    const user = users[0];
                    const claims = {
                      userId: user.id
                    };
                    const token = jwt.sign(claims, cert, {
                      expiresIn: '7 days'
                    });
                    res.cookie('token', token, {
                        path: '/',
                        httpOnly: true,
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                        secure: router.get('env') === 'development'
                    });
                    delete user.hashed_password;
                    res.send(camelizeKeys(user));
                })
                .catch((err) => {
                    next(err);
                });
        });
});

module.exports = router;
