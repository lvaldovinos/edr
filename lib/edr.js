const Resource = require('./resource');
const Route = require('./route');
const Match = require('./match');
const ResourceHub = require('./resource-hub');

function edr(opts) {
  return (req, res, next) => {
    const resourceHub = opts.resourceHub;
    const resources = new Set();
    let noEventsCounter = 0;
    for (const resourceSpec of resourceHub.resources) {
      const newResource = new Resource(resourceSpec);
      const routes = new Set();
      for (const routeSpec of resourceSpec.routes) {
        routes.add(new Route(routeSpec));
      }
      newResource
        .addMountUrl(resourceSpec.mountUrl)
        .addRoutes(routes);
      resources.add(newResource);
    }
    for (const resource of resources) {
      resource
        .on('match', (match) => resourceHub.emit(resource.name, match));
    }
    for (const resource of resources) {
      const events = resource
        .matchRoute({
          method: req.method.toLowerCase(),
          path: req.url,
        })
        .events;
      if (events.size) {
        const match = new Match({
          events,
          next,
          req,
          res,
        });
        resource.emit('match', match);
      } else {
        noEventsCounter += 1;
      }
    }
    // okay among all resuorce there is no match
    if (noEventsCounter === resources.size) {
      next(null);
    }
  };
}
exports = module.exports = edr;
// Resource class
edr.Resource = Resource;
// Route class
edr.Route = Route;
// ResourceHub class
edr.ResourceHub = ResourceHub;
