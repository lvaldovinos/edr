const Resource = require('./resource');
const pluralize = require('pluralize');

class RestResource extends Resource {
  constructor(name) {
    super();
    this.name = name;
    // add post route
    this.addRoute({
      path: `/${this.name}`,
      alias: 'create',
      method: 'post',
    });
    // add default routes
    [
      {
        method: 'get',
        alias: 'read',
      },
      {
        method: 'put',
        alias: 'update',
      },
      {
        method: 'delete',
        alias: 'delete',
      },
    ].forEach(({ method, alias }) => {
      const newRoute = {
        method,
        alias,
        path: `/${this.name}/:${pluralize(this.name, 1)}`,
      };
      this.addRoute(newRoute);
    });
  }
}

module.exports = RestResource;
