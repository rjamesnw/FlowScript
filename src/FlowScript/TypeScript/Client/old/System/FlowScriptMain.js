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
// ############################################################################################################################
/// <reference path="_references.ts" />
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
            _super.prototype.init.call(_this_1); // (initialize all currently set core types before returning)
            return _this_1;
        }
        Object.defineProperty(FlowScript.prototype, "Main", {
            get: function () { return this._main; },
            set: function (value) {
                if (typeof value !== 'object' || !(value instanceof FlowScript_1.Component))
                    throw "The given main component reference is not valid.";
                this._main = value;
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
            if (!this.Main)
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
//# sourceMappingURL=FlowScriptMain.js.map