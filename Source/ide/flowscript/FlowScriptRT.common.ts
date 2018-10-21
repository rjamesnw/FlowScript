// ############################################################################################################################
// The objects in this file apply only to running scripts, which don't have access to the FlowScript designer/compiler types by default.

// ############################################################################################################################
// Extend the array with some LINQ-style functions.

interface Array<T> {
    last: () => T;
    first: () => T;
    append: (items: Array<T>) => Array<T>;
    select: <T2>(selector: { (item: T): T2 }) => Array<T2>;
    where: (selector: { (item: T): boolean }) => Array<T>;
}

Array.prototype.last = function () { return this[this.length - 1]; };
Array.prototype.first = function () { return this[0]; };
Array.prototype.append = function (items) { this.push.apply(this, items); return this; };
Array.prototype.select = function (func: (a: any) => any) { if (!func) return this; var _: any[] = [], __: any; for (var i = 0; i < this.length; ++i) _[i] = func(this[i]); return _; };
Array.prototype.where = function (func: (a: any) => boolean) { if (!func) return this; var _: any[] = [], __: any; for (var i = 0; i < this.length; ++i) if (func(__ = this[i])) _.push(__); return _; };

// ############################################################################################################################
// Allow accessing properties of primitive objects by string index.

interface FunctionEx extends Function {
    [index: string]: any;
}

interface Object {
    [index: string]: any;
}

interface String {
    /**
      * Split a string into substrings using the specified separator and return them as an array.
      * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned. 
      * @param limit A value used to limit the number of elements returned in the array.
      * @param delimiterList An optional parameter, which is a list of pre-existing delimiters if available, which then ignores 
      *                      the 'separator' value [more efficient].  This may be from a previous "match" operation.
      *                      Note: Always supply the 'separator' parameter, since this is a special implementation for older browsers only.
      */
    split(separator: string, limit: number, delimiterList: string[]): string[];

    /**
      * Split a string into substrings using the specified separator and return them as an array.
      * @param separator A Regular Express that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned. 
      * @param limit A value used to limit the number of elements returned in the array.
      * @param delimiterList An optional parameter, which is a list of pre-existing delimiters if available, which then ignores 
      *                      the 'separator' value [more efficient].  This may be from a previous "match" operation.
      *                      Note: Always supply the 'separator' parameter, since this is a special implementation for older browsers only.
      */
    split(separator: RegExp, limit: number, delimiterList: string[]): string[];
}

interface Array<T> {
    [index: string]: any;
}

//?interface Location { // included in lib now
//    origin: string;
//}

declare var FlowScript_debugging: boolean;

// ############################################################################################################################

/** The base namespace for all FlowScript types. */
namespace FlowScript {
    // ========================================================================================================================

    export var undefined: any = void 0;
    //export var 'undefined' = 'undefined';
    //export var 'object' = 'object';
    //export var 'function' = 'function';
    //export var 'string' = 'string';
    //export var 'number' = 'number';
    //export var 'boolean' = 'boolean';


    // ========================================================================================================================
    // Integrate native types

    //?export interface IIndexableObject { [index: string]: any }

    export declare module NativeTypes {
        export interface IFunction extends Function { }
        export interface IObject extends Object { }
        export interface IArray<T> extends Array<T> { }
        export interface IString extends String { }
        export interface INumber extends Number { }
        export interface IBoolean extends Boolean { }
        export interface IRegExp extends RegExp { }
        export interface IDate extends Date { }
        export interface IIMath extends Math { }
        export interface IError extends Error { }
    }

    export declare module NativeStaticTypes {
        export var StaticFunction: typeof Function;
        export var StaticObject: typeof Object;
        export var StaticArray: typeof Array;
        export var StaticString: typeof String;
        export var StaticNumber: typeof Number;
        export var StaticBoolean: typeof Boolean;
        export var StaticRegExp: typeof RegExp;
        export var StaticDate: typeof Date;
        export var StaticMath: typeof Math;
        export var StaticError: typeof Error;
    }

