const edr = require('../lib/edr');
const should = require('should');
const request = require('supertest');
const express = require('express');
const http = require('http');
let resource = {};
let server = {};

describe('edr test suite', () => {
  before(() => {
    // crreate new express app
    const app = express();
    app.use(edr());
    server = http.createServer(app);
  });
  beforeEach(() => {
    resource = new edr.Resource({
      baseUrl: '/examples',
    });
    // add resources to edr
    edr.addResources([
      resource,
    ]);
  });
  it('Should add one route, and listen for event', (done) => {
    const newRoute = new edr.Route({
      path: '/',
      method: 'post',
      alias: 'create',
    });
    resource
      .addRoute(newRoute)
      .on('match', (match) => {
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
    const newRoute = new edr.Route({
      path: '/:exampleId',
      method: 'get',
      alias: 'getById',
    });
    resource
      .addRoute(newRoute)
      .on('match', (match) => {
        match
        .on('params', (req, res, move, params) => {
          should(params.exampleId).be.exactly('1234');
          setTimeout(() => move(null, 1), 100);
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
    const newRoute = new edr.Route({
      path: '/:id/names/:name',
      method: 'get',
      alias: 'getName',
    });
    resource
      .addRoute(newRoute)
      .on('match', (match) => {
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
            setTimeout(() => move(null, count + 1), 100);
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
  it('Should send a notmatch event', (done) => {
    const newRoute = new edr.Route({
      path: '/',
      method: 'get',
      alias: 'get',
    });
    resource
      .addRoute(newRoute)
      .on('nomatch', (req, res, next) => {
        should(next).be.a.Function();
        res
          .status(404)
          .json({
            message: 'not found',
          });
      });
    request(server)
      .get('/noexists')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        should(res.body.message).be.exactly('not found');
        done();
      });
  });
  it('Should event handlers be optional', (done) => {
    const newRoute = new edr.Route({
      path: '/:id',
      method: 'get',
      alias: 'get',
    });
    resource
      .addRoute(newRoute)
      .on('match', (match) => {
        match
          .on('get', (req, res, move) => {
            setTimeout(() => move(null, 1), 100);
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
  afterEach(() => {
    edr.clear();
  });
});
