const EventEmmiter = require('events');

class Resource extends EventEmmiter {
  constructor(opts) {
    super();
    this.name = opts.name || null;
    this.baseUrl = opts.baseUrl || '';
    this.mountUrl = '';
    this.routes = new Set();
    this.params = new Set();
    this.events = new Set();
    this.matches = null;
  }
  addRoute(route) {
    const baseUrl = !!(this.baseUrl && this.baseUrl.length);
    const mountUrl = !!(this.mountUrl && this.mountUrl.length);
    if (baseUrl && mountUrl) {
      route.mountPath(`${this.mountUrl}${this.baseUrl}`);
    } else if (baseUrl && !mountUrl) {
      route.mountPath(this.baseUrl);
    } else if (!baseUrl && mountUrl) {
      route.mountPath(this.mountUrl);
    }
    this.routes.add(route);
    return this;
  }
  addRoutes(routes) {
    for (const route of routes) {
      this.addRoute(route);
    }
    return this;
  }
  matchRoute(match) {
    const paramsAux = new Set();
    let paramsStg = [];
    const events = new Set();
    // get routes
    for (const route of this.routes) {
      const matchResult = route.match(match);
      if (matchResult) {
        paramsAux.add(matchResult.params);
        this.events.add({
          eventName: matchResult.eventName,
        });
      }
    }
    // get params
    for (const param of paramsAux) {
      paramsStg = paramsStg.concat([...param]);
    }
    this.params = new Set(paramsStg);
    // push done event if there are other events to trigger;
    if (this.events.size) {
      this.events.add({
        eventName: 'done',
      });
    }
    if (this.params.size) {
      // get params event
      const paramAux = {};
      for (const param of this.params) {
        const { name, value } = param;
        paramAux[name] = value;
      }
      events.add({
        eventName: 'params',
        eventParam: [
          {
            value: paramAux,
          },
        ],
      });
      // get final events
      for (const param of this.params) {
        const { name, value } = param;
        events.add({
          eventName: name,
          eventParam: [
            {
              name,
              value,
            },
          ],
        });
      }
    }
    for (const event of this.events) {
      events.add(event);
    }
    this.events = events;
    return this;
  }
  addMountUrl(mountUrl) {
    this.mountUrl = mountUrl;
    return this;
  }
  clear() {
    this.routes.clear();
    this.params.clear();
    this.events.clear();
    this.matches = null;
  }
}

module.exports = Resource;
