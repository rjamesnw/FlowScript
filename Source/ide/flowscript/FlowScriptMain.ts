// ############################################################################################################################
/// <reference path="_references.ts" />
// ############################################################################################################################
module FlowScript {
    // ========================================================================================================================

    /** The base namespace for all user apps (i.e. "FlowScript.Apps.MyCompanyOrWebsite.MyApp").
      * Make sure to create a unique sub module to prevent conflicts.
      */
    export module Apps {
    }

    // ========================================================================================================================
    // A simple event dispatcher.

    export interface IEventDispatcher<TOwner extends {}> { target: TOwner; }
    export interface IEventDispatcherHandler { (...args: any[]): any };
    export interface IEventDispatcherHandlerInfo<TOwner extends {}> { handler: IEventDispatcherHandler; removeOnTrigger: boolean; data: any; }

    /** Represents an event dispatcher manager. */
    export class EventDispatcher<TOwner extends {}, THandler extends IEventDispatcherHandler> implements IEventDispatcher<TOwner> {
        get target() { return this._owner; }
        private _owner: TOwner;

        protected _handlers: IEventDispatcherHandlerInfo<TOwner>[] = [];

        /** Constructs a new event dispatcher.
          * If 'synchronous' is false (default), then a 'setTimeout()' if 0 is used to trigger events.  This allows following
          * code to complete before events trigger, as objects can be created and attached before they get configured.  If
          * 'synchronous' is true, calling 'trigger()' calls all event handlers immediately.
          */
        constructor(owner: TOwner, public synchronous = false) {
            this._owner = owner;
            if (synchronous && typeof setTimeout != 'function')
                throw "Asynchronous events are not supported in this environment.";
        }

        /** Locate the index of a handler by function reference. */
        indexOf(func: THandler): number {
            for (var i = 0, n = this._handlers.length; i < n; ++i)
                if (this._handlers[i].handler == func)
                    return i;
            return -1;
        }

        /** Add a handler for this event dispatcher.  If the function already exists, the current entry is updated. */
        add(func: THandler, data?: any, removeOnTrigger?: boolean): IEventDispatcherHandlerInfo<TOwner> {
            var i = this.indexOf(func);
            if (i >= 0) {
                var handlerInfo = this._handlers[i];
                if (removeOnTrigger !== void 0)
                    handlerInfo.removeOnTrigger = removeOnTrigger;
            }
            else this._handlers.push(handlerInfo = { handler: func, removeOnTrigger: removeOnTrigger, data: data });
            return handlerInfo;
        }

        /** Remove a handler from this event dispatcher. */
        remove(func: THandler): IEventDispatcherHandlerInfo<TOwner> {
            var i = this.indexOf(func);
            if (i >= 0)
                return this._handlers.splice(i, 1)[0];
            else
                return void 0;
        }

        /** Remove all handlers from this event dispatcher. */
        clear(): void {
            this._handlers.length = 0;
        }

        /** Trigger this event by calling all the handlers. */
        trigger: THandler;

        static _ctor = (() => {
            EventDispatcher.prototype.trigger = <any>(function trigger(...args: any[]) {
                var _this = <EventDispatcher<{}, any>>this;
                args.push(void 0, _this);
                var dataIndex = args.length - 2;
                function _trigger() {
                    for (var i = 0, n = _this._handlers.length; i < n; ++i) {
                        var h = <IEventDispatcherHandlerInfo<any>>_this._handlers[i];
                        args[dataIndex] = h.data;
                        h.handler.apply(_this._owner || _this, args);
                        if (h.removeOnTrigger) { _this._handlers.splice(i, 1); --i; --n; }
                    }
                }
                if (_this.synchronous || typeof setTimeout != 'function')
                    _trigger();
                else
                    setTimeout(_trigger, 0);
            });
        })();
    }

    // ========================================================================================================================

    export interface IParented { _parent: {}; }

    /** Represents a single FlowScript instance. Each instance wraps a single "main" script block. Multiple scripts will have multiple 'IFlowScript' instances. */
    export interface IFlowScript extends Type {
        /** The root type for all other types. */
        System: Core.System;

        /** The main entry component.  When the script starts, this is the first component run. */
        Main: Component;

