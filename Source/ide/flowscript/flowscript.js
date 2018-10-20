var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// ############################################################################################################################
// The objects in this file apply only to running scripts, which don't have access to the FlowScript designer/compiler types by default.
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
        return FlowScript.debugging || typeof location == "object" && location.search && /[?&]debug=true/gi.test("" + location.search);
    })();
    // ========================================================================================================================
    var Polyfills;
    (function (Polyfills) {
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
    })(Polyfills || (Polyfills = {}));
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
                        throw "Sorry, JSON is not supported in this environment. You could try to polyfill it (see modernizr.com) and try again.";
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
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Provides properties and methods for tracking objects for save and load operations. */
    var TrackableObject = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function TrackableObject(script) {
            // --------------------------------------------------------------------------------------------------------------------
            this._id = TrackableObject.register(this);
            this._type = FlowScript.Utilities.getFunctionName(this.constructor);
            this._script = script || (FlowScript.isFlowScriptObject(this) ? this : void 0);
        }
        TrackableObject.register = function (obj) { var id = obj._id || (obj._id = FlowScript.Utilities.createGUID(false)); TrackableObject.objects[id] = obj; return id; };
        Object.defineProperty(TrackableObject.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The script instance this object belongs to. Derived types should override this to return the proper reference. */
            get: function () { return this._script; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        TrackableObject.prototype.save = function (target) {
            target = target || {};
            target.id = '' + this._id;
            target.type = '' + this._type;
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        TrackableObject.objects = {};
        return TrackableObject;
    }());
    FlowScript.TrackableObject = TrackableObject;
    // ========================================================================================================================
    /** The base class for all type objects, which contains meta data describing types within a namespace.
      * Note: Each name in namespace path is created by using empty type objects.
      */
    var Type = /** @class */ (function (_super) {
        __extends(Type, _super);
        /** Creates a new type object, which also acts as a namespace name in a type graph.
          * @param {Type} parent The parent type of this type, or 'null' if this is the root type.
          * @param {string} name The name for this type.
          * @param {IFlowScript} script (optional) The script to associate with this type if there is no parent.  If a parent is specified, this is ignored.
          */
        function Type(parent, name, script) {
            var _this = _super.call(this, script || (parent ? parent.script : void 0)) || this;
            _this._superType = null;
            if (parent !== null && (typeof parent !== 'object' || !(parent instanceof Type)))
                throw "Type error: A valid parent object is required.  If this is a root type, pass in 'null' as the parent value.";
            if (name !== void 0)
                _this.name = name;
            if (parent)
                parent.add(_this); // (sets the script reference as well)
            return _this;
        }
        Object.defineProperty(Type.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns a reference to the parent type.  If there is no parent, or the parent is the script root namespace, then 'null' is returned.
              * Note: Every type has a reference to the underlying script, which is the root namespace for all types.
              * Derived types take note: The private field '_parent' is NOT null at the first type when traversing the type hierarchy.  The 'parent' getter property should be used.
              */
            get: function () { return this._parent != this.script ? this._parent : null; },
            /** Sets a new parent type for this type.  The current type will be removed from its parent (if any), and added to the given parent. */
            set: function (parent) {
                if (this._parent)
                    this._parent.remove(this);
                if (parent)
                    parent.add(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "script", {
            /** Traverses up to the root to find and return the script, which is root namespace for all types. */
            get: function () { return this._parent ? this._parent.script : (FlowScript.isFlowScriptObject(this) ? this : null); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "superType", {
            /** A reference to an inherited type, if any.  Some types (such as objects) inherit properties from their super types if specified. */
            get: function () { return this._superType; },
            set: function (value) { this._superType = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "nestedTypes", {
            /** The nested child types under this type. */
            get: function () { return this._nestedTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "nestedTypesIndex", {
            /** A named index of each nested child type. */
            get: function () { return this._nestedTypesIndex; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "templateTypes", {
            /** Holds a list of template parameters required for template component types. */
            get: function () { return this._templateTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "name", {
            get: function () { return this._name || "{Unnamed Type, ID " + this._id + "}"; },
            set: function (value) {
                if (!value)
                    throw "Type error: A valid type name is required.";
                var newName = typeof value === 'string' ? value : '' + value;
                if (newName.substring(0, 3) == '$__')
                    throw "Names cannot start with the special system reserved prefix of '$__'.";
                if (this.parent && this.parent.exists(newName, this))
                    throw "A type by the name '" + newName + "' already exists.";
                this._name = newName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "safeName", {
            /** Returns a name that is safe to use as a normal identifier for this type (using characters that will support direct dot access - used with code output rendering). */
            get: function () {
                var name = this.name, safeName = "", skippedChars = false;
                /** ... update safe name with template details, if any ... */
                if (this._templateTypes && this._templateTypes.length)
                    name += "_" + this._templateTypes.length;
                for (var i = 0, n = name.length; i < n; ++i) {
                    var c = name[i];
                    if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || i > 0 && c == '$' || c == '_' || c >= '0' && c <= '9')
                        safeName += skippedChars || i == 0 && c >= ' 0' && c <= '9' ? (skippedChars = false, '_' + c) : c;
                    else if (c != '$')
                        skippedChars = true;
                }
                /** ... if the safe name is different check for any conflicts with sibling types, to be extra safe ... */
                if (safeName != name && this.parent && this.parent.exists(safeName)) {
                    i = 2;
                    while (this.parent.exists(safeName + i))
                        ++i;
                    safeName = safeName + i;
                }
                return safeName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "namespace", {
            /** Return the parent namespace for this type.
              * Namespaces group "like minded" components together - usually those that operate on related data types.
              */
            get: function () {
                if (!this.parent)
                    return "";
                var ns = [], t = this.parent;
                while (t)
                    (ns.push(t._name), t = t.parent);
                return ns.reverse().join('.');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "safeNamespace", {
            /** Return the parent "safe" namespace for this type (using characters that will support direct dot access - used with code output rendering).
              * Namespaces group "like minded" components together - usually those that operate on related data types.
              */
            get: function () {
                if (!this.parent)
                    return "";
                var ns = [], t = this.parent;
                while (t)
                    (ns.push(t.safeName), t = t.parent);
                return ns.reverse().join('.');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "fullTypeName", {
            /** The full namespace + type name. */
            get: function () { var ns = this.namespace; if (ns)
                return ns + '.' + this._name;
            else
                return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Type.prototype, "safeFullTypeName", {
            /** The full "safe" namespace + type name (using characters that will support direct dot access - used with code output rendering). */
            get: function () { var ns = this.safeNamespace; if (ns)
                return ns + '.' + this.safeName;
            else
                return this.safeName; },
            enumerable: true,
            configurable: true
        });
        /**
        * Initializes this type, including all child types, where not already initialized.
        * This allows to first construct the type hierarchy so references exist prior to configuring the types further.
        * Note: This only initializes from this type downwards, so if adding types in multiple locations, called this
        * function on the root script instance is better to make sure all new types added get initialized.
        * @see onInit() Used to initialize custom derived types.
        */
        Type.prototype.initialize = function () {
            if (!this._initialized) {
                this.onInit();
                this._initialized = true;
            }
            if (this._nestedTypes)
                for (var types = this._nestedTypes, i = 0, n = types.length; i < n; ++i)
                    types[i].initialize();
        };
        /**
        * Initialize the sub-type derived from this type, including all child types.
        * This allows to first construct the type tree so references exist prior to configuring the types further.
        */
        Type.prototype.onInit = function () { };
        // --------------------------------------------------------------------------------------------------------------------
        Type.prototype.save = function (target) {
            target = target || {};
            target.name = this.name;
            target.comment = this.comment;
            target.nestedTypes = [];
            if (this.nestedTypes)
                for (var i = 0, n = this.nestedTypes.length; i < n; ++i)
                    target.nestedTypes[i] = this._nestedTypes[i].save();
            _super.prototype.save.call(this, target);
            return target;
        };
        Type.getCompositeTypeKey = function (compositeTypes) {
            var types = (arguments.length == 1 && typeof compositeTypes == 'object' && 'length' in compositeTypes
                ? compositeTypes : arguments);
            var key = [];
            for (var i = 0, n = types.length; i < n; ++i)
                key.push(types[i].fullTypeName);
            return key.join(",");
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns true if the given type matches this type *exactly* (that means, for instance, "Any" does NOT match "String").
          * If the underlying type or the given type is of the special internal "All" type, then true is always returned.
          */
        Type.prototype.is = function (type) {
            var thisFullname = this.fullTypeName;
            if (thisFullname == "All")
                return true;
            else if (typeof type == 'object') {
                var ftn = type.fullTypeName; // (read once, since this is dynamic)
                if (ftn == "All" || ftn == thisFullname)
                    return true;
            }
            else
                return false;
        };
        /** Returns true if the current type can be assigned TO the specified type.
          * If this type or the given type is of "Any" type, then true is always returned.
          * This function must be overloaded to provide specialized results.  When overriding, instead of returning false, make
          * sure to transfer the call to the super function to allow parent types in the hierarchy to validate as well.
          * There's no need to overload this for object type inheritance.  The default implementation already checks the super types.
          */
        Type.prototype.assignableTo = function (type) {
            if (typeof type == 'object') {
                var typeFullname = type.fullTypeName;
                var thisFullname = this.fullTypeName;
                if (thisFullname == "Any" || typeFullname == "Any" || typeFullname == thisFullname)
                    return true;
                else if (this._superType) {
                    var superType = this._superType;
                    do { // ... check the object inheritance chain, if any ...
                        if (superType.fullTypeName == typeFullname)
                            return true;
                        superType = superType._superType;
                    } while (superType);
                }
            }
            return false;
        };
        /** Returns true if the given type can be assigned to the current type.
          * If this type or the given type is of "Any" type, then true is always returned.
          * Note: Don't override this function.  If needed, override "assignableTo()" (see the type info for more details).
          * @see assignableTo()
          */
        Type.prototype.assignableFrom = function (type) {
            return typeof type == 'object' && type.assignableTo && type.assignableTo(this);
        };
        Type.prototype.exists = function (nameOrType, ignore) {
            if (nameOrType === void 0 || nameOrType === null || !this._nestedTypesIndex)
                return false;
            var paramType = typeof nameOrType;
            if (paramType === 'object' && nameOrType instanceof Type) {
                var type = this._nestedTypesIndex[nameOrType._name];
                return !!type && type != ignore;
            }
            var t = this.resolve(nameOrType);
            return !!t && t != ignore;
        };
        /** Resolves a type path under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          * @param {function} requiredType A required type reference that the returned type must be an instance of.
          */
        Type.prototype.resolve = function (typePath, requiredType) {
            var parts = (typeof typePath !== 'string' ? '' + typePath : typePath).split('.'), t = this;
            for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) {
                // (note: 'parts[0]?0:1' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                var type = t._nestedTypesIndex[parts[i]];
                if (!type)
                    return null;
                else
                    t = type;
            }
            return requiredType ? (t instanceof requiredType ? t : null) : t;
        };
        Type.prototype.add = function (typeOrName) {
            if (typeOrName === void 0 || typeOrName === null)
                throw "Cannot add an empty type name/path to the namespace '" + this.fullTypeName + "'.";
            if (this.exists(typeOrName))
                throw "The type '" + typeOrName + "' already exists in the namespace '" + this.fullTypeName + "'.";
            if (typeof typeOrName !== 'object' || !(typeOrName instanceof Type)) {
                var ns = ('' + typeOrName).split('.'), t = this;
                for (var i = (ns[0] ? 0 : 1), n = ns.length; i < n; ++i) // ('ns[0]' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                    t = new Type(t, ns[i]);
                return t;
            }
            if (typeOrName.parent && typeOrName.parent !== this)
                throw "Type error: Cannot add a type that is already the child of another type.";
            typeOrName._parent = this;
            typeOrName._script = FlowScript.isFlowScriptObject(this) ? this : this._script || typeOrName._script;
            if (!this._nestedTypes)
                this._nestedTypes = [];
            if (!this._nestedTypesIndex)
                this._nestedTypesIndex = {};
            this._nestedTypes.push(typeOrName);
            this._nestedTypesIndex[typeOrName.name] = typeOrName;
            return typeOrName;
        };
        Type.prototype.remove = function (typeOrName) {
            if (typeOrName === void 0 || typeOrName === null)
                throw "Cannot remove an empty type name/path from the namespace '" + this.fullTypeName + "'.";
            var parent; // (since types can be added as roots to other types [i.e. no parent references], need to remove type objects as immediate children, not via 'resolve()')
            if (typeof typeOrName == 'object' && typeOrName instanceof Type) {
                var t = typeOrName;
                if (!this._nestedTypesIndex[t.name])
                    throw "Cannot remove type: There is no child type '" + typeOrName + "' under '" + this.fullTypeName + "'.";
                parent = this;
            }
            else {
                var t = this.resolve(typeOrName);
                if (t)
                    parent = t.parent;
            }
            if (t && parent) {
                delete parent._nestedTypesIndex[t.name];
                var i = parent._nestedTypes.indexOf(t);
                if (i >= 0)
                    parent._nestedTypes.splice(i, 1);
                t._parent = null;
                t._script = null;
            }
            return t;
        };
        /** Remove this type from the parent. */
        Type.prototype.detach = function () {
            if (this._parent)
                this._parent.remove(this);
            return this;
        };
        /** Sets a type for template types using the given name, default type, and any expected based type (as a constraint).
          * This only works for types that represent templates.
          */
        Type.prototype.defineTemplateParameter = function (name, defaultType, expectedBaseType) {
            if (defaultType === void 0) { defaultType = this.script.System.Any; }
            if (expectedBaseType === void 0) { expectedBaseType = this.script.System.Any; }
            if (!this._templateTypes)
                this._templateTypes = [];
            for (var i = 0; i < this._templateTypes.length; ++i)
                if (this._templateTypes[i].name == name)
                    throw "Type '" + this + "' already has a template parameter named '" + name + "'.";
            this._templateTypes.push({ name: name, defaultType: defaultType, expectedBaseType: expectedBaseType });
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a type from this template type using the supplied types.  This only works for types that represent templates. */
        Type.prototype.createTemplateType = function (templateTypes) {
            if (!this._templateTypes || !this._templateTypes.length)
                throw "Type '" + this + "' does not represent a template type.";
            var templateType = new Type(null, this.name, this.script);
            templateType._parent = this; // (one way back only, as this is a dynamic type that is never added to the meta type tree)
            return templateType;
        };
        Object.defineProperty(Type.prototype, "referenceStr", {
            // --------------------------------------------------------------------------------------------------------------------
            /** An instance reference string that represents this type in the type hierarchy.
             * @see getReference()
             */
            get: function () {
                if (this.parent instanceof FlowScript.Component)
                    return this.parent.referenceStr + "resolve('" + FlowScript.Utilities.replace(this.name, "'", "\'") + "')";
                else
                    return "resolve('" + FlowScript.Utilities.replace(this.fullTypeName, "'", "\'") + "')";
            },
            enumerable: true,
            configurable: true
        });
        /** Gets a @type {NamedReference} reference instance that represents this type in the type hierarchy.
         * @see referenceStr
         */
        Type.prototype.getReference = function () {
            if (this.script)
                return new NamedReference(this.script, this.referenceStr);
            else
                return new NamedReference(this, null);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Type.prototype.toString = function () { return this.fullTypeName; };
        Type.prototype.valueOf = function () { return this.fullTypeName; };
        return Type;
    }(TrackableObject));
    FlowScript.Type = Type;
    /**
     * References types in the type tree. This is used to track types, instead of pointers, since types can be deleted and
     * recreated, invalidating all references to the deleted type object.  A named reference uses a root object, and a
     * dot-delimited name to the referenced object.
     */
    var NamedReference = /** @class */ (function () {
        /**
         * Creates a new reference.
         * @param root The object the is the root to resolve the named path against.
         * @param path Dot-delimited names that are the path to the value pointed to by this reference.
         */
        function NamedReference(root, path) {
            this.root = root;
            if (path && path.charAt)
                while (path.charAt(0) == '.')
                    path = path.substr(1);
            this.path = path;
        }
        NamedReference.prototype.toString = function () { return "" + this.valueOf(); };
        NamedReference.prototype.valueOf = function () {
            try {
                return this.root && (this.path ? eval("this.root." + this.path) : this.root) || void 0;
            }
            catch (ex) {
                throw "Failed to resolve path '" + this.path + "' from the `this.root` object '" + this.root + "'.";
            }
        };
        Object.defineProperty(NamedReference.prototype, "isNull", {
            /** Returns true if this reference represents a null/empty reference. */
            get: function () { return !this.root; },
            enumerable: true,
            configurable: true
        });
        return NamedReference;
    }());
    FlowScript.NamedReference = NamedReference;
    // ========================================================================================================================
    var Core;
    (function (Core) {
        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to "Any", but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types; however, some
          * internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        var All = /** @class */ (function (_super) {
            __extends(All, _super);
            function All() {
                return _super.call(this, null, "All") || this;
            }
            All.prototype.assignableTo = function (type) {
                return true;
            };
            return All;
        }(Type));
        Core.All = All;
        var Event = /** @class */ (function (_super) {
            __extends(Event, _super);
            function Event(parent) {
                return _super.call(this, parent, "Event") || this;
            }
            Event.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Event.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Event;
        }(Type));
        Core.Event = Event;
        var Inferred = /** @class */ (function (_super) {
            __extends(Inferred, _super);
            function Inferred() {
                return _super.call(this, null, "Inferred") || this;
            }
            Inferred.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                return _super.prototype.assignableTo.call(this, type);
            };
            return Inferred;
        }(Type));
        Core.Inferred = Inferred;
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript_1) {
    // ========================================================================================================================
    ;
    /** Represents an event dispatcher manager. */
    var EventDispatcher = /** @class */ (function () {
        /** Constructs a new event dispatcher.
          * If 'synchronous' is false (default), then a 'setTimeout()' if 0 is used to trigger events.  This allows following
          * code to complete before events trigger, as objects can be created and attached before they get configured.  If
          * 'synchronous' is true, calling 'trigger()' calls all event handlers immediately.
          */
        function EventDispatcher(owner, synchronous) {
            if (synchronous === void 0) { synchronous = false; }
            this.synchronous = synchronous;
            this._handlers = [];
            this._owner = owner;
            if (synchronous && typeof setTimeout != 'function')
                throw "Asynchronous events are not supported in this environment.";
        }
        Object.defineProperty(EventDispatcher.prototype, "target", {
            get: function () { return this._owner; },
            enumerable: true,
            configurable: true
        });
        /** Locate the index of a handler by function reference. */
        EventDispatcher.prototype.indexOf = function (func) {
            for (var i = 0, n = this._handlers.length; i < n; ++i)
                if (this._handlers[i].handler == func)
                    return i;
            return -1;
        };
        /** Add a handler for this event dispatcher.  If the function already exists, the current entry is updated. */
        EventDispatcher.prototype.add = function (func, data, removeOnTrigger) {
            var i = this.indexOf(func);
            if (i >= 0) {
                var handlerInfo = this._handlers[i];
                if (removeOnTrigger !== void 0)
                    handlerInfo.removeOnTrigger = removeOnTrigger;
            }
            else
                this._handlers.push(handlerInfo = { handler: func, removeOnTrigger: removeOnTrigger, data: data });
            return handlerInfo;
        };
        /** Remove a handler from this event dispatcher. */
        EventDispatcher.prototype.remove = function (func) {
            var i = this.indexOf(func);
            if (i >= 0)
                return this._handlers.splice(i, 1)[0];
            else
                return void 0;
        };
        /** Remove all handlers from this event dispatcher. */
        EventDispatcher.prototype.clear = function () {
            this._handlers.length = 0;
        };
        EventDispatcher._ctor = (function () {
            EventDispatcher.prototype.trigger = (function trigger() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = this;
                args.push(void 0, _this);
                var dataIndex = args.length - 2;
                function _trigger() {
                    for (var i = 0, n = _this._handlers.length; i < n; ++i) {
                        var h = _this._handlers[i];
                        args[dataIndex] = h.data;
                        h.handler.apply(_this._owner || _this, args);
                        if (h.removeOnTrigger) {
                            _this._handlers.splice(i, 1);
                            --i;
                            --n;
                        }
                    }
                }
                if (_this.synchronous || typeof setTimeout != 'function')
                    _trigger();
                else
                    setTimeout(_trigger, 0);
            });
        })();
        return EventDispatcher;
    }());
    FlowScript_1.EventDispatcher = EventDispatcher;
    var FlowScript = /** @class */ (function (_super) {
        __extends(FlowScript, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function FlowScript(main) {
            var _this_1 = _super.call(this, null, "Script", eval('this')) || this;
            _this_1._messages = [];
            _this_1._messagesIndex = {};
            _this_1._threads = [new FlowScript_1.Thread(_this_1)]; // (there is always one main thread)
            if (main && main.script != _this_1)
                throw "The custom 'Main' component does not reference this script instance.  When creating components, make sure to pass in the script instance they will be associated with.";
            _this_1.System = new FlowScript_1.Core.System(_this_1);
            _this_1._main = main || new FlowScript_1.Core.Main(_this_1);
            _this_1.initialize(); // (initialize all currently set core types before returning)
            return _this_1;
        }
        Object.defineProperty(FlowScript.prototype, "main", {
            get: function () { return this._main; },
            set: function (value) {
                if (value != this._main) {
                    if (typeof value !== 'object' || !(value instanceof FlowScript_1.Component))
                        throw "The given main component reference is not valid.";
                    if (this._main)
                        this._main.detach();
                    this._main = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        FlowScript.prototype.add = function (typeOrName) {
            return _super.prototype.add.call(this, typeOrName);
        };
        FlowScript.prototype.remove = function (typeOrName) {
            return _super.prototype.remove.call(this, typeOrName);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Run the script with the supplied arguments. */
        FlowScript.prototype.run = function (args) {
            if (!this.main)
                throw "Error: The script environment does not have a 'main' entry point set.";
            return new FlowScript_1.Compiler(this).compileSimulation().start(args).run();
        };
        FlowScript.prototype.getCompiler = function (comp) {
            if (!comp)
                comp = FlowScript_1.Compiler;
            return new comp(this);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Compile the script into JavaScript starting at the specified "main" component property. */
        FlowScript.prototype.compile = function () {
            return ""; //?return "// FlowScript Export v0.1.1.1\r\n\r\n" + this.main.compile();
        };
        FlowScript.prototype.load = function (objRootOrURL) {
            if (typeof objRootOrURL == 'string') {
                if (objRootOrURL) {
                    if (objRootOrURL.charAt(0) == '{') {
                        this.load(FlowScript_1.Utilities.Data.JSON.parse(objRootOrURL));
                        return;
                    }
                    this._url = objRootOrURL;
                }
                if (!this._url)
                    throw "No previous URL exists, so a URL must be provided.";
            }
            else {
                var root = objRootOrURL;
                this._url = root.url;
            }
        };
        /** Saves the script to a nested tree of objects that can be later serialized to JSON if desired, or just stored in an
          * array as a reference for later (i.e. for undo operations, etc.).
          */
        FlowScript.prototype.save = function (target) {
            target = target || {};
            target.url = this._url;
            _super.prototype.save.call(this, target);
            return target;
        };
        /** Saves the script to data objects (calls this.save()) and uses the JSON object to serialize them into a string. */
        FlowScript.prototype.serialize = function () {
            var saveData = this.save();
            var json = FlowScript_1.Utilities.Data.JSON.stringify(saveData);
            return json;
        };
        /** Serializes and saves this script to local storage under a specified name. The storage key name is returned. */
        FlowScript.prototype.saveToStorage = function (projectName, scriptName, scriptVersion) {
            var json = this.serialize();
            return Storage.saveProjectData(projectName, scriptName || "Script", json, scriptVersion);
        };
        FlowScript.prototype.registerMessage = function (msgOrPat, id) {
            var m = typeof msgOrPat == 'object' && msgOrPat instanceof FlowScript_1.Message ? msgOrPat : new FlowScript_1.Message(this, msgOrPat, id);
            if (m._parent === null || m._parent === FlowScript_1.undefined)
                m._parent = this;
            else if (m._parent != this) {
                // ... copy message from other script ...
                var _m = new FlowScript_1.Message(this, m.messagePattern, m.id);
                if (m.translationPattern)
                    _m.setTranslation(m.translationPattern);
                m = _m;
            }
            if (m.id in this._messagesIndex)
                throw "Error: A message '" + m.messagePattern + "' with the id '" + m.id + "' already exists.";
            this._messages.push(m);
            this._messagesIndex[m.id] = m;
            return m;
        };
        // --------------------------------------------------------------------------------------------------------------------
        FlowScript.prototype.loadSystem = function () {
            var _this_1 = this;
            if (!this.System) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onerror = function (ev) {
                    var msg = "Error opening System.xml.";
                    if (document && document.writeln)
                        document.writeln(msg);
                    if (alert)
                        alert(msg);
                };
                xmlhttp.onload = function (ev) {
                    _this_1.System = _this_1._loadTypeXML(xmlhttp.responseXML, null);
                    if (!_this_1.System) {
                        var msg = "Error: Failed to parse the loaded system XML, or the XML data was empty.";
                        if (document && document.writeln)
                            document.writeln(msg);
                        if (alert)
                            alert(msg);
                    }
                };
                xmlhttp.open("GET", "System.xml", true);
                xmlhttp.send();
            }
        };
        FlowScript.prototype._loadTypeXML = function (typeNode, parentType) {
            if (typeNode && typeof typeNode == 'object' && typeNode instanceof Node) {
                var nodeName = typeNode.nodeName, type;
                if (typeNode instanceof Element)
                    if (nodeName == "type") {
                        // ... create a namespace type ...
                        var name = typeNode.attributes.getNamedItem('name').value;
                        var type = new FlowScript_1.Type(parentType, name, this);
                    }
                    else if (nodeName == "component") {
                        // ... create a component type ...
                        var nameAttr = typeNode.attributes.getNamedItem('name');
                        var name = nameAttr ? nameAttr.value : null;
                        var titleAttr = typeNode.attributes.getNamedItem('title');
                        var title = titleAttr ? titleAttr.value : null;
                        var compTAttr = typeNode.attributes.getNamedItem('componentType');
                        if (!compTAttr)
                            throw "Component type is missing in System.xml for type '" + (parentType ? parentType + "." : "") + (name || title) + "'.";
                        var compType = compTAttr ? compTAttr.value : null;
                        try {
                            var comp = type = new FlowScript_1.Component(parentType, FlowScript_1.ComponentTypes[compType], name, title, this);
                        }
                        catch (e) {
                            throw "Error loading System.xml: " + e;
                        }
                    }
                    else
                        throw "Unknown element name '" + nodeName + "' in System.xml.";
                for (var i = 0, n = typeNode.childNodes.length; i < n; ++i)
                    this._loadTypeXML(typeNode.childNodes[i], type);
                return type;
            }
        };
        return FlowScript;
    }(FlowScript_1.Type));
    function isFlowScriptObject(value) { return typeof value == 'object' && value instanceof FlowScript; }
    FlowScript_1.isFlowScriptObject = isFlowScriptObject;
    // ========================================================================================================================
    var Storage;
    (function (Storage) {
        Storage.projectSaveDataSuffix = "-save";
        function makeProjectDataKeyName(projectName, dataTypeName, version) {
            if (!projectName)
                throw "A project name is required.";
            if (!dataTypeName)
                throw "A project data type name is required.";
            if (projectName == Storage.delimiter)
                projectName = ""; // (this is a work-around used to get the prefix part only)
            if (dataTypeName == Storage.delimiter)
                dataTypeName = ""; // (this is a work-around used to get the prefix part only)
            return Storage.storagePrefix + Storage.projectSaveDataSuffix + Storage.delimiter + projectName + (dataTypeName ? Storage.delimiter + dataTypeName : "") + (version ? Storage.delimiter + version : "");
        }
        Storage.makeProjectDataKeyName = makeProjectDataKeyName;
        /** Saves project data and returns a storage key that can be used to pull the data directly. */
        function saveProjectData(projectName, dataTypeName, value, version) {
            if (!projectName)
                throw "A project name is required.";
            if (!dataTypeName)
                throw "A project data type name is required.";
            var store = Storage.getStorage(Storage.StorageType.Local);
            var key = makeProjectDataKeyName(projectName, dataTypeName, version);
            store.setItem(key, value);
            return key;
        }
        Storage.saveProjectData = saveProjectData;
        /** Loads project data. */
        function loadProjectData(projectName, dataTypeName, version) {
            if (!projectName)
                throw "A project name is required.";
            if (!dataTypeName)
                throw "A project data type name is required.";
            var store = Storage.getStorage(Storage.StorageType.Local);
            var key = makeProjectDataKeyName(projectName, dataTypeName, version);
            return store.getItem(key);
        }
        Storage.loadProjectData = loadProjectData;
        function getSavedProjectDataList() {
            var prefix = makeProjectDataKeyName(Storage.delimiter, Storage.delimiter);
            var list = [];
            var store = Storage.getStorage(Storage.StorageType.Local);
            var toStrFunc = function () { return this.projectName + (this.dataName ? ", " + this.dataName : "") + (this.version ? ", " + this.version : ""); };
            for (var i = 0, n = store.length; i < n; ++i) {
                var key = store.key(i);
                if (key.substring(0, prefix.length) == prefix) {
                    var parts = key.split(Storage.delimiter);
                    if (parts.length > 0) {
                        var _prefix = parts[0];
                        var projectName = parts.length > 1 ? parts[1] : void 0;
                        if (projectName) {
                            var dataName = parts.length > 2 ? parts[2] : void 0;
                            var version = parts.length > 3 ? parts[3] : void 0;
                            list.push({ projectName: projectName, dataName: dataName, version: version, toString: toStrFunc });
                        }
                    }
                }
            }
            return list;
        }
        Storage.getSavedProjectDataList = getSavedProjectDataList;
    })(Storage = FlowScript_1.Storage || (FlowScript_1.Storage = {}));
    // ========================================================================================================================
    /** Creates a new empty script instance. */
    function createNew() {
        return new FlowScript();
    }
    FlowScript_1.createNew = createNew;
    ;
    /** Creates a new script instance from a given URL. */
    function createFrom(url) {
        var fs = new FlowScript();
        fs.load(url);
        return fs;
    }
    FlowScript_1.createFrom = createFrom;
    ;
    /** Returns a simple checksum from a given string. */
    function getChecksum(text) {
        var chksum = 0;
        if (text !== void 0 && text !== null && typeof text !== 'string')
            text = '' + text;
        if (text) {
            chksum = text.length; // (let the length be part of it [i.e. '\0\0' is different from '\0\0\0\0'])
            for (var i = 0, im = 1, n = text.length; i < n; ++i, ++im)
                chksum += text.charCodeAt(i) * im; // ('*im' [index multiplier] so that 'ABC' [65*1,66*2,67*3=398] !== 'CBA' [67*1,66*2,65*3=394])
        }
        return chksum;
    }
    FlowScript_1.getChecksum = getChecksum;
    function copyProperties(source, target) {
        if (!source)
            return target;
        if (!target)
            target = {};
        for (var p in source)
            if (Object.prototype.hasOwnProperty.call(source, p))
                target[p] = source[p];
        return target;
    }
    FlowScript_1.copyProperties = copyProperties;
    /* Checks if an object instance is empty. */
    function isObjectEmpty(obj) {
        if (obj)
            for (var p in obj)
                if (Object.prototype.hasOwnProperty.call(obj, p))
                    return false;
        return true;
    }
    FlowScript_1.isObjectEmpty = isObjectEmpty;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
//??FlowScript.IndexedArguments = <any>function IndexedArguments(values?: any[]) {
//    if (values && values.length) {
//        for (var i = 0, n = values.length; i < n; ++i)
//            this[i] = values[i];
//        this.length = values.length;
//    }
//};
//FlowScript.IndexedArguments.prototype = new Array();
// ############################################################################################################################
//?if (typeof $fs === 'undefined')
//    var $fs = FlowScript;
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    var ExpressionArgs = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function ExpressionArgs(owner) {
            this._args = {};
            this._owner = owner;
        }
        Object.defineProperty(ExpressionArgs.prototype, "owner", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The ComponentReference that these arguments belong to. */
            get: function () { return this._owner; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "source", {
            /** The component that is the underlying subject of the component reference. */
            get: function () { return this._owner.component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "args", {
            get: function () { return this._args; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "isEmpty", {
            get: function () { return FlowScript.isObjectEmpty(this._args); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "length", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns the length of the arguments based on the highest index found in the existing numerical properties. */
            get: function () {
                var endIndex = -1;
                for (var p in this._args) {
                    var c = p.charCodeAt(0);
                    if (c >= 48 && c <= 57) // (optimization: http://jsperf.com/isnan-vs-check-first-char)
                     {
                        var i = +p;
                        if (i > endIndex)
                            endIndex = i;
                    }
                }
                return endIndex + 1;
            },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.apply = function (args) {
            if (args)
                for (var p in args)
                    if (typeof args[p] != 'object' || !(args[p] instanceof Expression))
                        throw "Cannot add argument '" + p + "': the value is not a valid expression object.";
                    else
                        this._setArg(p, args[p]);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /**
      * Returns the numerical argument indexes found in the 'args' object as an array of integers.
      * This is sorted by default to make sure the numerical properties were iterated in order, unless 'sorted' is false.
      * Note: This call is much faster if sorting is not required.
      */
        ExpressionArgs.prototype.getArgIndexes = function (sorted) {
            if (sorted === void 0) { sorted = true; }
            var indexes = [];
            for (var p in this._args) {
                var c = p.charCodeAt(0);
                if (c >= 48 && c <= 57) // (optimization: http://jsperf.com/isnan-vs-check-first-char)
                    indexes.push(+p);
            }
            return sorted ? indexes.sort(function (a, b) { return a - b; }) : indexes;
        };
        /**
         * Returns the argument names found in this object as an array of strings.
         * This is sorted by default to make sure the argument names match the argument indexes, unless 'sorted' is false.
         * Note: This call is much faster if sorting is not required.
         */
        ExpressionArgs.prototype.getArgNames = function (sorted) {
            if (sorted === void 0) { sorted = true; }
            var names = [];
            if (sorted) {
                var indexes = this.getArgIndexes(true); // (request to make sure they are in order)
                for (var i = 0, n = indexes.length; i < n; ++i)
                    names.push(this._args[indexes[i]]); // (the value of each index holds the argument name)
            }
            else { // (note: much faster if sorting is not needed)
                for (var p in this._args) {
                    var c = p.charCodeAt(0);
                    if (p.substr(0, 3) != "$__" && (c < 48 || c > 57)) // (see optimization test: http://jsperf.com/compare-hasownproperty-vs-substring-test)
                        names.push(p);
                }
            }
            return names;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.save = function (target) {
            target = target || {};
            target.arguments = {};
            for (var p in this._args) {
                var argValue = this._args[p];
                if (typeof argValue == 'string') // (indexes 0:, 1:, etc., all hold the actual parameter names for each argument expression given)
                    target.arguments[+p] = argValue;
                else if (typeof argValue == 'object' && argValue instanceof Expression)
                    target.arguments[p] = argValue.save();
            }
            return target;
        };
        ExpressionArgs.prototype._setArg = function (arg, expr) {
            if (expr.parent)
                if (expr.parent != this._owner)
                    expr.remove();
            expr['_parent'] = this._owner; // (no parent defined, so default to this)
            //? if (expr.containingComponent != this.containingComponent)
            //    throw "Expression error: Argument expression '" + argIndex + ":<" + expr.source + ">' belongs to another component ('" + expr.containingComponent + "').  You can't reuse existing expressions in another components '" + this.containingComponent + "'.";
            if (expr instanceof FlowScript.Statement)
                throw "Argument expression '" + expr.component + "' for parameter '" + arg + "' of component '" + this.source + "' is a line level statement, and is not allowed as an argument.";
            if (expr instanceof FlowScript.LineReference)
                throw "Argument expression '" + expr.component + "' for parameter '" + arg + "' of component '" + this.source + "' is a line reference, and is not allowed as an argument.";
            if (typeof expr.component != 'object' || !(expr instanceof Constant) && !(expr.component instanceof FlowScript.Component))
                throw "Cannot set parameter '" + arg + "' of component '" + this.source + "' to the given expression: the 'source' component reference for the specified expression is missing or invalid.";
            this._owner.cyclicalCheck(expr); // (make the owner if this ExpressionArgs instance [a component reference] is not also a child of the expression being set!)
            return this.source.setArgument(arg, expr, this._args);
        };
        ExpressionArgs.prototype.setArg = function (arg, argObj, args, returnTargets) {
            if (!this.source.hasParameter(arg))
                throw "Component '" + this.source + "' doesn't have a parameter named '" + arg + "'.";
            if (typeof argObj != 'object')
                throw "Cannot set argument '" + arg + "': the argument value is not an object reference (Component or Expression).";
            var argIsExpr = argObj instanceof Expression, argIsComp = argObj instanceof FlowScript.Component;
            if (!argIsExpr && !argIsComp)
                throw "Cannot set argument '" + arg + "': the specified argument value is not an 'Expression' or 'Component' type.";
            if (argIsExpr) {
                return this._setArg(arg, argObj);
            }
            else
                return this._setArg(arg, new FlowScript.ComponentReference(argObj, args, returnTargets, null, this._owner));
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the name of an argument given its argument index. */
        ExpressionArgs.prototype.getArgName = function (argIndex, required) {
            return this._args[argIndex];
        };
        ExpressionArgs.prototype.getArg = function (arg, required) {
            if (!this.source.hasParameter(arg))
                throw "Component '" + this.source + "' does not have a parameter '" + ((+arg + 1) || arg) + "'.";
            var argExpr;
            if (isValidNumericIndex(arg)) {
                var argName = this._args[arg];
                if (argName === void 0)
                    return void 0;
                argExpr = this._args[argName];
            }
            else
                argExpr = this._args[arg];
            if (!argExpr && required)
                throw "Argument '" + ((+arg + 1) || arg) + "' of component reference '" + this._owner + "' is missing a required argument value.";
            return argExpr;
        };
        ExpressionArgs.prototype.isArgSet = function (arg) {
            if (isValidNumericIndex(arg)) {
                var argName = this._args[arg];
                return argName !== void 0 && this._args[argName] !== void 0;
            }
            else
                return this._args[arg] !== void 0;
        };
        ExpressionArgs.prototype.removeArgument = function (nameOrIndexOrExpr) {
            if (typeof nameOrIndexOrExpr == 'object' && nameOrIndexOrExpr instanceof Expression) {
                var expr = nameOrIndexOrExpr;
                if (!expr.parent)
                    return nameOrIndexOrExpr; // (the expression is not attached anywhere)
                nameOrIndexOrExpr = null;
                for (var p in this._args)
                    if (this._args[p] == expr) {
                        nameOrIndexOrExpr = p;
                        break;
                    }
                if (!nameOrIndexOrExpr)
                    return null;
            }
            return this.source.setArgument(nameOrIndexOrExpr, void 0, this._args);
        };
        /** Removes all arguments. */
        ExpressionArgs.prototype.clear = function () {
            if (this._args)
                for (var p in this._args)
                    if (!isNaN(+p))
                        this.removeArgument(+p);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.containsExpression = function (expr) {
            var _expr;
            for (var p in this._args) {
                _expr = this._args[p];
                if (_expr && typeof _expr == 'object' && _expr instanceof Expression) {
                    if (expr == _expr)
                        return true;
                    else if (_expr.containsChildExpression(expr))
                        return true;
                }
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        ExpressionArgs.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            // ... next, add the arguments, also in order ...
            //? var argIndexes = this.getArgIndexes();
            var titleParseResult = this.source.titleParseResult;
            var parameters = titleParseResult.parameters;
            var titleParts = titleParseResult.titleParts; // (if not empty, there is always 1 more title part than parameters)
            //? for (var i = 0, n = argIndexes.length; i < n; ++i) {
            //    var argIndex = argIndexes[i];
            //    var argNode = node.appendNode(node.createNode(argIndex, VisualNodeTypes.Argument));
            //    var argExpr = this.getArg(argIndex);
            //    if (argExpr)
            //        argExpr.createVisualTree(argNode);
            //}
            for (var i = 0, n = titleParts.length; i < n; ++i) {
                node.appendTextNode(titleParts[i], FlowScript.VisualNodeTypes.ComponentTitlePart);
                if (i < parameters.length) {
                    var param = parameters[i]; // (this is the expected PARAMETER property declaration for this argument position)
                    //? var argIndex = argIndexes[i]; // (this is the ARGUMENT index from the component REFERENCE)
                    var argExpr = this.getArg(i, false); // (this is the ARGUMENT expression from the component REFERENCE)
                    // ... first, create a parameter container node to hold the argument(s) ...
                    var paramContainer = node.createNode(param, FlowScript.VisualNodeTypes.ComponentParameter);
                    paramContainer.title = "Parameter '" + param + "' of component " + this.source.name;
                    paramContainer.paramName = param.name;
                    paramContainer.paramIndex = i;
                    paramContainer.appendTextNode("[");
                    if (argExpr) {
                        var argNode = paramContainer.createNode(argExpr, FlowScript.VisualNodeTypes.Argument);
                        argNode.paramName = param.name;
                        argNode.paramIndex = i;
                        argExpr.createVisualTree(argNode, visualNodeType);
                    }
                    else
                        paramContainer.appendTextNode("«" + param.name + "»");
                    paramContainer.appendTextNode("]");
                }
            }
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.clone = function (forExpr) {
            var args = forExpr.arguments;
            args.clear();
            if (this._args)
                for (var p in this._args) {
                    var c = p.charCodeAt(0);
                    if (c >= 48 && c <= 57) {
                        var paramName = this._args[+p];
                        args.setArg(+p, this._args[paramName].clone(forExpr));
                    }
                }
            return args;
        };
        return ExpressionArgs;
    }());
    FlowScript.ExpressionArgs = ExpressionArgs;
    var ReturnTargetMap = /** @class */ (function () {
        function ReturnTargetMap(source, target) {
            this.source = source;
            this.target = target;
        }
        return ReturnTargetMap;
    }());
    FlowScript.ReturnTargetMap = ReturnTargetMap;
    var ReturnTargetMaps = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function ReturnTargetMaps(owner) {
            this._maps = [];
            this._owner = owner;
        }
        Object.defineProperty(ReturnTargetMaps.prototype, "owner", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The expression that these arguments belong to. */
            get: function () { return this._owner; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReturnTargetMaps.prototype, "source", {
            /** The component that is the return target for the owning expression. */
            get: function () { return this._owner.component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReturnTargetMaps.prototype, "maps", {
            /** Returns an array of maps between a given expression, and a target property on the calling component context. */
            get: function () { return this._maps; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReturnTargetMaps.prototype, "isEmpty", {
            get: function () { return !this._maps.length; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.addTarget = function (source, target) {
            this._maps.push(new ReturnTargetMap(source, target));
        };
        ReturnTargetMaps.prototype.addTargetMap = function (targetMap) {
            if (targetMap)
                this._maps.push(targetMap);
        };
        ReturnTargetMaps.prototype.addTargetMaps = function (targets) {
            if (targets && targets.length)
                for (var i = 0, n = targets.length; i < n; ++i)
                    this.addTargetMap(targets[i]);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.indexOfReturnTarget = function (target) {
            for (var i = 0, n = this._maps.length; i < n; ++i)
                if (this._maps[i].target == target)
                    return i;
            return -1;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.mapReturnTarget = function (source, target) {
            if (!this._owner.functionalComponent)
                throw "Cannot set return target: No containing component value exists.";
            if (typeof source != 'object')
                throw "A source property is required, or 'null' to select the default source.";
            if (typeof target != 'object')
                throw "A target property is required.";
            if (!source) {
                var defaultProperty = this.source.getProperty(null);
                if (!defaultProperty)
                    throw "Source component '" + this.source + "' does not have a default return defined.";
                source = defaultProperty.createExpression(this._owner);
            }
            else if (source instanceof FlowScript.PropertyReference) {
                var propExpr = source;
                if (!this.source.hasProperty(propExpr.name))
                    throw "The source property is not valid: The component '" + this.source + "' does not have a property named '" + source + "'.";
            }
            if (!target || !target.name || target.name == FlowScript.Property.DEFAULT_NAME)
                throw "The target of a return mapping cannot be a default property definition.  Default properties exist only to declare the return type of a functional component call.";
            else if (!this._owner.functionalComponent.hasProperty(target.name))
                throw "The target property is not valid: The containing component '" + this._owner.functionalComponent + "' does not have a property named '" + target + "'.";
            var i = this.indexOfReturnTarget(target);
            if (i >= 0)
                throw "The return target '" + target + "' was already mapped with a value from '" + this._maps[i].source + "'.";
            this._owner.cyclicalCheck(source);
            this._owner.cyclicalCheck(target);
            this._maps.push({ source: source, target: target });
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.save = function (target) {
            target = target || {};
            target.returnTargets = [];
            for (var i = 0, n = this._maps.length; i < n; ++i) {
                var rt = this._maps[i];
                target.returnTargets[i].source = rt.source ? rt.source.save() : null;
                target.returnTargets[i].target = rt.target ? rt.target.save() : null;
            }
            return target;
        };
        ReturnTargetMaps.prototype.removeReturn = function (nameOrIndexOrExpr) {
            if (typeof nameOrIndexOrExpr == 'object' && nameOrIndexOrExpr instanceof Expression) {
                var expr = nameOrIndexOrExpr;
                for (var i = this._maps.length - 1; i >= 0; --i) {
                    var rt = this._maps[i];
                    if (rt.source == expr) {
                        this._maps.splice(i, 1);
                        return expr;
                    }
                }
            }
            else {
                var i = +nameOrIndexOrExpr;
                if (isNaN(i)) {
                    if (i < 0 || i > this._maps.length)
                        throw "Index '" + i + "' is outside the bounds for the return targets (current targets: '" + this._maps.length + "').";
                    var map = this._maps.splice(i, 1);
                    return map && map.length ? map[0].source : null;
                }
                else
                    throw "'" + i + "' is not a valid index value.";
            }
            return null;
        };
        /** Removes all return mappings. */
        ReturnTargetMaps.prototype.clear = function () {
            if (this._maps)
                for (var i = this._maps.length - 1; i >= 0; --i)
                    this.removeReturn(i);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.containsExpression = function (expr) {
            var _expr;
            for (var i = this._maps.length - 1; i >= 0; --i) {
                var rt = this._maps[i];
                if (rt) {
                    if (rt.source)
                        if (rt.source == expr)
                            return true;
                        else if (rt.source.containsChildExpression(expr))
                            return true;
                    if (rt.target)
                        if (rt.target == expr)
                            return true;
                        else if (rt.target.containsChildExpression(expr))
                            return true;
                }
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        ReturnTargetMaps.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            // ... first, each return type should be added, in order ...
            for (var i = 0, n = this._maps.length; i < n; ++i)
                node.createNode(this._maps[i]);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.clone = function (forExpr) {
            var rtMaps = forExpr.returnTargets;
            rtMaps.clear();
            for (var i = 0, n = this._maps.length; i < n; ++i)
                rtMaps.addTarget(this._maps[i].source.clone(forExpr), this._maps[i].target.clone(forExpr));
            return rtMaps;
        };
        return ReturnTargetMaps;
    }());
    FlowScript.ReturnTargetMaps = ReturnTargetMaps;
    /** Returns true if the given value is numeric (a number type, or string with digits only [i.e. '0'...'10'...etc.; '+1.0' is invalid]).
     * This function is optimized to test as quickly as possible. For example, 'true' is returned immediately if 'value' is a number type.
     */
    function isValidNumericIndex(value) {
        var type = typeof value;
        if (type == 'number')
            return true;
        var str = type == 'string' ? value : '' + value;
        if (str.length == 1) { // (there's a faster test for only one character)
            var c = str.charCodeAt(0);
            if (c >= 48 && c <= 57)
                return true; // (optimization: http://jsperf.com/isnan-vs-check-first-char)
        }
        return Expression.NUMERIC_INDEX_REGEX.test(str);
    }
    FlowScript.isValidNumericIndex = isValidNumericIndex;
    // ========================================================================================================================
    /** The smallest executable element within FlowScript which specifies some action to be carried out.
     * An expression (in FlowScript) usually encompasses a component reference, arguments, return value targets, and event handlers.
     */
    var Expression = /** @class */ (function (_super) {
        __extends(Expression, _super);
        //?get expressions() { return this._expressions; }
        //?private _expressions: Expression[] = []; // (NOTE: This is an array, but only one statement per line is supported at this time for final output rendering)
        // --------------------------------------------------------------------------------------------------------------------
        function Expression(parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this) || this;
            _this._parent = parent;
            return _this;
        }
        Object.defineProperty(Expression.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "script", {
            get: function () { return this._parent ? this._parent.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "functionalComponent", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns the functional component this expression belongs to, or null otherwise.
              * Functional components (components that usually render to final code in some way [i.e. functions, operations, etc.])
              * have blocks with lines consisting of statements and expressions.  This function searches the parent expression tree
              * for the nearest functional component.
              */
            get: function () { return this._parent ? this._parent.functionalComponent : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "statement", {
            /** The statement this expression belongs to, or null otherwise. */
            get: function () { return this instanceof FlowScript.Statement ? this : this._parent ? this._parent.statement : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "line", {
            /** The line this expression belongs to, or null otherwise. */
            get: function () { return this._parent ? this._parent.line : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "blockExpression", {
            /** Return the nearest containing block expression if any, or null otherwise. */
            get: function () { return this instanceof FlowScript.BlockReference ? this : this._parent ? this._parent.blockExpression : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "block", {
            /** The block this expression belongs to, or null otherwise (simple shortcut for getting the 'blockExpression.block' reference). */
            get: function () { var bexpr = this.blockExpression; return bexpr ? bexpr.block : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "propertyExpression", {
            /** Return the nearest containing property expression if any, or null otherwise. */
            get: function () { return this instanceof FlowScript.PropertyReference ? this : this._parent ? this._parent.propertyExpression : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "property", {
            /** The property this expression is under, or null otherwise (simple shortcut for getting the 'propertyExpression.property' reference). */
            get: function () { var pexpr = this.propertyExpression; return pexpr ? pexpr.property : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "component", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The component that this expression references, or null if the expression doesn't reference components. */
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        Expression.prototype.containsChildExpression = function (expr) {
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Expression.prototype.save = function (target) {
            target = target || {};
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Copy this expression to a new expression instance for use elsewhere.
          * Since it is not permitted to use expression references in multiple places, a new instance is always required.
          * Closing expressions is a convenient way to duplicate expressions for use in multiple places.
          * Alternatively, an ExpressionReference object can reference other expressions.
          */
        Expression.prototype.clone = function (parent) {
            return this._clone(parent);
        };
        Expression.prototype._clone = function (parent) {
            return new Expression(parent);
        };
        Expression.prototype.remove = function (child) {
            if (child) {
                // ... 'this' is the parent, so find the reference and remove it ...
                return null; // (not found)
            }
            else {
                // ... no child given, so assume self ...
                if (this._parent)
                    var expr = this._parent.remove(this);
            }
            return expr ? expr : null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Calls 'expr.containsChildExpression(this)' on the given expression using 'this' expression and generates a cyclical error if found. */
        Expression.prototype.cyclicalCheck = function (expr) {
            if (expr)
                if (typeof expr != 'object' || !(expr instanceof Expression))
                    throw "Expressions.cyclicalCheck(expr): 'expr' is not an Expression object.";
                else if (expr.containsChildExpression(this))
                    throw "Cyclical error: You cannot use parent expressions (directly or indirectly) within themselves, or any nested child expressions. Clone the expression first and try again.";
        };
        /** Returns the immediate parent "with" statement, or 'null' if none. */
        Expression.prototype.getParentWith = function () {
            // ... statements can be nested due to nested blocks, so traverse the statements and any parent blocks ...
            var expr = this.blockExpression, statement;
            while (expr && (statement = expr.statement)) {
                if (statement.component.fullTypeName == FlowScript.System.With.fullTypeName)
                    return statement;
                expr = statement.blockExpression;
            }
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this expression object. */
        Expression.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** A regex used to test for numerical indexes. See 'isValidNumericIndex()' also. */
        Expression.NUMERIC_INDEX_REGEX = /^0|[1-9][0-9]*$/;
        /** A regex used to test for valid identifiers for the system. */
        Expression.VALID_IDENTIFIER_REGEX = /^[a-zA-z_$][a-zA-z0-9_$]*$/;
        return Expression;
    }(FlowScript.TrackableObject));
    FlowScript.Expression = Expression;
    /** References an expression for indirect use with other expressions. */
    var ExpressionReference = /** @class */ (function (_super) {
        __extends(ExpressionReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function ExpressionReference(expr, parent) {
            var _this = _super.call(this, parent) || this;
            if (!expr || typeof expr != 'object' || !(expr instanceof Expression))
                throw "A valid expression object is required.";
            _this._expr = expr;
            return _this;
        }
        Object.defineProperty(ExpressionReference.prototype, "expression", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The indirect expression that is referenced by this expression. */
            get: function () { return this._expr; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionReference.prototype._clone = function (parent) {
            return new ExpressionReference(this._expr, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionReference.prototype.save = function (target) {
            target = target || {};
            target.expression = this.expression.save();
            _super.prototype.save.call(this, target);
            return target;
        };
        ExpressionReference.prototype.load = function (target) {
            target = target || {};
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionReference.prototype.toString = function () { return "Expression reference: " + this._expr; };
        return ExpressionReference;
    }(Expression));
    FlowScript.ExpressionReference = ExpressionReference;
    /** A constant value expression.
      */
    var Constant = /** @class */ (function (_super) {
        __extends(Constant, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Constant(value) {
            var _this = _super.call(this, null) || this;
            _this.value = value;
            return _this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        Constant.prototype._clone = function (parent) {
            return new Constant(this.value);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Constant.prototype.save = function (target) {
            target = target || {};
            target.valueType = typeof this.value;
            if (target.valueType == 'object') {
                if (typeof this.value.save == 'function')
                    target.value = this.value.save(); // (just in case, support 
                else if (typeof JSON != 'object' || !JSON.stringify)
                    throw "Cannot serialize a constant object reference - 'JSON.stringify()' is required, but not found in this environment.";
                else
                    target.value = JSON.stringify(this.value);
            }
            else
                target.value = '' + this.value;
            _super.prototype.save.call(this, target);
            return target;
        };
        return Constant;
    }(Expression));
    FlowScript.Constant = Constant;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Controls access to object instance properties.
      * Property access security only applies to instance properties of object-based components (components that encapsulate object creation).
      */
    var PropertyAccessSecurity;
    (function (PropertyAccessSecurity) {
        /** (default) The property is only accessible by any component within the same project. */
        PropertyAccessSecurity[PropertyAccessSecurity["Internal"] = 0] = "Internal";
        /** The property is only accessible within the object-based component it is placed, and all nested functional components. */
        PropertyAccessSecurity[PropertyAccessSecurity["Private"] = 1] = "Private";
        /** The property is only accessible within the object-based component it is placed, and all nested functional components, including those of derived types. */
        PropertyAccessSecurity[PropertyAccessSecurity["Protected"] = 2] = "Protected";
        /** The property is accessible by any component from any project. */
        PropertyAccessSecurity[PropertyAccessSecurity["Public"] = 3] = "Public";
    })(PropertyAccessSecurity = FlowScript.PropertyAccessSecurity || (FlowScript.PropertyAccessSecurity = {}));
    // ========================================================================================================================
    /** Properties are used with processes and components to store values.
     * In FlowScript, a component's parameters, static properties, and local variables are all in the same local scope.
     * Component properties define the context property names that will be used for that component during runtime.
     */
    var Property = /** @class */ (function (_super) {
        __extends(Property, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Property(owner, validTypes, name, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this) || this;
            _this._collection = owner;
            if (options.isAlias && options.isConst)
                throw "A property cannot be both an alias (which represents a variable), and a constant.";
            _this._validTypes = validTypes;
            _this._name = name;
            if (options.initialValue !== FlowScript.undefined)
                _this._value = options.initialValue;
            if (options.validation !== FlowScript.undefined)
                _this.validationRegexStr = options.validation;
            if (options.isOptional !== FlowScript.undefined)
                _this._isOptional = options.isOptional;
            if (options.isStatic !== FlowScript.undefined)
                _this._isStatic = options.isStatic;
            if (options.isConst !== FlowScript.undefined)
                _this._isConst = options.isConst;
            if (options.isAlias !== FlowScript.undefined)
                _this._isAlias = options.isAlias;
            if (options.isInstance !== FlowScript.undefined)
                _this._isInstance = options.isInstance;
            return _this;
        }
        Object.defineProperty(Property.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this.component ? this.component.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "component", {
            /** The component that this property is for. */
            get: function () { return this._collection ? this._collection.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "collection", {
            /** A reference to the property collection that contains this property. */
            get: function () { return this._collection; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "referenceStr", {
            /** An instance reference string that represents this block in the system. */
            get: function () {
                // ... find out which collection it belongs to ...
                var comp = this.component, collectionName;
                if (comp) {
                    if (comp.parameters.hasPropertyReference(this))
                        collectionName = "parameters";
                    else if (comp.localVars.hasPropertyReference(this))
                        collectionName = "localVars";
                    else if (comp.returnVars.hasPropertyReference(this))
                        collectionName = "returnVars";
                }
                if (comp && collectionName)
                    return comp.referenceStr + "." + collectionName + ".getProperty('" + this.name + "')";
                else
                    return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Property.prototype.getReference = function () {
            if (this.script)
                return new FlowScript.NamedReference(this.script, this.referenceStr);
            else
                return new FlowScript.NamedReference(this, null);
        };
        /** Creates an expression wrapper for this property. An optional expression parent can be given. */
        Property.prototype.createExpression = function (parent) {
            return new PropertyReference(this, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Property.prototype.save = function (target) {
            target = target || {};
            target.name = this._name;
            target.value = this._value;
            target.isConst = this._isConst;
            target.isStatic = this._isStatic;
            target.isOptional = this._isOptional;
            target.isAlias = this._isAlias;
            target.isInstance = this._isInstance;
            target.validationRegex = this._validationRegex ? this._validationRegex.source : null;
            target.selections = this._selections ? this._selections.slice() : null;
            target.description = this._value;
            target.implicitlyDefined = this._value;
            target.explicitlyDefined = this._value;
            target.isFixedtoEnum = this._value;
            target.locked = this._value;
            _super.prototype.save.call(this, target);
            return target;
        };
        Object.defineProperty(Property.prototype, "validTypes", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._validTypes; },
            enumerable: true,
            configurable: true
        });
        Property.prototype.setValidTypes = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i] = arguments[_i];
            }
            this._validTypes = types;
            return this;
        };
        Property.prototype.setDescription = function (desc) { this._description = desc; return this; };
        Object.defineProperty(Property.prototype, "validationRegex", {
            get: function () { return this._validationRegex; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "validationRegexStr", {
            set: function (pattern) {
                this._validationRegex = new RegExp(pattern);
            },
            enumerable: true,
            configurable: true
        });
        Property.prototype._getIdentityMsg = function () {
            return "'" + this.name + "'" + (this.component ? " on component '" + this.component.fullTypeName + "'" : "");
        };
        Object.defineProperty(Property.prototype, "value", {
            get: function () { return this._value; },
            set: function (value) {
                if (this._isConst)
                    throw "Cannot set constant property " + this._getIdentityMsg() + " to value '" + value + "'.";
                if (value !== void 0 && this._validationRegex)
                    if (typeof value === 'string' && !this._validationRegex.test(value) || !this._validationRegex.test('' + value))
                        throw "Cannot set property " + this._getIdentityMsg() + " to value '" + value + "': Does not match pattern '" + this._validationRegex.source + "'.";
                this._value = value;
            },
            enumerable: true,
            configurable: true
        });
        ///** Makes this property reference a set of values as dictated by the specified enum type.
        //  * If 'isFixed' is true (the default), then the developer is forced to select from this list only (no other values allowed).
        //  */
        //setEnum(enm: Enum, isFixed: boolean = true): Property {
        //    this._enum = enm;
        //    this._isFixedtoEnum = isFixed;
        //    return this;
        //}
        Property.prototype.remove = function () {
            if (this._collection)
                this._collection.remove(this);
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Property.prototype.toString = function () { return this.component + "::" + this.name; };
        Property.DEFAULT_NAME = '@';
        return Property;
    }(FlowScript.TrackableObject));
    FlowScript.Property = Property;
    // ========================================================================================================================
    var PropertyCollection = /** @class */ (function () {
        function PropertyCollection(owner, copyFrom) {
            this._properties = [];
            this._propertyNamedIndex = {};
            this._length = 0;
            // --------------------------------------------------------------------------------------------------------------------
            this._addedEvent = new FlowScript.EventDispatcher(this);
            this._removingEvent = new FlowScript.EventDispatcher(this);
            this._removedEvent = new FlowScript.EventDispatcher(this);
            this._component = owner;
            if (copyFrom && copyFrom._length)
                for (var i = 0, n = copyFrom._length; i < n; ++i)
                    this.push(copyFrom._properties[i]);
        }
        Object.defineProperty(PropertyCollection.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._component ? this._component.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyCollection.prototype, "component", {
            get: function () { return this._component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyCollection.prototype, "length", {
            get: function () { return this._length; },
            enumerable: true,
            configurable: true
        });
        /** Adds a callback that triggers just before a property is being removed. */
        PropertyCollection.prototype.onadded = function (func, data) { this._addedEvent.add(func, data); };
        PropertyCollection.prototype._doOnAdded = function (p) { this._addedEvent.trigger(this, p); };
        /** Adds a callback that triggers just before a property is being removed. */
        PropertyCollection.prototype.onremoving = function (func, data) { this._removingEvent.add(func, data); };
        PropertyCollection.prototype._doOnRemoving = function (p) { this._removingEvent.trigger(this, p); };
        /** Adds a callback that triggers just after a property is removed. */
        PropertyCollection.prototype.onremoved = function (func, data) { this._removedEvent.add(func, data); };
        PropertyCollection.prototype._doOnRemoved = function (p) { this._removedEvent.trigger(this, p); };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns true if a property by the specified name already exists.
        * If 'ignore' is specified, that property is ignored. This is used to check new names for renaming purposes.
        */
        PropertyCollection.prototype.hasProperty = function (name, ignore) {
            var p = !!this._propertyNamedIndex && this._propertyNamedIndex[name];
            return p && p != ignore;
        };
        /** Returns true if the specified property exists in this collection.
        */
        PropertyCollection.prototype.hasPropertyReference = function (property) {
            return this._properties.indexOf(property) >= 0;
        };
        /** Returns the index of the property that matches the specified name, or -1 if not found. */
        PropertyCollection.prototype.indexOf = function (name) {
            for (var i = 0, n = this._properties.length; i < n; ++i)
                if (this._properties[i].name == name)
                    return i;
            return -1;
        };
        PropertyCollection.prototype.getProperty = function (nameOrIndex) { return typeof nameOrIndex == 'number' ? this._properties[nameOrIndex] : this._propertyNamedIndex[nameOrIndex]; };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a new property to the collection. */
        PropertyCollection.prototype.push = function (p) {
            if (typeof p != 'object' || !(p instanceof Property) || !p.name)
                throw "Cannot add property to collection: The given argument is not a property, or the name is empty.";
            if (this.hasProperty(p.name))
                throw "Property '" + p + "' already exists in this collection.";
            this._properties.push(p);
            this._propertyNamedIndex[p.name] = p;
            p._collection = this;
            ++this._length;
            this._doOnAdded(p);
            return p;
        };
        /** Adds a property to the collection, replacing any existing property of the same name (only allowed one explicit replace to help debugging). */
        PropertyCollection.prototype.replace = function (p) {
            if (typeof p != 'object' || !(p instanceof Property) || !p.name)
                throw "Cannot add property to collection: The given argument is not a property, or the name is empty.";
            var i = this.indexOf(p.name);
            if (i >= 0) {
                if (this._properties[i]._explicitlyDefined)
                    throw "Property '" + p + "' is already explicitly defined and cannot be replaced again without first removing it from the collection.";
                this._properties[i] = p;
                this._propertyNamedIndex[p.name] = p;
                p._collection = this;
            }
            else
                p = this.push(p);
            return p;
        };
        PropertyCollection.prototype._lockCheck = function (p) { if (p && p._locked)
            throw "Property '" + p + "' cannot be removed."; };
        PropertyCollection.prototype.remove = function (pOrIndex) {
            if (typeof pOrIndex == 'object' && pOrIndex instanceof Property)
                pOrIndex = pOrIndex.name;
            if (typeof pOrIndex == 'number') {
                var p = this._properties[pOrIndex];
                this._lockCheck(p);
                if (p) {
                    this._doOnRemoving(p);
                    this._propertyNamedIndex[p.name] = FlowScript.undefined;
                    --this._length;
                    p._collection = null;
                    p = this._properties.splice(pOrIndex, 1)[0];
                    this._doOnRemoved(p);
                    return p;
                }
            }
            else {
                if (typeof pOrIndex != 'string')
                    pOrIndex = '' + pOrIndex;
                var i = this.indexOf(pOrIndex);
                if (i >= 0) {
                    var p = this._properties[i];
                    this._doOnRemoving(p);
                    this._lockCheck(p);
                    this._propertyNamedIndex[pOrIndex] = FlowScript.undefined;
                    --this._length;
                    p._collection = null;
                    p = this._properties.splice(i, 1)[0];
                    this._doOnRemoved(p);
                    return p;
                }
            }
        };
        // --------------------------------------------------------------------------------------------------------------------
        PropertyCollection.prototype.pop = function () {
            if (!this._properties.length)
                return void 0;
            var p = this._properties[this._properties.length - 1];
            this._lockCheck(p);
            this._doOnRemoving(p);
            p = this._properties.pop();
            delete this._propertyNamedIndex[p.name];
            --this._length;
            p._collection = null;
            this._doOnRemoved(p);
            return p;
        };
        PropertyCollection.prototype.unshift = function (p) {
            if (typeof p != 'object' || !(p instanceof Property) || !p.name)
                throw "Cannot add property to collection: The given argument is not a property, or the name is empty.";
            if (this.hasProperty(p.name))
                throw "Property '" + p + "' already exists in this collection.";
            this._properties.unshift(p);
            this._propertyNamedIndex[p.name] = p;
            ++this._length;
            p._collection = this;
            this._doOnAdded(p);
            return p;
        };
        PropertyCollection.prototype.shift = function () {
            if (!this._properties.length)
                return void 0;
            var p = this._properties[0];
            this._lockCheck(p);
            this._doOnRemoving(p);
            p = this._properties.shift();
            delete this._propertyNamedIndex[p.name];
            --this._length;
            p._collection = null;
            this._doOnRemoved(p);
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Clear all properties from this collection. */
        PropertyCollection.prototype.clear = function () {
            for (var i = this._properties.length - 1; i >= 0; --i)
                this.remove(i);
        };
        // --------------------------------------------------------------------------------------------------------------------
        PropertyCollection.prototype.save = function (target) {
            target = target || {};
            target.properties = [];
            for (var i = 0, n = this._properties.length; i < n; ++i)
                target.properties[i] = this._properties[i].save();
            return target;
        };
        return PropertyCollection;
    }());
    FlowScript.PropertyCollection = PropertyCollection;
    /** References a component property for use in expressions. */
    var PropertyReference = /** @class */ (function (_super) {
        __extends(PropertyReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function PropertyReference(property, parent) {
            var _this = _super.call(this, parent) || this;
            if (!property || typeof property != 'object' || !(property instanceof Property))
                throw "A valid property object is required.";
            _this._propertyRef = property.getReference();
            return _this;
        }
        Object.defineProperty(PropertyReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._propertyRef ? this.property.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyReference.prototype, "property", {
            /** The property object that is referenced. */
            get: function () { return this._propertyRef.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyReference.prototype, "propertyRef", {
            get: function () { return this._propertyRef; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyReference.prototype, "name", {
            /** The name of the referenced property. */
            get: function () { return this.property.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyReference.prototype, "component", {
            /** The component that the referenced property belongs to. */
            get: function () { return this.property.component; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        PropertyReference.prototype._clone = function (parent) {
            return new PropertyReference(this.property, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        PropertyReference.prototype.save = function (target) {
            target = target || {};
            var prop = this.property;
            target.propertyPath = (prop.component ? prop.component.fullTypeName : "") + ":" + prop.name;
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        PropertyReference.prototype.toString = function () { return this._propertyRef.toString(); };
        return PropertyReference;
    }(FlowScript.Expression));
    FlowScript.PropertyReference = PropertyReference;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    ;
    // ========================================================================================================================
    var ComponentTypes;
    (function (ComponentTypes) {
        /** The component exists for commenting purposes only. */
        ComponentTypes[ComponentTypes["Comment"] = 0] = "Comment";
        /** The component represents a single value cast or modification (like type casting, or 'not' inversion).
          * These components are expected to only accept one argument, and return one value.
          */
        ComponentTypes[ComponentTypes["Unary"] = 1] = "Unary";
        /** The component script will be parsed for an expression that can be nested in another expression.
          * These components are expected to only accept two arguments (like math and comparison operators).
          */
        ComponentTypes[ComponentTypes["Operation"] = 2] = "Operation";
        /** The component is used for assignment of a single parameter to a single variable.
          */
        ComponentTypes[ComponentTypes["Assignment"] = 3] = "Assignment";
        /** The component is used to control execution flow (if, for, while, etc.), and cannot be used in operations.
          */
        ComponentTypes[ComponentTypes["ControlFlow"] = 4] = "ControlFlow";
        /** The component renders to a block of lines, and can be placed anywhere a code block is expected (see Core.With).
          * Note: While this can be set explicitly, most components are implicitly viewed as a 1-line blocks by default.
          */
        ComponentTypes[ComponentTypes["CodeBlock"] = 5] = "CodeBlock";
        /** The component represents a complete callable function.
          * Note: In the IDE, all scripting is done using *visual* components.  At runtime however, only "functional" components
          * remain, as compile time optimization collapses and inlines all others.
          */
        ComponentTypes[ComponentTypes["Functional"] = 6] = "Functional";
        /** The component represents a single custom expression to be rendered.
          * Examples include quick complex equations, native instance function calls, etc.
          * Note: These components expect only one 'System.Code' component line, in which the custom code is also on a single
          * line. In addition, custom expressions cannot be "stepped" into during simulations.
          */
        ComponentTypes[ComponentTypes["Expression"] = 7] = "Expression";
        /** The component represents an object type. Object types are also functional types, but convert other objects to their
          * own type where supported.
          */
        ComponentTypes[ComponentTypes["Object"] = 8] = "Object";
        /** The component is used for rendering text.
          * These components are useful for rendering text content for text-based operations.  That means the result of these
          * components can be used for passing as "string" arguments to other components, or for simply rendering text documents,
          * such as HTML, CSS, etc.
          */
        ComponentTypes[ComponentTypes["Text"] = 9] = "Text";
        /** The component is used for rendering custom code.
          */
        ComponentTypes[ComponentTypes["Code"] = 10] = "Code";
        /** The component represents a *component* type only and does not actually perform any action or operation.
          * Note 1: All components are inherently types.
          * Note 2: Don't inherit from component to set this unless needed.  Instead, inherit directly from the "Type" class.
          */
        ComponentTypes[ComponentTypes["Type"] = 11] = "Type";
    })(ComponentTypes = FlowScript.ComponentTypes || (FlowScript.ComponentTypes = {}));
    /** Components represent functional part of script code, whether is be expressions, or an entire function.  Most components
    * have input properties that produce some desired action or output.
    * Components do not have any instances.  In FlowScript, "instances" are simply data structures that have functions/methods
    * that work on them, or static functions that can be shared without any instance required at all. For data, the "Table"
    * type is used.
    * All components are "static" in nature, and can be called and/or reused at any time, as long as any required data schema
    * elements expected by the component are present.
    */
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Component(parent, componentType, typeName, signatureTitle, script) {
            var _this = _super.call(this, parent, typeName, script) || this;
            _this._parameters = new FlowScript.PropertyCollection(_this);
            _this._localVars = new FlowScript.PropertyCollection(_this);
            _this._returnVars = new FlowScript.PropertyCollection(_this);
            _this._instanceProperties = new FlowScript.PropertyCollection(_this); // (holds vars that get rendered as object instance-based properties; these are completely separate from parameters and local vars, which are viewed together as one big list)
            _this._embeddedTypes = [];
            _this._events = [];
            _this._componentType = componentType;
            if (signatureTitle) {
                if (!_this.name)
                    _this.name = signatureTitle;
                _this.title = signatureTitle;
            }
            else if (_this.name)
                _this.title = _this.name;
            else
                throw "A component name or title is required.";
            // ... attached some events, such as removing return vars when a corresponding parameter or local var is removed ...
            _this._parameters.onremoving(function (col, p) {
                var retProp = _this.returnVars.getProperty(p.name);
                if (retProp)
                    retProp.remove();
            });
            _this._localVars.onremoving(function (col, p) {
                var retProp = _this.returnVars.getProperty(p.name);
                if (retProp)
                    retProp.remove();
            });
            _this.addBlock(); // (create a default block [all components get one default block])
            return _this;
        }
        Object.defineProperty(Component.prototype, "title", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The title of this component. */
            get: function () { return this._title; },
            set: function (title) {
                if (title == this._title)
                    return; // (same title, nothing to do)
                // ... parse any tokens and create the parameters ...
                this._titleParseResult = Component.parseTitle(title, this.script);
                var params = this._titleParseResult.parameters;
                var newTitleParams = [];
                for (var i = 0, n = params.length; i < n; ++i) {
                    var p = params[i];
                    // ... if there is an existing title param, reuse it! (don't remove, unless necessary, in case the user has it configured) ...
                    if (this._titleParams)
                        for (var i2 = 0, n2 = this._titleParams.length; i2 < n2; ++i2)
                            if (this._titleParams[i2].name == p.name) {
                                newTitleParams.push(this._titleParams[i2]);
                                this._titleParams.splice(i2, 1);
                                p = null;
                                break;
                            }
                    if (p) {
                        p._locked = true;
                        newTitleParams.push(p);
                        this._parameters.push(p); // (use 'push' here to prevent duplicates within the title)
                    }
                }
                // ... clear any title parameters left in the old list before setting the new list ...
                if (this._titleParams)
                    for (var i = 0, n = this._titleParams.length; i < n; ++i) {
                        var p = this._titleParams[i];
                        p._locked = false;
                        p.remove();
                    }
                this._titleParams = newTitleParams;
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "titleParseResult", {
            /** Returns the parse result after setting the component's title. */
            get: function () { return this._titleParseResult; },
            enumerable: true,
            configurable: true
        });
        /** Parses the title and returns a property list that can be added to the parameters collection. */
        Component.parseTitle = function (title, script) {
            if (typeof title != 'string')
                title = '' + title;
            title = title.replace(/\$\$/g, "\x01");
            var result = { parameters: [], titleParts: title.split(Component.TITLE_TOKEN_SEARCH_REGEX) || [] };
            for (var i = 0, n = result.titleParts.length; i < n; ++i)
                result.titleParts[i] = result.titleParts[i].replace(/\u0001/g, '$'); // (convert the $$ placeholders [\x01] into a single $)
            var tokens = title.match(Component.TITLE_TOKEN_SEARCH_REGEX), token, isOptional;
            if (tokens)
                for (var i = 0, n = tokens.length; i < n; ++i) {
                    token = tokens[i];
                    token = token.replace(/\\\$/g, '$'); // (convert '\$' to just '$' in token names)
                    if (!Component.TITLE_TOKEN_VALIDATE_REGEX.test(token))
                        throw "Title parameter '" + token + "' is not valid. Remember to use typical valid identifier names in the format '$[?]<a-z|A-Z|_>[a-z|A-Z|0-9|_]*' (example: '$x', '$?y01'; note that identifiers cannot start with a number; '?' makes a parameter optional).";
                    if (isOptional = (token[1] == '?'))
                        token = token.substring(2);
                    else
                        token = token.substring(1);
                    if (!token)
                        throw "Title parameter '" + tokens[i] + "' for component '" + this + "' is empty or invalid.";
                    var p = new FlowScript.Property(null, [script ? script.System.Any : FlowScript.System.Any], token, { isOptional: isOptional });
                    p._implicitlyDefined = true;
                    result.parameters.push(p);
                }
            return result;
        };
        Object.defineProperty(Component.prototype, "blocks", {
            //? /** Parses the title and returns a property list that can be added to the parameters collection. (the current parameters collection is not affected) */
            //? _parseTitle(title: string): Property[] {
            //    var params: Property[] = [];
            //    var tokens = ('' + title).match(Component.TITLE_TOKEN_SEARCH_REGEX), token: string, isOptional: boolean;
            //    if (tokens)
            //        for (var i = 0, n = tokens.length; i < n; ++i) {
            //            token = tokens[i];
            //            if (token != "$$") {
            //                if (isOptional = (token[1] == '?'))
            //                    token = token.substring(2);
            //                else
            //                    token = token.substring(1);
            //                if (!token)
            //                    throw "Title parameter '" + tokens[i] + "' for component '" + this + "' is empty or invalid.";
            //                var p = new Property(null, [this.script.System.Any], token, { isOptional: isOptional });
            //                p._implicitlyDefined = true;
            //                params.push(p);
            //            }
            //        }
            //    return params;
            //}
            /** Script blocks for this component. */
            get: function () { return this._blocks; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "block", {
            /** Gets the first block for this component.
              * All functional components have one block by default. More blocks are added if component represents an argument value
              * passed to another components parameter, or as a closure callback function [which should never be used for events].
              */
            get: function () { return this._blocks[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "parameters", {
            /** Parameter variables for this component. */
            get: function () { return this._parameters; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "localVars", {
            /** Local variables for this component. */
            get: function () { return this._localVars; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "returnVars", {
            /** Return variables for this component. */
            get: function () { return this._returnVars; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "instanceProperties", {
            /** Instance variables for this component. */
            get: function () { return this._instanceProperties; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "embeddedTypes", {
            /** Object components embed properties from other associated objects into sub-objects. At compile time, if there are no conflicts, the embedded objects get merged into their host objects for efficiency. */
            get: function () { return this._embeddedTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "instanceType", {
            get: function () { return this._instanceType; },
            set: function (value) {
                if (value && (typeof value != 'object' || !(value instanceof FlowScript.Type)))
                    throw "Invalid instance type: Must be a 'Type' or 'Component' object.";
                var cleared = this._instanceType && !value;
                this._instanceType = value || void 0;
                if (cleared)
                    this.instanceProperties.clear();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "events", {
            get: function () { return this._events; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "componentType", {
            get: function () { return this._componentType; },
            set: function (value) {
                this._componentType = value;
                //?switch (this._componentType) {
                //    case ComponentTypes.Comment: break;
                //    case ComponentTypes.Unary: break;
                //    case ComponentTypes.Operation: break;
                //    case ComponentTypes.Assignment: break;
                //    case ComponentTypes.ControlFlow: break;
                //    case ComponentTypes.CodeBlock: break;
                //    case ComponentTypes.Functional: break;
                //    case ComponentTypes.Expression: break;
                //    case ComponentTypes.Object: break;
                //    case ComponentTypes.Text: break;
                //    case ComponentTypes.Code: break;
                //    case ComponentTypes.Type: break;
                //}
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "function", {
            get: function () { return this._function; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "defaultReturn", {
            /** Returns the default return property, which must be one single return definition, otherwise 'undefined' is returned. */
            get: function () {
                return this._returnVars.getProperty(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "isOperational", {
            /** Returns true if this component results in a value that can be used in an operation. */
            get: function () {
                switch (this._componentType) {
                    case ComponentTypes.Assignment:
                    case ComponentTypes.Operation:
                    case ComponentTypes.Unary:
                    case ComponentTypes.Expression:
                    case ComponentTypes.Text:
                        return true;
                }
                return !!this.defaultReturn;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "isObject", {
            get: function () {
                return this._componentType == ComponentTypes.Object; //? || this.assignableTo(this.script.System.Object);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "hasDataObjectTypeParent", {
            /** Returns true if the parent is an object type for holding data properties. */
            get: function () {
                return this.parent && this.parent instanceof Component && this.parent._componentType == ComponentTypes.Object;
            },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        Component.prototype.save = function (target) {
            target = target || {};
            target.title = this.title;
            target.blocks = [];
            for (var i = 0, n = this._blocks.length; i < n; ++i)
                target.blocks[i] = this._blocks[i].save();
            target.parameters = this._parameters.save();
            target.localVars = this._localVars.save();
            target.returnVars = this._returnVars.save();
            target.instanceProperties = this._instanceProperties.save();
            target.events = [];
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.prototype.addBlock = function (block) {
            if (block) {
                var comp = block['_component'];
                if (comp != this)
                    comp.removeBlock(block);
            }
            else
                block = new FlowScript.Block(null);
            block['_component'] = this;
            if (!this._blocks)
                this._blocks = [];
            this._blocks.push(block);
            return block;
        };
        Component.prototype.removeBlock = function (block) {
            var i = this._blocks ? this._blocks.indexOf(block) : -1;
            if (i >= 0) {
                var block = this._blocks.splice(i, 1)[0];
                block['_component'] = null;
                return block;
            }
            throw "Cannot remove the code block: it does not belong to this component.";
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.prototype._checkName = function (name, allowNullOrEmpty) {
            if (allowNullOrEmpty === void 0) { allowNullOrEmpty = false; }
            if (name !== null) {
                if (typeof name != 'string')
                    name = '' + name;
                name = name.trim();
            }
            if (name === FlowScript.undefined)
                name = null;
            if (name) {
                if (name.indexOf("'") >= 0)
                    throw "Single quote not yet supported, and will cause errors."; // TODO: Fix property names containing single quote errors.
                if (name.substring(0, 3) == '$__')
                    throw "Names cannot start with the special system reserved prefix of '$__'.";
            }
            else if (!allowNullOrEmpty)
                throw "A name is required.";
            return name;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches parameters, local variables, and return variables for a property matching a specified name. */
        Component.prototype.getProperty = function (name) {
            name = this._checkName(name, true);
            if (!name || name == FlowScript.Property.DEFAULT_NAME)
                return this._returnVars.getProperty(FlowScript.Property.DEFAULT_NAME);
            return this._parameters.getProperty(name)
                || this._localVars.getProperty(name)
                || FlowScript.undefined;
        };
        Component.prototype.hasParameter = function (nameOrIndex) {
            if (FlowScript.isValidNumericIndex(nameOrIndex)) {
                var i = +nameOrIndex;
                return i >= 0 && i < this._parameters.length;
            }
            else {
                var name = this._checkName(nameOrIndex);
                return this._parameters.hasProperty(name);
            }
        };
        /** Searches parameters, local variables, and return variables for a property matching a specified name, and returns true if found. */
        Component.prototype.hasProperty = function (name) {
            name = this._checkName(name, true);
            if (!name || name == FlowScript.Property.DEFAULT_NAME)
                return this._returnVars.hasProperty(FlowScript.Property.DEFAULT_NAME);
            return this._parameters.hasProperty(name)
                || this._localVars.hasProperty(name);
        };
        /** Searches instance properties for a property matching a specified name.
          * @param {boolean} ownProperty If true, then only properties that belong to this component are searched.
          */
        Component.prototype.getInstanceProperty = function (name, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            name = this._checkName(name, true);
            // ... check inheritance ...
            var type = this;
            while (type) {
                if (type instanceof Component && type.isObject) {
                    var p = type._instanceProperties.getProperty(name);
                    if (p)
                        return p;
                    if (ownProperty)
                        break;
                }
                type = type.superType;
            }
            return;
        };
        /** Searches instance properties in the parent chain for a property matching a specified name, and returns true if found.
          * @param {boolean } ownProperty If true then only properties that belong to this object are checked.
          */
        Component.prototype.hasInstanceProperty = function (name, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            name = this._checkName(name, true);
            // ... check inheritance ...
            var type = this;
            while (type) {
                if (type instanceof Component && type.isObject) {
                    if (type._instanceProperties.hasProperty(name))
                        return true;
                    if (ownProperty)
                        break;
                }
                type = type.superType;
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give parameter name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateParameterName = function (name, ignore) {
            name = this._checkName(name);
            if (this._localVars.hasProperty(name, ignore))
                throw "Parameter '" + name + "' is already defined as a local variable.";
            //?if (this._returnVars.hasProperty(name, ignore))
            //    throw "Parameter '" + name + "' is already defined as a return variable.";
            if (!this._parameters.hasProperty(name, ignore)) // (must already exist via the title! [a default property is set for each title token])
                throw "Parameter '" + name + "' does not exist.  Please check the spelling, and make sure the component's title has a related token name first.";
            return name;
        };
        /** Further define component's parameter. */
        Component.prototype.defineParameter = function (name, validTypes, initialValue, validation, isOptional, isConst, isAlias) {
            name = this._validateParameterName(name);
            var p = new FlowScript.Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isOptional: isOptional, isConst: isConst, isAlias: isAlias });
            p._explicitlyDefined = true;
            this._parameters.replace(p);
            return p;
        };
        Component.prototype.renameParameter = function (prop, newName) {
            var p = this._parameters.getProperty(typeof prop == "string" ? prop : prop.name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no parameter named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateParameterName(newName, p);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeParameter = function (prop) {
            var p = this._parameters.getProperty(typeof prop == "string" ? prop : prop.name);
            if (p) {
                if (this._titleParams && this._titleParams.indexOf(p) >= 0)
                    throw "You cannot remove a component title parameter.";
                p.remove();
            }
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give local variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateLocalVarName = function (name, ignore) {
            name = this._checkName(name);
            if (this._localVars.hasProperty(name, ignore))
                throw "The local variable'" + name + "' is already defined.";
            if (this._parameters.hasProperty(name, ignore))
                throw "'" + name + "' is already defined as a parameter.";
            //?if (this._returnVars.hasProperty(name, ignore))
            //    throw "Parameter '" + name + "' is already defined as a return variable.";
            return name;
        };
        /** Defines a new local variable for this component. */
        Component.prototype.defineLocalVar = function (name, validTypes, initialValue, validation, isOptional, isStatic) {
            name = this._validateLocalVarName(name);
            var p = new FlowScript.Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isOptional: isOptional, isStatic: isStatic });
            p._explicitlyDefined = true;
            this._localVars.push(p);
            return p;
        };
        Component.prototype.renameLocalVar = function (prop, newName) {
            var p = this._localVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no local variable named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateLocalVarName(newName, p);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeLocalVar = function (prop) {
            var p = this._localVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (p)
                p.remove();
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give return variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateReturnVarName = function (name) {
            name = this._checkName(name, true);
            if (!name) {
                if (this._returnVars.length)
                    throw "Returns have already been defined for this component.  A default return must be the first definition.";
            }
            else {
                if (!this.getProperty(name))
                    throw "Cannot define return '" + name + "': No parameter or local variable has been defined with that name yet.";
            }
            return name;
        };
        /** Defines a new local variable to use as a return value for this component.
          * To define a default return value for this functional component, pass in 'null'/undefined for the name.
          */
        Component.prototype.defineReturnVar = function (name, returnType) {
            if (returnType === void 0) { returnType = FlowScript.System.Any; }
            name = this._validateReturnVarName(name);
            var p = new FlowScript.Property(null, [returnType], name || FlowScript.Property.DEFAULT_NAME);
            p._explicitlyDefined = true;
            this._returnVars.push(p);
            return p;
        };
        /** Defines a default return value for this functional component.
          * When default returns are defined, a running expression variable tracks each executed expression and returns the last
          * expression executed.
          */
        Component.prototype.defineDefaultReturnVar = function (returnType) {
            if (returnType === void 0) { returnType = FlowScript.System.Any; }
            return this.defineReturnVar(null, returnType);
        };
        Component.prototype.renameReturnVar = function (prop, newName) {
            var p = this._returnVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no local variable named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateReturnVarName(newName);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeReturnVar = function (prop) {
            var p = this._returnVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (p)
                p.remove();
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give instance variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateInstancePropertyName = function (name, ignore) {
            if (!this._instanceType)
                throw "You must set the instance type before you can add instance properties.";
            name = this._checkName(name);
            var p = this.getInstanceProperty(name);
            if (p && p != ignore)
                if (p.component == this)
                    throw "Instance property '" + name + "' is already defined on this component ('" + this + "').";
                else
                    throw "Instance property '" + name + "' is already defined on the parent type '" + p.component + "'.";
            return name;
        };
        /** Defines a new local instance related variable for this component. */
        Component.prototype.defineInstanceProperty = function (name, validTypes, initialValue, validation) {
            name = this._validateInstancePropertyName(name);
            var p = new FlowScript.Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isInstance: true });
            p._explicitlyDefined = true;
            this._instanceProperties.push(p);
            return p;
        };
        Component.prototype.renameInstanceProperty = function (prop, newName, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            var p = this.getInstanceProperty(typeof prop == "string" ? prop : prop.name, ownProperty);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no instance property named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateInstancePropertyName(newName, p);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeInstanceProperty = function (prop, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            var p = this.getInstanceProperty(typeof prop == "string" ? prop : prop.name, ownProperty);
            if (p)
                p.remove();
            return p;
        };
        /** Defines the instance type expected by this component (the instance type this component can work with). If this is
          * set, this component can only be called in object contexts using special statements. Example: the "with" component.
          */
        Component.prototype.defineInstanceType = function (type) {
            this._instanceType = type;
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Register a callback event. */
        Component.prototype.registerEvent = function (name) {
            //?var ev = new Event(this, name);
            //?this._events.push(ev);
            //?return ev;
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Configures a new runtime context with the supplied arguments. */
        Component.prototype.configureRuntimeContext = function (ctx, args) {
            if (typeof args == 'object')
                for (var p in args)
                    if (!FlowScript.Expression.NUMERIC_INDEX_REGEX.test(p) && !this.hasProperty(p))
                        throw "Component '" + this + "' does not contain a parameter or local variable named '" + p + "'.";
                    else
                        this.setArgument(p, args[p], ctx.arguments);
            //throw "Invalid arguments: There is no parameter, local, or return property named '" + name + "' in component '" + this + "'.";
            return ctx;
        };
        Component.prototype.setArgument = function (argIndex, value, target) {
            var expectedParameters = this._parameters;
            // ... both the parameter name AND index must bet set; pull the parameter name if an index is given, or the parameter index if a name is given ...
            if (FlowScript.isValidNumericIndex(argIndex)) {
                var i = +argIndex, name = i >= 0 && i < expectedParameters.length ? expectedParameters.getProperty(i).name : '@' + i; // (an index outside the number of parameters sets the "optional" arguments)
                if (i < 0)
                    throw "Cannot set argument at '" + i + "' to '" + value + "': Argument index must be >= 0";
            }
            else {
                name = argIndex;
                i = expectedParameters.indexOf(name); // (check first if there's a matching parameter by the same name, and if so, set the target property name)
                if (i < 0)
                    throw "Cannot set argument '" + name + "' to '" + value + "': There is no parameter '" + name + "' defined on component '" + this + "'.";
            }
            // var existingValue = target[name];
            if (value === void 0) { // (setting an argument to 'undefined' removes the parameter value)
                delete target[i]; // (delete index that stores the parameter name)
                delete target[name]; // (delete the value stored in the property of the target identified by the parameter name)
            }
            else {
                //? if (i in target)
                //    throw "An argument was already supplied for parameter '" + i + "' of component '" + this + "'.";
                // (these were added to prevent bugs setting arguments multiple times, but doesn't work well in practice [for all scenarios])
                //? if (name in target)
                //    throw "An argument was already supplied for parameter '" + name + "' of component '" + this + "'.";
                target[target[i] = name] = value;
            }
            return value;
        };
        Component.prototype.getArgument = function (argIndex, target) {
            var expectedParameters = this._parameters;
            // ... both the parameter name AND index must bet set; pull the parameter name if an index is given, or the parameter index if a name is given ...
            if (FlowScript.isValidNumericIndex(argIndex)) {
                var i = +argIndex, name = i >= 0 && i < expectedParameters.length ? expectedParameters.getProperty(i).name : '@' + i; // (an index outside the number of parameters sets the "optional" arguments)
                if (i < 0)
                    throw "Argument index must be >= 0";
            }
            else {
                name = argIndex;
                i = expectedParameters.indexOf(name); // (check first if there's a matching parameter by the same name, and if so, set the target property name)
                if (i < 0)
                    throw "There is no parameter '" + name + "' defined on component '" + this + "'.";
            }
            return target[name];
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the first block. */
        Component.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            // ... add the parameters for this component ...
            //add via expressions only, using ComponentReference / if (this._parameters.length)
            //    for (var i = 0, n = this._parameters.length; i < n; ++i)
            //        node.createNode(this._parameters.getProperty(i));
            if (this._blocks.length)
                this._blocks[0].createVisualTree(node, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.TITLE_TOKEN_SEARCH_REGEX = /\$(?:[a-zA-Z0-9_?]|\\\$)*/gi;
        Component.TITLE_TOKEN_VALIDATE_REGEX = /\$\??[a-zA-Z_$][a-zA-Z0-9_$]*/i; // (WARNING!!! Adding the 'g' (global) flag will cause '.test()' to advance in subsequent tests, and possibly fail)
        return Component;
    }(FlowScript.Type));
    FlowScript.Component = Component;
    // ========================================================================================================================
    var FunctionalComponent = /** @class */ (function (_super) {
        __extends(FunctionalComponent, _super);
        function FunctionalComponent(parent, typeName, signatureTitle, script) {
            return _super.call(this, parent, ComponentTypes.Functional, typeName, signatureTitle, script) || this;
        }
        return FunctionalComponent;
    }(Component));
    FlowScript.FunctionalComponent = FunctionalComponent;
    // ========================================================================================================================
    /** Helps to build a single component using chainable calls. */
    var ComponentBuilder = /** @class */ (function () {
        /** Helps to build a single component using chainable calls. See Component for more details. */
        function ComponentBuilder(parent, componentType, typeName, signatureTitle, script) {
            this.Component = new Component(parent, componentType, typeName, signatureTitle, script);
        }
        /** See {Component}.defineParameter() for more details. */
        ComponentBuilder.prototype.defineParameter = function (name, validTypes, initialValue, validation, isOptional, isConst, isAlias) {
            this.Component.defineParameter(name, validTypes, initialValue, validation, isOptional, isConst, isAlias);
            return this;
        };
        /** Similar to calling 'defineParameter()', except allows defining an enum type property with a 'fixed' or 'not fixed' flag.
          * If a property is 'fixed' to an enum, the developer can only select or enter values matching those in the enum.
          */
        ComponentBuilder.prototype.defineEnumProperty = function (name, enumType, isFixed, initialValue, validation, isOptional, isConst) {
            this.Component.defineParameter(name, [enumType], initialValue, validation, isOptional, isConst).isFixedtoEnum = isFixed;
            return this;
        };
        /** See {Component}.defineLocal() for more details. */
        ComponentBuilder.prototype.defineLocal = function (name, validTypes, initialValue, validation, isOptional, isStatic) {
            this.Component.defineLocalVar(name, validTypes, initialValue, validation, isOptional, isStatic);
            return this;
        };
        /** See {Component}.defineReturn() for more details. */
        ComponentBuilder.prototype.defineReturn = function (name, returnType) {
            this.Component.defineReturnVar(name, returnType);
            return this;
        };
        /** See {Component}.defineInstance() for more details. */
        ComponentBuilder.prototype.defineInstance = function (name, validTypes, initialValue, validation) {
            this.Component.defineInstanceProperty(name, validTypes, initialValue, validation);
            return this;
        };
        /** See {Component}.defineInstanceType() for more details. */
        ComponentBuilder.prototype.defineInstanceType = function (type) {
            this.Component.defineInstanceType(type);
            return this;
        };
        /** See {Component}.registerEvent() for more details. */
        ComponentBuilder.prototype.registerEvent = function (name) {
            this.Component.registerEvent(name);
            return this;
        };
        /** Adds a new statement on a new line (See {Line}.addStatement()). */
        ComponentBuilder.prototype.addStatement = function (action, args, returnTargets, eventHandlers) {
            var _args = [];
            if (args)
                for (var i = 0; i < args.length; ++i)
                    if (args[i])
                        if (args[i] instanceof FlowScript.Expression)
                            _args[i] = args[i];
                        else
                            _args[i] = new FlowScript.Constant(args[i]);
            this.Component.block.newLine().addStatement(action, _args, returnTargets, eventHandlers);
            return this;
        };
        return ComponentBuilder;
    }());
    FlowScript.ComponentBuilder = ComponentBuilder;
    /** References a block for use in expressions. */
    var ComponentReference = /** @class */ (function (_super) {
        __extends(ComponentReference, _super);
        // TODO: Consider creating a custom collection so the type can be detected by the VisualNode
        // --------------------------------------------------------------------------------------------------------------------
        function ComponentReference(source, args, returnTargets, eventHandlers, parent) {
            var _this = _super.call(this, parent) || this;
            _this._arguments = new FlowScript.ExpressionArgs(_this); // (the arguments are taken from 1. the calling component's declared local variables [including parameters], or 2. other components)
            _this._returnTargets = new FlowScript.ReturnTargetMaps(_this); // (these properties are also taken from the calling component's declared local variables [including parameters], which get updated upon return)
            if (!source || typeof source != 'object' || !(source instanceof Component))
                throw "A valid component object is required.";
            _this._componentRef = source.getReference();
            _this.initExpression(source, args, returnTargets, eventHandlers);
            return _this;
        }
        Object.defineProperty(ComponentReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this.component ? this.component.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "component", {
            /** The component that this reference points to. */
            get: function () { return this._componentRef.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "arguments", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The arguments set for this expression, if any.
              * Use 'setArgument()' to set values for this object.
              */
            get: function () { return this._arguments; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "argumentLength", {
            /** Returns the count of indexed values in the object (i.e. the highest index + 1). */
            get: function () {
                //var length = 0;
                //if (this._arguments)
                //    for (var p in this._arguments) {
                //        var i = +p;
                //        if (!isNaN(i) && i >= length) // (isNan faster than regex: https://jsperf.com/opandstr-vs-regex-test)
                //            length = i + 1; // (the length is the largest index number + 1 [note: may not contain optional args, so must search of largest index])
                //    }
                return this._arguments ? this._arguments.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "returnTargets", {
            get: function () { return this._returnTargets; },
            enumerable: true,
            configurable: true
        });
        /** Initialize this expression with new arguments, return targets, and event handlers. */
        ComponentReference.prototype.initExpression = function (source, args, returnTargets, eventHandlers) {
            this._componentRef = source.getReference();
            if (args || args === null) {
                this._arguments.clear();
                this._arguments.apply(args);
            }
            if (returnTargets || args === null) {
                this._returnTargets.clear();
                this._returnTargets.addTargetMaps(returnTargets);
            }
            if (eventHandlers || eventHandlers === null) {
                this.clearEventHandlers();
            }
            this._eventHandlers = eventHandlers || [];
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ComponentReference.prototype._clone = function (parent) {
            var compRef = new ComponentReference(this.component, null, null, null, parent);
            this._arguments.clone(compRef);
            this._returnTargets.clone(compRef);
            var eh = [];
            if (this._eventHandlers)
                for (var i = 0, n = this._eventHandlers.length; i < n; ++i)
                    eh[i] = this._eventHandlers[i].clone(compRef);
            compRef.initExpression(this.component, void 0, void 0, eh);
            return compRef;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        ComponentReference.prototype.containsChildExpression = function (expr) {
            var _expr;
            // ... search arguments ...
            if (this._arguments && this._arguments.containsExpression(expr))
                return;
            // ... search return targets ...
            if (this._returnTargets && this._returnTargets.containsExpression(expr))
                return;
            // ... search event handlers ...
            if (this._eventHandlers)
                for (var i = this._eventHandlers.length - 1; i >= 0; --i) {
                    _expr = this._eventHandlers[i];
                    if (_expr)
                        if (_expr == expr)
                            return true;
                        else if (_expr.containsChildExpression(expr))
                            return true;
                }
            return false;
        };
        ComponentReference.prototype.remove = function (child) {
            if (child) {
                // ... 'this' is the parent, so find the reference and remove it ...
                // ... check args ...
                var expr = this._arguments ? this._arguments.removeArgument(child) : null;
                // ... check returns ...
                if (!expr && this._returnTargets)
                    expr = this._returnTargets.removeReturn(child);
                // ... check events ...
                if (!expr && this.removeEvent)
                    expr = this.removeEvent(child);
            }
            else
                expr = _super.prototype.remove.call(this);
            return expr ? expr : null;
        };
        /** Clears the expression of all arguments, return targets, and event handlers. */
        ComponentReference.prototype.clear = function () {
            this._arguments.clear();
            this._returnTargets.clear();
            this.clearEventHandlers();
        };
        ComponentReference.prototype.removeEvent = function (eventHandlerOrIndex) {
            // ... check event handlers ...
            var expr;
            if (typeof eventHandlerOrIndex == 'number') {
                if (eventHandlerOrIndex < 0 || eventHandlerOrIndex >= this._eventHandlers.length)
                    throw "Event index '" + eventHandlerOrIndex + "' is out of bounds.";
                expr = this._eventHandlers.splice(i, 1)[0];
            }
            else
                for (var i = this._eventHandlers.length - 1; i >= 0; --i)
                    if (this._eventHandlers[i] == eventHandlerOrIndex)
                        expr = this._eventHandlers.splice(i, 1)[0];
            return expr || null;
        };
        /** Removes all event handlers. */
        ComponentReference.prototype.clearEventHandlers = function () {
            if (this._eventHandlers)
                for (var i = this._eventHandlers.length - 1; i >= 0; --i)
                    this._returnTargets.removeReturn(i);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ComponentReference.prototype.save = function (target) {
            target = target || {};
            target.source = this.component ? this.component.fullTypeName : null;
            if (this._arguments)
                this._arguments.save(target);
            if (this._returnTargets)
                this._returnTargets.save(target);
            target.events = [];
            _super.prototype.save.call(this, target);
            return target;
        };
        ComponentReference.prototype.load = function (target) {
            target = target || {};
            // super.load(target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns available properties that can be used given the parent expression hierarchy. */
        ComponentReference.prototype.getAvailablePropertyList = function () {
            // ... get from any 'with' block first ...
            var withStatement = this.getParentWith(), availableProperties = [];
            if (withStatement) {
                var objExpr = withStatement._arguments.getArg(0);
                if (!objExpr || !(objExpr instanceof FlowScript.PropertyReference)) // (a property expression argument is required to continue)
                    return null;
                var propertyType = objExpr.property.validTypes[0];
                if (propertyType && propertyType.assignableTo(FlowScript.System.Object)) {
                    var oc = propertyType; // (the property type references an object type component)
                    if (oc)
                        for (var i = 0, n = oc.instanceProperties.length; i < n; ++i)
                            availableProperties.push({ source: oc, property: oc.instanceProperties.getProperty(i) });
                }
            }
            // ... get the containing object's properties next ...
            var fc = this.functionalComponent;
            if (fc) {
                for (var i = 0, n = fc.parameters.length; i < n; ++i)
                    availableProperties.push({ source: fc, property: fc.parameters.getProperty(i) });
                for (var i = 0, n = fc.localVars.length; i < n; ++i)
                    availableProperties.push({ source: fc, property: fc.localVars.getProperty(i) });
            }
            return availableProperties;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        ComponentReference.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = _super.prototype.createVisualTree.call(this, parent, visualNodeType);
            // ... first, each return type should be added, in order ...
            if (this._returnTargets) {
                this._returnTargets.createVisualTree(node);
                node.appendTextNode("=");
            }
            // ... next, add the arguments, also in order ...
            this._arguments.createVisualTree(node);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ComponentReference.prototype.toString = function () { return "" + this.component; }; // TODO: Extend this with arguments and return mappings as well.
        return ComponentReference;
    }(FlowScript.Expression));
    FlowScript.ComponentReference = ComponentReference;
    /** The root expression is call a "statement", which is a single stand-alone component call, assignment operation, or flow
      * control block.  Lines usually reference statements, and other expressions are nested within them.
      */
    var Statement = /** @class */ (function (_super) {
        __extends(Statement, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Statement(line, action, args, returnTargets, eventHandlers) {
            return _super.call(this, action, args, returnTargets, eventHandlers, (eval('this._line = line'), null)) || this;
        }
        Object.defineProperty(Statement.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._line ? this._line.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "line", {
            /** The line this expression belongs to. */
            get: function () { return this._line; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "lineNumer", {
            /** The line number this statement is on. */
            get: function () { return this._line ? this._line.lineNumber : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "functionalComponent", {
            /** Returns the functional component this expression belongs to. */
            get: function () { return this.line ? this.line.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "block", {
            get: function () { return this._line ? this._line.block : null; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        Statement.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = _super.prototype.createVisualTree.call(this, parent, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Statement.prototype._clone = function (parent) {
            return new Statement(this._line, this.component);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Statement.prototype.save = function (target) {
            target = target || {};
            _super.prototype.save.call(this, target);
            return target;
        };
        Statement.prototype.remove = function (child) {
            if (child)
                return _super.prototype.remove.call(this, child);
            else {
                if (this._line)
                    return this._line.removeStatement(this);
                return void 0;
            }
        };
        return Statement;
    }(ComponentReference));
    FlowScript.Statement = Statement;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    // ========================================================================================================================
    /** Represents a single block of script.
      * Blocks are also expressions because they can exist as arguments to other components.
      */
    var Block = /** @class */ (function (_super) {
        __extends(Block, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Block(containingComponent) {
            var _this = _super.call(this) || this;
            _this._lines = [];
            _this._component = containingComponent;
            if (containingComponent)
                _this._component.addBlock(_this);
            return _this;
        }
        Object.defineProperty(Block.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._component.script; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "index", {
            /** The index of this block in the component owner, if any, otherwise this is -1. */
            get: function () { return this._component ? this._component.blocks.indexOf(this) : -1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "component", {
            /** The component this block belongs to. */
            get: function () { return this._component; },
            set: function (comp) { if (this._component)
                this._component.removeBlock(this); comp.addBlock(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "lines", {
            get: function () { return this._lines; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "hasLines", {
            get: function () { return !!this._lines && !!this._lines.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "totalLines", {
            get: function () { return this._lines.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "serializedPath", {
            /** A string path that represents this block during serialization. */
            get: function () {
                var typePath = this._component ? this._component.fullTypeName : "";
                var i = this.index;
                return typePath + ":" + (typePath && i >= 0 ? i : this._id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "referenceStr", {
            /** An instance reference string that represents this block in the system. */
            get: function () {
                var comp = this.component;
                if (comp)
                    return comp.referenceStr + ".blocks[" + this.index + "]";
                else
                    return "[" + this.index + "]";
            },
            enumerable: true,
            configurable: true
        });
        Block.prototype.getReference = function () {
            if (this.script)
                return new FlowScript.NamedReference(this.script, this.referenceStr);
            else
                return new FlowScript.NamedReference(this, null);
        };
        /** Creates an expression wrapper for this block. An optional expression parent can be given. */
        Block.prototype.createExpression = function (parent) {
            return new BlockReference(this, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Block.prototype.save = function (target) {
            target = target || {};
            target.lines = [];
            for (var i = 0, n = this._lines.length; i < n; ++i)
                target.lines[i] = this._lines[i].save();
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns a new line for this block. */
        Block.prototype.newLine = function () {
            return this._lines[this._lines.length] = new FlowScript.Line(this);
        };
        /** Returns a new line before the given line number (where 0 is the first line). */
        Block.prototype.insertLineBefore = function (lineIndex) {
            if (!lineIndex || lineIndex < 0)
                lineIndex = 0;
            // ... move down items ...
            for (var i = this._lines.length; i > lineIndex; --i)
                this._lines[i] = this._lines[i - 1];
            return this._lines[lineIndex] = new FlowScript.Line(this);
        };
        /** Returns a new line after the given line number (where 0 is the first line). */
        Block.prototype.insertLineAfter = function (lineIndex) {
            if (!lineIndex || lineIndex < 0)
                lineIndex = 0;
            return this.insertLineBefore(lineIndex + 1);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the 0-based line number for a line. */
        Block.prototype.getLineIndex = function (line) { var i = this._lines.indexOf(line); return i >= 0 ? i : void 0; };
        /** Returns the 1-based line number for a line, used mainly for the UI. */
        Block.prototype.getLineNumber = function (line) { var i = this._lines.indexOf(line); return i >= 0 ? 1 + i : void 0; };
        Block.prototype.removeLine = function (line) {
            var index = typeof line == 'number' ? line - 1 : this._lines.indexOf(line);
            if (index >= 0 && index < this._lines.length)
                return this._lines.splice(index, 1)[0];
            return void 0; // (not found, or out of bounds)
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Clears the block and returns the block instance. */
        Block.prototype.clear = function () {
            this._lines = [];
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this block and any containing lines. */
        Block.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            if (!this.lines.length)
                node.appendTextNode("≡?≡");
            else
                for (var i = 0, n = this._lines.length; i < n; ++i)
                    this._lines[i].createVisualTree(node, visualNodeType);
            return node;
        };
        return Block;
    }(FlowScript.TrackableObject));
    FlowScript.Block = Block;
    /** References a block for use in expressions. */
    var BlockReference = /** @class */ (function (_super) {
        __extends(BlockReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function BlockReference(block, parent) {
            var _this = _super.call(this, parent) || this;
            if (!block || typeof block != 'object' || !(block instanceof Block))
                throw "A valid block object is required.";
            _this._block = block.getReference();
            return _this;
        }
        Object.defineProperty(BlockReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._block ? this.block.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "block", {
            /** The block object that is referenced. */
            get: function () { return this._block.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "lines", {
            /** The script lines in the referenced block. */
            get: function () { return this.block.lines; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "component", {
            /** The component that the referenced block belongs to. */
            get: function () { return this.block.component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "hasLines", {
            get: function () { return this.block.hasLines; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this expression object. */
        BlockReference.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            if (this.block)
                this.block.createVisualTree(node, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        BlockReference.prototype._clone = function (parent) {
            return new BlockReference(this.block, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        BlockReference.prototype.save = function (target) {
            target = target || {};
            //?if (!typePath || i < 0)
            //    throw "Cannot save a block reference to a block that is not part of a component - there would be no way to reconcile it when loading.";
            target.blockPath = this.block.serializedPath;
            _super.prototype.save.call(this, target);
            return target;
        };
        BlockReference.prototype.load = function (target) {
            target = target || {};
            var block = this.block;
            var typePath = block.component ? block.component.fullTypeName : null;
            var i = block.index;
            if (target.blockPath) {
                var parts = target.blockPath.split(':');
                if (parts.length)
                    if (parts.length == 1)
                        var path, id = parts[0];
                    else
                        var path = parts[0], id = parts[1];
                if (isNaN(+id)) {
                    // ... assume this is a GUID instead ...
                }
                else {
                    // ... this is a numerical index into the component blocks ...
                    if (!path)
                        throw "A numerical block index requires a component type path.";
                    var comp = this.script.resolve(path, FlowScript.Component);
                    if (!comp)
                        throw "There is no component '" + path + "'; cannot reconcile block reference '" + target.blockPath + "'.";
                    var i = +id;
                    if (i < 0)
                        throw "The numerical block index (" + i + ") is out of bounds.";
                }
            }
            target.blockPath = typePath + ":" + (i >= 0 ? i : block._id);
            // super.load(target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        BlockReference.prototype.toString = function () { return "Block reference: " + (this._block && this.block.serializedPath); };
        return BlockReference;
    }(FlowScript.Expression));
    FlowScript.BlockReference = BlockReference;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    // ========================================================================================================================
    /** A line represents a single execution step in a code block.
      * A line essentially wraps a component, and acts as a single execution step in a code block.
      */
    var Line = /** @class */ (function (_super) {
        __extends(Line, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Line(parent) {
            var _this = _super.call(this, parent ? parent.script : void 0) || this;
            _this._statements = []; // (NOTE: This is an array, but only one statement per line is supported for final output at this time)
            _this._block = parent;
            return _this;
        }
        Object.defineProperty(Line.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._block ? this._block.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "block", {
            /** The block this line belongs to. */
            get: function () { return this._block; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "component", {
            /** The component that owns the code block this line belongs to. */
            get: function () { return this._block ? this._block.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "statements", {
            get: function () { return this._statements; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "hasStatements", {
            get: function () { return !!this._statements && !!this._statements.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "lineIndex", {
            /** Returns the 0-based line number for this line. */
            get: function () { return this._block ? this._block.getLineIndex(this) : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "lineNumber", {
            /** Returns the 1-based line number for this line, used mainly for the UI. */
            get: function () { return this._block ? this._block.getLineNumber(this) : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "totalLines", {
            get: function () { return this._block ? this._block.totalLines : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "serializedPath", {
            /** A string path that represents this block during serialization. */
            get: function () {
                var blockPath = this._block ? this._block.serializedPath : "";
                var i = this.lineNumber;
                return blockPath + "," + (blockPath && i >= 1 ? i : this._id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "referenceStr", {
            /** An instance reference string that represents this block in the system. */
            get: function () {
                var block = this.block;
                if (block)
                    return block.referenceStr + ".lines[" + this.lineIndex + "]";
                else
                    return "[" + this.lineIndex + "]";
            },
            enumerable: true,
            configurable: true
        });
        Line.prototype.getReference = function () {
            if (this.script)
                return new FlowScript.NamedReference(this.script, this.referenceStr);
            else
                return new FlowScript.NamedReference(this, null);
        };
        Line.prototype.clone = function (parent) {
            var line = new Line(parent);
            for (var i = 0, n = this._statements.length; i < n; ++i)
                line.statements.push(this._statements[i].clone());
            return line;
        };
        /** Creates an expression wrapper for this line. An optional expression parent can be given. */
        Line.prototype.createExpression = function (parent) {
            return new LineReference(this, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Remove this line and all statements, and returns the removed line. */
        Line.prototype.remove = function () { if (this._block)
            return this._block.removeLine(this);
        else
            return void 0; };
        // --------------------------------------------------------------------------------------------------------------------
        Line.prototype.save = function (target) {
            target = target || {};
            target.statements = [];
            for (var i = 0, n = this._statements.length; i < n; ++i)
                target.statements[i] = this._statements[i].save();
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Line.prototype.addStatement = function (action, args, returnTargets, eventHandlers) {
            if (this._statements.length)
                throw "Cannot add statement '" + action + "': Adding multiple statements per line is not yet supported.  Each statement must be on its own line.";
            return this._statements[this._statements.length] = new FlowScript.Statement(this, action, args, returnTargets, eventHandlers);
        };
        Line.prototype.removeStatement = function (statement) {
            var i = this._statements.indexOf(statement);
            if (i >= 0) {
                return this._statements.splice(i, 1)[0];
                //? (users my wish to keep empty lines!) if (this._statements.length == 0) // (if there are no more statements on the line, then remove the line also)
                //?    this._block.removeLine(this);
            }
            else
                return void 0;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this line and any statements. */
        Line.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            for (var i = 0, n = this._statements.length; i < n; ++i) {
                if (i > 0)
                    node.appendTextNode(" | ");
                this._statements[i].createVisualTree(node, visualNodeType);
            }
            return node;
        };
        return Line;
    }(FlowScript.TrackableObject));
    FlowScript.Line = Line;
    /** References a line for special cases. Lines are not usually used in expressions, but still may need to be
      * referenced (for instance, from the UI side, or the trash bin).
      */
    var LineReference = /** @class */ (function (_super) {
        __extends(LineReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function LineReference(line, parent) {
            var _this = _super.call(this, parent) || this;
            if (!line || typeof line != 'object' || !(line instanceof Line))
                throw "A valid line object is required.";
            _this._lineRef = line.getReference();
            return _this;
        }
        Object.defineProperty(LineReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._lineRef ? this._lineRef.valueOf().script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LineReference.prototype, "line", {
            /** The line object that is referenced. */
            get: function () { return this._lineRef.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LineReference.prototype, "component", {
            /** The component that the referenced line belongs to. */
            get: function () { return this.line.component; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this expression object. */
        LineReference.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            if (this.line)
                this.line.createVisualTree(node, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        LineReference.prototype._clone = function (parent) {
            return new LineReference(this._lineRef.valueOf(), parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        LineReference.prototype.save = function (target) {
            target = target || {};
            target.linePath = this._lineRef.valueOf().serializedPath;
            _super.prototype.save.call(this, target);
            return target;
        };
        LineReference.prototype.load = function (target) {
            target = target || {};
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        LineReference.prototype.toString = function () { return "Line reference: " + this._lineRef.valueOf().serializedPath; };
        return LineReference;
    }(FlowScript.Expression));
    FlowScript.LineReference = LineReference;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Represents an enumeration of names and related constant values.
      * Enums can be associated with properties so the developer has to pick from a predefined list of values.
      */
    var Enum = /** @class */ (function (_super) {
        __extends(Enum, _super);
        function Enum(parent, name, values) {
            var _this = _super.call(this, parent, name) || this;
            _this._counter = 0;
            _this.values = {};
            _this.properties = _this.values;
            values && _this.addValue(values);
            return _this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        Enum.prototype.setValue = function (name, value) {
            if (value === void 0)
                value = this._counter++;
            if (name in this.values)
                throw "Enum error: Cannot add duplicate name '" + name + "'.";
            this.values[name] = value;
            // ... try to reference the name by value as well ...
            var valIndex = typeof value == 'string' ? value : '' + value;
            if (valIndex != name) { // (don't overwrite the "name=value" entry!)
                if (valIndex in this.values)
                    throw "Enum error: Name conflict - cannot add reverse lookup for '" + name + "'='" + value + "'.";
                this.values[valIndex] = name;
            }
            return this;
        };
        Enum.prototype.addValue = function (values) {
            if (values && typeof values == 'object')
                for (var p in values)
                    if (Object.prototype.hasOwnProperty.call(values, p))
                        this.values[p] = values[p];
            return this;
        };
        return Enum;
    }(FlowScript.Type));
    FlowScript.Enum = Enum;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    // ========================================================================================================================
    /** Represents a single component event.
      * The premise behind components is that they are built assuming normal code flow; however, things do go wrong at times,
      * and when something does go wrong, an event is raised which developers can use to execute a handler block.
      */
    var FSEvent = /** @class */ (function (_super) {
        __extends(FSEvent, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function FSEvent(parent, name) {
            return _super.call(this, parent, FlowScript.ComponentTypes.Functional, name, name) || this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        FSEvent.prototype.save = function (target) {
            target = target || {};
            _super.prototype.save.call(this, target);
            return target;
        };
        return FSEvent;
    }(FlowScript.Component));
    FlowScript.FSEvent = FSEvent;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** A text message, which can later have translations applied.
      * Messages can have token place holders, such as '$0 $1 $2 ...' (where '$0' is the first argument given - see 'getMessage()').
      * When ready to translate an application's messages, you use the IDE to export a comma separated list of messages and their
      * checksum values for later match up.  If in a very rare case there is a checksum collision, you just give the message a
      * fixed internal ID.  Although some may wish to do this anyhow for clarity, using checksums allows focus on development
      * of message feedback, without the annoyance of update string tables. If a message will be used in multiple places, it's
      * a good idea to give a fixed ID.
      */
    var Message = /** @class */ (function () {
        function Message(parent, message, id) {
            this._checksum = 0;
            if (typeof id !== void 0 && typeof id !== null)
                this._id = typeof id != 'string' ? id : '' + id;
            this.messagePattern = message;
            if (parent)
                parent.registerMessage(this);
        }
        Object.defineProperty(Message.prototype, "id", {
            /** By default, the ID of a message is it's checksum.  If there are conflicts (very rare), then a unique ID value must be explicitly defined. */
            get: function () { return this._id || this._checksum.toString(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "checksum", {
            /** A simple hash to identify the message. If conflicts occur (very rare), then a unique ID value must be explicitly defined. */
            get: function () { return this._checksum; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "messagePattern", {
            /** The message pattern is a text message that may contain token place holders for formatting (i.e. "Warning: $1"). */
            get: function () { return this._messagePattern; },
            set: function (value) {
                if (typeof value !== 'string')
                    value = '' + value;
                if (!value)
                    throw "Error: Message cannot be empty.";
                this._messagePattern = value;
                this._checksum = FlowScript.getChecksum(this._messagePattern);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "translationPattern", {
            get: function () { return this._translationPattern; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Return a formatted message, replacing any tokens ($#) with the supplied argument values. */
        Message.prototype.getMessage = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var pattern = this._translationPattern || this._messagePattern;
            var msgParts = pattern.split(/(\$\$|\$[0-9]+)/g);
            var tokens = pattern.match(/(\$\$|\$[0-9]+)/g);
            // (at this point the pattern is broken into msgParts[0]+tokens[0]+msgParts[1]+tokens[1]+...)
            var msg = msgParts.length ? msgParts[0] : "";
            for (var i = 0, n = tokens.length; i < n; ++i)
                if (tokens[i] == "$$") // (double symbols escape to a single symbol to allow a single symbol tokenized place holder)
                    msg += "$";
                else
                    msg += args[(tokens[i].substring(1) | 0)] + msgParts[i + 1];
            return msg;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Sets a translated message pattern. This is a language translation which represents the underlying message text
          * pattern. It will act as an override when 'getMessage(...)' is called, and is reset by calling 'clearTranslation()'. */
        Message.prototype.setTranslation = function (translationPattern) {
            this._translationPattern = translationPattern;
        };
        /** Clears the current translated message pattern. */
        Message.prototype.clearTranslation = function () {
            this._translationPattern = FlowScript.undefined;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Message.prototype.toString = function () { return this.messagePattern; };
        Message.prototype.valueOf = function () { return this.messagePattern; };
        return Message;
    }());
    FlowScript.Message = Message;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
// Data Tables
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    var ColumnAccessLevels;
    (function (ColumnAccessLevels) {
        /** The column can be read from, and written to. */
        ColumnAccessLevels[ColumnAccessLevels["ReadWrite"] = 0] = "ReadWrite";
        /** The column cannot be updated. */
        ColumnAccessLevels[ColumnAccessLevels["ReadOnly"] = 1] = "ReadOnly";
        /** The column is treated as if it doesn't exist. */
        ColumnAccessLevels[ColumnAccessLevels["Hidden"] = 2] = "Hidden";
    })(ColumnAccessLevels = FlowScript.ColumnAccessLevels || (FlowScript.ColumnAccessLevels = {}));
    var Column = /** @class */ (function () {
        function Column() {
            this._accessLevel = ColumnAccessLevels.ReadWrite;
        }
        Object.defineProperty(Column.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Column.prototype, "type", {
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Column.prototype, "accessLevel", {
            get: function () { return this._accessLevel; },
            enumerable: true,
            configurable: true
        });
        return Column;
    }());
    FlowScript.Column = Column;
    var Row = /** @class */ (function () {
        function Row() {
        }
        return Row;
    }());
    FlowScript.Row = Row;
    /** Represents a structure of data, much like a class.
      * Tables exist to replace the concept of class instances in many other languages.  In most cases, programmers create
      * methods/functions to operate on either a data structure (object with properties), or data returned from a database.
      * To mimic classes, a table with one row is created, where the columns are the properties.  As well, columns can be
      * flagged as readonly,
      */
    var Table = /** @class */ (function (_super_1) {
        __extends(Table, _super_1);
        // --------------------------------------------------------------------------------------------------------------------
        function Table(parent, tableName) {
            var _this = _super_1.call(this, parent, tableName) || this;
            _this._columns = [];
            _this._rows = [];
            return _this;
        }
        return Table;
    }(FlowScript.Type));
    FlowScript.Table = Table;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** A thread wraps a single script block.
      * One script can have many threads.
      */
    var Thread = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Thread(parent) {
            this._parent = parent;
        }
        return Thread;
    }());
    FlowScript.Thread = Thread;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
//? Note display examples: [№|$|#|"|○|…|*]  /  (numerical expected) <conditional expected> {code block expected} /** comment */
/** The core namespace contains all the very basic low level components that can be used as building blocks.
  * You can think of them as the individual "Lego" pieces that would be use to create the larger parts of a more complex design.
  */
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        // ========================================================================================================================
        // Core Value Types
        /** A script based type that matches all other types. */
        var Any = /** @class */ (function (_super) {
            __extends(Any, _super);
            function Any(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Any", "$Any") || this;
            }
            Any.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            Any.prototype.assignableTo = function (type) {
                return true;
            };
            return Any;
        }(FlowScript.Component));
        Core.Any = Any;
        var Boolean = /** @class */ (function (_super) {
            __extends(Boolean, _super);
            function Boolean(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Boolean", "Boolean($?value)") || this;
            }
            Boolean.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.String);
                _super.prototype.onInit.call(this);
            };
            Boolean.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Boolean;
        }(FlowScript.Component));
        Core.Boolean = Boolean;
        var String = /** @class */ (function (_super) {
            __extends(String, _super);
            function String(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "String", "String($?value)") || this;
            }
            String.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.String);
                _super.prototype.onInit.call(this);
            };
            String.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.DateTime.fullTypeName:
                    case this.script.System.RegEx.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return String;
        }(FlowScript.Component));
        Core.String = String;
        var Double = /** @class */ (function (_super) {
            __extends(Double, _super);
            function Double(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Double", "Double($?value)") || this;
            }
            Double.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.Double);
                _super.prototype.onInit.call(this);
            };
            Double.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.DateTime.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Double;
        }(FlowScript.Component));
        Core.Double = Double;
        var Currency = /** @class */ (function (_super) {
            __extends(Currency, _super);
            function Currency(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Currency", "Currency($?value)") || this;
            }
            Currency.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.Currency);
                _super.prototype.onInit.call(this);
            };
            Currency.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Currency;
        }(FlowScript.Component));
        Core.Currency = Currency;
        var Integer = /** @class */ (function (_super) {
            __extends(Integer, _super);
            function Integer(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Integer", "Integer($?value)") || this;
            }
            Integer.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.Integer);
                _super.prototype.onInit.call(this);
            };
            Integer.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.DateTime.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Integer;
        }(FlowScript.Component));
        Core.Integer = Integer;
        var DateTime = /** @class */ (function (_super) {
            __extends(DateTime, _super);
            function DateTime(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "DateTime", "DateTime($?value)") || this;
            }
            DateTime.prototype.onInit = function () {
                this.defineParameter("value", [this.script.System.Double, this.script.System.Integer, this.script.System.String, this.script.System.DateTime]);
                this.defineDefaultReturnVar(this.script.System.DateTime);
                _super.prototype.onInit.call(this);
            };
            DateTime.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.DateTime.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return DateTime;
        }(FlowScript.Component));
        Core.DateTime = DateTime;
        var FSObject = /** @class */ (function (_super) {
            __extends(FSObject, _super);
            function FSObject(parent, superType, title) {
                if (title === void 0) { title = "Object($?value)"; }
                var _this = _super.call(this, parent, FlowScript.ComponentTypes.Type, "Object", title) || this;
                if (superType)
                    _this.superType = superType;
                return _this;
            }
            FSObject.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.Object);
                _super.prototype.onInit.call(this);
            };
            FSObject.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return FSObject;
        }(FlowScript.Component));
        Core.FSObject = FSObject;
        /** Represents an array of items.
          * Arrays are templates, which default to arrays of "Any" type.  When creating arrays, call "{Type}.createTemplateType()"
          * to set the type of each item.
          */
        var Array = /** @class */ (function (_super) {
            __extends(Array, _super);
            function Array(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Array", "Array($?Array)") || this;
            }
            Array.prototype.onInit = function (defaultType, expectedBaseType) {
                this.defineTemplateParameter("T", defaultType, expectedBaseType);
                this.defineDefaultReturnVar(this.script.System.Array);
                _super.prototype.onInit.call(this);
            };
            Array.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Array.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Array;
        }(FlowScript.Component));
        Core.Array = Array;
        var RegEx = /** @class */ (function (_super) {
            __extends(RegEx, _super);
            function RegEx(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Regex", "Regex($?RegEx)") || this;
            }
            RegEx.prototype.onInit = function () {
                this.defineDefaultReturnVar(this.script.System.RegEx);
                _super.prototype.onInit.call(this);
            };
            RegEx.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.RegEx.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return RegEx;
        }(FlowScript.Component));
        Core.RegEx = RegEx;
        var Property = /** @class */ (function (_super) {
            __extends(Property, _super);
            function Property(parent) {
                return _super.call(this, parent, "Property") || this;
            }
            Property.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            Property.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Property.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Property;
        }(FlowScript.Type));
        Core.Property = Property;
        var CodeBlock = /** @class */ (function (_super) {
            __extends(CodeBlock, _super);
            function CodeBlock(parent) {
                return _super.call(this, parent, "CodeBlock") || this;
            }
            CodeBlock.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            CodeBlock.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.CodeBlock.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return CodeBlock;
        }(FlowScript.Type));
        Core.CodeBlock = CodeBlock;
        var FunctionalComponent = /** @class */ (function (_super) {
            __extends(FunctionalComponent, _super);
            function FunctionalComponent(parent) {
                return _super.call(this, parent, "FunctionalComponent") || this;
            }
            FunctionalComponent.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            FunctionalComponent.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.FunctionalComponent.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return FunctionalComponent;
        }(FlowScript.Type));
        Core.FunctionalComponent = FunctionalComponent;
        var ExpressionList = /** @class */ (function (_super) {
            __extends(ExpressionList, _super);
            function ExpressionList(parent) {
                return _super.call(this, parent, "ExpressionList") || this;
            }
            ExpressionList.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            ExpressionList.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.ExpressionList.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return ExpressionList;
        }(FlowScript.Type));
        Core.ExpressionList = ExpressionList;
        var System = /** @class */ (function (_super) {
            __extends(System, _super);
            function System(script) {
                var _this = _super.call(this, script, "System") || this;
                script.System = _this; // (this reference needs to exist before settings the other types)
                _this.Any = new Any(_this);
                _this.Boolean = new Boolean(_this);
                _this.String = new String(_this);
                _this.Double = new Double(_this);
                _this.Currency = new Currency(_this);
                _this.Integer = new Integer(_this);
                _this.DateTime = new DateTime(_this);
                _this.Object = new FSObject(_this);
                _this.Array = new Array(_this);
                _this.RegEx = new RegEx(_this);
                _this.Property = new Property(_this);
                _this.CodeBlock = new CodeBlock(_this); // (a block of script)
                _this.FunctionalComponent = new FunctionalComponent(_this);
                _this.Event = new Core.Event(_this);
                _this.Assign = new Assign(_this);
                _this.Accessor = new Accessor(_this);
                _this.With = new With(_this);
                _this.WithCall = new WithCall(_this);
                _this.PreIncrement = new PreIncrement(_this);
                _this.PostIncrement = new PostIncrement(_this);
                _this.PreDecrement = new PreDecrement(_this);
                _this.PostDecrement = new PostDecrement(_this);
                _this.Math = new Core.Math.Math(_this);
                _this.Binary = new Core.Binary.Binary(_this);
                _this.ControlFlow = new Core.ControlFlow.ControlFlow(_this);
                _this.Comparison = new Core.Comparison.Comparison(_this);
                _this.Code = new Code(_this);
                _this.ExpressionList = new ExpressionList(_this);
                return _this;
            }
            System.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            return System;
        }(FlowScript.Type));
        Core.System = System;
        // ========================================================================================================================
        var Main = /** @class */ (function (_super) {
            __extends(Main, _super);
            function Main(script) {
                return _super.call(this, script, FlowScript.ComponentTypes.Functional, "Main", null) || this;
            }
            Main.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            return Main;
        }(FlowScript.Component));
        Core.Main = Main;
        // ========================================================================================================================
        // Core components
        // ========================================================================================================================
        var Operator = /** @class */ (function (_super) {
            __extends(Operator, _super);
            function Operator(parent, typeName, title, isUnary) {
                if (isUnary === void 0) { isUnary = false; }
                var _this = _super.call(this, parent, isUnary ? FlowScript.ComponentTypes.Unary : FlowScript.ComponentTypes.Operation, typeName, title) || this;
                _this._typeMapping = [];
                return _this;
            }
            Operator.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            Operator.prototype.addTypeMap = function (result) {
                var ifTypes = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    ifTypes[_i - 1] = arguments[_i];
                }
                this._typeMapping.push({ result: result, ifTypes: ifTypes });
            };
            /** Returns the resulting type when given the specified arguments. */
            Operator.prototype.getResultTypeWhen = function (args) {
                if (typeof args !== 'object' || !args.length)
                    return FlowScript.undefined;
                mapSearch: for (var i = 0, n = this._typeMapping.length; i < n; ++i) {
                    for (var i2 = 0, types = this._typeMapping[i].ifTypes, n2 = types.length; i2 < n2 && i2 < args.length; ++i2)
                        if (!types[i2].is(args[i2]))
                            continue mapSearch;
                    return this._typeMapping[i].result;
                }
                return FlowScript.undefined;
            };
            return Operator;
        }(FlowScript.Component));
        Core.Operator = Operator;
        // ========================================================================================================================
        var Comment = /** @class */ (function (_super) {
            __extends(Comment, _super);
            function Comment(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Comment, "Comment", "/** $comment */") || this;
            }
            Comment.prototype.onInit = function () {
                var script = this.script;
                // Setup the expected parameters and return types:
                this.defineParameter("comment", [script.System.String]);
                _super.prototype.onInit.call(this);
            };
            return Comment;
        }(FlowScript.Component));
        Core.Comment = Comment;
        // ========================================================================================================================
        var Assign = /** @class */ (function (_super) {
            __extends(Assign, _super);
            function Assign(parent) {
                var _this = _super.call(this, parent, "Assign", "$a = $b") || this;
                _this._componentType = FlowScript.ComponentTypes.Assignment;
                return _this;
            }
            Assign.prototype.onInit = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Property], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.Any]); // (this is "any", but the type must be assignable to 'a' at compile time)
                this.defineDefaultReturnVar(sys.Boolean);
                _super.prototype.onInit.call(this);
            };
            return Assign;
        }(Operator));
        Core.Assign = Assign;
        // ========================================================================================================================
        var Accessor = /** @class */ (function (_super) {
            __extends(Accessor, _super);
            function Accessor(parent) {
                return _super.call(this, parent, "Accessor", "$a.$b") || this;
            }
            Accessor.prototype.onInit = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Object], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.String]);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred);
                _super.prototype.onInit.call(this);
            };
            return Accessor;
        }(Operator));
        Core.Accessor = Accessor;
        // ========================================================================================================================
        var With = /** @class */ (function (_super) {
            __extends(With, _super);
            function With(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.CodeBlock, "With", "with $a do $b") || this;
            }
            With.prototype.onInit = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Object], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.CodeBlock]);
                this.instanceType = sys.Object;
                this.defineDefaultReturnVar(FlowScript.Type.Inferred);
                _super.prototype.onInit.call(this);
            };
            return With;
        }(FlowScript.Component));
        Core.With = With;
        // ========================================================================================================================
        var WithCall = /** @class */ (function (_super) {
            __extends(WithCall, _super);
            function WithCall(parent) {
                return _super.call(this, parent, "WithCall", "with $a call $b") || this;
            }
            WithCall.prototype.onInit = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Object], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.FunctionalComponent]);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred);
                _super.prototype.onInit.call(this);
            };
            return WithCall;
        }(Operator));
        Core.WithCall = WithCall;
        // ========================================================================================================================
        var PreIncrement = /** @class */ (function (_super) {
            __extends(PreIncrement, _super);
            function PreIncrement(parent) {
                return _super.call(this, parent, "PreIncrement", "++$n", true) || this;
            }
            PreIncrement.prototype.onInit = function () {
                // Setup the expected parameters and return type:
                var sys = this.script.System;
                this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                _super.prototype.onInit.call(this);
            };
            return PreIncrement;
        }(Operator));
        Core.PreIncrement = PreIncrement;
        var PostIncrement = /** @class */ (function (_super) {
            __extends(PostIncrement, _super);
            function PostIncrement(parent) {
                var _this = _super.call(this, parent, "PostIncrement", "$n++", true) || this;
                // Setup the expected parameters and return type:
                var sys = _this.script.System;
                _this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                _this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                return _this;
            }
            PostIncrement.prototype.onInit = function () {
                _super.prototype.onInit.call(this);
            };
            return PostIncrement;
        }(Operator));
        Core.PostIncrement = PostIncrement;
        var PreDecrement = /** @class */ (function (_super) {
            __extends(PreDecrement, _super);
            function PreDecrement(parent) {
                return _super.call(this, parent, "PreDecrement", "--$n", true) || this;
            }
            PreDecrement.prototype.onInit = function () {
                // Setup the expected parameters and return type:
                var sys = this.script.System;
                this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                _super.prototype.onInit.call(this);
            };
            return PreDecrement;
        }(Operator));
        Core.PreDecrement = PreDecrement;
        var PostDecrement = /** @class */ (function (_super) {
            __extends(PostDecrement, _super);
            function PostDecrement(parent) {
                return _super.call(this, parent, "PostDecrement", "$n--", true) || this;
            }
            PostDecrement.prototype.onInit = function () {
                // Setup the expected parameters and return type:
                var sys = this.script.System;
                this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                _super.prototype.onInit.call(this);
            };
            return PostDecrement;
        }(Operator));
        Core.PostDecrement = PostDecrement;
        /** Represents a custom block of JavaScript code.
          * Note: JavaScript code must exist, even if just an empty string, otherwise the simulator will fail when this component is reached.
          */
        var Code = /** @class */ (function (_super) {
            __extends(Code, _super);
            function Code(parent) {
                var _this = _super.call(this, parent, FlowScript.ComponentTypes.Type, "Code", "Code($code)") || this;
                _this.CodeLanguages = new FlowScript.Enum(_this, "CodeLanguages", { JavaScript: "JavaScript", CSharp: "CSharp", VB: "VB" });
                return _this;
            }
            Code.prototype.onInit = function () {
                var sys = this.script.System;
                this.defineParameter("code", [sys.String]);
                _super.prototype.onInit.call(this);
            };
            Code.FUNCTION_CONTENTS_REGEX = /^function .*{([^\0]*?)}$/;
            Code.PROPERTY_TOKEN_REGEX = /\$\$|\$[a-zA-Z_][a-zA-Z0-9_]*/gi; // (no optional '?' flag allowed in this one)
            return Code;
        }(FlowScript.Component));
        Core.Code = Code;
        // ========================================================================================================================
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        var Net;
        (function (Net) {
            var HTTPRequest;
            (function (HTTPRequest_1) {
                // ========================================================================================================================
                // Message ID Constants
                HTTPRequest_1.MSG_LOADFAILED = "LoadFailed";
                // ========================================================================================================================
                /** A line represents a single execution step in a code component.
                  */
                var HTTPRequest = /** @class */ (function (_super) {
                    __extends(HTTPRequest, _super);
                    function HTTPRequest(parent) {
                        return _super.call(this, parent, FlowScript.ComponentTypes.Functional, "LoadFromURL", "Load from url: $url, using method: $method") || this;
                    }
                    HTTPRequest.prototype.onInit = function () {
                        var script = this.script;
                        // Register some global types:
                        var HTTPRequestMethods = new FlowScript.Enum(script.System, "HTTPRequestMethods").setValue("GET", "GET").setValue("POST", "POST");
                        // Setup the expected parameters:
                        this.defineParameter("url", [script.System.String], "", "^(\w+:\/\/)?((?:\w*):(?:\w*)@)?((?:\w+)(?:\.\w+)*)?((?:\/[-_a-zA-Z0-9.~!$&'()*+,;=:@%]+)*\/?)?(\?\w+=.*)?(#.*)?$");
                        this.defineLocalVar("method", [HTTPRequestMethods], "GET", FlowScript.undefined, true);
                        this.defineReturnVar("data", script.System.String);
                        var evtError = this.registerEvent("error");
                        var evtAbort = this.registerEvent("abort");
                        var evtError = this.registerEvent("timeout");
                        // Setup some messages
                        script.registerMessage("Load failed: $0", HTTPRequest_1.MSG_LOADFAILED);
                        // Set the component's script:
                        //?this.addStatement(new CustomJS(this, "Get XHR Object", function HTTPRequest(ctx: RuntimeContext): any {
                        //?}));
                        _super.prototype.onInit.call(this);
                    };
                    return HTTPRequest;
                }(FlowScript.Component));
                HTTPRequest_1.HTTPRequest = HTTPRequest;
                // ========================================================================================================================
            })(HTTPRequest = Net.HTTPRequest || (Net.HTTPRequest = {}));
        })(Net = Core.Net || (Core.Net = {}));
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        var ControlFlow;
        (function (ControlFlow_1) {
            // ========================================================================================================================
            // Core Control Flow Components
            // ========================================================================================================================
            /** Defines the Math namespace type. */
            var ControlFlow = /** @class */ (function (_super) {
                __extends(ControlFlow, _super);
                function ControlFlow(parent) {
                    var _this = _super.call(this, parent, "ControlFlow") || this;
                    _this.If = new If(_this);
                    _this.IfElse = new IfElse(_this);
                    _this.While = new While(_this);
                    _this.DoWhile = new DoWhile(_this);
                    /** Iterates over a block of code, similar to a "for" loop. */
                    _this.Loop = new Loop(_this);
                    return _this;
                }
                ControlFlow.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return ControlFlow;
            }(FlowScript.Type));
            ControlFlow_1.ControlFlow = ControlFlow;
            // ========================================================================================================================
            /** Represents the "if" logical statement.
              */
            var If = /** @class */ (function (_super) {
                __extends(If, _super);
                function If(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.ControlFlow, "If", "if $condition then $block") || this;
                }
                If.prototype.onInit = function () {
                    // Setup the expected parameters:
                    var sys = this.script.System;
                    this.defineParameter("condition", [sys.Boolean]);
                    this.defineParameter("block", [sys.CodeBlock]);
                    _super.prototype.onInit.call(this);
                };
                return If;
            }(FlowScript.Component));
            ControlFlow_1.If = If;
            // ========================================================================================================================
            /** Represents the "if..else" logical statement.
              */
            var IfElse = /** @class */ (function (_super) {
                __extends(IfElse, _super);
                function IfElse(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.ControlFlow, "IfElse", "if $condition then $block1 else $block2") || this;
                }
                IfElse.prototype.onInit = function () {
                    // Setup the expected parameters:
                    var sys = this.script.System;
                    this.defineParameter("condition", [sys.Boolean]);
                    this.defineParameter("block1", [sys.CodeBlock]);
                    this.defineParameter("block2", [sys.CodeBlock]);
                    _super.prototype.onInit.call(this);
                };
                return IfElse;
            }(FlowScript.Component));
            ControlFlow_1.IfElse = IfElse;
            // ========================================================================================================================
            /** Represents the "while..do" loop.
              */
            var While = /** @class */ (function (_super) {
                __extends(While, _super);
                function While(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.ControlFlow, "While", "while $condition do $block") || this;
                }
                While.prototype.onInit = function () {
                    // Setup the expected parameters:
                    var sys = this.script.System;
                    this.defineParameter("condition", [sys.Boolean]);
                    this.defineParameter("block", [sys.CodeBlock]);
                    _super.prototype.onInit.call(this);
                };
                return While;
            }(FlowScript.Component));
            ControlFlow_1.While = While;
            // ========================================================================================================================
            /** Represents the "do..while" loop.
              */
            var DoWhile = /** @class */ (function (_super) {
                __extends(DoWhile, _super);
                function DoWhile(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.ControlFlow, "DoWhile", "do $block while $condition") || this;
                }
                DoWhile.prototype.onInit = function () {
                    // Setup the expected parameters:
                    var sys = this.script.System;
                    this.defineParameter("block", [sys.CodeBlock]);
                    this.defineParameter("condition", [sys.Boolean]);
                    _super.prototype.onInit.call(this);
                };
                return DoWhile;
            }(FlowScript.Component));
            ControlFlow_1.DoWhile = DoWhile;
            // ========================================================================================================================
            /** Iterates over a block of code, similar to a "for" loop.
              */
            var Loop = /** @class */ (function (_super) {
                __extends(Loop, _super);
                function Loop(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.ControlFlow, "Loop", "for ($init; $condition; $update) $block") || this;
                }
                Loop.prototype.onInit = function () {
                    // Setup the expected parameters:
                    var sys = this.script.System;
                    this.defineParameter("init", [sys.CodeBlock]);
                    this.defineParameter("condition", [sys.Boolean]);
                    this.defineParameter("block", [sys.CodeBlock]);
                    this.defineParameter("update", [sys.CodeBlock]);
                    _super.prototype.onInit.call(this);
                };
                return Loop;
            }(FlowScript.Component));
            ControlFlow_1.Loop = Loop;
            // ========================================================================================================================
        })(ControlFlow = Core.ControlFlow || (Core.ControlFlow = {}));
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        var Math;
        (function (Math_1) {
            // ========================================================================================================================
            // Core Math Components
            // ========================================================================================================================
            /** Defines the Math namespace type. */
            var Math = /** @class */ (function (_super) {
                __extends(Math, _super);
                function Math(parent) {
                    var _this = _super.call(this, parent, "Math") || this;
                    /** Add numerical values, or concatenate strings. */
                    _this.Add = new Add(_this);
                    /** Multiple two numerical values. */
                    _this.Multiply = new Multiply(_this);
                    _this.SQRT = new SQRT(_this);
                    return _this;
                }
                Math.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return Math;
            }(FlowScript.Type));
            Math_1.Math = Math;
            // ========================================================================================================================
            /** Adds two values.
              */
            var Add = /** @class */ (function (_super) {
                __extends(Add, _super);
                function Add(parent) {
                    return _super.call(this, parent, "Add", "$a + $b") || this;
                }
                Add.prototype.onInit = function () {
                    var sys = this.script.System;
                    this.addTypeMap(sys.Integer, sys.Boolean, sys.Boolean);
                    this.addTypeMap(sys.Currency, sys.Boolean, sys.Currency);
                    this.addTypeMap(sys.DateTime, sys.Boolean, sys.DateTime);
                    this.addTypeMap(sys.Double, sys.Boolean, sys.Double);
                    this.addTypeMap(sys.Integer, sys.Boolean, sys.Integer);
                    this.addTypeMap(sys.Currency, sys.Currency, sys.Boolean);
                    this.addTypeMap(sys.Currency, sys.Currency, sys.Currency);
                    this.addTypeMap(sys.Currency, sys.Currency, sys.Double);
                    this.addTypeMap(sys.Currency, sys.Currency, sys.Integer);
                    this.addTypeMap(sys.DateTime, sys.DateTime, sys.Boolean);
                    this.addTypeMap(sys.DateTime, sys.DateTime, sys.DateTime);
                    this.addTypeMap(sys.DateTime, sys.DateTime, sys.Double);
                    this.addTypeMap(sys.DateTime, sys.DateTime, sys.Integer);
                    this.addTypeMap(sys.Integer, sys.Double, sys.Boolean);
                    this.addTypeMap(sys.Currency, sys.Double, sys.Currency);
                    this.addTypeMap(sys.DateTime, sys.Double, sys.DateTime);
                    this.addTypeMap(sys.Double, sys.Double, sys.Double);
                    this.addTypeMap(sys.Double, sys.Double, sys.Integer);
                    this.addTypeMap(sys.Integer, sys.Integer, sys.Boolean);
                    this.addTypeMap(sys.Currency, sys.Integer, sys.Currency);
                    this.addTypeMap(sys.DateTime, sys.Integer, sys.DateTime);
                    this.addTypeMap(sys.Double, sys.Integer, sys.Double);
                    this.addTypeMap(sys.Integer, sys.Integer, sys.Integer);
                    this.addTypeMap(sys.String, sys.String, FlowScript.Type.All);
                    this.addTypeMap(sys.String, FlowScript.Type.All, sys.String);
                    this.addTypeMap(sys.Any, sys.Any, FlowScript.Type.All);
                    this.addTypeMap(sys.Any, FlowScript.Type.All, sys.Any);
                    // Setup the expected parameters and return type:
                    this.defineParameter("a", [sys.Any]);
                    this.defineParameter("b", [sys.Any]);
                    this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                    _super.prototype.onInit.call(this);
                };
                return Add;
            }(Core.Operator));
            Math_1.Add = Add;
            // ========================================================================================================================
            /** Multiply two values.
              */
            var Multiply = /** @class */ (function (_super) {
                __extends(Multiply, _super);
                function Multiply(parent) {
                    return _super.call(this, parent, "Multiply", "$a * $b") || this;
                }
                Multiply.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [sys.Double, sys.Integer]);
                    this.defineParameter("b", [sys.Double, sys.Integer]);
                    this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                    _super.prototype.onInit.call(this);
                };
                return Multiply;
            }(Core.Operator));
            Math_1.Multiply = Multiply;
            // ========================================================================================================================
            /** get the square root of a value.
              */
            var SQRT = /** @class */ (function (_super) {
                __extends(SQRT, _super);
                function SQRT(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "SQRT", "√$a") || this;
                }
                SQRT.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [sys.Double, sys.Integer]);
                    this.defineDefaultReturnVar(sys.Double);
                    _super.prototype.onInit.call(this);
                };
                return SQRT;
            }(FlowScript.Component));
            Math_1.SQRT = SQRT;
            // ========================================================================================================================
        })(Math = Core.Math || (Core.Math = {}));
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        var Binary;
        (function (Binary_1) {
            // ========================================================================================================================
            // Core Math Components
            // ========================================================================================================================
            /** Defines the Math namespace type. */
            var Binary = /** @class */ (function (_super) {
                __extends(Binary, _super);
                function Binary(parent) {
                    var _this = _super.call(this, parent, "Binary") || this;
                    /** Returns the inverse boolean value of a given expression. */
                    _this.Not = new Not(_this);
                    /** Returns the eXclusive OR of a given expression. */
                    _this.XOR = new XOR(_this);
                    /** Shifts all bits of an integer value to the left a number of times. */
                    _this.ShiftLeft = new ShiftLeft(_this);
                    /** Shifts all bits of an integer value to the right a number of times. */
                    _this.ShiftRight = new ShiftRight(_this);
                    return _this;
                }
                Binary.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return Binary;
            }(FlowScript.Type));
            Binary_1.Binary = Binary;
            // ========================================================================================================================
            /** Returns the inverse of the given boolean value.
              */
            var Not = /** @class */ (function (_super) {
                __extends(Not, _super);
                function Not(parent) {
                    return _super.call(this, parent, "Not", "not $a", true) || this;
                }
                Not.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [sys.Boolean]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return Not;
            }(Core.Operator));
            Binary_1.Not = Not;
            // ========================================================================================================================
            /** Returns the eXclusive OR of a given value.
              */
            var XOR = /** @class */ (function (_super) {
                __extends(XOR, _super);
                function XOR(parent) {
                    return _super.call(this, parent, "XOR", "xor $a", true) || this;
                }
                XOR.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [sys.Integer]);
                    this.defineDefaultReturnVar(sys.Integer);
                    _super.prototype.onInit.call(this);
                };
                return XOR;
            }(Core.Operator));
            Binary_1.XOR = XOR;
            // ========================================================================================================================
            /** Shifts all bits of an integer value to the left a number of times.
              */
            var ShiftLeft = /** @class */ (function (_super) {
                __extends(ShiftLeft, _super);
                function ShiftLeft(parent) {
                    return _super.call(this, parent, "ShiftLeft", "$value << $count") || this;
                }
                ShiftLeft.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("value", [sys.Integer]);
                    this.defineParameter("count", [sys.Integer]);
                    this.defineDefaultReturnVar(sys.Integer);
                    _super.prototype.onInit.call(this);
                };
                return ShiftLeft;
            }(Core.Operator));
            Binary_1.ShiftLeft = ShiftLeft;
            // ========================================================================================================================
            /** Shifts all bits of an integer value to the right a number of times.
              */
            var ShiftRight = /** @class */ (function (_super) {
                __extends(ShiftRight, _super);
                function ShiftRight(parent) {
                    return _super.call(this, parent, "ShiftRight", "$value >> $count") || this;
                }
                ShiftRight.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("value", [sys.Integer]);
                    this.defineParameter("count", [sys.Integer]);
                    this.defineDefaultReturnVar(sys.Integer);
                    _super.prototype.onInit.call(this);
                };
                return ShiftRight;
            }(Core.Operator));
            Binary_1.ShiftRight = ShiftRight;
            // ========================================================================================================================
        })(Binary = Core.Binary || (Core.Binary = {}));
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
/** Contains components used for comparisons.
  */
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        var Comparison;
        (function (Comparison_1) {
            /** Defines the Comparison namespace type. */
            var Comparison = /** @class */ (function (_super) {
                __extends(Comparison, _super);
                function Comparison(parent) {
                    var _this = _super.call(this, parent, "Comparison") || this;
                    /** Tests if one value equals another. */
                    _this.Equals = new Equals(_this);
                    /** Tests if one value AND its type equals another. */
                    _this.StrictEquals = new StrictEquals(_this);
                    /** Tests if one value does NOT equal another. */
                    _this.NotEquals = new NotEquals(_this);
                    /** Tests if one value AND its type do NOT equal another. */
                    _this.StrictNotEquals = new StrictNotEquals(_this);
                    /** Tests if one value is less than another.  */
                    _this.LessThan = new LessThan(_this);
                    /** Tests if one value is greater than another.  */
                    _this.GreaterThan = new GreaterThan(_this);
                    /** Tests if one value is less than or equal to another. */
                    _this.LessThanOrEqual = new LessThanOrEqual(_this);
                    /** Tests if one value is greater than or equal to another. */
                    _this.GreaterThanOrEqual = new GreaterThanOrEqual(_this);
                    return _this;
                }
                Comparison.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return Comparison;
            }(FlowScript.Type));
            Comparison_1.Comparison = Comparison;
            // ========================================================================================================================
            /** Tests if one value equals another.
              */
            var Equals = /** @class */ (function (_super) {
                __extends(Equals, _super);
                function Equals(parent) {
                    return _super.call(this, parent, "Equals", "$a == $b") || this;
                }
                Equals.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return Equals;
            }(Core.Operator));
            Comparison_1.Equals = Equals;
            // ========================================================================================================================
            /** Tests if one value AND its type equals another.
              */
            var StrictEquals = /** @class */ (function (_super) {
                __extends(StrictEquals, _super);
                function StrictEquals(parent) {
                    return _super.call(this, parent, "StrictEquals", "$a === $b") || this;
                }
                StrictEquals.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return StrictEquals;
            }(Core.Operator));
            Comparison_1.StrictEquals = StrictEquals;
            // ========================================================================================================================
            /** Tests if one value does NOT equal another.
              */
            var NotEquals = /** @class */ (function (_super) {
                __extends(NotEquals, _super);
                function NotEquals(parent) {
                    return _super.call(this, parent, "NotEquals", "$a != $b") || this;
                }
                NotEquals.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return NotEquals;
            }(Core.Operator));
            Comparison_1.NotEquals = NotEquals;
            // ========================================================================================================================
            /** Tests if one value AND its type do NOT equal another.
              */
            var StrictNotEquals = /** @class */ (function (_super) {
                __extends(StrictNotEquals, _super);
                function StrictNotEquals(parent) {
                    return _super.call(this, parent, "StrictNotEquals", "$a !== $b") || this;
                }
                StrictNotEquals.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return StrictNotEquals;
            }(Core.Operator));
            Comparison_1.StrictNotEquals = StrictNotEquals;
            // ========================================================================================================================
            /** Tests if one value is less than another.
              */
            var LessThan = /** @class */ (function (_super) {
                __extends(LessThan, _super);
                function LessThan(parent) {
                    return _super.call(this, parent, "LessThan", "$a < $b") || this;
                }
                LessThan.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return LessThan;
            }(Core.Operator));
            Comparison_1.LessThan = LessThan;
            // ========================================================================================================================
            /** Tests if one value is greater than another.
              */
            var GreaterThan = /** @class */ (function (_super) {
                __extends(GreaterThan, _super);
                function GreaterThan(parent) {
                    return _super.call(this, parent, "GreaterThan", "$a > $b") || this;
                }
                GreaterThan.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return GreaterThan;
            }(Core.Operator));
            Comparison_1.GreaterThan = GreaterThan;
            // ========================================================================================================================
            /** Tests if one value is less than or equal to another.
              */
            var LessThanOrEqual = /** @class */ (function (_super) {
                __extends(LessThanOrEqual, _super);
                function LessThanOrEqual(parent) {
                    return _super.call(this, parent, "LessThanOrEqual", "$a <= $b") || this;
                }
                LessThanOrEqual.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return LessThanOrEqual;
            }(Core.Operator));
            Comparison_1.LessThanOrEqual = LessThanOrEqual;
            // ========================================================================================================================
            /** Tests if one value is greater than or equal to another.
              */
            var GreaterThanOrEqual = /** @class */ (function (_super) {
                __extends(GreaterThanOrEqual, _super);
                function GreaterThanOrEqual(parent) {
                    return _super.call(this, parent, "GreaterThanOrEqual", "$a >= $b") || this;
                }
                GreaterThanOrEqual.prototype.onInit = function () {
                    // Setup the expected parameters and return type:
                    var sys = this.script.System;
                    this.defineParameter("a", [FlowScript.Type.All]);
                    this.defineParameter("b", [FlowScript.Type.All]);
                    this.defineDefaultReturnVar(sys.Boolean);
                    _super.prototype.onInit.call(this);
                };
                return GreaterThanOrEqual;
            }(Core.Operator));
            Comparison_1.GreaterThanOrEqual = GreaterThanOrEqual;
            // ========================================================================================================================
        })(Comparison = Core.Comparison || (Core.Comparison = {}));
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
/** The namespace for HTML related components. */
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        var HTML;
        (function (HTML_1) {
            // ========================================================================================================================
            // Core HTML Components
            // ========================================================================================================================
            /** Defines the HTML namespace type. */
            var HTML = /** @class */ (function (_super) {
                __extends(HTML, _super);
                function HTML(parent) {
                    var _this = _super.call(this, parent, "HTML") || this;
                    /** Represents an HTML node. */
                    _this.Node = new Node(_this);
                    /** Represents a list of DOM nodes. */
                    _this.NodeList = new NodeList(_this);
                    /** Represents a list of DOM nodes indexed by name. */
                    _this.NamedNodeMap = new NamedNodeMap(_this);
                    /** Represents an HTML DOM element. */
                    _this.Element = new Element(_this);
                    /** Represents the HTML root element. */
                    _this.HTMLElement = new HTMLElement(_this);
                    /** Represents an browser window document object. */
                    _this.Document = new Document(_this);
                    /** Enumeration of node types. */
                    _this.NodeTypes = new NodeTypes(_this);
                    /** Enumeration of document positions. */
                    _this.DocumentPositions = new NodeTypes(_this);
                    return _this;
                }
                HTML.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return HTML;
            }(FlowScript.Type));
            HTML_1.HTML = HTML;
            // ========================================================================================================================
            /** Attaches an event listener to an element that supports DOM related events.
              */
            var On = /** @class */ (function (_super) {
                __extends(On, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function On(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.Text, "On", "on $eventName do $block") || this;
                }
                On.prototype.onInit = function () {
                    // Setup the expected parameters and return types:
                    var sys = this.script.System;
                    _super.prototype.onInit.call(this);
                };
                return On;
            }(FlowScript.Component));
            HTML_1.On = On;
            // ========================================================================================================================
            // Node Components 
            var Node_removeChild = /** @class */ (function (_super) {
                __extends(Node_removeChild, _super);
                function Node_removeChild(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.Text, "Node_removeChild", "remove child node $oldChild") || this;
                }
                Node_removeChild.prototype.onInit = function () {
                    var sys = this.script.System;
                    this.defineParameter("oldChild", [sys.HTML.Node]);
                    this.defineDefaultReturnVar(sys.HTML.Node);
                    _super.prototype.onInit.call(this);
                };
                return Node_removeChild;
            }(FlowScript.Component));
            HTML_1.Node_removeChild = Node_removeChild;
            var Node_appendChild = /** @class */ (function (_super) {
                __extends(Node_appendChild, _super);
                function Node_appendChild(parent) {
                    return _super.call(this, parent, FlowScript.ComponentTypes.Text, "Node_appendChild", "append child node $newChild") || this;
                }
                Node_appendChild.prototype.onInit = function () {
                    var sys = this.script.System;
                    this.defineParameter("newChild", [sys.HTML.Node]);
                    this.defineDefaultReturnVar(sys.HTML.Node);
                    _super.prototype.onInit.call(this);
                };
                return Node_appendChild;
            }(FlowScript.Component));
            HTML_1.Node_appendChild = Node_appendChild;
            // ========================================================================================================================
            var NodeList = /** @class */ (function (_super) {
                __extends(NodeList, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function NodeList(parent) {
                    return _super.call(this, parent, null, "NodeList") || this;
                }
                NodeList.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return NodeList;
            }(Core.FSObject));
            HTML_1.NodeList = NodeList;
            // ========================================================================================================================
            var NamedNodeMap = /** @class */ (function (_super) {
                __extends(NamedNodeMap, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function NamedNodeMap(parent) {
                    return _super.call(this, parent, null, "NamedNodeMap") || this;
                }
                NamedNodeMap.prototype.onInit = function () {
                    _super.prototype.onInit.call(this);
                };
                return NamedNodeMap;
            }(Core.FSObject));
            HTML_1.NamedNodeMap = NamedNodeMap;
            // ========================================================================================================================
            var NodeTypes = /** @class */ (function (_super) {
                __extends(NodeTypes, _super);
                function NodeTypes(parent) {
                    return _super.call(this, parent, "NodeTypes", {
                        ELEMENT_NODE: 1,
                        ATTRIBUTE_NODE: 2,
                        TEXT_NODE: 3,
                        CDATA_SECTION_NODE: 4,
                        ENTITY_REFERENCE_NODE: 5,
                        ENTITY_NODE: 6,
                        PROCESSING_INSTRUCTION_NODE: 7,
                        COMMENT_NODE: 8,
                        DOCUMENT_NODE: 9,
                        DOCUMENT_TYPE_NODE: 10,
                        DOCUMENT_FRAGMENT_NODE: 11,
                        NOTATION_NODE: 12
                    }) || this;
                }
                return NodeTypes;
            }(FlowScript.Enum));
            HTML_1.NodeTypes = NodeTypes;
            var DocumentPositions = /** @class */ (function (_super) {
                __extends(DocumentPositions, _super);
                function DocumentPositions(parent) {
                    return _super.call(this, parent, "DocumentPositions", {
                        DISCONNECTED: 1,
                        PRECEDING: 2,
                        FOLLOWING: 4,
                        CONTAINS: 8,
                        CONTAINED_BY: 16,
                        IMPLEMENTATION_SPECIFIC: 32
                    }) || this;
                }
                return DocumentPositions;
            }(FlowScript.Enum));
            HTML_1.DocumentPositions = DocumentPositions;
            // ========================================================================================================================
            var Node = /** @class */ (function (_super) {
                __extends(Node, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function Node(parent) {
                    var _this = _super.call(this, parent, null, "Node") || this;
                    _this.CloneTypes = new FlowScript.Enum(_this, "CloneTypes", { Shallow: false, Deep: true });
                    return _this;
                }
                Node.prototype.onInit = function () {
                    // Setup the expected parameters and return types:
                    var sys = this.script.System;
                    this.defineInstanceProperty("nodeType", [sys.Double]);
                    this.defineInstanceProperty("previousSibling", [sys.HTML.Node]);
                    this.defineInstanceProperty("localName", [sys.String]);
                    this.defineInstanceProperty("namespaceURI", [sys.String]);
                    this.defineInstanceProperty("textContent", [sys.String]);
                    this.defineInstanceProperty("parentNode", [sys.HTML.Node]);
                    this.defineInstanceProperty("nextSibling", [sys.HTML.Node]);
                    this.defineInstanceProperty("nodeValue", [sys.String]);
                    this.defineInstanceProperty("lastChild", [sys.HTML.Node]);
                    this.defineInstanceProperty("childNodes", [sys.HTML.NodeList]);
                    this.defineInstanceProperty("nodeName", [sys.String]);
                    this.defineInstanceProperty("ownerDocument", [sys.HTML.Document]);
                    this.defineInstanceProperty("attributes", [sys.HTML.NamedNodeMap]);
                    this.defineInstanceProperty("firstChild", [sys.HTML.Node]);
                    this.defineInstanceProperty("prefix", [sys.String]);
                    this.removeChild = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "removeChild", "remove child node $oldChild")
                        .defineInstanceType(this).defineParameter("oldChild", [sys.HTML.Node]).defineReturn(null, sys.HTML.Node)
                        .addStatement(sys.Code, ["$this.removeChild($oldChild)"]).Component;
                    this.appendChild = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "appendChild", "add child node $newChild")
                        .defineInstanceType(this).defineParameter("oldChild", [sys.HTML.Node]).defineReturn(null, sys.HTML.Node)
                        .addStatement(sys.Code, ["$this.removeChild($newChild)"]).Component;
                    this.isSupported = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "isSupported", "$feature and $version are supported?")
                        .defineInstanceType(this).defineParameter("feature", [sys.String]).defineParameter("version", [sys.String]).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.isSupported($feature, $version)"]).Component;
                    this.isEqualNode = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "isEqualNode", "$node is equal?")
                        .defineInstanceType(this).defineParameter("node", [sys.HTML.Node]).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.isEqualNode($node)"]).Component;
                    this.lookupPrefix = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "lookupPrefix", "lookup prefix $namespaceURI")
                        .defineInstanceType(this).defineParameter("namespaceURI", [sys.String]).defineReturn(null, sys.String)
                        .addStatement(sys.Code, ["$this.lookupPrefix($namespaceURI)"]).Component;
                    this.isDefaultNamespace = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "isDefaultNamespace", "$prefix is the default?")
                        .defineInstanceType(this).defineParameter("prefix", [sys.String]).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.isDefaultNamespace($prefix)"]).Component;
                    this.compareDocumentPosition = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "compareDocumentPosition", "compare position of $node")
                        .defineInstanceType(this).defineParameter("node", [sys.HTML.Node]).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.compareDocumentPosition($node)"]).Component;
                    this.normalize = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "normalize")
                        .defineInstanceType(this).addStatement(sys.Code, ["$this.normalize()"]).Component;
                    this.isSameNode = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "isSameNode", "$node is the same?")
                        .defineInstanceType(this).defineParameter("node", [sys.HTML.Node]).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.isSameNode($node)"]).Component;
                    this.hasAttributes = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "hasAttributes", "attributes exist?")
                        .defineInstanceType(this).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.hasAttributes()"]).Component;
                    this.lookupNamespaceURI = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "lookupNamespaceURI", "lookup namespace URI by $prefix")
                        .defineInstanceType(this).defineParameter("prefix", [sys.String]).defineReturn(null, sys.String)
                        .addStatement(sys.Code, ["$this.lookupNamespaceURI($prefix)"]).Component;
                    this.cloneNode = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "cloneNode", "$cloneType clone this node")
                        .defineInstanceType(this).defineEnumProperty("cloneType", this.CloneTypes, true).defineReturn(null, sys.HTML.Node)
                        .addStatement(sys.Code, ["$this.cloneNode($prefix)"]).Component;
                    this.hasChildNodes = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "hasChildNodes", "child nodes exist?")
                        .defineInstanceType(this).defineReturn(null, sys.Boolean)
                        .addStatement(sys.Code, ["$this.hasChildNodes()"]).Component;
                    this.replaceChild = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "replaceChild", "replace $oldChild with $newChild")
                        .defineInstanceType(this).defineParameter("oldChild", [sys.HTML.Node]).defineParameter("newChild", [sys.HTML.Node]).defineReturn(null, sys.HTML.Node)
                        .addStatement(sys.Code, ["$this.replaceChild($newChild, $oldChild)"]).Component;
                    this.insertBefore = new FlowScript.ComponentBuilder(this, FlowScript.ComponentTypes.Expression, "insertBefore", "insert $newNode before $?existingChild")
                        .defineInstanceType(this).defineParameter("newNode", [sys.HTML.Node]).defineParameter("existingChild", [sys.HTML.Node]).defineReturn(null, sys.HTML.Node)
                        .addStatement(sys.Code, ["$this.insertBefore($newChild, $oldChild)"]).Component;
                    /*
                        /removeChild(oldChild: Node): Node;
                        /appendChild(newChild: Node): Node;
                        /isSupported(feature: string, version: string): boolean;
                        /isEqualNode(arg: Node): boolean;
                        /lookupPrefix(namespaceURI: string): string;
                        /isDefaultNamespace(namespaceURI: string): boolean;
                        /compareDocumentPosition(other: Node): number;
                        /normalize(): void ;
                        /isSameNode(other: Node): boolean;
                        /hasAttributes(): boolean;
                        /lookupNamespaceURI(prefix: string): string;
                        /cloneNode(deep?: boolean): Node;
                        /hasChildNodes(): boolean;
                        /replaceChild(newChild: Node, oldChild: Node): Node;
                        /insertBefore(newChild: Node, refChild?: Node): Node;
                    */
                    this.defineInstanceProperty("ELEMENT_NODE", [sys.Integer], 1);
                    this.defineInstanceProperty("ATTRIBUTE_NODE", [sys.Integer], 2);
                    this.defineInstanceProperty("TEXT_NODE", [sys.Integer], 3);
                    this.defineInstanceProperty("CDATA_SECTION_NODE", [sys.Integer], 4);
                    this.defineInstanceProperty("ENTITY_REFERENCE_NODE", [sys.Integer], 5);
                    this.defineInstanceProperty("ENTITY_NODE", [sys.Integer], 6);
                    this.defineInstanceProperty("PROCESSING_INSTRUCTION_NODE", [sys.Integer], 7);
                    this.defineInstanceProperty("COMMENT_NODE", [sys.Integer], 8);
                    this.defineInstanceProperty("DOCUMENT_NODE", [sys.Integer], 9);
                    this.defineInstanceProperty("DOCUMENT_TYPE_NODE", [sys.Integer], 10);
                    this.defineInstanceProperty("DOCUMENT_FRAGMENT_NODE", [sys.Integer], 11);
                    this.defineInstanceProperty("NOTATION_NODE", [sys.Integer], 12);
                    this.defineInstanceProperty("DOCUMENT_POSITION_DISCONNECTED", [sys.Integer], 1);
                    this.defineInstanceProperty("DOCUMENT_POSITION_PRECEDING", [sys.Integer], 2);
                    this.defineInstanceProperty("DOCUMENT_POSITION_FOLLOWING", [sys.Integer], 4);
                    this.defineInstanceProperty("DOCUMENT_POSITION_CONTAINS", [sys.Integer], 8);
                    this.defineInstanceProperty("DOCUMENT_POSITION_CONTAINED_BY", [sys.Integer], 16);
                    this.defineInstanceProperty("DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", [sys.Integer], 32);
                    this.defineDefaultReturnVar(sys.String);
                    _super.prototype.onInit.call(this);
                };
                return Node;
            }(Core.FSObject));
            HTML_1.Node = Node;
            // ========================================================================================================================
            var Element = /** @class */ (function (_super) {
                __extends(Element, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function Element(parent) {
                    return _super.call(this, parent, parent.script.System.HTML.Node, "Element") || this;
                }
                Element.prototype.onInit = function () {
                    // Setup the expected parameters and return types:
                    var sys = this.script.System;
                    this.defineInstanceProperty("name", [sys.String]);
                    this.defineInstanceProperty("id", [sys.String]);
                    this.defineDefaultReturnVar(sys.String);
                    _super.prototype.onInit.call(this);
                };
                return Element;
            }(Core.FSObject));
            HTML_1.Element = Element;
            // ========================================================================================================================
            var HTMLElement = /** @class */ (function (_super) {
                __extends(HTMLElement, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function HTMLElement(parent) {
                    return _super.call(this, parent, parent.script.System.HTML.Element, "HTMLElement") || this;
                }
                HTMLElement.prototype.onInit = function () {
                    // Setup the expected parameters and return types:
                    var sys = this.script.System;
                    this.defineDefaultReturnVar(sys.String);
                    _super.prototype.onInit.call(this);
                };
                return HTMLElement;
            }(Core.FSObject));
            HTML_1.HTMLElement = HTMLElement;
            // ========================================================================================================================
            var Document = /** @class */ (function (_super) {
                __extends(Document, _super);
                // --------------------------------------------------------------------------------------------------------------------
                function Document(parent) {
                    return _super.call(this, parent, parent.script.System.HTML.Element, "Document") || this;
                }
                Document.prototype.onInit = function () {
                    // Setup the expected parameters and return types:
                    var sys = this.script.System;
                    this.defineDefaultReturnVar(sys.String);
                    _super.prototype.onInit.call(this);
                };
                return Document;
            }(Core.FSObject));
            HTML_1.Document = Document;
            // ========================================================================================================================
        })(HTML = Core.HTML || (Core.HTML = {}));
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Manages the margins used for rendering FlowScript to code.
      */
    var Margin = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Margin(marginCharacters) {
            if (marginCharacters === void 0) { marginCharacters = "    "; }
            this.marginCharacters = marginCharacters;
            this._margins = [""];
            this._currentLevel = 0;
        }
        // --------------------------------------------------------------------------------------------------------------------
        /** Advance to the next margin level. */
        Margin.prototype.next = function () {
            ++this._currentLevel;
            if (this._currentLevel > Margin.MAX_MARGINS)
                throw "Warning: The current level has exceeded the maximum default margin levels allowed.  This usually means there's a rendering error.  To increase this limit, update 'Margin.MAX_MARGINS'.";
            var m = this._margins[this._currentLevel];
            if (m == FlowScript.undefined)
                m = this._margins[this._currentLevel] = this._margins[this._currentLevel - 1] + this.marginCharacters;
            return m;
        };
        /** Backup to the previous margin level. */
        Margin.prototype.previous = function () {
            if (this._currentLevel <= 0)
                throw "Error: The current margin level is going out of alignment - there's a bug in the rendering process.";
            return this._margins[--this._currentLevel];
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the current margin for the current level. */
        Margin.prototype.toString = function (indexLevel) { return this._margins[indexLevel !== FlowScript.undefined ? indexLevel : this._currentLevel]; };
        // --------------------------------------------------------------------------------------------------------------------
        Margin.MAX_MARGINS = 100;
        return Margin;
    }());
    FlowScript.Margin = Margin;
    /** Represents a single rendered line of code. */
    var RenderedLine = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function RenderedLine(margin, contents, source, opcode, args) {
            this.margin = margin;
            this.contents = contents;
            this.marginLevel = margin._currentLevel;
            this.source = source;
            this.opcode = opcode;
            this.args = args;
        }
        RenderedLine.prototype.toString = function (margin) { return (margin !== FlowScript.undefined ? margin : "") + this.margin.toString(this.marginLevel) + this.contents; };
        return RenderedLine;
    }());
    FlowScript.RenderedLine = RenderedLine;
    /** When compiling scripts for final output or simulation, this class is used to hold the rendered hierarchy for types and functional components. */
    var TypeRenderer = /** @class */ (function () {
        function TypeRenderer(compilerOrParent, source, isSimulation) {
            if (isSimulation === void 0) { isSimulation = false; }
            this._lines = [];
            this._renderers = {};
            this._localVars = [];
            /** Used to separate local context objects for functional component calls, and to aid in call cleanup. */
            this.callStack = [];
            /** Used to separate nested loop counters. */
            this.loopID = 0;
            this._objContextVars = [];
            this._margin = new Margin();
            // --------------------------------------------------------------------------------------------------------------------
            // The following functions are used to add special lines for simulation purposes.
            this._internalRunningValVarName = Compiler.CONTEXT_VAR_NAME + ".$__";
            this._checkType(source);
            this._parent = compilerOrParent instanceof TypeRenderer ? compilerOrParent : null;
            this._compiler = compilerOrParent instanceof Compiler ? compilerOrParent : this._parent._compiler;
            this._source = source;
            if (isSimulation)
                this.root._isSimulation = true; // (once this is set, it should not be changed)
        }
        Object.defineProperty(TypeRenderer.prototype, "isFunctionalComponent", {
            get: function () { return this._source && this._source instanceof FlowScript.Component && this._source.componentType == FlowScript.ComponentTypes.Functional; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "component", {
            /** Returns the source typed as a component. The source component of each TypeRenderer node is the containing component of any rendered lines. */
            get: function () { return this._source; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "type", {
            /** The type that is the source for this renderer entry. */
            get: function () { return this._source; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "isSimulation", {
            /** Returns true if this rendering is for simulation purposes only, and thus cannot be used to render final code. */
            get: function () { return this.root._isSimulation; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "lastLineIndex", {
            /** The index of the last line added. */
            get: function () { return this._lines.length - 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "nextLineIndex", {
            /** The index of the next line to be added. */
            get: function () { return this._lines.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "objContextVar", {
            /** If this is set, then any expression component found with '$this' will be replaced with the object reference in this
              * string.  This property is used in rendering the core "with" components.
              * Note: Any '$this' token encountered while this property is not yet set will cause an error.
              */
            get: function () { return this._objContextVars[this._objContextVars.length - 1]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "compiler", {
            get: function () { return this._compiler; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "root", {
            get: function () { return this._parent ? this._parent.root : this; },
            enumerable: true,
            configurable: true
        });
        /** Creates a root level type renderer that will wrap the 'main' script in 'compiler.script'. */
        TypeRenderer.createRootTypeRenderer = function (compiler, isSimulation) {
            if (isSimulation === void 0) { isSimulation = false; }
            return new TypeRenderer(compiler, new FlowScript.Type(null, "root", compiler.script), isSimulation);
        };
        TypeRenderer.prototype._checkType = function (type) {
            if (!type)
                throw "A valid type or component is required.";
            if (type instanceof FlowScript.Component && type.componentType !== FlowScript.ComponentTypes.Functional)
                throw "Only basic types and functional component types can be registered.";
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a new rendered line for the underlying component, along with the current margin level, and returns the line index.
         * If a line is given with no opcode then `OpCodes.Exec` is assumed (evaluates the line using `eval()`). If an opcode is given then
         * simulation is mode assumed (opcodes are not used for final rendering).
         */
        TypeRenderer.prototype.addLine = function (source, line, opcode) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            if (opcode !== FlowScript.undefined)
                this.root._isSimulation = true; // (make sure this flag is set)
            else if (this.isSimulation)
                opcode = FlowScript.OpCodes.Exec; // (all lines in simulation mode default to execution/evaluation one after the other)
            return this._lines.push(new RenderedLine(this._margin, line, source, opcode, args)) - 1;
        };
        /** Inserts a new rendered line at a specific line number for the underlying component, prefixed with the current margin level.
          * Note: The first line starts at index 0.
          */
        TypeRenderer.prototype.insertLine = function (index, source, line, opcode) {
            var args = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                args[_i - 4] = arguments[_i];
            }
            if (index < 0 || index > this._lines.length)
                throw "Insert error: index not within or around existing lines.";
            if (opcode !== FlowScript.undefined)
                this.root._isSimulation = true; // (make sure this flag is set)
            else if (this.isSimulation)
                opcode = FlowScript.OpCodes.Exec; // (all lines in simulation mode default to execution/evaluation one after the other)
            this._lines.splice(index, 0, new RenderedLine(this._margin, line, source, opcode, args));
        };
        TypeRenderer.prototype.addLocalVar = function (name) {
            if (this._localVars.indexOf(name) < 0)
                this._localVars.push(name);
            return name;
        };
        /** See 'objContextVar'. */
        TypeRenderer.prototype.addContextVar = function (varPath) {
            this._objContextVars.push(varPath);
            return varPath;
        };
        /** See 'objContextVar'. */
        TypeRenderer.prototype.removeLastContextVar = function () {
            return this._objContextVars.pop();
        };
        /** Inserts the current list of local variable names and clears the list.
         * @param source The source reference to log for this request.
         */
        TypeRenderer.prototype.insertDeclarations = function (source) {
            if (this._localVars.length)
                this.insertLine(this.isSimulation ? 0 : 1, source, "var " + this._localVars.join(', ') + ";");
            // (note: for simulations, insert at beginning, otherwise the first line is the function parameter declarations)
            this._localVars.length = 0;
        };
        /** Prepends text before the start of a previously added line. */
        TypeRenderer.prototype.prefixLastLine = function (prefix) {
            if (!this._lines.length)
                throw "This renderer does not have any lines yet.";
            this._lines[this._lines.length - 1].contents = prefix + this._lines[this._lines.length - 1].contents;
        };
        /** Appends text at the end of a previously added line. */
        TypeRenderer.prototype.appendLastLine = function (suffix) {
            if (!this._lines.length)
                throw "This renderer does not have any lines yet.";
            this._lines[this._lines.length - 1].contents = this._lines[this._lines.length - 1].contents + suffix;
        };
        /** Go to the next margin. */
        TypeRenderer.prototype.nextMargin = function () {
            this._margin.next();
        };
        /** Go to the previous margin. */
        TypeRenderer.prototype.previousMargin = function () {
            this._margin.previous();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Renders the underlying compiled component and all nested components to an array of code lines.
         * @param {string} targetVar The left side of an assignment operation that will receive the rendered function when executed.
         */
        TypeRenderer.prototype.render = function (targetVar, margin, codeLines) {
            if (margin === void 0) { margin = new Margin(); }
            if (codeLines === void 0) { codeLines = []; }
            if (this.isSimulation)
                throw "This component renderer can only be used for simulations and cannot output final code.";
            var hasLines = this._lines.length > 0;
            var hasNestedComponents = !FlowScript.isObjectEmpty(this._renderers);
            var isRoot = !this._parent;
            codeLines.push(margin + targetVar + " = (function() {");
            margin.next();
            if (hasLines) {
                if (this.isFunctionalComponent) {
                    codeLines.push(margin + "var " + Compiler.RUNNING_VAL_VAR_NAME + " = " + this._lines[0]);
                    // ... add rest of function body ...
                    for (var i = 1, n = this._lines.length; i < n; ++i) // (note: this starts at 1 as the first line depends on any nested components)
                        codeLines.push(this._lines[i].toString(margin)); // (note: statements are already indented due to functional component rendering)
                    // ... set expected argument names ...
                    if (this.component.parameters && this.component.parameters.length) {
                        var argNames = [];
                        for (var i = 0, n = this.component.parameters.length; i < n; ++i)
                            argNames.push("'" + this.component.parameters.getProperty(i).name + "'"); // (in case not all parameters were supplied arguments by caller)
                        codeLines.push(margin + Compiler.RUNNING_VAL_VAR_NAME + ".parameterNames = [" + argNames.join(', ') + "];"); // (in case not all parameters were supplied arguments by caller)
                    }
                    codeLines.push(margin + Compiler.RUNNING_VAL_VAR_NAME + ".context = {};"); // (a root context placeholder is required by default for all individual component function objects)
                }
                else {
                    // ... this component is not functional, but has lines, so just export them as text lines into a string object as a place to hold them ...
                    // (note: this MUST be a string object in order to add nested type objects next, if any)
                    codeLines.push(margin + "var " + Compiler.RUNNING_VAL_VAR_NAME + " = new String(\"" + FlowScript.Utilities.replace(this._lines[0].toString(), '"', '\\"') + "\"");
                    margin.next();
                    for (var i = 1, n = this._lines.length; i < n; ++i) // (note: this starts at 1 as the first line depends on any nested components)
                        codeLines.push(margin + "+ \"" + FlowScript.Utilities.replace(this._lines[i].toString(margin), '"', '\\"') + "\"");
                    codeLines[codeLines.length - 1] += ");"; // (need to terminate the last line of the string object construction properly)
                    margin.previous();
                }
            }
            else
                codeLines.push(margin + "var " + Compiler.RUNNING_VAL_VAR_NAME + " = {};");
            for (var typeName in this._renderers)
                this._renderers[typeName].render(Compiler.RUNNING_VAL_VAR_NAME + "." + this._renderers[typeName]._source.safeName, margin, codeLines);
            if (isRoot) { // (an internal script dereference is needed at the first block scope for all nested components)
                codeLines.push(margin + "var " + Compiler.SCRIPT_VAR_NAME + " = new FlowScript.RuntimeScript({ types: " + Compiler.RUNNING_VAL_VAR_NAME + " });");
                // (note: the root component is the root 'System' type, which needs to be accessible by nested components during execution)
                codeLines.push(margin + "return " + Compiler.SCRIPT_VAR_NAME + ";");
            }
            else
                codeLines.push(margin + "return " + Compiler.RUNNING_VAL_VAR_NAME + ";");
            margin.previous();
            codeLines.push(margin + "})();");
            return codeLines;
        };
        // --------------------------------------------------------------------------------------------------------------------
        TypeRenderer.prototype.toString = function (targetVar) {
            if (!targetVar && this._source)
                targetVar = Compiler.USER_RTSCRIPT_VAR_NAME;
            var codeLines = this.render(targetVar);
            return codeLines.join("\r\n") + "\r\n";
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Updates the underlying renderer hierarchy to match the namespace hierarchy of the specified type. */
        TypeRenderer.prototype.registerType = function (type) {
            this._checkType(type);
            var types = [], root = this.root, rend = root;
            while (type) {
                types.push(type);
                type = type.parent;
            }
            //?if (types[types.length - 1].safeName != root._source.safeName)
            //    throw "The root renderer source name '" + root._source.safeName + "' does not match the root type name for component '" + types[types.length - 1].safeFullTypeName + "'.  Root names must always match, since the root name is always based on the main entry component.";
            // ... traverse the component's type hierarchy to find the proper renderer ...
            for (var i = types.length - 1; i >= 0; --i) {
                var nextRend = rend._renderers[types[i].safeName];
                rend = nextRend ? nextRend : rend._renderers[types[i].safeName] = new TypeRenderer(rend, types[i], this.isSimulation);
            }
            return rend;
        };
        /** Returns an existing functional component render by the safe full type name, or null if the type is not yet registered. */
        TypeRenderer.prototype.getRenderer = function (safeFullTypeName) {
            var names = safeFullTypeName.split('.');
            var renderer = this.root;
            //?if (renderer._source.safeName != names[0])
            //    throw "The root renderer source name '" + renderer._source.safeName + "' does not match the root type name for type '" + safeFullTypeName + "'.  Root names must always match, since the root name is always based on the main entry component.";
            for (var i = 0, n = names.length; i < n; ++i)
                if (!(names[i] in renderer._renderers))
                    return null;
                else
                    renderer = renderer._renderers[names[i]];
            return renderer;
        };
        /** Checks if a functional component renderer exists for the specified full safe type. */
        TypeRenderer.prototype.hasRenderer = function (safeFullTypeName) { return this.getRenderer(safeFullTypeName) != null; };
        /** Adds a script to execute JavaScript code.
          * This is the same as calling 'addLine', except it adds an explicit opcode for the line(s), and splits the script by any line endings.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.exec = function (source, jscript) {
            var lines = jscript.split(/\n/g);
            for (var i = 0, n = lines.length; i < n; ++i)
                this.addLine(source, lines[i].trim(), FlowScript.OpCodes.Exec);
            return this.lastLineIndex;
        };
        /** Adds a line to evaluate a single operation, and sets the current running value with the result.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.eval = function (source, expressionCode) {
            return this.addLine(source, this.compiler._renderAssignment(this._internalRunningValVarName, expressionCode + ";"), FlowScript.OpCodes.Exec);
        };
        /** Adds a line to evaluate an operation on a previously set left argument, and the current value (see 'pushOpArg').
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.evalOp = function (source, operationType) {
            if (operationType.fullTypeName == this.compiler.script.System.Assign.fullTypeName)
                throw "Assignment operations must be added by calling 'assign()'.";
            // (note: The right side of the operation is always evaluated first, to support assignment operation patterns, and will be on the top of the value stack)
            return this.eval(source, this.compiler._renderOp(this._internalRunningValVarName, operationType, Compiler.CONTEXT_VAR_NAME + ".$__args.pop()"));
        };
        /** Adds a line to evaluate an operation on a previously set left argument, and the current value (see 'pushOpArg').
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.assign = function (source, leftSideVar) {
            // (note: Since the left side of an assignment is always a variable, it can be set directly with the running value)
            return this.eval(source, this.compiler._renderAssignment(leftSideVar, this._internalRunningValVarName));
        };
        /** Adds a line to evaluate a unary operation on the current running value by adding the required operation semantics.
          * Returns the index of the added line.
          *
          * @param {string} varName A variable to set, which overrides the default behavior of using the running value.
          */
        TypeRenderer.prototype.evalUnary = function (source, operationType, varName) {
            return this.eval(source, this.compiler._renderUnary(varName || this._internalRunningValVarName, operationType));
        };
        /** Adds the current value to the operation argument stack.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.pushOpArg = function () {
            return this.addLine(null, Compiler.CONTEXT_VAR_NAME + ".$__args.push(" + this._internalRunningValVarName + ");", FlowScript.OpCodes.Exec);
        };
        /** Adds a line to call another functional component.
          * Returns the index of the added line.
          * @param {number} ctxId The context ID is used to identify nested contexts in cases where blocks may be used as parameters.
          */
        TypeRenderer.prototype.call = function (source, compType, ctxID) {
            var callIndex = this.addLine(source, null, FlowScript.OpCodes.Call, compType, ctxID);
            // ... since this is a SIMULATED call transfer request, set the current running value to the running value of the calling context ...
            var localCtxName = Compiler.LOCAL_CONTEXT_VAR_NAME + (ctxID || "");
            this.eval(null, this._compiler._renderAssignment(Compiler.RUNNING_VAL_VAR_NAME, localCtxName + ".$__lineExec.eval('" + Compiler.RUNNING_VAL_VAR_NAME + "')") + ";");
            return callIndex;
        };
        /** Returns from the current functional component.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.return = function (source) {
            return this.addLine(source, null, FlowScript.OpCodes.Return);
        };
        /** Adds a line to jump to another line.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.jump = function (source, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - this.nextLineIndex;
            return this.addLine(source, null, FlowScript.OpCodes.Jump, offset);
        };
        /** Updates a previously added "jump" line with the proper line index.  If no line index is specified, the index following the current last line is assumed.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.updateJump = function (jumpLineIndex, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - jumpLineIndex;
            this._lines[jumpLineIndex].args[0] = offset;
        };
        /** Adds a line to jump to another line if the current running value is TRUE (used with 'while' loops).
          * Use 'updateJump' to update the line index target when available.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.jumpIf = function (source, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - this.nextLineIndex;
            return this.addLine(source, null, FlowScript.OpCodes.JumpIf, offset);
        };
        /** Adds a line to jump to another line if the current running value is FALSE (used for control flow [i.e. 'if..then...']).
          * Use 'updateJump' to update the line index target when available.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.jumpIfNot = function (source, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - this.nextLineIndex;
            return this.addLine(source, null, FlowScript.OpCodes.JumpIfNot, offset);
        };
        return TypeRenderer;
    }());
    FlowScript.TypeRenderer = TypeRenderer;
    /** The compiler reads the FlowScript type graph, starting at the "main" component, and outputs the resulting code.  The
      * compiler also supports runtime simulations that you can watch in real time, or step through for debugging purposes.
      * It's possible to extend this class and override the required methods needed to translate various aspects of the
      * compiler for targeting other languages.
      */
    var Compiler = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Compiler(script) {
            this._script = script;
        }
        Object.defineProperty(Compiler.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns the script for this compiler, which is usually a reference to a 'main' script component. */
            get: function () { return this._script; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Compiler.prototype, "debugging", {
            /** True if a simulation was started in debug mode. */
            get: function () { return this._debugging; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        Compiler.prototype._checkMain = function () {
            if (!this.script.main || this.script.main.componentType != FlowScript.ComponentTypes.Functional)
                throw "Error: Cannot add script to compiler without a proper main component.  A proper function-based component is required.";
        };
        /** Compiles the underlying script into code.
          * @param {string} targetVar The target variable that will receive the 'RuntimeScript' reference.  If not specified, this is '$fs' by default.
          */
        Compiler.prototype.compile = function (targetVar) {
            this._checkMain();
            // ... create a default root level renderer ...
            var rootRenderer = TypeRenderer.createRootTypeRenderer(this);
            // ... render the main functional component ...
            this._renderFunctionalComponent(rootRenderer, this.script.main);
            return rootRenderer.toString(targetVar);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Initializes the simulation of the underlying script. */
        Compiler.prototype.compileSimulation = function () {
            this._checkMain();
            // ... create a default root level renderer ...
            var rootRenderer = TypeRenderer.createRootTypeRenderer(this, true);
            // ... render the main functional component ...
            var mainRenderer = this._renderFunctionalComponent(rootRenderer, this.script.main);
            return new FlowScript.Simulator(this, mainRenderer);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ///** Attempts to render a given source object. The source object can be any component type, such as a block, line, statement, or expression. */
        //? _render(source: {}): TypeRenderer {
        //    var renderer = TypeRenderer.createRootTypeRenderer(this);
        //    if (source instanceof Component) {
        //        var comp = <Component>source;
        //        switch (comp.componentType) {
        //            case ComponentTypes.Functional:
        //                this._renderFunctionalComponent(renderer, comp, false);
        //                break;
        //            case ComponentTypes.Assignment:
        //            case ComponentTypes.Operation:
        //            case ComponentTypes.Unary:
        //                this._renderExpression(renderer, new Expression(comp));
        //                break;
        //            case ComponentTypes.ControlFlow:
        //                this._renderControlFlow(renderer, new Expression(comp));
        //                break;
        //            case ComponentTypes.Comment:
        //                break;
        //            case ComponentTypes.Text:
        //                //?renderer.addLine(source, this._renderText(<Component>source));
        //                break;
        //        }
        //    } else if (source instanceof BlockReference) {
        //        this._renderBlockExpression(renderer, <BlockReference>source, false);
        //    } else if (source instanceof Line) {
        //        var line = <Line>source;
        //        if (line.statements.length)
        //            this._renderStatement(renderer, line.statements[0]);
        //    } else if (source instanceof Statement) {
        //        this._renderStatement(renderer, <Statement>source);
        //    } else if (source instanceof Expression) {
        //        var result = this._renderExpression(renderer, <Expression>source);
        //        renderer.addLine(source, result);
        //    }
        //    return renderer;
        //}
        // --------------------------------------------------------------------------------------------------------------------
        /** Takes a functional component and renders */
        Compiler.prototype._renderFunctionalComponent = function (renderer, comp) {
            try {
                if (comp.componentType != FlowScript.ComponentTypes.Functional)
                    throw "The component given is not a \"functional\" component.";
                if (!renderer)
                    throw "A renderer reference is required.";
                renderer = renderer.registerType(comp);
                this._renderComponentFunctionEntry(renderer, comp);
                var functionBody = "";
                // ... go through the block lines and translate the statements ...
                for (var i = 0, n = comp.block.lines.length; i < n; ++i) {
                    var line = comp.block.lines[i];
                    var statement = line.statements[0];
                    if (statement) {
                        this._renderStatement(renderer, statement);
                        //if (i == n - 1) {
                        //    // ... process any default returns on the last line ...
                        //    if (comp.defaultReturn && statement.source.componentType != ComponentTypes.Functional && statement.source.componentType != ComponentTypes.ControlFlow)
                        //        renderer.prefixLastLine(Compiler.CONTEXT_VAR_NAME + ".argument" + this._renderPropertyAccessor(comp.defaultReturn.name) + " = ");
                        //}
                    }
                }
                this._renderComponentFunctionExit(renderer, comp);
                return renderer;
            }
            catch (e) {
                throw "Error in functional component '" + comp.fullTypeName + "': " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderComponentFunctionEntry = function (renderer, comp) {
            if (!renderer.isSimulation)
                renderer.addLine(comp, "function (" + Compiler.CONTEXT_VAR_NAME + ") {");
            if (renderer.component.defaultReturn)
                renderer.addLocalVar(Compiler.RUNNING_VAL_VAR_NAME);
            renderer.nextMargin();
        };
        Compiler.prototype._renderComponentFunctionExit = function (renderer, comp) {
            // ... insert any local vars used ...
            renderer.insertDeclarations(comp);
            // ... always return the running value (which may simply be the 'undefined' value) ...
            if (renderer.component.defaultReturn)
                if (renderer.isSimulation)
                    renderer.return(comp);
                else
                    renderer.addLine(comp, "return " + Compiler.RUNNING_VAL_VAR_NAME + ";");
            // ... add final brace ...
            renderer.previousMargin();
            if (!renderer.isSimulation)
                renderer.addLine(comp, "};");
        };
        Compiler.prototype._verifyArgCount = function (compRef, expectedCount) {
            if (compRef.argumentLength != expectedCount)
                throw "Exactly " + expectedCount + " argument" + (expectedCount != 1 ? 's are' : ' is') + " expected.";
        };
        Compiler.prototype._renderStatement = function (renderer, statement) {
            if (statement)
                try {
                    // Note: A statement contains an actionable component (like assignments, and component calls), but never single operations.
                    var action = statement.component, code;
                    switch (action.componentType) {
                        case FlowScript.ComponentTypes.ControlFlow:
                            this._renderControlFlow(renderer, statement);
                            break;
                        case FlowScript.ComponentTypes.Comment: // (noop)
                            break;
                        case FlowScript.ComponentTypes.Code:
                            this._verifyArgCount(statement, 1);
                            this._renderCode(renderer, statement.arguments.getArg(0));
                            break;
                        default:
                            var result = this._renderExpression(renderer, statement, statement.component.isOperational); // (a value is returned if this is an operation)
                            if (statement.component.isOperational)
                                if (renderer.isSimulation) {
                                    if (renderer.component.defaultReturn)
                                        renderer.assign(statement, Compiler.RUNNING_VAL_VAR_NAME);
                                }
                                else if (result != Compiler.RUNNING_VAL_VAR_NAME)
                                    if (renderer.component.defaultReturn)
                                        renderer.addLine(statement, this._renderAssignment(Compiler.RUNNING_VAL_VAR_NAME, result) + ";");
                                    else
                                        renderer.addLine(statement, result);
                            break;
                    }
                    this._renderCallCleanups(renderer);
                }
                catch (e) {
                    throw "Invalid statement '" + statement.component + "' on line " + statement.lineNumer + ": " + FlowScript.getErrorMessage(e);
                }
        };
        Compiler.prototype._renderControlFlow = function (renderer, compRef) {
            try {
                switch (compRef.component.fullTypeName) {
                    case this.script.System.ControlFlow.If.fullTypeName:
                        this._verifyArgCount(compRef, 2);
                        this._renderIf(renderer, compRef, compRef.arguments.getArg(0, true), compRef.arguments.getArg(1));
                        break;
                    case this.script.System.ControlFlow.IfElse.fullTypeName:
                        this._verifyArgCount(compRef, 3);
                        this._renderIfElse(renderer, compRef, compRef.arguments.getArg(0, true), compRef.arguments.getArg(1), compRef.arguments.getArg(2));
                        break;
                    case this.script.System.ControlFlow.While.fullTypeName:
                        this._verifyArgCount(compRef, 2);
                        this._renderWhile(renderer, compRef, compRef.arguments.getArg(0, true), compRef.arguments.getArg(1));
                        break;
                    case this.script.System.ControlFlow.DoWhile.fullTypeName:
                        this._verifyArgCount(compRef, 2);
                        this._renderDoWhile(renderer, compRef, compRef.arguments.getArg(0), compRef.arguments.getArg(1, true));
                        break;
                    case this.script.System.ControlFlow.Loop.fullTypeName:
                        this._verifyArgCount(compRef, 4);
                        this._renderLoop(renderer, compRef, compRef.arguments.getArg(0), compRef.arguments.getArg(1, true), compRef.arguments.getArg(2), compRef.arguments.getArg(3, true));
                        break;
                    default:
                        throw "The component '" + compRef.component + "' is not a recognized control flow component.";
                }
            }
            catch (e) {
                throw "Error in control flow expression '" + compRef.component + "': " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderIf = function (renderer, expr, condition, block) {
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                var ifIndex = renderer.jumpIfNot(expr, 0);
            else
                renderer.addLine(expr, "if (" + conditionStr + ") {");
            renderer.nextMargin();
            this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            if (renderer.isSimulation)
                renderer.updateJump(ifIndex);
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderIfElse = function (renderer, expr, condition, block1, block2) {
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                var ifIndex = renderer.jumpIfNot(expr, 0);
            else
                renderer.addLine(expr, "if (" + conditionStr + ") {");
            renderer.nextMargin();
            this._renderExpression(renderer, block1, false);
            renderer.previousMargin();
            if (renderer.isSimulation) {
                var trueBlockExitIndex = renderer.jump(expr);
                renderer.updateJump(ifIndex);
            }
            else
                renderer.addLine(expr, "} else {");
            renderer.nextMargin();
            this._renderExpression(renderer, block2, false);
            renderer.previousMargin();
            if (renderer.isSimulation)
                renderer.updateJump(trueBlockExitIndex);
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderWhile = function (renderer, expr, condition, block) {
            var whileCondEvalIndex = renderer.nextLineIndex;
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                var whileIndex = renderer.jumpIfNot(expr);
            else
                renderer.addLine(expr, "while (" + conditionStr + ") {");
            renderer.nextMargin();
            this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            if (renderer.isSimulation) {
                renderer.jump(expr, whileCondEvalIndex);
                renderer.updateJump(whileIndex);
            }
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderDoWhile = function (renderer, expr, block, condition) {
            if (renderer.isSimulation)
                var doIndex = renderer.nextLineIndex;
            else
                renderer.addLine(expr, "do {");
            renderer.nextMargin();
            this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                renderer.jumpIf(expr, doIndex);
            else
                renderer.addLine(expr, "} while (" + conditionStr + ");");
        };
        Compiler.prototype._renderLoop = function (renderer, expr, init, condition, block, update) {
            // ... this is similar to a "for" loop, but not exactly the same ...
            if (init)
                this._renderExpression(renderer, init);
            if (renderer.isSimulation)
                renderer.eval(null, this._renderAssignment(counterStr, '0'));
            var loopCondEvalIndex = renderer.nextLineIndex;
            var conditionStr = this._renderExpression(renderer, condition, true);
            var counterStr = Compiler.LOOP_COUNTER_VAR_NAME + (renderer.loopID++ || "");
            renderer.addLocalVar(counterStr);
            if (renderer.isSimulation)
                var loopIndex = renderer.jumpIfNot(expr);
            else
                renderer.addLine(expr, "for (" + counterStr + " = 0; " + conditionStr + "; ++" + counterStr + ") {");
            renderer.nextMargin();
            //if (renderer.isSimulation)
            //    var updateBlockIndex = renderer.jumpIfNot(null);
            //else
            //    renderer.addLine(expr, "if (" + counterStr + ") {");
            //renderer.nextMargin();
            this._renderExpression(renderer, update);
            //renderer.previousMargin();
            //if (renderer.isSimulation)
            //    renderer.updateJump(updateBlockIndex);
            //else
            //    renderer.addLine(expr, "}");
            if (block)
                this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            if (renderer.isSimulation) {
                renderer.jump(expr, loopCondEvalIndex);
                renderer.updateJump(loopIndex);
            }
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderConstantExpression = function (renderer, expr) {
            var code = this._renderConstant(expr.value);
            if (renderer.isSimulation)
                (renderer.eval(expr, code), code = FlowScript.undefined);
            return code;
        };
        Compiler.prototype._renderPropertyExpression = function (renderer, expr, assignment) {
            if (assignment === void 0) { assignment = false; }
            if (typeof expr !== 'object' || !(expr instanceof FlowScript.PropertyReference))
                throw "A valid property reference is required for the left side of an assignment operation.";
            var prop = expr.property;
            if (assignment && prop._isConst)
                throw "Property '" + expr + "' is marked as a constant and cannot be assigned to.";
            if (prop._isInstance)
                var code = this._renderInstanceProperty(prop); // TODO Doesn't this need an instance reference as the second arg?
            else
                var code = this._renderCtxArg(prop);
            if (renderer.isSimulation && !assignment)
                (renderer.eval(expr, code), code = FlowScript.undefined);
            return code;
        };
        Compiler.prototype._renderBlockExpression = function (renderer, blockExpr, operation) {
            if (operation)
                throw "A block cannot be part of an operation expression sequence.";
            if (!(blockExpr instanceof FlowScript.BlockReference))
                throw "Block argument is not a block reference.";
            var block = blockExpr.block;
            if (block.hasLines)
                for (var lineIndex = 0, n = block.lines.length; lineIndex < n; ++lineIndex) {
                    var line = block.lines[lineIndex];
                    if (line && line.statements && line.statements.length)
                        this._renderStatement(renderer, line.statements[0]);
                }
        };
        Compiler.prototype._renderWithExpression = function (renderer, objExpr, opExpr) {
            //objContextVar
            if (!(objExpr instanceof FlowScript.PropertyReference))
                throw "Object expression argument is not a property reference.";
            if (!objExpr.component.isObject)
                throw "Object expression argument is a property of a non-object component.  The property must exist on an object type component.";
            renderer.addContextVar(this._renderPropertyExpression(renderer, objExpr, true)); // ("with" sets the context for the '$this' token to be used with for custom code and expressions [see '_renderCode()'])
            var code = this._renderExpression(renderer, opExpr, true);
            renderer.removeLastContextVar();
            return code;
        };
        Compiler.prototype._renderWithBlock = function (renderer, objExpr, blockExpr) {
            //objContextVar
            if (!(objExpr instanceof FlowScript.PropertyReference))
                throw "Object expression argument is not a property reference.";
            if (!objExpr.component.isObject)
                throw "Object expression argument is a property of a non-object component.  The property must exist on an object type component.";
            if (!(blockExpr instanceof FlowScript.BlockReference))
                throw "Block expression argument is not a block reference.";
            var block = blockExpr.block;
            if (block.hasLines) {
                var objProp = objExpr.property;
                if (objProp.component == renderer.component) {
                    // ... render containing component properties as normal 'arg' references ...
                    renderer.addContextVar(this._renderPropertyExpression(renderer, objExpr, true));
                }
                else {
                    // ... this is a property from an object type, and not the containing component; double check inheritance, then render the object instance property path ...
                    if (!objExpr.component.hasInstanceProperty(objProp.name))
                        throw "Component object of type '" + objExpr.component + "' does not contain an instance property named '" + objProp.name + "'.";
                    renderer.addContextVar(renderer.objContextVar + this._renderPropertyExpression(renderer, objExpr, true));
                }
                // ("with" sets the context for the '$this' token to be used with for custom code and expressions [see '_renderCode()'])
                this._renderBlockExpression(renderer, blockExpr, false);
                renderer.removeLastContextVar();
            }
        };
        Compiler.prototype._renderExpression = function (renderer, expr, operation, assignment) {
            if (operation === void 0) { operation = false; }
            if (assignment === void 0) { assignment = false; }
            try {
                if (!expr)
                    throw "Expression is missing.";
                if (assignment)
                    operation = true; // (force this, as all assignments are also operations)
                if (expr instanceof FlowScript.PropertyReference)
                    return this._renderPropertyExpression(renderer, expr, assignment);
                else if (assignment)
                    throw "A property expression is required for the left side of an assignment operation.";
                if (expr instanceof FlowScript.Constant)
                    return this._renderConstantExpression(renderer, expr);
                if (expr instanceof FlowScript.BlockReference) {
                    this._renderBlockExpression(renderer, expr, operation);
                    return;
                }
                if (!expr.component)
                    throw "Expression doesn't have a component source.  Basic (non-derived) expressions must reference a component source to define the expression's behavior (in contrast, derived expression types are special cases [i.e. Constant, Property, Block, etc.] which are normally checked by type).";
                //if (expr.source.componentType != ComponentTypes.Expression && objContextVar)
                //    throw "Renderer error: object context variable '" + objContextVar + "' given, but the containing component is not an expression.";
                switch (expr.component.componentType) {
                    case FlowScript.ComponentTypes.Expression:
                        if (!expr.component.block.lines || !expr.component.block.lines.length || expr.component.block.lines.length > 1
                            || !expr.component.block.lines[0].statements || !expr.component.block.lines[0].statements.length)
                            throw "Custom expressions must contain one 'Code' line statement.";
                        var codeStatement = expr.component.block.lines[0].statements[0];
                        if (codeStatement.component.componentType != FlowScript.ComponentTypes.Code)
                            throw "The only component allowed within a custom expression block is a single 'Code' component that defines the expression or operation to perform.";
                        this._verifyArgCount(codeStatement, 1);
                        return this._renderCode(renderer, codeStatement.arguments.getArg(0));
                    case FlowScript.ComponentTypes.Operation:
                    case FlowScript.ComponentTypes.Assignment:
                        var compRef = expr;
                        if (compRef.component.parameters.length != 2)
                            throw "The component is not valid for operations.  Operational components must have two parameters.";
                        this._verifyArgCount(compRef, 2);
                        var prop0 = compRef.component.parameters.getProperty(0); // (get expected value type info for the left side)
                        var prop1 = compRef.component.parameters.getProperty(1); // (get expected value type info for the right side)
                        var arg0 = compRef.arguments.getArg(0), arg1 = compRef.arguments.getArg(1);
                        if (prop0._isAlias && !(arg0 instanceof FlowScript.PropertyReference))
                            throw "The left side of this operation must be a property.";
                        if (prop1._isAlias && !(arg1 instanceof FlowScript.PropertyReference))
                            throw "The right side of this operation must be a property.";
                        var isAssignment = compRef.component.componentType == FlowScript.ComponentTypes.Assignment;
                        var rightSide = this._renderExpression(renderer, arg1, true);
                        if (renderer.isSimulation && !isAssignment)
                            renderer.pushOpArg(); // (push the running value before evaluating the right side [or it will be overwritten])
                        var leftSide = this._renderExpression(renderer, arg0, true, isAssignment);
                        if (renderer.isSimulation) {
                            if (isAssignment)
                                renderer.assign(compRef, leftSide); // (will assign the running value to the left side variable)
                            else
                                renderer.evalOp(compRef, compRef.component); // (will pop the right side, and execute op with current running value as left side)
                            return FlowScript.undefined;
                        }
                        else
                            return this._renderOp(leftSide, expr.component, rightSide);
                    case FlowScript.ComponentTypes.Unary:
                    case FlowScript.ComponentTypes.Object:
                        var compRef = expr;
                        if (compRef.component.parameters.length != 1)
                            throw "The component is not valid for unary operations.  Unary components must have one parameter.";
                        this._verifyArgCount(compRef, 1);
                        var prop = compRef.component.parameters.getProperty(0);
                        var arg = compRef.arguments.getArg(0);
                        if (prop._isAlias && !(arg instanceof FlowScript.PropertyReference))
                            throw "The argument for this unary operation type must be a property.";
                        var code = this._renderExpression(renderer, arg, true, prop._isAlias);
                        if (renderer.isSimulation) {
                            renderer.evalUnary(compRef, compRef.component, prop._isAlias && code || FlowScript.undefined);
                            return FlowScript.undefined;
                        }
                        else
                            return this._renderUnary(code, compRef.component);
                    case FlowScript.ComponentTypes.Functional:
                        return this._renderComponentCall(renderer, expr, operation);
                    default:
                        throw "Invalid expression in component '" + expr.functionalComponent + "': The component '" + expr.component + "' is not valid for expressions.";
                }
            }
            catch (e) {
                throw "Invalid '" + expr.component + "' expression: " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderComponentCall = function (renderer, compRef, operation) {
            try {
                if (!compRef.component)
                    throw "Expression doesn't have a source to render a call for.";
                if (operation) {
                    if (!compRef.returnTargets.isEmpty)
                        throw "Functional components used as expressions cannot have return targets.";
                    else if (!compRef.component.defaultReturn)
                        throw "The component is used in an expression, but doesn't define a default return.";
                }
                // ... before this call can be made, the component being called must also be rendered.
                this._renderFunctionalComponent(renderer, compRef.component);
                // ... setup a context for the call ...
                // (note: make sure to set a variable to store each nested context in case blocks are used as parameters)
                var currentCtxID = renderer.callStack.push(compRef) - 1, currentCtxIDStr = currentCtxID || ""; //?, extraArgNames: string[] = [];
                var compLocalName = renderer.addLocalVar(Compiler.COMPONENT_REF_VAR_NAME + currentCtxIDStr);
                var localCtxName = renderer.addLocalVar(Compiler.LOCAL_CONTEXT_VAR_NAME + currentCtxIDStr);
                //?for (var i = expr.source.parameters.length, n = expr.argumentLength; i < n; ++i)
                //    extraArgNames.push("'" + expr._arguments[i] + "'");
                renderer.addLine(compRef, compLocalName + " = " + Compiler.SCRIPT_VAR_NAME + ".types." + compRef.component.safeFullTypeName + ";");
                renderer.addLine(compRef, compLocalName + ".context = " + localCtxName + " = " + compLocalName + ".context.next || " + Compiler.CONTEXT_VAR_NAME + ".getNextContext(" + compLocalName + ", " + compRef.argumentLength + ");");
                // ... setup context arguments with the argument values to prepare for the call ...
                var argIndexes = compRef.arguments.getArgIndexes(); // (note: the arguments are sorted by default before returning, just in case)
                for (var i = 0, n = argIndexes.length; i < n; ++i) {
                    var argIndex = argIndexes[i];
                    var argExpr = compRef.arguments.getArg(argIndex);
                    var argName = compRef.arguments.getArgName(argIndex);
                    if (!compRef.component.hasParameter(argName))
                        throw "Error: Argument with name '" + argName + "' does not have a corresponding property name for component '" + compRef.component + "'.";
                    var rightSide = this._renderExpression(renderer, argExpr, true); // (note: 'this._renderExpression' must always be called to allow simulations to add "op codes", or return a results to use otherwise)
                    if (renderer.isSimulation)
                        renderer.assign(argExpr, this._renderCtxArg(argName, localCtxName));
                    else
                        renderer.addLine(argExpr, this._renderCtxArg(argName, localCtxName) + " = " + rightSide + ";");
                }
                // ... set rest of unused parameters to undefined by default ...
                for (var i = 0, n = compRef.component.parameters.length; i < n; ++i) {
                    var param = compRef.component.parameters.getProperty(i);
                    if (!compRef.arguments.isArgSet(param.name)) {
                        if (!param._isOptional)
                            throw "No argument value was supplied for required parameter '" + param.name + "'.";
                        renderer.addLine(param, localCtxName + this._renderPropertyAccessor(param.name) + " = void 0;");
                    }
                }
                // ... render the call ...
                var callstr = compLocalName + "(" + localCtxName + ")";
                if (renderer.isSimulation) {
                    renderer.call(compRef, compRef.component.safeFullTypeName, currentCtxID);
                }
                else {
                    if (operation)
                        return callstr; // (this is an operational call that can be inserted into an expression, so return the call string)
                    else // ... add non-operational call as a statement (add line to renderer) ...
                        renderer.addLine(compRef, Compiler.RUNNING_VAL_VAR_NAME + " = " + callstr + ";");
                    return; // (this is a non-operational call, so return 'undefined' just in case, for "assertion" purposes)
                } // (else add as a single unary type operation [return a string] - but, cleanup must be done by the caller!)
            }
            catch (e) {
                throw "Failed to render call to component '" + compRef.component + "': " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderCallCleanups = function (renderer) {
            // ... cleanup all calls rendered up to this point ...
            while (renderer.callStack.length)
                this._renderCallCleanup(renderer);
        };
        /** This unwinds the context stack back by one after rendering a functional component call. */
        Compiler.prototype._renderCallCleanup = function (renderer) {
            try {
                if (!renderer.callStack.length)
                    throw "Call cleanup failure: number of calls doesn't match the number of cleanups.";
                var compRef = renderer.callStack.pop();
                var currentCtxID = renderer.callStack.length, currentCtxIDStr = currentCtxID || "";
                var compLocalName = Compiler.COMPONENT_REF_VAR_NAME + currentCtxIDStr;
                var localCtxName = Compiler.LOCAL_CONTEXT_VAR_NAME + currentCtxIDStr;
                // ... first, resolve any return targets ...
                var returnTargets = compRef.returnTargets.maps;
                for (var i = 0, n = returnTargets.length; i < n; ++i) {
                    if (!returnTargets[i].target)
                        throw "The target value of a return target mapping is required.";
                    var leftSide = this._renderCtxArg(returnTargets[i].target.property);
                    var srcExpr = returnTargets[i].source;
                    if (!srcExpr || srcExpr instanceof FlowScript.PropertyReference) {
                        // ... this is a property reference, so render as such ...
                        // (if 'srcExpr' is null/undefined, then treat the source as "default", which is the current running value)
                        var prop = srcExpr && srcExpr.property || null;
                        var rightSide = prop && prop.name != FlowScript.Property.DEFAULT_NAME ? this._renderCtxArg(prop, localCtxName) : Compiler.RUNNING_VAL_VAR_NAME;
                    }
                    else if (compRef instanceof FlowScript.Expression) {
                        //? ... this is a fixed constant value, so just dump the value ...
                        //var constant = <Constant>srcExpr;
                        //var rightSide = <string>constant.value;
                        var rightSide = this._renderExpression(renderer, compRef, true, true);
                    }
                    else
                        throw "Return target source expression is not a valid expression object.";
                    renderer.addLine(returnTargets[i], this._renderAssignment(leftSide, rightSide) + ";");
                }
                // ... finally, move the context stack pointer back ...
                renderer.addLine(null, compLocalName + ".context = " + localCtxName + ".previous;");
            }
            catch (e) {
                throw "Failed to clean up rendered call: " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderCtxArg = function (property, ctxPath) {
            if (typeof property == 'object' && property instanceof FlowScript.Property && property.name == FlowScript.Property.DEFAULT_NAME)
                throw "Cannot render a default property as a context argument.";
            return (ctxPath || Compiler.CONTEXT_VAR_NAME) + ".arguments" + this._renderPropertyAccessor((typeof property == 'string' ? property : property.name));
        };
        Compiler.prototype._renderInstanceProperty = function (property, objectVarPath) {
            if (typeof property == 'object' && property instanceof FlowScript.Property)
                if (property.name == FlowScript.Property.DEFAULT_NAME)
                    throw "Cannot render a default property as an instance property.";
                else if (!property._isInstance)
                    throw "Property '" + property + "' is not an instance property.";
            return (objectVarPath || "") + this._renderPropertyAccessor((typeof property == 'string' ? property : property.name));
        };
        Compiler.prototype._renderDeclaration = function (varname, value) {
            return "var " + varname + (value !== FlowScript.undefined ? " = " + this._renderConstant(value) : "") + ";";
        };
        Compiler.prototype._renderAssignment = function (varpath, source) {
            return this._renderOp(varpath, this.script.System.Assign, source);
        };
        Compiler.prototype._renderConstant = function (value) {
            if (typeof value == 'function') {
                /** Extracts the given function contents and puts it inline to the specified context.
                  * This makes it easier to use code completion to define functions instead of passing in code strings.
                  * A containing component reference is required in order to replace any tokens found with the proper values.
                  * Note: The function name and parameters are stripped out; only the main block contents remain (without the braces).
                  */
                var code = value.toString().match(FlowScript.Core.Code.FUNCTION_CONTENTS_REGEX)[0].trim();
                if (code[code.length - 1] != ";")
                    code += ";"; // (make sure the last character in the code block ends with a semicolon, to be safe)
                return code;
            }
            return typeof value == 'string' ? value = '"' + value + '"' : '' + value;
        };
        Compiler.prototype._renderOp = function (renderedLValue, operationTypeName, renderedRValue) {
            if (typeof operationTypeName == 'object' && operationTypeName instanceof FlowScript.Type)
                operationTypeName = operationTypeName.fullTypeName;
            switch (operationTypeName) {
                case this.script.System.Assign.fullTypeName:
                    return renderedLValue + " = " + renderedRValue;
                case this.script.System.Accessor.fullTypeName:
                    return renderedLValue + "." + renderedRValue;
                case this.script.System.Comparison.Equals.fullTypeName:
                    return renderedLValue + " == " + renderedRValue;
                case this.script.System.Comparison.NotEquals.fullTypeName:
                    return renderedLValue + " != " + renderedRValue;
                case this.script.System.Comparison.StrictEquals.fullTypeName:
                    return renderedLValue + " === " + renderedRValue;
                case this.script.System.Comparison.StrictNotEquals.fullTypeName:
                    return renderedLValue + " !=== " + renderedRValue;
                case this.script.System.Comparison.LessThan.fullTypeName:
                    return renderedLValue + " < " + renderedRValue;
                case this.script.System.Comparison.GreaterThan.fullTypeName:
                    return renderedLValue + " > " + renderedRValue;
                case this.script.System.Comparison.LessThanOrEqual.fullTypeName:
                    return renderedLValue + " <= " + renderedRValue;
                case this.script.System.Comparison.GreaterThanOrEqual.fullTypeName:
                    return renderedLValue + " >= " + renderedRValue;
                case this.script.System.Math.Add.fullTypeName:
                    return renderedLValue + " + " + renderedRValue;
                case this.script.System.Math.Multiply.fullTypeName:
                    return renderedLValue + " * " + renderedRValue;
                case this.script.System.Binary.ShiftLeft.fullTypeName:
                    return renderedLValue + " << " + renderedRValue;
                case this.script.System.Binary.ShiftRight.fullTypeName:
                    return renderedLValue + " >> " + renderedRValue;
                default:
                    throw "Operation type '" + operationTypeName + "' is not a recognized/supported operation.";
            }
        };
        Compiler.prototype._renderUnary = function (renderedValue, operationTypeName) {
            if (typeof operationTypeName == 'object' && operationTypeName instanceof FlowScript.Type)
                operationTypeName = operationTypeName.fullTypeName;
            switch (operationTypeName) {
                case this.script.System.Boolean.fullTypeName:
                    return "!!" + renderedValue;
                case this.script.System.Double.fullTypeName:
                    return "+" + renderedValue;
                case this.script.System.Integer.fullTypeName:
                    return "+" + renderedValue + "|0";
                case this.script.System.String.fullTypeName:
                    return "''+" + renderedValue;
                case this.script.System.PreIncrement.fullTypeName:
                    return "++" + renderedValue;
                case this.script.System.PostIncrement.fullTypeName:
                    return renderedValue + "++";
                case this.script.System.PreDecrement.fullTypeName:
                    return "--" + renderedValue;
                case this.script.System.PostDecrement.fullTypeName:
                    return renderedValue + "--";
                case this.script.System.Binary.Not.fullTypeName:
                    return "!" + renderedValue;
                case this.script.System.Binary.XOR.fullTypeName:
                    return "~" + renderedValue;
                case this.script.System.Object.fullTypeName:
                    return "Object(" + renderedValue + ")";
                case this.script.System.Math.SQRT.fullTypeName:
                    return "Math.sqrt(" + renderedValue + ")";
                default:
                    throw "Unary type '" + operationTypeName + "' is not a recognized/supported operation.";
            }
        };
        Compiler.prototype._renderPropertyAccessor = function (propertyName) {
            if (FlowScript.Expression.NUMERIC_INDEX_REGEX.test(propertyName))
                return "[" + propertyName + "]";
            else
                return FlowScript.Expression.VALID_IDENTIFIER_REGEX.test(propertyName) ? "." + propertyName : "['" + propertyName + "']";
        };
        Compiler.prototype._renderCode = function (renderer, codeExpr) {
            var code = this._renderExpression(renderer, codeExpr);
            var objContextVar = renderer.objContextVar;
            if (!objContextVar && renderer.component.hasDataObjectTypeParent)
                objContextVar = "this";
            var containingComponent = renderer.component;
            var componentIsExpression = containingComponent.componentType == FlowScript.ComponentTypes.Expression;
            var tokens = code.match(FlowScript.Core.Code.PROPERTY_TOKEN_REGEX), token;
            var thisFound = false;
            if (tokens) {
                var nonTokenText = code.split(FlowScript.Core.Code.PROPERTY_TOKEN_REGEX, FlowScript.undefined, tokens);
                var newCode = tokens[0];
                for (var i = 0, n = tokens.length; i < n; ++i) { // note: nonTokenText[i+1] is ALWAYS the text that follows the token
                    token = tokens[i];
                    if (token == "$$")
                        newCode += "$" + nonTokenText[i + 1];
                    else {
                        token = token.substring(1);
                        if (!token)
                            throw "Code token parameter '" + nonTokenText[i] + "»" + tokens[i] + "«" + nonTokenText[i + 1] + "' within component '" + containingComponent + "' is empty or invalid.";
                        if (token != "this")
                            newCode += this._renderCtxArg(token) + nonTokenText[i + 1];
                        else {
                            if (componentIsExpression && nonTokenText[i])
                                throw "Code token parameter '»" + nonTokenText[i] + "«" + tokens[i] + nonTokenText[i + 1] + "' within component '" + containingComponent + "' is invalid: No characters are allowed before '$this' because the containing component is an expression.";
                            // ... make sure '$this' is valid - check if containing component has a parent object ...
                            if (containingComponent.parent instanceof FlowScript.Component && containingComponent.parent.componentType == FlowScript.ComponentTypes.Object) {
                                newCode += objContextVar + nonTokenText[i + 1];
                                thisFound = true;
                            }
                            else
                                throw "Code token parameter '" + nonTokenText[i] + "»" + tokens[i] + "«" + nonTokenText[i + 1] + "' is invalid: component '" + containingComponent + "' is not a child of an object type.";
                        }
                    }
                }
                ///** Since the compiler cannot convert custom code to other languages, developers must supply the conversion here themselves.
                //  * Note: Using these components in apps can limit a compiler's ability to target other languages for that app.
                //  */
            }
            if (objContextVar && !thisFound)
                throw "Code token parameter '$this' is required, but not found in custom code within component '" + containingComponent + "'.";
            if (!componentIsExpression)
                renderer.exec(codeExpr, code);
            return code;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Used for final rendering only (not used for simulations). */
        Compiler.CONTEXT_VAR_NAME = "ctx";
        Compiler.LOCAL_CONTEXT_VAR_NAME = "$__ctx";
        Compiler.RUNNING_VAL_VAR_NAME = "$__";
        Compiler.COMPONENT_REF_VAR_NAME = "$__comp";
        Compiler.SCRIPT_VAR_NAME = "$__script";
        Compiler.USER_RTSCRIPT_VAR_NAME = "$fs";
        Compiler.LOOP_COUNTER_VAR_NAME = "$__i";
        return Compiler;
    }());
    FlowScript.Compiler = Compiler;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Operational codes used to control the simulator. */
    var OpCodes;
    (function (OpCodes) {
        /** Executes a single statement or expression of JavaScript code. */
        OpCodes[OpCodes["Exec"] = 0] = "Exec";
        /** Branches to an offset if a value equates to true. */
        OpCodes[OpCodes["JumpIf"] = 1] = "JumpIf";
        /** Branches to an offset if a value equates to false. */
        OpCodes[OpCodes["JumpIfNot"] = 2] = "JumpIfNot";
        /** Branches to an offset. */
        OpCodes[OpCodes["Jump"] = 3] = "Jump";
        /** Calls another component. */
        OpCodes[OpCodes["Call"] = 4] = "Call";
        /** Exits the current component. */
        OpCodes[OpCodes["Return"] = 5] = "Return";
    })(OpCodes = FlowScript.OpCodes || (FlowScript.OpCodes = {}));
    // ========================================================================================================================
    /** Represents a component during runtime simulations. */
    var VirtualRuntimeComponent = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function VirtualRuntimeComponent(simulator, component) {
            this._simulator = simulator;
            this._sourceComponent = component;
        }
        Object.defineProperty(VirtualRuntimeComponent.prototype, "simulator", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._simulator; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualRuntimeComponent.prototype, "sourceComponent", {
            get: function () { return this._sourceComponent; },
            enumerable: true,
            configurable: true
        });
        return VirtualRuntimeComponent;
    }());
    FlowScript.VirtualRuntimeComponent = VirtualRuntimeComponent;
    ;
    ;
    /** Simulates the script by breaking down the components into executable steps. */
    var Simulator = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Simulator(compiler, mainRenderer) {
            this._compiler = compiler;
            if (!mainRenderer || !mainRenderer.isFunctionalComponent)
                throw "A main renderer must reference a functional component.";
            this._mainRenderer = mainRenderer;
        }
        Object.defineProperty(Simulator.prototype, "compiler", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._compiler; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Simulator.prototype, "mainRenderer", {
            get: function () { return this._mainRenderer; },
            enumerable: true,
            configurable: true
        });
        Simulator.prototype.hasComponentRenderer = function (typeOrComp) {
            return this._mainRenderer.hasRenderer(typeof typeOrComp == 'string' ? typeOrComp : typeOrComp.safeFullTypeName);
        };
        Simulator.prototype.getComponentRenderer = function (typeOrComp) {
            return this._mainRenderer.getRenderer(typeof typeOrComp == 'string' ? typeOrComp : typeOrComp.safeFullTypeName);
        };
        Object.defineProperty(Simulator.prototype, "eval", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Allows executing code within the global execution space of the simulator. */
            get: function () { return this._eval || this._createEval(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Simulator.prototype, "rtscript", {
            /** Returns a reference to the global runtime script object (which must be initialized first by calling 'Start()' or 'Run()'). */
            get: function () { return this._rtscript; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Simulator.prototype, "main", {
            /** Returns a reference to the main functional component object (the runtime script object in 'rtscript' must be initialized first by calling 'Start()' or 'Run()'). */
            get: function () { return this._main || (this._rtscript ? this._main = this._rtscript.getType(this._mainRenderer.type.safeFullTypeName) : FlowScript.undefined); },
            enumerable: true,
            configurable: true
        });
        Simulator.prototype._createEval = function () {
            var _this = this;
            return this._eval = function (code) {
                var result = FlowScript.safeEval(code);
                _this._eval = FlowScript.safeEval("(" + _this._eval.toString() + ")");
                return result;
            };
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Enters the functional component context by moving to the first line and initializing a new component shell function.
          * Note: The current context is push onto the stack before being assigned this new entered context.
          */
        Simulator.prototype._enter = function (ctx) {
            // ... setup the new context ...
            ctx.$__lineIndex = 0;
            ctx.$__result = FlowScript.undefined;
            ctx.$__args = [];
            FlowScript.safeEval("(" + Simulator._createComponentShell.toString().replace(/ctx/g, FlowScript.Compiler.CONTEXT_VAR_NAME) + ")")(ctx); // (creates a closure to wrap the runtime simulation context for this call)
            Object.defineProperty(ctx, "value", { configurable: false, enumerable: true, get: function () { return ctx.$__lineExec.eval(FlowScript.Compiler.RUNNING_VAL_VAR_NAME); } });
            // ... make this context the new current context ...
            this.callStack.push(this.currentContext);
            this.currentContext = ctx;
        };
        /** Exits the current functional component context by popping the previous context from the stack.
          */
        Simulator.prototype._exit = function (ctx) {
            if (this.callStack.length) {
                this.currentContext = this.callStack.pop();
                if (this.currentContext)
                    this.currentContext.$__ = ctx.$__;
                return !!this.currentContext;
            }
            this.currentContext = null;
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Executes/evaluates the operation/action at the current line.
          * Returns true if there is another statement pending, and false otherwise.
          */
        Simulator.prototype.step = function () {
            var ctx = this.currentContext;
            if (!ctx)
                return false;
            // ... execute the line, otherwise change to the parent context (if any) ...
            if (ctx.$__lineIndex < ctx.$__compRenderer._lines.length) {
                var line = ctx.$__compRenderer._lines[ctx.$__lineIndex++]; // (always make sure this advances)
                switch (line.opcode) {
                    case OpCodes.Exec: // (execute/evaluate JS code)
                        ctx.$__lineExec(line.contents);
                        break;
                    case OpCodes.JumpIf: // (if a condition is TRUE, then jump to the specified line using an offset)
                        if (ctx.$__ && +line.args[0]) // (note: this is used to enter blocks only if FALSE, so TRUE actually makes this SKIP lines [used mainly with do...while blocks])
                            ctx.$__lineIndex += -1 + line.args[0]; // (-1 because the index has already advanced ahead one)
                        break;
                    case OpCodes.JumpIfNot: // (if a condition is FALSE, then jump to the specified line using an offset)
                        if (!ctx.$__ && +line.args[0]) // (note: this is used to enter blocks only if TRUE, so FALSE actually makes this SKIP lines [usually to the next line following the block of lines])
                            ctx.$__lineIndex += -1 + line.args[0]; // (-1 because the index has already advanced ahead one)
                        break;
                    case OpCodes.Jump: // (jump to the specified line using an offset [used with if..else and loops])
                        ctx.$__lineIndex += -1 + line.args[0]; // (-1 because the index has already advanced ahead one)
                        break;
                    case OpCodes.Call: // (transfer execution to another component)
                        var renderer = this.getComponentRenderer(line.args[0]);
                        if (!renderer)
                            throw "Call Error: Component '" + line.args[0] + "' doesn't exist, or was not included in the rendering process.";
                        var ctxID = +line.args[1] == 0 ? "" : line.args[1]; // (0 is "" - only add numbers from 1 onwards)
                        // (the context ID is used to identify nested contexts in cases where blocks may be used as parameters)
                        var callCtx = ctx.$__lineExec.eval(FlowScript.Compiler.LOCAL_CONTEXT_VAR_NAME + ctxID); // (get the context that is now setup for the call)
                        callCtx.$__compRenderer = renderer;
                        this._enter(callCtx);
                        return true;
                    case OpCodes.Return: // (return from the current component; if an arguments exists, assume it's a var name)
                        return this._exit(ctx);
                }
                if (ctx.$__lineIndex >= ctx.$__compRenderer._lines.length)
                    return this._exit(ctx);
                return true;
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Begins the simulation by creating a new root context, and queues the first instruction step of the main component.
          * Call 'step()' to advance code execution by a single action.
          * Note: The first time this function is called, nothing is executed until 'step()' is called next.  Subsequent calls
          * to this function discards the whole simulation context tree and starts the simulation over again.
          */
        Simulator.prototype.start = function (args) {
            // ... setup the execution environment with the final compiled script  ...
            var code = this._compiler.compile("$__script");
            try {
                this._rtscript = this.eval(code);
            }
            catch (e) {
                throw "Cannot start simulation - compiled code contains an error: " + FlowScript.getErrorMessage(e);
            }
            this.rootContext = new FlowScript.RuntimeContext(null);
            this.rootContext.$__compRenderer = this._mainRenderer;
            this.callStack = [];
            this._enter(this.compiler.script.main.configureRuntimeContext(this.rootContext, args));
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Run the rest of the simulation from the current execution point and return the root runtime context.
          * Note: The returned context is of type 'ISimulationContext', which contains the running value in the dynamic 'value' property.
          */
        Simulator.prototype.run = function () {
            if (!this._rtscript)
                this.start();
            while (this.step())
                ;
            return this.rootContext;
        };
        return Simulator;
    }());
    FlowScript.Simulator = Simulator;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
FlowScript.Simulator['_createComponentShell'] = function (ctx) {
    ctx.$__lineExec = function (code) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        ctx.$__result = eval(code);
        var $__newLineEvaluator = eval("(" + ctx.$__lineExec + ")"); // (each call creates another closure layer to lock-in any previous evaluated variables)
        $__newLineEvaluator.eval = eval("(" + ctx.$__lineExec.eval.toString() + ")"); // (this is used to "peek" at values within this closure level)
        ctx.$__lineExec = $__newLineEvaluator;
        return ctx.$__result;
    };
    ctx.$__lineExec.eval = function (x) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return eval(x);
    };
    return ctx.$__lineExec;
};
// ############################################################################################################################
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** The type of node determines how it should be rendered in the UI. */
    var VisualNodeTypes;
    (function (VisualNodeTypes) {
        VisualNodeTypes[VisualNodeTypes["Undefined"] = 0] = "Undefined";
        /** The visual element will represent a component. */
        VisualNodeTypes[VisualNodeTypes["Component"] = 1] = "Component";
        /** The visual element will represent a part of the component title. */
        VisualNodeTypes[VisualNodeTypes["ComponentTitlePart"] = 2] = "ComponentTitlePart";
        /** The visual element will represent a component parameter. */
        VisualNodeTypes[VisualNodeTypes["ComponentParameter"] = 3] = "ComponentParameter";
        /** The visual element will represent a component. */
        VisualNodeTypes[VisualNodeTypes["ComponentReference"] = 4] = "ComponentReference";
        /** The visual element will represent a block - usually in a component. */
        VisualNodeTypes[VisualNodeTypes["Block"] = 5] = "Block";
        /** The visual element will represent a block reference. */
        VisualNodeTypes[VisualNodeTypes["BlockReference"] = 6] = "BlockReference";
        /** The visual element will represent a block line. */
        VisualNodeTypes[VisualNodeTypes["Line"] = 7] = "Line";
        /** The visual element will represent a block line. */
        VisualNodeTypes[VisualNodeTypes["LineReference"] = 8] = "LineReference";
        /** The visual element will represent a statement expression. */
        VisualNodeTypes[VisualNodeTypes["Statement"] = 9] = "Statement";
        /** The visual element will represent a constant expression. */
        VisualNodeTypes[VisualNodeTypes["Constant"] = 10] = "Constant";
        /** The visual element will represent an expression, or nested expression. */
        VisualNodeTypes[VisualNodeTypes["Expression"] = 11] = "Expression";
        /** The visual element will represent return targets. */
        VisualNodeTypes[VisualNodeTypes["ReturnTargets"] = 12] = "ReturnTargets";
        /** The visual element will represent a single return target. */
        VisualNodeTypes[VisualNodeTypes["ReturnTarget"] = 13] = "ReturnTarget";
        /** The visual element will represent a property. */
        VisualNodeTypes[VisualNodeTypes["Property"] = 14] = "Property";
        /** The visual element will represent property reference. */
        VisualNodeTypes[VisualNodeTypes["PropertyReference"] = 15] = "PropertyReference";
        /** The visual element will represent expression arguments. */
        VisualNodeTypes[VisualNodeTypes["Arguments"] = 16] = "Arguments";
        /** The visual element will represent a single argument. */
        VisualNodeTypes[VisualNodeTypes["Argument"] = 17] = "Argument";
        /** The visual element will represent a list of event mappings. */
        VisualNodeTypes[VisualNodeTypes["EventHandlers"] = 18] = "EventHandlers";
        /** The visual element will represent a single event mapping. */
        VisualNodeTypes[VisualNodeTypes["EventHandler"] = 19] = "EventHandler";
        /** The visual element holds text only for display purposes. */
        VisualNodeTypes[VisualNodeTypes["Text"] = 20] = "Text";
    })(VisualNodeTypes = FlowScript.VisualNodeTypes || (FlowScript.VisualNodeTypes = {}));
    // ========================================================================================================================
    var VisualNode = /** @class */ (function () {
        function VisualNode(item, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Undefined; }
            this._children = [];
            // --------------------------------------------------------------------------------------------------------------------
            // Events
            /** Triggered when a node is added or inserted. An 'index' parameter holds the new position. */
            this.onNodeAdded = new FlowScript.EventDispatcher(this);
            /** Triggered when a node is removed. */
            this.onNodeRemoved = new FlowScript.EventDispatcher(this);
            /** Triggered when a node is selected. */
            this.onNodeSelected = new FlowScript.EventDispatcher(this);
            if (typeof nodeType == 'number' && nodeType > 0)
                this._type = nodeType;
            else if (typeof item == 'object' && item !== null) {
                if (item instanceof FlowScript.Component)
                    this._type = VisualNodeTypes.Component;
                else if (item instanceof FlowScript.Statement)
                    this._type = VisualNodeTypes.Statement;
                else if (item instanceof FlowScript.ComponentReference)
                    this._type = VisualNodeTypes.ComponentReference;
                else if (item instanceof FlowScript.Block)
                    this._type = VisualNodeTypes.Block;
                else if (item instanceof FlowScript.BlockReference)
                    this._type = VisualNodeTypes.BlockReference;
                else if (item instanceof FlowScript.Line)
                    this._type = VisualNodeTypes.Line;
                else if (item instanceof FlowScript.LineReference)
                    this._type = VisualNodeTypes.LineReference;
                else if (item instanceof FlowScript.Property)
                    this._type = VisualNodeTypes.Property;
                else if (item instanceof FlowScript.PropertyReference)
                    this._type = VisualNodeTypes.PropertyReference;
                else if (item instanceof FlowScript.Constant)
                    this._type = VisualNodeTypes.Constant;
                else if (item instanceof FlowScript.Expression)
                    this._type = VisualNodeTypes.Expression;
                else if (item instanceof FlowScript.ReturnTargetMaps)
                    this._type = VisualNodeTypes.ReturnTargets;
                else if (item instanceof FlowScript.ReturnTargetMap)
                    this._type = VisualNodeTypes.ReturnTarget;
                else if (item instanceof FlowScript.ExpressionArgs)
                    this._type = VisualNodeTypes.Arguments;
                else // ... else assume this is a text node (default if there are no other matching types) ...
                    this._type = VisualNodeTypes.Text;
            }
            else // ... else assume this is a text node (default if there are no other matching types) ...
             if (!nodeType)
                throw "A type is required if no object value is given.";
            if (this._type != VisualNodeTypes.Text)
                this._item = item.getReference ? item.getReference() : item;
            else
                this._item = "" + item;
        }
        Object.defineProperty(VisualNode.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            /** References the parent visual node. */
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "children", {
            /** References the children nested in this visual node. */
            get: function () { return this._children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "type", {
            /** The 'VisualNodeTypes' type this node represents. */
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "item", {
            get: function () { return this._item instanceof FlowScript.NamedReference ? this._item.valueOf() : this._item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "componentRef", {
            /** Returns the current the underlying component reference, or the closest parent component reference.
             * If no component reference is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && this.item instanceof FlowScript.ComponentReference ? this.item : this._parent ? this._parent.componentRef : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "component", {
            /** Returns the current node as a component, or the closest parent component (including any associated with a component reference).
             * If no component is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && (this.item instanceof FlowScript.Component && this.item || this.item instanceof FlowScript.ComponentReference && this.item.component) || this._parent && this._parent.component || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asComponent", {
            /** For component type nodes, returns the component referenced by this node, or null otherwise. */
            get: function () { return this._type == VisualNodeTypes.Component ? this.item : this._type == VisualNodeTypes.ComponentReference ? this.item.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "block", {
            /** Returns the current node as a block, or the closest parent block (including any associated with a reference).
             * If no block is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && (this.item instanceof FlowScript.Block && this.item || this.item instanceof FlowScript.BlockReference && this.item.block) || this._parent && this._parent.block || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asBlock", {
            /** For block type nodes, returns the block referenced by this node, or null otherwise. */
            get: function () { return this._type == VisualNodeTypes.Block ? this.item : this._type == VisualNodeTypes.BlockReference ? this.item.block : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "line", {
            /** Returns the current node as a line, or the closest parent line (including any associated with a reference).
             * If no line is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && (this.item instanceof FlowScript.Line && this.item || this.item instanceof FlowScript.LineReference && this.item.line) || this._parent && this._parent.line || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asLine", {
            /** For line type nodes, returns the line referenced by this node, or null otherwise. */
            get: function () { return this._type == VisualNodeTypes.Line ? this.item : this._type == VisualNodeTypes.LineReference ? this.item.line : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "expression", {
            /** Returns the current node as an expression, or the closest parent expression.
             * If no expression is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && this.item instanceof FlowScript.Expression ? this.item : this._parent ? this._parent.expression : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asExpression", {
            /** For expression type nodes, returns the expression referenced by this node, or null otherwise. */
            get: function () { return typeof this.item == 'object' && this.item instanceof FlowScript.Expression ? this.item : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "rootNode", {
            /** Returns the topmost root node in the tree. */
            get: function () { return this.parent ? this.parent : this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "selectedNode", {
            /** Returns the selected node, which is tracked by the root node in the tree. */
            get: function () { var rn = this.rootNode; return rn._selectedNode || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "isSelected", {
            /** Returns true if this node is selected. */
            get: function () { return this.rootNode._selectedNode == this; },
            set: function (value) {
                var rn = this.rootNode;
                if (value && rn._selectedNode != this) {
                    if (rn._selectedNode)
                        rn._selectedNode._HideSelectedStyle();
                    rn._selectedNode = this;
                    this._ShowSelectedStyle();
                }
                else if (!value && rn._selectedNode == this) {
                    if (rn._selectedNode)
                        rn._selectedNode._HideSelectedStyle();
                    rn._selectedNode = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "containerElement", {
            /** The element that holds the rendered child nodes. If not specified after rendering the parent, 'visualElement' is assumed. */
            get: function () { return this._containerElement || this.visualElement; },
            set: function (value) { this._containerElement = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "text", {
            /** The text to display for this node, if any (for text nodes). */
            get: function () { return typeof this.item == 'string' ? this.item : "" + this.item; },
            enumerable: true,
            configurable: true
        });
        VisualNode.prototype.createNode = function (item, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Undefined; }
            var node = this._CreateNode(item, nodeType);
            return this.appendNode(node);
        };
        VisualNode.prototype._CreateNode = function (item, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Undefined; }
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            return new this.constructor(item, nodeType);
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._castTo = function (type, throwOnError) {
            if (throwOnError === void 0) { throwOnError = true; }
            var item = this.item;
            if (typeof item != 'object')
                if (throwOnError)
                    throw "Invalid cast: item is not an object.";
                else
                    return null;
            if (!(item instanceof type))
                if (throwOnError)
                    throw "Invalid cast: item is not of the specified type.";
                else
                    return null;
            return item;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a visual node to this node. */
        VisualNode.prototype.appendNode = function (node) {
            if (node && this._children.indexOf(node) < 0) {
                // ... remove from an existing parent first ...
                if (node._parent)
                    node._parent.removeNode(node);
                // ... add to this node ...
                delete node._selectedNode; // (no longer a root, if it was a root before)
                var i = this._children.push(node) - 1;
                node._parent = this;
                this._doAdded(node, i);
            }
            return node;
        };
        /** Adds a visual node to this node. */
        VisualNode.prototype.appendTextNode = function (text, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Text; }
            var node = new VisualNode(text, nodeType);
            return this.appendNode(node);
        };
        /** Inserts a visual node into this node. */
        VisualNode.prototype.insertNode = function (node, index) {
            if (node && this._children.indexOf(node) < 0) {
                // ... remove from an existing parent first ...
                if (node._parent)
                    node._parent.removeNode(node);
                delete node._selectedNode; // (no longer a root, if it was a root before)
                // ... complete insert ...
                if (index < 0)
                    index = 0;
                if (index > this._children.length)
                    index = this._children.length;
                this._children.splice(index, 0, node);
                node._parent = this;
                this.onNodeAdded.trigger(node, index, this);
            }
            return node;
        };
        /** Removes a visual node from this node.*/
        VisualNode.prototype.removeNode = function (node) {
            var i = this._children.indexOf(node);
            if (i >= 0) {
                var removedNode = this._children.splice(i, 1)[0];
                removedNode._parent = null;
                this._doAdded(removedNode, i);
                return removedNode;
            }
            return void 0;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches the parent hierarchy with the given expression.  This is used to detect cyclical references. */
        VisualNode.prototype.isInParent = function (expr) {
            if (expr)
                if (typeof expr != 'object')
                    throw "Expression is not an object.";
                else if (!(expr instanceof FlowScript.Expression))
                    throw "'expr' argument is not an expression object.";
                else if (this._parent)
                    if (this._parent.item == expr)
                        return true;
                    else
                        return this._parent.isInParent(expr);
            return false;
        };
        /** Calls 'isInParent()' with the given expression and generates a cyclical error if found. */
        VisualNode.prototype.cyclicalCheck = function (expr) {
            if (this.isInParent(expr))
                throw "Cyclical error: You cannot use parent expressions (directly or indirectly) within themselves, or any nested child expressions. Clone the expression first and try again.";
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Begins rendering the visual tree. */
        VisualNode.prototype.render = function (node) {
            if (node === void 0) { node = null; }
            if (this._parent)
                return this._render(this._parent._children.indexOf(this), this._parent._children.length, this._parent.containerElement || null);
            else
                return this._render(void 0, void 0, null);
        };
        VisualNode.prototype._render = function (index, count, parentElement) {
            switch (this._type) {
                case VisualNodeTypes.Component: return this.renderComponent(index, count, parentElement);
                case VisualNodeTypes.ComponentReference: return this.renderComponent(index, count, parentElement);
                case VisualNodeTypes.ComponentTitlePart: return this.renderComponentTitlePart(index, count, parentElement);
                case VisualNodeTypes.ComponentParameter: return this.renderComponentParameter(index, count, parentElement);
                case VisualNodeTypes.Arguments: return this.renderArguments(index, count, parentElement);
                case VisualNodeTypes.Argument: return this.renderArgument(index, count, parentElement);
                case VisualNodeTypes.ReturnTargets: return this.renderReturnTargets(index, count, parentElement);
                case VisualNodeTypes.ReturnTarget: return this.renderReturnTarget(index, count, parentElement);
                case VisualNodeTypes.Block: return this.renderBlock(index, count, parentElement);
                case VisualNodeTypes.BlockReference: return this.renderBlock(index, count, parentElement);
                case VisualNodeTypes.Line: return this.renderLine(index, count, parentElement);
                case VisualNodeTypes.LineReference: return this.renderLine(index, count, parentElement);
                case VisualNodeTypes.Statement: return this.renderStatement(index, count, parentElement);
                case VisualNodeTypes.Property: return this.renderProperty(index, count, parentElement);
                case VisualNodeTypes.PropertyReference: return this.renderProperty(index, count, parentElement);
                case VisualNodeTypes.Constant: return this.renderConstant(index, count, parentElement);
                //case VisualNodeTypes.EventHandlers: return this.renderEventHandlers(index, count, parentElement);
                //case VisualNodeTypes.EventHandler: return this.renderEventHandler(index, count, parentElement);
                case VisualNodeTypes.Text: return this.renderText(index, count, parentElement);
                default:
                    var msg = "Visual node type '" + VisualNodeTypes[this._type] + "' is not recognized.";
                    FlowScript.log(msg, FlowScript.LogMessageTypes.Error, false);
                    var errorEl = this.createElement("div");
                    errorEl.innerHTML = "<b>Error: " + msg + "</b>";
                    return errorEl;
            }
        };
        VisualNode.prototype._renderChildren = function (parentElement) {
            for (var i = 0, n = this._children.length; i < n; ++i)
                this._children[i]._render(i, n, parentElement || this.containerElement);
            return parentElement;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype.createElement = function (name, parentElement) {
            var element = document.createElement(name);
            element.$__fs_vnode = this;
            if (parentElement)
                parentElement.appendChild(element);
            return element;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype.createVisualElement = function (name, parentElement) {
            return this.visualElement = this.createElement(name, parentElement);
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype.createContainerElement = function (name, parentElement) {
            return this.containerElement = this.createElement(name, parentElement);
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._createErrorElement = function (msg) {
            var el = this.createElement("div");
            el.innerHTML = "<font color='red'><b>" + FlowScript.log(msg, FlowScript.LogMessageTypes.Error, false) + "</b></font>";
            return el;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._doSelect = function (ev, title, subject) {
            if (subject === void 0) { subject = this; }
            this.onNodeSelected.trigger(subject, title, ev);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doSelect(ev, title, subject);
            ev.stopPropagation();
        };
        VisualNode.prototype._doAdded = function (subject, index) {
            this.onNodeAdded.trigger(subject, index, this);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doAdded(subject, index);
        };
        VisualNode.prototype._doRemoved = function (subject, index) {
            this.onNodeRemoved.trigger(subject, index, this);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doRemoved(subject, index);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /**
         * Render this visual node as a text node.
         */
        VisualNode.prototype.renderText = function (index, count, parentElement) {
            var element = this.visualElement = this.createElement("span", parentElement);
            element.className = "text";
            element.innerHTML = this.text;
            return element;
        };
        /**
         * Render this visual node as a component reference.
         */
        VisualNode.prototype.renderComponent = function (index, count, parentElement) {
            var _this = this;
            var compRef = this._castTo(FlowScript.ComponentReference, false);
            var comp = compRef ? compRef.component : this._castTo(FlowScript.Component);
            if (!comp)
                return this._createErrorElement("Error: This visual node does not reference a component instance.");
            var element = this.createVisualElement("span", parentElement);
            element.className = compRef ? "component_reference" : "component";
            if (parentElement)
                if (!parentElement.$__fs_vnode) {
                    element.title = "Component '" + comp.name + "'";
                    element.onclick = function (ev) { return _this._doSelect(ev, element.title); };
                }
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderReturnTargets = function (index, count, parentElement) {
            var element = this.createVisualElement("div", parentElement);
            element.className = "returns";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderReturnTarget = function (index, count, parentElement) {
            var element = this.createVisualElement("span", parentElement);
            element.className = "return";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderArguments = function (index, count, parentElement) {
            var element = this.createVisualElement("div", parentElement);
            element.className = "arguments";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderArgument = function (index, count, parentElement) {
            var element = this.createVisualElement("span", parentElement);
            element.className = "argument";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderComponentTitlePart = function (index, count, parentElement) {
            var element = this.createVisualElement("span", parentElement);
            element.className = "titlepart";
            element.innerHTML = this.text;
            return element;
        };
        VisualNode.prototype.renderComponentParameter = function (index, count, parentElement) {
            var _this = this;
            var element = this.createVisualElement("span", parentElement);
            element.className = "parameter";
            element.title = this.title;
            element.onclick = function (ev) { return _this._doSelect(ev, ev.currentTarget.$__fs_vnode.title); };
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderBlock = function (index, count, parentElement) {
            var _this = this;
            var blockRef = this._castTo(FlowScript.BlockReference, false);
            var block = blockRef ? blockRef.block : this._castTo(FlowScript.Block);
            if (!block)
                return this._createErrorElement("Error: This visual node does not reference a block instance.");
            var element = this.createVisualElement("div", parentElement);
            element.className = blockRef ? "block_referernce" : "block";
            element.onclick = function (ev) { _this._doSelect(ev, "Code Block"); ev.stopPropagation(); };
            if (!blockRef) {
                var linesContainer = this.createContainerElement("div", element);
                linesContainer.className = "lines";
                var lineCount = this.asBlock.lines.length;
                if (!lineCount) {
                    var lineContainer = this.createElement("div", linesContainer);
                    lineContainer.className = "line emptyLine";
                    lineContainer.innerHTML = "-?-";
                }
                else
                    this._renderChildren();
            }
            else
                this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderLine = function (index, count, parentElement) {
            var _this = this;
            var lineRef = this._castTo(FlowScript.LineReference, false);
            var line = lineRef ? lineRef.line : this._castTo(FlowScript.Line);
            if (!line)
                return this._createErrorElement("Error: This visual node does not reference a line instance.");
            var lineNum = index, lineCount = count;
            var element = this.createVisualElement("div", parentElement);
            element.className = lineRef ? "line_reference" : "line";
            element.onclick = function (ev) { _this._doSelect(ev, "Block Line"); ev.stopPropagation(); };
            if (lineCount > 1) {
                var lineNumberElement = this.createElement("span", element);
                lineNumberElement.className = "linenumber";
                lineNumberElement.innerHTML = lineNum + ": ";
            }
            var statementsContainer = this.createContainerElement("div", element);
            statementsContainer.className = "statements";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderStatement = function (index, count, parentElement) {
            var _this = this;
            var statement = this._castTo(FlowScript.Statement, false);
            if (!statement)
                return this._createErrorElement("Error: This visual node does not reference a statement instance.");
            var element = this.createVisualElement("span", parentElement);
            element.className = "statement";
            element.title = "Statement expression for component '" + statement.component.fullTypeName + "' (" + statement.component.title + ").";
            element.onclick = function (ev) { _this._doSelect(ev, "Statement Expression (" + statement.component.name + ")"); ev.stopPropagation(); };
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderProperty = function (index, count, parentElement) {
            var propRef = this._castTo(FlowScript.PropertyReference, false);
            var prop = propRef ? propRef.property : this._castTo(FlowScript.Property);
            if (!prop)
                if (propRef.propertyRef.path)
                    return this.renderValue(propRef, this.visualElement, "property", "?", "property", "Property '" + propRef.propertyRef.path + "' of component '" + propCompName + "'.", onclick);
                else
                    return this._createErrorElement("Error: This visual node does not reference a property instance.");
            if (propRef) {
                var element = this.createVisualElement("span", parentElement);
                element.className = "property_reference";
            }
            else
                element = parentElement;
            var propCompName = prop.component ? prop.component.fullTypeName : "?";
            var funcComp = propRef && propRef.functionalComponent;
            var showCompNamePrefix = !prop.component || funcComp && funcComp.fullTypeName != prop.component.fullTypeName;
            var displayText = showCompNamePrefix ? propCompName + "." + prop.name : prop.name;
            return this.renderValue(propRef, this.visualElement, "property", displayText, "property", "Property '" + prop.name + "' of component '" + propCompName + "'.", onclick);
        };
        VisualNode.prototype.renderConstant = function (index, count, parentElement) {
            var constant = this._castTo(FlowScript.Constant, false);
            if (!constant)
                return this._createErrorElement("Error: This visual node does not reference a constant instance.");
            return this.visualElement = this.renderValue(constant, parentElement, "constant", constant.value, typeof constant.value, "Constant value '" + constant.value + "'.", onclick);
        };
        VisualNode.prototype.renderValue = function (valueExpr, parentElement, className, value, valueType, title, onclick) {
            var _this = this;
            var element = this.createElement("span", parentElement);
            element.className = className;
            element.title = title;
            element.innerHTML = valueType == 'string' ? '"' + value + '"' : valueType == 'number' ? value : valueType == 'boolean' ? "<i>" + ('' + value).toUpperCase() + "</i>" : value;
            element.onclick = function (ev) { _this._doSelect(ev, "Argument Value"); ev.stopPropagation(); };
            return element;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._ShowSelectedStyle = function () {
            if (this.visualElement) {
                this.visualElement.style.background = "#f0fff0";
                this.visualElement.style.border = "1px solid black";
            }
        };
        VisualNode.prototype._HideSelectedStyle = function () {
            if (this.visualElement) {
                this.visualElement.style.background = "";
                this.visualElement.style.border = "";
            }
        };
        return VisualNode;
    }());
    FlowScript.VisualNode = VisualNode;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    /**
     * Common 'Views' and 'View' shared properties and functions.
     */
    var ViewBase = /** @class */ (function () {
        function ViewBase() {
        }
        Object.defineProperty(ViewBase.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewBase.prototype, "rootNode", {
            /** The root node for this view. */
            get: function () { return this._rootNode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewBase.prototype, "rootElement", {
            /** The root element for this view. This is 'rootNode', or 'null' is 'rootNode' is not an 'HTMLElement' type.*/
            get: function () {
                if (this._rootNode instanceof HTMLElement)
                    return this._rootNode;
                else
                    throw "'rootNode' is not an HTMLElement based object.";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewBase.prototype, "contentElement", {
            /** The node where content will be stored for this view. This defaults to 'rootElement', unless otherwise specified. */
            get: function () { return this._contentElement || this.rootElement; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns all elements from within this view type object that matches the given query string. */
        ViewBase.prototype.queryElements = function (query) {
            var node = this._rootNode;
            if (node.querySelectorAll)
                return this._rootNode.querySelectorAll(query);
            else
                for (var i = 0, n = this._rootNode.childNodes.length; i < n; ++i) {
                    var node = this._rootNode.childNodes[i];
                    if (node.querySelectorAll) {
                        var result = node.querySelectorAll(query);
                        if (result)
                            return result;
                    }
                }
            return null;
        };
        /** Returns the first matching element from within this view that matches the given query string. */
        ViewBase.prototype.queryElement = function (query) {
            var node = this._rootNode;
            if (node.querySelector)
                return this._rootNode.querySelector(query);
            else
                for (var i = 0, n = this._rootNode.childNodes.length; i < n; ++i) {
                    var node = this._rootNode.childNodes[i];
                    if (node.querySelector) {
                        var result = node.querySelector(query);
                        if (result)
                            return result;
                    }
                }
            return null;
        };
        /** Returns the first matching element from within this view that has the given ID. */
        ViewBase.prototype.getElementById = function (id) { return this.queryElement("#" + id); };
        /** Returns all elements from within this view that contains the given attribute name. */
        ViewBase.prototype.getElementsByAttribute = function (name) { return this.queryElements("[" + name + "]"); };
        /** Sets the value of an input element from within the root element for this view that matches the given ID, then returns the element that was set.
         * If there is no value property, the 'innerHTML' property is assumed.
         * If 'ignoreErrors' is false (default) and no element is found, an error is thrown.
         */
        ViewBase.prototype.setElementValueById = function (id, value, ignoreErrors) {
            if (value === void 0) { value = ""; }
            if (ignoreErrors === void 0) { ignoreErrors = false; }
            var el = this.getElementById(id);
            if (!el)
                if (!ignoreErrors)
                    throw "There is no element with an ID of '" + id + "' in this view.";
                else
                    return null;
            var hasValue = ('value' in el), hasInnerHTML = ('innerHTML' in el);
            if (!hasValue && !hasInnerHTML)
                throw "Element ID '" + id + "' within this view does not represent an element with a 'value' or 'innerHTML' property.";
            if (hasValue)
                el.value = value;
            else
                el.innerHTML = value;
            return el;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches the given node and all parents for a view based object. */
        ViewBase.getViewBase = function (fromNode, includeSelf) {
            if (includeSelf === void 0) { includeSelf = true; }
            var el = fromNode;
            if (el) {
                if (el.$__view)
                    if (includeSelf)
                        return el.$__view;
                    else if (!el.parentNode && el.$__view.parent)
                        // (if there is no parent node to move to, BUT this node has a view object, then the view object is detached, sub jump to the parent's node)
                        return ViewBase.getViewBase(el.$__view.parent._rootNode);
                do {
                    el = el.parentNode;
                    if (el && el.$__view)
                        return el.$__view;
                } while (el);
            }
            return null;
        };
        /**
         * Traverse the view object parent hierarchy to find a view that this view based object is contained within.
         * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
         */
        ViewBase.prototype.getParentView = function () {
            if (this._parent)
                if (this._parent instanceof View)
                    return this._parent;
                else
                    return this._parent.getParentView();
            return null;
        };
        /**
         * Traverse the view object parent hierarchy to find a views container that this view based object is contained within.
         * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
         */
        ViewBase.prototype.getParentViewsContainer = function () {
            if (this._parent)
                if (this._parent instanceof Views)
                    return this._parent;
                else
                    return this._parent.getParentViewsContainer();
            return null;
        };
        ViewBase.getView = function (fromNode, includeSelf) {
            if (includeSelf === void 0) { includeSelf = true; }
            var v = ViewBase.getViewBase(fromNode, includeSelf);
            if (v)
                if (v instanceof View)
                    return v;
                else
                    return ViewBase.getView(v._rootNode, false);
            return null;
        };
        ViewBase.getViewsContainer = function (fromNode, includeSelf) {
            if (includeSelf === void 0) { includeSelf = true; }
            var vc = ViewBase.getViewBase(fromNode, includeSelf);
            if (vc)
                if (vc instanceof Views)
                    return vc;
                else
                    return ViewBase.getViewsContainer(vc._rootNode, false);
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /**
         * Builds view containers and views from elements within this container.
         */
        //* When calling this function with no parameters, the default root page view is established, and the other containers
        //* and views are extracted and added in nested form based on nested associations.
        //* @param rootElement The element to start build the views from.
        ViewBase.prototype.buildViews = function () {
            // ... look for 'data-view-container' attributes in the root view and extract those now ...
            var containerElements = this.getElementsByAttribute('data-view-container');
            var viewContainers = [];
            for (var i = 0, n = containerElements.length; i < n; ++i)
                if (!containerElements[i].$__view) // (make sure this is not already wrapped in a view object)
                    viewContainers.push(new Views(containerElements[i]));
            // ... look for 'data-view' attributes on elements and attach those elements to their container parents ...
            var views = this.getElementsByAttribute('data-view');
            for (var i = 0, n = views.length; i < n; ++i) {
                var vEl = views[i], vname = vEl.attributes && vEl.attributes.getNamedItem("data-view").value || null;
                if (!vEl.$__view) { // (only add if not already added)
                    var parentContainer = ViewBase.getViewsContainer(vEl, false);
                    if (!parentContainer)
                        throw "View '" + vname + "' (element '" + vEl.nodeName + "') does not have a parent views container.";
                    parentContainer.createViewFromElement(vname, vEl);
                }
            }
            // ... hook up the view containers to the proper views they are contained in ...
            for (var i = 0, n = viewContainers.length; i < n; ++i) {
                var vc = viewContainers[i];
                var v = ViewBase.getView(vc._rootNode, false);
                if (v && vc.parent != v) {
                    if (v)
                        v.addViewContainer(vc); // (adds the container to the list if missing - which is usually true when building for the first time)
                }
            }
            return this;
        };
        return ViewBase;
    }());
    FlowScript.ViewBase = ViewBase;
    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        function View(name, urlOrElement, queryOrChildrenOnly, parent) {
            var _this = _super.call(this) || this;
            _this.queryOrChildrenOnly = queryOrChildrenOnly;
            _this._name = name || typeof urlOrElement == 'object' && (urlOrElement.id || urlOrElement.nodeName);
            if (urlOrElement instanceof Node && urlOrElement.nodeName == "HTML") {
                // ... the HTML element needs to be hooked up a special way ...
                _this._rootNode = urlOrElement;
                _this._contentElement = urlOrElement.querySelector("body"); // (note: in most cases, 'this._contentElement' being the 'body', usually also doubles as a view container)
                window.addEventListener("resize", function () { _this._doOnResize(); });
                _this._doOnResize(); // (this isn't called at least once by default when adding the event, so do so now)
            }
            else {
                // ... all other elements will be meshed with an iframe to capture resize events ...
                _this._rootNode = document.createElement("div"); // (give all views a default DIV container)
                _this.rootElement.innerHTML = "<iframe style=width:100%;height:100%;position:absolute;border:none;background-color:transparent;allowtransparency=true;visibility:hidden></iframe><div></div>";
                var iframe = _this._rootNode.firstChild;
                iframe.onload = function () {
                    if (iframe.contentWindow)
                        iframe.contentWindow.addEventListener("resize", function () { _this._doOnResize(); });
                    _this._doOnResize(); // (this isn't called at least once by default when adding the event, so do so now)
                };
                _this._contentElement = _this._rootNode.lastChild;
                if (urlOrElement instanceof HTMLElement) {
                    if (urlOrElement.attributes)
                        urlOrElement.attributes.removeNamedItem("data-view"); // (just in case, to prevent finding this node again)
                    // ... add element, or its children, to this view ...
                    if (queryOrChildrenOnly) {
                        if (urlOrElement.childNodes) // (make sure this node supports children)
                            for (var nodes = urlOrElement.childNodes, i = nodes.length - 1; i >= 0; --i) {
                                var child = nodes[i];
                                urlOrElement.removeChild(child);
                                _this.contentElement.insertBefore(child, _this.contentElement.firstChild);
                            }
                    }
                    else {
                        // ... add the element to the container element for this view (remove from any existing parent first) ...
                        if (urlOrElement.parentElement)
                            urlOrElement.parentElement.removeChild(urlOrElement);
                        _this.contentElement.appendChild(urlOrElement);
                        _this._contentElement = urlOrElement; // (this given element is now the content container)
                    }
                }
                else if (urlOrElement) {
                    _this._url = "" + urlOrElement;
                    _this._request = new FlowScript.Net.CachedRequest(_this._url, queryOrChildrenOnly);
                }
            }
            if (_this._rootNode)
                _this._rootNode.$__view = _this;
            var parentContainer = ViewBase.getViewsContainer(_this._rootNode, false) || parent;
            if (parentContainer)
                parentContainer.addView(_this);
            return _this;
        }
        Object.defineProperty(View.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        /** Holds a list of view containers that are managed by this view. */
        View.prototype.childViewContainers = function () { return this._childViewContainers; };
        /** Returns true if this view is the current view in the parent 'Views' container. */
        View.prototype.isCurrentView = function () { return this.parent.currentView == this; };
        Object.defineProperty(View.prototype, "scriptsApplied", {
            /** Set to true when scripts are evaluated so they are not evaluated more than once. */
            get: function () { return this._scriptsApplied; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "attached", {
            /** This is true if this view is the one showing in the parent views container. */
            get: function () { return this._parent ? this.parent.currentView == this : false; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "originalHTML", {
            get: function () { return this._request.result; },
            enumerable: true,
            configurable: true
        });
        /** Adds a callback that gets executed ONCE when the view is shown.
          * This can be used in view scripts to executed callbacks to run just after a view is attached for the first time.
          */
        View.prototype.oninit = function (func) {
            if (!this._oninitHandlers)
                this._oninitHandlers = [];
            this._oninitHandlers.push(func);
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns a new 'Views' container that wraps an element nested within this view.
          * Note: If the element exists outside this view, it will not be found.
          * @param elementID The ID of a nested child element within this view.
          * @param existingContentViewName If specified, any child elements of the target element are saved into a new view under this view container.
          * If not specified, the child elements will be cleared out when a view becomes shown.
          * @param showExistingContent If true (default), any existing contents remain visible once copied into a new view.
          * Set this to 'false' to hide the existing contents.
          */
        View.prototype.createViewContainer = function (elementID, existingContentViewName, showExistingContent) {
            if (showExistingContent === void 0) { showExistingContent = true; }
            var el = this.getElementById(elementID);
            if (!el)
                throw "There is no element with ID '" + elementID + "' contained within this view.";
            if (el.$__view)
                if (el.$__view instanceof Views)
                    return el.$__view;
                else
                    throw "Element '" + elementID + "' is already connected to view '" + el.$__view.name + "'.";
            var view = ViewBase.getViewBase(el, false) || this; // (get the child view container to the proper view that will manage it)
            if (view instanceof Views)
                throw "Element '" + elementID + "' is contained within a views container, and not a view. You can only create view containers from elements that have a view in the parent hierarchy.";
            if (!(view instanceof View))
                throw "Element '" + elementID + "' does not contained a view in the parent hierarchy, which is required.";
            var views = new Views(el);
            //? view.addViewContainer(views);
            // ... move any existing elements in this container into a view if requested; otherwise they will be removed when a view is set ...
            if (existingContentViewName && el.firstChild) {
                var viewName = "" + existingContentViewName;
                var view = views.createViewFromElement(viewName, el, true);
                if (showExistingContent)
                    view.show();
            }
            return views;
        };
        /** Adds a view container to this view and returns it. The container is first removed from any existing view parent. */
        View.prototype.addViewContainer = function (views) {
            var parentView = views['_parent'];
            if (parentView == this)
                return views; // (already added)
            if (parentView instanceof View)
                parentView.removeViewContainer(views);
            if (views['_parent'] != this) {
                views['_parent'] = this;
                if (!this._childViewContainers)
                    this._childViewContainers = [];
                this._childViewContainers.push(views);
            }
            return views;
        };
        /** Removes a view container from this view and returns it. If the container doesn't exist, 'undefined' is returned. */
        View.prototype.removeViewContainer = function (views) {
            views['_parent'] = null;
            if (this._childViewContainers) {
                var i = this._childViewContainers.indexOf(views);
                if (i >= 0)
                    return this._childViewContainers.splice(i, 1)[0];
            }
            return void 0;
        };
        /** Find an immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
        View.prototype.getViewContainer = function (name, recursive) {
            if (recursive === void 0) { recursive = false; }
            if (this._childViewContainers) {
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i) {
                    var vc = this._childViewContainers[i];
                    if (vc.name == name)
                        return vc;
                }
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    this._childViewContainers[i].getViewContainer(name, recursive);
            }
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a callback that gets executed each time this view is shown. */
        View.prototype.onshow = function (func) {
            if (!this._onshowHandlers)
                this._onshowHandlers = [];
            this._onshowHandlers.push(func);
            return this;
        };
        View.prototype.show = function () {
            if (this.parent)
                this.parent.showView(this);
            return this;
        };
        View.prototype._doOnShow = function () {
            // ... run all the one-time init handlers, if any, and remove them ...
            if (this._oninitHandlers && this._oninitHandlers.length) {
                for (var i = 0, len = this._oninitHandlers.length; i < len; ++i)
                    this._oninitHandlers[i].call(this, this);
                this._oninitHandlers.length = 0; // (these only run once)
            }
            // ... run all the on-show handlers, if any ...
            if (this._onshowHandlers && this._onshowHandlers.length)
                for (var i = 0, len = this._onshowHandlers.length; i < len; ++i)
                    this._onshowHandlers[i].call(this, this);
            // ... if this view is showing, which means all child views are also showing, so recursively run the handlers ...
            if (this._childViewContainers && this._childViewContainers.length)
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                        vc.views[i2]._doOnShow();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a callback that gets executed each time this view is shown. */
        View.prototype.onhide = function (func) {
            if (!this._onhideHandlers)
                this._onhideHandlers = [];
            this._onhideHandlers.push(func);
            return this;
        };
        View.prototype.hide = function () {
            if (this.attached)
                this.parent.hideCurrentView();
            return this;
        };
        View.prototype._doOnHide = function () {
            // ... run all the on-hide handlers, if any ...
            if (this._onhideHandlers && this._onhideHandlers.length)
                for (var i = 0, len = this._onhideHandlers.length; i < len; ++i)
                    this._onhideHandlers[i].call(this, this);
            // ... if this view is hidden, which means all child views are also hidden, so recursively run the handlers ...
            if (this._childViewContainers && this._childViewContainers.length)
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                        vc.views[i2]._doOnHide();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a callback that gets executed each time this view changes size. */
        View.prototype.onresize = function (func) {
            if (!this._onresizeHandlers)
                this._onresizeHandlers = [];
            this._onresizeHandlers.push(func);
            return this;
        };
        View.prototype._doOnResize = function () {
            // ... run all the on-hide handlers, if any ...
            if (this._onresizeHandlers && this._onresizeHandlers.length)
                for (var i = 0, len = this._onresizeHandlers.length; i < len; ++i)
                    this._onresizeHandlers[i].call(this, this);
            // ... if this view is resized, that means all child views may also be changed, so recursively run the handlers ...
            if (this._childViewContainers && this._childViewContainers.length)
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                        vc.views[i2]._doOnResize();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Clears all children from the root node. The view is blank after calling this. */
        View.prototype.clear = function () { FlowScript.Utilities.HTML.clearChildNodes(this.contentElement); };
        /** Clears all children from the root node and reloads the view. If the view is not loaded yet, then the view is cleared only. */
        View.prototype.reset = function () { this.contentElement.innerHTML = this._request && this._request.result ? this._request.result : ""; };
        // --------------------------------------------------------------------------------------------------------------------
        //?private _executeScripts() {
        //    if (!this._scriptsApplied) {
        //        this._scriptsApplied = true; // (do first to make sure this doesn't get called again in the evaluation)
        //        try {
        //            if (this._scripts && this._scripts.length) {
        //                View.scriptView = this;
        //                for (var i = 0, len = this._scripts.length; i < len; ++i) {
        //                    var script = this._scripts[i];
        //                    var scriptElement = document.createElement("script"); // TODO: copy attributes also? (ideas: http://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml)
        //                    if (script.code)
        //                        scriptElement.text = script.code;
        //                    script.newScriptNode = scriptElement;
        //                    if (script.originalScriptNode)
        //                        script.originalScriptNode.parentNode.replaceChild(scriptElement, script.originalScriptNode);
        //                    else
        //                        document.body.appendChild(scriptElement);
        //                    if (script.src)
        //                        scriptElement.src = script.src; // (this allows debugging with maps if available!)
        //                    //FlowScript.evalGlobal(this._scripts.join("\r\n\r\n"));
        //                }
        //            }
        //        }
        //        finally {
        //            View.scriptView = void 0;
        //        }
        //    }
        //}
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.onloaded = function (func) {
            var _this = this;
            this._request.onloaded(function (req, ev) {
                if (_this.contentElement && !_this.contentElement.innerHTML) { // (only set once - don't clear anything existing)
                    _this.contentElement.innerHTML = req.result;
                    // ... load any scripts if found before triggering the callback ...
                    var scripts = _this.contentElement.getElementsByTagName("script");
                    if (scripts.length) {
                        var checkCompleted = function () {
                            for (var i = 0, len = _this._scripts.length; i < len; ++i)
                                if (!_this._scripts[i].applied) {
                                    loadScript(_this._scripts[i]);
                                    return;
                                }
                            func.call(_this, _this, req, ev);
                        };
                        var loadScript = function (script) {
                            View.loadedView = _this;
                            //script.originalScriptNode.parentNode.replaceChild(script.newScriptNode, script.originalScriptNode);
                            script.originalScriptNode.parentNode.removeChild(script.originalScriptNode);
                            document.body.appendChild(script.newScriptNode);
                            if (!script.src) {
                                if (script.code)
                                    script.newScriptNode.text = script.code;
                                script.applied = true; // (no synchronous loading required)
                                checkCompleted();
                            }
                            else {
                                script.newScriptNode.onload = function (_ev) {
                                    View.loadedView = void 0;
                                    script.applied = true;
                                    checkCompleted();
                                };
                                script.newScriptNode.onerror = function (_ev) {
                                    View.loadedView = void 0;
                                    _this._request._doOnError(_ev);
                                };
                                script.newScriptNode.src = script.src;
                            }
                        };
                        if (!_this._scripts)
                            _this._scripts = [];
                        for (var i = 0, len = scripts.length; i < len; ++i)
                            _this._scripts.push({ originalScriptNode: scripts[i], src: scripts[i].src, code: scripts[i].text, newScriptNode: document.createElement('script') });
                        loadScript(_this._scripts[0]);
                    }
                    else
                        func.call(_this, _this, req, ev);
                }
                else
                    func.call(_this, _this, req, ev);
            });
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.onerror = function (func) {
            var _this = this;
            this._request.onerror(function (req, ev) { func.call(_this, _this, req, ev); });
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.thenLoad = function (name, url, payload, delay) {
            if (delay === void 0) { delay = 0; }
            var view = this.parent.createView(name, url, payload);
            view._request = this._request.thenLoad(url, payload, delay);
            return view;
        };
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.send = function () { this._request.send(); return this; };
        return View;
    }(ViewBase));
    FlowScript.View = View;
    /**
     * Holds a list of views dynamically loaded from the server.
     */
    var Views = /** @class */ (function (_super) {
        __extends(Views, _super);
        function Views(viewsContainerOrID, containerName) {
            var _this = _super.call(this) || this;
            _this._views = [];
            if (viewsContainerOrID instanceof Node)
                _this._rootNode = viewsContainerOrID;
            else if (viewsContainerOrID) {
                _this._rootNode = document.getElementById("" + viewsContainerOrID);
                if (!_this._rootNode)
                    throw "No element with an ID of '" + viewsContainerOrID + "' could be found.";
                if (_this._rootNode.$__view != _this)
                    throw "The specified element is already associated with a view.";
            }
            if (_this._rootNode) {
                _this._rootNode.$__view = _this;
                if (_this._rootNode instanceof Element) {
                    if (_this._rootNode.attributes)
                        _this._rootNode.attributes.removeNamedItem("data-view-container"); // (just in case, to prevent finding this node again)
                    if (!containerName) {
                        if (_this._rootNode.attributes) {
                            var attr = _this._rootNode.attributes.getNamedItem("data-view-container");
                            containerName = attr && attr.value;
                        }
                        if (!containerName)
                            containerName = _this._rootNode.id || _this._rootNode.nodeName;
                    }
                }
            }
            _this._name = containerName || "";
            // ... check if there is a parent 'view' object we need to associated with ...
            var parentView = ViewBase.getView(_this._rootNode, false);
            if (parentView)
                parentView.addViewContainer(_this);
            return _this;
        }
        Object.defineProperty(Views.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "count", {
            /** Returns the number of views in this container. */
            get: function () { return this._views.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "views", {
            /** Returns the list of all views in this container. */
            get: function () { return this._views; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "currentView", {
            get: function () { return this._currentView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "firstView", {
            /** Returns the first view in the collection, or 'null' if empty. */
            get: function () { return this._views && this._views.length && this._views[0] || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "lastView", {
            /** Returns the last view in the collection, or 'null' if empty. */
            get: function () { return this._views && this._views.length && this._views[this._views.length - 1] || null; },
            enumerable: true,
            configurable: true
        });
        Views.prototype.addView = function (view, hidden) {
            if (hidden === void 0) { hidden = !!(this._views && this._views.length); }
            var parent = view["_parent"];
            if (parent)
                if (parent == this)
                    return view;
                else
                    parent.removeView(view);
            this._views.push(view);
            view["_parent"] = this;
            if (hidden && view.rootNode && view.rootNode.parentNode) // (remove from view when added, until the user decides to show it later)
                view.rootNode.parentNode.removeChild(view.rootNode);
            return view;
        };
        Views.prototype.removeView = function (view) {
            var i = this._views.indexOf(view);
            if (i >= 0) {
                view = this._views.splice(i, 1)[0];
                view["_parent"] = null;
            }
            else
                view = FlowScript.undefined;
            return view;
        };
        /**
         * Creates a new view from HTML loaded from a given URL.
         * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
         * @param name A name for this view.
         * @param url The URL to load the view from. If not specified, a blank view is created.
         * @param payload URL query values. Ignored if 'url' is not specified.
         */
        Views.prototype.createView = function (name, url, payload, rootNode) {
            var view = this.getView(name);
            if (view)
                return view;
            view = new View(name, url, payload, this);
            this.addView(view);
            return view;
        };
        /**
         * Creates a new view from a DOM element, or its children.
         * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
         * @param name A name for this view.
         * @param element The element to associated with the view (will be removed from any existing parent).  This is the element that will be added and removed from the parent Views container.
         * @param childrenOnly If true, only the children of the specified element are moved into the new view.
         */
        Views.prototype.createViewFromElement = function (name, elementOrID, childrenOnly) {
            var view = this.getView(name);
            if (view)
                return view;
            var element = elementOrID instanceof HTMLElement ? elementOrID : this.getElementById(elementOrID);
            if (!element)
                throw "Element '" + elementOrID + "' does not exist within this view.";
            return new View(name, element, childrenOnly, this);
        };
        Views.prototype.getView = function (name) {
            for (var i = 0, len = this._views.length; i < len; ++i)
                if (this._views[i].name == name)
                    return this._views[i];
            return null;
        };
        Views.prototype.showView = function (viewOrName) {
            var _view;
            if (_view === null || viewOrName instanceof View) {
                _view = viewOrName;
            }
            else {
                _view = this.getView('' + viewOrName);
                if (!_view)
                    throw "There's no view named '" + viewOrName + "' (case sensitive).";
            }
            if (this._currentView != _view) {
                FlowScript.Utilities.HTML.clearChildNodes(this.contentElement);
                if (this._currentView)
                    this._currentView['_doOnHide']();
                if (_view && _view.rootNode) {
                    this.contentElement.appendChild(_view.rootNode);
                    this._currentView = _view;
                    _view['_doOnShow']();
                }
                else
                    this._currentView = null;
            }
            return _view;
        };
        Views.prototype.hideCurrentView = function () {
            this.showView(null);
        };
        /** Find the next immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
        Views.prototype.getViewContainer = function (name, recursive) {
            if (recursive === void 0) { recursive = false; }
            if (this._views)
                for (var i = 0, n = this._views.length; i < n; ++i) {
                    var vc = this._views[i].getViewContainer(name, recursive);
                    if (vc)
                        return vc;
                }
            return null;
        };
        /**
         * Builds view containers and views from elements, starting with the document root, which is 'window.document' by
         * default if no root is specified. The root document object is the default container when building views.
         * When calling this function with no parameters, the default root page view is established, and the other containers
         * and views are extracted and added in nested form based on nested associations.
         * @param rootElement The element to start build the views from.
         */
        Views.buildViews = function (documentRoot) {
            if (documentRoot === void 0) { documentRoot = document; }
            var rootContainer = new Views(documentRoot);
            return rootContainer.buildViews();
        };
        return Views;
    }(ViewBase));
    FlowScript.Views = Views;
})(FlowScript || (FlowScript = {}));
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    var Project = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Project(
        /** The title of the project. */ title, 
        /** The project's description. */ description) {
            this.title = title;
            this.description = description;
            this._expressionBin = [];
            this.onExpressionBinItemAdded = new FlowScript.EventDispatcher(this);
            this.onExpressionBinItemRemoved = new FlowScript.EventDispatcher(this);
            this._script = FlowScript.createNew();
        }
        Object.defineProperty(Project.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The script instance for this project. */
            get: function () { return this._script; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Project.prototype, "expressionBin", {
            // --------------------------------------------------------------------------------------------------------------------
            // Create a type of trash-bin to hold expressions so the user can restore them, or delete permanently.
            /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
              * developers to move expressions easily between scripts.
              * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
              */
            get: function () { return this._expressionBin; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        Project.prototype.save = function () {
            return this.script.saveToStorage(this.title);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Project.prototype.addToBin = function (expr, triggerEvent) {
            if (triggerEvent === void 0) { triggerEvent = true; }
            if (this._expressionBin.indexOf(expr) < 0) {
                this._expressionBin.push(expr);
                if (triggerEvent)
                    this.onExpressionBinItemAdded.trigger(expr, this);
            }
        };
        Project.prototype.removeFromBin = function (expr, triggerEvent) {
            if (triggerEvent === void 0) { triggerEvent = true; }
            var i = this._expressionBin.indexOf(expr);
            if (i >= 0) {
                var expr = this._expressionBin.splice(i, 1)[0];
                if (triggerEvent)
                    this.onExpressionBinItemRemoved.trigger(expr, this);
            }
        };
        Project.prototype.isInBin = function (expr) { return this._expressionBin.indexOf(expr) >= 0; };
        // --------------------------------------------------------------------------------------------------------------------
        Project.prototype._findChildNode = function (node, fstype) {
            if (node) {
                for (var i = 0, len = node.childNodes.length; i < len; ++i)
                    if (node.childNodes[i]["$__fs_type"] == fstype)
                        return node.childNodes[i];
            }
            else
                return null;
        };
        return Project;
    }());
    FlowScript.Project = Project;
    // ========================================================================================================================
    /**
     * Holds a collection of projects.
     */
    var Projects = /** @class */ (function () {
        function Projects() {
            this._projects = [];
        }
        Object.defineProperty(Projects.prototype, "count", {
            get: function () { return this._projects.length; },
            enumerable: true,
            configurable: true
        });
        Projects.prototype.createProject = function (title, description, projectType) {
            var project = new (projectType || Project)(title, description);
            this._projects.push(project);
            return project;
        };
        return Projects;
    }());
    FlowScript.Projects = Projects;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    FlowScript.Type.All = new FlowScript.Core.All();
    FlowScript.Type.Inferred = new FlowScript.Core.Inferred();
    // ========================================================================================================================
    /** Contains the default core system types expected by the compiler. Since these core types must always exist, a default
      * type graph is created here for convenience.
      */
    FlowScript.System = FlowScript.createNew().System;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
///// <reference path="flowscriptrt.common.ts" />
/// <reference path="flowscriptrt.ts" />
/// <reference path="type.ts" />
/// <reference path="flowscriptmain.ts" />
/// <reference path="expressions.ts" />
/// <reference path="property.ts" />
/// <reference path="component.ts" />
/// <reference path="block.ts" />
/// <reference path="line.ts" />
/// <reference path="enum.ts" />
/// <reference path="event.ts" />
/// <reference path="message.ts" />
/// <reference path="table.ts" />
/// <reference path="thread.ts" />
/// <reference path="components/core.ts" />
/// <reference path="components/core.httprequest.ts" />
/// <reference path="components/core.controlflow.ts" />
/// <reference path="components/core.math.ts" />
/// <reference path="components/core.binary.ts" />
/// <reference path="components/core.comparison.ts" />
/// <reference path="components/core.HTML.ts" />
/// <reference path="compiler.ts" />
/// <reference path="simulator.ts" />
/// <reference path="visualtree.ts" />
/// <reference path="views.ts" />
/// <reference path="projects.ts" />
/// <reference path="bootup.ts" />
// ############################################################################################################################
//# sourceMappingURL=flowscript.js.map