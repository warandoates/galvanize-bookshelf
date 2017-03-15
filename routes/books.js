'use strict';

const express = require('express');
const knex = require('../knex')

// eslint-disable-next-line new-cap
const router = express.Router();
const ev = require('express-validation');
const validations = require('../validations/books');
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
        });
});

router.get('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        res.set('Content-type', 'text/plain');
        res.status(404).send('Not Found')
    }
    knex('books')
        .where('id', req.params.id)
        .first()
        .then((book) => {
            if (!book) {
                res.set('Content-type', 'text/plain');
                res.status(404).send('Not Found');
            }
            res.json(book);
        })
        .catch((err) => {
            next(err);
        });
});

router.post('/books', ev(validations.post),(req, res, next) => {
    // if (!req.body.title) {
    //     res.set('Content-Type', 'text/plain')
    //     return res.status(400).send('Title must not be blank');
    // }
    // if (!req.body.author) {
    //     res.set('Content-Type', 'text/plain')
    //     return res.status(400).send('Author must not be blank');
    // }
    // if (!req.body.genre) {
    //     res.set('Content-Type', 'text/plain')
    //     return res.status(400).send('Genre must not be blank');
    // }
    // if (!req.body.description) {
    //     res.set('Content-Type', 'text/plain')
    //     return res.status(400).send('Description must not be blank');
    // }
    // if (!req.body.cover_url) {
    //     res.set('Content-Type', 'text/plain')
    //     return res.status(400).send('Cover URL must not be blank');
    // } else {

       knex('books')
            .insert({
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                description: req.body.description,
                cover_url: req.body.cover_url
            }, '*')
            .then((books) => {
                res.send(books[0]);
            })
            .catch((err) => {
                next(err);
            });
    // }
});

router.patch('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        res.set('Content-type', 'text/plain');
        res.status(404).send('Not Found');
    } else {

        knex('books')
            .where('id', req.params.id)
            .first()
            .then((book) => {
                if (!book) {
                    res.set('Content-type', 'text/plain');
                    return res.status(404).send('Not Found');
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
                // res.sendStatus(404);
                next(err);
            });
    }
});

router.delete('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        res.set('Content-type', 'text/plain');
        return res.status(404).send('Not Found');
    } else {

        let book;
        knex('books')
            .where('id', req.params.id)
            .first()
            .then((row) => {
                if (!row) {
                    res.set('Content-type', 'text/plain');
                    res.status(404).send('Not Found');
                } else {
                    // }
                    book = row;
                    return knex('books')
                        .del()
                        .where('id', req.params.id)
                }
            })
            .then(() => {
                if (!book) {
                    return res.status(404).send('Not Found');
                } else {
                    delete book.id;
                    res.send(book);
                }
            })
            .catch((err) => {
                next(err);
            });
    }
});





module.exports = router;
