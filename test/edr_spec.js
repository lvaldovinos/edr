const edr = require('../lib/edr');
const async = require('async');
const should = require('should');
const request = require('supertest');
const express = require('express');
const http = require('http');
const resourceHubOpts = {};
let resourceHub = {};
let resource = {};
let server = {};

describe('edr test suite', () => {
  beforeEach(() => {
    // create resourceHub
    resourceHub = new edr.ResourceHub(resourceHubOpts);
    // crreate new express app
    const app = express();
    app.use(edr({
      resourceHub,
    }));
    app.use((req, res) => {
      res
        .status(404)
        .json({
          message: 'Resource not found',
        });
    });
    server = http.createServer(app);
  });
  beforeEach(() => {
    resource = resourceHub.registerResource({
      baseUrl: '/examples',
      name: 'examples',
    });
  });
  it('Should add one route, and listen for event', (done) => {
    resource
      .addRoute({
        path: '/',
        method: 'post',
        alias: 'create',
      });
    resourceHub
      .on('examples', (match) => {
        match
        .on('create', (req, res) => {
          res.json({
            message: 'testing',
          });
        });
      });
    request(server)
      .post('/examples')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should(res.body.message).be.exactly('testing');
        done();
      });
  });
  it('Should send some parameters in the url', (done) => {
    resource
      .addRoute({
        path: '/:exampleId',
        method: 'get',
        alias: 'getById',
      });
    resourceHub
      .on('examples', (match) => {
        match
        .on('params', (req, res, move, params) => {
          should(params.exampleId).be.exactly('1234');
          setTimeout(() => move(null, 1), 10);
        })
        .on('exampleId', (req, res, move, exampleId, count) => {
          should(exampleId).be.exactly('1234');
          return move(null, count + 1);
        })
        .on('getById', (req, res, move, count) => move(null, count + 1))
        .on('done', (req, res, next, count) => {
          res.json({
            eventsTriggered: count + 1,
          });
        });
      });
    request(server)
      .get('/examples/1234')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should(res.body.eventsTriggered).be.exactly(4);
        done();
      });
  });
  it('Should match several params', (done) => {
    resource
      .addRoute({
        path: '/:id/names/:name',
        method: 'get',
        alias: 'getName',
      });
    resourceHub
      .on('examples', (match) => {
        match
          .on('params', (req, res, move, params) => {
            should(params).have.properties('id', 'name');
            should(params.id).be.exactly('1234');
            should(params.name).be.exactly('luis');
            return move(null, 1);
          })
          .on('id', (req, res, move, id, count) => {
            should(id).be.exactly('1234');
            return move(null, count + 1);
          })
          .on('name', (req, res, move, name, count) => {
            should(name).be.exactly('luis');
            return move(null, count + 1);
          })
          .on('getName', (req, res, move, count) => {
            setTimeout(() => move(null, count + 1), 10);
          })
          .on('done', (req, res, next, count) => {
            should(count).be.exactly(4);
            res.json({
              eventsTriggered: count + 1,
            });
          });
      });
    request(server)
      .get('/examples/1234/names/luis')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should(res.body.eventsTriggered).be.exactly(5);
        done();
      });
  });
  it('Should event handlers be optional', (done) => {
    resource
      .addRoute({
        path: '/:id',
        method: 'get',
        alias: 'get',
      });
    resourceHub
      .on('examples', (match) => {
        match
          .on('get', (req, res, move) => {
            setTimeout(() => move(null, 1), 10);
          })
          .on('done', (req, res, next, count) => {
            res
              .status(200)
              .json({
                count: count + 1,
              });
          });
      });
    request(server)
      .get('/examples/1234')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should(res.body.count).be.exactly(2);
        done();
      });
  });
  it('Should call next function if no resource matches', (done) => {
    resource
      .addRoute({
        path: '/:id',
        method: 'get',
        alias: 'get',
      });
    request(server)
      .get('/noexists')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should(res.body.message).be.exactly('Resource not found');
        done();
      });
  });
  it('Should mount 2 resources', (done) => {
    // add mountUrl
    resourceHubOpts.baseUrl = '/api';
    // add second resource
    const secondResource = resourceHub.registerResource({
      baseUrl: '/examples2',
      name: 'examples2',
    });
    // add mountUrl to all resources
    resourceHub.mount('/api');
    // add routes
    const routeSpec = {
      path: '/',
      method: 'get',
      alias: 'get',
    };
    resource.addRoute(routeSpec);
    secondResource.addRoute(routeSpec);
    resourceHub
      .on('examples', (match) => {
        match
          .on('get', (req, res) => {
            setTimeout(() => {
              res
                .status(200)
                .json({
                  message: 'testing first resource route',
                });
            }, 10);
          });
      })
      .on('examples2', (match) => {
        match
          .on('get', (req, res) => {
            setTimeout(() => {
              res
                .status(200)
                .json({
                  message: 'testing second resource route',
                });
            }, 10);
          });
      });
    async.parallel([
      (callback) => {
        request(server)
          .get('/api/examples')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return callback(err);
            should(res.body.message).be.exactly('testing first resource route');
            return callback(null);
          });
      },
      (callback) => {
        request(server)
          .get('/api/examples2')
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return callback(err);
            should(res.body.message).be.exactly('testing second resource route');
            return callback(null);
          });
      },
    ], done);
  });
  afterEach(() => {
    resourceHub = null;
  });
});
