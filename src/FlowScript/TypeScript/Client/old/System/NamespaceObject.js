// ############################################################################################################################
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
              * Derived types take note: '_parent' is NOT null at the first type when traversing the type hierarchy.  The 'parent' getter property should be used.
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
         * Initialize the sub-type derived from this base type, including all child types.
         * This allows to first construct the type tree so references exist prior to configuring the types further.
         * Note: You MUST call this base type from the derived type to continue to call 'init()' on all child types as well.
         */
        Type.prototype.init = function () {
            if (this._nestedTypes)
                for (var types = this._nestedTypes, i = 0, n = types.length; i < n; ++i)
                    types[i].init();
        };
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
          * See also: assignableTo()
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
            for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) { // ('parts[0]' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
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
        NamedReference.prototype.valueOf = function () { return this.root && (this.path ? eval("this.root." + this.path) : this.root) || void 0; };
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
//# sourceMappingURL=type.js.map