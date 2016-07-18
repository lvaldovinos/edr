# edr
Event-Driven Router for express like frameworks

##Example Code
```javascript
const http = require('http');
// test it with restify
const express = require('express');
const app = express();
const edr = require('edr');
// create resource hub
const resourceHub = new edr.ResourceHub({
  baseUrl: '/api'
});
// register Resources within resource hub
resourceHub
  .registerResource({
    baseUrl: '/friends',
    name: 'friends'
  })
  // add routes to resource
  .addRoute({
    path: '/',
    method: 'get',
    alias: 'getAll'
  })
  .addRoute({
    path: '/',
    method: 'post',
    alias: 'create'
  })
  .addRoute({
    path: '/:id'.,
    method: 'get',
    alias: 'getById'
  })
  .addRoute({
    path: '/:id'.,
    method: 'put',
    alias: 'updateById'
  })
  .addRoute({
    path: '/:id'.,
    method: 'delete',
    alias: 'removeById'
  });
// send resource hub to edr middleware
app.use(edr({
  resourceHub
}));

// 404 hanlder
app.use((req, res) => {
  res
    .status(404)
    .json({
      message: 'Resource not found'
    });
});

http
  .createServer(app)
  .listen(3030);
  
// listen for events
resourceHub
  .on('friends', (match) => {
    match
      // triggered when GET|PUT|DELETE /api/friends/:id 
      .on('id', (req, res, move, id) => {
        Friends.getById(id, move);
      })
      // triggered when GET /api/friends
      .on('getAll', (req, res, move) => {
        Friends.getAll(move);
      })
      // triggered when POST /api/friends
      .on('create', (req, res, move) => {
        var friend = new Friend(req.body);
        friend.create(move);
      })
      // triggered when GET /api/friends/:id
      .on('getById', (req, res, move, friend) => {
        move(null, friend.toJSON());
      })
      // triggered when PUT /api/friends/:id
      .on('updateById', (req, res, move, friend) => {
        friend
          .update(req.body)
          .save(move);
      })
      // triggered when DELETE /api/friends/:id
      .on('removeById', (req, res, move, friend) => {
        friend
          .remove(move);
      })
      // triggered after previous events are resolved
      // meaning move function is executed
      .on('done', (req, res, next, result) => {
        var response = handleFinalResponseSomehow(result);
        res
          .status(response.code)
          .json(response);
      })
      // if there was an error while executing
      // events above, meaning move first argument
      // is not undefined
      .on('error', (err, req, res, next) {
        next(handlerErrorSomehow(err));
      });
  });
```
