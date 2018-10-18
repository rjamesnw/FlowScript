// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface ISavedTrackableObject { id: string; type: string; }

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
        static register(obj: TrackableObject): string { var id = obj._id || (obj._id = Utilities.createGUID(false)); TrackableObject.objects[id] = obj; return id; }
        static unreconciledQueue: IUnreconciledReference[];
        // --------------------------------------------------------------------------------------------------------------------
        _id: string = TrackableObject.register(this);
        _type: string = Utilities.getFunctionName(this.constructor);
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
        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ITemplateType {
        name: string;
        expectedBaseType: Type;
        defaultType: Type;
    }

    export interface ISavedType extends ISavedTrackableObject { name: string; comment: string; nestedTypes: ISavedType[] }

    // ========================================================================================================================

    /** The base class for all type objects, which contains meta data describing types within a namespace.
      * Note: Each name in namespace path is created by using empty type objects.
      */
    export class Type extends TrackableObject {
        // --------------------------------------------------------------------------------------------------------------------
        // Some special internal types. 

        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to "Any", but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types; however, some
          * internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        static All: Core.All;
        /** Use internally with component return types to infer the resulting type based on given arguments. */
        static Inferred: Core.Inferred;

        // --------------------------------------------------------------------------------------------------------------------

        /** A user defined visual element to associate with this component. This is not used internally. */
        visualElement: HTMLElement;

        /** A user defined arbitrary value to associate with this component. This is not used internally. */
        tag: any;

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a reference to the parent type.  If there is no parent, or the parent is the script root namespace, then 'null' is returned.
          * Note: Every type has a reference to the underlying script, which is the root namespace for all types.
          * Derived types take note: '_parent' is NOT null at the first type when traversing the type hierarchy.  The 'parent' getter property should be used.
          */
        get parent(): Type { return this._parent != this.script ? this._parent : null; }
        /** Sets a new parent type for this type.  The current type will be removed from its parent (if any), and added to the given parent. */
        set parent(parent: Type) {
            if (this._parent)
                this._parent.remove(this);
            if (parent)
                parent.add(this);
        }
        private _parent: Type;

        /** Traverses up to the root to find and return the script, which is root namespace for all types. */
        get script(): IFlowScript { return this._parent ? this._parent.script : (isFlowScriptObject(this) ? <IFlowScript><any>this : null); }

        /** A developer comment for this type. */
        comment: string;

        /** A reference to an inherited type, if any.  Some types (such as objects) inherit properties from their super types if specified. */
        get superType() { return this._superType; }
        set superType(value) { this._superType = value; }
        private _superType: Component = null;

        /** The nested child types under this type. */
        get nestedTypes() { return this._nestedTypes; }
        protected _nestedTypes: Type[];

        /** A named index of each nested child type. */
        get nestedTypesIndex() { return this._nestedTypesIndex; }
        protected _nestedTypesIndex: { [index: string]: Type };

        /** Holds a list of template parameters required for template component types. */
        get templateTypes() { return this._templateTypes; }
        protected _templateTypes: ITemplateType[]; // (used if this type represents a template type that requires other types to be given)

        get name(): string { return this._name || "{Unnamed Type, ID " + this._id + "}"; }
        set name(value: string) {
            if (!value) throw "Type error: A valid type name is required.";
            var newName = typeof value === 'string' ? value : '' + value;
            if (newName.substring(0, 3) == '$__') throw "Names cannot start with the special system reserved prefix of '$__'.";
            if (this.parent && this.parent.exists(newName, this)) throw "A type by the name '" + newName + "' already exists.";
            this._name = newName;
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

        /** Creates a new type object, which also acts as a namespace name in a type graph.
          * @param {Type} parent The parent type of this type, or 'null' if this is the root type.
          * @param {string} name The name for this type.
          * @param {IFlowScript} script (optional) The script to associate with this type if there is no parent.  If a parent is specified, this is ignored.
          */
        constructor(parent: Type, name: string, script?: IFlowScript) {
            super(script || (parent ? parent.script : void 0));

            if (parent !== null && (typeof parent !== 'object' || !(parent instanceof Type)))
                throw "Type error: A valid parent object is required.  If this is a root type, pass in 'null' as the parent value.";

            if (name !== void 0)
                this.name = name;

            if (parent)
                parent.add(this); // (sets the script reference as well)
        }

        /**
         * Initialize the sub-type derived from this base type, including all child types.
         * This allows to first construct the type tree so references exist prior to configuring the types further.
         * Note: You MUST call this base type from the derived type to continue to call 'init()' on all child types as well.
         */
        init(): void {
            if (this._nestedTypes)
                for (var types = this._nestedTypes, i = 0, n = types.length; i < n; ++i)
                    types[i].init();
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedType): ISavedType {
            target = target || <ISavedType>{};

            target.name = this.name;
            target.comment = this.comment;

            target.nestedTypes = [];
            if (this.nestedTypes)
                for (var i = 0, n = this.nestedTypes.length; i < n; ++i)
                    target.nestedTypes[i] = this._nestedTypes[i].save();

            super.save(target);

            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a string that identifies the signature of the given types combined. This is used internally for mapping purposes. */
        static getCompositeTypeKey(...compositeTypes: Type[]): string;
        /** Returns a string that identifies the signature of the given types combined. This is used internally for mapping purposes. */
        static getCompositeTypeKey(compositeTypes: Type[]): string;
        static getCompositeTypeKey(compositeTypes: any): string {
            var types: { [index: number]: Type; length: number; } = <any>(arguments.length == 1 && typeof compositeTypes == 'object' && 'length' in compositeTypes
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
        is(type: Type): boolean {
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
        assignableTo(type: Type): boolean {
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
          * See also: assignableTo()
          */
        assignableFrom(type: Type): boolean {
            return typeof type == 'object' && type.assignableTo && type.assignableTo(this);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Checks if a type exists.  You can also provide a nested type path.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        exists(name: string, ignore?: Type): boolean;
        /** Checks if the given type exists under this type.
          */
        exists(type: Type, ignore?: Type): boolean;
        exists(nameOrType: any, ignore?: Type): boolean {
            if (nameOrType === void 0 || nameOrType === null || !this._nestedTypesIndex) return false;
            var paramType = typeof nameOrType;
            if (paramType === 'object' && nameOrType instanceof Type) {
                var type = this._nestedTypesIndex[(<Type>nameOrType)._name];
                return !!type && type != ignore;
            }
            var t = this.resolve(nameOrType);
            return !!t && t != ignore;
        }

        /** Resolves a type path under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          * @param {function} requiredType A required type reference that the returned type must be an instance of.
          */
        resolve<T extends { new(...args: any[]): any }>(typePath: string, requiredType?: T): Type {
            var parts = (typeof typePath !== 'string' ? '' + typePath : typePath).split('.'), t: Type = this;
            for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) { // ('parts[0]' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                var type = t._nestedTypesIndex[parts[i]];
                if (!type)
                    return null;
                else
                    t = type;
            }
            return requiredType ? (t instanceof requiredType ? t : null) : t;
        }

        /** Adds the given type under this type.
          */
        add<T extends Type>(type: T): T;
        /** Adds a new namespace name under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        add(name: string): Type;
        add(typeOrName: any): Type {
            if (typeOrName === void 0 || typeOrName === null)
                throw "Cannot add an empty type name/path to the namespace '" + this.fullTypeName + "'.";
            if (this.exists(typeOrName))
                throw "The type '" + typeOrName + "' already exists in the namespace '" + this.fullTypeName + "'.";
            if (typeof typeOrName !== 'object' || !(typeOrName instanceof Type)) {
                var ns = ('' + typeOrName).split('.'), t: Type = this;
                for (var i = (ns[0] ? 0 : 1), n = ns.length; i < n; ++i) // ('ns[0]' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                    t = new Type(t, ns[i]);
                return t;
            }
            if ((<Type>typeOrName).parent && (<Type>typeOrName).parent !== this)
                throw "Type error: Cannot add a type that is already the child of another type.";
            (<Type>typeOrName)._parent = this;
            (<Type>typeOrName)._script = isFlowScriptObject(this) ? <IFlowScript><any>this : this._script || (<Type>typeOrName)._script;
            if (!this._nestedTypes)
                this._nestedTypes = [];
            if (!this._nestedTypesIndex)
                this._nestedTypesIndex = {};
            this._nestedTypes.push(typeOrName);
            this._nestedTypesIndex[(<Type>typeOrName).name] = typeOrName;
            return typeOrName;
        }

        remove<T extends Type>(type: T): T;
        /** removes a type under this type.  You can provide a nested type path if desired.
          * For example, if the current type is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        remove(name: string): Type;
        remove(typeOrName: any): Type {
            if (typeOrName === void 0 || typeOrName === null)
                throw "Cannot remove an empty type name/path from the namespace '" + this.fullTypeName + "'.";

            var parent: Type; // (since types can be added as roots to other types [i.e. no parent references], need to remove type objects as immediate children, not via 'resolve()')

            if (typeof typeOrName == 'object' && typeOrName instanceof Type) {
                var t = <Type>typeOrName;
                if (!this._nestedTypesIndex[t.name])
                    throw "Cannot remove type: There is no child type '" + typeOrName + "' under '" + this.fullTypeName + "'.";
                parent = this;
            }
            else {
                var t = this.resolve(typeOrName);
                if (t) parent = t.parent;
            }

            if (t && parent) {
                delete parent._nestedTypesIndex[t.name];
                var i = parent._nestedTypes.indexOf(t);
                if (i >= 0) parent._nestedTypes.splice(i, 1);
                t._parent = null;
                t._script = null;
            }

            return t;
        }

        /** Sets a type for template types using the given name, default type, and any expected based type (as a constraint).
          * This only works for types that represent templates.
          */
        defineTemplateParameter(name: string, defaultType: Type = this.script.System.Any, expectedBaseType: Type = this.script.System.Any): Type {
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
        createTemplateType(templateTypes: Type[]): Type {
            if (!this._templateTypes || !this._templateTypes.length)
                throw "Type '" + this + "' does not represent a template type.";
            var templateType = new Type(null, this.name, this.script);
            templateType._parent = this; // (one way back only, as this is a dynamic type that is never added to the meta type tree)
            return templateType;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString() { return this.fullTypeName; }
        valueOf() { return this.fullTypeName; }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface IReferencedObject {
        referenceStr: string;
        getReference(): NamedReference<{}>;
    }

    /**
     * References types in the type tree. This is used to track types, instead of pointers, since types can be deleted and
     * recreated, invalidating all references to the deleted type object.  A named reference uses a root object, and a
     * dot-delimited name to the referenced object.
     */
    export class NamedReference<T extends {}> {
        root: {};
        path: string;
        /**
         * Creates a new reference.
         * @param root The object the is the root to resolve the named path against.
         * @param path Dot-delimited names that are the path to the value pointed to by this reference.
         */
        constructor(root: {}, path: string) {
            this.root = root;
            if (path && path.charAt)
                while (path.charAt(0) == '.') path = path.substr(1);
            this.path = path;
        }

        toString() { return "" + this.valueOf(); }
        valueOf(): T {
            try {
                return this.root && (this.path ? eval("this.root." + this.path) : this.root) || void 0;
            }
            catch (ex) {
                throw "Failed to resolve path '" + this.path + "' from the `this.root` object '" + this.root + "'.";
            }
        }

        /** Returns true if this reference represents a null/empty reference. */
        get isNull(): boolean { return !this.root; }

        ///**
        // * Checks if the give root + path is valid for this reference.
        // */
        //? get isValid(): boolean {
        //    if (!this.root || typeof this.root != OBJECT) return false; // (path is not valid by default with no root exists)
        //    if (!this.path) return true; // (an empty path is valid, as it references the root object)
        //    var names = this.path.split(',');
        //    var o = this.root;
        //    for (var i = 0, n = names.length; i < n; ++i) {
        //        if (typeof o != OBJECT) return false; // (cannot get a property name of a non-object)
        //        var name = names[i];
        //        if (name in o)
        //            o = o[name];
        //        else
        //            return false;
        //    }
        //    return true;
        //}
    }

    // ========================================================================================================================

    export module Core {
        /** A wild-card that is used internally with type maps to match all defined type objects.  This is never used within scripts.
          * This operates similar to "Any", but differs in how the internal type matching works.  Types ONLY match to themselves
          * internally, so "Any" does NOT match "String" for example.  This is required for matching specific types; however, some
          * internal matches literally need to specify "any of the defined types", and that is where 'All' comes in.
          */
        export class All extends Type {
            constructor() { super(null, "All"); }
            assignableTo(type: Type): boolean {
                return true;
            }
        }

        export class Event extends Type { // (a block of script)
            constructor(parent: Type) { super(parent, "Event"); }
            assignableTo(type: Type): boolean {
                if (typeof type !== 'object' || !(type instanceof Component)) return false;
                switch (type.fullTypeName) {
                    case this.script.System.Event.fullTypeName:
                        return true;
                }
                return super.assignableTo(type);
            }
        }

        export class Inferred extends Type { // (a type that is inferred by the given arguments)
            constructor() { super(null, "Inferred"); }
            assignableTo(type: Type): boolean {
                if (typeof type !== 'object' || !(type instanceof Component)) return false;
                return super.assignableTo(type);
            }
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
