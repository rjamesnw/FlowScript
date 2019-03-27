// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface ISavedTrackableObject { id?: string; type?: string; }

    export interface IUnreconciledReference {
        /** The ID of an object not yet in the system. */
        id: string;
        /** The instance reference of the object once loaded. */
        reconciledObject: any;
        /** A list of objects and properties [by names or numeric indexes] to be updated when the reference becomes available. */
        updateTargets: { target: {}; propertyName: string; }[];
        /** Callbacks to execute which are waiting on an object to be loaded. Usually 'updateTargets' is good enough.  Call-backs are for any special cases. */
        callbacks: { (ref: IUnreconciledReference): void }[];
    }

    /** Provides properties and methods for tracking objects for save and load operations. */
    export class TrackableObject {
        // --------------------------------------------------------------------------------------------------------------------
        static objects: { [id: string]: any } = {};
        static register(obj: TrackableObject): string { var id = obj._id || ((<Writeable<TrackableObject>>obj)._id = Utilities.createGUID(false)); TrackableObject.objects[id] = obj; return id; }
        //? static unreconciledQueue: IUnreconciledReference[];
        // --------------------------------------------------------------------------------------------------------------------
        /** The globally unique identified for this object, which allows tracking this object on multiple machines.  */
        readonly _id: string = TrackableObject.register(this);
        /** The constructor function name used to create this object instance. */
        readonly _type: string = Utilities.getFunctionName(this.constructor);
        // --------------------------------------------------------------------------------------------------------------------
        /** The script instance this object belongs to. Derived types should override this to return the proper reference. */
        get script(): IFlowScript { return this._script; }
        protected _script: IFlowScript; // (the script this type belongs to - copied down from the root as types are added)
        // --------------------------------------------------------------------------------------------------------------------
        constructor(script?: IFlowScript) { this._script = script || (isFlowScriptObject(this) ? <any>this : void 0); }
        // --------------------------------------------------------------------------------------------------------------------
        save(target?: ISavedTrackableObject): ISavedTrackableObject {
            target = target || <ISavedTrackableObject>{};
            target.id = '' + this._id;
            target.type = '' + this._type;
            return target;
        }
        load(target?: ISavedTrackableObject): this {
            if (target) {
                (<Writeable<TrackableObject>>this)._id = target.id;
                (<Writeable<TrackableObject>>this)._type = target.type;
            }
            return this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        /** Release this object from the internal list of tracked objects. Derived implementations may perform other cleanup tasks as well. */
        dispose() {
            delete TrackableObject.objects[this._id];
        }
        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ITemplateType {
        name: string;
        expectedBaseType: NamespaceObject;
        defaultType: NamespaceObject;
    }

    export interface ISavedNamespaceObject extends ISavedTrackableObject {
        name: string;
        /** Am optional help tip for this type. */
        description?: string;
        comment: string;
        nestedTypes: ISavedNamespaceObject[];
    }

    // ========================================================================================================================

    /** The base class for all namespace associated objects.  This base class contains meta data describing objects within the namespace.
      * Note: Each name in namespace path is created by using empty type namespace objects.
      */
    export class NamespaceObject extends TrackableObject {
        // --------------------------------------------------------------------------------------------------------------------
        // Some special internal types. 

        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to `Core.Any` but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types internally;
          * however, some internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        static All: Core.All;
        /** Use internally with component return types to infer the resulting type based on given arguments. */
        static Inferred: Core.Inferred;

        // --------------------------------------------------------------------------------------------------------------------

        // /** A user defined visual element to associate with this component. This is not used internally. */
        // visualElement: HTMLElement;

        /** A user defined arbitrary value to associate with this component. This is not used internally. */
        tag: any;

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a reference to the parent type.  If there is no parent, or the parent is the script root namespace, then 'null' is returned.
          * Note: Every type has a reference to the underlying script, which is the root namespace for all types.
          * Derived types take note: The private field '_parent' is NOT null at the first type when traversing the type hierarchy.  The 'parent' getter property should be used.
          */
        get parent(): NamespaceObject { return this._parent != this.script ? this._parent : null; }
        /** Sets a new parent type for this type.  The current type will be removed from its parent (if any), and added to the given parent. */
        set parent(parent: NamespaceObject) {
            if (this._parent)
                this._parent.remove(this);
            if (parent)
                parent.add(this);
        }
        private _parent: NamespaceObject;

        /** Traverses up to the root to find and return the script, which is root namespace for all types. */
        get script(): IFlowScript { return this._parent ? this._parent.script : (isFlowScriptObject(this) ? <IFlowScript><any>this : null); }

        /** A developer comment for this type. */
        comment: string;

        /** An optional help tip for this type. */
        description: string
        /** Set a description for this type. */
        setDescription(desc: string): this;
        /** Set a description for this type from an array of lines. CRLF (line endings) will be inserted in between each line. */
        setDescription(desc: string[]): this;
        setDescription(desc: string | string[]): this {
            if ((<string[]>desc).join)
                desc = (<string[]>desc).join("\r\n");
            this.description = '' + desc;
            return this;
        }

        /** A reference to an inherited type, if any.  Some types (such as objects) inherit properties from their super types if specified. */
        get superType() { return this._superType; }
        set superType(value) { this._superType = value; }
        private _superType: Component = null;

        /** The nested child types under this type. */
        get nestedItems() { return this._nestedItems; }
        protected _nestedItems: NamespaceObject[];

        /** A named index of each nested child type. */
        get nestedNSIndex() { return this._nestedNSIndex; }
        protected _nestedNSIndex: { [index: string]: NamespaceObject };

        /** Holds a list of template parameters required for template component types. */
        get templateTypes() { return this._templateTypes; }
        protected _templateTypes: ITemplateType[]; // (used if this type represents a template type that requires other types to be given)
        //protected _templatedTypes: { [index: string]: Type } = {}; // ()

        get name(): string { return this._name || "{Unnamed Type, ID " + this._id + "}"; }
        set name(value: string) {
            if (!value) throw "Type error: A valid type name is required.";
            var newName = typeof value === 'string' ? value : '' + value;
            if (newName.substring(0, 3) == '$__') throw "Names cannot start with the special system reserved prefix of '$__'.";
            if (newName.indexOf('.') >= 0) throw "Names cannot contain a dot '.' as that is used as a namespace item separator.";
            if (this.parent && this.parent.exists(newName, this)) throw "A type by the name '" + newName + "' already exists.";
            if (this._name && this.parent && this.parent._nestedNSIndex)
                delete this.parent._nestedNSIndex[this._name]; // (if '_nestedTypesIndex' exists, then there is a parent, and this item is being renamed; '_nestedTypesIndex' is undefined when this is set in the constructor)
            this._name = newName;
            if (this.parent && this.parent._nestedNSIndex)
                this.parent._nestedNSIndex[this._name] = this;
        }
        private _name: string;

        /** Returns a name that is safe to use as a normal identifier for this type (using characters that will support direct dot access - used with code output rendering). */
        get safeName(): string {
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
                while (this.parent.exists(safeName + i))++i;
                safeName = safeName + i;
            }
            return safeName;
        }

        /** Return the parent namespace for this type.
          * Namespaces group "like minded" components together - usually those that operate on related data types.
          */
        get namespace(): string {
            if (!this.parent) return "";
            var ns: string[] = [], t = this.parent;
            while (t) (ns.push(t._name), t = t.parent);
            return ns.reverse().join('.');
        }

        /** Return the parent "safe" namespace for this type (using characters that will support direct dot access - used with code output rendering).
          * Namespaces group "like minded" components together - usually those that operate on related data types.
          */
        get safeNamespace(): string {
            if (!this.parent) return "";
            var ns: string[] = [], t = this.parent;
            while (t) (ns.push(t.safeName), t = t.parent);
            return ns.reverse().join('.');
        }

        /** The full namespace + type name. */
        get fullTypeName(): string { var ns = this.namespace; if (ns) return ns + '.' + this._name; else return this._name; }

        /** The full "safe" namespace + type name (using characters that will support direct dot access - used with code output rendering). */
        get safeFullTypeName(): string { var ns = this.safeNamespace; if (ns) return ns + '.' + this.safeName; else return this.safeName; }

        private _initialized: boolean; // (true when 'init()' gets called)

        /** Creates a new type object, which also acts as a namespace name in a type graph.
          * @param {NamespaceObject} parent The parent type of this type, or 'null' if this is the root type.
          * @param {string} name The name for this type.
          * @param {IFlowScript} script (optional) The script to associate with this type if there is no parent.  If a parent is specified, this is ignored.
          */
        constructor(parent: NamespaceObject, name: string, script?: IFlowScript) {
            super(script || (parent ? parent.script : void 0));

            if (parent !== null && (typeof parent !== 'object' || !(parent instanceof NamespaceObject)))
                throw "Type error: A valid parent object is required.  If this is a root type, pass in 'null' as the parent value.";

            if (name !== void 0)
                this.name = name; // (this MUST be first before adding to allow the normal add process to index this item by name [creates the named index object])

            if (parent)
                parent.add(this); // (sets the script reference as well)
        }

        /**
        * Initializes this type, including all child types, where not already initialized.
        * This allows to first construct the type hierarchy so references exist prior to configuring the types further.
        * Note: This only initializes from this type downwards, so if adding types in multiple locations, called this
        * function on the root script instance is better to make sure all new types added get initialized.
        * @see onInit() Used to initialize custom derived types.
        */
        initialize() {
            if (!this._initialized) {
                this.onInit();
                this._initialized = true;
            }

            if (this._nestedItems)
                for (var types = this._nestedItems, i = 0, n = types.length; i < n; ++i)
                    types[i].initialize();
        }

        /**
        * Initialize the sub-type derived from this type, including all child types.
        * This allows to first construct the type tree so references exist prior to configuring the types further.
        */
        protected onInit(): void { }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedNamespaceObject): ISavedNamespaceObject {
            target = target || <ISavedNamespaceObject>{};

            super.save(target);

            target.name = this.name;
            target.comment = this.comment;
            target.description = this.description;

            target.nestedTypes = [];
            if (this.nestedItems)
                for (var i = 0, n = this.nestedItems.length; i < n; ++i)
                    target.nestedTypes[i] = this._nestedItems[i].save();

            return target;
        }

        load(target?: ISavedNamespaceObject): this {
            if (target) {
                this.name = target.name;
                this.comment = target.comment;
                this.description = target.description;

                super.load(target);

                if (target.nestedTypes)
                    for (var i = 0, n = target.nestedTypes.length; i < n; ++i)
                        this.nestedItems[i] = NamespaceObject.load(this, <ISavedComponent>target.nestedTypes[i]);
            }

            return this;
        }

        static load(parent: NamespaceObject, target?: ISavedNamespaceObject): NamespaceObject {
            if (target) {
                var compInfo = <ISavedComponent>target;
                var type: NamespaceObject;
                if (compInfo.componentType) {
                    type = new Component(parent, compInfo.componentType, compInfo.name, compInfo.title).load(compInfo);
                } else {
                    type = new NamespaceObject(parent, target.name).load(target);
                }
                type.load(target);
            }

            return null;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a string that identifies the signature of the given types combined. This is used internally for mapping purposes. */
        static getCompositeTypeKey(...compositeTypes: NamespaceObject[]): string;
        /** Returns a string that identifies the signature of the given types combined. This is used internally for mapping purposes. */
        static getCompositeTypeKey(compositeTypes: NamespaceObject[]): string;
        static getCompositeTypeKey(compositeTypes: any): string {
            var types: { [index: number]: NamespaceObject; length: number; } = <any>(arguments.length == 1 && typeof compositeTypes == 'object' && 'length' in compositeTypes
                ? <IArguments>compositeTypes : arguments);
            var key: string[] = [];
            for (var i = 0, n = types.length; i < n; ++i)
                key.push(types[i].fullTypeName);
            return key.join(",");
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns true if the given type matches this type *exactly* (that means, for instance, "Any" does NOT match "String").
          * If the underlying type or the given type is of the special internal "All" type, then true is always returned.
          */
        is(type: NamespaceObject): boolean {
            var thisFullname = this.fullTypeName;
            if (thisFullname == "All") return true;
            else if (typeof type == 'object') {
                var ftn = type.fullTypeName; // (read once, since this is dynamic)
                if (ftn == "All" || ftn == thisFullname) return true;
            }
            else return false;
        }

        /** Returns true if the current type can be assigned TO the specified type.
          * If this type or the given type is of "Any" type, then true is always returned.
          * This function must be overloaded to provide specialized results.  When overriding, instead of returning false, make
          * sure to transfer the call to the super function to allow parent types in the hierarchy to validate as well.
          * There's no need to overload this for object type inheritance.  The default implementation already checks the super types.
          */
        assignableTo(type: NamespaceObject): boolean {
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
        }

        /** Returns true if the given type can be assigned to the current type.
          * If this type or the given type is of "Any" type, then true is always returned.
          * Note: Don't override this function.  If needed, override "assignableTo()" (see the type info for more details).
          * @see assignableTo()
          */
        assignableFrom(type: NamespaceObject): boolean {
            return typeof type == 'object' && type.assignableTo && type.assignableTo(this);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Checks if a namespace item exists.  You can also provide a nested type path.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        exists(name: string, ignore?: NamespaceObject): boolean;
        /** Checks if the given namespace item exists under this item.
          */
        exists(type: NamespaceObject, ignore?: NamespaceObject): boolean;
        exists(nameOrType: any, ignore?: NamespaceObject): boolean {
            if (nameOrType === void 0 || nameOrType === null || !this._nestedNSIndex) return false;
            var paramType = typeof nameOrType;
            if (paramType === 'object' && nameOrType instanceof NamespaceObject) {
                var type = this._nestedNSIndex[(<NamespaceObject>nameOrType)._name];
                return !!type && type != ignore;
            }
            var t = this.resolve(nameOrType);
            return !!t && t != ignore;
        }

        /** Resolves a namespace path under this item.  You can provide a nested path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          * If not found, then null is returned.
          * @param {function} requiredType A required type reference that the returned type must be an instance of.
          */
        resolve<T extends { new(...args: any[]): any }>(typePath: string, requiredType?: T): NamespaceObject {
            if (typePath === void 0 || typePath === null || !this._nestedNSIndex) return null;
            var parts = (typeof typePath !== 'string' ? '' + typePath : typePath).split('.'), t: NamespaceObject = this;
            for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) {
                // (note: 'parts[0]?0:1' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                var type = t._nestedNSIndex[parts[i]];
                if (!type)
                    return null;
                else
                    t = type;
            }
            return requiredType ? (t instanceof requiredType ? t : null) : t;
        }

        /** Adds the given type under this type.
          */
        add<T extends NamespaceObject>(type: T): T;
        /** Adds a new namespace name under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        add(name: string): NamespaceObject;
        add(typeOrName: any): NamespaceObject {
            if (typeOrName === void 0 || typeOrName === null)
                throw "Cannot add an empty type name/path to the namespace '" + this.fullTypeName + "'.";
            if (this.exists(typeOrName))
                throw "The type '" + typeOrName + "' already exists in the namespace '" + this.fullTypeName + "'.";
            if (typeof typeOrName !== 'object' || !(typeOrName instanceof NamespaceObject)) {
                var ns = ('' + typeOrName).split('.'), t: NamespaceObject = this;
                for (var i = (ns[0] ? 0 : 1), n = ns.length; i < n; ++i) // ('ns[0]' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                    t = new NamespaceObject(t, ns[i]);
                return t;
            }
            if ((<NamespaceObject>typeOrName).parent && (<NamespaceObject>typeOrName).parent !== this)
                throw "Type error: Cannot add a type that is already the child of another type.";
            (<NamespaceObject>typeOrName)._parent = this;
            (<NamespaceObject>typeOrName)._script = isFlowScriptObject(this) ? <IFlowScript><any>this : this._script || (<NamespaceObject>typeOrName)._script;
            if (!this._nestedItems)
                this._nestedItems = [];
            if (!this._nestedNSIndex)
                this._nestedNSIndex = {};
            this._nestedItems.push(typeOrName);
            this._nestedNSIndex[(<NamespaceObject>typeOrName).name] = typeOrName;
            return typeOrName;
        }

        remove<T extends NamespaceObject>(type: T): T;
        /** removes a type under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        remove(name: string): NamespaceObject;
        remove(typeOrName: any): NamespaceObject {
            if (typeOrName === void 0 || typeOrName === null)
                throw "Cannot remove an empty type name/path from the namespace '" + this.fullTypeName + "'.";

            var parent: NamespaceObject; // (since types can be added as roots to other types [i.e. no parent references], need to remove type objects as immediate children, not via 'resolve()')

            if (typeof typeOrName == 'object' && typeOrName instanceof NamespaceObject) {
                var t = <NamespaceObject>typeOrName;
                if (!this._nestedNSIndex[t.name])
                    throw "Cannot remove type: There is no child type '" + typeOrName + "' under '" + this.fullTypeName + "'.";
                parent = this;
            }
            else {
                var t = this.resolve(typeOrName);
                if (t) parent = t.parent;
            }

            if (t && parent) {
                delete parent._nestedNSIndex[t.name];
                var i = parent._nestedItems.indexOf(t);
                if (i >= 0) parent._nestedItems.splice(i, 1);
                t._parent = null;
                t._script = null;
            }

            return t;
        }

        /** Remove this type from the parent. */
        detach(): this {
            if (this._parent)
                this._parent.remove(this);
            return this;
        }

        /** Detaches this type and removes the object from internal tracking. Derived implementations by perform other cleanup tasks as well. */
        dispose() {
            this.detach();
            super.dispose();
        }

        /** Sets a type for template types using the given name, default type, and any expected based type (as a constraint).
          * This only works for types that represent templates.
          */
        defineTemplateParameter(name: string, defaultType: NamespaceObject = this.script.System.Any, expectedBaseType: NamespaceObject = this.script.System.Any): NamespaceObject {
            if (!this._templateTypes)
                this._templateTypes = [];

            for (var i = 0; i < this._templateTypes.length; ++i)
                if (this._templateTypes[i].name == name)
                    throw "Type '" + this + "' already has a template parameter named '" + name + "'.";

            this._templateTypes.push({ name: name, defaultType: defaultType, expectedBaseType: expectedBaseType });
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a type from this template type using the supplied types.  This only works for types that represent templates. */
        createTemplateType(templateTypes: NamespaceObject[]): NamespaceObject {
            if (!templateTypes || templateTypes.length == 0) return this;
            if (!this._templateTypes || !this._templateTypes.length)
                throw "Type '" + this + "' does not represent a template type.";
            // var templateType = new Type(null, this.name, this.script);
            // templateType._parent = this; // (one way back only, as this is a dynamic type that is never added to the meta type tree)
            var typeNames: string[] = [];
            for (var i = 0; i < templateTypes.length; ++i)
                typeNames.push(templateTypes[i].fullTypeName);
            var templateTypeName = this.name + "<" + typeNames.join(',') + " > ";
            var child = this.resolve(templateTypeName);
            if (child) return child;
            var templateType = new NamespaceObject(this, templateTypeName, this.script);
            return templateType;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** An instance reference string that represents this type in the type hierarchy.
         * Reference strings are used instead of object references to locate components, blocks, or lines. This is especially
         * handy in cases where an item might get deleted and later restored. In such case the system can remake any connections.
         * @see getReference()
         */
        get referenceStr(): string {
            // if (this.parent != null)
            //     return this.parent.referenceStr + ".$('" + Utilities.replace(this.name, "'", "\'") + "')";
            // else
            //? x^ Because this is now done directly on the script objects.
            return NamedReference.fromScriptPath(this.script, "$('" + Utilities.replace(this.fullTypeName, "'", "\'") + "')").fullPath;
        }

        /** Gets a @type {NamedReference} reference instance that represents this type in the type hierarchy. 
         * @see referenceStr
         */
        getReference(): NamedReference<this> {
            if (this.script)
                return new NamedReference<this>(this.referenceStr);
            else
                return NamedReference.fromInstance<this>(this, null);
        }

        // /** Used to dereferences a type by name. 
        //  * @see referenceStr */
        // private get $() { return this._nestedTypesIndex; }
        //? This is now done directly on the script objects.

        // --------------------------------------------------------------------------------------------------------------------

        toString() { return this.fullTypeName; }
        valueOf() { return this.fullTypeName; }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export module Core {
        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to "Any", but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types; however, some
          * internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        export class All extends NamespaceObject {
            constructor() { super(null, "All"); }
            assignableTo(type: NamespaceObject): boolean {
                return true;
            }
        }

        export class Event extends NamespaceObject { // (a block of script)
            constructor(parent: NamespaceObject) { super(parent, "Event"); }
            assignableTo(type: NamespaceObject): boolean {
                if (typeof type !== 'object' || !(type instanceof Component)) return false;
                switch (type.fullTypeName) {
                    case this.script.System.Event.fullTypeName:
                        return true;
                }
                return super.assignableTo(type);
            }
        }

        export class Inferred extends NamespaceObject { // (a type that is inferred by the given arguments)
            constructor() { super(null, "Inferred"); }
            assignableTo(type: NamespaceObject): boolean {
                if (typeof type !== 'object' || !(type instanceof Component)) return false;
                return super.assignableTo(type);
            }
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
