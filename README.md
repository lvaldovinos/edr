# edr
Event-Driven Router for node

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
// create a new resuorce
const comments = edr.createResource('commments');
// add routes to new resource

comments.addRoute({
  path: '/comments',
  method: 'post',
  alias: 'create'
  // crud: true optional maybe??
});

edr.mount('/api', [comments]);
```

```javascript
const edr = require('edr');
// get comments resource
const comments = edr.commments();
// handle route
// handler will get triggered when url '/api/comments' POST
comments
  .on('create', (req, res) => {
    // req and res will have whatever properties the framework you're using has, maybe???
    res.json({
      message: 'ok'
    });
  });
```

```javascript
const edr = require('edr');
const fs = require('fs');
// get comments resource
const comments = edr.commments();
// handle route
// handler will get triggered when url '/api/comments' POST
comments
  .on('create', (req, res) => {
    fs.readFile('example.txt', (err, data) => {
      // every resource will have throwError in its prototype
      if (err) return comments.throwError(err);
      // req and res will have whatever properties the framework you're using has, maybe???
      res.json({
        message: 'ok'
      });
    });
  });
// common error handler
edr
  .errorHandler()
  .on('error', (err, req, res) => {
    res.json({
      error: err
    });
  });
```

<code>
  POST - /friends
</code>
```javascript
const edr = require('edr');
const friends = edr.createRestResource('friends');
friends
  .on('create', (req, res, move) => {
    var newFriend = new Friend(req.body);
    newFriend
      .save((err) => {
        if (err) return move(err);
        res.status(200).json({ message: 'created' });
      });
  });
```

<code>
  PUT - /friends/123
</code>
```javascript
const edr = require('edr');
const friends = edr.createRestResource('friends');
friends
  .on('friendId', (req, res, move, friendId) => {
    Friend.findById(friendId, (err, friend) => move(err, friend));
  })
  .on('update', (req, res, move, friend) => {
    friend
      .update(req.body)
      .save()
      .then(() => move(null, { message: 'updated' }))
      .catch((err) => move(err));
  });
  .on('create', (req, res, move) => {
    var newFriend = new Friend(req.body);
    newFriend
      .save((err) => {
        if (err) return move(err);
        return move(null, { message: 'created' });
      });
  });
  .on('error', (err, req, res, next) => next(err));
  .on('done', (req, res, next, result) => res.json(result));
```