        /** Resolves a type path under this script.  Script instances are the root of all namespaces and types.
          * Examples: 'System', 'System.String', 'Main' (for the main entry component), 'Tests' (default namespace for test components), etc.
          * @param {function} requiredType A required type reference that the returned type must be an instance of.
          */
        resolve<T extends { new(...args: any[]): any }>(typePath: string, requiredType?: T): Type;

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
        getCompiler<T extends Compiler>(comp: { new(script: IFlowScript, ...args: any[]): T }): T;

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

    // ========================================================================================================================

    //??export class NamedArguments<T> {
    //    [parameterName: string]: T;
    //    constructor(namedValues: { [name: string]: any }) {
    //        if (namedValues)
    //            for (var p in namedValues)
    //                if (Object.prototype.hasOwnProperty.call(namedValues, p))
    //                    this[p] = namedValues[p];
    //    }
    //}

    //??export declare class IndexedArguments<T> {
    //    [parameterIndex: number]: T;
    //    length: number;
    //    constructor(values?: any[]);
    //}

    // ========================================================================================================================

    export interface ISavedScript extends ISavedType { url: string; system: ISavedType; main: ISavedComponent; }

    class FlowScript extends Type implements IFlowScript {
        // --------------------------------------------------------------------------------------------------------------------

        private _url: string;

        private _messages: Message[];
        private _messagesIndex: { [index: number]: Message;[index: string]: Message };

        private _threads: Thread[];

        // --------------------------------------------------------------------------------------------------------------------

        /** All types are added from the System root and onwards. All primitive types are added directly on the root.
          * To add a custom namespace path, see '{FlowScript}.System.add()'.
          */
        System: Core.System;

        private _main: Component;
        get Main(): Component { return this._main; }
        set Main(value: Component) {
            if (typeof value !== 'object' || !(value instanceof Component))
                throw "The given main component reference is not valid.";
            this._main = value;
        }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(main?: Component) {
            super(null, "Script", eval('this'));

            this._messages = [];
            this._messagesIndex = {};
            this._threads = [new Thread(this)]; // (there is always one main thread)

            if (main && main.script != this)
                throw "The custom 'Main' component does not reference this script instance.  When creating components, make sure to pass in the script instance they will be associated with.";

            this.System = new Core.System(this);
            this._main = main || new Core.Main(this);

            super.init(); // (initialize all currently set core types before returning)
        }

        /** Adds a type as a root type for this script.
          * Scripts inherit from 'Type' in order to be "root type containers".  By default, 'System' and 'Main' are two root
          * types automatically added when a new FlowScript instance is created.
          * The added root types are added in a special way as not reference a parent.
          */
        add<T extends Type>(type: T): T;
        /** Adds a type namespace as a root type for this script.
          * Scripts inherit from 'Type' in order to be "root type containers".  By default, 'System' and 'Main' are two root
          * types automatically added when a new FlowScript instance is created.
          * The added root types are added in a special way as not reference a parent.
          */
        add(name: string): Type;
        add(typeOrName: any): Type {
            return super.add(typeOrName);
        }

