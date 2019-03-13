// ############################################################################################################################
// The objects in this file apply only to running scripts, which don't have access to the FlowScript designer/compiler types by default.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Array.prototype.last = function () { return this[this.length - 1]; };
Array.prototype.first = function () { return this[0]; };
Array.prototype.append = function (items) { this.push.apply(this, items); return this; };
Array.prototype.select = function (func) { if (!func)
    return this; var _ = [], __; for (var i = 0; i < this.length; ++i)
    _[i] = func(this[i]); return _; };
Array.prototype.where = function (func) { if (!func)
    return this; var _ = [], __; for (var i = 0; i < this.length; ++i)
    if (func(__ = this[i]))
        _.push(__); return _; };
// ############################################################################################################################
/** The base namespace for all FlowScript types. */
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    FlowScript.undefined = void 0;
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
      * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
      */
    FlowScript.global = function () { }.constructor("return this")(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])
    // =======================================================================================================================
    /** A simple function that does nothing (no operation).
      * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
      * or when replacing the 'FlowScript.Loader.bootstrap()' function, which should only ever need to be called once.
      */
    function noop() { }
    FlowScript.noop = noop;
    /** If true (set by developer), then the web storage is cleared on each run.  Other implantation specific debug features may also become enabled.
    * If running in a browser, adding "debug=true" to the page's query string will also cause this value to become true.
    */
    FlowScript.debugging = (function () {
        if (!FlowScript.debugging && (FlowScript_debugging || typeof location == "object" && location.search && /[?&]debug=true/gi.test("" + location.search)))
            return true;
        else
            return FlowScript.debugging;
    })();
    // ========================================================================================================================
    var Pollyfills;
    (function (Pollyfills) {
        // -------------------------------------------------------------------------------------------------------------------
        var window = FlowScript.global;
        var String = FlowScript.global.String;
        var Array = FlowScript.global.Array;
        var RegExp = FlowScript.global.RegExp;
        // -------------------------------------------------------------------------------------------------------------------
        // ... add 'trim()' if missing, which only exists in more recent browser versions, such as IE 9+ ...
        // (source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FString%2FTrim)
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                if (!this)
                    throw new TypeError("'trim()' requires an object instance.");
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // ... fix head not accessible in IE7/8 ...
        if (!document.head)
            document.head = document.getElementsByTagName('head')[0] || {
                title: "", tagName: "HEAD", firstChild: null, lastChild: null, previousSibling: null, nextSibling: null, previousElementSibling: null, nextElementSibling: null, childNodes: [], children: []
            };
        // -------------------------------------------------------------------------------------------------------------------
        // ... add 'now()' if missing (exists as a standard in newer browsers) ...
        // (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
        if (!Date.now) { // (used internally for log item times)
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // ... fix the non-standard {string}.split() in older IE browsers, which strips out the empty strings ...
        // (this version accepts an optional third parameter, which is a list of already existing delimiters if available, which then ignores the 'separator' value [more efficient])
        if (":".split(/:/g).length == 0) {
            String.prototype['$__FlowScript_oldsplit'] = String.prototype.split; // (this is only executed once because of the ext line)
            String.prototype.split = function (separator, limit, delimiterList) {
                var delimiters, nonDelimiters;
                if (!this)
                    throw new TypeError("'split()' requires an object instance.");
                if (delimiterList)
                    delimiters = delimiterList;
                else if (!(separator instanceof RegExp))
                    return String.prototype['$__FlowScript_oldsplit'](separator, limit); // (old function works find for non-RegExp splits)
                else
                    delimiters = this.match(separator);
                nonDelimiters = [];
                // ... since empty spaces get removed, this has to be done manually by scanning across the text and matching the found delimiters ...
                var i, n, delimiter, startdi = 0, enddi = 0;
                if (delimiters) {
                    for (i = 0, n = delimiters.length; i < n; ++i) {
                        delimiter = delimiters[i];
                        enddi = this.indexOf(delimiter, startdi);
                        if (enddi == startdi)
                            nonDelimiters.push("");
                        else
                            nonDelimiters.push(this.substring(startdi, enddi));
                        startdi = enddi + delimiter.length;
                    }
                    if (startdi < this.length)
                        nonDelimiters.push(this.substring(startdi, this.length)); // (get any text past the last delimiter)
                    else
                        nonDelimiters.push(""); // (there must always by something after the last delimiter)
                }
                return nonDelimiters;
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // ... add support for the new "{Array}.indexOf/.lastIndexOf" standard ...
        // (base on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
        if (!Array.prototype.indexOf)
            Array.prototype['indexOf'] = function (searchElement, fromIndex) {
                if (!this)
                    throw new TypeError("'indexOf()' requires an object instance.");
                var i, length = this.length;
                if (!length)
                    return -1;
                if (typeof fromIndex === 'undefined')
                    fromIndex = 0;
                else {
                    fromIndex = +fromIndex; // ('+' converts any boolean or string to a number)
                    if (isNaN(fromIndex))
                        return -1;
                    if (fromIndex >= length)
                        fromIndex = length - 1;
                }
                if (fromIndex >= length)
                    return -1;
                if (fromIndex < 0)
                    fromIndex += length;
                for (i = fromIndex; i < length; ++i)
                    if (this[i] === searchElement)
                        return i;
                return -1;
            };
        // -------------------------------------------------------------------------------------------------------------------
        if (!Array.prototype.lastIndexOf)
            Array.prototype['lastIndexOf'] = function (searchElement, fromIndex) {
                if (!this)
                    throw new TypeError("'lastIndexOf()' requires an object instance.");
                var i, length = this.length;
                if (!length)
                    return -1;
                if (typeof fromIndex == 'undefined')
                    fromIndex = length - 1;
                else {
                    fromIndex = +fromIndex; // ('+' converts any boolean or string to a number)
                    if (isNaN(fromIndex))
                        return -1;
                    if (fromIndex >= length)
                        fromIndex = length - 1;
                }
                if (fromIndex < 0)
                    fromIndex += length;
                for (i = fromIndex; i >= 0; --i)
                    if (this[i] === searchElement)
                        return i;
                return -1;
            };
        // -------------------------------------------------------------------------------------------------------------------
        // ... add any missing support for "window.location.origin" ...
        if (typeof window.location !== 'undefined' && !window.location.origin)
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        // -------------------------------------------------------------------------------------------------------------------
        // ... add basic support for 'classList' on elements if missing ...
        if (typeof Element !== 'undefined' && !("classList" in document.createElement("_"))) { //TODO: Needs testing.
            (function () {
                var names = null; // (if 'names' is null, it is updated, and if not, use existing values [more efficient])
                Element.prototype['classList'] = {
                    contains: function (name) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        var exists = names.indexOf(name) >= 0;
                        if (namesUpdated)
                            names = null;
                        return exists;
                    },
                    add: function (name) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        if (names.indexOf(name) < 0)
                            this.className += ' ' + name;
                        if (namesUpdated)
                            names = null;
                    },
                    remove: function (name) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        var i = names.indexOf(name);
                        if (i >= 0) {
                            names.splice(i);
                            this.className = names.join(' ');
                        }
                        if (namesUpdated)
                            names = null;
                    },
                    toggle: function (name, force) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        var exists = this.contains(name);
                        if (typeof force === 'undefined')
                            force = !exists;
                        if (exists) {
                            // ... exists, so remove it ...
                            if (!force) // If force is set to true, the class will be added but not removed.
                                this.remove(name);
                        }
                        else {
                            // ... missing, so add it ...
                            if (force) // If it’s false, the opposite will happen — the class will be removed but not added.
                                this.add(name);
                        }
                        if (namesUpdated)
                            names = null;
                        return !exists;
                    },
                    toString: function () {
                        return this.className;
                    }
                };
            })();
        }
        ;
        // -------------------------------------------------------------------------------------------------------------------
        // ... add support for "Object.create" if missing ...
        if (typeof Object.create != 'function') {
            (function () {
                var _ = function () { };
                Object.create = function (proto, propertiesObject) {
                    if (propertiesObject !== void 0) {
                        throw Error("'propertiesObject' parameter not supported.");
                    }
                    if (proto === null) {
                        throw Error("'proto' [prototype] parameter cannot be null.");
                    }
                    if (typeof proto != 'object') {
                        throw TypeError("'proto' [prototype] must be an object.");
                    }
                    _.prototype = proto;
                    return new _();
                };
            })();
        }
        // -------------------------------------------------------------------------------------------------------------------
        if (typeof Array.isArray != 'function') // Performance investigations: http://jsperf.com/array-isarray-vs-instanceof-array/5
            Array.isArray = function (arg) { return typeof arg == 'object' && arg instanceof Array; };
        // -------------------------------------------------------------------------------------------------------------------
        // (Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }
                var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { }, fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
                if (this.prototype) {
                    // native functions don't have a prototype
                    fNOP.prototype = this.prototype;
                }
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
    })(Pollyfills || (Pollyfills = {}));
    // =======================================================================================================================
    var Environments;
    (function (Environments) {
        /** Represents the FlowScript client core environment. */
        Environments[Environments["Browser"] = 0] = "Browser";
        /** Represents the FlowScript worker environment (where applications and certain modules reside). */
        Environments[Environments["Worker"] = 1] = "Worker";
        /** Represents the FlowScript server environment. */
        Environments[Environments["Server"] = 2] = "Server";
    })(Environments = FlowScript.Environments || (FlowScript.Environments = {}));
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of iNet OS runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    FlowScript.Environment = (function () {
        if (typeof navigator !== 'object') {
            // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
            window = {};
            window.document = { title: "SERVER" };
            navigator = { userAgent: "Mozilla/5.0 (FlowScript) like Gecko" };
            location = {
                hash: "",
                host: "flowscript.com",
                hostname: "flowscript.com",
                href: "https://flowscript.com/",
                origin: "https://flowscript.com",
                pathname: "/",
                port: "",
                protocol: "https:"
            };
            return Environments.Server;
        }
        else if (typeof window == 'object' && window.document)
            return Environments.Browser;
        else
            return Environments.Worker;
    })();
    // =======================================================================================================================
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    var Browser;
    (function (Browser) {
        // ------------------------------------------------------------------------------------------------------------------
        // (Browser detection is a highly modified version of "http://www.quirksmode.org/js/detect.html".)
        // (Note: This is only required for quirk detection in special circumstances [such as IE's native JSON whitespace parsing issue], and not for object feature support)
        /** A list of browsers that can be currently detected. */
        var BrowserTypes;
        (function (BrowserTypes) {
            /** Browser is not yet detected, or detection failed. */
            BrowserTypes[BrowserTypes["Unknown"] = 0] = "Unknown";
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            BrowserTypes[BrowserTypes["None"] = -1] = "None";
            BrowserTypes[BrowserTypes["IE"] = 1] = "IE";
            BrowserTypes[BrowserTypes["Chrome"] = 2] = "Chrome";
            BrowserTypes[BrowserTypes["FireFox"] = 3] = "FireFox";
            BrowserTypes[BrowserTypes["Safari"] = 4] = "Safari";
            BrowserTypes[BrowserTypes["Opera"] = 5] = "Opera";
            BrowserTypes[BrowserTypes["Netscape"] = 6] = "Netscape";
            BrowserTypes[BrowserTypes["OmniWeb"] = 7] = "OmniWeb";
            BrowserTypes[BrowserTypes["iCab"] = 8] = "iCab";
            BrowserTypes[BrowserTypes["Konqueror"] = 9] = "Konqueror";
            BrowserTypes[BrowserTypes["Camino"] = 10] = "Camino";
        })(BrowserTypes = Browser.BrowserTypes || (Browser.BrowserTypes = {}));
        /** A list of operating systems that can be currently detected. */
        var OperatingSystems;
        (function (OperatingSystems) {
            /** OS is not yet detected, or detection failed. */
            OperatingSystems[OperatingSystems["Unknown"] = 0] = "Unknown";
            OperatingSystems[OperatingSystems["Windows"] = 1] = "Windows";
            OperatingSystems[OperatingSystems["Mac"] = 2] = "Mac";
            OperatingSystems[OperatingSystems["Linux"] = 3] = "Linux";
            OperatingSystems[OperatingSystems["iOS"] = 4] = "iOS";
        })(OperatingSystems = Browser.OperatingSystems || (Browser.OperatingSystems = {}));
        var __browserList = (function () {
            var list = [];
            list[BrowserTypes.Chrome] =
                {
                    name: "Chrome", vendor: "Google", identity: BrowserTypes.Chrome,
                    versions: [{ nameTag: null, versionPrefix: null }] // (list of browser versions; string values default to the browser name if null)
                };
            list[BrowserTypes.OmniWeb] =
                {
                    name: "OmniWeb", vendor: "The Omni Group", identity: BrowserTypes.OmniWeb,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Safari] =
                {
                    name: "Safari", vendor: "Apple", identity: BrowserTypes.Safari,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            list[BrowserTypes.Opera] =
                {
                    name: "Opera", vendor: "Opera Mediaworks", identity: BrowserTypes.Opera,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            if (window.opera)
                Browser.browserVersionInfo = __browserList[BrowserTypes.Opera].versions[0];
            list[BrowserTypes.iCab] =
                {
                    name: "iCab", vendor: "Alexander Clauss", identity: BrowserTypes.iCab,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Konqueror] =
                {
                    name: "Konqueror", vendor: "KDE e.V.", identity: BrowserTypes.Konqueror,
                    versions: [{ nameTag: "KDE", versionPrefix: "Konqueror" }]
                };
            list[BrowserTypes.FireFox] =
                {
                    name: "Firefox", vendor: "Mozilla Foundation", identity: BrowserTypes.FireFox,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Camino] =
                {
                    name: "Camino", vendor: "", identity: BrowserTypes.Camino,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Netscape] =
                {
                    name: "Netscape", vendor: "AOL", identity: BrowserTypes.Netscape,
                    versions: [
                        { nameTag: null, versionPrefix: null },
                        { nameTag: "Mozilla", versionPrefix: "Mozilla", vendor: "Netscape Communications (now AOL)" } // for older Netscapes (4-)
                    ]
                };
            list[BrowserTypes.IE] =
                {
                    name: "Internet Explorer", vendor: "Microsoft", identity: BrowserTypes.IE,
                    versions: [{ nameTag: "MSIE", versionPrefix: "MSIE " }]
                };
            // ... connect the parents and return the static list ...
            for (var i = list.length - 1; i >= 0; --i)
                if (list[i] && list[i].versions)
                    for (var i2 = list[i].versions.length - 1; i2 >= 0; --i2)
                        if (list[i].versions[i2])
                            list[i].versions[i2].parent = list[i];
            return list;
        })();
        var __osList = [
            {
                name: "iPhone",
                identity: OperatingSystems.iOS
            },
            {
                name: "Linux",
                identity: OperatingSystems.Linux
            },
            {
                name: "Win",
                identity: OperatingSystems.Windows
            },
            {
                name: "Mac",
                identity: OperatingSystems.Mac
            }
        ];
        /** Holds a reference to the agent data detected regarding browser name and versions. */
        Browser.browserVersionInfo = null;
        /** Holds a reference to the agent data detected regarding the host operating system. */
        Browser.osInfo = null;
        var __findBrowser = function () {
            var agent = navigator.vendor + "," + navigator.userAgent, bInfo, version, versionPrefix;
            for (var i = 0, n = __browserList.length; i < n; ++i) {
                bInfo = __browserList[i];
                if (bInfo)
                    for (var i2 = 0, n2 = bInfo.versions.length; i2 < n2; ++i2) {
                        version = bInfo.versions[i2];
                        versionPrefix = version.versionPrefix || (bInfo.name + '/');
                        if (version && agent.indexOf(version.nameTag || bInfo.name) != -1 && agent.indexOf(versionPrefix) != -1)
                            return version;
                    }
            }
            return null;
        };
        var __findOS = function () {
            var osStrData = navigator.platform || navigator.userAgent;
            for (var i = 0, n = __osList.length; i < n; ++i)
                if (osStrData.indexOf(__osList[i].name) != -1)
                    return __osList[i];
        };
        var __detectVersion = function (versionInfo) {
            var versionStr = navigator.userAgent + " / " + navigator.appVersion;
            var versionPrefix = versionInfo.versionPrefix || (versionInfo.parent.name + "/");
            var index = versionStr.indexOf(versionPrefix);
            if (index == -1)
                return -1;
            return parseFloat(versionStr.substring(index + versionPrefix.length));
        };
        /** The name of the detected browser. */
        Browser.name = "";
        /** The browser's vendor. */
        Browser.vendor = "";
        /** The operating system detected. */
        Browser.os = OperatingSystems.Unknown;
        /** The browser version detected. */
        Browser.version = -1;
        /** The type of browser detected. */
        Browser.type = (function () {
            var browserType = BrowserTypes.Unknown, browserInfo;
            if (FlowScript.Environment == Environments.Browser) {
                if (!Browser.browserVersionInfo)
                    Browser.browserVersionInfo = __findBrowser();
                browserInfo = Browser.browserVersionInfo.parent;
                Browser.osInfo = __findOS();
                browserType = browserInfo.identity;
                Browser.name = browserInfo.name;
                Browser.vendor = Browser.browserVersionInfo.vendor || Browser.browserVersionInfo.parent.vendor;
                browserType = browserInfo != null ? browserInfo.identity : BrowserTypes.Unknown;
                Browser.version = __detectVersion(Browser.browserVersionInfo);
                Browser.os = Browser.osInfo != null ? Browser.osInfo.identity : OperatingSystems.Unknown;
            }
            else
                browserType = BrowserTypes.None;
            return browserType;
        })();
        // ------------------------------------------------------------------------------------------------------------------
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize() {
            var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth || g.clientWidth, y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }
        Browser.getViewportSize = getViewportSize;
        // ------------------------------------------------------------------------------------------------------------------
        /**
         * Browser benchmarking for various speed tests. The test uses the high-performance clock system, which exists in most modern browsers.
         * The result is returned in milliseconds.
         * @param init The "setup" code, which is only run once.
         * @param code The code to run a test on.
         * @param trialCount The number of times to run the whole test ('init' together with 'code' loops).  The default is 100. The average time of all tests are returned.
         * @param count The number of loops to run the test code in ('code' only, and not the 'init' code). The default is 100,000,000.
         */
        function testSpeed(init, code, trialCount, count) {
            if (trialCount === void 0) { trialCount = 100; }
            if (count === void 0) { count = 100000000; }
            count = +count || 0;
            trialCount = +trialCount || 0;
            if (code && count && trialCount) {
                var func = new Function(init + ";\r\n"
                    + "var $__fs_t0 = performance.now();\r\n"
                    + "for (var $__fs_i = 0; $__fs_i < " + count + "; $__fs_i++) {\r\n" + code + ";\r\n}\r\n"
                    + "var $__fs_t1 = performance.now();\r\n"
                    + " return $__fs_t1 - $__fs_t0;\r\n");
                console.log(func);
                var totalTime = 0;
                for (var i = 0; i < trialCount; ++i)
                    totalTime += func();
                var elapsed = totalTime / trialCount;
                console.log("Took: " + elapsed + "ms");
            }
            return elapsed || 0;
        }
        // ------------------------------------------------------------------------------------------------------------------
    })(Browser = FlowScript.Browser || (FlowScript.Browser = {}));
    // =======================================================================================================================
    /** Used with 'FlowScript.log(...)' to write to the host console, if available. */
    var LogMessageTypes;
    (function (LogMessageTypes) {
        LogMessageTypes[LogMessageTypes["Message"] = 0] = "Message";
        LogMessageTypes[LogMessageTypes["Info"] = 1] = "Info";
        LogMessageTypes[LogMessageTypes["Warning"] = 2] = "Warning";
        LogMessageTypes[LogMessageTypes["Error"] = 3] = "Error";
        LogMessageTypes[LogMessageTypes["Debug"] = 4] = "Debug";
        LogMessageTypes[LogMessageTypes["Trace"] = 5] = "Trace";
    })(LogMessageTypes = FlowScript.LogMessageTypes || (FlowScript.LogMessageTypes = {}));
    /** Logs the message to the console (if available) and returns it. */
    function log(msg, msgType, throwOnError) {
        if (msgType === void 0) { msgType = LogMessageTypes.Message; }
        if (throwOnError === void 0) { throwOnError = true; }
        msg = '' + msg;
        if (console)
            switch (msgType) {
                case LogMessageTypes.Message:
                    console.log(msg);
                    break;
                case LogMessageTypes.Info:
                    (console.info || console.log).call(console, msg);
                    break;
                case LogMessageTypes.Warning:
                    (console.warn || console.info || console.log).call(console, msg);
                    break;
                case LogMessageTypes.Error:
                    (console.error || console.warn || console.info || console.log).call(console, msg);
                    throw msg;
                case LogMessageTypes.Debug:
                    (console.debug || console.info || console.log).call(console, msg);
                    break;
                case LogMessageTypes.Trace:
                    (console.trace || console.info || console.log).call(console, msg);
                    break;
            }
        return msg;
    }
    FlowScript.log = log;
    /** A simple class used make working with the script easier during runtime. */
    var RuntimeScript = /** @class */ (function () {
        function RuntimeScript(properties) {
            /** Holds global variables. */
            this.globals = {};
            for (var p in properties)
                this[p] = properties[p];
        }
        /** Returns a namespace object based on the safe full type path. */
        RuntimeScript.prototype.getType = function (safeFullTypePath) {
            return Utilities.dereferencePropertyPath(safeFullTypePath, this.types, true);
        };
        return RuntimeScript;
    }());
    FlowScript.RuntimeScript = RuntimeScript;
    /** Each component call gets a dedicated context, or loads one from a pool.  A context contains the input and output
      * properties.  Local vars that are not parameters are persistent, so data can be retained between calls if needed.
      */
    var RuntimeContext = /** @class */ (function () {
        function RuntimeContext(previous) {
            this.arguments = {};
            this.previous = previous || null;
            this.next = null;
        }
        RuntimeContext.prototype.getNextContext = function (compFunc, callerArgCount) {
            var ctx = compFunc.context;
            if (!ctx.next)
                ctx.next = new RuntimeContext(ctx);
            ctx = ctx.next;
            if (compFunc.parameterNames)
                for (var i = 0, n = compFunc.parameterNames.length; i < n || i < callerArgCount; ++i)
                    if (i < n)
                        ctx.arguments[i] = compFunc.parameterNames[i];
                    else
                        ctx.arguments[i] = '@' + i;
            return ctx;
        };
        /** Sets argument values based on the properties of the supplied object.
          * If the source object has numerical indexes, then the corresponding context property name for that index will be updated.
          */
        RuntimeContext.prototype.setArguments = function (source) {
            for (var p in source)
                if (source.hasOwnProperty(p)) {
                    var c = p[0];
                    if (c >= '0' && c <= '9') {
                        var index = +p;
                        if (index >= this.argumentLength)
                            this.argumentLength = index + 1;
                        var ctxArgName = this.arguments[index];
                        if (!ctxArgName)
                            this.arguments[index] = ctxArgName = "@" + p; // (if there is no declared name for an index, then create a default one)
                        this.arguments[ctxArgName] = source[p];
                    }
                    else
                        this.arguments[p] = source[p];
                }
        };
        /** Resets the current context arguments and any error state to 'undefined'. */
        RuntimeContext.prototype.reset = function () {
            for (var p in this.arguments)
                this.arguments[p] = void 0;
            this.argumentLength = 0;
            this.error = void 0;
            return this;
        };
        return RuntimeContext;
    }());
    FlowScript.RuntimeContext = RuntimeContext;
    // ========================================================================================================================
    var Utilities;
    (function (Utilities) {
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        var _hostChecksum = (function () {
            if (typeof navigator == 'undefined' || !navigator.userAgent || typeof location == 'undefined' || !location.href)
                throw "System load error: 'navigator.userAgent' and 'location.href' are undefined in this environment for GUIDs. On server sides, these should each be fixed to some value.";
            var text = navigator.userAgent + location.href; // TODO: This may need implementing on the server side.
            for (var i = 0, n = text.length, randseed = 0; i < n; ++i)
                randseed += navigator.userAgent.charCodeAt(i);
            return randseed;
        })();
        var _guidCounter = 0;
        var _timeZoneOffset = new Date().getTimezoneOffset() * (60 * 1000); // (convert minutes to milliseconds)
        /** Creates and returns a new version-4 (randomized) GUID/UUID (globally unique identifier). The uniqueness of the
          * result is enforced by locking the first part down to the current local date/time (not UTC) in milliseconds, along
          * with a counter value in case of fast repetitive calls. The rest of the ID is also randomized with the current local
          * time, along with a checksum of the browser's "agent" string and the current document URL.
          * This function is also supported server side; however, the "agent" string and document location are fixed values.
          * @param hyphens (boolean) Default is true, which adds hyphens.
          */
        function createGUID(hyphens) {
            if (hyphens === void 0) { hyphens = true; }
            var zoneTime = (Date.now ? Date.now() : new Date().getTime()) + _timeZoneOffset; // (use current local time [not UTC] to offset the random number [there was a bug in Chrome, not sure if it was fixed yet])
            var randseed = zoneTime + _hostChecksum;
            var hexTimeAndCounter = zoneTime.toString(16) + (_guidCounter <= 0xffffffff ? _guidCounter++ : _guidCounter = 0).toString(16), i = hexTimeAndCounter.length, pi = 0;
            var pattern = hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx', len = pattern.length, result = "", c, r;
            while (pi < len)
                c = pattern[pi++], result += c != 'x' && c != 'y' ? c : i > 0 ? hexTimeAndCounter[--i] : (r = Math.random() * randseed % 16 | 0, c == 'x' ? r : r & 0x3 | 0x8).toString(16);
            return result;
        }
        Utilities.createGUID = createGUID;
        // -------------------------------------------------------------------------------------------------------------------
        /** Dereferences a property path in the form "A.B.C[*].D..." and returns the right most property value, if exists, otherwise
        * 'undefined' is returned.  If path is invalid, an exception will be thrown.
        * @param {string} path The delimited property path to parse.
        * @param {object} origin The object to begin dereferencing with.  If this is null or undefined then it defaults to the global scope.
        * @param {boolean} unsafe If false (default) a fast algorithm is used to parse the path.  If true, then the expression is evaluated at the host global scope (faster).
        *                         The reason for the option is that 'eval' is up to 4x faster, and is best used only if the path is guaranteed not to contain user entered
        *                         values, or ANY text transmitted insecurely.
        *                         Note: The 'eval' used is 'FlowScript.eval()', which is closed over the global scope (and not the FlowScript module's private scope).
        *                         'window.eval()' is not called directly in this function.
        */
        function dereferencePropertyPath(path, origin, unsafe) {
            if (unsafe === void 0) { unsafe = false; }
            if (unsafe)
                return safeEval('p1.' + path, origin); // (note: this is 'FlowScript.eval()', not a direct call to the global 'eval()')
            if (origin === void 0 || origin === null)
                origin = this !== FlowScript.global ? this : FlowScript.global;
            if (typeof path !== 'string')
                path = '' + path;
            var o = origin, c = '', pc, i = 0, n = path.length, name = '';
            if (n)
                ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0)
                    ? (name ? (o = o[name], name = '') : (pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c)
                    : name += c;
            if (i == n + 2)
                throw "Invalid path: " + path;
            return o;
        } // (performance: http://jsperf.com/ways-to-dereference-a-delimited-property-string)
        Utilities.dereferencePropertyPath = dereferencePropertyPath;
        // -------------------------------------------------------------------------------------------------------------------
        /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
        * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
        * @param {Function} func The function to call '.apply()' on.
        * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
        * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
        * @param {any} args The arguments to apply to given function reference (the 'func' argument).
        */
        function apply(func, _this, args) {
            if (func.apply) {
                return func.apply(_this, args);
            }
            else {
                return Function.prototype.apply.apply(func, [_this, args]);
            }
        }
        Utilities.apply = apply;
        // -------------------------------------------------------------------------------------------------------------------
        /** Erases all properties on the object, instead of deleting them (which takes longer).
        * @param {boolean} release If false, then care is taken not to erase any property that contains a 'dispose()' function. (default: true)
        *                          This is provided to support reconstructing nested object groups without needing to rebuild the associations.
        */
        function erase(obj, release) {
            if (release === void 0) { release = true; }
            for (var p in obj)
                if ((p != "__proto__" && p != 'constructor' && obj).hasOwnProperty(p))
                    if (release || p == 'dispose' && typeof obj[p] != 'function')
                        obj[p] = void 0;
            return obj;
        }
        Utilities.erase = erase;
        // -------------------------------------------------------------------------------------------------------------------
        /** Replaces one string with another in a given string.
        * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
        * faster in Chrome, and RegEx based 'replace()' in others.
        */
        function replace(source, replaceWhat, replaceWith, ignoreCase) {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string')
                source = "" + source;
            if (typeof replaceWhat !== 'string')
                replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string')
                replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(Utilities.RegEx.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else if (Browser.type == Browser.BrowserTypes.Chrome)
                return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
            else
                return source.replace(new RegExp(Utilities.RegEx.escapeRegex(replaceWhat), 'g'), replaceWith);
        }
        Utilities.replace = replace;
        // -------------------------------------------------------------------------------------------------------------------
        /** Replaces all tags in the given 'html' string with 'tagReplacement' (an empty string by default) and returns the result. */
        function replaceTags(html, tagReplacement) {
            return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
        }
        Utilities.replaceTags = replaceTags;
        // -------------------------------------------------------------------------------------------------------------------
        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
        * specified fixed length, then the request is ignored, and the given string is returned.
        * @param {any} str The string to pad.
        * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
        * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
        * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
        */
        function pad(str, fixedLength, leftPadChar, rightPadChar) {
            if (str === void 0)
                str = "";
            if (leftPadChar === void 0 || leftPadChar === null)
                leftPadChar = "";
            if (rightPadChar === void 0 || rightPadChar === null)
                rightPadChar = "";
            var s = "" + str, targetLength = fixedLength || 0, remainder = targetLength - s.length, lchar = "" + leftPadChar, rchar = "" + rightPadChar, i, n, llen, rlen, lpad = "", rpad = "";
            if (remainder == 0 || (!lchar && !rchar))
                return str;
            if (lchar && rchar) {
                llen = Math.floor(remainder / 2);
                rlen = targetLength - llen;
            }
            else if (lchar)
                llen = remainder;
            else if (rchar)
                rlen = remainder;
            for (i = 0; i < llen; ++i)
                lpad += lchar;
            for (i = 0; i < rlen; ++i)
                rpad += rchar;
            return lpad + s + rpad;
        }
        Utilities.pad = pad;
        // -------------------------------------------------------------------------------------------------------------------
        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
        * Note: If any argument is not a string, the value is converted into a string.
        */
        function append(source, suffix, delimiter) {
            if (source === void 0)
                source = "";
            else if (typeof source != 'string')
                source = '' + source;
            if (typeof suffix != 'string')
                suffix = '' + suffix;
            if (typeof delimiter != 'string')
                delimiter = '' + delimiter;
            if (!source)
                return suffix;
            return source + delimiter + suffix;
        }
        Utilities.append = append;
        // -------------------------------------------------------------------------------------------------------------------
        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
        * Note: If any argument is not a string, the value is converted into a string.
        */
        function prepend(source, prefix, delimiter) {
            if (source === void 0)
                source = "";
            else if (typeof source != 'string')
                source = '' + source;
            if (typeof prefix != 'string')
                prefix = '' + prefix;
            if (typeof delimiter != 'string')
                delimiter = '' + delimiter;
            if (!source)
                return prefix;
            return prefix + delimiter + source;
        }
        Utilities.prepend = prepend;
        // -------------------------------------------------------------------------------------------------------------------
        Utilities.FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])
        /** Attempts to pull the function name from the function reference, and returns 'undefined' (void 0) for anonymous functions. */
        function getFunctionName(func) {
            if (typeof func != 'function')
                throw "'func' argument is not a valid function object reference.";
            var name = func['$__fs_funcname'];
            if (name == void 0) {
                var fstr = func.toString();
                var results = Utilities.FUNC_NAME_REGEX.exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                name = (results && results.length > 1) ? results[1] : void 0;
                func['$__fs_funcname'] = name;
            }
            return name;
        }
        Utilities.getFunctionName = getFunctionName;
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        var RegEx;
        (function (RegEx) {
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
            function escapeRegex(regExStr) {
                return regExStr.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1"); // TODO: Verify completeness.
            }
            RegEx.escapeRegex = escapeRegex;
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
        })(RegEx = Utilities.RegEx || (Utilities.RegEx = {}));
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        var Encoding;
        (function (Encoding) {
            var Base64Modes;
            (function (Base64Modes) {
                /** Use standard Base64 encoding characters. */
                Base64Modes[Base64Modes["Standard"] = 0] = "Standard";
                /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
                Base64Modes[Base64Modes["URI"] = 1] = "URI";
                /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
                * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
                */
                Base64Modes[Base64Modes["Custom"] = 2] = "Custom";
            })(Base64Modes = Encoding.Base64Modes || (Encoding.Base64Modes = {}));
            ;
            Encoding.__64BASE_ENCODING_CHARS_STANDARD = String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
            Encoding.__64BASE_ENCODING_CHARS_URI = String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D"); // (note: %3D is treaded as one char [an % encoded '='])
            Encoding.__64BASE_ENCODING_CHARS_CUSTOM = Encoding.__64BASE_ENCODING_CHARS_STANDARD;
            // (Note: There must be exactly 65 characters [64 + 1 for padding])
            // (Note: 'String' objects MUST be used in order for the encoding functions to populate the reverse lookup indexes)
            function __CreateCharIndex(str) {
                if (str.length < 65)
                    throw "65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " are specified.";
                if (typeof str !== "object" || !(str instanceof String))
                    throw "The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).";
                if (!str['charIndex']) {
                    var index = {};
                    for (var i = 0, n = str.length; i < n; ++i)
                        index[str[i]] = i;
                    str['charIndex'] = index;
                }
            }
            /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
            * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
            * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
            * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
            * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
            *                             Exception: If the mode is URI encoding, then padding is false by default.
            */
            function base64Encode(value, mode, usePadding) {
                if (mode === void 0) { mode = Base64Modes.Standard; }
                if (value === void 0 || value === null)
                    value = "";
                else
                    value = "" + value;
                if (value.length == 0)
                    return "";
                if (usePadding === void 0)
                    usePadding = (mode != Base64Modes.URI);
                var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
                // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...
                if (!encodingChars['charIndex'])
                    __CreateCharIndex(encodingChars);
                // ... determine the character bit depth ...
                var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
                for (var i = value.length - 1; i >= 0; --i)
                    if (value.charCodeAt(i) > 255) {
                        srcCharBitDepth = 16; // (Unicode mode [16-bit])
                        value = String.fromCharCode(0) + value; // (note: 0 is usually understood to be a null character, and is used here to flag Unicode encoding [two 0 bytes at the beginning])
                        break;
                    }
                var shiftCount = srcCharBitDepth - 1;
                var bitClearMask = (1 << shiftCount) - 1;
                // ... encode the values as a virtual stream of bits, from one buffer to another ...
                var readIndex = 0, readBitIndex = srcCharBitDepth;
                var writeBitIndex = 0;
                var code, bit, baseCode = 0;
                var result = "";
                var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
                if (paddingLength == 3)
                    paddingLength = 0;
                while (true) {
                    if (readBitIndex == srcCharBitDepth) {
                        if (readIndex >= value.length) {
                            // ... finished ...
                            if (writeBitIndex > 0) // (this will be 0 for strings evenly divisible by 3)
                                result += encodingChars.charAt(baseCode << (6 - writeBitIndex)); // (set remaining code [shift left to fill zeros as per spec])
                            if (usePadding && paddingLength) {
                                var paddingChar = encodingChars.substring(64);
                                while (paddingLength--)
                                    result += paddingChar;
                            }
                            break;
                        }
                        readBitIndex = 0;
                        code = value.charCodeAt(readIndex++);
                    }
                    bit = code >> shiftCount;
                    code = (code & bitClearMask) << 1;
                    ++readBitIndex;
                    baseCode = (baseCode << 1) | bit;
                    ++writeBitIndex;
                    if (writeBitIndex == 6) {
                        writeBitIndex = 0;
                        result += encodingChars.charAt(baseCode);
                        baseCode = 0;
                    }
                }
                return result;
            }
            Encoding.base64Encode = base64Encode;
            /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
            * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
            * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
            * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
            */
            function base64Decode(value, mode) {
                if (mode === void 0) { mode = Base64Modes.Standard; }
                if (value === void 0 || value === null)
                    value = "";
                else
                    value = "" + value;
                if (value.length == 0)
                    return "";
                var encodingChars = (mode == Base64Modes.Standard ? Encoding.__64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? Encoding.__64BASE_ENCODING_CHARS_URI : Encoding.__64BASE_ENCODING_CHARS_CUSTOM));
                // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...
                if (!encodingChars['charIndex'])
                    __CreateCharIndex(encodingChars);
                // ... determine the character bit depth ...
                var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
                if (value.charAt(0) == 'A') // (normal ASCII encoded characters will never start with "A" (a 'null' character), so this serves as the Unicode flag)
                    srcCharBitDepth = 16;
                var shiftCount = srcCharBitDepth - 1;
                var bitClearMask = (1 << shiftCount) - 1;
                // ... remove the padding characters (not required) ...
                var paddingChar = encodingChars.substring(64);
                while (value.substring(value.length - paddingChar.length) == paddingChar)
                    value = value.substring(0, value.length - paddingChar.length);
                var resultLength = Math.floor((value.length * 6) / 8) / (srcCharBitDepth / 8); // (Base64 produces 4 characters for every 3 input bytes)
                // (note: resultLength includes the null char)
                // ... decode the values as a virtual stream of bits, from one buffer to another ...
                var readIndex = 0, readBitIndex = 6;
                var writeBitIndex = 0;
                var code, bit, baseCode = 0;
                var result = "";
                var charCount = 0;
                while (true) {
                    if (readBitIndex == 6) {
                        readBitIndex = 0;
                        code = readIndex < value.length ? encodingChars['charIndex'][value.charAt(readIndex++)] : 0;
                        if (code === void 0)
                            throw "The value '" + value + "' has one or more invalid characters.  Valid characters for the specified encoding mode '" + Base64Modes[mode] + "' are: '" + encodingChars + "'";
                    }
                    bit = code >> 5; // (read left most bit; base64 values are always 6 bit)
                    code = (code & 31) << 1; // (clear left most bit and shift left)
                    ++readBitIndex;
                    baseCode = (baseCode << 1) | bit;
                    ++writeBitIndex;
                    if (writeBitIndex == srcCharBitDepth) {
                        writeBitIndex = 0;
                        if (baseCode) // (should never be 0 [null char])
                            result += String.fromCharCode(baseCode);
                        if (++charCount >= resultLength)
                            break; // (all expected characters written)
                        baseCode = 0;
                    }
                }
                return result;
            }
            Encoding.base64Decode = base64Decode;
        })(Encoding = Utilities.Encoding || (Utilities.Encoding = {}));
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        var HTML;
        (function (HTML) {
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            // Removes the '<!-- -->' comment sequence from the the ends of the specified HTML.
            function uncommentHTML(html) {
                var content = ("" + html).trim();
                var i1 = 0, i2 = content.length;
                if (content.substring(0, 4) == "<!--")
                    i1 = 4;
                if (content.substr(content.length - 3) == "-->")
                    i2 -= 3;
                if (i1 > 0 || i2 < content.length)
                    content = content.substring(i1, i2);
                return content;
            }
            HTML.uncommentHTML = uncommentHTML;
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
            function getCommentText(html) {
                var content = ("" + html).trim();
                var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
                if (i1 < 0)
                    i1 = 0;
                if (i2 < 0)
                    i2 = content.length;
                return content.substring(i1, i2);
            }
            HTML.getCommentText = getCommentText;
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
            function getScriptCommentText(html) {
                var content = ("" + html).trim();
                var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
                if (i1 < 0)
                    i1 = 0;
                if (i2 < 0)
                    i2 = content.length;
                return content.substring(i1, i2);
            }
            HTML.getScriptCommentText = getScriptCommentText;
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            function clearChildNodes(node) {
                if (node)
                    while (node.firstChild)
                        node.removeChild(node.firstChild);
                return node;
            }
            HTML.clearChildNodes = clearChildNodes;
        })(HTML = Utilities.HTML || (Utilities.HTML = {}));
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        var nativeJSON = typeof window != 'undefined' ? window.JSON : void 0;
        var Data;
        (function (Data) {
            var JSON;
            (function (JSON) {
                /** Converts a JSON string into an object, with nested objects as required.
                  * The JSON format is validated first before conversion.
                  */
                function parse(jsonText) {
                    if (typeof jsonText !== "string" || !jsonText)
                        return null;
                    // ... some browsers (IE) may not be able to handle the whitespace before or after the text ...
                    jsonText = jsonText.trim();
                    // ... validate the JSON format ...
                    // (Note: regex is from "https://github.com/douglascrockford/JSON-js/blob/master/json2.js" [by Douglas Crockford])
                    if (/^[\],:{}\s]*$/.test(jsonText.replace(/\\["\\\/bfnrtu]/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                        // Try to use the native JSON parser first
                        return nativeJSON && nativeJSON.parse ? nativeJSON.parse(jsonText) : (new Function("return " + jsonText))();
                    }
                    else {
                        log('Invalid JSON: "' + jsonText + '"', LogMessageTypes.Error);
                        return {};
                    }
                }
                JSON.parse = parse;
                function stringify(data) {
                    if (nativeJSON == void 0)
                        throw "Sorry, JSON is not supported in this environment. You could try to pollyfill it (see modernizr.com) and try again.";
                    return nativeJSON.stringify(data);
                }
                JSON.stringify = stringify;
            })(JSON = Data.JSON || (Data.JSON = {}));
        })(Data = Utilities.Data || (Utilities.Data = {}));
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
    })(Utilities = FlowScript.Utilities || (FlowScript.Utilities = {}));
    // ========================================================================================================================
    /** Network communication utilities. */
    var Net;
    (function (Net) {
        /** Represents an HTTP request object.  The design is (very loosely) made similar to "promise" semantics, and as such,
          * the member function calls can be chained.
          */
        var HTTPRequest = /** @class */ (function () {
            function HTTPRequest(url, payload, 
            /** HTTP send method. (ex: 'GET', 'POST', 'PUT', 'DELETE', etc.) */ method, 
            /** Expected response type. (ex: 'json', 'text' [or '', defaults to text], 'blob', 'document', 'arrayBuffer', etc.) */ responseType) {
                if (method === void 0) { method = "GET"; }
                if (responseType === void 0) { responseType = "json"; }
                var _this_1 = this;
                this.url = url;
                this.method = method;
                this.responseType = responseType;
                this.xhr = new XMLHttpRequest();
                this.formData = new FormData();
                this.prev = null;
                this.next = null;
                this.delay = 0; // (in ms for the next chained request to execute)
                this.sent = 0; // (0: not sent or erred out, 1: queued, 2: sent)
                if (payload)
                    if (method == "POST")
                        for (var p in payload)
                            this.formData.append(p, payload[p]); //? encodeURIComponent(payload[p]) ?
                    else {
                        var queryItems = [];
                        for (var p in payload)
                            queryItems.push(p + "=" + encodeURIComponent(payload[p]));
                        if (url.lastIndexOf("?") < 0)
                            url += "?";
                        url += (url.charAt(url.length - 1) != "?" ? "&" : "") + queryItems.join("&");
                    }
                this.url = url;
                this.xhr.onload = function (ev) { _this_1._doOnLoaded(ev); };
                this.xhr.onerror = function (ev) { _this_1._doOnError(ev); };
            }
            HTTPRequest.prototype._doOnLoaded = function (ev) {
                if (ev && this.xhr.status != 200) {
                    this._doOnError(ev);
                }
                else {
                    this.loaded = true;
                    if (this._onloaded) {
                        for (var i = 0, len = this._onloaded.length; i < len; ++i)
                            this._onloaded[i](this, ev);
                        this._onloaded.length = 0; // (make sure they don't get triggered again)
                        this._onerror.length = 0; // (make sure they don't get triggered again)
                    }
                }
            };
            HTTPRequest.prototype._doOnError = function (ev) {
                debugger;
                log('An error occurred: ' + ev + '\r\n  XHR Status: ' + this.xhr.statusText, LogMessageTypes.Error);
                this.sent = 0;
                if (this._onerror) {
                    for (var i = 0, len = this._onerror.length; i < len; ++i)
                        this._onerror[i].call(this, this, ev);
                    this._onloaded.length = 0; // (make sure they don't get triggered again)
                    this._onerror.length = 0; // (make sure they don't get triggered again)
                }
            };
            HTTPRequest.prototype.thenLoad = function (url, payload, delay, method, responseType) {
                if (delay === void 0) { delay = 0; }
                this.next = new HTTPRequest(url, payload, method, responseType);
                this.next.prev = this;
                this.next.delay = delay || 0; // the delay to use before sending the request; defaults to 0 (send immediately)
                return this.next;
            };
            HTTPRequest.prototype.onloaded = function (func) {
                if (!this._onloaded)
                    this._onloaded = [];
                this._onloaded.push(func);
                return this;
            };
            HTTPRequest.prototype.onerror = function (func) { if (!this._onerror)
                this._onerror = []; this._onerror.push(func); return this; };
            /** Starts the first or next request in the series. */
            HTTPRequest.prototype.send = function () {
                var _this_1 = this;
                if (this.loaded) {
                    // ... already loaded, so queue event to trigger now ...
                    setTimeout(function () { _this_1._doOnLoaded(null); }, this.delay);
                }
                else if (this.prev && !this.prev.sent)
                    this.prev.send();
                else if (!this.sent) {
                    this.sent = 1;
                    setTimeout(function () { _this_1._doXHRSend(); }, this.delay);
                    // (using a timer to 1. support delays, and 2. make sure there's no immediate event triggers before the user is able to register any call-backs, if needed)
                }
                return this;
            };
            HTTPRequest.prototype._doXHRSend = function () {
                this.xhr.open(("" + this.method).toLowerCase(), this.url, true);
                if (this.responseType)
                    this.xhr.responseType = ("" + this.responseType).toLowerCase();
                this.xhr.send(this.formData);
                this.sent = 2;
            };
            /** Queues the next request following this request to be sent, if any. */
            HTTPRequest.prototype.sendNext = function () { if (this.next && !this.next.sent) {
                this.next.send();
                return true;
            }
            else
                return false; };
            return HTTPRequest;
        }());
        Net.HTTPRequest = HTTPRequest;
        var CacheMode;
        (function (CacheMode) {
            /** Bypass the cache and load as normal.  Successful responses are NOT cached. */
            CacheMode[CacheMode["Bypass"] = -1] = "Bypass";
            /** Load from the local storage if possible, otherwise load as normal.  Successful responses are cached. */
            CacheMode[CacheMode["Store"] = 0] = "Store";
            /** Ignore the local storage and load as normal.  Successful responses are cached, overwriting the existing data. */
            CacheMode[CacheMode["Reload"] = 1] = "Reload";
        })(CacheMode = Net.CacheMode || (Net.CacheMode = {}));
        /** Uses local storage features to cache successful responses (since app-cache HTML5 features are not yet well supported).
          *
          */
        var CachedRequest = /** @class */ (function (_super) {
            __extends(CachedRequest, _super);
            function CachedRequest(url, payload, cacheMode, 
            /** An optional name to group the cached responses under. Version changes will affect only the cache under the app name. */ appName, 
            /** Used to clear the cache when the application version changes.*/ appVersion) {
                if (cacheMode === void 0) { cacheMode = CacheMode.Store; }
                var _this_1 = _super.call(this, url, payload, "GET", "text") || this;
                _this_1.cacheMode = cacheMode;
                _this_1.appName = appName;
                _this_1.appVersion = appVersion;
                _this_1.onerror(function (req, ev) { req.result = null; });
                return _this_1;
            }
            CachedRequest.prototype.send = function () {
                return _super.prototype.send.call(this);
            };
            CachedRequest.prototype._doOnLoaded = function (ev) {
                if (ev) { // (ev != null if this was triggered by xhr onload event)
                    this.result = this.xhr.responseText;
                    if (Storage.hasLocalStorage && this.cacheMode != CacheMode.Bypass)
                        Storage.set(Storage.StorageType.Local, this.url, this.result, this.appName, this.appVersion);
                }
                _super.prototype._doOnLoaded.call(this, ev);
            };
            CachedRequest.prototype._doXHRSend = function () {
                if (Storage.hasLocalStorage && this.cacheMode == CacheMode.Store) {
                    this.result = Storage.get(Storage.StorageType.Local, this.url, this.result, this.appName, this.appVersion);
                    if (this.result !== null) {
                        _super.prototype._doOnLoaded.call(this, null);
                        return;
                    }
                }
                _super.prototype._doXHRSend.call(this);
            };
            CachedRequest.prototype.onloaded = function (func) { return _super.prototype.onloaded.call(this, func); };
            CachedRequest.prototype.onerror = function (func) { return _super.prototype.onerror.call(this, func); };
            CachedRequest.prototype.thenLoad = function (url, payload, delay) {
                if (delay === void 0) { delay = 0; }
                return _super.prototype.thenLoad.call(this, url, payload, delay, "GET", "text");
            };
            return CachedRequest;
        }(HTTPRequest));
        Net.CachedRequest = CachedRequest;
        /** A very simple function to load text via a1 URL (text files, web pages, JSON files, etc).
          *
          */
        function get(url, payload, cacheMode, appName, appVersion) {
            if (cacheMode === void 0) { cacheMode = CacheMode.Store; }
            return new CachedRequest(url, payload, cacheMode, appName, appVersion).send();
        }
        Net.get = get;
    })(Net = FlowScript.Net || (FlowScript.Net = {}));
    // ========================================================================================================================
    /** Web storage utilities. */
    var Storage;
    (function (Storage) {
        // ------------------------------------------------------------------------------------------------------------------
        // Feature Detection 
        function _storageAvailable(storageType) {
            try {
                var storage = window[storageType], x = '$__storage_test__$';
                storage.setItem(x, x);
                storage.removeItem(x);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        /** Set to true if local storage is available. */
        Storage.hasLocalStorage = _storageAvailable("localStorage");
        /** Set to true if session storage is available. */
        Storage.hasSessionStorage = _storageAvailable("sessionStorage");
        // ------------------------------------------------------------------------------------------------------------------
        var StorageType;
        (function (StorageType) {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            StorageType[StorageType["Local"] = 0] = "Local";
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            StorageType[StorageType["Session"] = 1] = "Session";
        })(StorageType = Storage.StorageType || (Storage.StorageType = {}));
        function getStorage(type) {
            switch (type) {
                case StorageType.Local:
                    if (!Storage.hasLocalStorage)
                        throw "Local storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                    return localStorage;
                case StorageType.Session:
                    if (!Storage.hasSessionStorage)
                        throw "Session storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                    return sessionStorage;
            }
            throw "Invalid web storage type value: '" + type + "'";
        }
        Storage.getStorage = getStorage;
        // ------------------------------------------------------------------------------------------------------------------
        /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
        Storage.delimiter = "\uFFFC";
        Storage.storagePrefix = "fs";
        function makeKeyName(appName, dataName) {
            if (!dataName)
                throw "An data name is required.";
            if (dataName == Storage.delimiter)
                dataName = ""; // (this is a work-around used to get the prefix part only [fs+delimiter or fs+delimiter+appName]])
            return Storage.storagePrefix + Storage.delimiter + (appName || "") + (dataName ? Storage.delimiter + dataName : "");
        }
        Storage.makeKeyName = makeKeyName;
        /** Set a value for the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
        * If 'appVersion' and/or 'dataVersion' is given, the versions are stored with the data.  If the versions don't match
        * when retrieving the data, then 'null' is returned.
        * Warning: If the storage is full, then 'false' is returned.
        * @param {StorageType} type The type of storage to use.
        * @param {string} name The name of the item to store.
        * @param {string} value The value of the item to store. If this is undefined (void 0) then any existing value is removed instead.
        * @param {string} appName An optional application name to provision the data storage under.
        * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
        * version is different from the stored data, the data is reloaded.
        * Note: This is NOT the data version, but the version of the application itself.
        * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
        * the stored data, the data is reloaded.
        */
        function set(type, name, value, appName, appVersion, dataVersion) {
            try {
                var store = getStorage(type);
                name = makeKeyName(appName, name);
                if (value !== void 0)
                    localStorage.setItem(name, ("" + (appVersion || "")) + "\uFFFC" + ("" + (dataVersion || "")) + "\uFFFC" + value);
                else
                    localStorage.removeItem(name);
                // (note: IE8 has a bug that doesn't allow chars under 0x20 (space): http://caniuse.com/#search=web%20storage)
                return true;
            }
            catch (ex) {
                return false; // (storage is full, or not available for some reason)
            }
        }
        Storage.set = set;
        /** Get a value from the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
          * If 'appVersion' and/or 'dataVersion' is given, the versions are checked against the data.  If the versions don't
          * match, then 'null' is returned.
          * @param {StorageType} type The type of storage to use.
          * @param {string} name The name of the item to store.
          * @param {string} value The value of the item to store.
          * @param {string} appName An optional application name to provision the data storage under.
          * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
          * version is different from the stored data, the data is reloaded.
          * Note: This is NOT the data version, but the version of the application itself.
          * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
          * the stored data, the data is reloaded.
          */
        function get(type, name, appName, appVersion, dataVersion) {
            var store = getStorage(type);
            var itemKey = makeKeyName(appName, name);
            var value = localStorage.getItem(itemKey);
            if (value === null)
                return null;
            if (value === "")
                return value;
            var i1 = value.indexOf("\uFFFC");
            var i2 = value.indexOf("\uFFFC", i1 + 1);
            if (i1 >= 0 && i2 >= 0) {
                var _appVer = value.substring(0, i1);
                var _datVer = value.substring(i1 + 1, i2);
                value = value.substring(i2 + 1);
                if ((appVersion === void 0 || appVersion === null || appVersion == _appVer) && (dataVersion === void 0 || dataVersion === null || dataVersion == _datVer))
                    return value;
                else
                    return null; // (version mismatch)
            }
            else {
                localStorage.removeItem(itemKey); // (remove the invalid entry)
                return null; // (version read error [this should ALWAYS exist [even if empty], otherwise the data is not correctly stored])
            }
        }
        Storage.get = get;
        // ------------------------------------------------------------------------------------------------------------------
        /** Clear all FlowScript data from the specified storage (except save project data). */
        function clear(type) {
            var store = getStorage(type);
            var sysprefix = makeKeyName(null, Storage.delimiter); // (get just the system storage prefix part)
            for (var i = store.length - 1; i >= 0; --i) {
                var key = store.key(i);
                if (key.substring(0, sysprefix.length) == sysprefix) // (note: saved project data starts with "fs-<project_name>:")
                    store.removeItem(key);
            }
        }
        Storage.clear = clear;
        // ------------------------------------------------------------------------------------------------------------------
        // Cleanup web storage if debugging.
        if (FlowScript.debugging && Storage.hasLocalStorage)
            clear(StorageType.Local);
        // ------------------------------------------------------------------------------------------------------------------
    })(Storage = FlowScript.Storage || (FlowScript.Storage = {}));
    /** Returns the call stack for a given error object. */
    function getErrorCallStack(errorSource) {
        var _e = errorSource;
        if (_e.stacktrace && _e.stack)
            return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
        var callstack = [];
        var isCallstackPopulated = false;
        var stack = _e.stack || _e.message;
        if (stack) {
            var lines = stack.split(/\n/g);
            if (lines.length) {
                // ... try to extract stack details only (some browsers include other info) ...
                for (var i = 0, len = lines.length; i < len; ++i)
                    if (/.*?:\d+:\d+/.test(lines[i]))
                        callstack.push(lines[i]);
                // ... if there are lines, but nothing was added, then assume this is a special unknown stack format and just dump it as is ...
                if (lines.length && !callstack.length)
                    callstack.push.apply(callstack, lines);
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated && arguments.callee) { //(old IE and Safari - fall back to traversing the call stack by caller reference [note: this may become depreciated])
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }
        return callstack;
    }
    FlowScript.getErrorCallStack = getErrorCallStack;
    /** Returns the message of the specified error source by returning either 'errorSource' as is, if a string, or
      * 'errorSource.message' if exits.
      */
    function getErrorMessage(errorSource) {
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object' && 'message' in errorSource) {
            var error = errorSource;
            var msg = error.message;
            if (error.lineno !== FlowScript.undefined)
                error.lineNumber = error.lineno;
            if (error.lineNumber !== FlowScript.undefined) {
                msg += "\r\non line " + error.lineNumber + ", column " + error.columnNumber;
                if (error.fileName !== FlowScript.undefined)
                    msg += ", of file '" + error.fileName + "'";
            }
            else if (error.fileName !== FlowScript.undefined)
                msg += "\r\nin file '" + error.fileName + "'";
            var stack = getErrorCallStack(error);
            if (stack && stack.length)
                msg += "\r\nStack trace:\r\n" + stack.join("\r\n") + "\r\n";
            return msg;
        }
        else
            return '' + errorSource;
    }
    FlowScript.getErrorMessage = getErrorMessage;
    // ========================================================================================================================
    /** Extends a based type prototype by chaining a derived type's 'prototype' to the base type's prototype.
    * Note: Extending an already extended prototype will recreate the prototype connection again, pointing it to the new prototype.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    function extend(derivedType, baseType, copyBaseProperties) {
        if (copyBaseProperties === void 0) { copyBaseProperties = true; }
        // ... create a prototype link for the given type ...
        function __() { this.constructor = derivedType; }
        __.prototype = baseType.prototype;
        // ... copy any already defined properties in the derived prototype to be replaced, if any ...
        var newProto = new __();
        for (var p in derivedType.prototype)
            if (derivedType.prototype.hasOwnProperty(p))
                newProto[p] = derivedType.prototype[p];
        // ... set the new prototype ...
        derivedType.prototype = newProto;
        // ... finally, copy forward any static properties ...
        if (copyBaseProperties)
            for (var p in baseType)
                if (baseType.hasOwnProperty(p))
                    derivedType[p] = baseType[p];
        // ... return the extended derived type ...
        return derivedType;
    }
    FlowScript.extend = extend;
    ;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
FlowScript.safeEval = function (exp, p1, p2, p3) { return eval(exp); };
// (note: this allows executing 'eval' outside the private FlowScript scopes, and also allows passing arguments scoped only to the request [without polluting the global scope])
FlowScript.evalGlobal = function (exp) { return FlowScript.global.eval(exp); }; // http://perfectionkills.com/global-eval-what-are-the-options/#windoweval
// ############################################################################################################################
// Notes: 
//
//   Rendered expressions currently all dump values into a rolling value; doesn't seem to be much of a performance problem at all: http://jsperf.com/expression-vs-expression-assignment
//
//# sourceMappingURL=flowscriptrt.js.map