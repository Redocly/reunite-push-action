exports.id = 719;
exports.ids = [719];
exports.modules = {

/***/ 8348:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.req = exports.json = exports.toBuffer = void 0;
const http = __importStar(__webpack_require__(3685));
const https = __importStar(__webpack_require__(5687));
async function toBuffer(stream) {
    let length = 0;
    const chunks = [];
    for await (const chunk of stream) {
        length += chunk.length;
        chunks.push(chunk);
    }
    return Buffer.concat(chunks, length);
}
exports.toBuffer = toBuffer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(stream) {
    const buf = await toBuffer(stream);
    const str = buf.toString('utf8');
    try {
        return JSON.parse(str);
    }
    catch (_err) {
        const err = _err;
        err.message += ` (input: ${str})`;
        throw err;
    }
}
exports.json = json;
function req(url, opts = {}) {
    const href = typeof url === 'string' ? url : url.href;
    const req = (href.startsWith('https:') ? https : http).request(url, opts);
    const promise = new Promise((resolve, reject) => {
        req
            .once('response', resolve)
            .once('error', reject)
            .end();
    });
    req.then = promise.then.bind(promise);
    return req;
}
exports.req = req;
//# sourceMappingURL=helpers.js.map

/***/ }),

/***/ 694:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Agent = void 0;
const net = __importStar(__webpack_require__(1808));
const http = __importStar(__webpack_require__(3685));
const https_1 = __webpack_require__(5687);
__exportStar(__webpack_require__(8348), exports);
const INTERNAL = Symbol('AgentBaseInternalState');
class Agent extends http.Agent {
    constructor(opts) {
        super(opts);
        this[INTERNAL] = {};
    }
    /**
     * Determine whether this is an `http` or `https` request.
     */
    isSecureEndpoint(options) {
        if (options) {
            // First check the `secureEndpoint` property explicitly, since this
            // means that a parent `Agent` is "passing through" to this instance.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof options.secureEndpoint === 'boolean') {
                return options.secureEndpoint;
            }
            // If no explicit `secure` endpoint, check if `protocol` property is
            // set. This will usually be the case since using a full string URL
            // or `URL` instance should be the most common usage.
            if (typeof options.protocol === 'string') {
                return options.protocol === 'https:';
            }
        }
        // Finally, if no `protocol` property was set, then fall back to
        // checking the stack trace of the current call stack, and try to
        // detect the "https" module.
        const { stack } = new Error();
        if (typeof stack !== 'string')
            return false;
        return stack
            .split('\n')
            .some((l) => l.indexOf('(https.js:') !== -1 ||
            l.indexOf('node:https:') !== -1);
    }
    // In order to support async signatures in `connect()` and Node's native
    // connection pooling in `http.Agent`, the array of sockets for each origin
    // has to be updated synchronously. This is so the length of the array is
    // accurate when `addRequest()` is next called. We achieve this by creating a
    // fake socket and adding it to `sockets[origin]` and incrementing
    // `totalSocketCount`.
    incrementSockets(name) {
        // If `maxSockets` and `maxTotalSockets` are both Infinity then there is no
        // need to create a fake socket because Node.js native connection pooling
        // will never be invoked.
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
            return null;
        }
        // All instances of `sockets` are expected TypeScript errors. The
        // alternative is to add it as a private property of this class but that
        // will break TypeScript subclassing.
        if (!this.sockets[name]) {
            // @ts-expect-error `sockets` is readonly in `@types/node`
            this.sockets[name] = [];
        }
        const fakeSocket = new net.Socket({ writable: false });
        this.sockets[name].push(fakeSocket);
        // @ts-expect-error `totalSocketCount` isn't defined in `@types/node`
        this.totalSocketCount++;
        return fakeSocket;
    }
    decrementSockets(name, socket) {
        if (!this.sockets[name] || socket === null) {
            return;
        }
        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
            sockets.splice(index, 1);
            // @ts-expect-error  `totalSocketCount` isn't defined in `@types/node`
            this.totalSocketCount--;
            if (sockets.length === 0) {
                // @ts-expect-error `sockets` is readonly in `@types/node`
                delete this.sockets[name];
            }
        }
    }
    // In order to properly update the socket pool, we need to call `getName()` on
    // the core `https.Agent` if it is a secureEndpoint.
    getName(options) {
        const secureEndpoint = typeof options.secureEndpoint === 'boolean'
            ? options.secureEndpoint
            : this.isSecureEndpoint(options);
        if (secureEndpoint) {
            // @ts-expect-error `getName()` isn't defined in `@types/node`
            return https_1.Agent.prototype.getName.call(this, options);
        }
        // @ts-expect-error `getName()` isn't defined in `@types/node`
        return super.getName(options);
    }
    createSocket(req, options, cb) {
        const connectOpts = {
            ...options,
            secureEndpoint: this.isSecureEndpoint(options),
        };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);
        Promise.resolve()
            .then(() => this.connect(req, connectOpts))
            .then((socket) => {
            this.decrementSockets(name, fakeSocket);
            if (socket instanceof http.Agent) {
                try {
                    // @ts-expect-error `addRequest()` isn't defined in `@types/node`
                    return socket.addRequest(req, connectOpts);
                }
                catch (err) {
                    return cb(err);
                }
            }
            this[INTERNAL].currentSocket = socket;
            // @ts-expect-error `createSocket()` isn't defined in `@types/node`
            super.createSocket(req, options, cb);
        }, (err) => {
            this.decrementSockets(name, fakeSocket);
            cb(err);
        });
    }
    createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = undefined;
        if (!socket) {
            throw new Error('No socket was returned in the `connect()` function');
        }
        return socket;
    }
    get defaultPort() {
        return (this[INTERNAL].defaultPort ??
            (this.protocol === 'https:' ? 443 : 80));
    }
    set defaultPort(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].defaultPort = v;
        }
    }
    get protocol() {
        return (this[INTERNAL].protocol ??
            (this.isSecureEndpoint() ? 'https:' : 'http:'));
    }
    set protocol(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].protocol = v;
        }
    }
}
exports.Agent = Agent;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 8222:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

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

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(6243)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 6243:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(900);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 8237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(8222);
} else {
	module.exports = __webpack_require__(5332);
}


/***/ }),

/***/ 5332:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(6224);
const util = __webpack_require__(3837);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(9318);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(6243)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 1621:
/***/ ((module) => {

"use strict";


module.exports = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


/***/ }),

/***/ 7219:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpsProxyAgent = void 0;
const net = __importStar(__webpack_require__(1808));
const tls = __importStar(__webpack_require__(4404));
const assert_1 = __importDefault(__webpack_require__(9491));
const debug_1 = __importDefault(__webpack_require__(8237));
const agent_base_1 = __webpack_require__(694);
const url_1 = __webpack_require__(7310);
const parse_proxy_response_1 = __webpack_require__(595);
const debug = (0, debug_1.default)('https-proxy-agent');
const setServernameFromNonIpHost = (options) => {
    if (options.servername === undefined &&
        options.host &&
        !net.isIP(options.host)) {
        return {
            ...options,
            servername: options.host,
        };
    }
    return options;
};
/**
 * The `HttpsProxyAgent` implements an HTTP Agent subclass that connects to
 * the specified "HTTP(s) proxy server" in order to proxy HTTPS requests.
 *
 * Outgoing HTTP requests are first tunneled through the proxy server using the
 * `CONNECT` HTTP request method to establish a connection to the proxy server,
 * and then the proxy server connects to the destination target and issues the
 * HTTP request from the proxy server.
 *
 * `https:` requests have their socket connection upgraded to TLS once
 * the connection to the proxy server has been established.
 */
class HttpsProxyAgent extends agent_base_1.Agent {
    constructor(proxy, opts) {
        super(opts);
        this.options = { path: undefined };
        this.proxy = typeof proxy === 'string' ? new url_1.URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        debug('Creating new HttpsProxyAgent instance: %o', this.proxy.href);
        // Trim off the brackets from IPv6 addresses
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, '');
        const port = this.proxy.port
            ? parseInt(this.proxy.port, 10)
            : this.proxy.protocol === 'https:'
                ? 443
                : 80;
        this.connectOpts = {
            // Attempt to negotiate http/1.1 for proxy servers that support http/2
            ALPNProtocols: ['http/1.1'],
            ...(opts ? omit(opts, 'headers') : null),
            host,
            port,
        };
    }
    /**
     * Called when the node-core HTTP client library is creating a
     * new HTTP request.
     */
    async connect(req, opts) {
        const { proxy } = this;
        if (!opts.host) {
            throw new TypeError('No "host" provided');
        }
        // Create a socket connection to the proxy server.
        let socket;
        if (proxy.protocol === 'https:') {
            debug('Creating `tls.Socket`: %o', this.connectOpts);
            socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
        }
        else {
            debug('Creating `net.Socket`: %o', this.connectOpts);
            socket = net.connect(this.connectOpts);
        }
        const headers = typeof this.proxyHeaders === 'function'
            ? this.proxyHeaders()
            : { ...this.proxyHeaders };
        const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r\n`;
        // Inject the `Proxy-Authorization` header if necessary.
        if (proxy.username || proxy.password) {
            const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
            headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`;
        }
        headers.Host = `${host}:${opts.port}`;
        if (!headers['Proxy-Connection']) {
            headers['Proxy-Connection'] = this.keepAlive
                ? 'Keep-Alive'
                : 'close';
        }
        for (const name of Object.keys(headers)) {
            payload += `${name}: ${headers[name]}\r\n`;
        }
        const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
        socket.write(`${payload}\r\n`);
        const { connect, buffered } = await proxyResponsePromise;
        req.emit('proxyConnect', connect);
        this.emit('proxyConnect', connect, req);
        if (connect.statusCode === 200) {
            req.once('socket', resume);
            if (opts.secureEndpoint) {
                // The proxy is connecting to a TLS server, so upgrade
                // this socket connection to a TLS connection.
                debug('Upgrading socket connection to TLS');
                return tls.connect({
                    ...omit(setServernameFromNonIpHost(opts), 'host', 'path', 'port'),
                    socket,
                });
            }
            return socket;
        }
        // Some other status code that's not 200... need to re-play the HTTP
        // header "data" events onto the socket once the HTTP machinery is
        // attached so that the node core `http` can parse and handle the
        // error status code.
        // Close the original socket, and a new "fake" socket is returned
        // instead, so that the proxy doesn't get the HTTP request
        // written to it (which may contain `Authorization` headers or other
        // sensitive data).
        //
        // See: https://hackerone.com/reports/541502
        socket.destroy();
        const fakeSocket = new net.Socket({ writable: false });
        fakeSocket.readable = true;
        // Need to wait for the "socket" event to re-play the "data" events.
        req.once('socket', (s) => {
            debug('Replaying proxy buffer for failed request');
            (0, assert_1.default)(s.listenerCount('data') > 0);
            // Replay the "buffered" Buffer onto the fake `socket`, since at
            // this point the HTTP module machinery has been hooked up for
            // the user.
            s.push(buffered);
            s.push(null);
        });
        return fakeSocket;
    }
}
HttpsProxyAgent.protocols = ['http', 'https'];
exports.HttpsProxyAgent = HttpsProxyAgent;
function resume(socket) {
    socket.resume();
}
function omit(obj, ...keys) {
    const ret = {};
    let key;
    for (key in obj) {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    }
    return ret;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 595:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseProxyResponse = void 0;
const debug_1 = __importDefault(__webpack_require__(8237));
const debug = (0, debug_1.default)('https-proxy-agent:parse-proxy-response');
function parseProxyResponse(socket) {
    return new Promise((resolve, reject) => {
        // we need to buffer any HTTP traffic that happens with the proxy before we get
        // the CONNECT response, so that if the response is anything other than an "200"
        // response code, then we can re-play the "data" events on the socket once the
        // HTTP parser is hooked up...
        let buffersLength = 0;
        const buffers = [];
        function read() {
            const b = socket.read();
            if (b)
                ondata(b);
            else
                socket.once('readable', read);
        }
        function cleanup() {
            socket.removeListener('end', onend);
            socket.removeListener('error', onerror);
            socket.removeListener('readable', read);
        }
        function onend() {
            cleanup();
            debug('onend');
            reject(new Error('Proxy connection ended before receiving CONNECT response'));
        }
        function onerror(err) {
            cleanup();
            debug('onerror %o', err);
            reject(err);
        }
        function ondata(b) {
            buffers.push(b);
            buffersLength += b.length;
            const buffered = Buffer.concat(buffers, buffersLength);
            const endOfHeaders = buffered.indexOf('\r\n\r\n');
            if (endOfHeaders === -1) {
                // keep buffering
                debug('have not received end of HTTP headers yet...');
                read();
                return;
            }
            const headerParts = buffered
                .slice(0, endOfHeaders)
                .toString('ascii')
                .split('\r\n');
            const firstLine = headerParts.shift();
            if (!firstLine) {
                socket.destroy();
                return reject(new Error('No header received from proxy CONNECT response'));
            }
            const firstLineParts = firstLine.split(' ');
            const statusCode = +firstLineParts[1];
            const statusText = firstLineParts.slice(2).join(' ');
            const headers = {};
            for (const header of headerParts) {
                if (!header)
                    continue;
                const firstColon = header.indexOf(':');
                if (firstColon === -1) {
                    socket.destroy();
                    return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
                }
                const key = header.slice(0, firstColon).toLowerCase();
                const value = header.slice(firstColon + 1).trimStart();
                const current = headers[key];
                if (typeof current === 'string') {
                    headers[key] = [current, value];
                }
                else if (Array.isArray(current)) {
                    current.push(value);
                }
                else {
                    headers[key] = value;
                }
            }
            debug('got proxy server response: %o %o', firstLine, headers);
            cleanup();
            resolve({
                connect: {
                    statusCode,
                    statusText,
                    headers,
                },
                buffered,
            });
        }
        socket.on('error', onerror);
        socket.on('end', onend);
        read();
    });
}
exports.parseProxyResponse = parseProxyResponse;
//# sourceMappingURL=parse-proxy-response.js.map

/***/ }),

/***/ 900:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
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
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 9318:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(2037);
const tty = __webpack_require__(6224);
const hasFlag = __webpack_require__(1621);

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};


/***/ }),

/***/ 833:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Ur": () => (/* reexport */ ReuniteApi),
  "zV": () => (/* reexport */ ReuniteApiError),
  "Bd": () => (/* reexport */ getApiKeys),
  "ge": () => (/* reexport */ getDomain)
});

// UNUSED EXPORTS: InvalidReuniteUrlError, REUNITE_URLS, ReuniteApiClient, getReuniteUrl, isValidReuniteUrl, streamToBuffer

// EXTERNAL MODULE: ./node_modules/@redocly/openapi-core/lib/index.js + 210 modules
var lib = __webpack_require__(1234);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/utils/constants.js
const OTEL_URL = 'https://otel.cloud.redocly.com';
const OTEL_TRACES_URL = process.env.OTEL_TRACES_URL || `${OTEL_URL}/v1/traces`;
const DEFAULT_FETCH_TIMEOUT = 6000;
const ANONYMOUS_ID_CACHE_FILE = 'redocly-cli-anonymous-id';
//# sourceMappingURL=constants.js.map
// EXTERNAL MODULE: ./node_modules/undici/index.js
var undici = __webpack_require__(1773);
// EXTERNAL MODULE: ./node_modules/https-proxy-agent/dist/index.js
var dist = __webpack_require__(7219);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/utils/proxy-agent.js

function getProxyUrl() {
    return (process.env.HTTPS_PROXY ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy ||
        process.env.https_proxy);
}
function getProxyAgent() {
    const proxy = getProxyUrl();
    return proxy ? new HttpsProxyAgent(proxy) : undefined;
}
function shouldBypassProxy(url) {
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (!noProxy)
        return false;
    const entries = noProxy
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    if (entries.length === 0)
        return false;
    let hostname;
    try {
        hostname = new URL(url).hostname.toLowerCase();
    }
    catch {
        return false;
    }
    return entries.some((entry) => {
        if (entry === '*')
            return true;
        if (hostname === entry)
            return true;
        if (entry.startsWith('.') && hostname.endsWith(entry))
            return true;
        if (!entry.startsWith('.') && hostname.endsWith('.' + entry))
            return true;
        return false;
    });
}
//# sourceMappingURL=proxy-agent.js.map
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/utils/fetch-with-timeout.js


/* harmony default export */ const fetch_with_timeout = (async (url, { timeout, ...options } = {}) => {
    const proxyUrl = getProxyUrl();
    const useProxy = proxyUrl && !shouldBypassProxy(url);
    let dispatcher;
    const connectOptions = timeout ? { connect: { timeout } } : {};
    if (useProxy) {
        dispatcher = new undici.ProxyAgent({
            uri: proxyUrl,
            ...connectOptions,
        });
    }
    else if (timeout) {
        dispatcher = new undici.Agent(connectOptions);
    }
    const res = await fetch(url, {
        signal: timeout ? AbortSignal.timeout(timeout) : undefined,
        ...options,
        dispatcher,
    });
    return res;
});
//# sourceMappingURL=fetch-with-timeout.js.map
// EXTERNAL MODULE: ./node_modules/@redocly/cli/lib/utils/package.js
var utils_package = __webpack_require__(3466);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/reunite/api/api-client.js




class ReuniteApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
class ReuniteApiClient {
    command;
    sunsetWarnings = [];
    constructor(command) {
        this.command = command;
    }
    async request(url, options) {
        const headers = {
            ...options.headers,
            'user-agent': `redocly-cli/${utils_package/* version */.i8} ${this.command}`,
        };
        try {
            const response = await fetch_with_timeout(url, {
                ...options,
                headers,
            });
            this.collectSunsetWarning(response);
            return response;
        }
        catch (err) {
            let errorMessage = 'Failed to fetch.';
            if (err.cause) {
                errorMessage += ` Caused by ${err.cause.message || err.cause.name}.`;
            }
            if (err.code || err.cause?.code) {
                errorMessage += ` Code: ${err.code || err.cause?.code}`;
            }
            throw new Error(errorMessage);
        }
    }
    collectSunsetWarning(response) {
        const sunsetTime = this.getSunsetDate(response);
        if (!sunsetTime)
            return;
        const sunsetDate = new Date(sunsetTime);
        if (sunsetTime > Date.now()) {
            this.sunsetWarnings.push({
                sunsetDate,
                isSunsetExpired: false,
            });
        }
        else {
            this.sunsetWarnings.push({
                sunsetDate,
                isSunsetExpired: true,
            });
        }
    }
    getSunsetDate(response) {
        const { headers } = response;
        if (!headers) {
            return;
        }
        const sunsetDate = headers.get('sunset') || headers.get('Sunset');
        if (!sunsetDate) {
            return;
        }
        return Date.parse(sunsetDate);
    }
}
class RemotesApi {
    client;
    domain;
    apiKey;
    constructor(client, domain, apiKey) {
        this.client = client;
        this.domain = domain;
        this.apiKey = apiKey;
    }
    async getParsedResponse(response) {
        const responseBody = await response.json();
        if (response.ok) {
            return responseBody;
        }
        throw new ReuniteApiError(`${responseBody.title || response.statusText || 'Unknown error'}.`, response.status);
    }
    async getDefaultBranch(organizationId, projectId) {
        try {
            const response = await this.client.request(`${this.domain}/api/orgs/${organizationId}/projects/${projectId}/source`, {
                timeout: DEFAULT_FETCH_TIMEOUT,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            const source = await this.getParsedResponse(response);
            return source.branchName;
        }
        catch (err) {
            const message = `Failed to fetch default branch. ${err.message}`;
            if (err instanceof ReuniteApiError) {
                throw new ReuniteApiError(message, err.status);
            }
            throw new Error(message);
        }
    }
    async upsert(organizationId, projectId, remote) {
        try {
            const response = await this.client.request(`${this.domain}/api/orgs/${organizationId}/projects/${projectId}/remotes`, {
                timeout: DEFAULT_FETCH_TIMEOUT,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    mountPath: remote.mountPath,
                    mountBranchName: remote.mountBranchName,
                    type: 'CICD',
                    autoMerge: true,
                }),
            });
            return await this.getParsedResponse(response);
        }
        catch (err) {
            const message = `Failed to upsert remote. ${err.message}`;
            if (err instanceof ReuniteApiError) {
                throw new ReuniteApiError(message, err.status);
            }
            throw new Error(message);
        }
    }
    async push(organizationId, projectId, payload, files) {
        const formData = new globalThis.FormData();
        formData.append('remoteId', payload.remoteId);
        formData.append('commit[message]', payload.commit.message);
        formData.append('commit[author][name]', payload.commit.author.name);
        formData.append('commit[author][email]', payload.commit.author.email);
        formData.append('commit[branchName]', payload.commit.branchName);
        if (payload.commit.url) {
            formData.append('commit[url]', payload.commit.url);
        }
        if (payload.commit.namespace) {
            formData.append('commit[namespaceId]', payload.commit.namespace);
        }
        if (payload.commit.sha) {
            formData.append('commit[sha]', payload.commit.sha);
        }
        if (payload.commit.repository) {
            formData.append('commit[repositoryId]', payload.commit.repository);
        }
        if (payload.commit.createdAt) {
            formData.append('commit[createdAt]', payload.commit.createdAt);
        }
        for (const file of files) {
            const blob = Buffer.isBuffer(file.stream)
                ? new Blob([file.stream])
                : new Blob([(await streamToBuffer(file.stream))]);
            formData.append(`files[${file.path}]`, blob, file.path);
        }
        if (payload.isMainBranch) {
            formData.append('isMainBranch', 'true');
        }
        try {
            const response = await this.client.request(`${this.domain}/api/orgs/${organizationId}/projects/${projectId}/pushes`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: formData,
            });
            return await this.getParsedResponse(response);
        }
        catch (err) {
            const message = `Failed to push. ${err.message}`;
            if (err instanceof ReuniteApiError) {
                throw new ReuniteApiError(message, err.status);
            }
            throw new Error(message);
        }
    }
    async getRemotesList({ organizationId, projectId, mountPath, }) {
        try {
            const response = await this.client.request(`${this.domain}/api/orgs/${organizationId}/projects/${projectId}/remotes?filter=mountPath:/${mountPath}/`, {
                timeout: DEFAULT_FETCH_TIMEOUT,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            return await this.getParsedResponse(response);
        }
        catch (err) {
            const message = `Failed to get remote list. ${err.message}`;
            if (err instanceof ReuniteApiError) {
                throw new ReuniteApiError(message, err.status);
            }
            throw new Error(message);
        }
    }
    async getPush({ organizationId, projectId, pushId, }) {
        try {
            const response = await this.client.request(`${this.domain}/api/orgs/${organizationId}/projects/${projectId}/pushes/${pushId}`, {
                timeout: DEFAULT_FETCH_TIMEOUT,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            return await this.getParsedResponse(response);
        }
        catch (err) {
            const message = `Failed to get push status. ${err.message}`;
            if (err instanceof ReuniteApiError) {
                throw new ReuniteApiError(message, err.status);
            }
            throw new Error(message);
        }
    }
}
class ReuniteApi {
    apiClient;
    command;
    remotes;
    constructor({ domain, apiKey, command, }) {
        this.command = command;
        this.apiClient = new ReuniteApiClient(this.command);
        this.remotes = new RemotesApi(this.apiClient, domain, apiKey);
    }
    reportSunsetWarnings() {
        const sunsetWarnings = this.apiClient.sunsetWarnings;
        if (sunsetWarnings.length) {
            const [{ isSunsetExpired, sunsetDate }] = sunsetWarnings.sort((a, b) => {
                // First, prioritize by expiration status
                if (a.isSunsetExpired !== b.isSunsetExpired) {
                    return a.isSunsetExpired ? -1 : 1;
                }
                // If both are either expired or not, sort by sunset date
                return a.sunsetDate > b.sunsetDate ? 1 : -1;
            });
            const updateVersionMessage = `Update to the latest version by running "npm install @redocly/cli@latest".`;
            if (isSunsetExpired) {
                lib.logger.error(`The "${this.command}" command is not compatible with your version of Redocly CLI. ${updateVersionMessage}\n\n`);
            }
            else {
                lib.logger.warn(`The "${this.command}" command will be incompatible with your version of Redocly CLI after ${sunsetDate.toLocaleString()}. ${updateVersionMessage}\n\n`);
            }
        }
    }
}
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}
//# sourceMappingURL=api-client.js.map
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/reunite/api/domains.js
const REUNITE_URLS = {
    us: 'https://app.cloud.redocly.com',
    eu: 'https://app.cloud.eu.redocly.com',
};
function getDomain() {
    return process.env.REDOCLY_DOMAIN || REUNITE_URLS.us;
}
const getReuniteUrl = withHttpsValidation((config, residencyOption) => {
    try {
        const residency = residencyOption || config?.resolvedConfig.residency;
        if (isLegacyResidency(residency)) {
            return REUNITE_URLS[residency];
        }
        if (residency) {
            return new URL(residency).origin;
        }
        if (config?.resolvedConfig.scorecard?.fromProjectUrl) {
            return new URL(config.resolvedConfig.scorecard.fromProjectUrl).origin;
        }
        return REUNITE_URLS.us;
    }
    catch {
        throw new InvalidReuniteUrlError();
    }
});
function isValidReuniteUrl(reuniteUrl) {
    try {
        getReuniteUrl(undefined, reuniteUrl);
    }
    catch {
        return false;
    }
    return true;
}
function withHttpsValidation(fn) {
    return (...args) => {
        const url = fn(...args);
        if (!url.startsWith('https://')) {
            throw new InvalidReuniteUrlError();
        }
        return url;
    };
}
class InvalidReuniteUrlError extends Error {
    constructor() {
        super('Invalid Reunite URL');
    }
}
function isLegacyResidency(value) {
    return typeof value === 'string' && value in REUNITE_URLS;
}
//# sourceMappingURL=domains.js.map
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/reunite/api/api-keys.js
function getApiKeys() {
    if (process.env.REDOCLY_AUTHORIZATION) {
        return process.env.REDOCLY_AUTHORIZATION;
    }
    throw new Error('No api key provided, please use environment variable REDOCLY_AUTHORIZATION.');
}
//# sourceMappingURL=api-keys.js.map
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/reunite/api/index.js



//# sourceMappingURL=index.js.map

/***/ }),

/***/ 2719:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "handlePushStatus": () => (/* binding */ handlePushStatus)
});

// EXTERNAL MODULE: ./node_modules/@redocly/openapi-core/lib/index.js + 210 modules
var lib = __webpack_require__(1234);
// EXTERNAL MODULE: ./node_modules/colorette/index.js
var colorette = __webpack_require__(8559);
// EXTERNAL MODULE: ./node_modules/@redocly/cli/lib/utils/miscellaneous.js + 2 modules
var miscellaneous = __webpack_require__(4707);
// EXTERNAL MODULE: external "node:process"
var external_node_process_ = __webpack_require__(7742);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/utils/spinner.js


const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
class Spinner {
    frames;
    currentFrame;
    intervalId;
    message;
    constructor() {
        this.frames = SPINNER_FRAMES;
        this.currentFrame = 0;
        this.intervalId = null;
        this.message = '';
    }
    showFrame() {
        lib.logger.info('\r' + this.frames[this.currentFrame] + ' ' + this.message);
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }
    start(message) {
        if (this.message === message) {
            return;
        }
        this.message = message;
        // If we're not in a TTY, don't display the spinner.
        if (!external_node_process_.stderr.isTTY) {
            lib.logger.info(`${message}...\n`);
            return;
        }
        if (this.intervalId === null) {
            this.intervalId = setInterval(() => {
                this.showFrame();
            }, 100);
        }
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            lib.logger.info('\r');
        }
        this.message = '';
    }
}
//# sourceMappingURL=spinner.js.map
// EXTERNAL MODULE: ./node_modules/@redocly/cli/lib/reunite/api/index.js + 6 modules
var api = __webpack_require__(833);
// EXTERNAL MODULE: ./node_modules/@redocly/cli/lib/reunite/utils.js
var utils = __webpack_require__(6973);
// EXTERNAL MODULE: ./node_modules/@redocly/cli/lib/reunite/commands/utils.js
var commands_utils = __webpack_require__(2378);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/reunite/commands/push-status.js







const RETRY_INTERVAL_MS = 5000; // 5 sec
async function handlePushStatus({ argv, }) {
    const startedAt = performance.now();
    const spinner = new Spinner();
    const { organization, project: projectId, pushId, wait } = argv;
    const domain = argv.domain || (0,api/* getDomain */.ge)();
    const maxExecutionTime = argv['max-execution-time'] || 1200; // 20 min
    const retryIntervalMs = argv['retry-interval']
        ? argv['retry-interval'] * 1000
        : RETRY_INTERVAL_MS;
    const startTime = argv['start-time'] || Date.now();
    const retryTimeoutMs = maxExecutionTime * 1000;
    const continueOnDeployFailures = argv['continue-on-deploy-failures'] || false;
    try {
        const apiKey = (0,api/* getApiKeys */.Bd)();
        const client = new api/* ReuniteApi */.Ur({ domain, apiKey, command: 'push-status' });
        let pushResponse;
        pushResponse = await (0,commands_utils/* retryUntilConditionMet */.D)({
            operation: () => client.remotes.getPush({
                organizationId: organization,
                projectId,
                pushId,
            }),
            condition: wait
                ? // Keep retrying if status is "pending" or "running" (returning false, so the operation will be retried)
                    (result) => !['pending', 'running'].includes(result.status['preview'].deploy.status)
                : null,
            onConditionNotMet: (lastResult) => {
                displayDeploymentAndBuildStatus({
                    status: lastResult.status['preview'].deploy.status,
                    url: lastResult.status['preview'].deploy.url,
                    spinner,
                    buildType: 'preview',
                    continueOnDeployFailures,
                    wait,
                });
            },
            onRetry: (lastResult) => {
                if (argv.onRetry) {
                    argv.onRetry({
                        preview: lastResult.status.preview,
                        production: lastResult.isMainBranch ? lastResult.status.production : null,
                        commit: lastResult.commit,
                    });
                }
            },
            startTime,
            retryTimeoutMs,
            retryIntervalMs,
        });
        printPushStatus({
            buildType: 'preview',
            spinner,
            wait,
            push: pushResponse,
            continueOnDeployFailures,
        });
        printScorecard(pushResponse.status.preview.scorecard);
        const shouldWaitForProdDeployment = pushResponse.isMainBranch &&
            (wait ? pushResponse.status.preview.deploy.status === 'success' : true);
        if (shouldWaitForProdDeployment) {
            pushResponse = await (0,commands_utils/* retryUntilConditionMet */.D)({
                operation: () => client.remotes.getPush({
                    organizationId: organization,
                    projectId,
                    pushId,
                }),
                condition: wait
                    ? // Keep retrying if status is "pending" or "running" (returning false, so the operation will be retried)
                        (result) => !['pending', 'running'].includes(result.status['production'].deploy.status)
                    : null,
                onConditionNotMet: (lastResult) => {
                    displayDeploymentAndBuildStatus({
                        status: lastResult.status['production'].deploy.status,
                        url: lastResult.status['production'].deploy.url,
                        spinner,
                        buildType: 'production',
                        continueOnDeployFailures,
                        wait,
                    });
                },
                onRetry: (lastResult) => {
                    if (argv.onRetry) {
                        argv.onRetry({
                            preview: lastResult.status.preview,
                            production: lastResult.isMainBranch ? lastResult.status.production : null,
                            commit: lastResult.commit,
                        });
                    }
                },
                startTime,
                retryTimeoutMs,
                retryIntervalMs,
            });
        }
        if (pushResponse.isMainBranch) {
            printPushStatus({
                buildType: 'production',
                spinner,
                wait,
                push: pushResponse,
                continueOnDeployFailures,
            });
            printScorecard(pushResponse.status.production.scorecard);
        }
        printPushStatusInfo({ organization, projectId, pushId, startedAt });
        client.reportSunsetWarnings();
        const summary = {
            preview: pushResponse.status.preview,
            production: pushResponse.isMainBranch ? pushResponse.status.production : null,
            commit: pushResponse.commit,
        };
        return summary;
    }
    catch (err) {
        spinner.stop(); // Spinner can block process exit, so we need to stop it explicitly.
        (0,commands_utils/* handleReuniteError */.K)('✗ Failed to get push status.', err);
    }
    finally {
        spinner.stop(); // Spinner can block process exit, so we need to stop it explicitly.
    }
}
function printPushStatusInfo({ organization, projectId, pushId, startedAt, }) {
    lib.logger.info(`\nProcessed push-status for ${colorette.yellow(organization)}, ${colorette.yellow(projectId)} and pushID ${colorette.yellow(pushId)}.\n`);
    (0,miscellaneous/* printExecutionTime */.NH)('push-status', startedAt, 'Finished');
}
function printPushStatus({ buildType, spinner, push, continueOnDeployFailures, }) {
    if (!push) {
        return;
    }
    if (push.isOutdated || !push.hasChanges) {
        lib.logger.warn(`Files not added to your project. Reason: ${push.isOutdated ? 'outdated' : 'no changes'}.\n`);
    }
    else {
        displayDeploymentAndBuildStatus({
            status: push.status[buildType].deploy.status,
            url: push.status[buildType].deploy.url,
            buildType,
            spinner,
            continueOnDeployFailures,
        });
    }
}
function printScorecard(scorecard) {
    if (!scorecard || scorecard.length === 0) {
        return;
    }
    lib.logger.output(`\n${colorette.magenta('Scorecard')}:`);
    for (const scorecardItem of scorecard) {
        lib.logger.output(`
    ${colorette.magenta('Name')}: ${scorecardItem.name}
    ${colorette.magenta('Status')}: ${scorecardItem.status}
    ${colorette.magenta('URL')}: ${colorette.cyan(scorecardItem.url)}
    ${colorette.magenta('Description')}: ${scorecardItem.description}\n`);
    }
    lib.logger.output(`\n`);
}
function displayDeploymentAndBuildStatus({ status, url, spinner, buildType, continueOnDeployFailures, wait, }) {
    const message = getMessage({ status, url, buildType, wait });
    if (status === 'failed' && !continueOnDeployFailures) {
        spinner.stop();
        throw new utils/* DeploymentError */.J(message);
    }
    if (wait && (status === 'pending' || status === 'running')) {
        return spinner.start(message);
    }
    spinner.stop();
    return lib.logger.output(message);
}
function getMessage({ status, url, buildType, wait, }) {
    switch (status) {
        case 'skipped':
            return `${colorette.yellow(`Skipped ${buildType}`)}\n`;
        case 'pending': {
            const message = `${colorette.yellow(`Pending ${buildType}`)}`;
            return wait ? message : `Status: ${message}\n`;
        }
        case 'running': {
            const message = `${colorette.yellow(`Running ${buildType}`)}`;
            return wait ? message : `Status: ${message}\n`;
        }
        case 'success':
            return `${colorette.green(`🚀 ${(0,miscellaneous/* capitalize */.kC)(buildType)} deploy success.`)}\n${colorette.magenta(`${(0,miscellaneous/* capitalize */.kC)(buildType)} URL`)}: ${colorette.cyan(url || 'No URL yet.')}\n`;
        case 'failed':
            return `${colorette.red(`❌ ${(0,miscellaneous/* capitalize */.kC)(buildType)} deploy fail.`)}\n${colorette.magenta(`${(0,miscellaneous/* capitalize */.kC)(buildType)} URL`)}: ${colorette.cyan(url || 'No URL yet.')}`;
        default: {
            const message = `${colorette.yellow(`No status yet for ${buildType} deploy`)}`;
            return wait ? message : `Status: ${message}\n`;
        }
    }
}
//# sourceMappingURL=push-status.js.map

/***/ }),

/***/ 2378:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "D": () => (/* binding */ retryUntilConditionMet),
/* harmony export */   "K": () => (/* binding */ handleReuniteError)
/* harmony export */ });
/* harmony import */ var _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1234);
/* harmony import */ var _utils_error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4259);
/* harmony import */ var _api_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(833);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6973);




/**
 * This function retries an operation until a condition is met or a timeout is exceeded.
 * If the condition is not met within the timeout, an error is thrown.
 * @operation The operation to retry.
 * @condition The condition to check after each operation result. Return false to continue retrying. Return true to stop retrying.
 *            If not provided, the first result will be returned.
 * @param onConditionNotMet Will be called with the last result right after checking condition and before timeout and retrying.
 * @param onRetry Will be called right before retrying operation with the last result before retrying.
 * @param startTime The start time of the operation. Default is the current time.
 * @param retryTimeoutMs The maximum time to retry the operation. Default is 10 minutes.
 * @param retryIntervalMs The interval between retries. Default is 5 seconds.
 */
async function retryUntilConditionMet({ operation, condition, onConditionNotMet, onRetry, startTime = Date.now(), retryTimeoutMs = 600000, // 10 min
retryIntervalMs = 5000, // 5 sec
 }) {
    async function attempt() {
        const result = await operation();
        if (!condition) {
            return result;
        }
        if (condition(result)) {
            return result;
        }
        else if (Date.now() - startTime > retryTimeoutMs) {
            throw new Error('Timeout exceeded.');
        }
        else {
            onConditionNotMet?.(result);
            await (0,_redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.pause)(retryIntervalMs);
            await onRetry?.(result);
            return attempt();
        }
    }
    return attempt();
}
function handleReuniteError(message, error) {
    if (error instanceof _utils_js__WEBPACK_IMPORTED_MODULE_3__/* .DeploymentError */ .J) {
        return (0,_utils_error_js__WEBPACK_IMPORTED_MODULE_1__/* .exitWithError */ .R)(error.message);
    }
    if (error instanceof _api_index_js__WEBPACK_IMPORTED_MODULE_2__/* .ReuniteApiError */ .zV) {
        return (0,_utils_error_js__WEBPACK_IMPORTED_MODULE_1__/* .exitWithError */ .R)(`${message} Reason: ${error.message} (status: ${error.status})\n`);
    }
    return (0,_utils_error_js__WEBPACK_IMPORTED_MODULE_1__/* .exitWithError */ .R)(`${message} Reason: ${error.message}\n`);
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 6973:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "J": () => (/* binding */ DeploymentError)
/* harmony export */ });
class DeploymentError extends Error {
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 4259:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "R": () => (/* binding */ exitWithError)
/* harmony export */ });
/* unused harmony export AbortFlowError */
/* harmony import */ var _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1234);

// Is used to abort the flow of execution - will be catched in the command execution wrapper
class AbortFlowError extends Error {
}
function exitWithError(message) {
    throw new _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.HandledError(message);
}
//# sourceMappingURL=error.js.map

/***/ }),

/***/ 4707:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "kC": () => (/* binding */ capitalize),
  "NH": () => (/* binding */ printExecutionTime)
});

// UNUSED EXPORTS: CircularJSONNotSupportedError, checkIfRulesetExist, cleanColors, dumpBundle, escapeLanguageName, formatPath, getAliasOrPath, getAndValidateFileExtension, getExecutionTime, getFallbackApisOrExit, getOutputFileName, handleError, langToExt, loadConfigAndHandleErrors, pathToFilename, printConfigLintTotals, printLintTotals, printUnusedWarnings, promptUser, readYaml, saveBundle, sortTopLevelKeys, writeJson, writeToFileByExtension, writeYaml

