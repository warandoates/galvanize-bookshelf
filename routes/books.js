'use strict';

const express = require('express');
const knex = require('../knex')

// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE
router.get('/books', (req, res, next) => {
    knex('books')
        .orderBy('title')
        .then((bookRes) => {
            res.json(bookRes);
        })
        .catch((err) => {
            res.sendStatus(404);
            next(err);
        })
});

router.get('/books/:id', (req, res, next) => {
    knex('books')
        .where('id', req.params.id)
        .first()
        .then((book) => {
            if (!book) {
                return next();
            }
            // if (req.params.id < 0 || req.params.id >= book.id.length || isNaN(req.parms.id)) {
            //   return res.sendStatus(404)
            // }
            res.json(book);
        })
        .catch((err) => {
            // res.sendStatus(404);
            next(err);
        });
});

router.post('/books', (req, res, next) => {
    knex('books')
        .insert({
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            description: req.body.description,
            cover_url: req.body.cover_url
        }, '*')
        .then((books) => {
              // console.log(books);
            res.json(books[0]);
        })
        .catch((err) => {
            // res.sendStatus(400, 'Title must not be blank');
            next(err);
        });
});

router.patch('/books/:id', (req, res, next) => {
    knex('books')
        .where('id', req.params.id)
        .first()
        .then((book) => {
            if (!book) {
                return next();
            }
            return knex('books')
                .update({
                    title: req.body.title,
                    author: req.body.author,
                    genre: req.body.genre,
                    description: req.body.description,
                    cover_url: req.body.cover_url
                }, '*')
                .where('id', req.params.id);
        })
        .then((books) => {
          res.send(books[0]);
        })
        .catch((err) => {
          res.sendStatus(404);
          next(err);
        });
});

router.delete('/books/:id', (req, res, next) => {
  let book;
  knex('books')
  .where('id', req.params.id)
  .first()
  .then((row) => {
    if(!row) {
      return next();
    }
    book = row;
    return knex('books')
    .del()
    .where('id', req.params.id)
  })
  .then(() => {
    delete book.id;
    res.send(book);
  })
  .catch((err) => {
    res.sendStatus(404);
    next(err);
  });
});





module.exports = router;
