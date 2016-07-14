# edr
Event-Driven Router for express like frameworks

##Example Code
```javascript
const http = require('http');
// test it with restify
const express = require('express');
const app = express();
const edr = require('edr');

app.use(edr());

http
  .createServer(app)
  .listen(3030);
```

```javascript
const edr = require('edr');
// create a new resource
const comments = new edr.Resource({
  baseUrl: '/commments'
});
// add new resource to edr
edr
  .addResource([
    comments,
  ]);
// create new route and add it into a resource
// add routes to new resource
const newRoute = new edr.Route({
  path: '/',
  method: 'post',
  alias: 'create',
});
comments
  .addRoute(newRoute)
  .on('match', (match) => {
    match
      .on('create', (req, res) => {
        setTimeout(() => res.json({ message: 'create' }), 100);
      });
  })
  .on('nomatch', (req, res, next) => next(null));
```

```javascript
const edr = require('edr');
const fs = require('fs');
// create a new resuorce
const comments = new edr.Resource({
  baseUrl: '/commments'
});
// add new resource to edr
edr
  .addResource([
    comments,
  ]);
// create new route and add it into a resource
// add routes to new resource
const createRoute = new edr.Route({
  path: '/',
  method: 'post',
  alias: 'create',
});
const getRoute = new edr.Route({
  path: '/:id',
  method: 'get',
  alias: 'getComment',
});
comments
  .addRoute(createRoute)
  .addRoute(getRoute)
  .on('match', (match) => {
    match
      // move is used by edr
      .on('create', (req, res, move) => {
        const newComment = new Comment(req.body);
        newComment.save((err) => {
          if (err) return move(err);
          return move(null, {
            code: 201,
            message: 'resource created',
          });
        });
      })
      .on('id', (req, res, move, id) => {
        Comment.getById(id, (err, comment) => {
          if (err) return move(err);
          return move(null, {
            code: 200,
            data: comment,
          });
        });
      })
      // next function used by express
      .on('done', (req, res, next, result) => {
        res
          .status(result.code)
          .json(result);
      })
      // next function used by express
      .on('error', (err, req, res, next) => next(err));
  })
  // next function used by express
  .on('nomatch', (req, res, next) => next(null));
