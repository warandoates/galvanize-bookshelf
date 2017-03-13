'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');

// YOUR CODE HERE
const knex = require('../knex');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cert = process.env.JWT_KEY;

function tokenAuth(req, res, next) {
    jwt.verify(req.cookies.token, cert, (err, payload) => {
        if (err) {
            res.set('Content-type', 'text/plain');
            res.status(401).send('Unauthorized');
        } else {
            req.token = payload;
            return next()
        }
    });
}

router.get('/favorites', tokenAuth, (req, res, next) => {
    knex('favorites')
        .join('books', 'favorites.book_id', '=', 'books.id')
        .select('*', '*')
        .then((booksRes) => {
            res.status(200).send(camelizeKeys(booksRes));
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/favorites/:check', tokenAuth, (req, res, next) => {
    let searchQuery = req.query.bookId;

    if (isNaN(searchQuery)) {
        res.set('Content-Type', 'text/plain');
        res.status(400).send('Book ID must be an integer');
    } else {
        knex('favorites')
            .join('books', 'favorites.book_id', '=', 'books.id')
            .select('*', '*')
            .then((booksRes) => {
                let favBooksId = JSON.stringify(booksRes[0].book_id);

                if (searchQuery == favBooksId) {
                    res.set('Content-Type', 'application/json');
                    res.status(200).send('true');
                } else {
                    res.set('Content-Type', 'application/json');
                    res.status(200).send('false');
                }
            })
            .catch((err) => {
                res.set('Content-type', 'text/plain')
                res.sendStatus(404);
                next(err);
            });
    }
});

router.post('/favorites', tokenAuth, (req, res, next) => {
    const reqBookId = req.body.bookId;
    const cookieUserId = req.token.userId;
    if (isNaN(reqBookId)) {
        res.set('Content-Type', 'text/plain');
        res.status(400).send('Book ID must be an integer');
    } else {

    knex('books')
        .where('id', reqBookId)
        .first()
        .then((row) => {
            if (!row) {
                res.set('Content-Type', 'text/plain');
                res.status(404).send('Book not found');
            } else {
                return knex('favorites')
                    .insert({
                        book_id: reqBookId,
                        user_id: cookieUserId
                    }, '*')
                    .then((favoritesNewEntry) => {
                        res.status(200).send(camelizeKeys(favoritesNewEntry[0]));
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
        });
      }
});

router.delete('/favorites', tokenAuth, (req, res, next) => {
    const reqBookId = req.body.bookId;
    const cookieUserId = req.token.userId;
    if (isNaN(reqBookId)) {
        res.set('Content-Type', 'text/plain');
        res.status(400).send('Book ID must be an integer');
    } else {
        let fav;

        knex('favorites')
            .where('book_id', reqBookId)
            .first()
            .then((row) => {
                if (!row) {
                    res.set('Content-Type', 'text/plain');
                    res.status(404).send('Favorite not found');
                }
                fav = row;
                return knex('favorites')
                    .del()
                    .where('id', cookieUserId)
            })
            .then(() => {
                delete fav.id;
                res.send(camelizeKeys(fav));
            })
            .catch((err) => {
                next(err);
            });
    }
});


module.exports = router;
