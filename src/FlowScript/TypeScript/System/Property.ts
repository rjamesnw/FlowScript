// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================
    /** Controls access to object instance properties. 
      * Property access security only applies to instance properties of object-based components (components that encapsulate object creation).
      */
    export enum PropertyAccessSecurity {
        /** (default) The property is only accessible by any component within the same project. */
        Internal,
        /** The property is only accessible within the object-based component it is placed, and all nested functional components. */
        Private,
        /** The property is only accessible within the object-based component it is placed, and all nested functional components, including those of derived types. */
        Protected,
        /** The property is accessible by any component from any project. */
        Public
    }

    /** Represents available options for component properties. */
    export interface PropertyOptions {
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

    // ========================================================================================================================

    interface _IInternalPropertyMembers { name: string; _collection: PropertyCollection; _locked: boolean; }

    export interface ISavedProperty extends ISavedTrackableObject {
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

    // ========================================================================================================================

    /** Properties are used with processes and components to store values.
     * In FlowScript, a component's parameters, static properties, and local variables are all in the same local scope.
     * Component properties define the context property names that will be used for that component during runtime.
     */
    export class Property extends TrackableObject implements IReferencedObject {

        static DEFAULT_NAME = '@';

        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this.component ? this.component.script : null; }

        /** The component that this property is for. */
        get component(): Component { return this._collection ? this._collection.component : null; }

        /** A reference to the property collection that contains this property. */
        get collection() { return this._collection; }
        protected _collection: PropertyCollection;

        /** Valid acceptable types for this property. */
        _validTypes: NamespaceObject[];

        get name(): string { return this._name; }
        protected _name: string;

        /** An instance reference string that represents this block in the system. */
        get referenceStr(): string {
            // ... find out which collection it belongs to ...
            var comp = this.component, collectionName: string;
            if (comp) {
                if (comp.parameters.hasProperty(this.name))
                    collectionName = "parameters";
                else if (comp.localVars.hasProperty(this.name))
                    collectionName = "localVars";
                else if (comp.returnVars.hasProperty(this.name))
                    collectionName = "returnVars";
            }
            if (comp && collectionName)
                return comp.referenceStr + "." + collectionName + ".getProperty('" + this.name + "')";
            else
                return this.name;
        }
        getReference(): NamedReference<Property> {
            if (this.script)
                return new NamedReference<Property>(this.referenceStr);
            else
                return NamedReference.fromInstance<Property>(this, null);
        }

        _value: any;
        _isConst: boolean; // (if false [default], then this property can be assigned a value, otherwise it is invalid to be used as the left side of an assignment operation)
        _isStatic: boolean; // (each function gets the same context for the call level; except, where normal context values get reset, static ones do not)
        _isOptional: boolean;
        _isAlias: boolean; // (if this is true, then the supplied argument must be a property itself, whose value may become modified)
        _isInstance: boolean; // (if this is true, then this property represents an object instance property, instead of a context property)
        _validationRegex: RegExp; // (a simple regex to validate values)
        _selections: string[]; // (user defined selections for this property)
        _description: string;

        /** True if this property was defined from a component title. */
        _implicitlyDefined: boolean;

        /** True if this property was defined using the scripting API (via code). */
        _explicitlyDefined: boolean;

        ///** If this is set, then the only valid values for the property are from this referenced enum collection. */
        //?_enum: Enum;
        //** If this is true, then the only values from the associated enum type are allowed. */
        isFixedtoEnum: boolean;

        /** If true, then this property cannot be removed (perhaps a special case that relays on other states). */
        _locked: boolean;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(owner: PropertyCollection, validTypes: NamespaceObject[], name: string, options: PropertyOptions = {}) {
            super();

            this._collection = owner;

            if (options.isAlias && options.isConst)
                throw "A property cannot be both an alias (which represents a variable), and a constant.";

            this._validTypes = validTypes;
            this._name = name;

            if (options.initialValue !== undefined)
                this._value = options.initialValue;
            if (options.validation !== undefined)
                this.validationRegexStr = options.validation;
            if (options.isOptional !== undefined)
                this._isOptional = options.isOptional;
            if (options.isStatic !== undefined)
                this._isStatic = options.isStatic;
            if (options.isConst !== undefined)
                this._isConst = options.isConst;
            if (options.isAlias !== undefined)
                this._isAlias = options.isAlias;
            if (options.isInstance !== undefined)
                this._isInstance = options.isInstance;
        }

        /** Creates an expression wrapper for this property. An optional expression parent can be given. */
        createExpression(parent?: Expression) {
            return new PropertyReference(this, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedProperty): ISavedProperty {
            target = target || <ISavedProperty>{};
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
            super.save(target);
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        get validTypes(): NamespaceObject[] { return this._validTypes; }
        setValidTypes(...types: NamespaceObject[]): Property {
            this._validTypes = types;
            return this;
        }

        /** Set a description for this property. */
        setDescription(desc: string): Property;
        /** Set a description for this property from an array of lines. CRLF (line endings) will be inserted in between each line. */
        setDescription(desc: string[]): Property;
        setDescription(desc: string | string[]): Property {
            if ((<string[]>desc).join)
                desc = (<string[]>desc).join("\r\n");
            this._description = '' + desc;
            return this;
        }

        get validationRegex(): RegExp { return this._validationRegex; }
        set validationRegexStr(pattern: string) {
            this._validationRegex = new RegExp(pattern);
        }

        _getIdentityMsg(): string {
            return "'" + this.name + "'" + (this.component ? " on component '" + this.component.fullTypeName + "'" : "");
        }

        get value(): any { return this._value; }
        set value(value: any) {
            if (this._isConst)
                throw "Cannot set constant property " + this._getIdentityMsg() + " to value '" + value + "'.";
            if (value !== void 0 && this._validationRegex)
                if (typeof value === 'string' && !this._validationRegex.test(value) || !this._validationRegex.test('' + value))
                    throw "Cannot set property " + this._getIdentityMsg() + " to value '" + value + "': Does not match pattern '" + this._validationRegex.source + "'.";
            this._value = value;
        }

        ///** Makes this property reference a set of values as dictated by the specified enum type.
        //  * If 'isFixed' is true (the default), then the developer is forced to select from this list only (no other values allowed).
        //  */
        //setEnum(enm: Enum, isFixed: boolean = true): Property {
        //    this._enum = enm;
        //    this._isFixedtoEnum = isFixed;
        //    return this;
        //}

        remove(): Property {
            if (this._collection)
                this._collection.remove(this);
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString() { return this.component + "::" + this.name; }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface IPropertyCollectionHandler { (collection: PropertyCollection, p: Property, data?: any, ev?: IEventDispatcher<PropertyCollection>): void; }

    export interface ISavedProperties { properties: ISavedProperty[]; }

    // ========================================================================================================================

    export class PropertyCollection {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._component ? this._component.script : null; }

        get component(): Component { return this._component; }
        protected _component: Component;

        private _properties: Property[] = [];
        private _propertyNamedIndex: { [name: string]: Property } = {};

        get length() { return this._length; }
        private _length: number = 0;

        // --------------------------------------------------------------------------------------------------------------------

        _addedEvent = new EventDispatcher<PropertyCollection, IPropertyCollectionHandler>(this);
        _removingEvent = new EventDispatcher<PropertyCollection, IPropertyCollectionHandler>(this);
        _removedEvent = new EventDispatcher<PropertyCollection, IPropertyCollectionHandler>(this);

        constructor(owner: Component, copyFrom?: PropertyCollection) {
            this._component = owner;
            if (copyFrom && copyFrom._length)
                for (var i = 0, n = copyFrom._length; i < n; ++i)
                    this.push(copyFrom._properties[i]);
        }

        /** Adds a callback that triggers just before a property is being removed. */
        onadded(func: IPropertyCollectionHandler, data?: any) { this._addedEvent.add(func, data); }
        protected _doOnAdded(p: Property) { this._addedEvent.trigger(this, <Property><any>p); }

        /** Adds a callback that triggers just before a property is being removed. */
        onremoving(func: IPropertyCollectionHandler, data?: any) { this._removingEvent.add(func, data); }
        protected _doOnRemoving(p: Property) { this._removingEvent.trigger(this, <Property><any>p); }

        /** Adds a callback that triggers just after a property is removed. */
        onremoved(func: IPropertyCollectionHandler, data?: any) { this._removedEvent.add(func, data); }
        protected _doOnRemoved(p: Property) { this._removedEvent.trigger(this, <Property><any>p); }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns true if a property by the specified name already exists.
        * If 'ignore' is specified, that property is ignored. This is used to check new names for renaming purposes.
        */
        hasProperty(name: string, ignore?: Property): boolean {
            var p = !!this._propertyNamedIndex && this._propertyNamedIndex[name];
            return p && p != ignore;
        }

        /** Returns true if the specified property exists in this collection.
        */
        hasPropertyReference(property: Property): boolean {
            return this._properties.indexOf(property) >= 0;
        }

        /** Returns the index of the property that matches the specified name, or -1 if not found. */
        indexOf(name: string): number {
            for (var i = 0, n = this._properties.length; i < n; ++i)
                if (this._properties[i].name == name) return i;
            return -1;
        }

        /** Returns a property by name, or 'undefined' if not found. */
        getProperty(name: string): Property;
        /** Returns a property by numerical index, or 'undefined' if not found. */
        getProperty(index: number): Property;
        getProperty(nameOrIndex: any) { return typeof nameOrIndex == 'number' ? this._properties[nameOrIndex] : this._propertyNamedIndex[nameOrIndex]; }

        // --------------------------------------------------------------------------------------------------------------------

        /** Adds a new property to the collection. */
        push(p: Property): Property {
            if (typeof p != 'object' || !(p instanceof Property) || !p.name)
                throw "Cannot add property to collection: The given argument is not a property, or the name is empty.";
            if (this.hasProperty(p.name))
                throw "Property '" + p + "' already exists in this collection.";
            this._properties.push(p);
            this._propertyNamedIndex[p.name] = p;
            (<_IInternalPropertyMembers><any>p)._collection = this;
            ++this._length;
            this._doOnAdded(p);
            return p;
        }

        /** Adds a property to the collection, replacing any existing property of the same name (only allowed one explicit replace to help debugging). */
        replace(p: Property): Property {
            if (typeof p != 'object' || !(p instanceof Property) || !p.name)
                throw "Cannot add property to collection: The given argument is not a property, or the name is empty.";
            var i = this.indexOf(p.name);
            if (i >= 0) {
                if (this._properties[i]._explicitlyDefined)
                    throw "Property '" + p + "' is already explicitly defined and cannot be replaced again without first removing it from the collection.";
                this._properties[i] = p;
                this._propertyNamedIndex[p.name] = p;
                (<_IInternalPropertyMembers><any>p)._collection = this;
            }
            else p = this.push(p);
            return p;
        }

        private _lockCheck(p: _IInternalPropertyMembers | Property) { if (p && p._locked) throw "Property '" + p + "' cannot be removed."; }

        /** Remove a property by name. */
        remove(name: string): Property;
        /** Remove a property by numerical index. */
        remove(index: number): Property;
        /** Remove a related property by name. */
        remove(p: Property): Property;
        remove(pOrIndex: any): Property {
            if (typeof pOrIndex == 'object' && pOrIndex instanceof Property)
                pOrIndex = (<Property>pOrIndex).name;
            if (typeof pOrIndex == 'number') {
                var p = this._properties[pOrIndex];
                this._lockCheck(p);
                if (p) {
                    this._doOnRemoving(<any>p);
                    this._propertyNamedIndex[p.name] = undefined;
                    --this._length;
                    (<_IInternalPropertyMembers><any>p)._collection = null;
                    p = this._properties.splice(pOrIndex, 1)[0];
                    this._doOnRemoved(<any>p);
                    return p;
                }
            }
            else {
                if (typeof pOrIndex != 'string')
                    pOrIndex = '' + pOrIndex;
                var i = this.indexOf(pOrIndex);
                if (i >= 0) {
                    var p = this._properties[i];
                    this._doOnRemoving(<any>p);
                    this._lockCheck(p);
                    this._propertyNamedIndex[pOrIndex] = undefined;
                    --this._length;
                    (<_IInternalPropertyMembers><any>p)._collection = null;
                    p = this._properties.splice(i, 1)[0];
                    this._doOnRemoved(<any>p);
                    return p;
                }
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        pop(): Property {
            if (!this._properties.length) return void 0;
            var p = this._properties[this._properties.length - 1];
            this._lockCheck(p);
            this._doOnRemoving(p);
            p = this._properties.pop();
            delete this._propertyNamedIndex[p.name];
            --this._length;
            (<_IInternalPropertyMembers><any>p)._collection = null;
            this._doOnRemoved(p);
            return p;
        }

        unshift(p: Property): Property {
            if (typeof p != 'object' || !(p instanceof Property) || !p.name)
                throw "Cannot add property to collection: The given argument is not a property, or the name is empty.";
            if (this.hasProperty(p.name))
                throw "Property '" + p + "' already exists in this collection.";
            this._properties.unshift(p);
            this._propertyNamedIndex[p.name] = p;
            ++this._length;
            (<_IInternalPropertyMembers><any>p)._collection = this;
            this._doOnAdded(p);
            return p;
        }

        shift(): Property {
            if (!this._properties.length) return void 0;
            var p = this._properties[0];
            this._lockCheck(p);
            this._doOnRemoving(p);
            p = this._properties.shift();
            delete this._propertyNamedIndex[p.name];
            --this._length;
            (<_IInternalPropertyMembers><any>p)._collection = null;
            this._doOnRemoved(p);
            return p;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Clear all properties from this collection. */
        clear() {
            for (var i = this._properties.length - 1; i >= 0; --i)
                this.remove(i);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedProperties): ISavedProperties {
            target = target || <ISavedProperties>{};
            target.properties = [];
            for (var i = 0, n = this._properties.length; i < n; ++i)
                target.properties[i] = this._properties[i].save();
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ISavedPropertyReference extends ISavedExpression { propertyPath: string; }

    /** References a component property for use in expressions. */
    export class PropertyReference extends Expression {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._propertyRef ? this.property.script : null; }

        /** The property object that is referenced. */
        get property() { return this._propertyRef.valueOf(); }
        get propertyRef() { return this._propertyRef; }
        private _propertyRef: NamedReference<Property>;

        /** The name of the referenced property. */
        get name(): string { return this.property.name; }

        /** The component that the referenced property belongs to. */
        get component(): Component { return this.property.component; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(property: Property, parent?: Expression) {
            super(parent);

            if (!property || typeof property != 'object' || !(property instanceof Property))
                throw "A valid property object is required.";

            this._propertyRef = property.getReference();
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): Expression {
            return new PropertyReference(this.property, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedPropertyReference): ISavedPropertyReference {
            target = target || <ISavedPropertyReference>{};

            var prop = this.property;

            target.propertyPath = (prop.component ? prop.component.fullTypeName : "") + ":" + prop.name;

            super.save(target);
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString() { return this._propertyRef.toString(); }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
