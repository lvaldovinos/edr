const edr = require('../lib/edr');
const should = require('should');
let resource = {};

describe('Resource test suite', () => {
  beforeEach(() => {
    resource = new edr.Resource({
      baseUrl: '/friends',
    });
  });
  it('Should create a new resource', () => {
    should(resource).have.properties(['addRoute', 'matchRoute']);
  });
  it('Should add a route and match it', () => {
    const newRoute = new edr.Route({
      alias: 'create',
      path: '/',
      method: 'post',
    });
    resource.addRoute(newRoute);
    const events = resource
      .matchRoute({
        method: 'post',
        path: '/friends',
      })
      .events;
    for (const event of events) {
      should(event.eventName).be.equalOneOf('create', 'done');
    }
    should(events.size).be.exactly(2);
  });

  it('Should add a param and match it', () => {
    const newRoute = new edr.Route({
      alias: 'getById',
      path: '/:friendId',
      method: 'get',
    });
    const events = resource
      .addRoute(newRoute)
      .matchRoute({
        method: 'get',
        path: '/friends/1234',
      })
      .events;
    for (const event of events) {
      should(event.eventName).be.equalOneOf('params', 'friendId', 'getById', 'done');
    }
    should(events.size).be.exactly(4);
  });
  afterEach(() => {
    resource.clear();
  });
});
