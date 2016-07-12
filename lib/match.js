const EventEmitter = require('events');

class Match extends EventEmitter {
  constructor(opts) {
    super();
    this.events = opts.events;
    this.next = opts.next;
    this.req = opts.req;
    this.res = opts.res;
    this.currentEvent = null;
    process.nextTick(() => {
      this.trigger();
    });
  }
  trigger() {
    this.currentEvent = this.events.values().next();
    if (!this.currentEvent.done) {
      const eventName = this.currentEvent.value.eventName;
      const eventParams = this.currentEvent.value.eventParam;
      const emitParams = [
        eventName,
        this.req,
        this.res,
        this.move.bind(this),
      ];
      let params = [];
      if (eventParams && eventParams.length) {
        params = emitParams.concat(eventParams.map((ep) => ep.value));
      } else {
        params = emitParams;
      }
      this.emit.apply(this, params);
      // if there isn't any event handler
      const listeners = this.listeners(eventName);
      if (listeners.length === 0) {
        this.move(null);
      }
    }
    return this;
  }
  move(err, ...args) {
    if (err) {
      return this.emit('error', err, this.req, this.res, this.next);
    }
    // remove currentEvent and triggers next one
    this.events.delete(this.currentEvent.value);
    this.currentEvent = null;
    // if we got arguments, let's attach them to the next event
    const nextEvent = this.events.values().next().value;
    if (args.length) {
      const nextParams = nextEvent.eventParam || [];
      nextEvent.eventParam = nextParams
        .concat(args.map((arg) => ({ value: arg })));
    }
    this.trigger();
    return this;
  }
}

module.exports = Match;
