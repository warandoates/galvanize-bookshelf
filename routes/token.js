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
const cert = process.env.JWT_KEY;


router.get('/token', ( req, res, next) => {

    if (req.cookies.token === undefined) {
        res.set('Content-type', 'application/json');
        res.status(200).send('false');
    } else {
    res.set('Content-type', 'application/json');
    res.status(200).send('true');
  }
})

router.post('/token', (req, res, next) => {
  if (!req.body.email) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Email must not be blank');
  }

  if(!req.body.password) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Password must not be blank')
  }
  return knex('users')
    .where('email', req.body.email)
    .then((users) => {
      if(!users[0]) {
        res.set('Content-Type', 'text/plain');
        res.status(400).send('Bad email or password');
      } else {
      bcrypt.compare(req.body.password, users[0].hashed_password)
          .then((res) => {
              return res;
          }).catch((err) => {
            res.set('Content-type', 'text/plain');
             res.status(400).send('Bad email or password');
          })
          .then((authOk) => {
              return knex('users')
                  .where('email', req.body.email)
                  .then((authUser) => {
                    delete users[0].hashed_password;
                    let claims = {
                        userId: authUser[0].id
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
                    res.send(camelizeKeys(users[0]));
                  });
          });
        }
    }).catch((err) => {
      next(err);
    })
});

router.delete('/token', (req, res, next) => {
  res.clearCookie('token',{ path: '/' });
  res.set('Content-type', 'text/plain');
  res.status(200).send(true);
});



module.exports = router;
