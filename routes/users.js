'use strict';

const express = require('express');
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const {camelizeKeys, decamelizeKeys} = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE
router.post('/users', (req, res, next) => {
  bcrypt.hash(req.body.password, 12)
  .then((hashed_password) => {
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
    delete user.hashed_password;
    res.send(camelizeKeys(user));
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
