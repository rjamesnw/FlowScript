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
                    return comp.fullTypeName + "." + collectionName + ".getProperty('" + this.name + "')";
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
//# sourceMappingURL=property.js.map