        /** Removes a type under this type.  You can provide a nested type path if desired.
          */
        remove<T extends Type>(type: T): T;
        /** Removes a type under this type.  You can provide a nested type path if desired.
          * For example, 'A.B.C.D'.
          */
        remove(name: string): Type;
        remove(typeOrName: any): Type {
            return super.remove(typeOrName);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Run the script with the supplied arguments. */
        run(args: ICallerArguments): RuntimeContext {
            if (!this.Main)
                throw "Error: The script environment does not have a 'main' entry point set.";
            return new Compiler(<IFlowScript>this).compileSimulation().start(args).run();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a new compiler of the specified type and associates it with this script environment. */
        getCompiler(): Compiler;
        getCompiler<T extends Compiler>(comp: { new(script: IFlowScript, ...args: any[]): T }): T;
        getCompiler(comp?: any): any {
            if (!comp) comp = Compiler;
            return new comp(this);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Compile the script into JavaScript starting at the specified "main" component property. */
        compile(): string {
            return ""; //?return "// FlowScript Export v0.1.1.1\r\n\r\n" + this.main.compile();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Loads the script from the specified root object (usually from a deserialized JSON string). */
        load(root: ISavedScript): void;
        /** Loads the script from the specified URL or JSON string. If no URL is given, any previously given URL is used,
          * and the script is reloaded.
          */
        load(urlOrJSON?: string): void;
        load(objRootOrURL?: any): void {
            if (typeof objRootOrURL == 'string') {
                if (objRootOrURL) {
                    if ((<string>objRootOrURL).charAt(0) == '{') {
                        this.load(Utilities.Data.JSON.parse(<string>objRootOrURL));
                        return;
                    }
                    this._url = <string>objRootOrURL;
                }
                if (!this._url)
                    throw "No previous URL exists, so a URL must be provided.";
            }
            else {
                var root = <ISavedScript>objRootOrURL;
                this._url = root.url;
            }
        }

        /** Saves the script to a nested tree of objects that can be later serialized to JSON if desired, or just stored in an
          * array as a reference for later (i.e. for undo operations, etc.).
          */
        save(target?: ISavedScript): ISavedScript {
            target = target || <ISavedScript>{};
            target.url = this._url;
            super.save(target);
            return target;
        }

        /** Saves the script to data objects (calls this.save()) and uses the JSON object to serialize them into a string. */
        serialize(): string {
            var saveData = this.save();
            var json = Utilities.Data.JSON.stringify(saveData);
            return json;
        }

        /** Serializes and saves this script to local storage under a specified name. The storage key name is returned. */
        saveToStorage(projectName: string, scriptName?: string, scriptVersion?: string | number): string {
            var json = this.serialize();
            return Storage.saveProjectData(projectName, scriptName || "Script", json, scriptVersion);
        }

        // --------------------------------------------------------------------------------------------------------------------

        registerMessage(message: Message): Message;
        registerMessage(defaultMessagePattern: string, id?: string): Message;
        registerMessage(msgOrPat: any, id?: any): Message { // in case of errors?  Need to look into trapping the events.
            var m: Message = typeof msgOrPat == 'object' && msgOrPat instanceof Message ? msgOrPat : new Message(this, msgOrPat, id);
            if ((<IParented><{}>m)._parent === null || (<IParented><{}>m)._parent === undefined)
                (<IParented><{}>m)._parent = this;
            else if ((<IParented><{}>m)._parent != this) {
                // ... copy message from other script ...
                var _m = new Message(<IFlowScript>this, m.messagePattern, m.id);
                if (m.translationPattern)
                    _m.setTranslation(m.translationPattern);
                m = _m;
            }
            if (m.id in this._messagesIndex)
                throw "Error: A message '" + m.messagePattern + "' with the id '" + m.id + "' already exists.";
            this._messages.push(m);
            this._messagesIndex[m.id] = m;
            return m;
        }

        // --------------------------------------------------------------------------------------------------------------------

        loadSystem() {
            if (!this.System) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onerror = (ev) => {
                    var msg = "Error opening System.xml.";
                    if (document && document.writeln)
                        document.writeln(msg);
                    if (alert)
                        alert(msg);
                };
                xmlhttp.onload = (ev) => {
                    this.System = <Core.System>this._loadTypeXML(xmlhttp.responseXML, null);
                    if (!this.System) {
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
        }

        private _loadTypeXML(typeNode: Node, parentType: Type): Type {
            if (typeNode && typeof typeNode == 'object' && typeNode instanceof Node) {

                var nodeName = typeNode.nodeName, type: Type;

                if (typeNode instanceof Element)
                    if (nodeName == "type") {
                        // ... create a namespace type ...
                        var name: string = typeNode.attributes.getNamedItem('name').value;
                        var type = new Type(parentType, name, this);
                    }
                    else if (nodeName == "component") {
                        // ... create a component type ...
                        var nameAttr = typeNode.attributes.getNamedItem('name');
                        var name: string = nameAttr ? nameAttr.value : null;

                        var titleAttr = typeNode.attributes.getNamedItem('title');
                        var title: string = titleAttr ? titleAttr.value : null;

                        var compTAttr = typeNode.attributes.getNamedItem('componentType');
                        if (!compTAttr)
                            throw "Component type is missing in System.xml for type '" + (parentType ? parentType + "." : "") + (name || title) + "'.";
                        var compType: string = compTAttr ? compTAttr.value : null;

                        try {
                            var comp = type = new Component(parentType, (<any>ComponentTypes)[compType], name, title, this);
                        }
                        catch (e) {
                            throw "Error loading System.xml: " + e;
                        }
                    }
                    else throw "Unknown element name '" + nodeName + "' in System.xml.";

                for (var i = 0, n = typeNode.childNodes.length; i < n; ++i)
                    this._loadTypeXML(typeNode.childNodes[i], type);

                return type;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    export function isFlowScriptObject(value: any): boolean { return typeof value == 'object' && value instanceof FlowScript; }

    // ========================================================================================================================

    export module Storage {

        export var projectSaveDataSuffix = "-save";

        export function makeProjectDataKeyName(projectName: string, dataTypeName: string, version?: string | number) {
            if (!projectName) throw "A project name is required.";
            if (!dataTypeName) throw "A project data type name is required.";
            if (projectName == delimiter) projectName = ""; // (this is a work-around used to get the prefix part only)
            if (dataTypeName == delimiter) dataTypeName = ""; // (this is a work-around used to get the prefix part only)
            return storagePrefix + projectSaveDataSuffix + delimiter + projectName + (dataTypeName ? delimiter + dataTypeName : "") + (version ? delimiter + version : "");
        }

        /** Saves project data and returns a storage key that can be used to pull the data directly. */
        export function saveProjectData(projectName: string, dataTypeName: string, value: string, version?: string | number): string {
            if (!projectName) throw "A project name is required.";
            if (!dataTypeName) throw "A project data type name is required.";
            var store = getStorage(StorageType.Local);
            var key = makeProjectDataKeyName(projectName, dataTypeName, version);
            store.setItem(key, value);
            return key;
        }

        /** Loads project data. */
        export function loadProjectData(projectName: string, dataTypeName: string, version?: string | number): string {
            if (!projectName) throw "A project name is required.";
            if (!dataTypeName) throw "A project data type name is required.";
            var store = getStorage(StorageType.Local);
            var key = makeProjectDataKeyName(projectName, dataTypeName, version);
            return store.getItem(key);
        }

        export interface ISavedProjectDataInfo { projectName: string; dataName: string; version: string; toString: typeof Object.prototype.toString }

        export function getSavedProjectDataList(): ISavedProjectDataInfo[] {
            var prefix = makeProjectDataKeyName(delimiter, delimiter);
            var list: ISavedProjectDataInfo[] = [];
            var store = getStorage(StorageType.Local);
            var toStrFunc = function () { return this.projectName + (this.dataName ? ", " + this.dataName : "") + (this.version ? ", " + this.version : ""); };
            for (var i = 0, n = store.length; i < n; ++i) {
                var key = store.key(i);
                if (key.substring(0, prefix.length) == prefix) {
                    var parts = key.split(delimiter);
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
    }

    // ========================================================================================================================

    /** Creates a new empty script instance. */
    export function createNew(): IFlowScript {
        return <IFlowScript>new FlowScript();
    };

    /** Creates a new script instance from a given URL. */
    export function createFrom(url: string): IFlowScript {
        var fs = <IFlowScript>new FlowScript();
        fs.load(url);
        return fs;
    };

    /** Returns a simple checksum from a given string. */
    export function getChecksum(text: string): number {
        var chksum = 0;
        if (text !== void 0 && text !== null && typeof text !== 'string') text = '' + text;
        if (text) {
            chksum = text.length; // (let the length be part of it [i.e. '\0\0' is different from '\0\0\0\0'])
            for (var i = 0, im = 1, n = text.length; i < n; ++i, ++im)
                chksum += text.charCodeAt(i) * im; // ('*im' [index multiplier] so that 'ABC' [65*1,66*2,67*3=398] !== 'CBA' [67*1,66*2,65*3=394])
        }
        return chksum;
    }

    /** Copies an object's own instance properties to another target object. */
    export function copyProperties(source: { [name: string]: any }, target?: { [name: string]: any }): {};
    /** Copies an object's own instance properties to another target object. */
    export function copyProperties(source: { [index: number]: any }, target?: { [index: number]: any }): {};
    export function copyProperties(source: { [name: string]: any }, target?: { [name: string]: any }): {} {
        if (!source) return target;
        if (!target) target = {};
        for (var p in source)
            if (Object.prototype.hasOwnProperty.call(source, p))
                target[p] = source[p];
        return target;
    }

    /* Checks if an object instance is empty. */
    export function isObjectEmpty(obj: {}): boolean {
        if (obj)
            for (var p in obj)
                if (Object.prototype.hasOwnProperty.call(obj, p))
                    return false;
        return true;
    }

    // ========================================================================================================================
}

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