// EXTERNAL MODULE: ./node_modules/@redocly/openapi-core/lib/index.js + 210 modules
var lib = __webpack_require__(1234);
// EXTERNAL MODULE: ./node_modules/colorette/index.js
var colorette = __webpack_require__(8559);
// EXTERNAL MODULE: external "node:url"
var external_node_url_ = __webpack_require__(1041);
// EXTERNAL MODULE: external "node:path"
var external_node_path_ = __webpack_require__(9411);
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(7147);
// EXTERNAL MODULE: external "node:fs"
var external_node_fs_ = __webpack_require__(7561);
var external_node_fs_namespaceObject = /*#__PURE__*/__webpack_require__.t(external_node_fs_, 2);
// EXTERNAL MODULE: external "node:fs/promises"
var promises_ = __webpack_require__(3977);
// EXTERNAL MODULE: external "node:events"
var external_node_events_ = __webpack_require__(5673);
// EXTERNAL MODULE: external "node:stream"
var external_node_stream_ = __webpack_require__(4492);
// EXTERNAL MODULE: external "node:string_decoder"
var external_node_string_decoder_ = __webpack_require__(6915);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/node_modules/glob/dist/esm/index.min.js
var Gt=(n,t,e)=>{let s=n instanceof RegExp?ce(n,e):n,i=t instanceof RegExp?ce(t,e):t,r=s!==null&&i!=null&&ss(s,i,e);return r&&{start:r[0],end:r[1],pre:e.slice(0,r[0]),body:e.slice(r[0]+s.length,r[1]),post:e.slice(r[1]+i.length)}},ce=(n,t)=>{let e=t.match(n);return e?e[0]:null},ss=(n,t,e)=>{let s,i,r,o,h,a=e.indexOf(n),l=e.indexOf(t,a+1),u=a;if(a>=0&&l>0){if(n===t)return[a,l];for(s=[],r=e.length;u>=0&&!h;){if(u===a)s.push(u),a=e.indexOf(n,u+1);else if(s.length===1){let c=s.pop();c!==void 0&&(h=[c,l])}else i=s.pop(),i!==void 0&&i<r&&(r=i,o=l),l=e.indexOf(t,u+1);u=a<l&&a>=0?a:l}s.length&&o!==void 0&&(h=[r,o])}return h};var fe="\0SLASH"+Math.random()+"\0",ue="\0OPEN"+Math.random()+"\0",qt="\0CLOSE"+Math.random()+"\0",de="\0COMMA"+Math.random()+"\0",pe="\0PERIOD"+Math.random()+"\0",is=new RegExp(fe,"g"),rs=new RegExp(ue,"g"),ns=new RegExp(qt,"g"),os=new RegExp(de,"g"),hs=new RegExp(pe,"g"),as=/\\\\/g,ls=/\\{/g,cs=/\\}/g,index_min_fs=/\\,/g,us=/\\./g,ds=1e5;function Ht(n){return isNaN(n)?n.charCodeAt(0):parseInt(n,10)}function ps(n){return n.replace(as,fe).replace(ls,ue).replace(cs,qt).replace(index_min_fs,de).replace(us,pe)}function ms(n){return n.replace(is,"\\").replace(rs,"{").replace(ns,"}").replace(os,",").replace(hs,".")}function me(n){if(!n)return[""];let t=[],e=Gt("{","}",n);if(!e)return n.split(",");let{pre:s,body:i,post:r}=e,o=s.split(",");o[o.length-1]+="{"+i+"}";let h=me(r);return r.length&&(o[o.length-1]+=h.shift(),o.push.apply(o,h)),t.push.apply(t,o),t}function ge(n,t={}){if(!n)return[];let{max:e=ds}=t;return n.slice(0,2)==="{}"&&(n="\\{\\}"+n.slice(2)),ht(ps(n),e,!0).map(ms)}function gs(n){return"{"+n+"}"}function ws(n){return/^-?0\d/.test(n)}function ys(n,t){return n<=t}function bs(n,t){return n>=t}function ht(n,t,e){let s=[],i=Gt("{","}",n);if(!i)return[n];let r=i.pre,o=i.post.length?ht(i.post,t,!1):[""];if(/\$$/.test(i.pre))for(let h=0;h<o.length&&h<t;h++){let a=r+"{"+i.body+"}"+o[h];s.push(a)}else{let h=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(i.body),a=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(i.body),l=h||a,u=i.body.indexOf(",")>=0;if(!l&&!u)return i.post.match(/,(?!,).*\}/)?(n=i.pre+"{"+i.body+qt+i.post,ht(n,t,!0)):[n];let c;if(l)c=i.body.split(/\.\./);else if(c=me(i.body),c.length===1&&c[0]!==void 0&&(c=ht(c[0],t,!1).map(gs),c.length===1))return o.map(f=>i.pre+c[0]+f);let d;if(l&&c[0]!==void 0&&c[1]!==void 0){let f=Ht(c[0]),m=Ht(c[1]),p=Math.max(c[0].length,c[1].length),w=c.length===3&&c[2]!==void 0?Math.abs(Ht(c[2])):1,g=ys;m<f&&(w*=-1,g=bs);let E=c.some(ws);d=[];for(let y=f;g(y,m);y+=w){let b;if(a)b=String.fromCharCode(y),b==="\\"&&(b="");else if(b=String(y),E){let z=p-b.length;if(z>0){let $=new Array(z+1).join("0");y<0?b="-"+$+b.slice(1):b=$+b}}d.push(b)}}else{d=[];for(let f=0;f<c.length;f++)d.push.apply(d,ht(c[f],t,!1))}for(let f=0;f<d.length;f++)for(let m=0;m<o.length&&s.length<t;m++){let p=r+d[f]+o[m];(!e||l||p)&&s.push(p)}}return s}var at=n=>{if(typeof n!="string")throw new TypeError("invalid pattern");if(n.length>65536)throw new TypeError("pattern is too long")};var Ss={"[:alnum:]":["\\p{L}\\p{Nl}\\p{Nd}",!0],"[:alpha:]":["\\p{L}\\p{Nl}",!0],"[:ascii:]":["\\x00-\\x7f",!1],"[:blank:]":["\\p{Zs}\\t",!0],"[:cntrl:]":["\\p{Cc}",!0],"[:digit:]":["\\p{Nd}",!0],"[:graph:]":["\\p{Z}\\p{C}",!0,!0],"[:lower:]":["\\p{Ll}",!0],"[:print:]":["\\p{C}",!0],"[:punct:]":["\\p{P}",!0],"[:space:]":["\\p{Z}\\t\\r\\n\\v\\f",!0],"[:upper:]":["\\p{Lu}",!0],"[:word:]":["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}",!0],"[:xdigit:]":["A-Fa-f0-9",!1]},lt=n=>n.replace(/[[\]\\-]/g,"\\$&"),Es=n=>n.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),we=n=>n.join(""),ye=(n,t)=>{let e=t;if(n.charAt(e)!=="[")throw new Error("not in a brace expression");let s=[],i=[],r=e+1,o=!1,h=!1,a=!1,l=!1,u=e,c="";t:for(;r<n.length;){let p=n.charAt(r);if((p==="!"||p==="^")&&r===e+1){l=!0,r++;continue}if(p==="]"&&o&&!a){u=r+1;break}if(o=!0,p==="\\"&&!a){a=!0,r++;continue}if(p==="["&&!a){for(let[w,[g,S,E]]of Object.entries(Ss))if(n.startsWith(w,r)){if(c)return["$.",!1,n.length-e,!0];r+=w.length,E?i.push(g):s.push(g),h=h||S;continue t}}if(a=!1,c){p>c?s.push(lt(c)+"-"+lt(p)):p===c&&s.push(lt(p)),c="",r++;continue}if(n.startsWith("-]",r+1)){s.push(lt(p+"-")),r+=2;continue}if(n.startsWith("-",r+1)){c=p,r+=2;continue}s.push(lt(p)),r++}if(u<r)return["",!1,0,!1];if(!s.length&&!i.length)return["$.",!1,n.length-e,!0];if(i.length===0&&s.length===1&&/^\\?.$/.test(s[0])&&!l){let p=s[0].length===2?s[0].slice(-1):s[0];return[Es(p),!1,u-e,!1]}let d="["+(l?"^":"")+we(s)+"]",f="["+(l?"":"^")+we(i)+"]";return[s.length&&i.length?"("+d+"|"+f+")":s.length?d:f,h,u-e,!0]};var W=(n,{windowsPathsNoEscape:t=!1,magicalBraces:e=!0}={})=>e?t?n.replace(/\[([^\/\\])\]/g,"$1"):n.replace(/((?!\\).|^)\[([^\/\\])\]/g,"$1$2").replace(/\\([^\/])/g,"$1"):t?n.replace(/\[([^\/\\{}])\]/g,"$1"):n.replace(/((?!\\).|^)\[([^\/\\{}])\]/g,"$1$2").replace(/\\([^\/{}])/g,"$1");var xs=new Set(["!","?","+","*","@"]),be=n=>xs.has(n),vs="(?!(?:^|/)\\.\\.?(?:$|/))",Ct="(?!\\.)",Cs=new Set(["[","."]),Ts=new Set(["..","."]),As=new Set("().*{}+?[]^$\\!"),ks=n=>n.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),Kt="[^/]",Se=Kt+"*?",Ee=Kt+"+?",Q=class n{type;#t;#s;#n=!1;#r=[];#o;#S;#w;#c=!1;#h;#u;#f=!1;constructor(t,e,s={}){this.type=t,t&&(this.#s=!0),this.#o=e,this.#t=this.#o?this.#o.#t:this,this.#h=this.#t===this?s:this.#t.#h,this.#w=this.#t===this?[]:this.#t.#w,t==="!"&&!this.#t.#c&&this.#w.push(this),this.#S=this.#o?this.#o.#r.length:0}get hasMagic(){if(this.#s!==void 0)return this.#s;for(let t of this.#r)if(typeof t!="string"&&(t.type||t.hasMagic))return this.#s=!0;return this.#s}toString(){return this.#u!==void 0?this.#u:this.type?this.#u=this.type+"("+this.#r.map(t=>String(t)).join("|")+")":this.#u=this.#r.map(t=>String(t)).join("")}#a(){if(this!==this.#t)throw new Error("should only call on root");if(this.#c)return this;this.toString(),this.#c=!0;let t;for(;t=this.#w.pop();){if(t.type!=="!")continue;let e=t,s=e.#o;for(;s;){for(let i=e.#S+1;!s.type&&i<s.#r.length;i++)for(let r of t.#r){if(typeof r=="string")throw new Error("string part in extglob AST??");r.copyIn(s.#r[i])}e=s,s=e.#o}}return this}push(...t){for(let e of t)if(e!==""){if(typeof e!="string"&&!(e instanceof n&&e.#o===this))throw new Error("invalid part: "+e);this.#r.push(e)}}toJSON(){let t=this.type===null?this.#r.slice().map(e=>typeof e=="string"?e:e.toJSON()):[this.type,...this.#r.map(e=>e.toJSON())];return this.isStart()&&!this.type&&t.unshift([]),this.isEnd()&&(this===this.#t||this.#t.#c&&this.#o?.type==="!")&&t.push({}),t}isStart(){if(this.#t===this)return!0;if(!this.#o?.isStart())return!1;if(this.#S===0)return!0;let t=this.#o;for(let e=0;e<this.#S;e++){let s=t.#r[e];if(!(s instanceof n&&s.type==="!"))return!1}return!0}isEnd(){if(this.#t===this||this.#o?.type==="!")return!0;if(!this.#o?.isEnd())return!1;if(!this.type)return this.#o?.isEnd();let t=this.#o?this.#o.#r.length:0;return this.#S===t-1}copyIn(t){typeof t=="string"?this.push(t):this.push(t.clone(this))}clone(t){let e=new n(this.type,t);for(let s of this.#r)e.copyIn(s);return e}static#i(t,e,s,i){let r=!1,o=!1,h=-1,a=!1;if(e.type===null){let f=s,m="";for(;f<t.length;){let p=t.charAt(f++);if(r||p==="\\"){r=!r,m+=p;continue}if(o){f===h+1?(p==="^"||p==="!")&&(a=!0):p==="]"&&!(f===h+2&&a)&&(o=!1),m+=p;continue}else if(p==="["){o=!0,h=f,a=!1,m+=p;continue}if(!i.noext&&be(p)&&t.charAt(f)==="("){e.push(m),m="";let w=new n(p,e);f=n.#i(t,w,f,i),e.push(w);continue}m+=p}return e.push(m),f}let l=s+1,u=new n(null,e),c=[],d="";for(;l<t.length;){let f=t.charAt(l++);if(r||f==="\\"){r=!r,d+=f;continue}if(o){l===h+1?(f==="^"||f==="!")&&(a=!0):f==="]"&&!(l===h+2&&a)&&(o=!1),d+=f;continue}else if(f==="["){o=!0,h=l,a=!1,d+=f;continue}if(be(f)&&t.charAt(l)==="("){u.push(d),d="";let m=new n(f,u);u.push(m),l=n.#i(t,m,l,i);continue}if(f==="|"){u.push(d),d="",c.push(u),u=new n(null,e);continue}if(f===")")return d===""&&e.#r.length===0&&(e.#f=!0),u.push(d),d="",e.push(...c,u),l;d+=f}return e.type=null,e.#s=void 0,e.#r=[t.substring(s-1)],l}static fromGlob(t,e={}){let s=new n(null,void 0,e);return n.#i(t,s,0,e),s}toMMPattern(){if(this!==this.#t)return this.#t.toMMPattern();let t=this.toString(),[e,s,i,r]=this.toRegExpSource();if(!(i||this.#s||this.#h.nocase&&!this.#h.nocaseMagicOnly&&t.toUpperCase()!==t.toLowerCase()))return s;let h=(this.#h.nocase?"i":"")+(r?"u":"");return Object.assign(new RegExp(`^${e}$`,h),{_src:e,_glob:t})}get options(){return this.#h}toRegExpSource(t){let e=t??!!this.#h.dot;if(this.#t===this&&this.#a(),!this.type){let a=this.isStart()&&this.isEnd()&&!this.#r.some(f=>typeof f!="string"),l=this.#r.map(f=>{let[m,p,w,g]=typeof f=="string"?n.#E(f,this.#s,a):f.toRegExpSource(t);return this.#s=this.#s||w,this.#n=this.#n||g,m}).join(""),u="";if(this.isStart()&&typeof this.#r[0]=="string"&&!(this.#r.length===1&&Ts.has(this.#r[0]))){let m=Cs,p=e&&m.has(l.charAt(0))||l.startsWith("\\.")&&m.has(l.charAt(2))||l.startsWith("\\.\\.")&&m.has(l.charAt(4)),w=!e&&!t&&m.has(l.charAt(0));u=p?vs:w?Ct:""}let c="";return this.isEnd()&&this.#t.#c&&this.#o?.type==="!"&&(c="(?:$|\\/)"),[u+l+c,W(l),this.#s=!!this.#s,this.#n]}let s=this.type==="*"||this.type==="+",i=this.type==="!"?"(?:(?!(?:":"(?:",r=this.#d(e);if(this.isStart()&&this.isEnd()&&!r&&this.type!=="!"){let a=this.toString();return this.#r=[a],this.type=null,this.#s=void 0,[a,W(this.toString()),!1,!1]}let o=!s||t||e||!Ct?"":this.#d(!0);o===r&&(o=""),o&&(r=`(?:${r})(?:${o})*?`);let h="";if(this.type==="!"&&this.#f)h=(this.isStart()&&!e?Ct:"")+Ee;else{let a=this.type==="!"?"))"+(this.isStart()&&!e&&!t?Ct:"")+Se+")":this.type==="@"?")":this.type==="?"?")?":this.type==="+"&&o?")":this.type==="*"&&o?")?":`)${this.type}`;h=i+r+a}return[h,W(r),this.#s=!!this.#s,this.#n]}#d(t){return this.#r.map(e=>{if(typeof e=="string")throw new Error("string type in extglob ast??");let[s,i,r,o]=e.toRegExpSource(t);return this.#n=this.#n||o,s}).filter(e=>!(this.isStart()&&this.isEnd())||!!e).join("|")}static#E(t,e,s=!1){let i=!1,r="",o=!1,h=!1;for(let a=0;a<t.length;a++){let l=t.charAt(a);if(i){i=!1,r+=(As.has(l)?"\\":"")+l;continue}if(l==="*"){if(h)continue;h=!0,r+=s&&/^[*]+$/.test(t)?Ee:Se,e=!0;continue}else h=!1;if(l==="\\"){a===t.length-1?r+="\\\\":i=!0;continue}if(l==="["){let[u,c,d,f]=ye(t,a);if(d){r+=u,o=o||c,a+=d-1,e=e||f;continue}}if(l==="?"){r+=Kt,e=!0;continue}r+=ks(l)}return[r,W(t),!!e,o]}};var tt=(n,{windowsPathsNoEscape:t=!1,magicalBraces:e=!1}={})=>e?t?n.replace(/[?*()[\]{}]/g,"[$&]"):n.replace(/[?*()[\]\\{}]/g,"\\$&"):t?n.replace(/[?*()[\]]/g,"[$&]"):n.replace(/[?*()[\]\\]/g,"\\$&");var O=(n,t,e={})=>(at(t),!e.nocomment&&t.charAt(0)==="#"?!1:new D(t,e).match(n)),Rs=/^\*+([^+@!?\*\[\(]*)$/,Os=n=>t=>!t.startsWith(".")&&t.endsWith(n),Fs=n=>t=>t.endsWith(n),Ds=n=>(n=n.toLowerCase(),t=>!t.startsWith(".")&&t.toLowerCase().endsWith(n)),Ms=n=>(n=n.toLowerCase(),t=>t.toLowerCase().endsWith(n)),Ns=/^\*+\.\*+$/,_s=n=>!n.startsWith(".")&&n.includes("."),Ls=n=>n!=="."&&n!==".."&&n.includes("."),Ws=/^\.\*+$/,Ps=n=>n!=="."&&n!==".."&&n.startsWith("."),js=/^\*+$/,Is=n=>n.length!==0&&!n.startsWith("."),zs=n=>n.length!==0&&n!=="."&&n!=="..",Bs=/^\?+([^+@!?\*\[\(]*)?$/,Us=([n,t=""])=>{let e=Ce([n]);return t?(t=t.toLowerCase(),s=>e(s)&&s.toLowerCase().endsWith(t)):e},$s=([n,t=""])=>{let e=Te([n]);return t?(t=t.toLowerCase(),s=>e(s)&&s.toLowerCase().endsWith(t)):e},Gs=([n,t=""])=>{let e=Te([n]);return t?s=>e(s)&&s.endsWith(t):e},Hs=([n,t=""])=>{let e=Ce([n]);return t?s=>e(s)&&s.endsWith(t):e},Ce=([n])=>{let t=n.length;return e=>e.length===t&&!e.startsWith(".")},Te=([n])=>{let t=n.length;return e=>e.length===t&&e!=="."&&e!==".."},Ae=typeof process=="object"&&process?typeof process.env=="object"&&process.env&&process.env.__MINIMATCH_TESTING_PLATFORM__||process.platform:"posix",xe={win32:{sep:"\\"},posix:{sep:"/"}},qs=Ae==="win32"?xe.win32.sep:xe.posix.sep;O.sep=qs;var A=Symbol("globstar **");O.GLOBSTAR=A;var Ks="[^/]",Vs=Ks+"*?",Ys="(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?",Xs="(?:(?!(?:\\/|^)\\.).)*?",Js=(n,t={})=>e=>O(e,n,t);O.filter=Js;var N=(n,t={})=>Object.assign({},n,t),Zs=n=>{if(!n||typeof n!="object"||!Object.keys(n).length)return O;let t=O;return Object.assign((s,i,r={})=>t(s,i,N(n,r)),{Minimatch:class extends t.Minimatch{constructor(i,r={}){super(i,N(n,r))}static defaults(i){return t.defaults(N(n,i)).Minimatch}},AST:class extends t.AST{constructor(i,r,o={}){super(i,r,N(n,o))}static fromGlob(i,r={}){return t.AST.fromGlob(i,N(n,r))}},unescape:(s,i={})=>t.unescape(s,N(n,i)),escape:(s,i={})=>t.escape(s,N(n,i)),filter:(s,i={})=>t.filter(s,N(n,i)),defaults:s=>t.defaults(N(n,s)),makeRe:(s,i={})=>t.makeRe(s,N(n,i)),braceExpand:(s,i={})=>t.braceExpand(s,N(n,i)),match:(s,i,r={})=>t.match(s,i,N(n,r)),sep:t.sep,GLOBSTAR:A})};O.defaults=Zs;var ke=(n,t={})=>(at(n),t.nobrace||!/\{(?:(?!\{).)*\}/.test(n)?[n]:ge(n,{max:t.braceExpandMax}));O.braceExpand=ke;var Qs=(n,t={})=>new D(n,t).makeRe();O.makeRe=Qs;var ti=(n,t,e={})=>{let s=new D(t,e);return n=n.filter(i=>s.match(i)),s.options.nonull&&!n.length&&n.push(t),n};O.match=ti;var ve=/[?*]|[+@!]\(.*?\)|\[|\]/,ei=n=>n.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),D=class{options;set;pattern;windowsPathsNoEscape;nonegate;negate;comment;empty;preserveMultipleSlashes;partial;globSet;globParts;nocase;isWindows;platform;windowsNoMagicRoot;regexp;constructor(t,e={}){at(t),e=e||{},this.options=e,this.pattern=t,this.platform=e.platform||Ae,this.isWindows=this.platform==="win32";let s="allowWindowsEscape";this.windowsPathsNoEscape=!!e.windowsPathsNoEscape||e[s]===!1,this.windowsPathsNoEscape&&(this.pattern=this.pattern.replace(/\\/g,"/")),this.preserveMultipleSlashes=!!e.preserveMultipleSlashes,this.regexp=null,this.negate=!1,this.nonegate=!!e.nonegate,this.comment=!1,this.empty=!1,this.partial=!!e.partial,this.nocase=!!this.options.nocase,this.windowsNoMagicRoot=e.windowsNoMagicRoot!==void 0?e.windowsNoMagicRoot:!!(this.isWindows&&this.nocase),this.globSet=[],this.globParts=[],this.set=[],this.make()}hasMagic(){if(this.options.magicalBraces&&this.set.length>1)return!0;for(let t of this.set)for(let e of t)if(typeof e!="string")return!0;return!1}debug(...t){}make(){let t=this.pattern,e=this.options;if(!e.nocomment&&t.charAt(0)==="#"){this.comment=!0;return}if(!t){this.empty=!0;return}this.parseNegate(),this.globSet=[...new Set(this.braceExpand())],e.debug&&(this.debug=(...r)=>console.error(...r)),this.debug(this.pattern,this.globSet);let s=this.globSet.map(r=>this.slashSplit(r));this.globParts=this.preprocess(s),this.debug(this.pattern,this.globParts);let i=this.globParts.map((r,o,h)=>{if(this.isWindows&&this.windowsNoMagicRoot){let a=r[0]===""&&r[1]===""&&(r[2]==="?"||!ve.test(r[2]))&&!ve.test(r[3]),l=/^[a-z]:/i.test(r[0]);if(a)return[...r.slice(0,4),...r.slice(4).map(u=>this.parse(u))];if(l)return[r[0],...r.slice(1).map(u=>this.parse(u))]}return r.map(a=>this.parse(a))});if(this.debug(this.pattern,i),this.set=i.filter(r=>r.indexOf(!1)===-1),this.isWindows)for(let r=0;r<this.set.length;r++){let o=this.set[r];o[0]===""&&o[1]===""&&this.globParts[r][2]==="?"&&typeof o[3]=="string"&&/^[a-z]:$/i.test(o[3])&&(o[2]="?")}this.debug(this.pattern,this.set)}preprocess(t){if(this.options.noglobstar)for(let s=0;s<t.length;s++)for(let i=0;i<t[s].length;i++)t[s][i]==="**"&&(t[s][i]="*");let{optimizationLevel:e=1}=this.options;return e>=2?(t=this.firstPhasePreProcess(t),t=this.secondPhasePreProcess(t)):e>=1?t=this.levelOneOptimize(t):t=this.adjascentGlobstarOptimize(t),t}adjascentGlobstarOptimize(t){return t.map(e=>{let s=-1;for(;(s=e.indexOf("**",s+1))!==-1;){let i=s;for(;e[i+1]==="**";)i++;i!==s&&e.splice(s,i-s)}return e})}levelOneOptimize(t){return t.map(e=>(e=e.reduce((s,i)=>{let r=s[s.length-1];return i==="**"&&r==="**"?s:i===".."&&r&&r!==".."&&r!=="."&&r!=="**"?(s.pop(),s):(s.push(i),s)},[]),e.length===0?[""]:e))}levelTwoFileOptimize(t){Array.isArray(t)||(t=this.slashSplit(t));let e=!1;do{if(e=!1,!this.preserveMultipleSlashes){for(let i=1;i<t.length-1;i++){let r=t[i];i===1&&r===""&&t[0]===""||(r==="."||r==="")&&(e=!0,t.splice(i,1),i--)}t[0]==="."&&t.length===2&&(t[1]==="."||t[1]==="")&&(e=!0,t.pop())}let s=0;for(;(s=t.indexOf("..",s+1))!==-1;){let i=t[s-1];i&&i!=="."&&i!==".."&&i!=="**"&&(e=!0,t.splice(s-1,2),s-=2)}}while(e);return t.length===0?[""]:t}firstPhasePreProcess(t){let e=!1;do{e=!1;for(let s of t){let i=-1;for(;(i=s.indexOf("**",i+1))!==-1;){let o=i;for(;s[o+1]==="**";)o++;o>i&&s.splice(i+1,o-i);let h=s[i+1],a=s[i+2],l=s[i+3];if(h!==".."||!a||a==="."||a===".."||!l||l==="."||l==="..")continue;e=!0,s.splice(i,1);let u=s.slice(0);u[i]="**",t.push(u),i--}if(!this.preserveMultipleSlashes){for(let o=1;o<s.length-1;o++){let h=s[o];o===1&&h===""&&s[0]===""||(h==="."||h==="")&&(e=!0,s.splice(o,1),o--)}s[0]==="."&&s.length===2&&(s[1]==="."||s[1]==="")&&(e=!0,s.pop())}let r=0;for(;(r=s.indexOf("..",r+1))!==-1;){let o=s[r-1];if(o&&o!=="."&&o!==".."&&o!=="**"){e=!0;let a=r===1&&s[r+1]==="**"?["."]:[];s.splice(r-1,2,...a),s.length===0&&s.push(""),r-=2}}}}while(e);return t}secondPhasePreProcess(t){for(let e=0;e<t.length-1;e++)for(let s=e+1;s<t.length;s++){let i=this.partsMatch(t[e],t[s],!this.preserveMultipleSlashes);if(i){t[e]=[],t[s]=i;break}}return t.filter(e=>e.length)}partsMatch(t,e,s=!1){let i=0,r=0,o=[],h="";for(;i<t.length&&r<e.length;)if(t[i]===e[r])o.push(h==="b"?e[r]:t[i]),i++,r++;else if(s&&t[i]==="**"&&e[r]===t[i+1])o.push(t[i]),i++;else if(s&&e[r]==="**"&&t[i]===e[r+1])o.push(e[r]),r++;else if(t[i]==="*"&&e[r]&&(this.options.dot||!e[r].startsWith("."))&&e[r]!=="**"){if(h==="b")return!1;h="a",o.push(t[i]),i++,r++}else if(e[r]==="*"&&t[i]&&(this.options.dot||!t[i].startsWith("."))&&t[i]!=="**"){if(h==="a")return!1;h="b",o.push(e[r]),i++,r++}else return!1;return t.length===e.length&&o}parseNegate(){if(this.nonegate)return;let t=this.pattern,e=!1,s=0;for(let i=0;i<t.length&&t.charAt(i)==="!";i++)e=!e,s++;s&&(this.pattern=t.slice(s)),this.negate=e}matchOne(t,e,s=!1){let i=this.options;if(this.isWindows){let p=typeof t[0]=="string"&&/^[a-z]:$/i.test(t[0]),w=!p&&t[0]===""&&t[1]===""&&t[2]==="?"&&/^[a-z]:$/i.test(t[3]),g=typeof e[0]=="string"&&/^[a-z]:$/i.test(e[0]),S=!g&&e[0]===""&&e[1]===""&&e[2]==="?"&&typeof e[3]=="string"&&/^[a-z]:$/i.test(e[3]),E=w?3:p?0:void 0,y=S?3:g?0:void 0;if(typeof E=="number"&&typeof y=="number"){let[b,z]=[t[E],e[y]];b.toLowerCase()===z.toLowerCase()&&(e[y]=b,y>E?e=e.slice(y):E>y&&(t=t.slice(E)))}}let{optimizationLevel:r=1}=this.options;r>=2&&(t=this.levelTwoFileOptimize(t)),this.debug("matchOne",this,{file:t,pattern:e}),this.debug("matchOne",t.length,e.length);for(var o=0,h=0,a=t.length,l=e.length;o<a&&h<l;o++,h++){this.debug("matchOne loop");var u=e[h],c=t[o];if(this.debug(e,u,c),u===!1)return!1;if(u===A){this.debug("GLOBSTAR",[e,u,c]);var d=o,f=h+1;if(f===l){for(this.debug("** at the end");o<a;o++)if(t[o]==="."||t[o]===".."||!i.dot&&t[o].charAt(0)===".")return!1;return!0}for(;d<a;){var m=t[d];if(this.debug(`
globstar while`,t,d,e,f,m),this.matchOne(t.slice(d),e.slice(f),s))return this.debug("globstar found match!",d,a,m),!0;if(m==="."||m===".."||!i.dot&&m.charAt(0)==="."){this.debug("dot detected!",t,d,e,f);break}this.debug("globstar swallow a segment, and continue"),d++}return!!(s&&(this.debug(`
>>> no match, partial?`,t,d,e,f),d===a))}let p;if(typeof u=="string"?(p=c===u,this.debug("string match",u,c,p)):(p=u.test(c),this.debug("pattern match",u,c,p)),!p)return!1}if(o===a&&h===l)return!0;if(o===a)return s;if(h===l)return o===a-1&&t[o]==="";throw new Error("wtf?")}braceExpand(){return ke(this.pattern,this.options)}parse(t){at(t);let e=this.options;if(t==="**")return A;if(t==="")return"";let s,i=null;(s=t.match(js))?i=e.dot?zs:Is:(s=t.match(Rs))?i=(e.nocase?e.dot?Ms:Ds:e.dot?Fs:Os)(s[1]):(s=t.match(Bs))?i=(e.nocase?e.dot?$s:Us:e.dot?Gs:Hs)(s):(s=t.match(Ns))?i=e.dot?Ls:_s:(s=t.match(Ws))&&(i=Ps);let r=Q.fromGlob(t,this.options).toMMPattern();return i&&typeof r=="object"&&Reflect.defineProperty(r,"test",{value:i}),r}makeRe(){if(this.regexp||this.regexp===!1)return this.regexp;let t=this.set;if(!t.length)return this.regexp=!1,this.regexp;let e=this.options,s=e.noglobstar?Vs:e.dot?Ys:Xs,i=new Set(e.nocase?["i"]:[]),r=t.map(a=>{let l=a.map(c=>{if(c instanceof RegExp)for(let d of c.flags.split(""))i.add(d);return typeof c=="string"?ei(c):c===A?A:c._src});l.forEach((c,d)=>{let f=l[d+1],m=l[d-1];c!==A||m===A||(m===void 0?f!==void 0&&f!==A?l[d+1]="(?:\\/|"+s+"\\/)?"+f:l[d]=s:f===void 0?l[d-1]=m+"(?:\\/|\\/"+s+")?":f!==A&&(l[d-1]=m+"(?:\\/|\\/"+s+"\\/)"+f,l[d+1]=A))});let u=l.filter(c=>c!==A);if(this.partial&&u.length>=1){let c=[];for(let d=1;d<=u.length;d++)c.push(u.slice(0,d).join("/"));return"(?:"+c.join("|")+")"}return u.join("/")}).join("|"),[o,h]=t.length>1?["(?:",")"]:["",""];r="^"+o+r+h+"$",this.partial&&(r="^(?:\\/|"+o+r.slice(1,-1)+h+")$"),this.negate&&(r="^(?!"+r+").+$");try{this.regexp=new RegExp(r,[...i].join(""))}catch{this.regexp=!1}return this.regexp}slashSplit(t){return this.preserveMultipleSlashes?t.split("/"):this.isWindows&&/^\/\/[^\/]+/.test(t)?["",...t.split(/\/+/)]:t.split(/\/+/)}match(t,e=this.partial){if(this.debug("match",t,this.pattern),this.comment)return!1;if(this.empty)return t==="";if(t==="/"&&e)return!0;let s=this.options;this.isWindows&&(t=t.split("\\").join("/"));let i=this.slashSplit(t);this.debug(this.pattern,"split",i);let r=this.set;this.debug(this.pattern,"set",r);let o=i[i.length-1];if(!o)for(let h=i.length-2;!o&&h>=0;h--)o=i[h];for(let h=0;h<r.length;h++){let a=r[h],l=i;if(s.matchBase&&a.length===1&&(l=[o]),this.matchOne(l,a,e))return s.flipNegate?!0:!this.negate}return s.flipNegate?!1:this.negate}static defaults(t){return O.defaults(t).Minimatch}};O.AST=Q;O.Minimatch=D;O.escape=tt;O.unescape=W;var si=typeof performance=="object"&&performance&&typeof performance.now=="function"?performance:Date,Oe=new Set,Vt=typeof process=="object"&&process?process:{},Fe=(n,t,e,s)=>{typeof Vt.emitWarning=="function"?Vt.emitWarning(n,t,e,s):console.error(`[${e}] ${t}: ${n}`)},At=globalThis.AbortController,Re=globalThis.AbortSignal;if(typeof At>"u"){Re=class{onabort;_onabort=[];reason;aborted=!1;addEventListener(e,s){this._onabort.push(s)}},At=class{constructor(){t()}signal=new Re;abort(e){if(!this.signal.aborted){this.signal.reason=e,this.signal.aborted=!0;for(let s of this.signal._onabort)s(e);this.signal.onabort?.(e)}}};let n=Vt.env?.LRU_CACHE_IGNORE_AC_WARNING!=="1",t=()=>{n&&(n=!1,Fe("AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.","NO_ABORT_CONTROLLER","ENOTSUP",t))}}var ii=n=>!Oe.has(n);var q=n=>n&&n===Math.floor(n)&&n>0&&isFinite(n),De=n=>q(n)?n<=Math.pow(2,8)?Uint8Array:n<=Math.pow(2,16)?Uint16Array:n<=Math.pow(2,32)?Uint32Array:n<=Number.MAX_SAFE_INTEGER?Tt:null:null,Tt=class extends Array{constructor(n){super(n),this.fill(0)}},ri=class ct{heap;length;static#t=!1;static create(t){let e=De(t);if(!e)return[];ct.#t=!0;let s=new ct(t,e);return ct.#t=!1,s}constructor(t,e){if(!ct.#t)throw new TypeError("instantiate Stack using Stack.create(n)");this.heap=new e(t),this.length=0}push(t){this.heap[this.length++]=t}pop(){return this.heap[--this.length]}},ft=class Me{#t;#s;#n;#r;#o;#S;#w;#c;get perf(){return this.#c}ttl;ttlResolution;ttlAutopurge;updateAgeOnGet;updateAgeOnHas;allowStale;noDisposeOnSet;noUpdateTTL;maxEntrySize;sizeCalculation;noDeleteOnFetchRejection;noDeleteOnStaleGet;allowStaleOnFetchAbort;allowStaleOnFetchRejection;ignoreFetchAbort;#h;#u;#f;#a;#i;#d;#E;#b;#p;#R;#m;#C;#T;#g;#y;#x;#A;#e;#_;static unsafeExposeInternals(t){return{starts:t.#T,ttls:t.#g,autopurgeTimers:t.#y,sizes:t.#C,keyMap:t.#f,keyList:t.#a,valList:t.#i,next:t.#d,prev:t.#E,get head(){return t.#b},get tail(){return t.#p},free:t.#R,isBackgroundFetch:e=>t.#l(e),backgroundFetch:(e,s,i,r)=>t.#U(e,s,i,r),moveToTail:e=>t.#W(e),indexes:e=>t.#F(e),rindexes:e=>t.#D(e),isStale:e=>t.#v(e)}}get max(){return this.#t}get maxSize(){return this.#s}get calculatedSize(){return this.#u}get size(){return this.#h}get fetchMethod(){return this.#S}get memoMethod(){return this.#w}get dispose(){return this.#n}get onInsert(){return this.#r}get disposeAfter(){return this.#o}constructor(t){let{max:e=0,ttl:s,ttlResolution:i=1,ttlAutopurge:r,updateAgeOnGet:o,updateAgeOnHas:h,allowStale:a,dispose:l,onInsert:u,disposeAfter:c,noDisposeOnSet:d,noUpdateTTL:f,maxSize:m=0,maxEntrySize:p=0,sizeCalculation:w,fetchMethod:g,memoMethod:S,noDeleteOnFetchRejection:E,noDeleteOnStaleGet:y,allowStaleOnFetchRejection:b,allowStaleOnFetchAbort:z,ignoreFetchAbort:$,perf:J}=t;if(J!==void 0&&typeof J?.now!="function")throw new TypeError("perf option must have a now() method if specified");if(this.#c=J??si,e!==0&&!q(e))throw new TypeError("max option must be a nonnegative integer");let Z=e?De(e):Array;if(!Z)throw new Error("invalid max value: "+e);if(this.#t=e,this.#s=m,this.maxEntrySize=p||this.#s,this.sizeCalculation=w,this.sizeCalculation){if(!this.#s&&!this.maxEntrySize)throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");if(typeof this.sizeCalculation!="function")throw new TypeError("sizeCalculation set to non-function")}if(S!==void 0&&typeof S!="function")throw new TypeError("memoMethod must be a function if defined");if(this.#w=S,g!==void 0&&typeof g!="function")throw new TypeError("fetchMethod must be a function if specified");if(this.#S=g,this.#A=!!g,this.#f=new Map,this.#a=new Array(e).fill(void 0),this.#i=new Array(e).fill(void 0),this.#d=new Z(e),this.#E=new Z(e),this.#b=0,this.#p=0,this.#R=ri.create(e),this.#h=0,this.#u=0,typeof l=="function"&&(this.#n=l),typeof u=="function"&&(this.#r=u),typeof c=="function"?(this.#o=c,this.#m=[]):(this.#o=void 0,this.#m=void 0),this.#x=!!this.#n,this.#_=!!this.#r,this.#e=!!this.#o,this.noDisposeOnSet=!!d,this.noUpdateTTL=!!f,this.noDeleteOnFetchRejection=!!E,this.allowStaleOnFetchRejection=!!b,this.allowStaleOnFetchAbort=!!z,this.ignoreFetchAbort=!!$,this.maxEntrySize!==0){if(this.#s!==0&&!q(this.#s))throw new TypeError("maxSize must be a positive integer if specified");if(!q(this.maxEntrySize))throw new TypeError("maxEntrySize must be a positive integer if specified");this.#G()}if(this.allowStale=!!a,this.noDeleteOnStaleGet=!!y,this.updateAgeOnGet=!!o,this.updateAgeOnHas=!!h,this.ttlResolution=q(i)||i===0?i:1,this.ttlAutopurge=!!r,this.ttl=s||0,this.ttl){if(!q(this.ttl))throw new TypeError("ttl must be a positive integer if specified");this.#M()}if(this.#t===0&&this.ttl===0&&this.#s===0)throw new TypeError("At least one of max, maxSize, or ttl is required");if(!this.ttlAutopurge&&!this.#t&&!this.#s){let $t="LRU_CACHE_UNBOUNDED";ii($t)&&(Oe.add($t),Fe("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.","UnboundedCacheWarning",$t,Me))}}getRemainingTTL(t){return this.#f.has(t)?1/0:0}#M(){let t=new Tt(this.#t),e=new Tt(this.#t);this.#g=t,this.#T=e;let s=this.ttlAutopurge?new Array(this.#t):void 0;this.#y=s,this.#j=(o,h,a=this.#c.now())=>{if(e[o]=h!==0?a:0,t[o]=h,s?.[o]&&(clearTimeout(s[o]),s[o]=void 0),h!==0&&s){let l=setTimeout(()=>{this.#v(o)&&this.#O(this.#a[o],"expire")},h+1);l.unref&&l.unref(),s[o]=l}},this.#k=o=>{e[o]=t[o]!==0?this.#c.now():0},this.#N=(o,h)=>{if(t[h]){let a=t[h],l=e[h];if(!a||!l)return;o.ttl=a,o.start=l,o.now=i||r();let u=o.now-l;o.remainingTTL=a-u}};let i=0,r=()=>{let o=this.#c.now();if(this.ttlResolution>0){i=o;let h=setTimeout(()=>i=0,this.ttlResolution);h.unref&&h.unref()}return o};this.getRemainingTTL=o=>{let h=this.#f.get(o);if(h===void 0)return 0;let a=t[h],l=e[h];if(!a||!l)return 1/0;let u=(i||r())-l;return a-u},this.#v=o=>{let h=e[o],a=t[o];return!!a&&!!h&&(i||r())-h>a}}#k=()=>{};#N=()=>{};#j=()=>{};#v=()=>!1;#G(){let t=new Tt(this.#t);this.#u=0,this.#C=t,this.#P=e=>{this.#u-=t[e],t[e]=0},this.#I=(e,s,i,r)=>{if(this.#l(s))return 0;if(!q(i))if(r){if(typeof r!="function")throw new TypeError("sizeCalculation must be a function");if(i=r(s,e),!q(i))throw new TypeError("sizeCalculation return invalid (expect positive integer)")}else throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");return i},this.#L=(e,s,i)=>{if(t[e]=s,this.#s){let r=this.#s-t[e];for(;this.#u>r;)this.#B(!0)}this.#u+=t[e],i&&(i.entrySize=s,i.totalCalculatedSize=this.#u)}}#P=t=>{};#L=(t,e,s)=>{};#I=(t,e,s,i)=>{if(s||i)throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");return 0};*#F({allowStale:t=this.allowStale}={}){if(this.#h)for(let e=this.#p;!(!this.#z(e)||((t||!this.#v(e))&&(yield e),e===this.#b));)e=this.#E[e]}*#D({allowStale:t=this.allowStale}={}){if(this.#h)for(let e=this.#b;!(!this.#z(e)||((t||!this.#v(e))&&(yield e),e===this.#p));)e=this.#d[e]}#z(t){return t!==void 0&&this.#f.get(this.#a[t])===t}*entries(){for(let t of this.#F())this.#i[t]!==void 0&&this.#a[t]!==void 0&&!this.#l(this.#i[t])&&(yield[this.#a[t],this.#i[t]])}*rentries(){for(let t of this.#D())this.#i[t]!==void 0&&this.#a[t]!==void 0&&!this.#l(this.#i[t])&&(yield[this.#a[t],this.#i[t]])}*keys(){for(let t of this.#F()){let e=this.#a[t];e!==void 0&&!this.#l(this.#i[t])&&(yield e)}}*rkeys(){for(let t of this.#D()){let e=this.#a[t];e!==void 0&&!this.#l(this.#i[t])&&(yield e)}}*values(){for(let t of this.#F())this.#i[t]!==void 0&&!this.#l(this.#i[t])&&(yield this.#i[t])}*rvalues(){for(let t of this.#D())this.#i[t]!==void 0&&!this.#l(this.#i[t])&&(yield this.#i[t])}[Symbol.iterator](){return this.entries()}[Symbol.toStringTag]="LRUCache";find(t,e={}){for(let s of this.#F()){let i=this.#i[s],r=this.#l(i)?i.__staleWhileFetching:i;if(r!==void 0&&t(r,this.#a[s],this))return this.get(this.#a[s],e)}}forEach(t,e=this){for(let s of this.#F()){let i=this.#i[s],r=this.#l(i)?i.__staleWhileFetching:i;r!==void 0&&t.call(e,r,this.#a[s],this)}}rforEach(t,e=this){for(let s of this.#D()){let i=this.#i[s],r=this.#l(i)?i.__staleWhileFetching:i;r!==void 0&&t.call(e,r,this.#a[s],this)}}purgeStale(){let t=!1;for(let e of this.#D({allowStale:!0}))this.#v(e)&&(this.#O(this.#a[e],"expire"),t=!0);return t}info(t){let e=this.#f.get(t);if(e===void 0)return;let s=this.#i[e],i=this.#l(s)?s.__staleWhileFetching:s;if(i===void 0)return;let r={value:i};if(this.#g&&this.#T){let o=this.#g[e],h=this.#T[e];if(o&&h){let a=o-(this.#c.now()-h);r.ttl=a,r.start=Date.now()}}return this.#C&&(r.size=this.#C[e]),r}dump(){let t=[];for(let e of this.#F({allowStale:!0})){let s=this.#a[e],i=this.#i[e],r=this.#l(i)?i.__staleWhileFetching:i;if(r===void 0||s===void 0)continue;let o={value:r};if(this.#g&&this.#T){o.ttl=this.#g[e];let h=this.#c.now()-this.#T[e];o.start=Math.floor(Date.now()-h)}this.#C&&(o.size=this.#C[e]),t.unshift([s,o])}return t}load(t){this.clear();for(let[e,s]of t){if(s.start){let i=Date.now()-s.start;s.start=this.#c.now()-i}this.set(e,s.value,s)}}set(t,e,s={}){if(e===void 0)return this.delete(t),this;let{ttl:i=this.ttl,start:r,noDisposeOnSet:o=this.noDisposeOnSet,sizeCalculation:h=this.sizeCalculation,status:a}=s,{noUpdateTTL:l=this.noUpdateTTL}=s,u=this.#I(t,e,s.size||0,h);if(this.maxEntrySize&&u>this.maxEntrySize)return a&&(a.set="miss",a.maxEntrySizeExceeded=!0),this.#O(t,"set"),this;let c=this.#h===0?void 0:this.#f.get(t);if(c===void 0)c=this.#h===0?this.#p:this.#R.length!==0?this.#R.pop():this.#h===this.#t?this.#B(!1):this.#h,this.#a[c]=t,this.#i[c]=e,this.#f.set(t,c),this.#d[this.#p]=c,this.#E[c]=this.#p,this.#p=c,this.#h++,this.#L(c,u,a),a&&(a.set="add"),l=!1,this.#_&&this.#r?.(e,t,"add");else{this.#W(c);let d=this.#i[c];if(e!==d){if(this.#A&&this.#l(d)){d.__abortController.abort(new Error("replaced"));let{__staleWhileFetching:f}=d;f!==void 0&&!o&&(this.#x&&this.#n?.(f,t,"set"),this.#e&&this.#m?.push([f,t,"set"]))}else o||(this.#x&&this.#n?.(d,t,"set"),this.#e&&this.#m?.push([d,t,"set"]));if(this.#P(c),this.#L(c,u,a),this.#i[c]=e,a){a.set="replace";let f=d&&this.#l(d)?d.__staleWhileFetching:d;f!==void 0&&(a.oldValue=f)}}else a&&(a.set="update");this.#_&&this.onInsert?.(e,t,e===d?"update":"replace")}if(i!==0&&!this.#g&&this.#M(),this.#g&&(l||this.#j(c,i,r),a&&this.#N(a,c)),!o&&this.#e&&this.#m){let d=this.#m,f;for(;f=d?.shift();)this.#o?.(...f)}return this}pop(){try{for(;this.#h;){let t=this.#i[this.#b];if(this.#B(!0),this.#l(t)){if(t.__staleWhileFetching)return t.__staleWhileFetching}else if(t!==void 0)return t}}finally{if(this.#e&&this.#m){let t=this.#m,e;for(;e=t?.shift();)this.#o?.(...e)}}}#B(t){let e=this.#b,s=this.#a[e],i=this.#i[e];return this.#A&&this.#l(i)?i.__abortController.abort(new Error("evicted")):(this.#x||this.#e)&&(this.#x&&this.#n?.(i,s,"evict"),this.#e&&this.#m?.push([i,s,"evict"])),this.#P(e),this.#y?.[e]&&(clearTimeout(this.#y[e]),this.#y[e]=void 0),t&&(this.#a[e]=void 0,this.#i[e]=void 0,this.#R.push(e)),this.#h===1?(this.#b=this.#p=0,this.#R.length=0):this.#b=this.#d[e],this.#f.delete(s),this.#h--,e}has(t,e={}){let{updateAgeOnHas:s=this.updateAgeOnHas,status:i}=e,r=this.#f.get(t);if(r!==void 0){let o=this.#i[r];if(this.#l(o)&&o.__staleWhileFetching===void 0)return!1;if(this.#v(r))i&&(i.has="stale",this.#N(i,r));else return s&&this.#k(r),i&&(i.has="hit",this.#N(i,r)),!0}else i&&(i.has="miss");return!1}peek(t,e={}){let{allowStale:s=this.allowStale}=e,i=this.#f.get(t);if(i===void 0||!s&&this.#v(i))return;let r=this.#i[i];return this.#l(r)?r.__staleWhileFetching:r}#U(t,e,s,i){let r=e===void 0?void 0:this.#i[e];if(this.#l(r))return r;let o=new At,{signal:h}=s;h?.addEventListener("abort",()=>o.abort(h.reason),{signal:o.signal});let a={signal:o.signal,options:s,context:i},l=(p,w=!1)=>{let{aborted:g}=o.signal,S=s.ignoreFetchAbort&&p!==void 0,E=s.ignoreFetchAbort||!!(s.allowStaleOnFetchAbort&&p!==void 0);if(s.status&&(g&&!w?(s.status.fetchAborted=!0,s.status.fetchError=o.signal.reason,S&&(s.status.fetchAbortIgnored=!0)):s.status.fetchResolved=!0),g&&!S&&!w)return c(o.signal.reason,E);let y=f,b=this.#i[e];return(b===f||S&&w&&b===void 0)&&(p===void 0?y.__staleWhileFetching!==void 0?this.#i[e]=y.__staleWhileFetching:this.#O(t,"fetch"):(s.status&&(s.status.fetchUpdated=!0),this.set(t,p,a.options))),p},u=p=>(s.status&&(s.status.fetchRejected=!0,s.status.fetchError=p),c(p,!1)),c=(p,w)=>{let{aborted:g}=o.signal,S=g&&s.allowStaleOnFetchAbort,E=S||s.allowStaleOnFetchRejection,y=E||s.noDeleteOnFetchRejection,b=f;if(this.#i[e]===f&&(!y||!w&&b.__staleWhileFetching===void 0?this.#O(t,"fetch"):S||(this.#i[e]=b.__staleWhileFetching)),E)return s.status&&b.__staleWhileFetching!==void 0&&(s.status.returnedStale=!0),b.__staleWhileFetching;if(b.__returned===b)throw p},d=(p,w)=>{let g=this.#S?.(t,r,a);g&&g instanceof Promise&&g.then(S=>p(S===void 0?void 0:S),w),o.signal.addEventListener("abort",()=>{(!s.ignoreFetchAbort||s.allowStaleOnFetchAbort)&&(p(void 0),s.allowStaleOnFetchAbort&&(p=S=>l(S,!0)))})};s.status&&(s.status.fetchDispatched=!0);let f=new Promise(d).then(l,u),m=Object.assign(f,{__abortController:o,__staleWhileFetching:r,__returned:void 0});return e===void 0?(this.set(t,m,{...a.options,status:void 0}),e=this.#f.get(t)):this.#i[e]=m,m}#l(t){if(!this.#A)return!1;let e=t;return!!e&&e instanceof Promise&&e.hasOwnProperty("__staleWhileFetching")&&e.__abortController instanceof At}async fetch(t,e={}){let{allowStale:s=this.allowStale,updateAgeOnGet:i=this.updateAgeOnGet,noDeleteOnStaleGet:r=this.noDeleteOnStaleGet,ttl:o=this.ttl,noDisposeOnSet:h=this.noDisposeOnSet,size:a=0,sizeCalculation:l=this.sizeCalculation,noUpdateTTL:u=this.noUpdateTTL,noDeleteOnFetchRejection:c=this.noDeleteOnFetchRejection,allowStaleOnFetchRejection:d=this.allowStaleOnFetchRejection,ignoreFetchAbort:f=this.ignoreFetchAbort,allowStaleOnFetchAbort:m=this.allowStaleOnFetchAbort,context:p,forceRefresh:w=!1,status:g,signal:S}=e;if(!this.#A)return g&&(g.fetch="get"),this.get(t,{allowStale:s,updateAgeOnGet:i,noDeleteOnStaleGet:r,status:g});let E={allowStale:s,updateAgeOnGet:i,noDeleteOnStaleGet:r,ttl:o,noDisposeOnSet:h,size:a,sizeCalculation:l,noUpdateTTL:u,noDeleteOnFetchRejection:c,allowStaleOnFetchRejection:d,allowStaleOnFetchAbort:m,ignoreFetchAbort:f,status:g,signal:S},y=this.#f.get(t);if(y===void 0){g&&(g.fetch="miss");let b=this.#U(t,y,E,p);return b.__returned=b}else{let b=this.#i[y];if(this.#l(b)){let Z=s&&b.__staleWhileFetching!==void 0;return g&&(g.fetch="inflight",Z&&(g.returnedStale=!0)),Z?b.__staleWhileFetching:b.__returned=b}let z=this.#v(y);if(!w&&!z)return g&&(g.fetch="hit"),this.#W(y),i&&this.#k(y),g&&this.#N(g,y),b;let $=this.#U(t,y,E,p),J=$.__staleWhileFetching!==void 0&&s;return g&&(g.fetch=z?"stale":"refresh",J&&z&&(g.returnedStale=!0)),J?$.__staleWhileFetching:$.__returned=$}}async forceFetch(t,e={}){let s=await this.fetch(t,e);if(s===void 0)throw new Error("fetch() returned undefined");return s}memo(t,e={}){let s=this.#w;if(!s)throw new Error("no memoMethod provided to constructor");let{context:i,forceRefresh:r,...o}=e,h=this.get(t,o);if(!r&&h!==void 0)return h;let a=s(t,h,{options:o,context:i});return this.set(t,a,o),a}get(t,e={}){let{allowStale:s=this.allowStale,updateAgeOnGet:i=this.updateAgeOnGet,noDeleteOnStaleGet:r=this.noDeleteOnStaleGet,status:o}=e,h=this.#f.get(t);if(h!==void 0){let a=this.#i[h],l=this.#l(a);return o&&this.#N(o,h),this.#v(h)?(o&&(o.get="stale"),l?(o&&s&&a.__staleWhileFetching!==void 0&&(o.returnedStale=!0),s?a.__staleWhileFetching:void 0):(r||this.#O(t,"expire"),o&&s&&(o.returnedStale=!0),s?a:void 0)):(o&&(o.get="hit"),l?a.__staleWhileFetching:(this.#W(h),i&&this.#k(h),a))}else o&&(o.get="miss")}#$(t,e){this.#E[e]=t,this.#d[t]=e}#W(t){t!==this.#p&&(t===this.#b?this.#b=this.#d[t]:this.#$(this.#E[t],this.#d[t]),this.#$(this.#p,t),this.#p=t)}delete(t){return this.#O(t,"delete")}#O(t,e){let s=!1;if(this.#h!==0){let i=this.#f.get(t);if(i!==void 0)if(this.#y?.[i]&&(clearTimeout(this.#y?.[i]),this.#y[i]=void 0),s=!0,this.#h===1)this.#H(e);else{this.#P(i);let r=this.#i[i];if(this.#l(r)?r.__abortController.abort(new Error("deleted")):(this.#x||this.#e)&&(this.#x&&this.#n?.(r,t,e),this.#e&&this.#m?.push([r,t,e])),this.#f.delete(t),this.#a[i]=void 0,this.#i[i]=void 0,i===this.#p)this.#p=this.#E[i];else if(i===this.#b)this.#b=this.#d[i];else{let o=this.#E[i];this.#d[o]=this.#d[i];let h=this.#d[i];this.#E[h]=this.#E[i]}this.#h--,this.#R.push(i)}}if(this.#e&&this.#m?.length){let i=this.#m,r;for(;r=i?.shift();)this.#o?.(...r)}return s}clear(){return this.#H("delete")}#H(t){for(let e of this.#D({allowStale:!0})){let s=this.#i[e];if(this.#l(s))s.__abortController.abort(new Error("deleted"));else{let i=this.#a[e];this.#x&&this.#n?.(s,i,t),this.#e&&this.#m?.push([s,i,t])}}if(this.#f.clear(),this.#i.fill(void 0),this.#a.fill(void 0),this.#g&&this.#T){this.#g.fill(0),this.#T.fill(0);for(let e of this.#y??[])e!==void 0&&clearTimeout(e);this.#y?.fill(void 0)}if(this.#C&&this.#C.fill(0),this.#b=0,this.#p=0,this.#R.length=0,this.#u=0,this.#h=0,this.#e&&this.#m){let e=this.#m,s;for(;s=e?.shift();)this.#o?.(...s)}}};var Ne=typeof process=="object"&&process?process:{stdout:null,stderr:null},oi=n=>!!n&&typeof n=="object"&&(n instanceof V||n instanceof external_node_stream_||hi(n)||ai(n)),hi=n=>!!n&&typeof n=="object"&&n instanceof external_node_events_.EventEmitter&&typeof n.pipe=="function"&&n.pipe!==external_node_stream_.Writable.prototype.pipe,ai=n=>!!n&&typeof n=="object"&&n instanceof external_node_events_.EventEmitter&&typeof n.write=="function"&&typeof n.end=="function",G=Symbol("EOF"),H=Symbol("maybeEmitEnd"),K=Symbol("emittedEnd"),kt=Symbol("emittingEnd"),ut=Symbol("emittedError"),Rt=Symbol("closed"),_e=Symbol("read"),Ot=Symbol("flush"),Le=Symbol("flushChunk"),P=Symbol("encoding"),et=Symbol("decoder"),v=Symbol("flowing"),dt=Symbol("paused"),st=Symbol("resume"),C=Symbol("buffer"),F=Symbol("pipes"),T=Symbol("bufferLength"),Yt=Symbol("bufferPush"),Ft=Symbol("bufferShift"),k=Symbol("objectMode"),x=Symbol("destroyed"),Xt=Symbol("error"),Jt=Symbol("emitData"),We=Symbol("emitEnd"),Zt=Symbol("emitEnd2"),B=Symbol("async"),Qt=Symbol("abort"),Dt=Symbol("aborted"),pt=Symbol("signal"),Y=Symbol("dataListeners"),M=Symbol("discarded"),mt=n=>Promise.resolve().then(n),li=n=>n(),ci=n=>n==="end"||n==="finish"||n==="prefinish",fi=n=>n instanceof ArrayBuffer||!!n&&typeof n=="object"&&n.constructor&&n.constructor.name==="ArrayBuffer"&&n.byteLength>=0,ui=n=>!Buffer.isBuffer(n)&&ArrayBuffer.isView(n),Mt=class{src;dest;opts;ondrain;constructor(t,e,s){this.src=t,this.dest=e,this.opts=s,this.ondrain=()=>t[st](),this.dest.on("drain",this.ondrain)}unpipe(){this.dest.removeListener("drain",this.ondrain)}proxyErrors(t){}end(){this.unpipe(),this.opts.end&&this.dest.end()}},te=class extends Mt{unpipe(){this.src.removeListener("error",this.proxyErrors),super.unpipe()}constructor(t,e,s){super(t,e,s),this.proxyErrors=i=>this.dest.emit("error",i),t.on("error",this.proxyErrors)}},di=n=>!!n.objectMode,pi=n=>!n.objectMode&&!!n.encoding&&n.encoding!=="buffer",V=class extends external_node_events_.EventEmitter{[v]=!1;[dt]=!1;[F]=[];[C]=[];[k];[P];[B];[et];[G]=!1;[K]=!1;[kt]=!1;[Rt]=!1;[ut]=null;[T]=0;[x]=!1;[pt];[Dt]=!1;[Y]=0;[M]=!1;writable=!0;readable=!0;constructor(...t){let e=t[0]||{};if(super(),e.objectMode&&typeof e.encoding=="string")throw new TypeError("Encoding and objectMode may not be used together");di(e)?(this[k]=!0,this[P]=null):pi(e)?(this[P]=e.encoding,this[k]=!1):(this[k]=!1,this[P]=null),this[B]=!!e.async,this[et]=this[P]?new external_node_string_decoder_.StringDecoder(this[P]):null,e&&e.debugExposeBuffer===!0&&Object.defineProperty(this,"buffer",{get:()=>this[C]}),e&&e.debugExposePipes===!0&&Object.defineProperty(this,"pipes",{get:()=>this[F]});let{signal:s}=e;s&&(this[pt]=s,s.aborted?this[Qt]():s.addEventListener("abort",()=>this[Qt]()))}get bufferLength(){return this[T]}get encoding(){return this[P]}set encoding(t){throw new Error("Encoding must be set at instantiation time")}setEncoding(t){throw new Error("Encoding must be set at instantiation time")}get objectMode(){return this[k]}set objectMode(t){throw new Error("objectMode must be set at instantiation time")}get async(){return this[B]}set async(t){this[B]=this[B]||!!t}[Qt](){this[Dt]=!0,this.emit("abort",this[pt]?.reason),this.destroy(this[pt]?.reason)}get aborted(){return this[Dt]}set aborted(t){}write(t,e,s){if(this[Dt])return!1;if(this[G])throw new Error("write after end");if(this[x])return this.emit("error",Object.assign(new Error("Cannot call write after a stream was destroyed"),{code:"ERR_STREAM_DESTROYED"})),!0;typeof e=="function"&&(s=e,e="utf8"),e||(e="utf8");let i=this[B]?mt:li;if(!this[k]&&!Buffer.isBuffer(t)){if(ui(t))t=Buffer.from(t.buffer,t.byteOffset,t.byteLength);else if(fi(t))t=Buffer.from(t);else if(typeof t!="string")throw new Error("Non-contiguous data written to non-objectMode stream")}return this[k]?(this[v]&&this[T]!==0&&this[Ot](!0),this[v]?this.emit("data",t):this[Yt](t),this[T]!==0&&this.emit("readable"),s&&i(s),this[v]):t.length?(typeof t=="string"&&!(e===this[P]&&!this[et]?.lastNeed)&&(t=Buffer.from(t,e)),Buffer.isBuffer(t)&&this[P]&&(t=this[et].write(t)),this[v]&&this[T]!==0&&this[Ot](!0),this[v]?this.emit("data",t):this[Yt](t),this[T]!==0&&this.emit("readable"),s&&i(s),this[v]):(this[T]!==0&&this.emit("readable"),s&&i(s),this[v])}read(t){if(this[x])return null;if(this[M]=!1,this[T]===0||t===0||t&&t>this[T])return this[H](),null;this[k]&&(t=null),this[C].length>1&&!this[k]&&(this[C]=[this[P]?this[C].join(""):Buffer.concat(this[C],this[T])]);let e=this[_e](t||null,this[C][0]);return this[H](),e}[_e](t,e){if(this[k])this[Ft]();else{let s=e;t===s.length||t===null?this[Ft]():typeof s=="string"?(this[C][0]=s.slice(t),e=s.slice(0,t),this[T]-=t):(this[C][0]=s.subarray(t),e=s.subarray(0,t),this[T]-=t)}return this.emit("data",e),!this[C].length&&!this[G]&&this.emit("drain"),e}end(t,e,s){return typeof t=="function"&&(s=t,t=void 0),typeof e=="function"&&(s=e,e="utf8"),t!==void 0&&this.write(t,e),s&&this.once("end",s),this[G]=!0,this.writable=!1,(this[v]||!this[dt])&&this[H](),this}[st](){this[x]||(!this[Y]&&!this[F].length&&(this[M]=!0),this[dt]=!1,this[v]=!0,this.emit("resume"),this[C].length?this[Ot]():this[G]?this[H]():this.emit("drain"))}resume(){return this[st]()}pause(){this[v]=!1,this[dt]=!0,this[M]=!1}get destroyed(){return this[x]}get flowing(){return this[v]}get paused(){return this[dt]}[Yt](t){this[k]?this[T]+=1:this[T]+=t.length,this[C].push(t)}[Ft](){return this[k]?this[T]-=1:this[T]-=this[C][0].length,this[C].shift()}[Ot](t=!1){do;while(this[Le](this[Ft]())&&this[C].length);!t&&!this[C].length&&!this[G]&&this.emit("drain")}[Le](t){return this.emit("data",t),this[v]}pipe(t,e){if(this[x])return t;this[M]=!1;let s=this[K];return e=e||{},t===Ne.stdout||t===Ne.stderr?e.end=!1:e.end=e.end!==!1,e.proxyErrors=!!e.proxyErrors,s?e.end&&t.end():(this[F].push(e.proxyErrors?new te(this,t,e):new Mt(this,t,e)),this[B]?mt(()=>this[st]()):this[st]()),t}unpipe(t){let e=this[F].find(s=>s.dest===t);e&&(this[F].length===1?(this[v]&&this[Y]===0&&(this[v]=!1),this[F]=[]):this[F].splice(this[F].indexOf(e),1),e.unpipe())}addListener(t,e){return this.on(t,e)}on(t,e){let s=super.on(t,e);if(t==="data")this[M]=!1,this[Y]++,!this[F].length&&!this[v]&&this[st]();else if(t==="readable"&&this[T]!==0)super.emit("readable");else if(ci(t)&&this[K])super.emit(t),this.removeAllListeners(t);else if(t==="error"&&this[ut]){let i=e;this[B]?mt(()=>i.call(this,this[ut])):i.call(this,this[ut])}return s}removeListener(t,e){return this.off(t,e)}off(t,e){let s=super.off(t,e);return t==="data"&&(this[Y]=this.listeners("data").length,this[Y]===0&&!this[M]&&!this[F].length&&(this[v]=!1)),s}removeAllListeners(t){let e=super.removeAllListeners(t);return(t==="data"||t===void 0)&&(this[Y]=0,!this[M]&&!this[F].length&&(this[v]=!1)),e}get emittedEnd(){return this[K]}[H](){!this[kt]&&!this[K]&&!this[x]&&this[C].length===0&&this[G]&&(this[kt]=!0,this.emit("end"),this.emit("prefinish"),this.emit("finish"),this[Rt]&&this.emit("close"),this[kt]=!1)}emit(t,...e){let s=e[0];if(t!=="error"&&t!=="close"&&t!==x&&this[x])return!1;if(t==="data")return!this[k]&&!s?!1:this[B]?(mt(()=>this[Jt](s)),!0):this[Jt](s);if(t==="end")return this[We]();if(t==="close"){if(this[Rt]=!0,!this[K]&&!this[x])return!1;let r=super.emit("close");return this.removeAllListeners("close"),r}else if(t==="error"){this[ut]=s,super.emit(Xt,s);let r=!this[pt]||this.listeners("error").length?super.emit("error",s):!1;return this[H](),r}else if(t==="resume"){let r=super.emit("resume");return this[H](),r}else if(t==="finish"||t==="prefinish"){let r=super.emit(t);return this.removeAllListeners(t),r}let i=super.emit(t,...e);return this[H](),i}[Jt](t){for(let s of this[F])s.dest.write(t)===!1&&this.pause();let e=this[M]?!1:super.emit("data",t);return this[H](),e}[We](){return this[K]?!1:(this[K]=!0,this.readable=!1,this[B]?(mt(()=>this[Zt]()),!0):this[Zt]())}[Zt](){if(this[et]){let e=this[et].end();if(e){for(let s of this[F])s.dest.write(e);this[M]||super.emit("data",e)}}for(let e of this[F])e.end();let t=super.emit("end");return this.removeAllListeners("end"),t}async collect(){let t=Object.assign([],{dataLength:0});this[k]||(t.dataLength=0);let e=this.promise();return this.on("data",s=>{t.push(s),this[k]||(t.dataLength+=s.length)}),await e,t}async concat(){if(this[k])throw new Error("cannot concat in objectMode");let t=await this.collect();return this[P]?t.join(""):Buffer.concat(t,t.dataLength)}async promise(){return new Promise((t,e)=>{this.on(x,()=>e(new Error("stream destroyed"))),this.on("error",s=>e(s)),this.on("end",()=>t())})}[Symbol.asyncIterator](){this[M]=!1;let t=!1,e=async()=>(this.pause(),t=!0,{value:void 0,done:!0});return{next:()=>{if(t)return e();let i=this.read();if(i!==null)return Promise.resolve({done:!1,value:i});if(this[G])return e();let r,o,h=c=>{this.off("data",a),this.off("end",l),this.off(x,u),e(),o(c)},a=c=>{this.off("error",h),this.off("end",l),this.off(x,u),this.pause(),r({value:c,done:!!this[G]})},l=()=>{this.off("error",h),this.off("data",a),this.off(x,u),e(),r({done:!0,value:void 0})},u=()=>h(new Error("stream destroyed"));return new Promise((c,d)=>{o=d,r=c,this.once(x,u),this.once("error",h),this.once("end",l),this.once("data",a)})},throw:e,return:e,[Symbol.asyncIterator](){return this},[Symbol.asyncDispose]:async()=>{}}}[Symbol.iterator](){this[M]=!1;let t=!1,e=()=>(this.pause(),this.off(Xt,e),this.off(x,e),this.off("end",e),t=!0,{done:!0,value:void 0}),s=()=>{if(t)return e();let i=this.read();return i===null?e():{done:!1,value:i}};return this.once("end",e),this.once(Xt,e),this.once(x,e),{next:s,throw:e,return:e,[Symbol.iterator](){return this},[Symbol.dispose]:()=>{}}}destroy(t){if(this[x])return t?this.emit("error",t):this.emit(x),this;this[x]=!0,this[M]=!0,this[C].length=0,this[T]=0;let e=this;return typeof e.close=="function"&&!this[Rt]&&e.close(),t?this.emit("error",t):this.emit(x),this}static get isStream(){return oi}};var vi=external_fs_.realpathSync.native,wt={lstatSync:external_fs_.lstatSync,readdir:external_fs_.readdir,readdirSync:external_fs_.readdirSync,readlinkSync:external_fs_.readlinkSync,realpathSync:vi,promises:{lstat:promises_.lstat,readdir:promises_.readdir,readlink:promises_.readlink,realpath:promises_.realpath}},Ue=n=>!n||n===wt||n===external_node_fs_namespaceObject?wt:{...wt,...n,promises:{...wt.promises,...n.promises||{}}},$e=/^\\\\\?\\([a-z]:)\\?$/i,Ri=n=>n.replace(/\//g,"\\").replace($e,"$1\\"),Oi=/[\\\/]/,L=0,Ge=1,He=2,U=4,qe=6,Ke=8,X=10,Ve=12,_=15,gt=~_,se=16,je=32,yt=64,j=128,Nt=256,Lt=512,Ie=yt|j|Lt,Fi=1023,ie=n=>n.isFile()?Ke:n.isDirectory()?U:n.isSymbolicLink()?X:n.isCharacterDevice()?He:n.isBlockDevice()?qe:n.isSocket()?Ve:n.isFIFO()?Ge:L,ze=new ft({max:2**12}),bt=n=>{let t=ze.get(n);if(t)return t;let e=n.normalize("NFKD");return ze.set(n,e),e},Be=new ft({max:2**12}),_t=n=>{let t=Be.get(n);if(t)return t;let e=bt(n.toLowerCase());return Be.set(n,e),e},Wt=class extends ft{constructor(){super({max:256})}},ne=class extends ft{constructor(t=16*1024){super({maxSize:t,sizeCalculation:e=>e.length+1})}},Ye=Symbol("PathScurry setAsCwd"),R=class{name;root;roots;parent;nocase;isCWD=!1;#t;#s;get dev(){return this.#s}#n;get mode(){return this.#n}#r;get nlink(){return this.#r}#o;get uid(){return this.#o}#S;get gid(){return this.#S}#w;get rdev(){return this.#w}#c;get blksize(){return this.#c}#h;get ino(){return this.#h}#u;get size(){return this.#u}#f;get blocks(){return this.#f}#a;get atimeMs(){return this.#a}#i;get mtimeMs(){return this.#i}#d;get ctimeMs(){return this.#d}#E;get birthtimeMs(){return this.#E}#b;get atime(){return this.#b}#p;get mtime(){return this.#p}#R;get ctime(){return this.#R}#m;get birthtime(){return this.#m}#C;#T;#g;#y;#x;#A;#e;#_;#M;#k;get parentPath(){return(this.parent||this).fullpath()}get path(){return this.parentPath}constructor(t,e=L,s,i,r,o,h){this.name=t,this.#C=r?_t(t):bt(t),this.#e=e&Fi,this.nocase=r,this.roots=i,this.root=s||this,this.#_=o,this.#g=h.fullpath,this.#x=h.relative,this.#A=h.relativePosix,this.parent=h.parent,this.parent?this.#t=this.parent.#t:this.#t=Ue(h.fs)}depth(){return this.#T!==void 0?this.#T:this.parent?this.#T=this.parent.depth()+1:this.#T=0}childrenCache(){return this.#_}resolve(t){if(!t)return this;let e=this.getRootString(t),i=t.substring(e.length).split(this.splitSep);return e?this.getRoot(e).#N(i):this.#N(i)}#N(t){let e=this;for(let s of t)e=e.child(s);return e}children(){let t=this.#_.get(this);if(t)return t;let e=Object.assign([],{provisional:0});return this.#_.set(this,e),this.#e&=~se,e}child(t,e){if(t===""||t===".")return this;if(t==="..")return this.parent||this;let s=this.children(),i=this.nocase?_t(t):bt(t);for(let a of s)if(a.#C===i)return a;let r=this.parent?this.sep:"",o=this.#g?this.#g+r+t:void 0,h=this.newChild(t,L,{...e,parent:this,fullpath:o});return this.canReaddir()||(h.#e|=j),s.push(h),h}relative(){if(this.isCWD)return"";if(this.#x!==void 0)return this.#x;let t=this.name,e=this.parent;if(!e)return this.#x=this.name;let s=e.relative();return s+(!s||!e.parent?"":this.sep)+t}relativePosix(){if(this.sep==="/")return this.relative();if(this.isCWD)return"";if(this.#A!==void 0)return this.#A;let t=this.name,e=this.parent;if(!e)return this.#A=this.fullpathPosix();let s=e.relativePosix();return s+(!s||!e.parent?"":"/")+t}fullpath(){if(this.#g!==void 0)return this.#g;let t=this.name,e=this.parent;if(!e)return this.#g=this.name;let i=e.fullpath()+(e.parent?this.sep:"")+t;return this.#g=i}fullpathPosix(){if(this.#y!==void 0)return this.#y;if(this.sep==="/")return this.#y=this.fullpath();if(!this.parent){let i=this.fullpath().replace(/\\/g,"/");return/^[a-z]:\//i.test(i)?this.#y=`//?/${i}`:this.#y=i}let t=this.parent,e=t.fullpathPosix(),s=e+(!e||!t.parent?"":"/")+this.name;return this.#y=s}isUnknown(){return(this.#e&_)===L}isType(t){return this[`is${t}`]()}getType(){return this.isUnknown()?"Unknown":this.isDirectory()?"Directory":this.isFile()?"File":this.isSymbolicLink()?"SymbolicLink":this.isFIFO()?"FIFO":this.isCharacterDevice()?"CharacterDevice":this.isBlockDevice()?"BlockDevice":this.isSocket()?"Socket":"Unknown"}isFile(){return(this.#e&_)===Ke}isDirectory(){return(this.#e&_)===U}isCharacterDevice(){return(this.#e&_)===He}isBlockDevice(){return(this.#e&_)===qe}isFIFO(){return(this.#e&_)===Ge}isSocket(){return(this.#e&_)===Ve}isSymbolicLink(){return(this.#e&X)===X}lstatCached(){return this.#e&je?this:void 0}readlinkCached(){return this.#M}realpathCached(){return this.#k}readdirCached(){let t=this.children();return t.slice(0,t.provisional)}canReadlink(){if(this.#M)return!0;if(!this.parent)return!1;let t=this.#e&_;return!(t!==L&&t!==X||this.#e&Nt||this.#e&j)}calledReaddir(){return!!(this.#e&se)}isENOENT(){return!!(this.#e&j)}isNamed(t){return this.nocase?this.#C===_t(t):this.#C===bt(t)}async readlink(){let t=this.#M;if(t)return t;if(this.canReadlink()&&this.parent)try{let e=await this.#t.promises.readlink(this.fullpath()),s=(await this.parent.realpath())?.resolve(e);if(s)return this.#M=s}catch(e){this.#D(e.code);return}}readlinkSync(){let t=this.#M;if(t)return t;if(this.canReadlink()&&this.parent)try{let e=this.#t.readlinkSync(this.fullpath()),s=this.parent.realpathSync()?.resolve(e);if(s)return this.#M=s}catch(e){this.#D(e.code);return}}#j(t){this.#e|=se;for(let e=t.provisional;e<t.length;e++){let s=t[e];s&&s.#v()}}#v(){this.#e&j||(this.#e=(this.#e|j)&gt,this.#G())}#G(){let t=this.children();t.provisional=0;for(let e of t)e.#v()}#P(){this.#e|=Lt,this.#L()}#L(){if(this.#e&yt)return;let t=this.#e;(t&_)===U&&(t&=gt),this.#e=t|yt,this.#G()}#I(t=""){t==="ENOTDIR"||t==="EPERM"?this.#L():t==="ENOENT"?this.#v():this.children().provisional=0}#F(t=""){t==="ENOTDIR"?this.parent.#L():t==="ENOENT"&&this.#v()}#D(t=""){let e=this.#e;e|=Nt,t==="ENOENT"&&(e|=j),(t==="EINVAL"||t==="UNKNOWN")&&(e&=gt),this.#e=e,t==="ENOTDIR"&&this.parent&&this.parent.#L()}#z(t,e){return this.#U(t,e)||this.#B(t,e)}#B(t,e){let s=ie(t),i=this.newChild(t.name,s,{parent:this}),r=i.#e&_;return r!==U&&r!==X&&r!==L&&(i.#e|=yt),e.unshift(i),e.provisional++,i}#U(t,e){for(let s=e.provisional;s<e.length;s++){let i=e[s];if((this.nocase?_t(t.name):bt(t.name))===i.#C)return this.#l(t,i,s,e)}}#l(t,e,s,i){let r=e.name;return e.#e=e.#e&gt|ie(t),r!==t.name&&(e.name=t.name),s!==i.provisional&&(s===i.length-1?i.pop():i.splice(s,1),i.unshift(e)),i.provisional++,e}async lstat(){if((this.#e&j)===0)try{return this.#$(await this.#t.promises.lstat(this.fullpath())),this}catch(t){this.#F(t.code)}}lstatSync(){if((this.#e&j)===0)try{return this.#$(this.#t.lstatSync(this.fullpath())),this}catch(t){this.#F(t.code)}}#$(t){let{atime:e,atimeMs:s,birthtime:i,birthtimeMs:r,blksize:o,blocks:h,ctime:a,ctimeMs:l,dev:u,gid:c,ino:d,mode:f,mtime:m,mtimeMs:p,nlink:w,rdev:g,size:S,uid:E}=t;this.#b=e,this.#a=s,this.#m=i,this.#E=r,this.#c=o,this.#f=h,this.#R=a,this.#d=l,this.#s=u,this.#S=c,this.#h=d,this.#n=f,this.#p=m,this.#i=p,this.#r=w,this.#w=g,this.#u=S,this.#o=E;let y=ie(t);this.#e=this.#e&gt|y|je,y!==L&&y!==U&&y!==X&&(this.#e|=yt)}#W=[];#O=!1;#H(t){this.#O=!1;let e=this.#W.slice();this.#W.length=0,e.forEach(s=>s(null,t))}readdirCB(t,e=!1){if(!this.canReaddir()){e?t(null,[]):queueMicrotask(()=>t(null,[]));return}let s=this.children();if(this.calledReaddir()){let r=s.slice(0,s.provisional);e?t(null,r):queueMicrotask(()=>t(null,r));return}if(this.#W.push(t),this.#O)return;this.#O=!0;let i=this.fullpath();this.#t.readdir(i,{withFileTypes:!0},(r,o)=>{if(r)this.#I(r.code),s.provisional=0;else{for(let h of o)this.#z(h,s);this.#j(s)}this.#H(s.slice(0,s.provisional))})}#q;async readdir(){if(!this.canReaddir())return[];let t=this.children();if(this.calledReaddir())return t.slice(0,t.provisional);let e=this.fullpath();if(this.#q)await this.#q;else{let s=()=>{};this.#q=new Promise(i=>s=i);try{for(let i of await this.#t.promises.readdir(e,{withFileTypes:!0}))this.#z(i,t);this.#j(t)}catch(i){this.#I(i.code),t.provisional=0}this.#q=void 0,s()}return t.slice(0,t.provisional)}readdirSync(){if(!this.canReaddir())return[];let t=this.children();if(this.calledReaddir())return t.slice(0,t.provisional);let e=this.fullpath();try{for(let s of this.#t.readdirSync(e,{withFileTypes:!0}))this.#z(s,t);this.#j(t)}catch(s){this.#I(s.code),t.provisional=0}return t.slice(0,t.provisional)}canReaddir(){if(this.#e&Ie)return!1;let t=_&this.#e;return t===L||t===U||t===X}shouldWalk(t,e){return(this.#e&U)===U&&!(this.#e&Ie)&&!t.has(this)&&(!e||e(this))}async realpath(){if(this.#k)return this.#k;if(!((Lt|Nt|j)&this.#e))try{let t=await this.#t.promises.realpath(this.fullpath());return this.#k=this.resolve(t)}catch{this.#P()}}realpathSync(){if(this.#k)return this.#k;if(!((Lt|Nt|j)&this.#e))try{let t=this.#t.realpathSync(this.fullpath());return this.#k=this.resolve(t)}catch{this.#P()}}[Ye](t){if(t===this)return;t.isCWD=!1,this.isCWD=!0;let e=new Set([]),s=[],i=this;for(;i&&i.parent;)e.add(i),i.#x=s.join(this.sep),i.#A=s.join("/"),i=i.parent,s.push("..");for(i=t;i&&i.parent&&!e.has(i);)i.#x=void 0,i.#A=void 0,i=i.parent}},Pt=class n extends R{sep="\\";splitSep=Oi;constructor(t,e=L,s,i,r,o,h){super(t,e,s,i,r,o,h)}newChild(t,e=L,s={}){return new n(t,e,this.root,this.roots,this.nocase,this.childrenCache(),s)}getRootString(t){return external_node_path_.win32.parse(t).root}getRoot(t){if(t=Ri(t.toUpperCase()),t===this.root.name)return this.root;for(let[e,s]of Object.entries(this.roots))if(this.sameRoot(t,e))return this.roots[t]=s;return this.roots[t]=new it(t,this).root}sameRoot(t,e=this.root.name){return t=t.toUpperCase().replace(/\//g,"\\").replace($e,"$1\\"),t===e}},jt=class n extends R{splitSep="/";sep="/";constructor(t,e=L,s,i,r,o,h){super(t,e,s,i,r,o,h)}getRootString(t){return t.startsWith("/")?"/":""}getRoot(t){return this.root}newChild(t,e=L,s={}){return new n(t,e,this.root,this.roots,this.nocase,this.childrenCache(),s)}},It=class{root;rootPath;roots;cwd;#t;#s;#n;nocase;#r;constructor(t=process.cwd(),e,s,{nocase:i,childrenCacheSize:r=16*1024,fs:o=wt}={}){this.#r=Ue(o),(t instanceof URL||t.startsWith("file://"))&&(t=(0,external_node_url_.fileURLToPath)(t));let h=e.resolve(t);this.roots=Object.create(null),this.rootPath=this.parseRootPath(h),this.#t=new Wt,this.#s=new Wt,this.#n=new ne(r);let a=h.substring(this.rootPath.length).split(s);if(a.length===1&&!a[0]&&a.pop(),i===void 0)throw new TypeError("must provide nocase setting to PathScurryBase ctor");this.nocase=i,this.root=this.newRoot(this.#r),this.roots[this.rootPath]=this.root;let l=this.root,u=a.length-1,c=e.sep,d=this.rootPath,f=!1;for(let m of a){let p=u--;l=l.child(m,{relative:new Array(p).fill("..").join(c),relativePosix:new Array(p).fill("..").join("/"),fullpath:d+=(f?"":c)+m}),f=!0}this.cwd=l}depth(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),t.depth()}childrenCache(){return this.#n}resolve(...t){let e="";for(let r=t.length-1;r>=0;r--){let o=t[r];if(!(!o||o===".")&&(e=e?`${o}/${e}`:o,this.isAbsolute(o)))break}let s=this.#t.get(e);if(s!==void 0)return s;let i=this.cwd.resolve(e).fullpath();return this.#t.set(e,i),i}resolvePosix(...t){let e="";for(let r=t.length-1;r>=0;r--){let o=t[r];if(!(!o||o===".")&&(e=e?`${o}/${e}`:o,this.isAbsolute(o)))break}let s=this.#s.get(e);if(s!==void 0)return s;let i=this.cwd.resolve(e).fullpathPosix();return this.#s.set(e,i),i}relative(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),t.relative()}relativePosix(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),t.relativePosix()}basename(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),t.name}dirname(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),(t.parent||t).fullpath()}async readdir(t=this.cwd,e={withFileTypes:!0}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s}=e;if(t.canReaddir()){let i=await t.readdir();return s?i:i.map(r=>r.name)}else return[]}readdirSync(t=this.cwd,e={withFileTypes:!0}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s=!0}=e;return t.canReaddir()?s?t.readdirSync():t.readdirSync().map(i=>i.name):[]}async lstat(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),t.lstat()}lstatSync(t=this.cwd){return typeof t=="string"&&(t=this.cwd.resolve(t)),t.lstatSync()}async readlink(t=this.cwd,{withFileTypes:e}={withFileTypes:!1}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t.withFileTypes,t=this.cwd);let s=await t.readlink();return e?s:s?.fullpath()}readlinkSync(t=this.cwd,{withFileTypes:e}={withFileTypes:!1}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t.withFileTypes,t=this.cwd);let s=t.readlinkSync();return e?s:s?.fullpath()}async realpath(t=this.cwd,{withFileTypes:e}={withFileTypes:!1}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t.withFileTypes,t=this.cwd);let s=await t.realpath();return e?s:s?.fullpath()}realpathSync(t=this.cwd,{withFileTypes:e}={withFileTypes:!1}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t.withFileTypes,t=this.cwd);let s=t.realpathSync();return e?s:s?.fullpath()}async walk(t=this.cwd,e={}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s=!0,follow:i=!1,filter:r,walkFilter:o}=e,h=[];(!r||r(t))&&h.push(s?t:t.fullpath());let a=new Set,l=(c,d)=>{a.add(c),c.readdirCB((f,m)=>{if(f)return d(f);let p=m.length;if(!p)return d();let w=()=>{--p===0&&d()};for(let g of m)(!r||r(g))&&h.push(s?g:g.fullpath()),i&&g.isSymbolicLink()?g.realpath().then(S=>S?.isUnknown()?S.lstat():S).then(S=>S?.shouldWalk(a,o)?l(S,w):w()):g.shouldWalk(a,o)?l(g,w):w()},!0)},u=t;return new Promise((c,d)=>{l(u,f=>{if(f)return d(f);c(h)})})}walkSync(t=this.cwd,e={}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s=!0,follow:i=!1,filter:r,walkFilter:o}=e,h=[];(!r||r(t))&&h.push(s?t:t.fullpath());let a=new Set([t]);for(let l of a){let u=l.readdirSync();for(let c of u){(!r||r(c))&&h.push(s?c:c.fullpath());let d=c;if(c.isSymbolicLink()){if(!(i&&(d=c.realpathSync())))continue;d.isUnknown()&&d.lstatSync()}d.shouldWalk(a,o)&&a.add(d)}}return h}[Symbol.asyncIterator](){return this.iterate()}iterate(t=this.cwd,e={}){return typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd),this.stream(t,e)[Symbol.asyncIterator]()}[Symbol.iterator](){return this.iterateSync()}*iterateSync(t=this.cwd,e={}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s=!0,follow:i=!1,filter:r,walkFilter:o}=e;(!r||r(t))&&(yield s?t:t.fullpath());let h=new Set([t]);for(let a of h){let l=a.readdirSync();for(let u of l){(!r||r(u))&&(yield s?u:u.fullpath());let c=u;if(u.isSymbolicLink()){if(!(i&&(c=u.realpathSync())))continue;c.isUnknown()&&c.lstatSync()}c.shouldWalk(h,o)&&h.add(c)}}}stream(t=this.cwd,e={}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s=!0,follow:i=!1,filter:r,walkFilter:o}=e,h=new V({objectMode:!0});(!r||r(t))&&h.write(s?t:t.fullpath());let a=new Set,l=[t],u=0,c=()=>{let d=!1;for(;!d;){let f=l.shift();if(!f){u===0&&h.end();return}u++,a.add(f);let m=(w,g,S=!1)=>{if(w)return h.emit("error",w);if(i&&!S){let E=[];for(let y of g)y.isSymbolicLink()&&E.push(y.realpath().then(b=>b?.isUnknown()?b.lstat():b));if(E.length){Promise.all(E).then(()=>m(null,g,!0));return}}for(let E of g)E&&(!r||r(E))&&(h.write(s?E:E.fullpath())||(d=!0));u--;for(let E of g){let y=E.realpathCached()||E;y.shouldWalk(a,o)&&l.push(y)}d&&!h.flowing?h.once("drain",c):p||c()},p=!0;f.readdirCB(m,!0),p=!1}};return c(),h}streamSync(t=this.cwd,e={}){typeof t=="string"?t=this.cwd.resolve(t):t instanceof R||(e=t,t=this.cwd);let{withFileTypes:s=!0,follow:i=!1,filter:r,walkFilter:o}=e,h=new V({objectMode:!0}),a=new Set;(!r||r(t))&&h.write(s?t:t.fullpath());let l=[t],u=0,c=()=>{let d=!1;for(;!d;){let f=l.shift();if(!f){u===0&&h.end();return}u++,a.add(f);let m=f.readdirSync();for(let p of m)(!r||r(p))&&(h.write(s?p:p.fullpath())||(d=!0));u--;for(let p of m){let w=p;if(p.isSymbolicLink()){if(!(i&&(w=p.realpathSync())))continue;w.isUnknown()&&w.lstatSync()}w.shouldWalk(a,o)&&l.push(w)}}d&&!h.flowing&&h.once("drain",c)};return c(),h}chdir(t=this.cwd){let e=this.cwd;this.cwd=typeof t=="string"?this.cwd.resolve(t):t,this.cwd[Ye](e)}},it=class extends It{sep="\\";constructor(t=process.cwd(),e={}){let{nocase:s=!0}=e;super(t,external_node_path_.win32,"\\",{...e,nocase:s}),this.nocase=s;for(let i=this.cwd;i;i=i.parent)i.nocase=this.nocase}parseRootPath(t){return external_node_path_.win32.parse(t).root.toUpperCase()}newRoot(t){return new Pt(this.rootPath,U,void 0,this.roots,this.nocase,this.childrenCache(),{fs:t})}isAbsolute(t){return t.startsWith("/")||t.startsWith("\\")||/^[a-z]:(\/|\\)/i.test(t)}},rt=class extends It{sep="/";constructor(t=process.cwd(),e={}){let{nocase:s=!1}=e;super(t,external_node_path_.posix,"/",{...e,nocase:s}),this.nocase=s}parseRootPath(t){return"/"}newRoot(t){return new jt(this.rootPath,U,void 0,this.roots,this.nocase,this.childrenCache(),{fs:t})}isAbsolute(t){return t.startsWith("/")}},St=class extends rt{constructor(t=process.cwd(),e={}){let{nocase:s=!0}=e;super(t,{...e,nocase:s})}},Cr=process.platform==="win32"?Pt:jt,Xe=process.platform==="win32"?it:process.platform==="darwin"?St:rt;var Di=n=>n.length>=1,Mi=n=>n.length>=1,Ni=Symbol.for("nodejs.util.inspect.custom"),nt=class n{#t;#s;#n;length;#r;#o;#S;#w;#c;#h;#u=!0;constructor(t,e,s,i){if(!Di(t))throw new TypeError("empty pattern list");if(!Mi(e))throw new TypeError("empty glob list");if(e.length!==t.length)throw new TypeError("mismatched pattern list and glob list lengths");if(this.length=t.length,s<0||s>=this.length)throw new TypeError("index out of range");if(this.#t=t,this.#s=e,this.#n=s,this.#r=i,this.#n===0){if(this.isUNC()){let[r,o,h,a,...l]=this.#t,[u,c,d,f,...m]=this.#s;l[0]===""&&(l.shift(),m.shift());let p=[r,o,h,a,""].join("/"),w=[u,c,d,f,""].join("/");this.#t=[p,...l],this.#s=[w,...m],this.length=this.#t.length}else if(this.isDrive()||this.isAbsolute()){let[r,...o]=this.#t,[h,...a]=this.#s;o[0]===""&&(o.shift(),a.shift());let l=r+"/",u=h+"/";this.#t=[l,...o],this.#s=[u,...a],this.length=this.#t.length}}}[Ni](){return"Pattern <"+this.#s.slice(this.#n).join("/")+">"}pattern(){return this.#t[this.#n]}isString(){return typeof this.#t[this.#n]=="string"}isGlobstar(){return this.#t[this.#n]===A}isRegExp(){return this.#t[this.#n]instanceof RegExp}globString(){return this.#S=this.#S||(this.#n===0?this.isAbsolute()?this.#s[0]+this.#s.slice(1).join("/"):this.#s.join("/"):this.#s.slice(this.#n).join("/"))}hasMore(){return this.length>this.#n+1}rest(){return this.#o!==void 0?this.#o:this.hasMore()?(this.#o=new n(this.#t,this.#s,this.#n+1,this.#r),this.#o.#h=this.#h,this.#o.#c=this.#c,this.#o.#w=this.#w,this.#o):this.#o=null}isUNC(){let t=this.#t;return this.#c!==void 0?this.#c:this.#c=this.#r==="win32"&&this.#n===0&&t[0]===""&&t[1]===""&&typeof t[2]=="string"&&!!t[2]&&typeof t[3]=="string"&&!!t[3]}isDrive(){let t=this.#t;return this.#w!==void 0?this.#w:this.#w=this.#r==="win32"&&this.#n===0&&this.length>1&&typeof t[0]=="string"&&/^[a-z]:$/i.test(t[0])}isAbsolute(){let t=this.#t;return this.#h!==void 0?this.#h:this.#h=t[0]===""&&t.length>1||this.isDrive()||this.isUNC()}root(){let t=this.#t[0];return typeof t=="string"&&this.isAbsolute()&&this.#n===0?t:""}checkFollowGlobstar(){return!(this.#n===0||!this.isGlobstar()||!this.#u)}markFollowGlobstar(){return this.#n===0||!this.isGlobstar()||!this.#u?!1:(this.#u=!1,!0)}};var _i=typeof process=="object"&&process&&typeof process.platform=="string"?process.platform:"linux",ot=class{relative;relativeChildren;absolute;absoluteChildren;platform;mmopts;constructor(t,{nobrace:e,nocase:s,noext:i,noglobstar:r,platform:o=_i}){this.relative=[],this.absolute=[],this.relativeChildren=[],this.absoluteChildren=[],this.platform=o,this.mmopts={dot:!0,nobrace:e,nocase:s,noext:i,noglobstar:r,optimizationLevel:2,platform:o,nocomment:!0,nonegate:!0};for(let h of t)this.add(h)}add(t){let e=new D(t,this.mmopts);for(let s=0;s<e.set.length;s++){let i=e.set[s],r=e.globParts[s];if(!i||!r)throw new Error("invalid pattern object");for(;i[0]==="."&&r[0]===".";)i.shift(),r.shift();let o=new nt(i,r,0,this.platform),h=new D(o.globString(),this.mmopts),a=r[r.length-1]==="**",l=o.isAbsolute();l?this.absolute.push(h):this.relative.push(h),a&&(l?this.absoluteChildren.push(h):this.relativeChildren.push(h))}}ignored(t){let e=t.fullpath(),s=`${e}/`,i=t.relative()||".",r=`${i}/`;for(let o of this.relative)if(o.match(i)||o.match(r))return!0;for(let o of this.absolute)if(o.match(e)||o.match(s))return!0;return!1}childrenIgnored(t){let e=t.fullpath()+"/",s=(t.relative()||".")+"/";for(let i of this.relativeChildren)if(i.match(s))return!0;for(let i of this.absoluteChildren)if(i.match(e))return!0;return!1}};var oe=class n{store;constructor(t=new Map){this.store=t}copy(){return new n(new Map(this.store))}hasWalked(t,e){return this.store.get(t.fullpath())?.has(e.globString())}storeWalked(t,e){let s=t.fullpath(),i=this.store.get(s);i?i.add(e.globString()):this.store.set(s,new Set([e.globString()]))}},he=class{store=new Map;add(t,e,s){let i=(e?2:0)|(s?1:0),r=this.store.get(t);this.store.set(t,r===void 0?i:i&r)}entries(){return[...this.store.entries()].map(([t,e])=>[t,!!(e&2),!!(e&1)])}},ae=class{store=new Map;add(t,e){if(!t.canReaddir())return;let s=this.store.get(t);s?s.find(i=>i.globString()===e.globString())||s.push(e):this.store.set(t,[e])}get(t){let e=this.store.get(t);if(!e)throw new Error("attempting to walk unknown path");return e}entries(){return this.keys().map(t=>[t,this.store.get(t)])}keys(){return[...this.store.keys()].filter(t=>t.canReaddir())}},Et=class n{hasWalkedCache;matches=new he;subwalks=new ae;patterns;follow;dot;opts;constructor(t,e){this.opts=t,this.follow=!!t.follow,this.dot=!!t.dot,this.hasWalkedCache=e?e.copy():new oe}processPatterns(t,e){this.patterns=e;let s=e.map(i=>[t,i]);for(let[i,r]of s){this.hasWalkedCache.storeWalked(i,r);let o=r.root(),h=r.isAbsolute()&&this.opts.absolute!==!1;if(o){i=i.resolve(o==="/"&&this.opts.root!==void 0?this.opts.root:o);let c=r.rest();if(c)r=c;else{this.matches.add(i,!0,!1);continue}}if(i.isENOENT())continue;let a,l,u=!1;for(;typeof(a=r.pattern())=="string"&&(l=r.rest());)i=i.resolve(a),r=l,u=!0;if(a=r.pattern(),l=r.rest(),u){if(this.hasWalkedCache.hasWalked(i,r))continue;this.hasWalkedCache.storeWalked(i,r)}if(typeof a=="string"){let c=a===".."||a===""||a===".";this.matches.add(i.resolve(a),h,c);continue}else if(a===A){(!i.isSymbolicLink()||this.follow||r.checkFollowGlobstar())&&this.subwalks.add(i,r);let c=l?.pattern(),d=l?.rest();if(!l||(c===""||c===".")&&!d)this.matches.add(i,h,c===""||c===".");else if(c===".."){let f=i.parent||i;d?this.hasWalkedCache.hasWalked(f,d)||this.subwalks.add(f,d):this.matches.add(f,h,!0)}}else a instanceof RegExp&&this.subwalks.add(i,r)}return this}subwalkTargets(){return this.subwalks.keys()}child(){return new n(this.opts,this.hasWalkedCache)}filterEntries(t,e){let s=this.subwalks.get(t),i=this.child();for(let r of e)for(let o of s){let h=o.isAbsolute(),a=o.pattern(),l=o.rest();a===A?i.testGlobstar(r,o,l,h):a instanceof RegExp?i.testRegExp(r,a,l,h):i.testString(r,a,l,h)}return i}testGlobstar(t,e,s,i){if((this.dot||!t.name.startsWith("."))&&(e.hasMore()||this.matches.add(t,i,!1),t.canReaddir()&&(this.follow||!t.isSymbolicLink()?this.subwalks.add(t,e):t.isSymbolicLink()&&(s&&e.checkFollowGlobstar()?this.subwalks.add(t,s):e.markFollowGlobstar()&&this.subwalks.add(t,e)))),s){let r=s.pattern();if(typeof r=="string"&&r!==".."&&r!==""&&r!==".")this.testString(t,r,s.rest(),i);else if(r===".."){let o=t.parent||t;this.subwalks.add(o,s)}else r instanceof RegExp&&this.testRegExp(t,r,s.rest(),i)}}testRegExp(t,e,s,i){e.test(t.name)&&(s?this.subwalks.add(t,s):this.matches.add(t,i,!1))}testString(t,e,s,i){t.isNamed(e)&&(s?this.subwalks.add(t,s):this.matches.add(t,i,!1))}};var Li=(n,t)=>typeof n=="string"?new ot([n],t):Array.isArray(n)?new ot(n,t):n,zt=class{path;patterns;opts;seen=new Set;paused=!1;aborted=!1;#t=[];#s;#n;signal;maxDepth;includeChildMatches;constructor(t,e,s){if(this.patterns=t,this.path=e,this.opts=s,this.#n=!s.posix&&s.platform==="win32"?"\\":"/",this.includeChildMatches=s.includeChildMatches!==!1,(s.ignore||!this.includeChildMatches)&&(this.#s=Li(s.ignore??[],s),!this.includeChildMatches&&typeof this.#s.add!="function")){let i="cannot ignore child matches, ignore lacks add() method.";throw new Error(i)}this.maxDepth=s.maxDepth||1/0,s.signal&&(this.signal=s.signal,this.signal.addEventListener("abort",()=>{this.#t.length=0}))}#r(t){return this.seen.has(t)||!!this.#s?.ignored?.(t)}#o(t){return!!this.#s?.childrenIgnored?.(t)}pause(){this.paused=!0}resume(){if(this.signal?.aborted)return;this.paused=!1;let t;for(;!this.paused&&(t=this.#t.shift());)t()}onResume(t){this.signal?.aborted||(this.paused?this.#t.push(t):t())}async matchCheck(t,e){if(e&&this.opts.nodir)return;let s;if(this.opts.realpath){if(s=t.realpathCached()||await t.realpath(),!s)return;t=s}let r=t.isUnknown()||this.opts.stat?await t.lstat():t;if(this.opts.follow&&this.opts.nodir&&r?.isSymbolicLink()){let o=await r.realpath();o&&(o.isUnknown()||this.opts.stat)&&await o.lstat()}return this.matchCheckTest(r,e)}matchCheckTest(t,e){return t&&(this.maxDepth===1/0||t.depth()<=this.maxDepth)&&(!e||t.canReaddir())&&(!this.opts.nodir||!t.isDirectory())&&(!this.opts.nodir||!this.opts.follow||!t.isSymbolicLink()||!t.realpathCached()?.isDirectory())&&!this.#r(t)?t:void 0}matchCheckSync(t,e){if(e&&this.opts.nodir)return;let s;if(this.opts.realpath){if(s=t.realpathCached()||t.realpathSync(),!s)return;t=s}let r=t.isUnknown()||this.opts.stat?t.lstatSync():t;if(this.opts.follow&&this.opts.nodir&&r?.isSymbolicLink()){let o=r.realpathSync();o&&(o?.isUnknown()||this.opts.stat)&&o.lstatSync()}return this.matchCheckTest(r,e)}matchFinish(t,e){if(this.#r(t))return;if(!this.includeChildMatches&&this.#s?.add){let r=`${t.relativePosix()}/**`;this.#s.add(r)}let s=this.opts.absolute===void 0?e:this.opts.absolute;this.seen.add(t);let i=this.opts.mark&&t.isDirectory()?this.#n:"";if(this.opts.withFileTypes)this.matchEmit(t);else if(s){let r=this.opts.posix?t.fullpathPosix():t.fullpath();this.matchEmit(r+i)}else{let r=this.opts.posix?t.relativePosix():t.relative(),o=this.opts.dotRelative&&!r.startsWith(".."+this.#n)?"."+this.#n:"";this.matchEmit(r?o+r+i:"."+i)}}async match(t,e,s){let i=await this.matchCheck(t,s);i&&this.matchFinish(i,e)}matchSync(t,e,s){let i=this.matchCheckSync(t,s);i&&this.matchFinish(i,e)}walkCB(t,e,s){this.signal?.aborted&&s(),this.walkCB2(t,e,new Et(this.opts),s)}walkCB2(t,e,s,i){if(this.#o(t))return i();if(this.signal?.aborted&&i(),this.paused){this.onResume(()=>this.walkCB2(t,e,s,i));return}s.processPatterns(t,e);let r=1,o=()=>{--r===0&&i()};for(let[h,a,l]of s.matches.entries())this.#r(h)||(r++,this.match(h,a,l).then(()=>o()));for(let h of s.subwalkTargets()){if(this.maxDepth!==1/0&&h.depth()>=this.maxDepth)continue;r++;let a=h.readdirCached();h.calledReaddir()?this.walkCB3(h,a,s,o):h.readdirCB((l,u)=>this.walkCB3(h,u,s,o),!0)}o()}walkCB3(t,e,s,i){s=s.filterEntries(t,e);let r=1,o=()=>{--r===0&&i()};for(let[h,a,l]of s.matches.entries())this.#r(h)||(r++,this.match(h,a,l).then(()=>o()));for(let[h,a]of s.subwalks.entries())r++,this.walkCB2(h,a,s.child(),o);o()}walkCBSync(t,e,s){this.signal?.aborted&&s(),this.walkCB2Sync(t,e,new Et(this.opts),s)}walkCB2Sync(t,e,s,i){if(this.#o(t))return i();if(this.signal?.aborted&&i(),this.paused){this.onResume(()=>this.walkCB2Sync(t,e,s,i));return}s.processPatterns(t,e);let r=1,o=()=>{--r===0&&i()};for(let[h,a,l]of s.matches.entries())this.#r(h)||this.matchSync(h,a,l);for(let h of s.subwalkTargets()){if(this.maxDepth!==1/0&&h.depth()>=this.maxDepth)continue;r++;let a=h.readdirSync();this.walkCB3Sync(h,a,s,o)}o()}walkCB3Sync(t,e,s,i){s=s.filterEntries(t,e);let r=1,o=()=>{--r===0&&i()};for(let[h,a,l]of s.matches.entries())this.#r(h)||this.matchSync(h,a,l);for(let[h,a]of s.subwalks.entries())r++,this.walkCB2Sync(h,a,s.child(),o);o()}},xt=class extends zt{matches=new Set;constructor(t,e,s){super(t,e,s)}matchEmit(t){this.matches.add(t)}async walk(){if(this.signal?.aborted)throw this.signal.reason;return this.path.isUnknown()&&await this.path.lstat(),await new Promise((t,e)=>{this.walkCB(this.path,this.patterns,()=>{this.signal?.aborted?e(this.signal.reason):t(this.matches)})}),this.matches}walkSync(){if(this.signal?.aborted)throw this.signal.reason;return this.path.isUnknown()&&this.path.lstatSync(),this.walkCBSync(this.path,this.patterns,()=>{if(this.signal?.aborted)throw this.signal.reason}),this.matches}},vt=class extends zt{results;constructor(t,e,s){super(t,e,s),this.results=new V({signal:this.signal,objectMode:!0}),this.results.on("drain",()=>this.resume()),this.results.on("resume",()=>this.resume())}matchEmit(t){this.results.write(t),this.results.flowing||this.pause()}stream(){let t=this.path;return t.isUnknown()?t.lstat().then(()=>{this.walkCB(t,this.patterns,()=>this.results.end())}):this.walkCB(t,this.patterns,()=>this.results.end()),this.results}streamSync(){return this.path.isUnknown()&&this.path.lstatSync(),this.walkCBSync(this.path,this.patterns,()=>this.results.end()),this.results}};var Pi=typeof process=="object"&&process&&typeof process.platform=="string"?process.platform:"linux",I=class{absolute;cwd;root;dot;dotRelative;follow;ignore;magicalBraces;mark;matchBase;maxDepth;nobrace;nocase;nodir;noext;noglobstar;pattern;platform;realpath;scurry;stat;signal;windowsPathsNoEscape;withFileTypes;includeChildMatches;opts;patterns;constructor(t,e){if(!e)throw new TypeError("glob options required");if(this.withFileTypes=!!e.withFileTypes,this.signal=e.signal,this.follow=!!e.follow,this.dot=!!e.dot,this.dotRelative=!!e.dotRelative,this.nodir=!!e.nodir,this.mark=!!e.mark,e.cwd?(e.cwd instanceof URL||e.cwd.startsWith("file://"))&&(e.cwd=(0,external_node_url_.fileURLToPath)(e.cwd)):this.cwd="",this.cwd=e.cwd||"",this.root=e.root,this.magicalBraces=!!e.magicalBraces,this.nobrace=!!e.nobrace,this.noext=!!e.noext,this.realpath=!!e.realpath,this.absolute=e.absolute,this.includeChildMatches=e.includeChildMatches!==!1,this.noglobstar=!!e.noglobstar,this.matchBase=!!e.matchBase,this.maxDepth=typeof e.maxDepth=="number"?e.maxDepth:1/0,this.stat=!!e.stat,this.ignore=e.ignore,this.withFileTypes&&this.absolute!==void 0)throw new Error("cannot set absolute and withFileTypes:true");if(typeof t=="string"&&(t=[t]),this.windowsPathsNoEscape=!!e.windowsPathsNoEscape||e.allowWindowsEscape===!1,this.windowsPathsNoEscape&&(t=t.map(a=>a.replace(/\\/g,"/"))),this.matchBase){if(e.noglobstar)throw new TypeError("base matching requires globstar");t=t.map(a=>a.includes("/")?a:`./**/${a}`)}if(this.pattern=t,this.platform=e.platform||Pi,this.opts={...e,platform:this.platform},e.scurry){if(this.scurry=e.scurry,e.nocase!==void 0&&e.nocase!==e.scurry.nocase)throw new Error("nocase option contradicts provided scurry option")}else{let a=e.platform==="win32"?it:e.platform==="darwin"?St:e.platform?rt:Xe;this.scurry=new a(this.cwd,{nocase:e.nocase,fs:e.fs})}this.nocase=this.scurry.nocase;let s=this.platform==="darwin"||this.platform==="win32",i={braceExpandMax:1e4,...e,dot:this.dot,matchBase:this.matchBase,nobrace:this.nobrace,nocase:this.nocase,nocaseMagicOnly:s,nocomment:!0,noext:this.noext,nonegate:!0,optimizationLevel:2,platform:this.platform,windowsPathsNoEscape:this.windowsPathsNoEscape,debug:!!this.opts.debug},r=this.pattern.map(a=>new D(a,i)),[o,h]=r.reduce((a,l)=>(a[0].push(...l.set),a[1].push(...l.globParts),a),[[],[]]);this.patterns=o.map((a,l)=>{let u=h[l];if(!u)throw new Error("invalid pattern object");return new nt(a,u,0,this.platform)})}async walk(){return[...await new xt(this.patterns,this.scurry.cwd,{...this.opts,maxDepth:this.maxDepth!==1/0?this.maxDepth+this.scurry.cwd.depth():1/0,platform:this.platform,nocase:this.nocase,includeChildMatches:this.includeChildMatches}).walk()]}walkSync(){return[...new xt(this.patterns,this.scurry.cwd,{...this.opts,maxDepth:this.maxDepth!==1/0?this.maxDepth+this.scurry.cwd.depth():1/0,platform:this.platform,nocase:this.nocase,includeChildMatches:this.includeChildMatches}).walkSync()]}stream(){return new vt(this.patterns,this.scurry.cwd,{...this.opts,maxDepth:this.maxDepth!==1/0?this.maxDepth+this.scurry.cwd.depth():1/0,platform:this.platform,nocase:this.nocase,includeChildMatches:this.includeChildMatches}).stream()}streamSync(){return new vt(this.patterns,this.scurry.cwd,{...this.opts,maxDepth:this.maxDepth!==1/0?this.maxDepth+this.scurry.cwd.depth():1/0,platform:this.platform,nocase:this.nocase,includeChildMatches:this.includeChildMatches}).streamSync()}iterateSync(){return this.streamSync()[Symbol.iterator]()}[Symbol.iterator](){return this.iterateSync()}iterate(){return this.stream()[Symbol.asyncIterator]()}[Symbol.asyncIterator](){return this.iterate()}};var le=(n,t={})=>{Array.isArray(n)||(n=[n]);for(let e of n)if(new D(e,t).hasMagic())return!0;return!1};function Bt(n,t={}){return new I(n,t).streamSync()}function Qe(n,t={}){return new I(n,t).stream()}function ts(n,t={}){return new I(n,t).walkSync()}async function Je(n,t={}){return new I(n,t).walk()}function Ut(n,t={}){return new I(n,t).iterateSync()}function es(n,t={}){return new I(n,t).iterate()}var ji=Bt,Ii=Object.assign(Qe,{sync:Bt}),zi=Ut,Bi=Object.assign(es,{sync:Ut}),Ui=Object.assign(ts,{stream:Bt,iterate:Ut}),Ze=Object.assign(Je,{glob:Je,globSync:ts,sync:Ui,globStream:Qe,stream:Ii,globStreamSync:Bt,streamSync:ji,globIterate:es,iterate:Bi,globIterateSync:Ut,iterateSync:zi,Glob:I,hasMagic:le,escape:tt,unescape:W});Ze.glob=Ze;
//# sourceMappingURL=index.min.js.map

// EXTERNAL MODULE: external "node:process"
var external_node_process_ = __webpack_require__(7742);
// EXTERNAL MODULE: external "node:readline"
var external_node_readline_ = __webpack_require__(1747);
// EXTERNAL MODULE: external "perf_hooks"
var external_perf_hooks_ = __webpack_require__(4074);
// EXTERNAL MODULE: ./node_modules/@redocly/cli/lib/utils/error.js
var error = __webpack_require__(4259);
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/commands/lint.js






async function handleLint({ argv, config, version, collectSpecData, }) {
    const apis = await getFallbackApisOrExit(argv.apis, config);
    const totals = { errors: 0, warnings: 0, ignored: 0 };
    let totalIgnored = 0;
    // TODO: use shared externalRef resolver, blocked by preprocessors now as they can mutate documents
    for (const { path, alias } of apis) {
        try {
            const startedAt = performance.now();
            const aliasConfig = config.forAlias(alias);
            checkIfRulesetExist(aliasConfig.rules);
            aliasConfig.skipRules(argv['skip-rule']);
            aliasConfig.skipPreprocessors(argv['skip-preprocessor']);
            if (typeof config.document?.parsed === 'undefined' && !argv.extends) {
                logger.info(`No configurations were provided -- using built in ${blue('recommended')} configuration by default.\n\n`);
            }
            if (alias === undefined) {
                logger.info(gray(`validating ${formatPath(path)}...\n`));
            }
            else {
                logger.info(gray(`validating ${formatPath(path)} using lint rules for api '${alias}'...\n`));
            }
            const results = await lint({
                ref: path,
                config: aliasConfig,
                collectSpecData,
            });
            const fileTotals = getTotals(results);
            totals.errors += fileTotals.errors;
            totals.warnings += fileTotals.warnings;
            totals.ignored += fileTotals.ignored;
            if (argv['generate-ignore-file']) {
                config.clearIgnoreForRef(path);
                for (const m of results) {
                    config.addIgnore(m);
                    totalIgnored++;
                }
            }
            else {
                formatProblems(results, {
                    format: argv.format,
                    maxProblems: argv['max-problems'],
                    totals: fileTotals,
                    version,
                    command: 'lint',
                });
            }
            const elapsed = getExecutionTime(startedAt);
            logger.info(gray(`${formatPath(path)}: validated in ${elapsed}\n\n`));
        }
        catch (e) {
            handleError(e, path);
        }
    }
    if (argv['generate-ignore-file']) {
        config.saveIgnore();
        logger.info(`Explicitly ignored ${totalIgnored} ${pluralize('problem', totalIgnored)}.\n\n`);
    }
    else {
        printLintTotals(totals, apis.length);
    }
    printUnusedWarnings(config);
    if (!(totals.errors === 0 || argv['generate-ignore-file'])) {
        throw new AbortFlowError('Lint failed.');
    }
}
async function lint_handleLintConfig(argv, version, config) {
    if (argv['lint-config'] === 'off' || config.document === undefined) {
        return;
    }
    if (argv.format === 'json') {
        // we can't print config lint results as it will break json output
        return;
    }
    const command = argv ? getCommandNameFromArgs(argv) : undefined;
    const problems = await lintConfig({
        config,
        severity: argv['lint-config'] || 'warn',
    });
    const fileTotals = getTotals(problems);
    formatProblems(problems, {
        format: argv.format,
        maxProblems: argv['max-problems'],
        totals: fileTotals,
        version,
        command: 'check-config',
    });
    printConfigLintTotals(fileTotals, command);
    if (fileTotals.errors > 0) {
        throw new ConfigValidationError();
    }
}
//# sourceMappingURL=lint.js.map
;// CONCATENATED MODULE: ./node_modules/@redocly/cli/lib/utils/miscellaneous.js












async function miscellaneous_getFallbackApisOrExit(argsApis, config) {
    const shouldFallbackToAllDefinitions = !isNotEmptyArray(argsApis) && isNotEmptyObject(config.resolvedConfig.apis);
    const res = shouldFallbackToAllDefinitions
        ? fallbackToAllDefinitions(config)
        : await expandGlobsInEntrypoints(argsApis, config);
    const filteredInvalidEntrypoints = res.filter(({ path }) => !isApiPathValid(path));
    if (isNotEmptyArray(filteredInvalidEntrypoints)) {
        for (const { path } of filteredInvalidEntrypoints) {
            logger.warn(`\n${miscellaneous_formatPath(path)} ${red(`does not exist or is invalid.\n\n`)}`);
        }
        exitWithError('Please provide a valid path.');
    }
    if (res.length === 0) {
        exitWithError('No APIs were provided. Specify an API via the command argument or define one in your config.');
    }
    return res;
}
function getConfigDirectory(config) {
    return config.configPath ? dirname(config.configPath) : process.cwd();
}
function isApiPathValid(apiPath) {
    if (!apiPath.trim()) {
        exitWithError('Path cannot be empty.');
        return;
    }
    return fs.existsSync(apiPath) || isAbsoluteUrl(apiPath) ? apiPath : undefined;
}
function fallbackToAllDefinitions(config) {
    return Object.entries(config.resolvedConfig.apis || {}).map(([alias, { root, output }]) => ({
        path: isAbsoluteUrl(root) ? root : resolve(getConfigDirectory(config), root),
        alias,
        output: output && resolve(getConfigDirectory(config), output),
    }));
}
function getAliasOrPath(config, aliasOrPath) {
    const configDir = getConfigDirectory(config);
    const aliasApi = config.resolvedConfig.apis?.[aliasOrPath];
    return aliasApi
        ? {
            path: isAbsoluteUrl(aliasApi.root) ? aliasApi.root : resolve(configDir, aliasApi.root),
            alias: aliasOrPath,
            output: aliasApi.output && resolve(configDir, aliasApi.output),
        }
        : {
            path: aliasOrPath,
            // find alias by path, take the first match
            alias: Object.entries(config.resolvedConfig.apis || {}).find(([_alias, api]) => {
                return resolve(configDir, api.root) === resolve(aliasOrPath);
            })?.[0] ?? undefined,
        };
}
async function expandGlobsInEntrypoints(argApis, config) {
    return (await Promise.all(argApis.map(async (aliasOrPath) => {
        const shouldResolveGlob = hasMagic(aliasOrPath) && !isAbsoluteUrl(aliasOrPath);
        if (shouldResolveGlob) {
            const data = await glob(aliasOrPath, {
                cwd: getConfigDirectory(config),
            });
            return data.map((g) => getAliasOrPath(config, g));
        }
        return getAliasOrPath(config, aliasOrPath);
    }))).flat();
}
function miscellaneous_getExecutionTime(startedAt) {
    return external_node_process_.env.NODE_ENV === 'test'
        ? '<test>ms'
        : `${Math.ceil(external_perf_hooks_.performance.now() - startedAt)}ms`;
}
function printExecutionTime(commandName, startedAt, api) {
    const elapsed = miscellaneous_getExecutionTime(startedAt);
    lib.logger.info((0,colorette.gray)(`\n${api}: ${commandName} processed in ${elapsed}\n\n`));
}
function pathToFilename(path, pathSeparator) {
    if (path === '/') {
        return pathSeparator;
    }
    return path
        .replaceAll('~1', '/')
        .replaceAll('~0', '~')
        .replace(/^\//, '')
        .replaceAll('/', pathSeparator);
}
function escapeLanguageName(lang) {
    return lang.replace(/#/g, '_sharp').replace(/\//, '_').replace(/\s/g, '');
}
function langToExt(lang) {
    const langObj = {
        php: '.php',
        'c#': '.cs',
        shell: '.sh',
        curl: '.sh',
        bash: '.sh',
        javascript: '.js',
        js: '.js',
        python: '.py',
        c: '.c',
        'c++': '.cpp',
        coffeescript: '.litcoffee',
        dart: '.dart',
        elixir: '.ex',
        go: '.go',
        groovy: '.groovy',
        java: '.java',
        kotlin: '.kt',
        'objective-c': '.m',
        perl: '.pl',
        powershell: '.ps1',
        ruby: '.rb',
        rust: '.rs',
        scala: '.sc',
        swift: '.swift',
        typescript: '.ts',
        tsx: '.tsx',
        'visual basic': '.vb',
        'c/al': '.al',
    };
    return langObj[lang.toLowerCase()] ?? '';
}
class CircularJSONNotSupportedError extends Error {
    originalError;
    constructor(originalError) {
        super(originalError.message);
        this.originalError = originalError;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CircularJSONNotSupportedError.prototype);
    }
}
function dumpBundle(obj, format, dereference) {
    if (format === 'json') {
        try {
            return JSON.stringify(obj, null, 2);
        }
        catch (e) {
            if (e.message.indexOf('circular') > -1) {
                throw new CircularJSONNotSupportedError(e);
            }
            throw e;
        }
    }
    else {
        return stringifyYaml(obj, {
            noRefs: !dereference,
            lineWidth: -1,
        });
    }
}
function saveBundle(filename, output) {
    fs.mkdirSync(dirname(filename), { recursive: true });
    fs.writeFileSync(filename, output);
}
async function promptUser(query, hideUserInput = false) {
    return new Promise((resolve) => {
        let output = process.stdout;
        let isOutputMuted = false;
        if (hideUserInput) {
            output = new Writable({
                write: (chunk, encoding, callback) => {
                    if (!isOutputMuted) {
                        process.stdout.write(chunk, encoding);
                    }
                    callback();
                },
            });
        }
        const rl = readline.createInterface({
            input: process.stdin,
            output,
            terminal: true,
            historySize: hideUserInput ? 0 : 30,
        });
        rl.question(`${query}:\n\n  `, (answer) => {
            rl.close();
            resolve(answer);
        });
        isOutputMuted = hideUserInput;
    });
}
function readYaml(filename) {
    return parseYaml(fs.readFileSync(filename, 'utf-8'), { filename });
}
function writeToFileByExtension(data, filePath, noRefs) {
    const ext = getAndValidateFileExtension(filePath);
    if (ext === 'json') {
        writeJson(data, filePath);
        return;
    }
    writeYaml(data, filePath, noRefs);
}
function writeYaml(data, filename, noRefs = false) {
    const content = stringifyYaml(data, { noRefs });
    if (process.env.NODE_ENV === 'test') {
        logger.info(content);
        return;
    }
    fs.mkdirSync(dirname(filename), { recursive: true });
    fs.writeFileSync(filename, content);
}
function writeJson(data, filename) {
    const content = JSON.stringify(data, null, 2);
    if (process.env.NODE_ENV === 'test') {
        logger.info(content);
        return;
    }
    fs.mkdirSync(dirname(filename), { recursive: true });
    fs.writeFileSync(filename, content);
}
function getAndValidateFileExtension(fileName) {
    const ext = fileName.split('.').pop();
    if (outputExtensions.includes(ext)) {
        return ext;
    }
    logger.warn(`Unsupported file extension: ${ext}. Using yaml.\n`);
    return 'yaml';
}
function miscellaneous_handleError(e, ref) {
    switch (e.constructor) {
        case HandledError: {
            throw e;
        }
        case ResolveError:
            exitWithError(`Failed to resolve API description at ${ref}:\n\n  - ${e.message}`);
            break;
        case YamlParseError:
            exitWithError(`Failed to parse API description at ${ref}:\n\n  - ${e.message}`);
            break;
        case CircularJSONNotSupportedError: {
            exitWithError(`Detected circular reference which can't be converted to JSON.\n` +
                `Try to use ${blue('yaml')} output or remove ${blue('--dereferenced')}.`);
            break;
        }
        case SyntaxError:
            exitWithError(`Syntax error: ${e.message} ${e.stack?.split('\n\n')?.[0]}`);
            break;
        case ConfigValidationError:
            exitWithError(e.message);
            break;
        default: {
            exitWithError(`Something went wrong when processing ${ref}:\n\n  - ${e.message}`);
        }
    }
}
function miscellaneous_printLintTotals(totals, definitionsCount) {
    const ignored = totals.ignored
        ? yellow(`${totals.ignored} ${pluralize('problem is', totals.ignored)} explicitly ignored.\n\n`)
        : '';
    if (totals.errors > 0) {
        logger.error(`❌ Validation failed with ${totals.errors} ${pluralize('error', totals.errors)}${totals.warnings > 0
            ? ` and ${totals.warnings} ${pluralize('warning', totals.warnings)}`
            : ''}.\n${ignored}`);
    }
    else if (totals.warnings > 0) {
        logger.info(green(`Woohoo! Your API ${pluralize('description is', definitionsCount)} valid. 🎉\n`));
        logger.warn(`You have ${totals.warnings} ${pluralize('warning', totals.warnings)}.\n${ignored}`);
    }
    else {
        logger.info(green(`Woohoo! Your API ${pluralize('description is', definitionsCount)} valid. 🎉\n${ignored}`));
    }
    if (totals.errors > 0) {
        logger.info(gray(`run \`redocly lint --generate-ignore-file\` to add all problems to the ignore file.\n`));
    }
    logger.info('\n');
}
function miscellaneous_printConfigLintTotals(totals, command) {
    if (totals.errors > 0) {
        logger.error(`❌ Your config has ${totals.errors} ${pluralize('error', totals.errors)}.\n`);
    }
    else if (totals.warnings > 0) {
        logger.warn(`⚠️ Your config has ${totals.warnings} ${pluralize('warning', totals.warnings)}.\n`);
    }
    else if (command === 'check-config') {
        logger.info(green('✅  Your config is valid.\n'));
    }
}
function getOutputFileName({ entrypoint, output, argvOutput, ext, entries, }) {
    let outputFile = output || argvOutput;
    if (!outputFile) {
        return { ext: ext || 'yaml' };
    }
    if (entries > 1 && argvOutput) {
        ext = ext || extname(entrypoint).substring(1);
        if (!outputExtensions.includes(ext)) {
            throw new Error(`Invalid file extension: ${ext}.`);
        }
        outputFile = join(argvOutput, basename(entrypoint, extname(entrypoint))) + '.' + ext;
    }
    else {
        ext =
            ext ||
                extname(outputFile).substring(1) ||
                extname(entrypoint).substring(1);
        if (!outputExtensions.includes(ext)) {
            throw new Error(`Invalid file extension: ${ext}.`);
        }
        outputFile = join(dirname(outputFile), basename(outputFile, extname(outputFile))) + '.' + ext;
    }
    return { outputFile, ext };
}
function miscellaneous_printUnusedWarnings(config) {
    const { preprocessors, rules, decorators } = config.getUnusedRules();
    if (rules.length) {
        logger.warn(`[WARNING] Unused rules found in ${blue(config.configPath || '')}: ${rules.join(', ')}.\n`);
    }
    if (preprocessors.length) {
        logger.warn(`[WARNING] Unused preprocessors found in ${blue(config.configPath || '')}: ${preprocessors.join(', ')}.\n`);
    }
    if (decorators.length) {
        logger.warn(`[WARNING] Unused decorators found in ${blue(config.configPath || '')}: ${decorators.join(', ')}.\n`);
    }
    if (rules.length || preprocessors.length) {
        logger.warn(`Check the spelling and verify the added plugin prefix.\n`);
    }
}
async function loadConfigAndHandleErrors(argv, version) {
    try {
        const config = await loadConfig({
            configPath: argv.config,
            customExtends: argv.extends,
        });
        await handleLintConfig(argv, version, config);
        return config;
    }
    catch (e) {
        miscellaneous_handleError(e, '');
    }
}
function isAsync2Definition(doc) {
    return doc.asyncapi?.startsWith('2');
}
const oas2OrderedKeys = (/* unused pure expression or super */ null && ([
    'swagger',
    'info',
    'host',
    'basePath',
    'schemes',
    'consumes',
    'produces',
    'security',
    'tags',
    'externalDocs',
    'paths',
    'definitions',
    'parameters',
    'responses',
    'securityDefinitions',
]));
const oas3OrderedKeys = (/* unused pure expression or super */ null && ([
    'openapi',
    'info',
    'jsonSchemaDialect',
    'servers',
    'security',
    'tags',
    'externalDocs',
    'paths',
    'webhooks',
    'x-webhooks',
    'components',
]));
const asyncApi2OrderedKeys = (/* unused pure expression or super */ null && ([
    'asyncapi',
    'id',
    'info',
    'externalDocs',
    'tags',
    'defaultContentType',
    'servers',
    'channels',
    'components',
]));
const asyncApi3OrderedKeys = (/* unused pure expression or super */ null && ([
    'asyncapi',
    'info',
    'defaultContentType',
    'servers',
    'channels',
    'operations',
    'components',
]));
function sortTopLevelKeys(document) {
    if ('asyncapi' in document) {
        return isAsync2Definition(document)
            ? sortDocumentKeys(document, asyncApi2OrderedKeys)
            : sortDocumentKeys(document, asyncApi3OrderedKeys);
    }
    if ('swagger' in document) {
        return sortDocumentKeys(document, oas2OrderedKeys);
    }
    return sortDocumentKeys(document, oas3OrderedKeys);
}
function sortDocumentKeys(document, orderedKeys) {
    const result = {};
    for (const key of orderedKeys) {
        if (document.hasOwnProperty(key)) {
            result[key] = document[key];
        }
    }
    // merge any other top-level keys (e.g. vendor extensions)
    return Object.assign(result, document);
}
function miscellaneous_checkIfRulesetExist(rules) {
    const ruleset = {
        ...rules.oas2,
        ...rules.oas3_0,
        ...rules.oas3_1,
        ...rules.oas3_2,
        ...rules.async2,
        ...rules.async3,
        ...rules.arazzo1,
        ...rules.overlay1,
    };
    if (isEmptyObject(ruleset)) {
        exitWithError('⚠️ No rules were configured. Learn how to configure rules: https://redocly.com/docs/cli/rules/');
    }
}
function cleanColors(input) {
    // eslint-disable-next-line no-control-regex
    return input.replace(/\x1b\[\d+m/g, '');
}
function miscellaneous_formatPath(path) {
    if (isAbsoluteUrl(path)) {
        return path;
    }
    return relative(process.cwd(), path);
}
function capitalize(s) {
    if (s?.length > 0) {
        return s[0].toUpperCase() + s.slice(1);
    }
    return s;
}
//# sourceMappingURL=miscellaneous.js.map

/***/ }),

/***/ 3466:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "i8": () => (/* binding */ version)
/* harmony export */ });
/* unused harmony exports name, engines */
/* harmony import */ var node_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2033);

const packageJson = (0,node_module__WEBPACK_IMPORTED_MODULE_0__.createRequire)(import.meta.url ?? __dirname)('../../package.json');
const { version, name, engines } = packageJson;
//# sourceMappingURL=package.js.map

/***/ })

};
;
//# sourceMappingURL=719.index.js.map