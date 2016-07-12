const pathToRegexp = require('path-to-regexp');

class Route {
  constructor(opts) {
    this.alias = opts.alias;
    this.method = opts.method;
    this.path = opts.path;
    this.baseUrl = '';
  }
  match({ method, path }) {
    const params = new Set();
    const paramsAux = [];
    let pathResult = [];
    let result = null;
    const newPath = `${this.baseUrl}${this.path}`;
    if (method === this.method) {
      pathResult = pathToRegexp(newPath, paramsAux)
        .exec(path);
      if (!pathResult) return null;
      result = {
        eventName: this.alias,
      };
      if (paramsAux.length) {
        for (let i = 0; i < paramsAux.length; i += 1) {
          params.add({
            name: paramsAux[i].name,
            value: pathResult[i + 1],
          });
        }
      }
      result.params = params;
    }
    return result;
  }
  mountPath(baseUrl) {
    this.baseUrl = baseUrl;
    return this;
  }
}

module.exports = Route;
