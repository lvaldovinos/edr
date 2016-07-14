const EventEmmiter = require('events');

class ResourceHub extends EventEmmiter {
  constructor(opts) {
    super();
    this.baseUrl = opts.baseUrl || '';
    this.resources = new Set();
  }
  registerResource(resourceOpts) {
    const routes = resourceOpts.routes || [];
    const newResource = {
      baseUrl: resourceOpts.baseUrl,
      mountUrl: this.baseUrl,
      routes: new Set(routes),
      name: resourceOpts.name,
    };
    // save resource spec into resources
    this.resources.add(newResource);
    return {
      addRoute: (routeOpts) => newResource.routes.add(routeOpts),
    };
  }
  mount(baseUrl) {
    this.baseUrl = baseUrl;
    for (const resource of this.resources) {
      resource.mountUrl = this.baseUrl;
    }
    return this;
  }
}

module.exports = ResourceHub;
