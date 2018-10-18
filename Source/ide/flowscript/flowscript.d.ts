interface Array<T> {
    last: () => T;
    first: () => T;
    append: (items: Array<T>) => Array<T>;
    select: <T2>(selector: {
        (item: T): T2;
    }) => Array<T2>;
    where: (selector: {
        (item: T): boolean;
    }) => Array<T>;
}
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
declare var FlowScript_debugging: boolean;
/** The base namespace for all FlowScript types. */
declare namespace FlowScript {
    var undefined: any;
    module NativeTypes {
        interface IFunction extends Function {
        }
        interface IObject extends Object {
        }
        interface IArray<T> extends Array<T> {
        }
        interface IString extends String {
        }
        interface INumber extends Number {
        }
        interface IBoolean extends Boolean {
        }
        interface IRegExp extends RegExp {
        }
        interface IDate extends Date {
        }
        interface IIMath extends Math {
        }
        interface IError extends Error {
        }
        interface IXMLHttpRequest extends XMLHttpRequest {
        }
        interface IHTMLElement extends HTMLElement {
        }
        interface IWindow extends Window {
        }
    }
    module NativeStaticTypes {
        var StaticFunction: typeof Function;
        var StaticObject: typeof Object;
        var StaticArray: typeof Array;
        var StaticString: typeof String;
        var StaticNumber: typeof Number;
        var StaticBoolean: typeof Boolean;
        var StaticRegExp: typeof RegExp;
        var StaticDate: typeof Date;
        var StaticMath: typeof Math;
        var StaticError: typeof Error;
        var StaticXMLHttpRequest: typeof XMLHttpRequest;
        var StaticHTMLElement: typeof HTMLElement;
        var StaticWindow: typeof Window;
    }
    interface IStaticGlobals extends Window {
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
        XMLHttpRequest: typeof NativeStaticTypes.StaticXMLHttpRequest;
        HTMLElement: typeof NativeStaticTypes.StaticHTMLElement;
        Window: typeof NativeStaticTypes.StaticWindow;
    }
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
      * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
      */
    var global: IStaticGlobals;
    /** A simple function that does nothing (no operation).
      * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
      * or when replacing the 'FlowScript.Loader.bootstrap()' function, which should only ever need to be called once.
      */
    function noop(): void;
    /** Evaluates a string in a function at the global scope level. This is more secure for executing scripts without exposing internal private/protected
      * variables wrapped in closures.  This also allows passing arguments scoped only to the request without polluting the global scope.
      */
    function safeEval(exp: string, ...args: any[]): any;
    /** Evaluates a string at the global scope level.
      */
    function evalGlobal(exp: string): any;
    /** If true (set by developer), then the web storage is cleared on each run.  Other implantation specific debug features may also become enabled.
    * If running in a browser, adding "debug=true" to the page's query string will also cause this value to become true.
    */
    var debugging: boolean;
    enum Environments {
        /** Represents the FlowScript client core environment. */
        Browser = 0,
        /** Represents the FlowScript worker environment (where applications and certain modules reside). */
        Worker = 1,
        /** Represents the FlowScript server environment. */
        Server = 2
    }
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of iNet OS runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    var Environment: Environments;
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    module Browser {
        /** A list of browsers that can be currently detected. */
        enum BrowserTypes {
            /** Browser is not yet detected, or detection failed. */
            Unknown = 0,
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            None = -1,
            IE = 1,
            Chrome = 2,
            FireFox = 3,
            Safari = 4,
            Opera = 5,
            Netscape = 6,
            OmniWeb = 7,
            iCab = 8,
            Konqueror = 9,
            Camino = 10
        }
        /** A list of operating systems that can be currently detected. */
        enum OperatingSystems {
            /** OS is not yet detected, or detection failed. */
            Unknown = 0,
            Windows = 1,
            Mac = 2,
            Linux = 3,
            iOS = 4
        }
        /** Holds detection parameters for a single browser agent string version.
        * Note: This is agent string related, as the version number itself is pulled dynamically based on 'versionPrefix'.
        */
        interface BrowserAgentVersionInfo {
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
        interface BrowserInfo {
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
        interface OSInfo {
            name: string;
            identity: OperatingSystems;
        }
        /** Holds a reference to the agent data detected regarding browser name and versions. */
        var browserVersionInfo: BrowserAgentVersionInfo;
        /** Holds a reference to the agent data detected regarding the host operating system. */
        var osInfo: OSInfo;
        /** The name of the detected browser. */
        var name: string;
        /** The browser's vendor. */
        var vendor: string;
        /** The operating system detected. */
        var os: OperatingSystems;
        /** The browser version detected. */
        var version: number;
        /** The type of browser detected. */
        var type: BrowserTypes;
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize(): {
            width: number;
            height: number;
        };
    }
    /** Used with 'FlowScript.log(...)' to write to the host console, if available. */
    enum LogMessageTypes {
        Message = 0,
        Info = 1,
        Warning = 2,
        Error = 3,
        Debug = 4,
        Trace = 5
    }
    /** Logs the message to the console (if available) and returns it. */
    function log(msg: any, msgType?: LogMessageTypes, throwOnError?: boolean): any;
    interface ICallerArguments {
        [index: number]: any;
        [name: string]: any;
    }
    interface IContextArguments {
        [index: number]: string;
        [name: string]: any;
    }
    interface ICallableComponent {
        (ctx: RuntimeContext): RuntimeContext;
    }
    interface IFunctionalComponentMetadata {
        /** The currently active context for this functional component type. */
        context: RuntimeContext;
        /** The named parameters expected by this functional component. */
        parameterNames: string[];
    }
    /** A simple class used make working with the script easier during runtime. */
    class RuntimeScript {
        [index: string]: any;
        /** The root component for the functional component tree. */
        types: {
            [index: string]: any;
        };
        /** Holds global variables. */
        globals: {
            [index: string]: any;
        };
        constructor(properties: {
            [index: string]: any;
        });
        /** Returns a namespace object based on the safe full type path. */
        getType(safeFullTypePath: string): any;
    }
    /** Each component call gets a dedicated context, or loads one from a pool.  A context contains the input and output
      * properties.  Local vars that are not parameters are persistent, so data can be retained between calls if needed.
      */
    class RuntimeContext {
        [prop: string]: any;
        previous: RuntimeContext;
        next: RuntimeContext;
        /** Parameters, local variables, and return variables are all stored in this object.  This is similar behavior to
          * parameters and local variables all existing on the same local scope. Variables get updated by incoming caller
          * arguments, and those matching the declared return names are passed on as needed.
          * The numerical index and length property are used to store the property names of the supplied caller arguments.  This
          * is to support "rest" parameters where the number of arguments are unknown ahead of time.
          */
        arguments: IContextArguments;
        argumentLength: number;
        constructor(previous: RuntimeContext);
        getNextContext(compFunc: IFunctionalComponentMetadata, callerArgCount: number): RuntimeContext;
        /** Sets argument values based on the properties of the supplied object.
          * If the source object has numerical indexes, then the corresponding context property name for that index will be updated.
          */
        setArguments(source: {}): void;
        /** Resets the current context arguments and any error state to 'undefined'. */
        reset(): RuntimeContext;
        /** If a component returns a value other than 'undefined'/'null', it is assumed to be an error value - which is usually either a string or error object.
          */
        error: any;
        /** The even handler callback blocks provided for this calling context.
          */
        eventHandlers: {
            [eventName: string]: ICallableComponent[];
        };
    }
    module Utilities {
        /** Creates and returns a new version-4 (randomized) GUID/UUID (globally unique identifier). The uniqueness of the
          * result is enforced by locking the first part down to the current local date/time (not UTC) in milliseconds, along
          * with a counter value in case of fast repetitive calls. The rest of the ID is also randomized with the current local
          * time, along with a checksum of the browser's "agent" string and the current document URL.
          * This function is also supported server side; however, the "agent" string and document location are fixed values.
          * @param hyphens (boolean) Default is true, which adds hyphens.
          */
        function createGUID(hyphens?: boolean): string;
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
        function dereferencePropertyPath(path: string, origin?: {}, unsafe?: boolean): {};
        /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
        * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
        * @param {Function} func The function to call '.apply()' on.
        * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
        * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
        * @param {any} args The arguments to apply to given function reference (the 'func' argument).
        */
        function apply(func: Function, _this: Object, args: any[]): any;
        /** Erases all properties on the object, instead of deleting them (which takes longer).
        * @param {boolean} release If false, then care is taken not to erase any property that contains a 'dispose()' function. (default: true)
        *                          This is provided to support reconstructing nested object groups without needing to rebuild the associations.
        */
        function erase(obj: {
            [name: string]: any;
        }, release?: boolean): {};
        /** Replaces one string with another in a given string.
        * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
        * faster in Chrome, and RegEx based 'replace()' in others.
        */
        function replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
        /** Replaces all tags in the given 'html' string with 'tagReplacement' (an empty string by default) and returns the result. */
        function replaceTags(html: string, tagReplacement?: string): string;
        /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
        * specified fixed length, then the request is ignored, and the given string is returned.
        * @param {any} str The string to pad.
        * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
        * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
        * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
        */
        function pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string;
        /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
        * Note: If any argument is not a string, the value is converted into a string.
        */
        function append(source: string, suffix?: string, delimiter?: string): string;
        /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
        * Note: If any argument is not a string, the value is converted into a string.
        */
        function prepend(source: string, prefix?: string, delimiter?: string): string;
        var FUNC_NAME_REGEX: RegExp;
        /** Attempts to pull the function name from the function reference, and returns 'undefined' (void 0) for anonymous functions. */
        function getFunctionName(func: Function): string;
        module RegEx {
            /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
            function escapeRegex(regExStr: string): string;
        }
        module Encoding {
            enum Base64Modes {
                /** Use standard Base64 encoding characters. */
                Standard = 0,
                /** Use Base64 encoding that is compatible with URIs (to help encode query values). */
                URI = 1,
                /** Use custom user-supplied Base64 encoding characters (the last character is used for padding, so there should be 65 characters total).
                * Set 'Security.__64BASE_ENCODING_CHARS_CUSTOM' to your custom characters for this option (defaults to standard characters).
                */
                Custom = 2
            }
            var __64BASE_ENCODING_CHARS_STANDARD: string;
            var __64BASE_ENCODING_CHARS_URI: string;
            var __64BASE_ENCODING_CHARS_CUSTOM: string;
            /** Applies a base-64 encoding to the a value.  The characters used are selected based on the specified encoding 'mode'.
            * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
            * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
            * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
            * @param (boolean) usePadding If true (default), Base64 padding characters are added to the end of strings that are no divisible by 3.
            *                             Exception: If the mode is URI encoding, then padding is false by default.
            */
            function base64Encode(value: string, mode?: Base64Modes, usePadding?: boolean): string;
            /** Decodes a base-64 encoded string value.  The characters used for decoding are selected based on the specified encoding 'mode'.
            * The given string is scanned for character values greater than 255 in order to auto detect the character bit depth to use.
            * @param (string) value The string value to encode.  If the value is not a string, it will be converted to one.
            * @param (Base64Modes) mode Selects the type of encoding characters to use (default is Standard).
            */
            function base64Decode(value: string, mode?: Base64Modes): string;
        }
        module HTML {
            function uncommentHTML(html: string): string;
            function getCommentText(html: string): string;
            function getScriptCommentText(html: string): string;
            function clearChildNodes(node: Node): Node;
        }
        module Data {
            module JSON {
                /** Converts a JSON string into an object, with nested objects as required.
                  * The JSON format is validated first before conversion.
                  */
                function parse(jsonText: string): any;
                function stringify(data: any): string;
            }
        }
    }
    /** Network communication utilities. */
    module Net {
        interface IHTTPRequestListener<T extends HTTPRequest> {
            (request: T, ev?: Event): void;
        }
        interface IHTTPRequestPayload {
            [index: string]: any;
        }
        /** Represents an HTTP request object.  The design is (very loosely) made similar to "promise" semantics, and as such,
          * the member function calls can be chained.
          */
        class HTTPRequest {
            url: string;
            /** HTTP send method. (ex: 'GET', 'POST', 'PUT', 'DELETE', etc.) */ method: string;
            /** Expected response type. (ex: 'json', 'text' [or '', defaults to text], 'blob', 'document', 'arrayBuffer', etc.) */ responseType: XMLHttpRequestResponseType;
            xhr: XMLHttpRequest;
            formData: FormData;
            prev: HTTPRequest;
            next: HTTPRequest;
            private _onerror;
            private _onloaded;
            delay: number;
            sent: number;
            /** Set to true upon successful loading of the resource. */
            loaded: boolean;
            /** A user defined value for state tracking, caller instance referencing, etc. */
            userState: any;
            constructor(url: string, payload?: IHTTPRequestPayload, 
            /** HTTP send method. (ex: 'GET', 'POST', 'PUT', 'DELETE', etc.) */ method?: string, 
            /** Expected response type. (ex: 'json', 'text' [or '', defaults to text], 'blob', 'document', 'arrayBuffer', etc.) */ responseType?: XMLHttpRequestResponseType);
            _doOnLoaded(ev: Event): void;
            _doOnError(ev: Event): void;
            thenLoad(url: string, payload?: {
                [index: string]: any;
            }, delay?: number, method?: string, responseType?: XMLHttpRequestResponseType): HTTPRequest;
            onloaded(func: IHTTPRequestListener<HTTPRequest>): HTTPRequest;
            onerror(func: IHTTPRequestListener<HTTPRequest>): HTTPRequest;
            /** Starts the first or next request in the series. */
            send(): HTTPRequest;
            protected _doXHRSend(): void;
            /** Queues the next request following this request to be sent, if any. */
            sendNext(): boolean;
        }
        enum CacheMode {
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
        class CachedRequest extends HTTPRequest {
            cacheMode: CacheMode;
            /** An optional name to group the cached responses under. Version changes will affect only the cache under the app name. */ appName?: string;
            /** Used to clear the cache when the application version changes.*/ appVersion?: string;
            result: string;
            constructor(url: string, payload?: IHTTPRequestPayload, cacheMode?: CacheMode, 
            /** An optional name to group the cached responses under. Version changes will affect only the cache under the app name. */ appName?: string, 
            /** Used to clear the cache when the application version changes.*/ appVersion?: string);
            send(): CachedRequest;
            _doOnLoaded(ev: Event): void;
            protected _doXHRSend(): void;
            onloaded(func: IHTTPRequestListener<CachedRequest>): CachedRequest;
            onerror(func: IHTTPRequestListener<CachedRequest>): CachedRequest;
            thenLoad(url: string, payload?: {
                [index: string]: any;
            }, delay?: number): CachedRequest;
        }
        /** A very simple function to load text via a1 URL (text files, web pages, JSON files, etc).
          *
          */
        function get(url: string, payload?: IHTTPRequestPayload, cacheMode?: CacheMode, appName?: string, appVersion?: string): CachedRequest;
    }
    /** Web storage utilities. */
    module Storage {
        /** Set to true if local storage is available. */
        var hasLocalStorage: boolean;
        /** Set to true if session storage is available. */
        var hasSessionStorage: boolean;
        enum StorageType {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            Local = 0,
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            Session = 1
        }
        function getStorage(type: StorageType): Storage;
        /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
        var delimiter: string;
        var storagePrefix: string;
        function makeKeyName(appName: string, dataName: string): string;
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
        function set(type: StorageType, name: string, value: string, appName?: string, appVersion?: string, dataVersion?: string): boolean;
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
        function get(type: StorageType, name: string, appName?: string, appVersion?: string, dataVersion?: string): string;
        /** Clear all FlowScript data from the specified storage (except save project data). */
        function clear(type: StorageType): void;
    }
    /** Returns the call stack for a given error object. */
    function getErrorCallStack(errorSource: {
        stack?: string;
    }): string[];
    /** Returns the message of the specified error source by returning either 'errorSource' as is, if a string, or
      * 'errorSource.message' if exits.
      */
    function getErrorMessage(errorSource: any): string;
    /** Extends a based type prototype by chaining a derived type's 'prototype' to the base type's prototype.
    * Note: Extending an already extended prototype will recreate the prototype connection again, pointing it to the new prototype.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    function extend<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyBaseProperties?: boolean): DerivedType;
}
declare namespace FlowScript {
    interface ISavedTrackableObject {
        id: string;
        type: string;
    }
    interface IUnreconciledReference {
        /** The ID of an object not yet in the system. */
        id: string;
        /** The instance reference of the object once loaded. */
        reconciledObject: any;
        /** A list of objects and properties [by names or numeric indexes] to be updated when the reference becomes available. */
        updateTargets: {
            target: {};
            propertyName: string;
        }[];
        /** Callbacks to execute which are waiting on an object to be loaded. Usually 'updateTargets' is good enough.  Call-backs are for any special cases. */
        callbacks: {
            (ref: IUnreconciledReference): void;
        }[];
    }
    /** Provides properties and methods for tracking objects for save and load operations. */
    class TrackableObject {
        static objects: {
            [id: string]: any;
        };
        static register(obj: TrackableObject): string;
        static unreconciledQueue: IUnreconciledReference[];
        _id: string;
        _type: string;
        /** The script instance this object belongs to. Derived types should override this to return the proper reference. */
        readonly script: IFlowScript;
        protected _script: IFlowScript;
        constructor(script?: IFlowScript);
        save(target?: ISavedTrackableObject): ISavedTrackableObject;
    }
    interface ITemplateType {
        name: string;
        expectedBaseType: Type;
        defaultType: Type;
    }
    interface ISavedType extends ISavedTrackableObject {
        name: string;
        comment: string;
        nestedTypes: ISavedType[];
    }
    /** The base class for all type objects, which contains meta data describing types within a namespace.
      * Note: Each name in namespace path is created by using empty type objects.
      */
    class Type extends TrackableObject {
        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to "Any", but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types; however, some
          * internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        static All: Core.All;
        /** Use internally with component return types to infer the resulting type based on given arguments. */
        static Inferred: Core.Inferred;
        /** A user defined visual element to associate with this component. This is not used internally. */
        visualElement: HTMLElement;
        /** A user defined arbitrary value to associate with this component. This is not used internally. */
        tag: any;
        /** Returns a reference to the parent type.  If there is no parent, or the parent is the script root namespace, then 'null' is returned.
          * Note: Every type has a reference to the underlying script, which is the root namespace for all types.
          * Derived types take note: '_parent' is NOT null at the first type when traversing the type hierarchy.  The 'parent' getter property should be used.
          */
        /** Sets a new parent type for this type.  The current type will be removed from its parent (if any), and added to the given parent. */
        parent: Type;
        private _parent;
        /** Traverses up to the root to find and return the script, which is root namespace for all types. */
        readonly script: IFlowScript;
        /** A developer comment for this type. */
        comment: string;
        /** A reference to an inherited type, if any.  Some types (such as objects) inherit properties from their super types if specified. */
        superType: Component;
        private _superType;
        /** The nested child types under this type. */
        readonly nestedTypes: Type[];
        protected _nestedTypes: Type[];
        /** A named index of each nested child type. */
        readonly nestedTypesIndex: {
            [index: string]: Type;
        };
        protected _nestedTypesIndex: {
            [index: string]: Type;
        };
        /** Holds a list of template parameters required for template component types. */
        readonly templateTypes: ITemplateType[];
        protected _templateTypes: ITemplateType[];
        name: string;
        private _name;
        /** Returns a name that is safe to use as a normal identifier for this type (using characters that will support direct dot access - used with code output rendering). */
        readonly safeName: string;
        /** Return the parent namespace for this type.
          * Namespaces group "like minded" components together - usually those that operate on related data types.
          */
        readonly namespace: string;
        /** Return the parent "safe" namespace for this type (using characters that will support direct dot access - used with code output rendering).
          * Namespaces group "like minded" components together - usually those that operate on related data types.
          */
        readonly safeNamespace: string;
        /** The full namespace + type name. */
        readonly fullTypeName: string;
        /** The full "safe" namespace + type name (using characters that will support direct dot access - used with code output rendering). */
        readonly safeFullTypeName: string;
        /** Creates a new type object, which also acts as a namespace name in a type graph.
          * @param {Type} parent The parent type of this type, or 'null' if this is the root type.
          * @param {string} name The name for this type.
          * @param {IFlowScript} script (optional) The script to associate with this type if there is no parent.  If a parent is specified, this is ignored.
          */
        constructor(parent: Type, name: string, script?: IFlowScript);
        /**
         * Initialize the sub-type derived from this base type, including all child types.
         * This allows to first construct the type tree so references exist prior to configuring the types further.
         * Note: You MUST call this base type from the derived type to continue to call 'init()' on all child types as well.
         */
        init(): void;
        save(target?: ISavedType): ISavedType;
        /** Returns a string that identifies the signature of the given types combined. This is used internally for mapping purposes. */
        static getCompositeTypeKey(...compositeTypes: Type[]): string;
        /** Returns a string that identifies the signature of the given types combined. This is used internally for mapping purposes. */
        static getCompositeTypeKey(compositeTypes: Type[]): string;
        /** Returns true if the given type matches this type *exactly* (that means, for instance, "Any" does NOT match "String").
          * If the underlying type or the given type is of the special internal "All" type, then true is always returned.
          */
        is(type: Type): boolean;
        /** Returns true if the current type can be assigned TO the specified type.
          * If this type or the given type is of "Any" type, then true is always returned.
          * This function must be overloaded to provide specialized results.  When overriding, instead of returning false, make
          * sure to transfer the call to the super function to allow parent types in the hierarchy to validate as well.
          * There's no need to overload this for object type inheritance.  The default implementation already checks the super types.
          */
        assignableTo(type: Type): boolean;
        /** Returns true if the given type can be assigned to the current type.
          * If this type or the given type is of "Any" type, then true is always returned.
          * Note: Don't override this function.  If needed, override "assignableTo()" (see the type info for more details).
          * See also: assignableTo()
          */
        assignableFrom(type: Type): boolean;
        /** Checks if a type exists.  You can also provide a nested type path.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        exists(name: string, ignore?: Type): boolean;
        /** Checks if the given type exists under this type.
          */
        exists(type: Type, ignore?: Type): boolean;
        /** Resolves a type path under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          * @param {function} requiredType A required type reference that the returned type must be an instance of.
          */
        resolve<T extends {
            new (...args: any[]): any;
        }>(typePath: string, requiredType?: T): Type;
        /** Adds the given type under this type.
          */
        add<T extends Type>(type: T): T;
        /** Adds a new namespace name under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        add(name: string): Type;
        remove<T extends Type>(type: T): T;
        /** removes a type under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        remove(name: string): Type;
        /** Sets a type for template types using the given name, default type, and any expected based type (as a constraint).
          * This only works for types that represent templates.
          */
        defineTemplateParameter(name: string, defaultType?: Type, expectedBaseType?: Type): Type;
        /** Creates a type from this template type using the supplied types.  This only works for types that represent templates. */
        createTemplateType(templateTypes: Type[]): Type;
        toString(): string;
        valueOf(): string;
    }
    interface IReferencedObject {
        referenceStr: string;
        getReference(): NamedReference<{}>;
    }
    /**
     * References types in the type tree. This is used to track types, instead of pointers, since types can be deleted and
     * recreated, invalidating all references to the deleted type object.  A named reference uses a root object, and a
     * dot-delimited name to the referenced object.
     */
    class NamedReference<T extends {}> {
        root: {};
        path: string;
        /**
         * Creates a new reference.
         * @param root The object the is the root to resolve the named path against.
         * @param path Dot-delimited names that are the path to the value pointed to by this reference.
         */
        constructor(root: {}, path: string);
        toString(): string;
        valueOf(): T;
        /** Returns true if this reference represents a null/empty reference. */
        readonly isNull: boolean;
    }
    module Core {
        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to "Any", but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types; however, some
          * internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        class All extends Type {
            constructor();
            assignableTo(type: Type): boolean;
        }
        class Event extends Type {
            constructor(parent: Type);
            assignableTo(type: Type): boolean;
        }
        class Inferred extends Type {
            constructor();
            assignableTo(type: Type): boolean;
        }
    }
}
declare namespace FlowScript {
    /** The base namespace for all user apps (i.e. "FlowScript.Apps.MyCompanyOrWebsite.MyApp").
      * Make sure to create a unique sub module to prevent conflicts.
      */
    module Apps {
    }
    interface IEventDispatcher<TOwner extends {}> {
        target: TOwner;
    }
    interface IEventDispatcherHandler {
        (...args: any[]): any;
    }
    interface IEventDispatcherHandlerInfo<TOwner extends {}> {
        handler: IEventDispatcherHandler;
        removeOnTrigger: boolean;
        data: any;
    }
    /** Represents an event dispatcher manager. */
    class EventDispatcher<TOwner extends {}, THandler extends IEventDispatcherHandler> implements IEventDispatcher<TOwner> {
        synchronous: boolean;
        readonly target: TOwner;
        private _owner;
        protected _handlers: IEventDispatcherHandlerInfo<TOwner>[];
        /** Constructs a new event dispatcher.
          * If 'synchronous' is false (default), then a 'setTimeout()' if 0 is used to trigger events.  This allows following
          * code to complete before events trigger, as objects can be created and attached before they get configured.  If
          * 'synchronous' is true, calling 'trigger()' calls all event handlers immediately.
          */
        constructor(owner: TOwner, synchronous?: boolean);
        /** Locate the index of a handler by function reference. */
        indexOf(func: THandler): number;
        /** Add a handler for this event dispatcher.  If the function already exists, the current entry is updated. */
        add(func: THandler, data?: any, removeOnTrigger?: boolean): IEventDispatcherHandlerInfo<TOwner>;
        /** Remove a handler from this event dispatcher. */
        remove(func: THandler): IEventDispatcherHandlerInfo<TOwner>;
        /** Remove all handlers from this event dispatcher. */
        clear(): void;
        /** Trigger this event by calling all the handlers. */
        trigger: THandler;
        static _ctor: void;
    }
    interface IParented {
        _parent: {};
    }
    /** Represents a single FlowScript instance. Each instance wraps a single "main" script block. Multiple scripts will have multiple 'IFlowScript' instances. */
    interface IFlowScript extends Type {
        /** The root type for all other types. */
        System: Core.System;
        /** The main entry component.  When the script starts, this is the first component run. */
        Main: Component;
        /** Resolves a type path under this script.  Script instances are the root of all namespaces and types.
          * Examples: 'System', 'System.String', 'Main' (for the main entry component), 'Tests' (default namespace for test components), etc.
          * @param {function} requiredType A required type reference that the returned type must be an instance of.
          */
        resolve<T extends {
            new (...args: any[]): any;
        }>(typePath: string, requiredType?: T): Type;
        /** Loads a script by URL. The URL should return JSON. Once loaded and deserialized into nested objects, the object
          * tree is passed to 'load()' again.
          */
        load(urlOrJSON?: string): void;
        /** Load from the root object of a deserialized JSON string. */
        load(root: ISavedScript): void;
        /** Saves the script to a nested tree of objects that can be later serialized to JSON if desired, or just stored in an
          * array as a reference for later (i.e. for undo operations, etc.).
          */
        save(target?: ISavedScript): ISavedScript;
        /** Saves the script to data objects (calls this.save()) and uses the JSON object to serialize them into a string. */
        serialize(): string;
        /** Serializes and saves this script to local storage under a specified name. The storage key name is returned.
          * @param {string} projectName The name of the project this script should be saved under.
          * @param {string} scriptName A script name, or null/undefined to use the default name "Script" (which assumes the
          * working script for the project).
          * @param {string} scriptVersion An optional version identifier. It allows multiple versions of scripts with the same name.
          */
        saveToStorage(projectName: string, scriptName?: string, scriptVersion?: string | number): string;
        /** Run the script with the supplied arguments. */
        run(args: ICallerArguments): RuntimeContext;
        /** Returns a compiler to use with this script instance.
          * Note: The returned 'Compiler' instance will wrap the current 'main' instance. As such, changing the 'main' property
          * on this 'IFlowScript' instance afterwards will have no affect on the returned compiler object.
          */
        getCompiler(): Compiler;
        getCompiler<T extends Compiler>(comp: {
            new (script: IFlowScript, ...args: any[]): T;
        }): T;
        /** Compile the script into JavaScript starting at the specified "main" component property. */
        compile(): string;
        /** Registers a message in a message table. Including a unique ID in the message object will allow easy exporting and
          * maintenance of translations.
          */
        registerMessage(message: Message): Message;
        /** Registers a message in a message table. Supplying unique message IDs will allow for easy exporting and maintenance
          * of translations.
          */
        registerMessage(defaultMessagePattern: string, id?: string): Message;
    }
    interface ISavedScript extends ISavedType {
        url: string;
        system: ISavedType;
        main: ISavedComponent;
    }
    function isFlowScriptObject(value: any): boolean;
    module Storage {
        var projectSaveDataSuffix: string;
        function makeProjectDataKeyName(projectName: string, dataTypeName: string, version?: string | number): string;
        /** Saves project data and returns a storage key that can be used to pull the data directly. */
        function saveProjectData(projectName: string, dataTypeName: string, value: string, version?: string | number): string;
        /** Loads project data. */
        function loadProjectData(projectName: string, dataTypeName: string, version?: string | number): string;
        interface ISavedProjectDataInfo {
            projectName: string;
            dataName: string;
            version: string;
            toString: typeof Object.prototype.toString;
        }
        function getSavedProjectDataList(): ISavedProjectDataInfo[];
    }
    /** Creates a new empty script instance. */
    function createNew(): IFlowScript;
    /** Creates a new script instance from a given URL. */
    function createFrom(url: string): IFlowScript;
    /** Returns a simple checksum from a given string. */
    function getChecksum(text: string): number;
    /** Copies an object's own instance properties to another target object. */
    function copyProperties(source: {
        [name: string]: any;
    }, target?: {
        [name: string]: any;
    }): {};
    /** Copies an object's own instance properties to another target object. */
    function copyProperties(source: {
        [index: number]: any;
    }, target?: {
        [index: number]: any;
    }): {};
    function isObjectEmpty(obj: {}): boolean;
}
declare namespace FlowScript {
    /** A map that stores the argument name under a fixed index, and the expression object under the name. */
    interface IArgumentMap {
        [index: number]: string | any;
        [name: string]: Expression;
    }
    /** Returns the expression for a component given either the fixed argument index or name. */
    interface IComponentReferenceArgs {
        [index: number]: Expression;
        [name: string]: Expression;
    }
    interface ISavedExpressionArgs {
        arguments: {
            [index: number]: any;
            [name: string]: ISavedExpression;
        };
    }
    class ExpressionArgs {
        /** The ComponentReference that these arguments belong to. */
        readonly owner: ComponentReference;
        private _owner;
        /** The component that is the underlying subject of the component reference. */
        readonly source: Component;
        readonly args: IArgumentMap;
        private _args;
        readonly isEmpty: boolean;
        constructor(owner: ComponentReference);
        /** Returns the length of the arguments based on the highest index found in the existing numerical properties. */
        readonly length: number;
        apply(args: IComponentReferenceArgs): void;
        /**
      * Returns the numerical argument indexes found in the 'args' object as an array of integers.
      * This is sorted by default to make sure the numerical properties were iterated in order, unless 'sorted' is false.
      * Note: This call is much faster if sorting is not required.
      */
        getArgIndexes(sorted?: boolean): number[];
        /**
         * Returns the argument names found in this object as an array of strings.
         * This is sorted by default to make sure the argument names match the argument indexes, unless 'sorted' is false.
         * Note: This call is much faster if sorting is not required.
         */
        getArgNames(sorted?: boolean): string[];
        save(target?: ISavedExpressionArgs): ISavedExpressionArgs;
        /** Sets an expression's argument to a given expression and returns any previous value. */
        private _setArg;
        /** Sets an expression's argument to a given operational expression and returns the added expression. */
        setArg(argIndex: number, operation: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[]): ComponentReference;
        /** Sets an expression's argument to a given operational expression and returns the added expression. */
        setArg(argName: string, operation: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[]): ComponentReference;
        /** Sets an expression's argument to a given expression and returns the added expression. */
        setArg<T extends Expression>(argIndex: number, expression: T): T;
        /** Sets an expression's argument to a given expression and returns the added expression. */
        setArg(argName: string, expression: Expression): Expression;
        /** Returns the name of an argument given its argument index. */
        getArgName(argIndex: number, required?: boolean): string;
        /** Returns the argument expression given an argument index.
          * @param {number} index The index of the argument to get the expression for.
          * Note: This is one of the index values returned by 'getArgIndexes()', or at least on of the argument index numerical
          * values stored in this ExpressionArgs instance.
          */
        getArg(argIndex: number, required?: boolean): Expression;
        getArg(argName: string, required?: boolean): Expression;
        isArgSet(arg: number): boolean;
        isArgSet(arg: string): boolean;
        /** Removes an expression by argument name or reference. */
        removeArgument(name: string): Expression;
        /** Removes an expression by argument name or reference. */
        removeArgument(index: number): Expression;
        /** Removes an expression by argument name or reference. */
        removeArgument(expr: Expression): Expression;
        /** Removes all arguments. */
        clear(): void;
        containsExpression(expr: Expression): boolean;
        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
        clone(forExpr: ComponentReference): ExpressionArgs;
    }
    interface IReturnTargetMap {
        source: Expression;
        target: PropertyReference;
    }
    class ReturnTargetMap implements IReturnTargetMap {
        source: Expression;
        target: PropertyReference;
        constructor(source: Expression, target: PropertyReference);
    }
    interface ISavedReturnTargetMap {
        source: ISavedExpression;
        target: ISavedExpression;
    }
    interface ISavedReturnTargetMaps {
        returnTargets: ISavedReturnTargetMap[];
    }
    class ReturnTargetMaps {
        /** The expression that these arguments belong to. */
        readonly owner: ComponentReference;
        private _owner;
        /** The component that is the return target for the owning expression. */
        readonly source: Component;
        /** Returns an array of maps between a given expression, and a target property on the calling component context. */
        readonly maps: IReturnTargetMap[];
        protected _maps: IReturnTargetMap[];
        readonly isEmpty: boolean;
        constructor(owner: ComponentReference);
        addTarget(source: Expression, target: PropertyReference): void;
        addTargetMap(targetMap: IReturnTargetMap): void;
        addTargetMaps(targets: IReturnTargetMap[]): void;
        indexOfReturnTarget(target: PropertyReference): number;
        mapReturnTarget(source: Expression, target: PropertyReference): void;
        save(target?: ISavedReturnTargetMaps): ISavedReturnTargetMaps;
        /** Removes a return value mapping. */
        removeReturn(name: string): Expression;
        /** Removes a return value mapping. */
        removeReturn(index: number): Expression;
        /** Removes a return value mapping. */
        removeReturn(prop: Expression): Expression;
        /** Removes all return mappings. */
        clear(): void;
        containsExpression(expr: Expression): boolean;
        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
        clone(forExpr: ComponentReference): ReturnTargetMaps;
    }
    interface IAvailableProperty {
        /** The parent expression that is the source for this selectable property. */
        source: any;
        /** A property that the user can use as an argument. */
        property: Property;
    }
    /** Returns true if the given value is numeric (a number type, or string with digits only [i.e. '0'...'10'...etc.; '+1.0' is invalid]).
     * This function is optimized to test as quickly as possible. For example, 'true' is returned immediately if 'value' is a number type.
     */
    function isValidNumericIndex(value: string | number): boolean;
    interface ISavedExpression extends ISavedTrackableObject, ISavedReturnTargetMaps, ISavedExpressionArgs {
        comment: string;
    }
    /** The smallest executable element within FlowScript which specifies some action to be carried out.
     * An expression (in FlowScript) usually encompasses a component reference, arguments, return value targets, and event handlers.
     */
    class Expression extends TrackableObject {
        /** A regex used to test for numerical indexes. See 'isValidNumericIndex()' also. */
        static NUMERIC_INDEX_REGEX: RegExp;
        /** A regex used to test for valid identifiers for the system. */
        static VALID_IDENTIFIER_REGEX: RegExp;
        readonly parent: Expression;
        protected _parent: Expression;
        readonly script: IFlowScript;
        /** A developer comment for this expression. */
        comment: string;
        /** Returns the functional component this expression belongs to, or null otherwise.
          * Functional components (components that usually render to final code in some way [i.e. functions, operations, etc.])
          * have blocks with lines consisting of statements and expressions.  This function searches the parent expression tree
          * for the nearest functional component.
          */
        readonly functionalComponent: Component;
        /** The statement this expression belongs to, or null otherwise. */
        readonly statement: Statement;
        /** The line this expression belongs to, or null otherwise. */
        readonly line: Line;
        /** Return the nearest containing block expression if any, or null otherwise. */
        readonly blockExpression: BlockReference;
        /** The block this expression belongs to, or null otherwise (simple shortcut for getting the 'blockExpression.block' reference). */
        readonly block: Block;
        /** Return the nearest containing property expression if any, or null otherwise. */
        readonly propertyExpression: PropertyReference;
        /** The property this expression is under, or null otherwise (simple shortcut for getting the 'propertyExpression.property' reference). */
        readonly property: Property;
        /** The component that this expression references, or null if the expression doesn't reference components. */
        readonly component: Component;
        constructor(parent?: Expression);
        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        containsChildExpression(expr: Expression): boolean;
        save(target?: ISavedExpression): ISavedExpression;
        /** Copy this expression to a new expression instance for use elsewhere.
          * Since it is not permitted to use expression references in multiple places, a new instance is always required.
          * Closing expressions is a convenient way to duplicate expressions for use in multiple places.
          * Alternatively, an ExpressionReference object can reference other expressions.
          */
        clone<T extends Expression>(parent?: Expression): T;
        protected _clone(parent?: Expression): Expression;
        /** Removes a child from the expression tree.  If the child is not found, null is returned, otherwise the removed expression is returned. */
        remove(child?: Expression): Expression;
        /** Removes self from the expression tree. */
        remove(): Expression;
        /** Calls 'expr.containsChildExpression(this)' on the given expression using 'this' expression and generates a cyclical error if found. */
        cyclicalCheck(expr: Expression): void;
        /** Returns the immediate parent "with" statement, or 'null' if none. */
        getParentWith(): Statement;
        /** Creates a visual tree snapshot for this expression object. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
    }
    interface ISavedExpressionReference extends ISavedExpression {
        expression: ISavedExpression;
    }
    /** References an expression for indirect use with other expressions. */
    class ExpressionReference extends Expression {
        /** The indirect expression that is referenced by this expression. */
        readonly expression: Expression;
        private _expr;
        constructor(expr: Expression, parent?: Expression);
        protected _clone(parent?: Expression): Expression;
        save(target?: ISavedExpressionReference): ISavedExpressionReference;
        load(target?: ISavedExpressionReference): ISavedExpressionReference;
        toString(): string;
    }
    interface ISavedConstant extends ISavedExpression {
        value: string;
        valueType: string;
    }
    /** A constant value expression.
      */
    class Constant extends Expression {
        value: any;
        constructor(value: any);
        protected _clone(parent?: Expression): Expression;
        save(target?: ISavedConstant): ISavedConstant;
    }
}
declare namespace FlowScript {
    /** Controls access to object instance properties.
      * Property access security only applies to instance properties of object-based components (components that encapsulate object creation).
      */
    enum PropertyAccessSecurity {
        /** (default) The property is only accessible by any component within the same project. */
        Internal = 0,
        /** The property is only accessible within the object-based component it is placed, and all nested functional components. */
        Private = 1,
        /** The property is only accessible within the object-based component it is placed, and all nested functional components, including those of derived types. */
        Protected = 2,
        /** The property is accessible by any component from any project. */
        Public = 3
    }
    /** Represents available options for component properties. */
    interface PropertyOptions {
        /** An initial value for this property, if any. */
        initialValue?: any;
        /** A optional regex used to validate this property upon update. */
        validation?: string;
        /** If true, this specifies that the property is optional (used with parameter properties only). */
        isOptional?: boolean;
        /** If true, this property exists in the functional component's static object scope. */
        isStatic?: boolean;
        /** If true, the property is immutable (cannot be changed). */
        isConst?: boolean;
        /** If true, the property represents a variable (and never a constant). These property types typically exist in operational components (non-functional). */
        isAlias?: boolean;
        /** If true, the property is an instance property for an object type component. */
        isInstance?: boolean;
        /** Specifies the type of access allowed for this property. */
        access?: PropertyAccessSecurity;
    }
    interface ISavedProperty extends ISavedTrackableObject {
        validTypes: string[];
        name: string;
        value: any;
        isConst: boolean;
        isStatic: boolean;
        isOptional: boolean;
        isAlias: boolean;
        isInstance: boolean;
        validationRegex: string;
        selections: string[];
        description: string;
        implicitlyDefined: boolean;
        explicitlyDefined: boolean;
        isFixedtoEnum: boolean;
        locked: boolean;
    }
    /** Properties are used with processes and components to store values.
     * In FlowScript, a component's parameters, static properties, and local variables are all in the same local scope.
     * Component properties define the context property names that will be used for that component during runtime.
     */
    class Property extends TrackableObject implements IReferencedObject {
        static DEFAULT_NAME: string;
        readonly script: IFlowScript;
        /** The component that this property is for. */
        readonly component: Component;
        /** A reference to the property collection that contains this property. */
        readonly collection: PropertyCollection;
        protected _collection: PropertyCollection;
        /** Valid acceptable types for this property. */
        _validTypes: Type[];
        readonly name: string;
        protected _name: string;
        /** An instance reference string that represents this block in the system. */
        readonly referenceStr: string;
        getReference(): NamedReference<Property>;
        _value: any;
        _isConst: boolean;
        _isStatic: boolean;
        _isOptional: boolean;
        _isAlias: boolean;
        _isInstance: boolean;
        _validationRegex: RegExp;
        _selections: string[];
        _description: string;
        /** True if this property was defined from a component title. */
        _implicitlyDefined: boolean;
        /** True if this property was defined using the scripting API (via code). */
        _explicitlyDefined: boolean;
        isFixedtoEnum: boolean;
        /** If true, then this property cannot be removed (perhaps a special case that relays on other states). */
        _locked: boolean;
        constructor(owner: PropertyCollection, validTypes: Type[], name: string, options?: PropertyOptions);
        /** Creates an expression wrapper for this property. An optional expression parent can be given. */
        createExpression(parent?: Expression): PropertyReference;
        save(target?: ISavedProperty): ISavedProperty;
        readonly validTypes: Type[];
        setValidTypes(...types: Type[]): Property;
        setDescription(desc: string): Property;
        readonly validationRegex: RegExp;
        validationRegexStr: string;
        _getIdentityMsg(): string;
        value: any;
        remove(): Property;
        toString(): string;
    }
    interface IPropertyCollectionHandler {
        (collection: PropertyCollection, p: Property, data?: any, ev?: IEventDispatcher<PropertyCollection>): void;
    }
    interface ISavedPropeties {
        properties: ISavedProperty[];
    }
    class PropertyCollection {
        readonly script: IFlowScript;
        readonly component: Component;
        protected _component: Component;
        private _properties;
        private _propertyNamedIndex;
        readonly length: number;
        private _length;
        _addedEvent: EventDispatcher<PropertyCollection, IPropertyCollectionHandler>;
        _removingEvent: EventDispatcher<PropertyCollection, IPropertyCollectionHandler>;
        _removedEvent: EventDispatcher<PropertyCollection, IPropertyCollectionHandler>;
        constructor(owner: Component, copyFrom?: PropertyCollection);
        /** Adds a callback that triggers just before a property is being removed. */
        onadded(func: IPropertyCollectionHandler, data?: any): void;
        protected _doOnAdded(p: Property): void;
        /** Adds a callback that triggers just before a property is being removed. */
        onremoving(func: IPropertyCollectionHandler, data?: any): void;
        protected _doOnRemoving(p: Property): void;
        /** Adds a callback that triggers just after a property is removed. */
        onremoved(func: IPropertyCollectionHandler, data?: any): void;
        protected _doOnRemoved(p: Property): void;
        /** Returns true if a property by the specified name already exists.
        * If 'ignore' is specified, that property is ignored. This is used to check new names for renaming purposes.
        */
        hasProperty(name: string, ignore?: Property): boolean;
        /** Returns true if the specified property exists in this collection.
        */
        hasPropertyReference(property: Property): boolean;
        /** Returns the index of the property that matches the specified name, or -1 if not found. */
        indexOf(name: string): number;
        /** Returns a property by name, or 'undefined' if not found. */
        getProperty(name: string): Property;
        /** Returns a property by numerical index, or 'undefined' if not found. */
        getProperty(index: number): Property;
        /** Adds a new property to the collection. */
        push(p: Property): Property;
        /** Adds a property to the collection, replacing any existing property of the same name (only allowed one explicit replace to help debugging). */
        replace(p: Property): Property;
        private _lockCheck;
        /** Remove a property by name. */
        remove(name: string): Property;
        /** Remove a property by numerical index. */
        remove(index: number): Property;
        /** Remove a related property by name. */
        remove(p: Property): Property;
        pop(): Property;
        unshift(p: Property): Property;
        shift(): Property;
        /** Clear all properties from this collection. */
        clear(): void;
        save(target?: ISavedPropeties): ISavedPropeties;
    }
    interface ISavedPropertyReference extends ISavedExpression {
        propertyPath: string;
    }
    /** References a component property for use in expressions. */
    class PropertyReference extends Expression {
        readonly script: IFlowScript;
        /** The property object that is referenced. */
        readonly property: Property;
        readonly propertyRef: NamedReference<Property>;
        private _propertyRef;
        /** The name of the referenced property. */
        readonly name: string;
        /** The component that the referenced property belongs to. */
        readonly component: Component;
        constructor(property: Property, parent?: Expression);
        protected _clone(parent?: Expression): Expression;
        save(target?: ISavedPropertyReference): ISavedPropertyReference;
        toString(): string;
    }
}
declare namespace FlowScript {
    interface IComponentFunction {
        (ctx: RuntimeContext): any;
    }
    enum ComponentTypes {
        /** The component exists for commenting purposes only. */
        Comment = 0,
        /** The component represents a single value cast or modification (like type casting, or 'not' inversion).
          * These components are expected to only accept one argument, and return one value.
          */
        Unary = 1,
        /** The component script will be parsed for an expression that can be nested in another expression.
          * These components are expected to only accept two arguments (like math and comparison operators).
          */
        Operation = 2,
        /** The component is used for assignment of a single parameter to a single variable.
          */
        Assignment = 3,
        /** The component is used to control execution flow (if, for, while, etc.), and cannot be used in operations.
          */
        ControlFlow = 4,
        /** The component renders to a block of lines, and can be placed anywhere a code block is expected (see Core.With).
          * Note: While this can be set explicitly, most components are implicitly viewed as a 1-line blocks by default.
          */
        CodeBlock = 5,
        /** The component represents a complete callable function.
          * Note: In the IDE, all scripting is done using *visual* components.  At runtime however, only "functional" components
          * remain, as compile time optimization collapses and inlines all others.
          */
        Functional = 6,
        /** The component represents a single custom expression to be rendered.
          * Examples include quick complex equations, native instance function calls, etc.
          * Note: These components expect only one 'System.Code' component line, in which the custom code is also on a single
          * line. In addition, custom expressions cannot be "stepped" into during simulations.
          */
        Expression = 7,
        /** The component represents an object type. Object types are also functional types, but convert other objects to their
          * own type where supported.
          */
        Object = 8,
        /** The component is used for rendering text.
          * These components are useful for rendering text content for text-based operations.  That means the result of these
          * components can be used for passing as "string" arguments to other components, or for simply rendering text documents,
          * such as HTML, CSS, etc.
          */
        Text = 9,
        /** The component is used for rendering custom code.
          */
        Code = 10,
        /** The component represents a *component* type only and does not actually perform any action or operation.
          * Note 1: All components are inherently types.
          * Note 2: Don't inherit from component to set this unless needed.  Instead, inherit directly from the "Type" class.
          */
        Type = 11
    }
    interface ISavedComponent extends ISavedType {
        title: string;
        blocks: ISavedBlock[];
        parameters: ISavedPropeties;
        localVars: ISavedPropeties;
        returnVars: ISavedPropeties;
        instanceProperties: ISavedPropeties;
        events: ISavedEvent[];
    }
    interface ITitleParseResult {
        /** The parameters extracted from a title (usually for components). The count is always one less than the title text parts (unless the title is empty).*/
        parameters: Property[];
        /** The text parts of the title, without the parameters.  There's always one more text entry than parameters (unless the title is empty). */
        titleParts: string[];
    }
    /** Components represent functional part of script code, whether is be expressions, or an entire function.  Most components
    * have input properties that produce some desired action or output.
    * Components do not have any instances.  In FlowScript, "instances" are simply data structures that have functions/methods
    * that work on them, or static functions that can be shared without any instance required at all. For data, the "Table"
    * type is used.
    * All components are "static" in nature, and can be called and/or reused at any time, as long as any required data schema
    * elements expected by the component are present.
    */
    class Component extends Type implements IReferencedObject {
        static TITLE_TOKEN_SEARCH_REGEX: RegExp;
        static TITLE_TOKEN_VALIDATE_REGEX: RegExp;
        /** The title of this component. */
        title: string;
        private _title;
        private _titleParams;
        /** Returns the parse result after setting the component's title. */
        readonly titleParseResult: ITitleParseResult;
        private _titleParseResult;
        /** Parses the title and returns a property list that can be added to the parameters collection. */
        static parseTitle(title: string, script?: IFlowScript): ITitleParseResult;
        /** Script blocks for this component. */
        readonly blocks: Block[];
        protected _blocks: Block[];
        /** Gets the first block for this component.
          * All functional components have one block by default. More blocks are added if component represents an argument value
          * passed to another components parameter, or as a closure callback function [which should never be used for events].
          */
        readonly block: Block;
        /** Parameter variables for this component. */
        readonly parameters: PropertyCollection;
        protected _parameters: PropertyCollection;
        /** Local variables for this component. */
        readonly localVars: PropertyCollection;
        protected _localVars: PropertyCollection;
        /** Return variables for this component. */
        readonly returnVars: PropertyCollection;
        protected _returnVars: PropertyCollection;
        /** Instance variables for this component. */
        readonly instanceProperties: PropertyCollection;
        protected _instanceProperties: PropertyCollection;
        /** Object components embed properties from other associated objects into sub-objects. At compile time, if there are no conflicts, the embedded objects get merged into their host objects for efficiency. */
        readonly embeddedTypes: Object[];
        protected _embeddedTypes: Object[];
        instanceType: Type;
        protected _instanceType: Type;
        readonly events: FSEvent[];
        protected _events: FSEvent[];
        componentType: ComponentTypes;
        protected _componentType: ComponentTypes;
        readonly function: ICallableComponent;
        protected _function: ICallableComponent;
        /** Returns the default return property, which must be one single return definition, otherwise 'undefined' is returned. */
        readonly defaultReturn: Property;
        /** Returns true if this component results in a value that can be used in an operation. */
        readonly isOperational: boolean;
        readonly isObject: boolean;
        /** Returns true if the parent is an object type for holding data properties. */
        readonly hasDataObjectTypeParent: boolean;
        /** An instance reference string that represents this block in the system. */
        readonly referenceStr: string;
        getReference(): NamedReference<Component>;
        constructor(parent: Type, componentType: ComponentTypes, typeName: string, signatureTitle: string, script?: IFlowScript);
        save(target?: ISavedComponent): ISavedComponent;
        addBlock(block?: Block): Block;
        removeBlock(block?: Block): Block;
        private _checkName;
        /** Searches parameters, local variables, and return variables for a property matching a specified name. */
        getProperty(name: string): Property;
        /** Searches only parameters for a specified name, or index, and returns true if found. */
        hasParameter(name: string): boolean;
        hasParameter(index: number): boolean;
        /** Searches parameters, local variables, and return variables for a property matching a specified name, and returns true if found. */
        hasProperty(name: string): boolean;
        /** Searches instance properties for a property matching a specified name.
          * @param {boolean} ownProperty If true, then only properties that belong to this component are searched.
          */
        getInstanceProperty(name: string, ownProperty?: boolean): Property;
        /** Searches instance properties in the parent chain for a property matching a specified name, and returns true if found.
          * @param {boolean } ownProperty If true then only properties that belong to this object are checked.
          */
        hasInstanceProperty(name: string, ownProperty?: boolean): boolean;
        /** Validates and returns the give parameter name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateParameterName(name: string, ignore?: Property): string;
        /** Further define component's parameter. */
        defineParameter(name: string, validTypes: Type[], initialValue?: any, validation?: string, isOptional?: boolean, isConst?: boolean, isAlias?: boolean): Property;
        /** Renames an parameter on this component. */
        renameParameter(prop: Property, newName: string): Property;
        renameParameter(prop: string, newName: string): Property;
        /** Removes the specified parameter from this component. */
        removeParameter(prop: Property): Property;
        removeParameter(prop: string): Property;
        /** Validates and returns the give local variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateLocalVarName(name: string, ignore?: Property): string;
        /** Defines a new local variable for this component. */
        defineLocalVar(name: string, validTypes: Type[], initialValue?: any, validation?: string, isOptional?: boolean, isStatic?: boolean): Property;
        /** Renames an local variable on this component. */
        renameLocalVar(prop: Property, newName: string): Property;
        renameLocalVar(prop: string, newName: string): Property;
        /** Removes the specified local variable from this component. */
        removeLocalVar(prop: Property): Property;
        removeLocalVar(prop: string): Property;
        /** Validates and returns the give return variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateReturnVarName(name: string): string;
        /** Defines a new local variable to use as a return value for this component.
          * To define a default return value for this functional component, pass in 'null'/undefined for the name.
          */
        defineReturnVar(name: string, returnType?: Type): Property;
        /** Defines a default return value for this functional component.
          * When default returns are defined, a running expression variable tracks each executed expression and returns the last
          * expression executed.
          */
        defineDefaultReturnVar(returnType?: Type): Property;
        /** Renames an return variable on this component. */
        renameReturnVar(prop: Property, newName: string): Property;
        renameReturnVar(prop: string, newName: string): Property;
        /** Removes the specified return variable from this component. */
        removeReturnVar(prop: Property): Property;
        removeReturnVar(prop: string): Property;
        /** Validates and returns the give instance variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateInstancePropertyName(name: string, ignore?: Property): string;
        /** Defines a new local instance related variable for this component. */
        defineInstanceProperty(name: string, validTypes: Type[], initialValue?: any, validation?: string): Property;
        /** Renames an instance property on this component, or any super (inherited) component.
          * @param {boolean} ownProperty If true, then only properties that directly belong to this component can be renamed.
          */
        renameInstanceProperty(prop: Property, newName: string, ownProperty?: boolean): Property;
        renameInstanceProperty(prop: string, newName: string, ownProperty?: boolean): Property;
        /** Removes the specified instance property from this component, or any super (inherited) component.
          * @param {boolean} ownProperty If true, then only properties that directly belong to this component can be removed.
          */
        removeInstanceProperty(prop: Property, ownProperty?: boolean): Property;
        removeInstanceProperty(prop: string, ownProperty?: boolean): Property;
        /** Defines the instance type expected by this component (the instance type this component can work with). If this is
          * set, this component can only be called in object contexts using special statements. Example: the "with" component.
          */
        defineInstanceType(type: Type): Component;
        /** Register a callback event. */
        registerEvent(name: string): Event;
        /** Configures a new runtime context with the supplied arguments. */
        configureRuntimeContext(ctx: RuntimeContext, args?: ICallerArguments): RuntimeContext;
        /** Sets an argument on any target object to a given value based on the expected parameters of this component. */
        setArgument<T>(argIndex: number, value: T, target: IContextArguments): T;
        setArgument<T>(argIndex: string, value: T, target: IContextArguments): T;
        /** Gets an argument value from any target object based on the expected parameters of this component. */
        getArgument<T = any>(argIndex: number, target: IContextArguments): T;
        getArgument<T = any>(argIndex: string, target: IContextArguments): T;
        /** Creates a visual tree snapshot for this component and the first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
    }
    class FunctionalComponent extends Component {
        constructor(parent: Type, typeName: string, signatureTitle?: string, script?: IFlowScript);
    }
    /** Helps to build a single component using chainable calls. */
    class ComponentBuilder {
        Component: Component;
        /** Helps to build a single component using chainable calls. See Component for more details. */
        constructor(parent: Type, componentType: ComponentTypes, typeName: string, signatureTitle?: string, script?: IFlowScript);
        /** See {Component}.defineParameter() for more details. */
        defineParameter(name: string, validTypes: Type[], initialValue?: any, validation?: string, isOptional?: boolean, isConst?: boolean, isAlias?: boolean): ComponentBuilder;
        /** Similar to calling 'defineParameter()', except allows defining an enum type property with a 'fixed' or 'not fixed' flag.
          * If a property is 'fixed' to an enum, the developer can only select or enter values matching those in the enum.
          */
        defineEnumProperty<T>(name: string, enumType: Enum<T>, isFixed?: boolean, initialValue?: any, validation?: string, isOptional?: boolean, isConst?: boolean): ComponentBuilder;
        /** See {Component}.defineLocal() for more details. */
        defineLocal(name: string, validTypes: Type[], initialValue?: any, validation?: string, isOptional?: boolean, isStatic?: boolean): ComponentBuilder;
        /** See {Component}.defineReturn() for more details. */
        defineReturn(name: string, returnType: Type): ComponentBuilder;
        /** See {Component}.defineInstance() for more details. */
        defineInstance(name: string, validTypes: Type[], initialValue?: any, validation?: string): ComponentBuilder;
        /** See {Component}.defineInstanceType() for more details. */
        defineInstanceType(type: Type): ComponentBuilder;
        /** See {Component}.registerEvent() for more details. */
        registerEvent(name: string): ComponentBuilder;
        /** Adds a new statement on a new line (See {Line}.addStatement()). */
        addStatement(action: Component, args?: IComponentReferenceArgs | string[], returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]): ComponentBuilder;
    }
    interface ISavedComponentReference extends ISavedExpression {
        /** Full type name to the source component for this expression, if any. */
        source: string;
        arguments: {
            [index: number]: any;
            [name: string]: ISavedExpression;
        };
        returnTargets: ISavedReturnTargetMap[];
        events: ISavedEvent[];
    }
    /** References a block for use in expressions. */
    class ComponentReference extends Expression {
        readonly script: IFlowScript;
        /** The component that this referenced points to. */
        readonly component: Component;
        protected _componentRef: NamedReference<Component>;
        /** The arguments set for this expression, if any.
          * Use 'setArgument()' to set values for this object.
          */
        readonly arguments: ExpressionArgs;
        protected _arguments: ExpressionArgs;
        /** Returns the count of indexed values in the object (i.e. the highest index + 1). */
        readonly argumentLength: number;
        readonly returnTargets: ReturnTargetMaps;
        protected _returnTargets: ReturnTargetMaps;
        _eventHandlers: BlockReference[];
        constructor(source: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[], parent?: Expression);
        /** Initialize this expression with new arguments, return targets, and event handlers. */
        initExpression(source: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]): Expression;
        protected _clone(parent?: Expression): ComponentReference;
        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        containsChildExpression(expr: Expression): boolean;
        /** Removes a child from the expression tree.  If the child is not found, null is returned, otherwise the removed expression is returned. */
        remove(child?: Expression): Expression;
        /** Removes self from the expression tree. */
        remove(): Expression;
        /** Clears the expression of all arguments, return targets, and event handlers. */
        clear(): void;
        /** Removes an event handler. */
        removeEvent(eventHandler: BlockReference): BlockReference;
        /** Removes an event handler. */
        removeEvent(index: number): Expression;
        /** Removes all event handlers. */
        clearEventHandlers(): void;
        save(target?: ISavedComponentReference): ISavedComponentReference;
        load(target?: ISavedBlockReference): ISavedBlockReference;
        /** Returns available properties that can be used given the parent expression hierarchy. */
        getAvailablePropertyList(): IAvailableProperty[];
        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
        toString(): string;
    }
    interface ISavedStatement extends ISavedComponentReference {
    }
    /** The root expression is call a "statement", which is a single stand-alone component call, assignment operation, or flow
      * control block.  Lines usually reference statements, and other expressions are nested within them.
      */
    class Statement extends ComponentReference {
        readonly script: IFlowScript;
        /** The line this expression belongs to. */
        readonly line: Line;
        private _line;
        /** The line number this statement is on. */
        readonly lineNumer: number;
        /** Returns the functional component this expression belongs to. */
        readonly functionalComponent: Component;
        readonly block: Block;
        constructor(line: Line, action: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]);
        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
        protected _clone(parent?: Expression): Statement;
        save(target?: ISavedStatement): ISavedStatement;
        /** Removes a child expression from the expression tree. */
        remove(child: Expression): Expression;
        /** Removes self from the associated line. */
        remove(): Expression;
    }
}
declare namespace FlowScript {
    interface ISavedBlock extends ISavedTrackableObject {
        lines: ISavedLine[];
    }
    /** Represents a single block of script.
      * Blocks are also expressions because they can exist as arguments to other components.
      */
    class Block extends TrackableObject implements IReferencedObject {
        readonly script: IFlowScript;
        /** The index of this block in the component owner, if any, otherwise this is -1. */
        readonly index: number;
        /** The component this block belongs to. */
        component: Component;
        private _component;
        readonly lines: Line[];
        private _lines;
        readonly hasLines: boolean;
        readonly totalLines: number;
        /** A string path that represents this block during serialization. */
        readonly serializedPath: string;
        /** An instance reference string that represents this block in the system. */
        readonly referenceStr: string;
        getReference(): NamedReference<Block>;
        constructor(containingComponent: Component);
        /** Creates an expression wrapper for this block. An optional expression parent can be given. */
        createExpression(parent?: Expression): BlockReference;
        save(target?: ISavedBlock): ISavedBlock;
        /** Returns a new line for this block. */
        newLine(): Line;
        /** Returns a new line before the given line number (where 0 is the first line). */
        insertLineBefore(lineIndex: number): Line;
        /** Returns a new line after the given line number (where 0 is the first line). */
        insertLineAfter(lineIndex: number): Line;
        /** Returns the 0-based line number for a line. */
        getLineIndex(line: Line): number;
        /** Returns the 1-based line number for a line, used mainly for the UI. */
        getLineNumber(line: Line): number;
        /** Remove a line by the line number (note: the first line is 1, not 0). */
        removeLine(lineNum: number): Line;
        /** Remove a line by the line instance reference. */
        removeLine(line: Line): Line;
        /** Clears the block and returns the block instance. */
        clear(): Block;
        /** Creates a visual tree snapshot for this block and any containing lines. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
    }
    interface ISavedBlockReference extends ISavedExpression {
        blockPath: string;
    }
    /** References a block for use in expressions. */
    class BlockReference extends Expression {
        readonly script: IFlowScript;
        /** The block object that is referenced. */
        readonly block: Block;
        private _block;
        /** The script lines in the referenced block. */
        readonly lines: Line[];
        /** The component that the referenced block belongs to. */
        readonly component: Component;
        readonly hasLines: boolean;
        constructor(block: Block, parent?: Expression);
        /** Creates a visual tree snapshot for this expression object. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
        protected _clone(parent?: Expression): BlockReference;
        save(target?: ISavedBlockReference): ISavedBlockReference;
        load(target?: ISavedBlockReference): ISavedBlockReference;
        toString(): string;
    }
}
declare namespace FlowScript {
    interface ISavedLine extends ISavedTrackableObject {
        statements: ISavedExpression[];
    }
    /** A line represents a single execution step in a code block.
      * A line essentially wraps a component, and acts as a single execution step in a code block.
      */
    class Line extends TrackableObject implements IReferencedObject {
        readonly script: IFlowScript;
        /** The block this line belongs to. */
        readonly block: Block;
        private _block;
        /** The component that owns the code block this line belongs to. */
        readonly component: Component;
        readonly statements: Statement[];
        private _statements;
        readonly hasStatements: boolean;
        /** Returns the 0-based line number for this line. */
        readonly lineIndex: number;
        /** Returns the 1-based line number for this line, used mainly for the UI. */
        readonly lineNumber: number;
        readonly totalLines: number;
        /** A string path that represents this block during serialization. */
        readonly serializedPath: string;
        /** An instance reference string that represents this block in the system. */
        readonly referenceStr: string;
        getReference(): NamedReference<Line>;
        constructor(parent: Block);
        clone(parent: Block): Line;
        /** Creates an expression wrapper for this line. An optional expression parent can be given. */
        createExpression(parent?: Expression): LineReference;
        /** Remove this line and all statements, and returns the removed line. */
        remove(): Line;
        save(target?: ISavedLine): ISavedLine;
        addStatement(action: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]): Statement;
        removeStatement(statement: Statement): Statement;
        /** Creates a visual tree snapshot for this line and any statements. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
    }
    interface ISavedLineReference extends ISavedExpression {
        linePath: string;
    }
    /** References a line for special cases. Lines are not usually used in expressions, but still may need to be
      * referenced (for instance, from the UI side, or the trash bin).
      */
    class LineReference extends Expression {
        readonly script: IFlowScript;
        /** The line object that is referenced. */
        readonly line: Line;
        private _lineRef;
        /** The component that the referenced line belongs to. */
        readonly component: Component;
        constructor(line: Line, parent?: Expression);
        /** Creates a visual tree snapshot for this expression object. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T;
        protected _clone(parent?: Expression): LineReference;
        save(target?: ISavedLineReference): ISavedLineReference;
        load(target?: ISavedLineReference): ISavedLineReference;
        toString(): string;
    }
}
declare namespace FlowScript {
    /** Represents an enumeration of names and related constant values.
      * Enums can be associated with properties so the developer has to pick from a predefined list of values.
      */
    class Enum<T> extends Type {
        private _counter;
        values: {
            [name: string]: T;
            [index: number]: T;
        };
        properties: {};
        constructor(parent: Type, name: string, values?: {});
        constructor(parent: Type, name: string, values?: {
            [name: string]: T;
        });
        setValue(name: string, value: T): Enum<T>;
        addValue(values?: {
            [name: string]: T;
        }): Enum<T>;
    }
}
declare namespace FlowScript {
    interface ISavedEvent extends ISavedComponent {
    }
    /** Represents a single component event.
      * The premise behind components is that they are built assuming normal code flow; however, things do go wrong at times,
      * and when something does go wrong, an event is raised which developers can use to execute a handler block.
      */
    class FSEvent extends Component {
        constructor(parent: Component, name: string);
        save(target?: ISavedEvent): ISavedEvent;
    }
}
declare namespace FlowScript {
    /** A text message, which can later have translations applied.
      * Messages can have token place holders, such as '$0 $1 $2 ...' (where '$0' is the first argument given - see 'getMessage()').
      * When ready to translate an application's messages, you use the IDE to export a comma separated list of messages and their
      * checksum values for later match up.  If in a very rare case there is a checksum collision, you just give the message a
      * fixed internal ID.  Although some may wish to do this anyhow for clarity, using checksums allows focus on development
      * of message feedback, without the annoyance of update string tables. If a message will be used in multiple places, it's
      * a good idea to give a fixed ID.
      */
    class Message {
        private _parent;
        /** By default, the ID of a message is it's checksum.  If there are conflicts (very rare), then a unique ID value must be explicitly defined. */
        readonly id: string;
        private _id;
        /** A simple hash to identify the message. If conflicts occur (very rare), then a unique ID value must be explicitly defined. */
        readonly checksum: number;
        private _checksum;
        /** The message pattern is a text message that may contain token place holders for formatting (i.e. "Warning: $1"). */
        messagePattern: string;
        private _messagePattern;
        readonly translationPattern: string;
        private _translationPattern;
        constructor(parent: IFlowScript, message: string, id?: string);
        /** Return a formatted message, replacing any tokens ($#) with the supplied argument values. */
        getMessage(...args: string[]): string;
        /** Sets a translated message pattern. This is a language translation which represents the underlying message text
          * pattern. It will act as an override when 'getMessage(...)' is called, and is reset by calling 'clearTranslation()'. */
        setTranslation(translationPattern: string): void;
        /** Clears the current translated message pattern. */
        clearTranslation(): void;
        toString(): string;
        valueOf(): string;
    }
}
declare namespace FlowScript {
    enum ColumnAccessLevels {
        /** The column can be read from, and written to. */
        ReadWrite = 0,
        /** The column cannot be updated. */
        ReadOnly = 1,
        /** The column is treated as if it doesn't exist. */
        Hidden = 2
    }
    class Column {
        readonly name: string;
        private _name;
        readonly type: Type;
        private _type;
        readonly accessLevel: ColumnAccessLevels;
        private _accessLevel;
    }
    class Row {
        [index: number]: any;
    }
    /** Represents a structure of data, much like a class.
      * Tables exist to replace the concept of class instances in many other languages.  In most cases, programmers create
      * methods/functions to operate on either a data structure (object with properties), or data returned from a database.
      * To mimic classes, a table with one row is created, where the columns are the properties.  As well, columns can be
      * flagged as readonly,
      */
    class Table extends Type {
        private _super;
        private _columns;
        private _rows;
        constructor(parent: Type, tableName: string);
    }
}
declare namespace FlowScript {
    /** A thread wraps a single script block.
      * One script can have many threads.
      */
    class Thread {
        private _parent;
        private _block;
        constructor(parent: IFlowScript);
    }
}
/** The core namespace contains all the very basic low level components that can be used as building blocks.
  * You can think of them as the individual "Lego" pieces that would be use to create the larger parts of a more complex design.
  */
declare module FlowScript.Core {
    /** A script based type that matches all other types. */
    class Any extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class Boolean extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class String extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class Double extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class Currency extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class Integer extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class DateTime extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class FSObject extends Component {
        constructor(parent: Type, superType?: FSObject, title?: string);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    /** Represents an array of items.
      * Arrays are templates, which default to arrays of "Any" type.  When creating arrays, call "{Type}.createTemplateType()"
      * to set the type of each item.
      */
    class Array extends Component {
        constructor(parent: Type);
        init(defaultType?: Type, expectedBaseType?: Type): void;
        assignableTo(type: Component): boolean;
    }
    class RegEx extends Component {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class Property extends Type {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class CodeBlock extends Type {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class FunctionalComponent extends Type {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class ExpressionList extends Type {
        constructor(parent: Type);
        init(): void;
        assignableTo(type: Component): boolean;
    }
    class System extends Type {
        /** Represents all types. */
        Any: Any;
        /** Represents a boolean (true/false) type. */
        Boolean: Boolean;
        /** Represents a string of characters. */
        String: String;
        /** Represents a 64-bit floating point number. */
        Double: Double;
        /** Represents currency using higher precision that a double type. */
        Currency: Currency;
        /** Represents a whole number. */
        Integer: Integer;
        /** Represents the date and time in the form of a double value. */
        DateTime: DateTime;
        /** Represents a regular expression object. */
        Object: FSObject;
        /** Represents a one dimensional array object. */
        Array: Array;
        /** Represents a regular expression object. */
        RegEx: RegEx;
        /** Represents a property type reference. */
        Property: Property;
        /** Represents a block of script, usually representing code to execute when a condition or event occurs. */
        CodeBlock: CodeBlock;
        /** Represents a callable component. */
        FunctionalComponent: FunctionalComponent;
        /** Represents an asynchronous callback event that can be triggered at a future time.
          * Note: It is possible for events to be synchronous in certain cases, but they should be treated as though they are not.
          */
        Event: Event;
        /** Assign a parameter, local variable, or return target with the value of a given expression. */
        Assign: Assign;
        /** Used to access properties of an object. */
        Accessor: Accessor;
        /** Execute a block of lines within the context of a given object.
          * Each statement in the block is checked if the object is a direct parent object, and if so, invokes the call using
          * the object as the "this" context.
          */
        With: With;
        /** Execute a functional component call using the context of a given object.  The call is invoked using the object as
          * the "this" context.
          */
        WithCall: WithCall;
        PreIncrement: PreIncrement;
        PostIncrement: PostIncrement;
        PreDecrement: PreDecrement;
        PostDecrement: PostDecrement;
        /** The Math namespace contains mathematical related component types. */
        Math: Math.Math;
        /** The binary namespace contains binary related component types. */
        Binary: Binary.Binary;
        /** Contains statements for controlling script execution flow. */
        ControlFlow: ControlFlow.ControlFlow;
        /** Contains statements for comparing values. */
        Comparison: Comparison.Comparison;
        /** Contains components for rendering HTML. */
        HTML: HTML.HTML;
        /** Represents a custom code block. */
        Code: Code;
        /** Represents a list of expressions (eg. '(x=1, y=x, z=y)). */
        ExpressionList: ExpressionList;
        constructor(script: IFlowScript);
        init(): void;
    }
    class Main extends Component {
        constructor(script: IFlowScript);
        init(): void;
    }
    class Operator extends Component {
        private _typeMapping;
        constructor(parent: Type, typeName: string, title: string, isUnary?: boolean);
        init(): void;
        addTypeMap(result: Type, ...ifTypes: Type[]): void;
        /** Returns the resulting type when given the specified arguments. */
        getResultTypeWhen(args: Type[]): Type;
    }
    class Comment extends Component {
        constructor(parent: Type);
        init(): void;
    }
    class Assign extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    class Accessor extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    class With extends Component {
        constructor(parent: Type);
        init(): void;
    }
    class WithCall extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    class PreIncrement extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    class PostIncrement extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    class PreDecrement extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    class PostDecrement extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    interface ICodeLanguages {
        [name: string]: string;
        JavaScript: string;
        CSharp: string;
        VB: string;
    }
    /** Represents a custom block of JavaScript code.
      * Note: JavaScript code must exist, even if just an empty string, otherwise the simulator will fail when this component is reached.
      */
    class Code extends Component {
        static FUNCTION_CONTENTS_REGEX: RegExp;
        static PROPERTY_TOKEN_REGEX: RegExp;
        CodeLanguages: Enum<ICodeLanguages>;
        Code: string;
        constructor(parent: Type);
        init(): void;
    }
}
declare module FlowScript.Core.Net.HTTPRequest {
    var MSG_LOADFAILED: string;
    /** A line represents a single execution step in a code component.
      */
    class HTTPRequest extends Component {
        constructor(parent: Type);
        init(): void;
    }
}
declare module FlowScript.Core.ControlFlow {
    /** Defines the Math namespace type. */
    class ControlFlow extends Type {
        If: If;
        IfElse: IfElse;
        While: While;
        DoWhile: DoWhile;
        /** Iterates over a block of code, similar to a "for" loop. */
        Loop: Loop;
        constructor(parent: Type);
        init(): void;
    }
    /** Represents the "if" logical statement.
      */
    class If extends Component {
        constructor(parent: Type);
        init(): void;
    }
    /** Represents the "if..else" logical statement.
      */
    class IfElse extends Component {
        constructor(parent: Type);
        init(): void;
    }
    /** Represents the "while..do" loop.
      */
    class While extends Component {
        constructor(parent: Type);
        init(): void;
    }
    /** Represents the "do..while" loop.
      */
    class DoWhile extends Component {
        constructor(parent: Type);
        init(): void;
    }
    /** Iterates over a block of code, similar to a "for" loop.
      */
    class Loop extends Component {
        constructor(parent: Type);
        init(): void;
    }
}
declare module FlowScript.Core.Math {
    /** Defines the Math namespace type. */
    class Math extends Type {
        /** Add numerical values, or concatenate strings. */
        Add: Add;
        /** Multiple two numerical values. */
        Multiply: Multiply;
        SQRT: SQRT;
        constructor(parent: Type);
        init(): void;
    }
    /** Adds two values.
      */
    class Add extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Multiply two values.
      */
    class Multiply extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** get the square root of a value.
      */
    class SQRT extends Component {
        constructor(parent: Type);
        init(): void;
    }
}
declare module FlowScript.Core.Binary {
    /** Defines the Math namespace type. */
    class Binary extends Type {
        /** Returns the inverse boolean value of a given expression. */
        Not: Not;
        /** Returns the eXclusive OR of a given expression. */
        XOR: XOR;
        /** Shifts all bits of an integer value to the left a number of times. */
        ShiftLeft: ShiftLeft;
        /** Shifts all bits of an integer value to the right a number of times. */
        ShiftRight: ShiftRight;
        constructor(parent: Type);
        init(): void;
    }
    /** Returns the inverse of the given boolean value.
      */
    class Not extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Returns the eXclusive OR of a given value.
      */
    class XOR extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Shifts all bits of an integer value to the left a number of times.
      */
    class ShiftLeft extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Shifts all bits of an integer value to the right a number of times.
      */
    class ShiftRight extends Operator {
        constructor(parent: Type);
        init(): void;
    }
}
/** Contains components used for comparisons.
  */
declare module FlowScript.Core.Comparison {
    /** Defines the Comparison namespace type. */
    class Comparison extends Type {
        /** Tests if one value equals another. */
        Equals: Equals;
        /** Tests if one value AND its type equals another. */
        StrictEquals: StrictEquals;
        /** Tests if one value does NOT equal another. */
        NotEquals: NotEquals;
        /** Tests if one value AND its type do NOT equal another. */
        StrictNotEquals: StrictNotEquals;
        /** Tests if one value is less than another.  */
        LessThan: LessThan;
        /** Tests if one value is greater than another.  */
        GreaterThan: GreaterThan;
        /** Tests if one value is less than or equal to another. */
        LessThanOrEqual: LessThanOrEqual;
        /** Tests if one value is greater than or equal to another. */
        GreaterThanOrEqual: GreaterThanOrEqual;
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value equals another.
      */
    class Equals extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value AND its type equals another.
      */
    class StrictEquals extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value does NOT equal another.
      */
    class NotEquals extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value AND its type do NOT equal another.
      */
    class StrictNotEquals extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value is less than another.
      */
    class LessThan extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value is greater than another.
      */
    class GreaterThan extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value is less than or equal to another.
      */
    class LessThanOrEqual extends Operator {
        constructor(parent: Type);
        init(): void;
    }
    /** Tests if one value is greater than or equal to another.
      */
    class GreaterThanOrEqual extends Operator {
        constructor(parent: Type);
        init(): void;
    }
}
/** The namespace for HTML related components. */
declare module FlowScript.Core.HTML {
    /** Defines the HTML namespace type. */
    class HTML extends Type {
        /** Represents an HTML node. */
        Node: Node;
        /** Represents a list of DOM nodes. */
        NodeList: NodeList;
        /** Represents a list of DOM nodes indexed by name. */
        NamedNodeMap: NamedNodeMap;
        /** Represents an HTML DOM element. */
        Element: Element;
        /** Represents the HTML root element. */
        HTMLElement: HTMLElement;
        /** Represents an browser window document object. */
        Document: Document;
        /** Enumeration of node types. */
        NodeTypes: NodeTypes;
        /** Enumeration of document positions. */
        DocumentPositions: NodeTypes;
        constructor(parent: Type);
        init(): void;
    }
    /** Attaches an event listener to an element that supports DOM related events.
      */
    class On extends Component {
        constructor(parent: Type);
        init(): void;
    }
    class Node_removeChild extends Component {
        constructor(parent: Type);
        init(): void;
    }
    class Node_appendChild extends Component {
        constructor(parent: Type);
        init(): void;
    }
    class NodeList extends FSObject {
        constructor(parent: Type);
        init(): void;
    }
    class NamedNodeMap extends FSObject {
        constructor(parent: Type);
        init(): void;
    }
    class NodeTypes extends Enum<Number> {
        constructor(parent: Type);
    }
    class DocumentPositions extends Enum<Number> {
        constructor(parent: Type);
    }
    class Node extends FSObject {
        removeChild: Component;
        appendChild: Component;
        isSupported: Component;
        isEqualNode: Component;
        lookupPrefix: Component;
        isDefaultNamespace: Component;
        compareDocumentPosition: Component;
        normalize: Component;
        isSameNode: Component;
        hasAttributes: Component;
        lookupNamespaceURI: Component;
        cloneNode: Component;
        hasChildNodes: Component;
        replaceChild: Component;
        insertBefore: Component;
        CloneTypes: Enum<boolean>;
        constructor(parent: Type);
        init(): void;
    }
    class Element extends FSObject {
        constructor(parent: Type);
        init(): void;
    }
    class HTMLElement extends FSObject {
        constructor(parent: Type);
        init(): void;
    }
    class Document extends FSObject {
        constructor(parent: Type);
        init(): void;
    }
}
declare namespace FlowScript {
    /** Manages the margins used for rendering FlowScript to code.
      */
    class Margin {
        marginCharacters: string;
        static MAX_MARGINS: number;
        _margins: string[];
        _currentLevel: number;
        constructor(marginCharacters?: string);
        /** Advance to the next margin level. */
        next(): string;
        /** Backup to the previous margin level. */
        previous(): string;
        /** Returns the current margin for the current level. */
        toString(indexLevel?: number): string;
    }
    /** Represents a single rendered line of code. */
    class RenderedLine {
        margin: Margin;
        contents: string;
        /** The margin level to render for this line. */
        marginLevel: number;
        /** The operation/action to take in the simulator for each rendered line. */
        opcode: OpCodes;
        /** Any special arguments needed by the simulator. */
        args: any[];
        /** The source expression or property object which this rendered line represents. */
        source: any;
        constructor(margin: Margin, contents: string, source?: any, opcode?: OpCodes, args?: any[]);
        toString(margin?: Margin): string;
        toString(margin?: string): string;
    }
    /** Represents an array of 'RenderedLine' instances. */
    interface IRenderedLines extends Array<RenderedLine> {
    }
    /** When compiling scripts for final output or simulation, this class is used to hold the rendered hierarchy for types and functional components. */
    class TypeRenderer {
        _parent: TypeRenderer;
        readonly isFunctionalComponent: boolean;
        /** Returns the source typed as a component. The source component of each TypeRenderer node is the containing component of any rendered lines. */
        readonly component: Component;
        /** The type that is the source for this renderer entry. */
        readonly type: Type;
        private _source;
        /** Returns true if this rendering is for simulation purposes only, and thus cannot be used to render final code. */
        readonly isSimulation: boolean;
        private _isSimulation;
        _lines: IRenderedLines;
        /** The index of the last line added. */
        readonly lastLineIndex: number;
        /** The index of the next line to be added. */
        readonly nextLineIndex: number;
        _renderers: {
            [typeName: string]: TypeRenderer;
        };
        _localVars: string[];
        /** Used to separate local context objects for functional component calls, and to aid in call cleanup. */
        callStack: ComponentReference[];
        /** Used to separate nested loop counters. */
        loopID: number;
        /** If this is set, then any expression component found with '$this' will be replaced with the object reference in this
          * string.  This property is used in rendering the core "with" components.
          * Note: Any '$this' token encountered while this property is not yet set will cause an error.
          */
        readonly objContextVar: string;
        private _objContextVars;
        private _margin;
        readonly compiler: Compiler;
        private _compiler;
        readonly root: TypeRenderer;
        constructor(compiler: Compiler, source: Type, isSimulation?: boolean);
        constructor(parent: TypeRenderer, source: Type, isSimulation?: boolean);
        /** Creates a root level type renderer that will wrap the 'main' script in 'compiler.script'. */
        static createRootTypeRenderer(compiler: Compiler, isSimulation?: boolean): TypeRenderer;
        private _checkType;
        /** Adds a new rendered line for the underlying component, along with the current margin level, and returns the line index. */
        addLine(source: {}, line: string, opcode?: OpCodes, ...args: any[]): number;
        /** Inserts a new rendered line at a specific line number for the underlying component, prefixed with the current margin level.
          * Note: The first line starts at index 0.
          */
        insertLine(index: number, source: any, line: string, opcode?: OpCodes, ...args: any[]): void;
        addLocalVar(name: string): string;
        /** See 'objContextVar'. */
        addContextVar(varPath: string): string;
        /** See 'objContextVar'. */
        removeLastContextVar(): string;
        /** Inserts the current list of local variable names and clears the list.
         * @param source The source reference to log for this request.
         */
        insertDeclarations(source: {}): void;
        /** Prepends text before the start of a previously added line. */
        prefixLastLine(prefix: string): void;
        /** Appends text at the end of a previously added line. */
        appendLastLine(suffix: string): void;
        /** Go to the next margin. */
        nextMargin(): void;
        /** Go to the previous margin. */
        previousMargin(): void;
        /** Renders the underlying compiled component and all nested components to an array of code lines.
         * @param {string} targetVar The left side of an assignment operation that will receive the rendered function when executed.
         */
        render(targetVar: string, margin?: Margin, codeLines?: string[]): string[];
        toString(targetVar?: string): string;
        /** Updates the underlying renderer hierarchy to match the namespace hierarchy of the specified type. */
        registerType(type: Type): TypeRenderer;
        /** Returns an existing functional component render by the safe full type name, or null if the type is not yet registered. */
        getRenderer(safeFullTypeName: string): TypeRenderer;
        /** Checks if a functional component renderer exists for the specified full safe type. */
        hasRenderer(safeFullTypeName: string): boolean;
        private _internalRunningValVarName;
        /** Adds a script to execute JavaScript code.
          * This is the same as calling 'addLine', except it adds an explicit opcode for the line(s), and splits the script by any line endings.
          * Returns the index of the added line.
          */
        exec(source: Expression, jscript: string): number;
        /** Adds a line to evaluate a single operation, and sets the current running value with the result.
          * Returns the index of the added line.
          */
        eval(source: Expression, expressionCode: string): number;
        /** Adds a line to evaluate an operation on a previously set left argument, and the current value (see 'pushOpArg').
          * Returns the index of the added line.
          */
        evalOp(source: Expression, operationType: Component): number;
        /** Adds a line to evaluate an operation on a previously set left argument, and the current value (see 'pushOpArg').
          * Returns the index of the added line.
          */
        assign(source: Expression, leftSideVar: string): number;
        /** Adds a line to evaluate a unary operation on the current running value by adding the required operation semantics.
          * Returns the index of the added line.
          *
          * @param {string} varName A variable to set, which overrides the default behaviour of using the running value.
          */
        evalUnary(source: Expression, operationType: Component, varName?: string): number;
        /** Adds the current value to the operation argument stack.
          * Returns the index of the added line.
          */
        pushOpArg(): void;
        /** Adds a line to call another functional component.
          * Returns the index of the added line.
          */
        call(source: Expression, compType: string, ctxID: number): number;
        /** Adds a line to jump to another line.
          * Returns the index of the added line.
          */
        jump(source: Expression, targetLineIndex?: number): number;
        /** Updates a previously added "jump" line with the proper line index.  If no line index is specified, the index following the current last line is assumed.
          * Returns the index of the added line.
          */
        updateJump(jumpLineIndex: number, targetLineIndex?: number): void;
        /** Adds a line to jump to another line if the current running value is TRUE (used with 'while' loops).
          * Use 'updateJump' to update the line index target when available.
          * Returns the index of the added line.
          */
        jumpIf(source: Expression, targetLineIndex?: number): number;
        /** Adds a line to jump to another line if the current running value is FALSE (used for control flow [i.e. 'if..then...']).
          * Use 'updateJump' to update the line index target when available.
          * Returns the index of the added line.
          */
        jumpIfNot(source: Expression, targetLineIndex?: number): number;
    }
    /** The compiler reads the FlowScript type graph, starting at the "main" component, and outputs the resulting code.  The
      * compiler also supports runtime simulations that you can watch in real time, or step through for debugging purposes.
      * It's possible to extend this class and override the required methods needed to translate various aspects of the
      * compiler for targeting other languages.
      */
    class Compiler {
        /** Used for final rendering only (not used for simulations). */
        static CONTEXT_VAR_NAME: string;
        static LOCAL_CONTEXT_VAR_NAME: string;
        static RUNNING_VAL_VAR_NAME: string;
        static COMPONENT_REF_VAR_NAME: string;
        static SCRIPT_VAR_NAME: string;
        static USER_RTSCRIPT_VAR_NAME: string;
        static LOOP_COUNTER_VAR_NAME: string;
        /** Returns the script for this compiler, which is usually a reference to a 'main' script component. */
        readonly script: IFlowScript;
        private _script;
        /** The "instruction pointer" used to step through the expression tree during debug mode. */
        ip: Component;
        /** True if a simulation was started in debug mode. */
        readonly debugging: boolean;
        private _debugging;
        /** The context used for the "main" expression. */
        rootContext: RuntimeContext;
        /** A quick reference to the current context for the next expression to be evaluated/executed. */
        currentContext: RuntimeContext;
        constructor(script: IFlowScript);
        _checkMain(): void;
        /** Compiles the underlying script into code.
          * @param {string} targetVar The target variable that will receive the 'RuntimeScript' reference.  If not specified, this is '$fs' by default.
          */
        compile(targetVar?: string): string;
        /** Initializes the simulation of the underlying script. */
        compileSimulation(): Simulator;
        /** Takes a functional component and renders */
        _renderFunctionalComponent(renderer: TypeRenderer, comp: Component, isSimulation?: boolean): TypeRenderer;
        _renderComponentFunctionEntry(renderer: TypeRenderer, comp: Component): void;
        _renderComponentFunctionExit(renderer: TypeRenderer, comp: Component): void;
        _verifyArgCount(compRef: ComponentReference, expectedCount: number): void;
        _renderStatement(renderer: TypeRenderer, statement: Statement): void;
        _renderControlFlow(renderer: TypeRenderer, compRef: ComponentReference): void;
        _renderIf(renderer: TypeRenderer, expr: Expression, condition: Expression, block: BlockReference): void;
        _renderIfElse(renderer: TypeRenderer, expr: Expression, condition: Expression, block1: Expression, block2: Expression): void;
        _renderWhile(renderer: TypeRenderer, expr: Expression, condition: Expression, block: BlockReference): void;
        _renderDoWhile(renderer: TypeRenderer, expr: Expression, block: BlockReference, condition: Expression): void;
        _renderLoop(renderer: TypeRenderer, expr: Expression, init: Expression, condition: Expression, block: BlockReference, update: Expression): void;
        _renderConstantExpression(renderer: TypeRenderer, expr: Constant): string;
        _renderPropertyExpression(renderer: TypeRenderer, expr: PropertyReference, assignment?: boolean): string;
        _renderBlockExpression(renderer: TypeRenderer, blockExpr: BlockReference, operation: boolean): void;
        _renderWithExpression(renderer: TypeRenderer, objExpr: PropertyReference, opExpr: Expression): string;
        _renderWithBlock(renderer: TypeRenderer, objExpr: PropertyReference, blockExpr: BlockReference): void;
        _renderExpression(renderer: TypeRenderer, expr: Expression, operation?: boolean, assignment?: boolean): string;
        _renderComponentCall(renderer: TypeRenderer, compRef: ComponentReference, operation: boolean): string;
        _renderCallCleanups(renderer: TypeRenderer): void;
        /** This unwinds the context stack back by one after rendering a functional component call. */
        _renderCallCleanup(renderer: TypeRenderer): void;
        /** Renders a property as a variable reference within the current functional component context. */
        _renderCtxArg(property: Property, ctxPath?: string): string;
        /** Renders a given identifier name as a variable reference within the current functional component context. */
        _renderCtxArg(property: string, ctxPath?: string): string;
        _renderInstanceProperty(property: Property, objectVarPath?: string): string;
        _renderInstanceProperty(property: string, objectVarPath?: string): string;
        _renderDeclaration(varname: string, value: any): string;
        _renderAssignment(varpath: string, source: string): string;
        _renderConstant(value: any): string;
        _renderOp(renderedLValue: string, operationType: Type, renderedRValue: string): string;
        _renderOp(renderedLValue: string, operationTypeName: string, renderedRValue: string): string;
        _renderUnary(renderedValue: string, operationType: Component): string;
        _renderUnary(renderedValue: string, operationTypeName: string): string;
        _renderPropertyAccessor(propertyName: string): string;
        _renderCode(renderer: TypeRenderer, codeExpr: Expression): string;
    }
}
declare namespace FlowScript {
    /** Adds special properties to the runtime context for simulation purposes. */
    interface ISimulationContext extends RuntimeContext {
        /** Used to execute a single line of code within the context of the currently executing component. */
        $__lineExec?: _ILineEvaluator;
        /** The result of previous code evaluation. */
        $__result?: any;
        /** The argument stack for nested operations. */
        $__args?: any[];
        /** Points to the next action to execute. */
        $__lineIndex?: number;
        /** A reference to the component renderer this context was created for. */
        $__compRenderer?: TypeRenderer;
        /** This is a running value that is set with the resulting value at each operational line. Non-operational lines do not change this. */
        $__?: any;
        /** This is a dynamic running value that is set to each operation or component as it evaluates. */
        value?: any;
    }
    /** Operational codes used to control the simulator. */
    enum OpCodes {
        /** Executes a single statement or expression of JavaScript code. */
        Exec = 0,
        /** Branches to an offset if a value equates to true. */
        JumpIf = 1,
        /** Branches to an offset if a value equates to false. */
        JumpIfNot = 2,
        /** Branches to an offset. */
        Jump = 3,
        /** Calls another component. */
        Call = 4
    }
    /** Represents a component during runtime simulations. */
    class VirtualRuntimeComponent {
        readonly simulator: Simulator;
        private _simulator;
        readonly sourceComponent: Component;
        private _sourceComponent;
        constructor(simulator: Simulator, component: Component);
    }
    interface _IGlobalEvaluator {
        (code: string): any;
    }
    interface _ILineEvaluator extends IFunctionalComponentMetadata {
        (code: string, ...args: any[]): _ILineEvaluator;
        /** Use this to get and set variables within a executing context. */
        eval(x: string, ...args: any[]): any;
    }
    /** Simulates the script by breaking down the components into executable steps. */
    class Simulator {
        readonly compiler: Compiler;
        private _compiler;
        readonly mainRenderer: TypeRenderer;
        private _mainRenderer;
        rootContext: ISimulationContext;
        currentContext: ISimulationContext;
        callStack: ISimulationContext[];
        constructor(compiler: Compiler, mainRenderer: TypeRenderer);
        hasComponentRenderer(type: string): boolean;
        hasComponentRenderer(component: Component): boolean;
        getComponentRenderer(type: string): TypeRenderer;
        getComponentRenderer(component: Component): TypeRenderer;
        /** Allows executing code within the global execution space of the simulator. */
        readonly eval: _IGlobalEvaluator;
        private _eval;
        /** Returns a reference to the global runtime script object (which must be initialized first by calling 'Start()' or 'Run()'). */
        readonly rtscript: RuntimeScript;
        private _rtscript;
        /** Returns a reference to the main functional component object (the runtime script object in 'rtscript' must be initialized first by calling 'Start()' or 'Run()'). */
        readonly main: any;
        private _main;
        private _createEval;
        private static _createComponentShell;
        /** Enters the functional component context by moving to the first line and initializing a new component shell function.
          * Note: The current context is push onto the stack before being assigned this new entered context.
          */
        _enter(ctx: ISimulationContext): void;
        /** Executes/evaluates the operation/action at the current line.
          * Returns true if there is another statement pending, and false otherwise.
          */
        step(): boolean;
        /** Begins the simulation by creating a new root context, and queues the first instruction step of the main component.
          * Call 'step()' to advance code execution by a single action.
          * Note: The first time this function is called, nothing is executed until 'step()' is called next.  Subsequent calls
          * to this function discards the whole simulation context tree and starts the simulation over again.
          */
        start(args?: ICallerArguments): Simulator;
        /** Run the rest of the simulation from the current execution point and return the root runtime context.
          * Note: The returned context is of type 'ISimulationContext', which contains the running value in the dynamic 'value' property.
          */
        run(): ISimulationContext;
    }
}
declare namespace FlowScript {
    /** The type of node determines how it should be rendered in the UI. */
    enum VisualNodeTypes {
        Undefined = 0,
        /** The visual element will represent a component. */
        Component = 1,
        /** The visual element will represent a part of the component title. */
        ComponentTitlePart = 2,
        /** The visual element will represent a component parameter. */
        ComponentParameter = 3,
        /** The visual element will represent a component. */
        ComponentReference = 4,
        /** The visual element will represent a block - usually in a component. */
        Block = 5,
        /** The visual element will represent a block reference. */
        BlockReference = 6,
        /** The visual element will represent a block line. */
        Line = 7,
        /** The visual element will represent a block line. */
        LineReference = 8,
        /** The visual element will represent a statement expression. */
        Statement = 9,
        /** The visual element will represent a constant expression. */
        Constant = 10,
        /** The visual element will represent an expression, or nested expression. */
        Expression = 11,
        /** The visual element will represent return targets. */
        ReturnTargets = 12,
        /** The visual element will represent a single return target. */
        ReturnTarget = 13,
        /** The visual element will represent a property. */
        Property = 14,
        /** The visual element will represent property reference. */
        PropertyReference = 15,
        /** The visual element will represent expression arguments. */
        Arguments = 16,
        /** The visual element will represent a single argument. */
        Argument = 17,
        /** The visual element will represent a list of event mappings. */
        EventHandlers = 18,
        /** The visual element will represent a single event mapping. */
        EventHandler = 19,
        /** The visual element holds text only for display purposes. */
        Text = 20
    }
    interface IVisualNodeAppendEvent {
        (subject: VisualNode, index: number, currentNode: VisualNode): void;
    }
    interface IVisualNodeRemoveEvent {
        (subject: VisualNode, index: number, currentNode: VisualNode): void;
    }
    interface IHTMLElementClickEvent {
        (ev: Event): void;
    }
    interface IVisualNodeSelectedEvent {
        (subject: VisualNode, title?: string, ev?: Event): void;
    }
    interface IVisualNodeType<T extends VisualNode> {
        new (item: any, nodeType?: VisualNodeTypes): T;
    }
    interface IVisualNodeElement extends HTMLElement {
        $__fs_vnode: VisualNode;
    }
    interface IVisualNodeVisitor<TNode extends VisualNode, TReturn> {
        visitNode(node: TNode, index: number, count: number): TReturn;
        visitNodes(node: TNode, index: number, count: number, childrenOnly?: boolean): TReturn;
        visitComponent(node: TNode, index: number, count: number): TReturn;
        visitBlock(node: TNode, index: number, count: number): TReturn;
        visitLine(node: TNode, index: number, count: number): TReturn;
        visitStatement(node: TNode, index: number, count: number): TReturn;
        visitProperty(node: TNode, index: number, count: number): TReturn;
        visitConstant(node: TNode, index: number, count: number): TReturn;
    }
    class VisualNode {
        /** References the parent visual node. */
        readonly parent: VisualNode;
        protected _parent: VisualNode;
        /** References the children nested in this visual node. */
        readonly children: VisualNode[];
        protected _children: VisualNode[];
        /** The 'VisualNodeTypes' type this node represents. */
        readonly type: VisualNodeTypes;
        protected _type: VisualNodeTypes;
        readonly item: any;
        protected _item: NamedReference<any> | any;
        /** Returns the current the underlying component reference, or the closest parent component reference.
         * If no component reference is found, null is returned.
         */
        readonly componentRef: ComponentReference;
        /** Returns the current node as a component, or the closest parent component (including any associated with a component reference).
         * If no component is found, null is returned.
         */
        readonly component: Component;
        /** For component type nodes, returns the component referenced by this node, or null otherwise. */
        readonly asComponent: Component;
        /** Returns the current node as a block, or the closest parent block (including any associated with a reference).
         * If no block is found, null is returned.
         */
        readonly block: Block;
        /** For block type nodes, returns the block referenced by this node, or null otherwise. */
        readonly asBlock: Block;
        /** Returns the current node as a line, or the closest parent line (including any associated with a reference).
         * If no line is found, null is returned.
         */
        readonly line: Line;
        /** For line type nodes, returns the line referenced by this node, or null otherwise. */
        readonly asLine: Line;
        /** Returns the current node as an expression, or the closest parent expression.
         * If no expression is found, null is returned.
         */
        readonly expression: Expression;
        /** For expression type nodes, returns the expression referenced by this node, or null otherwise. */
        readonly asExpression: Expression;
        /** Returns the topmost root node in the tree. */
        readonly rootNode: VisualNode;
        /** Returns the selected node, which is tracked by the root node in the tree. */
        readonly selectedNode: VisualNode;
        private _selectedNode;
        /** Returns true if this node is selected. */
        isSelected: boolean;
        /** Any visual UI element to track with this node. */
        visualElement: IVisualNodeElement;
        /** The element that holds the rendered child nodes. If not specified after rendering the parent, 'visualElement' is assumed. */
        containerElement: IVisualNodeElement;
        private _containerElement;
        /** The text to display for this node, if any (for text nodes). */
        readonly text: string;
        /** Any text that should pop up when the user mouses over an element. */
        title: string;
        /** For argument nodes, this is the argument name. */
        paramName: string;
        /** For argument nodes, this is the argument index. */
        paramIndex: number;
        /** Triggered when a node is added or inserted. An 'index' parameter holds the new position. */
        onNodeAdded: EventDispatcher<VisualNode, IVisualNodeAppendEvent>;
        /** Triggered when a node is removed. */
        onNodeRemoved: EventDispatcher<VisualNode, IVisualNodeRemoveEvent>;
        /** Triggered when a node is selected. */
        onNodeSelected: EventDispatcher<VisualNode, IVisualNodeSelectedEvent>;
        constructor(comp: Component);
        constructor(compRef: ComponentReference);
        constructor(block: Block);
        constructor(blockRef: BlockReference);
        constructor(line: Line);
        constructor(lineRef: LineReference);
        constructor(statement: Statement);
        constructor(prop: Property, nodeType: VisualNodeTypes);
        constructor(propRef: PropertyReference);
        constructor(constant: Constant);
        constructor(expr: Expression, nodeType?: VisualNodeTypes);
        constructor(returnTargetMap: ReturnTargetMap);
        constructor(expressionArgs: ExpressionArgs);
        constructor(returnTargets: ReturnTargetMaps);
        constructor(item: string, nodeType?: VisualNodeTypes);
        constructor(item: number, nodeType?: VisualNodeTypes);
        /** Returns a new node based on this node type.
          * Note: Derived types usually override this to return a visual node of their own type. This allows creating a visual
          * tree tailored to the needs of the target user environment (this is usually a browser in most cases).
          * Warning: Derived types accepting more parameters than expected by the base constructor MUST do one of two things:
          *   1. Override the '_CreateNode()' function to provide an implementation that handles the extra parameters, or ...
          *   2. Copy ALL overloads of "createNode()" from the base (here) and re-implement on the derived type.
          *   This is because the constructor of the current instance is used via this function to create new nodes, and passes
          *   only what it expects.  Any other parameters expected by derived types will be undefined.
          */
        createNode(comp: Component): this;
        createNode(compRef: ComponentReference): this;
        createNode(block: Block): this;
        createNode(blockRef: BlockReference): this;
        createNode(line: Line): this;
        createNode(lineRef: LineReference): this;
        createNode(statement: Statement): this;
        createNode(prop: Property, nodeType: VisualNodeTypes): this;
        createNode(propRef: PropertyReference): this;
        createNode(constant: Constant): this;
        createNode(expr: Expression, nodeType?: VisualNodeTypes): this;
        createNode(returnTargets: ReturnTargetMaps): this;
        createNode(returnTargetMap: ReturnTargetMap): this;
        createNode(expressionArgs: ExpressionArgs): this;
        createNode(item: string, nodeType?: VisualNodeTypes): this;
        createNode(item: number, nodeType?: VisualNodeTypes): this;
        protected _CreateNode(item: any, nodeType?: VisualNodeTypes, ...args: any[]): VisualNode;
        protected _castTo<T>(type: {
            new (...args: any[]): T;
        }, throwOnError?: boolean): T;
        /** Adds a visual node to this node. */
        appendNode(node: VisualNode): VisualNode;
        /** Adds a visual node to this node. */
        appendTextNode(text: string, nodeType?: VisualNodeTypes): VisualNode;
        /** Inserts a visual node into this node. */
        insertNode(node: VisualNode, index: number): VisualNode;
        /** Removes a visual node from this node.*/
        removeNode(node: VisualNode): VisualNode;
        /** Searches the parent hierarchy with the given expression.  This is used to detect cyclical references. */
        isInParent(expr: Expression): boolean;
        /** Calls 'isInParent()' with the given expression and generates a cyclical error if found. */
        cyclicalCheck(expr: Expression): void;
        /** Begins rendering the visual tree. */
        render(node?: VisualNode): IVisualNodeElement;
        private _render;
        protected _renderChildren(parentElement?: IVisualNodeElement): IVisualNodeElement;
        createElement<T extends HTMLElement>(name: string, parentElement?: HTMLElement): T & IVisualNodeElement;
        createVisualElement<T extends HTMLElement>(name: string, parentElement?: HTMLElement): T & IVisualNodeElement;
        createContainerElement<T extends HTMLElement>(name: string, parentElement?: HTMLElement): T & IVisualNodeElement;
        private _createErrorElement;
        protected _doSelect(ev: Event, title: string, subject?: this): void;
        protected _doAdded(subject: VisualNode, index: number): void;
        protected _doRemoved(subject: VisualNode, index: number): void;
        /**
         * Render this visual node as a text node.
         */
        renderText(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        /**
         * Render this visual node as a component reference.
         */
        renderComponent(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderReturnTargets(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderReturnTarget(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderArguments(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderArgument(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderComponentTitlePart(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderComponentParameter(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderBlock(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderLine(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderStatement(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderProperty(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderConstant(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement;
        renderValue(valueExpr: Expression, parentElement: IVisualNodeElement, className: string, value: string, valueType: string, title: string, onclick?: IHTMLElementClickEvent): IVisualNodeElement;
        _ShowSelectedStyle(): void;
        _HideSelectedStyle(): void;
    }
}
declare namespace FlowScript {
    interface IHTTPViewRequestListener {
        (view: View, request: Net.CachedRequest, ev?: Event): void;
    }
    interface IViewHandler {
        (view: View): void;
    }
    interface _IViewScript {
        src?: string;
        code: string;
        originalScriptNode?: HTMLScriptElement;
        newScriptNode?: HTMLScriptElement;
        applied?: boolean;
    }
    interface IViewBaseNode extends Node {
        $__view: ViewBase;
    }
    interface IViewBaseElement extends HTMLElement {
        $__view: ViewBase;
    }
    /**
     * Common 'Views' and 'View' shared properties and functions.
     */
    class ViewBase {
        readonly parent: ViewBase;
        protected _parent: ViewBase;
        /** The root node for this view. */
        readonly rootNode: IViewBaseNode;
        protected _rootNode: IViewBaseNode;
        /** The root element for this view. This is 'rootNode', or 'null' is 'rootNode' is not an 'HTMLElement' type.*/
        readonly rootElement: IViewBaseElement;
        /** The node where content will be stored for this view. This defaults to 'rootElement', unless otherwise specified. */
        readonly contentElement: HTMLElement;
        protected _contentElement: HTMLElement;
        /** Returns all elements from within this view type object that matches the given query string. */
        queryElements<T extends HTMLElement>(query: string): NodeListOf<T>;
        /** Returns the first matching element from within this view that matches the given query string. */
        queryElement<T extends HTMLElement>(query: string): T;
        /** Returns the first matching element from within this view that has the given ID. */
        getElementById<T extends HTMLElement>(id: string): T;
        /** Returns all elements from within this view that contains the given attribute name. */
        getElementsByAttribute<T extends HTMLElement>(name: string): NodeListOf<T>;
        /** Sets the value of an input element from within the root element for this view that matches the given ID, then returns the element that was set.
         * If there is no value property, the 'innerHTML' property is assumed.
         * If 'ignoreErrors' is false (default) and no element is found, an error is thrown.
         */
        setElementValueById<T extends HTMLElement>(id: string, value?: string, ignoreErrors?: boolean): T;
        /** Searches the given node and all parents for a view based object. */
        static getViewBase(fromNode: Node, includeSelf?: boolean): ViewBase;
        /**
         * Traverse the view object parent hierarchy to find a view that this view based object is contained within.
         * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
         */
        getParentView(): View;
        /**
         * Traverse the view object parent hierarchy to find a views container that this view based object is contained within.
         * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
         */
        getParentViewsContainer(): Views;
        static getView(fromNode: Node, includeSelf?: boolean): View;
        static getViewsContainer(fromNode: Node, includeSelf?: boolean): Views;
        /**
         * Builds view containers and views from elements within this container.
         */
        buildViews(): this;
    }
    class View extends ViewBase {
        queryOrChildrenOnly?: Net.IHTTPRequestPayload | boolean;
        /** The view that was just loaded, in which the currently executing script belongs. This is undefined otherwise (outside of view script executions). */
        static loadedView: FlowScript.View;
        readonly parent: Views;
        /** Holds a list of view containers that are managed by this view. */
        childViewContainers(): Views[];
        private _childViewContainers;
        /** Returns true if this view is the current view in the parent 'Views' container. */
        isCurrentView(): boolean;
        /** A list of scripts to apply when this view is shown for the first time. */
        _scripts: _IViewScript[];
        /** Set to true when scripts are evaluated so they are not evaluated more than once. */
        readonly scriptsApplied: boolean;
        _scriptsApplied: boolean;
        /** This is true if this view is the one showing in the parent views container. */
        readonly attached: boolean;
        readonly url: string;
        private _url;
        readonly name: string;
        private _name;
        private _request;
        readonly originalHTML: string;
        _oninitHandlers: IViewHandler[];
        _onshowHandlers: IViewHandler[];
        _onhideHandlers: IViewHandler[];
        _onresizeHandlers: IViewHandler[];
        /**
         * Construct a new view from HTML loaded by a URL.
         * @param name A name for this view.
         * @param url The URL of the view to load, if any.
         * @param query Any query string values to add to the URL.
         * @param parent Optionally suggest a parent view container, in case one can't be determined.
         */
        constructor(name: string, url?: string, query?: Net.IHTTPRequestPayload, parent?: Views);
        /**
         * Construct a view from existing DOM elements.
         * @param name A name for this view.
         * @param viewElement The element to use as the content for this view.
         * @param childrenOnly If true, then the child elements of the given view element are removed and added to this view - the given element is ignored and left unchanged.
         * @param rootNode An element to act as the container element for this view. By default a '<DIV>' element is created if not specified.
         * @param parent Optionally suggest a parent view container, in case one can't be determined.
         */
        constructor(name: string, viewElement: HTMLElement, childrenOnly?: boolean, parent?: Views);
        /** Adds a callback that gets executed ONCE when the view is shown.
          * This can be used in view scripts to executed callbacks to run just after a view is attached for the first time.
          */
        oninit(func: IViewHandler): View;
        /** Returns a new 'Views' container that wraps an element nested within this view.
          * Note: If the element exists outside this view, it will not be found.
          * @param elementID The ID of a nested child element within this view.
          * @param existingContentViewName If specified, any child elements of the target element are saved into a new view under this view container.
          * If not specified, the child elements will be cleared out when a view becomes shown.
          * @param showExistingContent If true (default), any existing contents remain visible once copied into a new view.
          * Set this to 'false' to hide the existing contents.
          */
        createViewContainer(elementID: string, existingContentViewName?: string, showExistingContent?: boolean): Views;
        /** Adds a view container to this view and returns it. The container is first removed from any existing view parent. */
        addViewContainer(views: Views): Views;
        /** Removes a view container from this view and returns it. If the container doesn't exist, 'undefined' is returned. */
        removeViewContainer(views: Views): Views;
        /** Find an immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
        getViewContainer(name: string, recursive?: boolean): Views;
        /** Adds a callback that gets executed each time this view is shown. */
        onshow(func: IViewHandler): View;
        show(): View;
        private _doOnShow;
        /** Adds a callback that gets executed each time this view is shown. */
        onhide(func: IViewHandler): View;
        hide(): View;
        private _doOnHide;
        /** Adds a callback that gets executed each time this view changes size. */
        onresize(func: IViewHandler): View;
        private _doOnResize;
        /** Clears all children from the root node. The view is blank after calling this. */
        clear(): void;
        /** Clears all children from the root node and reloads the view. If the view is not loaded yet, then the view is cleared only. */
        reset(): void;
        onloaded(func: IHTTPViewRequestListener): View;
        onerror(func: IHTTPViewRequestListener): View;
        thenLoad(name: string, url: string, payload?: Net.IHTTPRequestPayload, delay?: number): View;
        send(): View;
    }
    /**
     * Holds a list of views dynamically loaded from the server.
     */
    class Views extends ViewBase {
        readonly parent: View;
        readonly name: string;
        private _name;
        /** Returns the number of views in this container. */
        readonly count: number;
        /** Returns the list of all views in this container. */
        readonly views: View[];
        private _views;
        readonly currentView: View;
        private _currentView;
        /** Returns the first view in the collection, or 'null' if empty. */
        readonly firstView: View;
        /** Returns the last view in the collection, or 'null' if empty. */
        readonly lastView: View;
        /**
         * Construct an object to hold a list of views dynamically loaded from the server.
         * @param viewsContainer An HTML element that will act as a container to hold the view elements.
         * Note: All direct child elements of this element are removed each time a new view changes.
         */
        constructor(viewsContainer: Node, containerName?: string);
        /**
         * Construct an object to hold a list of views dynamically loaded from the server.
         * @param viewsContainerElementID The ID of an HTML element on the page that will act as a container to hold the view
         * elements.
         * Note: All direct child elements of this element are removed each time a new view changes.
         */
        constructor(viewsContainerElementID: string, containerName?: string);
        addView(view: View, hidden?: boolean): View;
        removeView(view: View): View;
        /**
         * Creates a new view from HTML loaded from a given URL.
         * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
         * @param name A name for this view.
         * @param url The URL to load the view from. If not specified, a blank view is created.
         * @param payload URL query values. Ignored if 'url' is not specified.
         */
        createView(name: string, url?: string, payload?: Net.IHTTPRequestPayload, rootNode?: HTMLElement): View;
        /**
         * Creates a new view from a DOM element, or its children.
         * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
         * @param name A name for this view.
         * @param element The element to associated with the view (will be removed from any existing parent).  This is the element that will be added and removed from the parent Views container.
         * @param childrenOnly If true, only the children of the specified element are moved into the new view.
         */
        createViewFromElement(name: string, elementOrID: HTMLElement | string, childrenOnly?: boolean): View;
        getView(name: string): View;
        showView(view: View): View;
        showView(viewName: string): View;
        hideCurrentView(): void;
        /** Find the next immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
        getViewContainer(name: string, recursive?: boolean): Views;
        /**
         * Builds view containers and views from elements, starting with the document root, which is 'window.document' by
         * default if no root is specified. The root document object is the default container when building views.
         * When calling this function with no parameters, the default root page view is established, and the other containers
         * and views are extracted and added in nested form based on nested associations.
         * @param rootElement The element to start build the views from.
         */
        static buildViews(documentRoot?: Document): Views;
    }
}
declare namespace FlowScript {
    class Project {
        /** The title of the project. */ title: string;
        /** The project's description. */ description?: string;
        /** The script instance for this project. */
        readonly script: IFlowScript;
        protected _script: IFlowScript;
        /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
          * developers to move expressions easily between scripts.
          * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
          */
        readonly expressionBin: Expression[];
        private _expressionBin;
        onExpressionBinItemAdded: EventDispatcher<Project, (item: Expression, project: Project) => void>;
        onExpressionBinItemRemoved: EventDispatcher<Project, (item: Expression, project: Project) => void>;
        constructor(
        /** The title of the project. */ title: string, 
        /** The project's description. */ description?: string);
        save(): string;
        addToBin(expr: Expression, triggerEvent?: boolean): void;
        removeFromBin(expr: Expression, triggerEvent?: boolean): void;
        isInBin(expr: Expression): boolean;
        private _findChildNode;
    }
    /**
     * Holds a collection of projects.
     */
    class Projects {
        readonly count: number;
        _projects: Project[];
        /**
         * Creates a new project with the given title and description.
         * @param title The project title.
         * @param description The project description.
         */
        createProject(title: string, description?: string): Project;
        /**
         * Creates a new project with the given title and description.
         * @param title The project title.
         * @param description The project description.
         * @param projectType An object of type 'Project' to use to create this project entry.
         */
        createProject<T extends Project>(title: string, description?: string, projectType?: {
            new (title: string, description?: string): T;
        }): T;
    }
}
declare namespace FlowScript {
    /** Contains the default core system types expected by the compiler. Since these core types must always exist, a default
      * type graph is created here for convenience.
      */
    var System: Core.System;
}
