'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const { camelizeKeys, decamelizeKeys } = require('humps');

// YOUR CODE HERE
const knex = require('../knex');

router.get('/favorites', (req, res, next) => {
  if(!req.cookies.token) {
    res.set('Content-type', 'plain/text');
    res.status(401).send('Unauthorized');
  }
  knex('favorites')
  .join('books', 'favorites.book_id', '=', 'books.id')
  .select('*', '*')
  .then((booksRes) => {
      // console.log(booksRes);
      res.status(200).send(camelizeKeys(booksRes));
    // })
  })
    .catch((err) => {
      res.sendStatus(404);
      next(err);
    });
});

router.get('/favorites/:check', (req, res, next) => {
  if(!req.cookies.token) {
    res.set('Content-type', 'plain/text');
    res.status(401).send('Unauthorized');
  }

  knex('favorites')
  .join('books', 'favorites.book_id', '=', 'books.id')
  .select('*', '*')
  .then((booksRes) => {
      let favBooksId = JSON.stringify(booksRes[0].book_id);
      let searchQuery = req.query.bookId;
      console.log('this is table', favBooksId);
      console.log('this is query', searchQuery);
      // console.log('this is from userstable', favBooksId);
      // console.log('this is req.query', req.query.bookId.toString());
      console.log(searchQuery === favBooksId);
      if (searchQuery == favBooksId) {
        res.set('Content-Type', 'application/json');
        res.status(200).send('true');
      } else {
        res.set('Content-Type', 'application/json');
        res.status(200).send('false');
      }
  })
    .catch((err) => {
      res.sendStatus(404);
      next(err);
    });
});
// })

module.exports = router;
