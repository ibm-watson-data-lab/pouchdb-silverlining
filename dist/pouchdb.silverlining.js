(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('pouchdb-utils');
var sqltomango = _dereq_('sqltomango');

exports.sql = utils.toPromise(function(query, callback) {

  if (typeof query !== 'string') {
    throw('query must be a string');
  }

  // parse the query and turn it into Mango/CQ object
  var cq = sqltomango.parse(query);

  // if this is a "SELECT * from cats" query
  if (Object.keys(cq).length === 0 || !cq.selector) {
    // add a dummy selector
    cq.selector = {};
  }

  // var pouch = this;
  // var PouchDB = pouch.constructor;
  return this.find(cq, callback);
});

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports);
}

},{"pouchdb-utils":10,"sqltomango":22}],2:[function(_dereq_,module,exports){
'use strict';

module.exports = argsArray;

function argsArray(fun) {
  return function () {
    var len = arguments.length;
    if (len) {
      var args = [];
      var i = -1;
      while (++i < len) {
        args[i] = arguments[i];
      }
      return fun.call(this, args);
    } else {
      return fun.call(this, []);
    }
  };
}
},{}],3:[function(_dereq_,module,exports){

},{}],4:[function(_dereq_,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = _dereq_('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":5}],5:[function(_dereq_,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = _dereq_('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":8}],6:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(_dereq_,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(_dereq_,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options["long"]
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],9:[function(_dereq_,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,_dereq_('_process'))
},{"_process":15}],10:[function(_dereq_,module,exports){
(function (process){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Promise = _interopDefault(_dereq_('pouchdb-promise'));
var getArguments = _interopDefault(_dereq_('argsarray'));
var debug = _interopDefault(_dereq_('debug'));
var events = _dereq_('events');
var inherits = _interopDefault(_dereq_('inherits'));
var pouchdbErrors = _dereq_('pouchdb-errors');

function isBinaryObject(object) {
  return object instanceof ArrayBuffer ||
    (typeof Blob !== 'undefined' && object instanceof Blob);
}

function cloneArrayBuffer(buff) {
  if (typeof buff.slice === 'function') {
    return buff.slice(0);
  }
  // IE10-11 slice() polyfill
  var target = new ArrayBuffer(buff.byteLength);
  var targetArray = new Uint8Array(target);
  var sourceArray = new Uint8Array(buff);
  targetArray.set(sourceArray);
  return target;
}

function cloneBinaryObject(object) {
  if (object instanceof ArrayBuffer) {
    return cloneArrayBuffer(object);
  }
  var size = object.size;
  var type = object.type;
  // Blob
  if (typeof object.slice === 'function') {
    return object.slice(0, size, type);
  }
  // PhantomJS slice() replacement
  return object.webkitSlice(0, size, type);
}

// most of this is borrowed from lodash.isPlainObject:
// https://github.com/fis-components/lodash.isplainobject/
// blob/29c358140a74f252aeb08c9eb28bef86f2217d4a/index.js

var funcToString = Function.prototype.toString;
var objectCtorString = funcToString.call(Object);

function isPlainObject(value) {
  var proto = Object.getPrototypeOf(value);
  /* istanbul ignore if */
  if (proto === null) { // not sure when this happens, but I guess it can
    return true;
  }
  var Ctor = proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

function clone(object) {
  var newObject;
  var i;
  var len;

  if (!object || typeof object !== 'object') {
    return object;
  }

  if (Array.isArray(object)) {
    newObject = [];
    for (i = 0, len = object.length; i < len; i++) {
      newObject[i] = clone(object[i]);
    }
    return newObject;
  }

  // special case: to avoid inconsistencies between IndexedDB
  // and other backends, we automatically stringify Dates
  if (object instanceof Date) {
    return object.toISOString();
  }

  if (isBinaryObject(object)) {
    return cloneBinaryObject(object);
  }

  if (!isPlainObject(object)) {
    return object; // don't clone objects like Workers
  }

  newObject = {};
  for (i in object) {
    if (Object.prototype.hasOwnProperty.call(object, i)) {
      var value = clone(object[i]);
      if (typeof value !== 'undefined') {
        newObject[i] = value;
      }
    }
  }
  return newObject;
}

function once(fun) {
  var called = false;
  return getArguments(function (args) {
    /* istanbul ignore if */
    if (called) {
      // this is a smoke test and should never actually happen
      throw new Error('once called more than once');
    } else {
      called = true;
      fun.apply(this, args);
    }
  });
}

function toPromise(func) {
  //create the function we will be returning
  return getArguments(function (args) {
    // Clone arguments
    args = clone(args);
    var self = this;
    var tempCB =
      (typeof args[args.length - 1] === 'function') ? args.pop() : false;
    // if the last argument is a function, assume its a callback
    var usedCB;
    if (tempCB) {
      // if it was a callback, create a new callback which calls it,
      // but do so async so we don't trap any errors
      usedCB = function (err, resp) {
        process.nextTick(function () {
          tempCB(err, resp);
        });
      };
    }
    var promise = new Promise(function (fulfill, reject) {
      var resp;
      try {
        var callback = once(function (err, mesg) {
          if (err) {
            reject(err);
          } else {
            fulfill(mesg);
          }
        });
        // create a callback for this invocation
        // apply the function in the orig context
        args.push(callback);
        resp = func.apply(self, args);
        if (resp && typeof resp.then === 'function') {
          fulfill(resp);
        }
      } catch (e) {
        reject(e);
      }
    });
    // if there is a callback, call it back
    if (usedCB) {
      promise.then(function (result) {
        usedCB(null, result);
      }, usedCB);
    }
    return promise;
  });
}

var log = debug('pouchdb:api');

function adapterFun(name, callback) {
  function logApiCall(self, name, args) {
    /* istanbul ignore if */
    if (log.enabled) {
      var logArgs = [self._db_name, name];
      for (var i = 0; i < args.length - 1; i++) {
        logArgs.push(args[i]);
      }
      log.apply(null, logArgs);

      // override the callback itself to log the response
      var origCallback = args[args.length - 1];
      args[args.length - 1] = function (err, res) {
        var responseArgs = [self._db_name, name];
        responseArgs = responseArgs.concat(
          err ? ['error', err] : ['success', res]
        );
        log.apply(null, responseArgs);
        origCallback(err, res);
      };
    }
  }

  return toPromise(getArguments(function (args) {
    if (this._closed) {
      return Promise.reject(new Error('database is closed'));
    }
    if (this._destroyed) {
      return Promise.reject(new Error('database is destroyed'));
    }
    var self = this;
    logApiCall(self, name, args);
    if (!this.taskqueue.isReady) {
      return new Promise(function (fulfill, reject) {
        self.taskqueue.addTask(function (failed) {
          if (failed) {
            reject(failed);
          } else {
            fulfill(self[name].apply(self, args));
          }
        });
      });
    }
    return callback.apply(this, args);
  }));
}

// like underscore/lodash _.pick()
function pick(obj, arr) {
  var res = {};
  for (var i = 0, len = arr.length; i < len; i++) {
    var prop = arr[i];
    if (prop in obj) {
      res[prop] = obj[prop];
    }
  }
  return res;
}

// Most browsers throttle concurrent requests at 6, so it's silly
// to shim _bulk_get by trying to launch potentially hundreds of requests
// and then letting the majority time out. We can handle this ourselves.
var MAX_NUM_CONCURRENT_REQUESTS = 6;

function identityFunction(x) {
  return x;
}

function formatResultForOpenRevsGet(result) {
  return [{
    ok: result
  }];
}

// shim for P/CouchDB adapters that don't directly implement _bulk_get
function bulkGet(db, opts, callback) {
  var requests = opts.docs;

  // consolidate into one request per doc if possible
  var requestsById = {};
  requests.forEach(function (request) {
    if (request.id in requestsById) {
      requestsById[request.id].push(request);
    } else {
      requestsById[request.id] = [request];
    }
  });

  var numDocs = Object.keys(requestsById).length;
  var numDone = 0;
  var perDocResults = new Array(numDocs);

  function collapseResultsAndFinish() {
    var results = [];
    perDocResults.forEach(function (res) {
      res.docs.forEach(function (info) {
        results.push({
          id: res.id,
          docs: [info]
        });
      });
    });
    callback(null, {results: results});
  }

  function checkDone() {
    if (++numDone === numDocs) {
      collapseResultsAndFinish();
    }
  }

  function gotResult(docIndex, id, docs) {
    perDocResults[docIndex] = {id: id, docs: docs};
    checkDone();
  }

  var allRequests = Object.keys(requestsById);

  var i = 0;

  function nextBatch() {

    if (i >= allRequests.length) {
      return;
    }

    var upTo = Math.min(i + MAX_NUM_CONCURRENT_REQUESTS, allRequests.length);
    var batch = allRequests.slice(i, upTo);
    processBatch(batch, i);
    i += batch.length;
  }

  function processBatch(batch, offset) {
    batch.forEach(function (docId, j) {
      var docIdx = offset + j;
      var docRequests = requestsById[docId];

      // just use the first request as the "template"
      // TODO: The _bulk_get API allows for more subtle use cases than this,
      // but for now it is unlikely that there will be a mix of different
      // "atts_since" or "attachments" in the same request, since it's just
      // replicate.js that is using this for the moment.
      // Also, atts_since is aspirational, since we don't support it yet.
      var docOpts = pick(docRequests[0], ['atts_since', 'attachments']);
      docOpts.open_revs = docRequests.map(function (request) {
        // rev is optional, open_revs disallowed
        return request.rev;
      });

      // remove falsey / undefined revisions
      docOpts.open_revs = docOpts.open_revs.filter(identityFunction);

      var formatResult = identityFunction;

      if (docOpts.open_revs.length === 0) {
        delete docOpts.open_revs;

        // when fetching only the "winning" leaf,
        // transform the result so it looks like an open_revs
        // request
        formatResult = formatResultForOpenRevsGet;
      }

      // globally-supplied options
      ['revs', 'attachments', 'binary', 'ajax'].forEach(function (param) {
        if (param in opts) {
          docOpts[param] = opts[param];
        }
      });
      db.get(docId, docOpts, function (err, res) {
        var result;
        /* istanbul ignore if */
        if (err) {
          result = [{error: err}];
        } else {
          result = formatResult(res);
        }
        gotResult(docIdx, docId, result);
        nextBatch();
      });
    });
  }

  nextBatch();

}

function isChromeApp() {
  return (typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined" &&
    typeof chrome.storage.local !== "undefined");
}

var hasLocal;

if (isChromeApp()) {
  hasLocal = false;
} else {
  try {
    localStorage.setItem('_pouch_check_localstorage', 1);
    hasLocal = !!localStorage.getItem('_pouch_check_localstorage');
  } catch (e) {
    hasLocal = false;
  }
}

function hasLocalStorage() {
  return hasLocal;
}

inherits(Changes, events.EventEmitter);

/* istanbul ignore next */
function attachBrowserEvents(self) {
  if (isChromeApp()) {
    chrome.storage.onChanged.addListener(function (e) {
      // make sure it's event addressed to us
      if (e.db_name != null) {
        //object only has oldValue, newValue members
        self.emit(e.dbName.newValue);
      }
    });
  } else if (hasLocalStorage()) {
    if (typeof addEventListener !== 'undefined') {
      addEventListener("storage", function (e) {
        self.emit(e.key);
      });
    } else { // old IE
      window.attachEvent("storage", function (e) {
        self.emit(e.key);
      });
    }
  }
}

function Changes() {
  events.EventEmitter.call(this);
  this._listeners = {};

  attachBrowserEvents(this);
}
Changes.prototype.addListener = function (dbName, id, db, opts) {
  /* istanbul ignore if */
  if (this._listeners[id]) {
    return;
  }
  var self = this;
  var inprogress = false;
  function eventFunction() {
    /* istanbul ignore if */
    if (!self._listeners[id]) {
      return;
    }
    if (inprogress) {
      inprogress = 'waiting';
      return;
    }
    inprogress = true;
    var changesOpts = pick(opts, [
      'style', 'include_docs', 'attachments', 'conflicts', 'filter',
      'doc_ids', 'view', 'since', 'query_params', 'binary'
    ]);

    /* istanbul ignore next */
    function onError() {
      inprogress = false;
    }

    db.changes(changesOpts).on('change', function (c) {
      if (c.seq > opts.since && !opts.cancelled) {
        opts.since = c.seq;
        opts.onChange(c);
      }
    }).on('complete', function () {
      if (inprogress === 'waiting') {
        setTimeout(function (){
          eventFunction();
        },0);
      }
      inprogress = false;
    }).on('error', onError);
  }
  this._listeners[id] = eventFunction;
  this.on(dbName, eventFunction);
};

Changes.prototype.removeListener = function (dbName, id) {
  /* istanbul ignore if */
  if (!(id in this._listeners)) {
    return;
  }
  events.EventEmitter.prototype.removeListener.call(this, dbName,
    this._listeners[id]);
};


/* istanbul ignore next */
Changes.prototype.notifyLocalWindows = function (dbName) {
  //do a useless change on a storage thing
  //in order to get other windows's listeners to activate
  if (isChromeApp()) {
    chrome.storage.local.set({dbName: dbName});
  } else if (hasLocalStorage()) {
    localStorage[dbName] = (localStorage[dbName] === "a") ? "b" : "a";
  }
};

Changes.prototype.notify = function (dbName) {
  this.emit(dbName);
  this.notifyLocalWindows(dbName);
};

function guardedConsole(method) {
  if (console !== 'undefined' && method in console) {
    var args = Array.prototype.slice.call(arguments, 1);
    console[method].apply(console, args);
  }
}

function randomNumber(min, max) {
  var maxTimeout = 600000; // Hard-coded default of 10 minutes
  min = parseInt(min, 10) || 0;
  max = parseInt(max, 10);
  if (max !== max || max <= min) {
    max = (min || 1) << 1; //doubling
  } else {
    max = max + 1;
  }
  // In order to not exceed maxTimeout, pick a random value between half of maxTimeout and maxTimeout
  if(max > maxTimeout) {
    min = maxTimeout >> 1; // divide by two
    max = maxTimeout;
  }
  var ratio = Math.random();
  var range = max - min;

  return ~~(range * ratio + min); // ~~ coerces to an int, but fast.
}

function defaultBackOff(min) {
  var max = 0;
  if (!min) {
    max = 2000;
  }
  return randomNumber(min, max);
}

// designed to give info to browser users, who are disturbed
// when they see http errors in the console
function explainError(status, str) {
  guardedConsole('info', 'The above ' + status + ' is totally normal. ' + str);
}

function extendInner(obj, otherObj) {
  for (var key in otherObj) {
    if (otherObj.hasOwnProperty(key)) {
      var value = clone(otherObj[key]);
      if (typeof value !== 'undefined') {
        obj[key] = value;
      }
    }
  }
}

function extend(obj, obj2, obj3) {
  extendInner(obj, obj2);
  if (obj3) {
    extendInner(obj, obj3);
  }
  return obj;
}

function tryFilter(filter, doc, req) {
  try {
    return !filter(doc, req);
  } catch (err) {
    var msg = 'Filter function threw: ' + err.toString();
    return pouchdbErrors.createError(pouchdbErrors.BAD_REQUEST, msg);
  }
}

function filterChange(opts) {
  var req = {};
  var hasFilter = opts.filter && typeof opts.filter === 'function';
  req.query = opts.query_params;

  return function filter(change) {
    if (!change.doc) {
      // CSG sends events on the changes feed that don't have documents,
      // this hack makes a whole lot of existing code robust.
      change.doc = {};
    }

    var filterReturn = hasFilter && tryFilter(opts.filter, change.doc, req);

    if (typeof filterReturn === 'object') {
      return filterReturn;
    }

    if (filterReturn) {
      return false;
    }

    if (!opts.include_docs) {
      delete change.doc;
    } else if (!opts.attachments) {
      for (var att in change.doc._attachments) {
        /* istanbul ignore else */
        if (change.doc._attachments.hasOwnProperty(att)) {
          change.doc._attachments[att].stub = true;
        }
      }
    }
    return true;
  };
}

function flatten(arrs) {
  var res = [];
  for (var i = 0, len = arrs.length; i < len; i++) {
    res = res.concat(arrs[i]);
  }
  return res;
}

// shim for Function.prototype.name,
// for browsers that don't support it like IE

/* istanbul ignore next */
function f() {}

var hasName = f.name;
var res;

// We dont run coverage in IE
/* istanbul ignore else */
if (hasName) {
  res = function (fun) {
    return fun.name;
  };
} else {
  res = function (fun) {
    return fun.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
  };
}

var functionName = res;

// Determine id an ID is valid
//   - invalid IDs begin with an underescore that does not begin '_design' or
//     '_local'
//   - any other string value is a valid id
// Returns the specific error object for each case
function invalidIdError(id) {
  var err;
  if (!id) {
    err = pouchdbErrors.createError(pouchdbErrors.MISSING_ID);
  } else if (typeof id !== 'string') {
    err = pouchdbErrors.createError(pouchdbErrors.INVALID_ID);
  } else if (/^_/.test(id) && !(/^_(design|local)/).test(id)) {
    err = pouchdbErrors.createError(pouchdbErrors.RESERVED_ID);
  }
  if (err) {
    throw err;
  }
}

function isCordova() {
  return (typeof cordova !== "undefined" ||
  typeof PhoneGap !== "undefined" ||
  typeof phonegap !== "undefined");
}

function listenerCount(ee, type) {
  return 'listenerCount' in ee ? ee.listenerCount(type) :
                                 events.EventEmitter.listenerCount(ee, type);
}

function parseDesignDocFunctionName(s) {
  if (!s) {
    return null;
  }
  var parts = s.split('/');
  if (parts.length === 2) {
    return parts;
  }
  if (parts.length === 1) {
    return [s, s];
  }
  return null;
}

function normalizeDesignDocFunctionName(s) {
  var normalized = parseDesignDocFunctionName(s);
  return normalized ? normalized.join('/') : null;
}

// originally parseUri 1.2.2, now patched by us
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
var keys = ["source", "protocol", "authority", "userInfo", "user", "password",
    "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
var qName ="queryKey";
var qParser = /(?:^|&)([^&=]*)=?([^&]*)/g;

// use the "loose" parser
/* jshint maxlen: false */
var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

function parseUri(str) {
  var m = parser.exec(str);
  var uri = {};
  var i = 14;

  while (i--) {
    var key = keys[i];
    var value = m[i] || "";
    var encoded = ['user', 'password'].indexOf(key) !== -1;
    uri[key] = encoded ? decodeURIComponent(value) : value;
  }

  uri[qName] = {};
  uri[keys[12]].replace(qParser, function ($0, $1, $2) {
    if ($1) {
      uri[qName][$1] = $2;
    }
  });

  return uri;
}

// this is essentially the "update sugar" function from daleharvey/pouchdb#1388
// the diffFun tells us what delta to apply to the doc.  it either returns
// the doc, or false if it doesn't need to do an update after all
function upsert(db, docId, diffFun) {
  return new Promise(function (fulfill, reject) {
    db.get(docId, function (err, doc) {
      if (err) {
        /* istanbul ignore next */
        if (err.status !== 404) {
          return reject(err);
        }
        doc = {};
      }

      // the user might change the _rev, so save it for posterity
      var docRev = doc._rev;
      var newDoc = diffFun(doc);

      if (!newDoc) {
        // if the diffFun returns falsy, we short-circuit as
        // an optimization
        return fulfill({updated: false, rev: docRev});
      }

      // users aren't allowed to modify these values,
      // so reset them here
      newDoc._id = docId;
      newDoc._rev = docRev;
      fulfill(tryAndPut(db, newDoc, diffFun));
    });
  });
}

function tryAndPut(db, doc, diffFun) {
  return db.put(doc).then(function (res) {
    return {
      updated: true,
      rev: res.rev
    };
  }, function (err) {
    /* istanbul ignore next */
    if (err.status !== 409) {
      throw err;
    }
    return upsert(db, doc._id, diffFun);
  });
}

// BEGIN Math.uuid.js

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. 
 *   // (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
var chars = (
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'abcdefghijklmnopqrstuvwxyz'
).split('');
function getValue(radix) {
  return 0 | Math.random() * radix;
}
function uuid(len, radix) {
  radix = radix || chars.length;
  var out = '';
  var i = -1;

  if (len) {
    // Compact form
    while (++i < len) {
      out += chars[getValue(radix)];
    }
    return out;
  }
    // rfc4122, version 4 form
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
  while (++i < 36) {
    switch (i) {
      case 8:
      case 13:
      case 18:
      case 23:
        out += '-';
        break;
      case 19:
        out += chars[(getValue(16) & 0x3) | 0x8];
        break;
      default:
        out += chars[getValue(16)];
    }
  }

  return out;
}

exports.adapterFun = adapterFun;
exports.bulkGetShim = bulkGet;
exports.changesHandler = Changes;
exports.clone = clone;
exports.defaultBackOff = defaultBackOff;
exports.explainError = explainError;
exports.extend = extend;
exports.filterChange = filterChange;
exports.flatten = flatten;
exports.functionName = functionName;
exports.guardedConsole = guardedConsole;
exports.hasLocalStorage = hasLocalStorage;
exports.invalidIdError = invalidIdError;
exports.isChromeApp = isChromeApp;
exports.isCordova = isCordova;
exports.listenerCount = listenerCount;
exports.normalizeDdocFunctionName = normalizeDesignDocFunctionName;
exports.once = once;
exports.parseDdocFunctionName = parseDesignDocFunctionName;
exports.parseUri = parseUri;
exports.pick = pick;
exports.toPromise = toPromise;
exports.upsert = upsert;
exports.uuid = uuid;
}).call(this,_dereq_('_process'))
},{"_process":15,"argsarray":2,"debug":4,"events":6,"inherits":11,"pouchdb-errors":13,"pouchdb-promise":14}],11:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_('immediate');

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && typeof obj === 'object' && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"immediate":7}],13:[function(_dereq_,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var inherits = _interopDefault(_dereq_('inherits'));

inherits(PouchError, Error);

function PouchError(opts) {
  Error.call(this, opts.reason);
  this.status = opts.status;
  this.name = opts.error;
  this.message = opts.reason;
  this.error = true;
}

PouchError.prototype.toString = function () {
  return JSON.stringify({
    status: this.status,
    name: this.name,
    message: this.message,
    reason: this.reason
  });
};

var UNAUTHORIZED = new PouchError({
  status: 401,
  error: 'unauthorized',
  reason: "Name or password is incorrect."
});

var MISSING_BULK_DOCS = new PouchError({
  status: 400,
  error: 'bad_request',
  reason: "Missing JSON list of 'docs'"
});

var MISSING_DOC = new PouchError({
  status: 404,
  error: 'not_found',
  reason: 'missing'
});

var REV_CONFLICT = new PouchError({
  status: 409,
  error: 'conflict',
  reason: 'Document update conflict'
});

var INVALID_ID = new PouchError({
  status: 400,
  error: 'invalid_id',
  reason: '_id field must contain a string'
});

var MISSING_ID = new PouchError({
  status: 412,
  error: 'missing_id',
  reason: '_id is required for puts'
});

var RESERVED_ID = new PouchError({
  status: 400,
  error: 'bad_request',
  reason: 'Only reserved document ids may start with underscore.'
});

var NOT_OPEN = new PouchError({
  status: 412,
  error: 'precondition_failed',
  reason: 'Database not open'
});

var UNKNOWN_ERROR = new PouchError({
  status: 500,
  error: 'unknown_error',
  reason: 'Database encountered an unknown error'
});

var BAD_ARG = new PouchError({
  status: 500,
  error: 'badarg',
  reason: 'Some query argument is invalid'
});

var INVALID_REQUEST = new PouchError({
  status: 400,
  error: 'invalid_request',
  reason: 'Request was invalid'
});

var QUERY_PARSE_ERROR = new PouchError({
  status: 400,
  error: 'query_parse_error',
  reason: 'Some query parameter is invalid'
});

var DOC_VALIDATION = new PouchError({
  status: 500,
  error: 'doc_validation',
  reason: 'Bad special document member'
});

var BAD_REQUEST = new PouchError({
  status: 400,
  error: 'bad_request',
  reason: 'Something wrong with the request'
});

var NOT_AN_OBJECT = new PouchError({
  status: 400,
  error: 'bad_request',
  reason: 'Document must be a JSON object'
});

var DB_MISSING = new PouchError({
  status: 404,
  error: 'not_found',
  reason: 'Database not found'
});

var IDB_ERROR = new PouchError({
  status: 500,
  error: 'indexed_db_went_bad',
  reason: 'unknown'
});

var WSQ_ERROR = new PouchError({
  status: 500,
  error: 'web_sql_went_bad',
  reason: 'unknown'
});

var LDB_ERROR = new PouchError({
  status: 500,
  error: 'levelDB_went_went_bad',
  reason: 'unknown'
});

var FORBIDDEN = new PouchError({
  status: 403,
  error: 'forbidden',
  reason: 'Forbidden by design doc validate_doc_update function'
});

var INVALID_REV = new PouchError({
  status: 400,
  error: 'bad_request',
  reason: 'Invalid rev format'
});

var FILE_EXISTS = new PouchError({
  status: 412,
  error: 'file_exists',
  reason: 'The database could not be created, the file already exists.'
});

var MISSING_STUB = new PouchError({
  status: 412,
  error: 'missing_stub'
});

var INVALID_URL = new PouchError({
  status: 413,
  error: 'invalid_url',
  reason: 'Provided URL is invalid'
});

var allErrors = [
  UNAUTHORIZED,
  MISSING_BULK_DOCS,
  MISSING_DOC,
  REV_CONFLICT,
  INVALID_ID,
  MISSING_ID,
  RESERVED_ID,
  NOT_OPEN,
  UNKNOWN_ERROR,
  BAD_ARG,
  INVALID_REQUEST,
  QUERY_PARSE_ERROR,
  DOC_VALIDATION,
  BAD_REQUEST,
  NOT_AN_OBJECT,
  DB_MISSING,
  WSQ_ERROR,
  LDB_ERROR,
  FORBIDDEN,
  INVALID_REV,
  FILE_EXISTS,
  MISSING_STUB,
  IDB_ERROR,
  INVALID_URL
];

function createError(error, reason, name) {
  function CustomPouchError(reason) {
    // inherit error properties from our parent error manually
    // so as to allow proper JSON parsing.
    /* jshint ignore:start */
    for (var p in error) {
      if (typeof error[p] !== 'function') {
        this[p] = error[p];
      }
    }
    /* jshint ignore:end */
    if (name !== undefined) {
      this.name = name;
    }
    if (reason !== undefined) {
      this.reason = reason;
    }
  }
  CustomPouchError.prototype = PouchError.prototype;
  return new CustomPouchError(reason);
}

// Find one of the errors defined above based on the value
// of the specified property.
// If reason is provided prefer the error matching that reason.
// This is for differentiating between errors with the same name and status,
// eg, bad_request.
var getErrorTypeByProp = function (prop, value, reason) {
  var errorsByProp = allErrors.filter(function (error) {
    return error[prop] === value;
  });
  return (reason && errorsByProp.filter(function (error) {
    return error.message === reason;
  })[0]) || errorsByProp[0];
};

function generateErrorFromResponse(res) {
  var error, errName, errType, errMsg, errReason;

  errName = (res.error === true && typeof res.name === 'string') ?
    res.name :
    res.error;
  errReason = res.reason;
  errType = getErrorTypeByProp('name', errName, errReason);

  if (res.missing ||
    errReason === 'missing' ||
    errReason === 'deleted' ||
    errName === 'not_found') {
    errType = MISSING_DOC;
  } else if (errName === 'doc_validation') {
    // doc validation needs special treatment since
    // res.reason depends on the validation error.
    // see utils.js
    errType = DOC_VALIDATION;
    errMsg = errReason;
  } else if (errName === 'bad_request' && errType.message !== errReason) {
    // if bad_request error already found based on reason don't override.
    errType = BAD_REQUEST;
  }

  // fallback to error by status or unknown error.
  if (!errType) {
    errType = getErrorTypeByProp('status', res.status, errReason) ||
      UNKNOWN_ERROR;
  }

  error = createError(errType, errReason, errName);

  // Keep custom message.
  if (errMsg) {
    error.message = errMsg;
  }

  // Keep helpful response data in our error messages.
  if (res.id) {
    error.id = res.id;
  }
  if (res.status) {
    error.status = res.status;
  }
  if (res.missing) {
    error.missing = res.missing;
  }

  return error;
}

exports.UNAUTHORIZED = UNAUTHORIZED;
exports.MISSING_BULK_DOCS = MISSING_BULK_DOCS;
exports.MISSING_DOC = MISSING_DOC;
exports.REV_CONFLICT = REV_CONFLICT;
exports.INVALID_ID = INVALID_ID;
exports.MISSING_ID = MISSING_ID;
exports.RESERVED_ID = RESERVED_ID;
exports.NOT_OPEN = NOT_OPEN;
exports.UNKNOWN_ERROR = UNKNOWN_ERROR;
exports.BAD_ARG = BAD_ARG;
exports.INVALID_REQUEST = INVALID_REQUEST;
exports.QUERY_PARSE_ERROR = QUERY_PARSE_ERROR;
exports.DOC_VALIDATION = DOC_VALIDATION;
exports.BAD_REQUEST = BAD_REQUEST;
exports.NOT_AN_OBJECT = NOT_AN_OBJECT;
exports.DB_MISSING = DB_MISSING;
exports.WSQ_ERROR = WSQ_ERROR;
exports.LDB_ERROR = LDB_ERROR;
exports.FORBIDDEN = FORBIDDEN;
exports.INVALID_REV = INVALID_REV;
exports.FILE_EXISTS = FILE_EXISTS;
exports.MISSING_STUB = MISSING_STUB;
exports.IDB_ERROR = IDB_ERROR;
exports.INVALID_URL = INVALID_URL;
exports.getErrorTypeByProp = getErrorTypeByProp;
exports.createError = createError;
exports.generateErrorFromResponse = generateErrorFromResponse;
},{"inherits":11}],14:[function(_dereq_,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lie = _interopDefault(_dereq_('lie'));

/* istanbul ignore next */
var PouchPromise = typeof Promise === 'function' ? Promise : lie;

module.exports = PouchPromise;
},{"lie":12}],15:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],16:[function(_dereq_,module,exports){
sql = _dereq_('./lib/sql_parser')

for(var key in sql) {
  exports[key] = sql[key]
}


},{"./lib/sql_parser":21}],17:[function(_dereq_,module,exports){
(function (process){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[5,26],$V2=[1,14],$V3=[1,13],$V4=[5,26,31,42],$V5=[1,17],$V6=[5,26,31,42,45,62],$V7=[1,27],$V8=[1,29],$V9=[1,38],$Va=[1,42],$Vb=[1,43],$Vc=[1,39],$Vd=[1,40],$Ve=[1,37],$Vf=[1,41],$Vg=[1,25],$Vh=[5,26,31],$Vi=[5,26,31,42,45],$Vj=[1,55],$Vk=[18,43],$Vl=[1,58],$Vm=[1,59],$Vn=[1,60],$Vo=[1,61],$Vp=[5,18,23,26,31,34,37,38,41,42,43,45,62,64,65,66,67,68],$Vq=[5,18,23,26,31,34,37,38,41,42,43,44,45,51,62,64,65,66,67,68,69],$Vr=[1,66],$Vs=[2,80],$Vt=[1,80],$Vu=[1,81],$Vv=[1,96],$Vw=[5,26,31,42,43,44],$Vx=[1,104],$Vy=[5,26,31,42,43,45,64],$Vz=[5,26,31,41,42,45,62],$VA=[1,107],$VB=[1,108],$VC=[1,109],$VD=[5,26,31,34,35,37,38,41,42,45,62],$VE=[5,26,31,34,37,38,41,42,45,62],$VF=[5,26,31,42,56,58];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Query":4,"EOF":5,"SelectQuery":6,"Unions":7,"SelectWithLimitQuery":8,"BasicSelectQuery":9,"Select":10,"OrderClause":11,"GroupClause":12,"LimitClause":13,"SelectClause":14,"WhereClause":15,"SELECT":16,"Fields":17,"FROM":18,"Table":19,"DISTINCT":20,"Joins":21,"Literal":22,"AS":23,"LEFT_PAREN":24,"List":25,"RIGHT_PAREN":26,"WINDOW":27,"WINDOW_FUNCTION":28,"Number":29,"Union":30,"UNION":31,"ALL":32,"Join":33,"JOIN":34,"ON":35,"Expression":36,"LEFT":37,"RIGHT":38,"INNER":39,"OUTER":40,"WHERE":41,"LIMIT":42,"SEPARATOR":43,"OFFSET":44,"ORDER":45,"BY":46,"OrderArgs":47,"OffsetClause":48,"OrderArg":49,"Value":50,"DIRECTION":51,"OffsetRows":52,"FetchClause":53,"ROW":54,"ROWS":55,"FETCH":56,"FIRST":57,"ONLY":58,"NEXT":59,"GroupBasicClause":60,"HavingClause":61,"GROUP":62,"ArgumentList":63,"HAVING":64,"MATH":65,"MATH_MULTI":66,"OPERATOR":67,"CONDITIONAL":68,"SUB_SELECT_OP":69,"SubSelectExpression":70,"SUB_SELECT_UNARY_OP":71,"String":72,"Function":73,"UserFunction":74,"Boolean":75,"Parameter":76,"NUMBER":77,"BOOLEAN":78,"PARAMETER":79,"STRING":80,"DBLSTRING":81,"LITERAL":82,"DOT":83,"FUNCTION":84,"AggregateArgumentList":85,"Field":86,"STAR":87,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",16:"SELECT",18:"FROM",20:"DISTINCT",23:"AS",24:"LEFT_PAREN",26:"RIGHT_PAREN",27:"WINDOW",28:"WINDOW_FUNCTION",31:"UNION",32:"ALL",34:"JOIN",35:"ON",37:"LEFT",38:"RIGHT",39:"INNER",40:"OUTER",41:"WHERE",42:"LIMIT",43:"SEPARATOR",44:"OFFSET",45:"ORDER",46:"BY",51:"DIRECTION",54:"ROW",55:"ROWS",56:"FETCH",57:"FIRST",58:"ONLY",59:"NEXT",62:"GROUP",64:"HAVING",65:"MATH",66:"MATH_MULTI",67:"OPERATOR",68:"CONDITIONAL",69:"SUB_SELECT_OP",71:"SUB_SELECT_UNARY_OP",77:"NUMBER",78:"BOOLEAN",79:"PARAMETER",80:"STRING",81:"DBLSTRING",82:"LITERAL",83:"DOT",84:"FUNCTION",87:"STAR"},
productions_: [0,[3,2],[4,1],[4,2],[6,1],[6,1],[9,1],[9,2],[9,2],[9,3],[8,2],[10,1],[10,2],[14,4],[14,5],[14,5],[14,6],[19,1],[19,2],[19,3],[19,3],[19,3],[19,4],[19,6],[7,1],[7,2],[30,2],[30,3],[21,1],[21,2],[33,4],[33,5],[33,5],[33,6],[33,6],[33,6],[33,6],[15,2],[13,2],[13,4],[13,4],[11,3],[11,4],[47,1],[47,3],[49,1],[49,2],[48,2],[48,3],[52,2],[52,2],[53,4],[53,4],[12,1],[12,2],[60,3],[61,2],[36,3],[36,3],[36,3],[36,3],[36,3],[36,5],[36,3],[36,2],[36,1],[70,3],[50,1],[50,1],[50,1],[50,1],[50,1],[50,1],[50,1],[25,1],[29,1],[75,1],[76,1],[72,1],[72,1],[22,1],[22,3],[73,4],[74,4],[85,1],[85,2],[63,1],[63,3],[17,1],[17,3],[86,1],[86,1],[86,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return this.$ = $$[$0-1];
break;
case 2: case 4: case 5: case 6: case 11: case 53: case 65: case 67: case 68: case 69: case 70: case 71: case 72: case 73:
this.$ = $$[$0];
break;
case 3:
this.$ = (function () {
        $$[$0-1].unions = $$[$0];
        return $$[$0-1];
      }());
break;
case 7:
this.$ = (function () {
        $$[$0-1].order = $$[$0];
        return $$[$0-1];
      }());
break;
case 8:
this.$ = (function () {
        $$[$0-1].group = $$[$0];
        return $$[$0-1];
      }());
break;
case 9:
this.$ = (function () {
        $$[$0-2].group = $$[$0-1];
        $$[$0-2].order = $$[$0];
        return $$[$0-2];
      }());
break;
case 10:
this.$ = (function () {
        $$[$0-1].limit = $$[$0];
        return $$[$0-1];
      }());
break;
case 12:
this.$ = (function () {
        $$[$0-1].where = $$[$0];
        return $$[$0-1];
      }());
break;
case 13:
this.$ = new yy.Select($$[$0-2], $$[$0], false);
break;
case 14:
this.$ = new yy.Select($$[$0-2], $$[$0], true);
break;
case 15:
this.$ = new yy.Select($$[$0-3], $$[$0-1], false, $$[$0]);
break;
case 16:
this.$ = new yy.Select($$[$0-3], $$[$0-1], true, $$[$0]);
break;
case 17:
this.$ = new yy.Table($$[$0]);
break;
case 18:
this.$ = new yy.Table($$[$0-1], $$[$0]);
break;
case 19:
this.$ = new yy.Table($$[$0-2], $$[$0]);
break;
case 20: case 49: case 50: case 51: case 52: case 57:
this.$ = $$[$0-1];
break;
case 21: case 66:
this.$ = new yy.SubSelect($$[$0-1]);
break;
case 22:
this.$ = new yy.SubSelect($$[$0-2], $$[$0]);
break;
case 23:
this.$ = new yy.Table($$[$0-5], null, $$[$0-4], $$[$0-3], $$[$0-1]);
break;
case 24: case 28: case 43: case 86: case 88:
this.$ = [$$[$0]];
break;
case 25:
this.$ = $$[$0-1].concat($$[$01]);
break;
case 26:
this.$ = new yy.Union($$[$0]);
break;
case 27:
this.$ = new yy.Union($$[$0], true);
break;
case 29:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 30:
this.$ = new yy.Join($$[$0-2], $$[$0]);
break;
case 31:
this.$ = new yy.Join($$[$0-2], $$[$0], 'LEFT');
break;
case 32:
this.$ = new yy.Join($$[$0-2], $$[$0], 'RIGHT');
break;
case 33:
this.$ = new yy.Join($$[$0-2], $$[$0], 'LEFT', 'INNER');
break;
case 34:
this.$ = new yy.Join($$[$0-2], $$[$0], 'RIGHT', 'INNER');
break;
case 35:
this.$ = new yy.Join($$[$0-2], $$[$0], 'LEFT', 'OUTER');
break;
case 36:
this.$ = new yy.Join($$[$0-2], $$[$0], 'RIGHT', 'OUTER');
break;
case 37:
this.$ = new yy.Where($$[$0]);
break;
case 38:
this.$ = new yy.Limit($$[$0]);
break;
case 39:
this.$ = new yy.Limit($$[$0], $$[$0-2]);
break;
case 40:
this.$ = new yy.Limit($$[$0-2], $$[$0]);
break;
case 41:
this.$ = new yy.Order($$[$0]);
break;
case 42:
this.$ = new yy.Order($$[$0-1], $$[$0]);
break;
case 44: case 87: case 89:
this.$ = $$[$0-2].concat($$[$0]);
break;
case 45:
this.$ = new yy.OrderArgument($$[$0], 'ASC');
break;
case 46:
this.$ = new yy.OrderArgument($$[$0-1], $$[$0]);
break;
case 47:
this.$ = new yy.Offset($$[$0]);
break;
case 48:
this.$ = new yy.Offset($$[$0-1], $$[$0]);
break;
case 54:
this.$ = (function () {
        $$[$0-1].having = $$[$0];
        return $$[$0-1];
      }());
break;
case 55:
this.$ = new yy.Group($$[$0]);
break;
case 56:
this.$ = new yy.Having($$[$0]);
break;
case 58: case 59: case 60: case 61: case 63:
this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 62:
this.$ = new yy.Op($$[$0-3], $$[$0-4], $$[$0-1]);
break;
case 64:
this.$ = new yy.UnaryOp($$[$0-1], $$[$0]);
break;
case 74:
this.$ = new yy.ListValue($$[$0]);
break;
case 75:
this.$ = new yy.NumberValue($$[$0]);
break;
case 76:
this.$ = new yy.BooleanValue($$[$0]);
break;
case 77:
this.$ = new yy.ParameterValue($$[$0]);
break;
case 78:
this.$ = new yy.StringValue($$[$0], "'");
break;
case 79:
this.$ = new yy.StringValue($$[$0], '"');
break;
case 80:
this.$ = new yy.LiteralValue($$[$0]);
break;
case 81:
this.$ = new yy.LiteralValue($$[$0-2], $$[$0]);
break;
case 82:
this.$ = new yy.FunctionValue($$[$0-3], $$[$0-1]);
break;
case 83:
this.$ = new yy.FunctionValue($$[$0-3], $$[$0-1], true);
break;
case 84:
this.$ = new yy.ArgumentListValue($$[$0]);
break;
case 85:
this.$ = new yy.ArgumentListValue($$[$0], true);
break;
case 90:
this.$ = new yy.Star();
break;
case 91:
this.$ = new yy.Field($$[$0]);
break;
case 92:
this.$ = new yy.Field($$[$0-2], $$[$0]);
break;
}
},
table: [{3:1,4:2,6:3,8:4,9:5,10:6,14:7,16:$V0},{1:[3]},{5:[1,9]},o($V1,[2,2],{7:10,13:11,30:12,31:$V2,42:$V3}),o($V4,[2,4]),o($V4,[2,5]),o($V4,[2,6],{11:15,12:16,60:18,45:$V5,62:[1,19]}),o($V6,[2,11],{15:20,41:[1,21]}),{17:22,20:[1,23],22:30,24:$V7,29:31,36:26,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf,86:24,87:$Vg},{1:[2,1]},o($V1,[2,3],{30:44,31:$V2}),o($V4,[2,10]),o($Vh,[2,24]),{29:45,77:$V9},{6:46,8:4,9:5,10:6,14:7,16:$V0,32:[1,47]},o($V4,[2,7]),o($V4,[2,8],{11:48,45:$V5}),{46:[1,49]},o($Vi,[2,53],{61:50,64:[1,51]}),{46:[1,52]},o($V6,[2,12]),{22:30,24:$V7,29:31,36:53,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{18:[1,54],43:$Vj},{17:56,22:30,24:$V7,29:31,36:26,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf,86:24,87:$Vg},o($Vk,[2,88]),o($Vk,[2,90]),o($Vk,[2,91],{23:[1,57],65:$Vl,66:$Vm,67:$Vn,68:$Vo}),{22:30,24:$V7,29:31,36:62,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($Vp,[2,65],{69:[1,63]}),{24:[1,65],70:64},o($Vq,[2,67],{83:$Vr}),o($Vq,[2,68]),o($Vq,[2,69]),o($Vq,[2,70]),o($Vq,[2,71]),o($Vq,[2,72]),o($Vq,[2,73]),o([5,18,23,26,31,34,37,38,41,42,43,44,45,51,62,64,65,66,67,68,69,83],$Vs,{24:[1,67]}),o([5,18,23,26,31,34,37,38,41,42,43,44,45,51,54,55,62,64,65,66,67,68,69],[2,75]),o($Vq,[2,78]),o($Vq,[2,79]),{24:[1,68]},o($Vq,[2,76]),o($Vq,[2,77]),o($Vh,[2,25]),o($V4,[2,38],{43:[1,69],44:[1,70]}),o($Vh,[2,26],{13:11,42:$V3}),{6:71,8:4,9:5,10:6,14:7,16:$V0},o($V4,[2,9]),{22:30,29:31,47:72,49:73,50:74,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($Vi,[2,54]),{22:30,24:$V7,29:31,36:75,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{22:30,24:$V7,29:31,36:77,50:28,63:76,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($V6,[2,37],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),{19:78,22:79,24:$Vt,82:$Vu},{22:30,24:$V7,29:31,36:26,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf,86:82,87:$Vg},{18:[1,83],43:$Vj},{22:84,82:$Vu},{22:30,24:$V7,29:31,36:85,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{22:30,24:$V7,29:31,36:86,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{22:30,24:$V7,29:31,36:87,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{22:30,24:$V7,29:31,36:88,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{26:[1,89],65:$Vl,66:$Vm,67:$Vn,68:$Vo},{24:[1,90],70:91},o($Vp,[2,64]),{4:92,6:3,8:4,9:5,10:6,14:7,16:$V0},{82:[1,93]},{20:$Vv,22:30,24:$V7,29:31,36:77,50:28,63:95,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf,85:94},{20:$Vv,22:30,24:$V7,29:31,36:77,50:28,63:95,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf,85:97},{29:98,77:$V9},{29:99,77:$V9},o($Vh,[2,27],{13:11,42:$V3}),o($V4,[2,41],{48:100,43:[1,101],44:[1,102]}),o($Vw,[2,43]),o($Vw,[2,45],{51:[1,103]}),o($Vi,[2,56],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),o([5,26,31,42,45,64],[2,55],{43:$Vx}),o($Vy,[2,86],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),o($Vz,[2,13],{21:105,33:106,34:$VA,37:$VB,38:$VC}),o($VD,[2,17],{22:110,23:[1,111],27:[1,112],82:$Vu,83:$Vr}),{4:114,6:3,8:4,9:5,10:6,14:7,16:$V0,22:30,24:$V7,25:113,29:31,36:77,50:28,63:115,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o([5,18,23,26,27,31,34,35,37,38,41,42,43,45,62,82,83],$Vs),o($Vk,[2,89]),{19:116,22:79,24:$Vt,82:$Vu},o($Vk,[2,92],{83:$Vr}),o([5,18,23,26,31,34,37,38,41,42,43,45,62,64,65,67,68],[2,58],{66:$Vm}),o($Vp,[2,59]),o([5,18,23,26,31,34,37,38,41,42,43,45,62,64,67,68],[2,60],{65:$Vl,66:$Vm}),o([5,18,23,26,31,34,37,38,41,42,43,45,62,64,68],[2,61],{65:$Vl,66:$Vm,67:$Vn}),o($Vp,[2,57]),{4:92,6:3,8:4,9:5,10:6,14:7,16:$V0,22:30,24:$V7,25:117,29:31,36:77,50:28,63:115,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($Vp,[2,63]),{26:[1,118]},o([5,18,23,26,27,31,34,35,37,38,41,42,43,44,45,51,62,64,65,66,67,68,69,82,83],[2,81]),{26:[1,119]},{26:[2,84],43:$Vx},{22:30,24:$V7,29:31,36:77,50:28,63:120,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{26:[1,121]},o($V4,[2,39]),o($V4,[2,40]),o($V4,[2,42]),{22:30,29:31,49:122,50:74,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{29:124,52:123,77:$V9},o($Vw,[2,46]),{22:30,29:31,50:125,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($Vz,[2,15],{33:126,34:$VA,37:$VB,38:$VC}),o($VE,[2,28]),{19:127,22:79,24:$Vt,82:$Vu},{34:[1,128],39:[1,129],40:[1,130]},{34:[1,131],39:[1,132],40:[1,133]},o($VD,[2,18],{83:$Vr}),{22:134,82:$Vu},{28:[1,135]},{26:[1,136]},{26:[1,137]},{26:[2,74],43:$Vx},o($Vz,[2,14],{33:106,21:138,34:$VA,37:$VB,38:$VC}),{26:[1,139]},o($Vp,[2,66]),o($Vq,[2,83]),{26:[2,85],43:$Vx},o($Vq,[2,82]),o($Vw,[2,44]),o($V4,[2,47],{53:140,56:[1,141]}),{54:[1,142],55:[1,143]},o($Vy,[2,87]),o($VE,[2,29]),{35:[1,144]},{19:145,22:79,24:$Vt,82:$Vu},{34:[1,146]},{34:[1,147]},{19:148,22:79,24:$Vt,82:$Vu},{34:[1,149]},{34:[1,150]},o($VD,[2,19],{83:$Vr}),{24:[1,151]},o($VD,[2,20]),o($VD,[2,21],{22:152,82:$Vu}),o($Vz,[2,16],{33:126,34:$VA,37:$VB,38:$VC}),o($Vp,[2,62]),o($V4,[2,48]),{57:[1,153],59:[1,154]},o($VF,[2,49]),o($VF,[2,50]),{22:30,24:$V7,29:31,36:155,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{35:[1,156]},{19:157,22:79,24:$Vt,82:$Vu},{19:158,22:79,24:$Vt,82:$Vu},{35:[1,159]},{19:160,22:79,24:$Vt,82:$Vu},{19:161,22:79,24:$Vt,82:$Vu},{29:162,77:$V9},o($VD,[2,22],{83:$Vr}),{29:124,52:163,77:$V9},{29:124,52:164,77:$V9},o($VE,[2,30],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),{22:30,24:$V7,29:31,36:165,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{35:[1,166]},{35:[1,167]},{22:30,24:$V7,29:31,36:168,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{35:[1,169]},{35:[1,170]},{26:[1,171]},{58:[1,172]},{58:[1,173]},o($VE,[2,31],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),{22:30,24:$V7,29:31,36:174,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{22:30,24:$V7,29:31,36:175,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($VE,[2,32],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),{22:30,24:$V7,29:31,36:176,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},{22:30,24:$V7,29:31,36:177,50:28,71:$V8,72:32,73:33,74:34,75:35,76:36,77:$V9,78:$Va,79:$Vb,80:$Vc,81:$Vd,82:$Ve,84:$Vf},o($VD,[2,23]),o($V4,[2,51]),o($V4,[2,52]),o($VE,[2,33],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),o($VE,[2,35],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),o($VE,[2,34],{65:$Vl,66:$Vm,67:$Vn,68:$Vo}),o($VE,[2,36],{65:$Vl,66:$Vm,67:$Vn,68:$Vo})],
defaultActions: {9:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = _dereq_('fs').readFileSync(_dereq_('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && _dereq_.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,_dereq_('_process'))
},{"_process":15,"fs":3,"path":9}],18:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var Lexer;

  Lexer = (function() {
    var BOOLEAN, DBLSTRING, LITERAL, MATH, MATH_MULTI, NUMBER, PARAMETER, SEPARATOR, SQL_CONDITIONALS, SQL_FUNCTIONS, SQL_OPERATORS, SQL_SORT_ORDERS, STAR, STRING, SUB_SELECT_OP, SUB_SELECT_UNARY_OP, WHITESPACE;

    function Lexer(sql, opts) {
      var bytesConsumed, i;
      if (opts == null) {
        opts = {};
      }
      this.sql = sql;
      this.preserveWhitespace = opts.preserveWhitespace || false;
      this.tokens = [];
      this.currentLine = 1;
      i = 0;
      while (this.chunk = sql.slice(i)) {
        bytesConsumed = this.keywordToken() || this.starToken() || this.booleanToken() || this.functionToken() || this.windowExtension() || this.sortOrderToken() || this.seperatorToken() || this.operatorToken() || this.mathToken() || this.dotToken() || this.conditionalToken() || this.subSelectOpToken() || this.subSelectUnaryOpToken() || this.numberToken() || this.stringToken() || this.parameterToken() || this.parensToken() || this.whitespaceToken() || this.literalToken();
        if (bytesConsumed < 1) {
          throw new Error("NOTHING CONSUMED: Stopped at - '" + (this.chunk.slice(0, 30)) + "'");
        }
        i += bytesConsumed;
      }
      this.token('EOF', '');
      this.postProcess();
    }

    Lexer.prototype.postProcess = function() {
      var i, next_token, token, _i, _len, _ref, _results;
      _ref = this.tokens;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        token = _ref[i];
        if (token[0] === 'STAR') {
          next_token = this.tokens[i + 1];
          if (!(next_token[0] === 'SEPARATOR' || next_token[0] === 'FROM')) {
            _results.push(token[0] = 'MATH_MULTI');
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Lexer.prototype.token = function(name, value) {
      return this.tokens.push([name, value, this.currentLine]);
    };

    Lexer.prototype.tokenizeFromRegex = function(name, regex, part, lengthPart, output) {
      var match, partMatch;
      if (part == null) {
        part = 0;
      }
      if (lengthPart == null) {
        lengthPart = part;
      }
      if (output == null) {
        output = true;
      }
      if (!(match = regex.exec(this.chunk))) {
        return 0;
      }
      partMatch = match[part];
      if (output) {
        this.token(name, partMatch);
      }
      return match[lengthPart].length;
    };

    Lexer.prototype.tokenizeFromWord = function(name, word) {
      var match, matcher;
      if (word == null) {
        word = name;
      }
      word = this.regexEscape(word);
      matcher = /^\w+$/.test(word) ? new RegExp("^(" + word + ")\\b", 'ig') : new RegExp("^(" + word + ")", 'ig');
      match = matcher.exec(this.chunk);
      if (!match) {
        return 0;
      }
      this.token(name, match[1]);
      return match[1].length;
    };

    Lexer.prototype.tokenizeFromList = function(name, list) {
      var entry, ret, _i, _len;
      ret = 0;
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        entry = list[_i];
        ret = this.tokenizeFromWord(name, entry);
        if (ret > 0) {
          break;
        }
      }
      return ret;
    };

    Lexer.prototype.keywordToken = function() {
      return this.tokenizeFromWord('SELECT') || this.tokenizeFromWord('DISTINCT') || this.tokenizeFromWord('FROM') || this.tokenizeFromWord('WHERE') || this.tokenizeFromWord('GROUP') || this.tokenizeFromWord('ORDER') || this.tokenizeFromWord('BY') || this.tokenizeFromWord('HAVING') || this.tokenizeFromWord('LIMIT') || this.tokenizeFromWord('JOIN') || this.tokenizeFromWord('LEFT') || this.tokenizeFromWord('RIGHT') || this.tokenizeFromWord('INNER') || this.tokenizeFromWord('OUTER') || this.tokenizeFromWord('ON') || this.tokenizeFromWord('AS') || this.tokenizeFromWord('UNION') || this.tokenizeFromWord('ALL') || this.tokenizeFromWord('LIMIT') || this.tokenizeFromWord('OFFSET') || this.tokenizeFromWord('FETCH') || this.tokenizeFromWord('ROW') || this.tokenizeFromWord('ROWS') || this.tokenizeFromWord('ONLY') || this.tokenizeFromWord('NEXT') || this.tokenizeFromWord('FIRST');
    };

    Lexer.prototype.dotToken = function() {
      return this.tokenizeFromWord('DOT', '.');
    };

    Lexer.prototype.operatorToken = function() {
      return this.tokenizeFromList('OPERATOR', SQL_OPERATORS);
    };

    Lexer.prototype.mathToken = function() {
      return this.tokenizeFromList('MATH', MATH) || this.tokenizeFromList('MATH_MULTI', MATH_MULTI);
    };

    Lexer.prototype.conditionalToken = function() {
      return this.tokenizeFromList('CONDITIONAL', SQL_CONDITIONALS);
    };

    Lexer.prototype.subSelectOpToken = function() {
      return this.tokenizeFromList('SUB_SELECT_OP', SUB_SELECT_OP);
    };

    Lexer.prototype.subSelectUnaryOpToken = function() {
      return this.tokenizeFromList('SUB_SELECT_UNARY_OP', SUB_SELECT_UNARY_OP);
    };

    Lexer.prototype.functionToken = function() {
      return this.tokenizeFromList('FUNCTION', SQL_FUNCTIONS);
    };

    Lexer.prototype.sortOrderToken = function() {
      return this.tokenizeFromList('DIRECTION', SQL_SORT_ORDERS);
    };

    Lexer.prototype.booleanToken = function() {
      return this.tokenizeFromList('BOOLEAN', BOOLEAN);
    };

    Lexer.prototype.starToken = function() {
      return this.tokenizeFromRegex('STAR', STAR);
    };

    Lexer.prototype.seperatorToken = function() {
      return this.tokenizeFromRegex('SEPARATOR', SEPARATOR);
    };

    Lexer.prototype.literalToken = function() {
      return this.tokenizeFromRegex('LITERAL', LITERAL, 1, 0);
    };

    Lexer.prototype.numberToken = function() {
      return this.tokenizeFromRegex('NUMBER', NUMBER);
    };

    Lexer.prototype.parameterToken = function() {
      return this.tokenizeFromRegex('PARAMETER', PARAMETER);
    };

    Lexer.prototype.stringToken = function() {
      return this.tokenizeFromRegex('STRING', STRING, 1, 0) || this.tokenizeFromRegex('DBLSTRING', DBLSTRING, 1, 0);
    };

    Lexer.prototype.parensToken = function() {
      return this.tokenizeFromRegex('LEFT_PAREN', /^\(/) || this.tokenizeFromRegex('RIGHT_PAREN', /^\)/);
    };

    Lexer.prototype.windowExtension = function() {
      var match;
      match = /^\.(win):(length|time)/i.exec(this.chunk);
      if (!match) {
        return 0;
      }
      this.token('WINDOW', match[1]);
      this.token('WINDOW_FUNCTION', match[2]);
      return match[0].length;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, newlines, partMatch;
      if (!(match = WHITESPACE.exec(this.chunk))) {
        return 0;
      }
      partMatch = match[0];
      newlines = partMatch.replace(/[^\n]/, '').length;
      this.currentLine += newlines;
      if (this.preserveWhitespace) {
        this.token(name, partMatch);
      }
      return partMatch.length;
    };

    Lexer.prototype.regexEscape = function(str) {
      return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    SQL_FUNCTIONS = ['AVG', 'COUNT', 'MIN', 'MAX', 'SUM'];

    SQL_SORT_ORDERS = ['ASC', 'DESC'];

    SQL_OPERATORS = ['=', '!=', '>=', '>', '<=', '<>', '<', 'LIKE', 'IS NOT', 'IS'];

    SUB_SELECT_OP = ['IN', 'NOT IN', 'ANY', 'ALL', 'SOME'];

    SUB_SELECT_UNARY_OP = ['EXISTS'];

    SQL_CONDITIONALS = ['AND', 'OR'];

    BOOLEAN = ['TRUE', 'FALSE', 'NULL'];

    MATH = ['+', '-'];

    MATH_MULTI = ['/', '*'];

    STAR = /^\*/;

    SEPARATOR = /^,/;

    WHITESPACE = /^[ \n\r]+/;

    LITERAL = /^`?([a-z_][a-z0-9_]{0,})`?/i;

    PARAMETER = /^\$[0-9]+/;

    NUMBER = /^[0-9]+(\.[0-9]+)?/;

    STRING = /^'([^\\']*(?:\\.[^\\']*)*)'/;

    DBLSTRING = /^"([^\\"]*(?:\\.[^\\"]*)*)"/;

    return Lexer;

  })();

  exports.tokenize = function(sql, opts) {
    return (new Lexer(sql, opts)).tokens;
  };

}).call(this);

},{}],19:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var ArgumentListValue, Field, FunctionValue, Group, Having, Join, Limit, ListValue, LiteralValue, Offset, Op, Order, OrderArgument, ParameterValue, Select, Star, StringValue, SubSelect, Table, UnaryOp, Union, Where, indent;

  indent = function(str) {
    var line;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = str.split("\n");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push("  " + line);
      }
      return _results;
    })()).join("\n");
  };

  exports.Select = Select = (function() {
    function Select(fields, source, distinct, joins, unions) {
      this.fields = fields;
      this.source = source;
      this.distinct = distinct != null ? distinct : false;
      this.joins = joins != null ? joins : [];
      this.unions = unions != null ? unions : [];
      this.order = null;
      this.group = null;
      this.where = null;
      this.limit = null;
    }

    Select.prototype.toString = function() {
      var join, ret, union, _i, _j, _len, _len1, _ref, _ref1;
      ret = ["SELECT " + (this.fields.join(', '))];
      ret.push(indent("FROM " + this.source));
      _ref = this.joins;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        join = _ref[_i];
        ret.push(indent(join.toString()));
      }
      if (this.where) {
        ret.push(indent(this.where.toString()));
      }
      if (this.group) {
        ret.push(indent(this.group.toString()));
      }
      if (this.order) {
        ret.push(indent(this.order.toString()));
      }
      if (this.limit) {
        ret.push(indent(this.limit.toString()));
      }
      _ref1 = this.unions;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        union = _ref1[_j];
        ret.push(union.toString());
      }
      return ret.join("\n");
    };

    return Select;

  })();

  exports.SubSelect = SubSelect = (function() {
    function SubSelect(select, name) {
      this.select = select;
      this.name = name != null ? name : null;
      null;
    }

    SubSelect.prototype.toString = function() {
      var ret;
      ret = [];
      ret.push('(');
      ret.push(indent(this.select.toString()));
      ret.push(this.name ? ") " + (this.name.toString()) : ")");
      return ret.join("\n");
    };

    return SubSelect;

  })();

  exports.Join = Join = (function() {
    function Join(right, conditions, side, mode) {
      this.right = right;
      this.conditions = conditions != null ? conditions : null;
      this.side = side != null ? side : null;
      this.mode = mode != null ? mode : null;
      null;
    }

    Join.prototype.toString = function() {
      var ret;
      ret = '';
      if (this.side != null) {
        ret += "" + this.side + " ";
      }
      if (this.mode != null) {
        ret += "" + this.mode + " ";
      }
      return ret + ("JOIN " + this.right + "\n") + indent("ON " + this.conditions);
    };

    return Join;

  })();

  exports.Union = Union = (function() {
    function Union(query, all) {
      this.query = query;
      this.all = all != null ? all : false;
      null;
    }

    Union.prototype.toString = function() {
      var all;
      all = this.all ? ' ALL' : '';
      return "UNION" + all + "\n" + (this.query.toString());
    };

    return Union;

  })();

  exports.LiteralValue = LiteralValue = (function() {
    function LiteralValue(value, value2) {
      this.value = value;
      this.value2 = value2 != null ? value2 : null;
      if (this.value2) {
        this.nested = true;
        this.values = this.value.values;
        this.values.push(value2);
      } else {
        this.nested = false;
        this.values = [this.value];
      }
    }

    LiteralValue.prototype.toString = function() {
      return "`" + (this.values.join('.')) + "`";
    };

    return LiteralValue;

  })();

  exports.StringValue = StringValue = (function() {
    function StringValue(value, quoteType) {
      this.value = value;
      this.quoteType = quoteType != null ? quoteType : "''";
      null;
    }

    StringValue.prototype.toString = function() {
      return "" + this.quoteType + this.value + this.quoteType;
    };

    return StringValue;

  })();

  exports.NumberValue = LiteralValue = (function() {
    function LiteralValue(value) {
      this.value = Number(value);
    }

    LiteralValue.prototype.toString = function() {
      return this.value.toString();
    };

    return LiteralValue;

  })();

  exports.ListValue = ListValue = (function() {
    function ListValue(value) {
      this.value = value;
    }

    ListValue.prototype.toString = function() {
      return "(" + (this.value.join(', ')) + ")";
    };

    return ListValue;

  })();

  exports.ParameterValue = ParameterValue = (function() {
    function ParameterValue(value) {
      this.value = value;
      this.index = parseInt(value.substr(1), 10) - 1;
    }

    ParameterValue.prototype.toString = function() {
      return "" + this.value;
    };

    return ParameterValue;

  })();

  exports.ArgumentListValue = ArgumentListValue = (function() {
    function ArgumentListValue(value, distinct) {
      this.value = value;
      this.distinct = distinct != null ? distinct : false;
      null;
    }

    ArgumentListValue.prototype.toString = function() {
      if (this.distinct) {
        return "DISTINCT " + (this.value.join(', '));
      } else {
        return "" + (this.value.join(', '));
      }
    };

    return ArgumentListValue;

  })();

  exports.BooleanValue = LiteralValue = (function() {
    function LiteralValue(value) {
      this.value = (function() {
        switch (value.toLowerCase()) {
          case 'true':
            return true;
          case 'false':
            return false;
          default:
            return null;
        }
      })();
    }

    LiteralValue.prototype.toString = function() {
      if (this.value != null) {
        return this.value.toString().toUpperCase();
      } else {
        return 'NULL';
      }
    };

    return LiteralValue;

  })();

  exports.FunctionValue = FunctionValue = (function() {
    function FunctionValue(name, _arguments, udf) {
      this.name = name;
      this["arguments"] = _arguments != null ? _arguments : null;
      this.udf = udf != null ? udf : false;
      null;
    }

    FunctionValue.prototype.toString = function() {
      if (this["arguments"]) {
        return "" + (this.name.toUpperCase()) + "(" + (this["arguments"].toString()) + ")";
      } else {
        return "" + (this.name.toUpperCase()) + "()";
      }
    };

    return FunctionValue;

  })();

  exports.Order = Order = (function() {
    function Order(orderings, offset) {
      this.orderings = orderings;
      this.offset = offset;
    }

    Order.prototype.toString = function() {
      return ("ORDER BY " + (this.orderings.join(', '))) + (this.offset ? "\n" + this.offset.toString() : "");
    };

    return Order;

  })();

  exports.OrderArgument = OrderArgument = (function() {
    function OrderArgument(value, direction) {
      this.value = value;
      this.direction = direction != null ? direction : 'ASC';
      null;
    }

    OrderArgument.prototype.toString = function() {
      return "" + this.value + " " + this.direction;
    };

    return OrderArgument;

  })();

  exports.Offset = Offset = (function() {
    function Offset(row_count, limit) {
      this.row_count = row_count;
      this.limit = limit;
      null;
    }

    Offset.prototype.toString = function() {
      return ("OFFSET " + this.row_count + " ROWS") + (this.limit ? "\nFETCH NEXT " + this.limit + " ROWS ONLY" : "");
    };

    return Offset;

  })();

  exports.Limit = Limit = (function() {
    function Limit(value, offset) {
      this.value = value;
      this.offset = offset;
      null;
    }

    Limit.prototype.toString = function() {
      return ("LIMIT " + this.value) + (this.offset ? "\nOFFSET " + this.offset : "");
    };

    return Limit;

  })();

  exports.Table = Table = (function() {
    function Table(name, alias, win, winFn, winArg) {
      this.name = name;
      this.alias = alias != null ? alias : null;
      this.win = win != null ? win : null;
      this.winFn = winFn != null ? winFn : null;
      this.winArg = winArg != null ? winArg : null;
      null;
    }

    Table.prototype.toString = function() {
      if (this.win) {
        return "" + this.name + "." + this.win + ":" + this.winFn + "(" + this.winArg + ")";
      } else if (this.alias) {
        return "" + this.name + " AS " + this.alias;
      } else {
        return this.name.toString();
      }
    };

    return Table;

  })();

  exports.Group = Group = (function() {
    function Group(fields) {
      this.fields = fields;
      this.having = null;
    }

    Group.prototype.toString = function() {
      var ret;
      ret = ["GROUP BY " + (this.fields.join(', '))];
      if (this.having) {
        ret.push(this.having.toString());
      }
      return ret.join("\n");
    };

    return Group;

  })();

  exports.Where = Where = (function() {
    function Where(conditions) {
      this.conditions = conditions;
      null;
    }

    Where.prototype.toString = function() {
      return "WHERE " + this.conditions;
    };

    return Where;

  })();

  exports.Having = Having = (function() {
    function Having(conditions) {
      this.conditions = conditions;
      null;
    }

    Having.prototype.toString = function() {
      return "HAVING " + this.conditions;
    };

    return Having;

  })();

  exports.Op = Op = (function() {
    function Op(operation, left, right) {
      this.operation = operation;
      this.left = left;
      this.right = right;
      null;
    }

    Op.prototype.toString = function() {
      return "(" + this.left + " " + (this.operation.toUpperCase()) + " " + this.right + ")";
    };

    return Op;

  })();

  exports.UnaryOp = UnaryOp = (function() {
    function UnaryOp(operator, operand) {
      this.operator = operator;
      this.operand = operand;
      null;
    }

    UnaryOp.prototype.toString = function() {
      return "(" + (this.operator.toUpperCase()) + " " + this.operand + ")";
    };

    return UnaryOp;

  })();

  exports.Field = Field = (function() {
    function Field(field, name) {
      this.field = field;
      this.name = name != null ? name : null;
      null;
    }

    Field.prototype.toString = function() {
      if (this.name) {
        return "" + this.field + " AS " + this.name;
      } else {
        return this.field.toString();
      }
    };

    return Field;

  })();

  exports.Star = Star = (function() {
    function Star() {
      null;
    }

    Star.prototype.toString = function() {
      return '*';
    };

    Star.prototype.star = true;

    return Star;

  })();

}).call(this);

},{}],20:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var buildParser;

  buildParser = function() {
    var parser;
    parser = _dereq_('./compiled_parser').parser;
    parser.lexer = {
      lex: function() {
        var tag, _ref;
        _ref = this.tokens[this.pos++] || [''], tag = _ref[0], this.yytext = _ref[1], this.yylineno = _ref[2];
        return tag;
      },
      setInput: function(tokens) {
        this.tokens = tokens;
        return this.pos = 0;
      },
      upcomingInput: function() {
        return "";
      }
    };
    parser.yy = _dereq_('./nodes');
    return parser;
  };

  exports.parser = buildParser();

  exports.parse = function(str) {
    return buildParser().parse(str);
  };

}).call(this);

},{"./compiled_parser":17,"./nodes":19}],21:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  exports.lexer = _dereq_('./lexer');

  exports.parser = _dereq_('./parser');

  exports.nodes = _dereq_('./nodes');

  exports.parse = function(sql) {
    return exports.parser.parse(exports.lexer.tokenize(sql));
  };

}).call(this);

},{"./lexer":18,"./nodes":19,"./parser":20}],22:[function(_dereq_,module,exports){
// SQL parser library
var sqlparser = _dereq_('sql-parser');

// simplifies value objects to allow dot notation for accessing objects e.g. person.name
// strips back ticks so that `person.name` becomes person.name
var simplify = function(obj) {
  var str = obj.toString().replace(/^[`']/,'').replace(/[`']$/,'');
  // if it contains backticks, it's too complex for Mango e.g. COS(`x`)
  if (str.match(/`/)) {
    throw new Error(str + ' not supported');
  }
  return str;
};

// simplifies and then tries to infer types from the data for value parameters in the WHERE clause
// e.g. "2.5" --> 2.5
//       "2"  --> 2
//      "true" --> true etc
var parameterise = function(obj) {
  var str = simplify(obj);
  var u = str.toUpperCase();

  // if the thing is numeric, parse as number
  if (str.match(/^[\-0-9\.]+$/)) {
    if (str.match(/\./)) {
      return parseFloat(str);
    } else {
      return parseInt(str);
    }
  } else if (u === 'TRUE') {
    return true;
  } else if (u === 'FALSE') {
    return false;
  } else {
    return str;
  }
};

// recursive function that dives into the tree of parsed WHERE clauses and creates
// the equivalent selector. The selector function calls itself as it meets operators
// like AND and OR, making the JSON tree deeper at this point.
// s - the selector object to be added to
// condition - the parsed SQL condition to be converted.
var selector = function(s, condition) {
  var op = null;
  
  switch (condition.operation.toUpperCase()) {
    case '=':
      s[simplify(condition.left)] = { '$eq' : parameterise(condition.right) };
    break;

    case '!=':
      s[simplify(condition.left)] = { '$ne' : parameterise(condition.right) };
    break;

    case '<':
      s[simplify(condition.left)] = { '$lt' : parameterise(condition.right) };
    break;

    case '<=':
      s[simplify(condition.left)] = { '$lte' : parameterise(condition.right) };
    break;

    case '>':
      s[simplify(condition.left)] = { '$gt' : parameterise(condition.right) };
    break;

    case '>=':
      s[simplify(condition.left)] = { '$gte' : parameterise(condition.right) };
    break;

    case 'IN':
      s[simplify(condition.left)] = { '$in' : condition.right.value.map(function(v) { return v.value}) };    
    break;

    case 'NOT IN':
      s[simplify(condition.left)] = { '$nin' : condition.right.value.map(function(v) { return v.value}) };    
    break;

    case 'AND':
      op = '$and';
      s[op] = [];
      s[op].push(selector({}, condition.left));
      s[op].push(selector({}, condition.right));      
    break;

    case 'OR':
      op = '$or';
      s[op] = [];
      s[op].push(selector({}, condition.left));
      s[op].push(selector({}, condition.right));      
    break;

    default: 
      throw(new Error('unsupported SQL operation ' + condition.operation));
  }

  return s;
};


// parase an SQL query and return the equivalent Cloudant QUERY
var parse = function(query) {

  // throw on non string
  if (typeof query !== 'string') {
    throw(new Error('query must be a string'));
  }

  // empty cloudant query object
  var obj = { };

  // parse the SQL into a tree
  var tree = sqlparser.parse(query);

  // look for exceptions
  if (tree.distinct) {
    throw new Error('DISTINCT not supported');
  }
  if (tree.joins.length > 0) {
    throw new Error('joins not supported');
  }
  if (tree.unions.length > 0) {
    throw new Error('unions not supported');
  }
  if (tree.group) {
    throw new Error('GROUP not supported');
  }

  // extract the field list 
  if (tree.fields && tree.fields.toString() !== '*') {
    obj.fields = [];
    for(var i in tree.fields) {
      var field = tree.fields[i];
      
      // aliases not supported
      if (field.name !== null) {
        throw new Error('alias ' + field.toString() + ' not supported');
      }

      // complex things in the field list not supported
      if (!field.field.value) {
        throw new Error(field.toString() + ' not supported');
      }
      obj.fields.push(simplify(field.field))
      
    }
  } 

  // extract where clauses by recursively walking the tree
  if (tree.where) {
    obj.selector = selector({}, tree.where.conditions);
  }

  // extract order by and convert to mango syntax
  if (tree.order && tree.order.orderings) {
    obj.sort = [];
    var lastorder = null;
    for(var i in tree.order.orderings) {
      var t = tree.order.orderings[i];
      var s = {
      }; 
      s[t.value.value] = (t.direction.toUpperCase() === 'DESC') ? 'desc' : 'asc';
      if (lastorder != null && s[t.value.value] != lastorder) {
        throw new Error('ORDER BY must be either all ASC or all DESC, not mixed')
      }
      lastorder = s[t.value.value];
      obj.sort.push(s);
    }
  }

  // skip and limit
  if (tree.limit) {
    obj.limit = tree.limit.value.value;
    if (tree.limit.offset) {
      obj.skip = tree.limit.offset.value;
    }
  }

  return obj;
};

module.exports = {
  parse: parse
};
},{"sql-parser":16}]},{},[1]);
