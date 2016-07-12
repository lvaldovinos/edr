const Resource = require('./resource');
const Route = require('./route');
const Match = require('./match');
let resources = [];

function edr() {
  return (req, res, next) => {
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
        resource.emit('nomatch', req, res, next);
      }
    }
  };
}
exports = module.exports = edr;
// register resources
edr.addResources = (resourcesAux) => {
  resources = resourcesAux;
};
// clear resources
edr.clear = () => {
  resources = [];
};
// Resource class
edr.Resource = Resource;
// Route class
edr.Route = Route;