    export interface IStaticGlobals extends Window {
        [index: string]: any;
        Function: typeof NativeStaticTypes.StaticFunction;
        Object: typeof NativeStaticTypes.StaticObject;
        Array: typeof NativeStaticTypes.StaticArray;
        String: typeof NativeStaticTypes.StaticString;
        Number: typeof NativeStaticTypes.StaticNumber;
        Boolean: typeof NativeStaticTypes.StaticBoolean;
        RegExp: typeof NativeStaticTypes.StaticRegExp;
        Date: typeof NativeStaticTypes.StaticDate;
        Math: typeof NativeStaticTypes.StaticMath;
        Error: typeof NativeStaticTypes.StaticError;
    }

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
      * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
      */
    export var global: IStaticGlobals = function () { }.constructor("return this")(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

    // =======================================================================================================================

    /** A simple function that does nothing (no operation).
      * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
      * or when replacing the 'FlowScript.Loader.bootstrap()' function, which should only ever need to be called once.
      */
    export function noop(): void { }

    /** Evaluates a string in a function at the global scope level. This is more secure for executing scripts without exposing internal private/protected
      * variables wrapped in closures.  This also allows passing arguments scoped only to the request without polluting the global scope.
      */
    export declare function safeEval(exp: string, ...args: any[]): any;

    /** Evaluates a string at the global scope level.
      */
    export declare function evalGlobal(exp: string): any;

    /** If true (set by developer), then the web storage is cleared on each run.  Other implantation specific debug features may also become enabled.
    * If running in a browser, adding "debug=true" to the page's query string will also cause this value to become true.
    */
    export var debugging: boolean = (() => {
        return FlowScript.debugging || typeof location == "object" && location.search && /[?&]debug=true/gi.test("" + location.search);
    })();

    // =======================================================================================================================

    export enum Environments {
        /** Represents the FlowScript client core environment. */
        Browser, // Trusted
        /** Represents the FlowScript worker environment (where applications and certain modules reside). */
        Worker, // Secure "Sandbox"
        /** Represents the FlowScript server environment. */
        Server
    }

    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of iNet OS runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since 
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    export var Environment = (function (): Environments {
        if (typeof navigator !== 'object') {
            // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
            window = <any>{};
            (<any>window).document = <any>{ title: "SERVER" }
            navigator = <any>{ userAgent: "Mozilla/5.0 (FlowScript) like Gecko" };
            location = <any>{
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
        } else if (typeof window == 'object' && window.document)
            return Environments.Browser;
        else
            return Environments.Worker;
    })();

    // =======================================================================================================================

    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
     export namespace Browser {
        // ------------------------------------------------------------------------------------------------------------------

        // (Browser detection is a highly modified version of "http://www.quirksmode.org/js/detect.html".)
        // (Note: This is only required for quirk detection in special circumstances [such as IE's native JSON whitespace parsing issue], and not for object feature support)

        /** A list of browsers that can be currently detected. */
        export enum BrowserTypes {
            /** Browser is not yet detected, or detection failed. */
            Unknown = 0,
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            None = -1,
            IE = 1,
            Chrome,
            FireFox,
            Safari,
            Opera,
            Netscape,
            OmniWeb,
            iCab,
            Konqueror,
            Camino
        }

        /** A list of operating systems that can be currently detected. */
        export enum OperatingSystems {
            /** OS is not yet detected, or detection failed. */
            Unknown = 0,
            Windows,
            Mac,
            Linux,
            iOS
        }

        /** Holds detection parameters for a single browser agent string version.
        * Note: This is agent string related, as the version number itself is pulled dynamically based on 'versionPrefix'.
        */
        export interface BrowserAgentVersionInfo {
            /** The parent 'BrowserInfo' details that owns this object. */
            parent?: BrowserInfo;
            /** The text to search for to select this version entry. If null, use the browser name string. */
            nameTag: string;
            /** The text to search for that immediately precedes the browser version.
            * If null, use the browser name string, appended with '/'. */
            versionPrefix: string;
            /** Used only to override a browser vendor name if a different vendor owned a browser in the past. */
            vendor?: string;
        }

        /** Holds detection parameters for a single browser type, and supported versions. */
        export interface BrowserInfo {
            /** The name of the browser. */
            name: string;
            /** The browser's vendor. */
            vendor: string;
            /** The browser's enum value (see 'Browser.BrowserTypes'). */
            identity: BrowserTypes;
            /** The browser's AGENT STRING versions (see 'Browser.BrowserVersionInfo').
            * Note: This is the most important part, as browser is detected based on it's version details.
            */
            versions: BrowserAgentVersionInfo[];
        }

        /** Holds detection parameters for the host operating system. */
        export interface OSInfo {
            name: string;
            identity: OperatingSystems;
        }

        var __browserList: BrowserInfo[] = (() => {
            var list: BrowserInfo[] = [];
            list[BrowserTypes.Chrome] =
                {
                    name: "Chrome", vendor: "Google", identity: BrowserTypes.Chrome, // (browser details)
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
            if ((<any>window).opera) browserVersionInfo = __browserList[BrowserTypes.Opera].versions[0];
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
                        { nameTag: null, versionPrefix: null }, // for newer Netscapes (6+)
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

        var __osList: OSInfo[] = [
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
        export var browserVersionInfo: BrowserAgentVersionInfo = null;

        /** Holds a reference to the agent data detected regarding the host operating system. */
        export var osInfo: OSInfo = null;

        var __findBrowser = (): BrowserAgentVersionInfo => {
            var agent = navigator.vendor + "," + navigator.userAgent, bInfo: BrowserInfo, version: BrowserAgentVersionInfo, versionPrefix: string;
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
        }

        var __findOS = (): OSInfo => {
            var osStrData = navigator.platform || navigator.userAgent;
            for (var i = 0, n = __osList.length; i < n; ++i)
                if (osStrData.indexOf(__osList[i].name) != -1)
                    return __osList[i];
        }

        var __detectVersion = (versionInfo: BrowserAgentVersionInfo): number => {
            var versionStr = navigator.userAgent + " / " + navigator.appVersion;
            var versionPrefix = versionInfo.versionPrefix || (versionInfo.parent.name + "/");
            var index = versionStr.indexOf(versionPrefix);
            if (index == -1) return -1;
            return parseFloat(versionStr.substring(index + versionPrefix.length));
        }

        /** The name of the detected browser. */
        export var name: string = "";

        /** The browser's vendor. */
        export var vendor: string = "";

        /** The operating system detected. */
        export var os: OperatingSystems = OperatingSystems.Unknown;

        /** The browser version detected. */
        export var version: number = -1;

        /** The type of browser detected. */
        export var type: BrowserTypes = ((): BrowserTypes => {
            var browserType: BrowserTypes = BrowserTypes.Unknown, browserInfo: BrowserInfo;
            if (Environment == Environments.Browser) {
                if (!browserVersionInfo) browserVersionInfo = __findBrowser();
                browserInfo = browserVersionInfo.parent;
                osInfo = __findOS();
                browserType = browserInfo.identity;
                name = browserInfo.name;
                vendor = browserVersionInfo.vendor || browserVersionInfo.parent.vendor;
                browserType = browserInfo != null ? browserInfo.identity : BrowserTypes.Unknown;
                version = __detectVersion(browserVersionInfo);
                os = osInfo != null ? osInfo.identity : OperatingSystems.Unknown;
            }
            else browserType = BrowserTypes.None;
            return browserType;
        })();

        // ------------------------------------------------------------------------------------------------------------------

        /** Uses cross-browser methods to return the browser window's viewport size. */
        export function getViewportSize() {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }

        // ------------------------------------------------------------------------------------------------------------------

        /**
         * Browser benchmarking for various speed tests. The test uses the high-performance clock system, which exists in most modern browsers.
         * The result is returned in milliseconds.
         * @param init The "setup" code, which is only run once.
         * @param code The code to run a test on.
         * @param trialCount The number of times to run the whole test ('init' together with 'code' loops).  The default is 100. The average time of all tests are returned.
         * @param count The number of loops to run the test code in ('code' only, and not the 'init' code). The default is 100,000,000.
         */
        function testSpeed(init: string, code: string, trialCount = 100, count = 100000000): number { // (http://www.simetric.co.uk/si_time.htm, http://slideplayer.com/slide/5712283/)
            count = +count || 0;
            trialCount = +trialCount || 0;
            if (code && count && trialCount) {
                var func = new Function(init + ";\r\n"
                    + "var $__fs_t0 = performance.now();\r\n"
                    + "for (var $__fs_i = 0; $__fs_i < " + count + "; $__fs_i++) {\r\n" + code + ";\r\n}\r\n"
                    + "var $__fs_t1 = performance.now();\r\n"
                    + " return $__fs_t1 - $__fs_t0;\r\n");
                console.log(func);
                var totalTime: number = 0;
                for (var i = 0; i < trialCount; ++i)
                    totalTime += func();
                var elapsed = totalTime / trialCount;
                console.log("Took: " + elapsed + "ms");
            }
            return elapsed || 0;
        }

        // ------------------------------------------------------------------------------------------------------------------
    }

    // =======================================================================================================================

    /** Used with 'FlowScript.log(...)' to write to the host console, if available. */
    export enum LogMessageTypes { Message, Info, Warning, Error, Debug, Trace }

    /** Logs the message to the console (if available) and returns it. */
    export function log(msg: any, msgType = LogMessageTypes.Message, throwOnError = true) {
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

    // =======================================================================================================================

    export interface ICallerArguments {
        [index: number]: any;
        [name: string]: any;
    }

    export interface IContextArguments {
        [index: number]: string;
        [name: string]: any;
    }

    export interface ICallableComponent {
        (ctx: RuntimeContext): RuntimeContext;
    }

    export interface IFunctionalComponentMetadata {
        /** The currently active context for this functional component type. */
        context: RuntimeContext;
        /** The named parameters expected by this functional component. */
        parameterNames: string[]
    }

    /** A simple class used make working with the script easier during runtime. */
    export class RuntimeScript {
        [index: string]: any;
        /** The root component for the functional component tree. */
        types: { [index: string]: any; }; // (note: this becomes set in the compiled script)
        /** Holds global variables. */
        globals: { [index: string]: any; } = {};
        constructor(properties: { [index: string]: any }) {
            for (var p in properties)
                this[p] = properties[p];
        }
        /** Returns a namespace object based on the safe full type path. */
        getType(safeFullTypePath: string): any {
            return Utilities.dereferencePropertyPath(safeFullTypePath, this.types, true);
        }
    }

    /** Each component call gets a dedicated context, or loads one from a pool.  A context contains the input and output
      * properties.  Local vars that are not parameters are persistent, so data can be retained between calls if needed.
      */
    export class RuntimeContext {
        [prop: string]: any;

        previous: RuntimeContext;
        next: RuntimeContext;

        /** Parameters, local variables, and return variables are all stored in this object.  This is similar behavior to
          * parameters and local variables all existing on the same local scope. Variables get updated by incoming caller
          * arguments, and those matching the declared return names are passed on as needed.
          * The numerical index and length property are used to store the property names of the supplied caller arguments.  This
          * is to support "rest" parameters where the number of arguments are unknown ahead of time.
          */
        arguments: IContextArguments; // TODO: Consider not resetting values to undefined in prod mode.
        argumentLength: number;

        constructor(previous: RuntimeContext) {
            this.arguments = {};
            this.previous = previous || null;
            this.next = null;
        }

        getNextContext(compFunc: IFunctionalComponentMetadata, callerArgCount: number): RuntimeContext {
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
        }

        /** Sets argument values based on the properties of the supplied object. 
          * If the source object has numerical indexes, then the corresponding context property name for that index will be updated.
          */
        setArguments(source: {}): void {
            for (var p in source)
                if ((<Object>source).hasOwnProperty(p)) {
                    var c = p[0];
                    if (c >= '0' && c <= '9') {
                        var index = +p;
                        if (index >= this.argumentLength)
                            this.argumentLength = index + 1;
                        var ctxArgName = this.arguments[index];
                        if (!ctxArgName) this.arguments[index] = ctxArgName = "@" + p; // (if there is no declared name for an index, then create a default one)
                        this.arguments[ctxArgName] = (<any>source)[p];
                    } else
                        this.arguments[p] = (<any>source)[p];
                }
        }

        /** Resets the current context arguments and any error state to 'undefined'. */
        reset(): RuntimeContext {
            for (var p in this.arguments)
                this.arguments[p] = void 0;
            this.argumentLength = 0;
            this.error = void 0;
            return this;
        }

        /** If a component returns a value other than 'undefined'/'null', it is assumed to be an error value - which is usually either a string or error object.
          */
        error: any;

        /** The even handler callback blocks provided for this calling context.
          */
        eventHandlers: { [eventName: string]: ICallableComponent[] };
    }

    // ========================================================================================================================

    export namespace Utilities {
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        var _hostChecksum: number = (function () { // (used in 'createGUID()')
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
        export function createGUID(hyphens: boolean = true): string {
            var zoneTime: number/*in ms*/ = (Date.now ? Date.now() : new Date().getTime()) + _timeZoneOffset; // (use current local time [not UTC] to offset the random number [there was a bug in Chrome, not sure if it was fixed yet])
            var randseed: number = zoneTime + _hostChecksum;
            var hexTimeAndCounter = zoneTime.toString(16) + (_guidCounter <= 0xffffffff ? _guidCounter++ : _guidCounter = 0).toString(16), i = hexTimeAndCounter.length, pi = 0;
            var pattern: string = hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx', len = pattern.length, result = "", c: string, r: number;
            while (pi < len)
                c = pattern[pi++], result += c != 'x' && c != 'y' ? c : i > 0 ? hexTimeAndCounter[--i] : (r = Math.random() * randseed % 16 | 0, c == 'x' ? r : r & 0x3 | 0x8).toString(16);
            return result;
        }

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
        export function dereferencePropertyPath(path: string, origin?: {}, unsafe = false): {} {
            if (unsafe) return safeEval('p1.' + path, origin); // (note: this is 'FlowScript.eval()', not a direct call to the global 'eval()')
            if (origin === void 0 || origin === null) origin = this !== global ? this : global;
            if (typeof path !== 'string') path = '' + path;
            var o: { [name: string]: any } = <any>origin, c = '', pc: string, i = 0, n = path.length, name = '';
            if (n)
                ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0)
                    ? (name ? <any>(o = o[name], name = '') : <any>(pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c)
                    : name += c;
            if (i == n + 2) throw "Invalid path: " + path;
            return o;
        } // (performance: http://jsperf.com/ways-to-dereference-a-delimited-property-string)

        // -------------------------------------------------------------------------------------------------------------------

        /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
        * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
        * @param {Function} func The function to call '.apply()' on.
        * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
        * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
        * @param {any} args The arguments to apply to given function reference (the 'func' argument).
        */
        export function apply(func: Function, _this: Object, args: any[]): any {
            if (func.apply) {
                return func.apply(_this, args);
            } else {
                return Function.prototype.apply.apply(func, [_this, args]);
            }
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Erases all properties on the object, instead of deleting them (which takes longer).
        * @param {boolean} release If false, then care is taken not to erase any property that contains a 'dispose()' function. (default: true)
        *                          This is provided to support reconstructing nested object groups without needing to rebuild the associations.
        */
        export function erase(obj: { [name: string]: any }, release = true): {} {
            for (var p in obj)
                if ((p != "__proto__" && p != 'constructor' && <NativeTypes.IObject>obj).hasOwnProperty(p))
                    if (release || p == 'dispose' && typeof obj[p] != 'function')
                        obj[p] = void 0;
            return obj;

        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Replaces one string with another in a given string.
        * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
        * faster in Chrome, and RegEx based 'replace()' in others.
        */
        export function replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
            // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
            if (typeof source !== 'string') source = "" + source;
            if (typeof replaceWhat !== 'string') replaceWhat = "" + replaceWhat;
            if (typeof replaceWith !== 'string') replaceWith = "" + replaceWith;
            if (ignoreCase)
                return source.replace(new RegExp(Utilities.RegEx.escapeRegex(replaceWhat), 'gi'), replaceWith);
            else
                if (Browser.type == Browser.BrowserTypes.Chrome)
                    return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
                else
                    return source.replace(new RegExp(Utilities.RegEx.escapeRegex(replaceWhat), 'g'), replaceWith);
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Replaces all tags in the given 'html' string with 'tagReplacement' (an empty string by default) and returns the result. */
        export function replaceTags(html: string, tagReplacement?: string): string {
            return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
        * specified fixed length, then the request is ignored, and the given string is returned.
        * @param {any} str The string to pad.
        * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
        * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
        * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
        */
        export function pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string {
            if (str === void 0) str = "";
            if (leftPadChar === void 0 || leftPadChar === null) leftPadChar = "";
            if (rightPadChar === void 0 || rightPadChar === null) rightPadChar = "";

            var s = "" + str, targetLength = fixedLength || 0, remainder = targetLength - s.length,
                lchar = "" + leftPadChar, rchar = "" + rightPadChar,
                i: number, n: number, llen: number, rlen: number, lpad: string = "", rpad: string = "";

            if (remainder == 0 || (!lchar && !rchar)) return str;

            if (lchar && rchar) {
                llen = Math.floor(remainder / 2);
                rlen = targetLength - llen;
            }
            else if (lchar) llen = remainder;
            else if (rchar) rlen = remainder;

            for (i = 0; i < llen; ++i)
                lpad += lchar;

            for (i = 0; i < rlen; ++i)
                rpad += rchar;

            return lpad + s + rpad;
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
        * Note: If any argument is not a string, the value is converted into a string.
        */
        export function append(source: string, suffix?: string, delimiter?: string): string {
            if (source === void 0) source = "";
            else if (typeof source != 'string') source = '' + source;
            if (typeof suffix != 'string') suffix = '' + suffix;
            if (typeof delimiter != 'string') delimiter = '' + delimiter;
            if (!source) return suffix;
            return source + delimiter + suffix;
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
        * Note: If any argument is not a string, the value is converted into a string.
        */
        export function prepend(source: string, prefix?: string, delimiter?: string): string {
            if (source === void 0) source = "";
            else if (typeof source != 'string') source = '' + source;
            if (typeof prefix != 'string') prefix = '' + prefix;
            if (typeof delimiter != 'string') delimiter = '' + delimiter;
            if (!source) return prefix;
            return prefix + delimiter + source;
        }

        // -------------------------------------------------------------------------------------------------------------------

        export var FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])

        /** Attempts to pull the function name from the function reference, and returns 'undefined' (void 0) for anonymous functions. */
        export function getFunctionName(func: Function): string {
            if (typeof func != 'function') throw "'func' argument is not a valid function object reference.";
            var name = (<any>func)['$__fs_funcname'];
            if (name == void 0) {
                var fstr = func.toString();
                var results = FUNC_NAME_REGEX.exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                name = (results && results.length > 1) ? results[1] : void 0;
                (<any>func)['$__fs_funcname'] = name;
            }
            return name;

        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        export namespace RegEx {
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 

            /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
            export function escapeRegex(regExStr: string): string {
                return regExStr.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1"); // TODO: Verify completeness.
            }

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        export namespace Encoding {

            export enum Base64Modes {
                /** Use standard Base64 encoding characters. */
                Standard,
                /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
                URI,
                /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
                * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
                */
                Custom
            };

            export var __64BASE_ENCODING_CHARS_STANDARD = String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
            export var __64BASE_ENCODING_CHARS_URI = String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_%3D"); // (note: %3D is treaded as one char [an % encoded '='])
            export var __64BASE_ENCODING_CHARS_CUSTOM = __64BASE_ENCODING_CHARS_STANDARD;
            // (Note: There must be exactly 65 characters [64 + 1 for padding])
            // (Note: 'String' objects MUST be used in order for the encoding functions to populate the reverse lookup indexes)

            function __CreateCharIndex(str: NativeTypes.IString) {
                if (str.length < 65)
                    throw "65 characters expected for base64 encoding characters (last character is for padding), but only " + str.length + " are specified.";
                if (typeof str !== "object" || !(str instanceof String))
                    throw "The encoding characters must be set in a valid 'String' OBJECT (not as a string VALUE).";
                if (!(<any>str)['charIndex']) {
                    var index: { [index: string]: number } = {};
                    for (var i = 0, n = str.length; i < n; ++i)
                        index[str[i]] = i;
                    (<any>str)['charIndex'] = index;
                }
            }

            /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
            * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
            * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
            * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
            * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
            *                             Exception: If the mode is URI encoding, then padding is false by default.
            */
            export function base64Encode(value: string, mode: Base64Modes = Base64Modes.Standard, usePadding?: boolean): string {
                if (value === void 0 || value === null) value = ""; else value = "" + value;
                if (value.length == 0) return "";

                if (usePadding === void 0)
                    usePadding = (mode != Base64Modes.URI);

                var encodingChars: String = (mode == Base64Modes.Standard ? __64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? __64BASE_ENCODING_CHARS_URI : __64BASE_ENCODING_CHARS_CUSTOM));

                // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...

                if (!(<any>encodingChars)['charIndex'])
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
                var code: number, bit: number, baseCode: number = 0;
                var result = "";
                var paddingLength = usePadding ? (3 - Math.floor(value.length * (srcCharBitDepth / 8) % 3)) : 0;
                if (paddingLength == 3) paddingLength = 0;

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

            /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
            * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
            * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
            * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
            */
            export function base64Decode(value: string, mode: Base64Modes = Base64Modes.Standard): string {
                if (value === void 0 || value === null) value = ""; else value = "" + value;
                if (value.length == 0) return "";

                var encodingChars: String = (mode == Base64Modes.Standard ? __64BASE_ENCODING_CHARS_STANDARD : (mode == Base64Modes.URI ? __64BASE_ENCODING_CHARS_URI : __64BASE_ENCODING_CHARS_CUSTOM));

                // ... make sure the reverse lookup exists, and populate if missing  (which also serves to validate the encoding chars) ...

                if (!(<any>encodingChars)['charIndex'])
                    __CreateCharIndex(encodingChars);

                // ... determine the character bit depth ...

                var srcCharBitDepth = 8; // (regular 8-bit ASCII chars is the default, unless Unicode values are detected)
                if (value.charAt(0) == 'A')// (normal ASCII encoded characters will never start with "A" (a 'null' character), so this serves as the Unicode flag)
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
                var code: number, bit: number, baseCode: number = 0;
                var result = "";
                var charCount = 0;

                while (true) {
                    if (readBitIndex == 6) {
                        readBitIndex = 0;
                        code = readIndex < value.length ? (<any>encodingChars)['charIndex'][value.charAt(readIndex++)] : 0;
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
                        if (++charCount >= resultLength) break; // (all expected characters written)
                        baseCode = 0;
                    }
                }

                return result;
            }
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        export namespace HTML {
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 

            // Removes the '<!-- -->' comment sequence from the the ends of the specified HTML.
            export function uncommentHTML(html: string): string { // TODO: Consider using regex
                var content = ("" + html).trim();
                var i1 = 0, i2 = content.length;
                if (content.substring(0, 4) == "<!--") i1 = 4;
                if (content.substr(content.length - 3) == "-->") i2 -= 3;
                if (i1 > 0 || i2 < content.length)
                    content = content.substring(i1, i2);
                return content;
            }

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 

            // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
            export function getCommentText(html: string): string { // TODO: Consider using regex
                var content = ("" + html).trim();
                var i1 = content.indexOf("<!--"), i2 = content.lastIndexOf("-->");
                if (i1 < 0) i1 = 0;
                if (i2 < 0) i2 = content.length;
                return content.substring(i1, i2);
            }

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 

            // Gets the text between '<!-- -->' (assumed to be at each end of the given HTML).
            export function getScriptCommentText(html: string): string { // TODO: Consider using regex.
                var content = ("" + html).trim();
                var i1 = content.indexOf("/*"), i2 = content.lastIndexOf("*/");
                if (i1 < 0) i1 = 0;
                if (i2 < 0) i2 = content.length;
                return content.substring(i1, i2);
            }

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        var nativeJSON: typeof JSON = typeof window != 'undefined' ? (<any>window).JSON : void 0;

        export namespace Data {

            export namespace JSON {

                /** Converts a JSON string into an object, with nested objects as required.
                  * The JSON format is validated first before conversion.
                  */
                export function parse(jsonText: string) {
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
                    } else {
                        log('Invalid JSON: "' + jsonText + '"', LogMessageTypes.Error);
                        return {};
                    }
                }

                export function stringify(data: any): string {
                    if (nativeJSON == void 0)
                        throw "Sorry, JSON is not supported in this environment. You could try to polyfill it (see modernizr.com) and try again.";
                    return nativeJSON.stringify(data);
                }
            }
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
    }

    // ========================================================================================================================

    /** Network communication utilities. */
    export namespace Net {

        export interface IHTTPRequestListener<T extends HTTPRequest> { (request: T, ev?: Event): void; }

        export interface IHTTPRequestPayload { [index: string]: any }

        /** Represents an HTTP request object.  The design is (very loosely) made similar to "promise" semantics, and as such, 
          * the member function calls can be chained.
          */
        export class HTTPRequest {
            xhr = new XMLHttpRequest();
            formData = new FormData();
            prev: HTTPRequest = null;
            next: HTTPRequest = null;
            private _onerror: IHTTPRequestListener<HTTPRequest>[];
            private _onloaded: IHTTPRequestListener<HTTPRequest>[];
            delay = 0; // (in ms for the next chained request to execute)
            sent = 0; // (0: not sent or erred out, 1: queued, 2: sent)
            /** Set to true upon successful loading of the resource. */
            loaded: boolean;
            /** A user defined value for state tracking, caller instance referencing, etc. */
            userState: any;

            constructor(public url: string, payload?: IHTTPRequestPayload,
                /** HTTP send method. (ex: 'GET', 'POST', 'PUT', 'DELETE', etc.) */public method: string = "GET",
                /** Expected response type. (ex: 'json', 'text' [or '', defaults to text], 'blob', 'document', 'arrayBuffer', etc.) */ public responseType: XMLHttpRequestResponseType = "json") {

                if (payload)
                    if (method == "POST")
                        for (var p in payload)
                            this.formData.append(p, payload[p]); //? encodeURIComponent(payload[p]) ?
                    else {
                        var queryItems: string[] = [];
                        for (var p in payload)
                            queryItems.push(p + "=" + encodeURIComponent(payload[p]));
                        if (url.lastIndexOf("?") < 0)
                            url += "?";
                        url += (url.charAt(url.length - 1) != "?" ? "&" : "") + queryItems.join("&");
                    }

                this.url = url;

                this.xhr.onload = (ev) => { this._doOnLoaded(ev); };
                this.xhr.onerror = (ev) => { this._doOnError(ev); };
            }

            _doOnLoaded(ev: Event) {
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
            }

            _doOnError(ev: Event) {
                debugger;
                log('An error occurred: ' + ev + '\r\n  XHR Status: ' + this.xhr.statusText, LogMessageTypes.Error);
                this.sent = 0;
                if (this._onerror) {
                    for (var i = 0, len = this._onerror.length; i < len; ++i)
                        this._onerror[i].call(this, this, ev);
                    this._onloaded.length = 0; // (make sure they don't get triggered again)
                    this._onerror.length = 0; // (make sure they don't get triggered again)
                }
            }

            thenLoad(url: string, payload?: { [index: string]: any }, delay = 0, method?: string, responseType?: XMLHttpRequestResponseType): HTTPRequest {
                this.next = new HTTPRequest(url, payload, method, responseType);
                this.next.prev = this;
                this.next.delay = delay || 0; // the delay to use before sending the request; defaults to 0 (send immediately)
                return this.next;
            }

            onloaded(func: IHTTPRequestListener<HTTPRequest>): HTTPRequest {
                if (!this._onloaded)
                    this._onloaded = [];
                this._onloaded.push(func);
                return this;
            }
            onerror(func: IHTTPRequestListener<HTTPRequest>): HTTPRequest { if (!this._onerror) this._onerror = []; this._onerror.push(func); return this; }

            /** Starts the first or next request in the series. */
            send(): HTTPRequest {
                if (this.loaded) {
                    // ... already loaded, so queue event to trigger now ...
                    setTimeout(() => { this._doOnLoaded(null); }, this.delay);
                }
                else if (this.prev && !this.prev.sent)
                    this.prev.send();
                else if (!this.sent) {
                    this.sent = 1;
                    setTimeout(() => { this._doXHRSend(); }, this.delay);
                    // (using a timer to 1. support delays, and 2. make sure there's no immediate event triggers before the user is able to register any call-backs, if needed)
                }
                return this;
            }

            protected _doXHRSend(): void {
                this.xhr.open(("" + this.method).toLowerCase(), this.url, true);

                if (this.responseType)
                    this.xhr.responseType = <XMLHttpRequestResponseType>("" + this.responseType).toLowerCase();

                this.xhr.send(this.formData);

                this.sent = 2;
            }

            /** Queues the next request following this request to be sent, if any. */
            sendNext(): boolean { if (this.next && !this.next.sent) { this.next.send(); return true; } else return false; }
        }

        export enum CacheMode {
            /** Bypass the cache and load as normal.  Successful responses are NOT cached. */
            Bypass = -1,
            /** Load from the local storage if possible, otherwise load as normal.  Successful responses are cached. */
            Store = 0,
            /** Ignore the local storage and load as normal.  Successful responses are cached, overwriting the existing data. */
            Reload = 1
        }

        /** Uses local storage features to cache successful responses (since app-cache HTML5 features are not yet well supported).
          * 
          */
        export class CachedRequest extends HTTPRequest {
            result: string;

            constructor(url: string, payload?: IHTTPRequestPayload, public cacheMode = CacheMode.Store,
                /** An optional name to group the cached responses under. Version changes will affect only the cache under the app name. */public appName?: string,
                /** Used to clear the cache when the application version changes.*/public appVersion?: string) {
                super(url, payload, "GET", "text");
                this.onerror((req, ev) => { req.result = null; });
            }

            send(): CachedRequest {
                return <CachedRequest>super.send();
            }

            _doOnLoaded(ev: Event) {
                if (ev) { // (ev != null if this was triggered by xhr onload event)
                    this.result = this.xhr.responseText;

                    if (Storage.hasLocalStorage && this.cacheMode != CacheMode.Bypass)
                        Storage.set(Storage.StorageType.Local, this.url, this.result, this.appName, this.appVersion);
                }

                super._doOnLoaded(ev);
            }

            protected _doXHRSend(): void {
                if (Storage.hasLocalStorage && this.cacheMode == CacheMode.Store) {
                    this.result = Storage.get(Storage.StorageType.Local, this.url, this.result, this.appName, this.appVersion);

                    if (this.result !== null) {
                        super._doOnLoaded(null);
                        return;
                    }
                }

                super._doXHRSend();
            }

            onloaded(func: IHTTPRequestListener<CachedRequest>): CachedRequest { return <CachedRequest>super.onloaded(func); }
            onerror(func: IHTTPRequestListener<CachedRequest>): CachedRequest { return <CachedRequest>super.onerror(func); }

            thenLoad(url: string, payload?: { [index: string]: any }, delay = 0): CachedRequest {
                return <CachedRequest>super.thenLoad(url, payload, delay, "GET", "text");
            }
        }

        /** A very simple function to load text via a1 URL (text files, web pages, JSON files, etc).
          * 
          */
        export function get(url: string, payload?: IHTTPRequestPayload, cacheMode = CacheMode.Store, appName?: string, appVersion?: string): CachedRequest {
            return <CachedRequest>new CachedRequest(url, payload, cacheMode, appName, appVersion).send();
        }
    }

    // ========================================================================================================================

    /** Web storage utilities. */
    export namespace Storage {
        // ------------------------------------------------------------------------------------------------------------------
        // Feature Detection 

        function _storageAvailable(storageType: "localStorage" | "sessionStorage"): boolean { // (https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_support_vs_availability)
            try {
                var storage = window[storageType],
                    x = '$__storage_test__$';
                storage.setItem(x, x);
                storage.removeItem(x);
                return true;
            }
            catch (e) {
                return false;
            }
        }

        /** Set to true if local storage is available. */
        export var hasLocalStorage: boolean = _storageAvailable("localStorage");

        /** Set to true if session storage is available. */
        export var hasSessionStorage: boolean = _storageAvailable("sessionStorage");

        export enum StorageType {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            Local,
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            Session
        }

        // ------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    interface _IError {
        name: string;
        message: string;
        stack: string; // (in opera, this is a call stack only [no source and line details], and includes function names and args)
        stacktrace: string; // (opera - includes source and line info)
        lineNumber: number; // (Firefox)
        lineno: number; // (Firefox)
        columnNumber: number; // (Firefox)
        fileName: string; // (Firefox)
    }

    /** Returns the call stack for a given error object. */
    export function getErrorCallStack(errorSource: { stack?: string }): string[] {
        var _e: _IError = <any>errorSource;
        if (_e.stacktrace && _e.stack) return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
        var callstack: string[] = [];
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

    /** Returns the message of the specified error source by returning either 'errorSource' as is, if a string, or
      * 'errorSource.message' if exits.
      */
    export function getErrorMessage(errorSource: any): string {
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object' && 'message' in errorSource) {
            var error: _IError = errorSource;
            var msg = error.message;
            if (error.lineno !== undefined)
                error.lineNumber = error.lineno;
            if (error.lineNumber !== undefined) {
                msg += "\r\non line " + error.lineNumber + ", column " + error.columnNumber;
                if (error.fileName !== undefined)
                    msg += ", of file '" + error.fileName + "'";
            } else if (error.fileName !== undefined)
                msg += "\r\nin file '" + error.fileName + "'";
            var stack = getErrorCallStack(error);
            if (stack && stack.length)
                msg += "\r\nStack trace:\r\n" + stack.join("\r\n") + "\r\n";
            return msg;
        } else
            return '' + errorSource;
    }

    // ========================================================================================================================

    /** Extends a based type prototype by chaining a derived type's 'prototype' to the base type's prototype.
    * Note: Extending an already extended prototype will recreate the prototype connection again, pointing it to the new prototype.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    export function extend<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyBaseProperties: boolean = true): DerivedType {
        // ... create a prototype link for the given type ...
        function __() { this.constructor = derivedType; }
        __.prototype = baseType.prototype;
        // ... copy any already defined properties in the derived prototype to be replaced, if any ...
        var newProto: NativeTypes.IObject = new (<any>__)();
        for (let p in derivedType.prototype)
            if (derivedType.prototype.hasOwnProperty(p))
                newProto[p] = derivedType.prototype[p];
        // ... set the new prototype ...
        derivedType.prototype = newProto;
        // ... finally, copy forward any static properties ...
        if (copyBaseProperties)
            for (let p in baseType)
                if (baseType.hasOwnProperty(p))
                    (<FunctionEx><any>derivedType)[p] = (<FunctionEx><any>baseType)[p];
        // ... return the extended derived type ...
        return derivedType;
    };

    // ========================================================================================================================
}

FlowScript.safeEval = function (exp: string, p1?: any, p2?: any, p3?: any): any { return eval(exp); };
// (note: this allows executing 'eval' outside the private FlowScript scopes, and also allows passing arguments scoped only to the request [without polluting the global scope])

FlowScript.evalGlobal = function (exp: string): any { return (<any>FlowScript.global).eval(exp); }; // http://perfectionkills.com/global-eval-what-are-the-options/#windoweval

// ############################################################################################################################
// Notes: 
//
//   Rendered expressions currently all dump values into a rolling value; doesn't seem to be much of a performance problem at all: http://jsperf.com/expression-vs-expression-assignment
//
