// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface IComponentFunction { (ctx: RuntimeContext): any };

    // ========================================================================================================================

    export enum ComponentTypes {
        /** The component exists for commenting purposes only. */
        Comment,
        /** The component represents a single value cast or modification (like type casting, or 'not' inversion).
          * These components are expected to only accept one argument, and return one value.
          */
        Unary,
        /** The component script will be parsed for an expression that can be nested in another expression.
          * These components are expected to only accept two arguments (like math and comparison operators).
          */
        Operation,
        /** The component is used for assignment of a single parameter to a single variable.
          */
        Assignment,
        /** The component is used to control execution flow (if, for, while, etc.), and cannot be used in operations.
          */
        ControlFlow,
        /** The component renders to a block of lines, and can be placed anywhere a code block is expected (see Core.With).
          * Note: While this can be set explicitly, most components are implicitly viewed as a 1-line blocks by default.
          */
        CodeBlock,
        /** The component represents a complete callable function.
          * Note: In the IDE, all scripting is done using *visual* components.  At runtime however, only "functional" components
          * remain, as compile time optimization collapses and inlines all others.
          */
        Functional,
        /** The component represents a single custom expression to be rendered.
          * Examples include quick complex equations, native instance function calls, etc.
          * Note: These components expect only one 'System.Code' component line, in which the custom code is also on a single
          * line. In addition, custom expressions cannot be "stepped" into during simulations.
          */
        Expression,
        /** The component represents an object type. Object types are also functional types, but convert other objects to their
          * own type where supported.
          */
        Object,
        /** The component is used for rendering text.
          * These components are useful for rendering text content for text-based operations.  That means the result of these
          * components can be used for passing as "string" arguments to other components, or for simply rendering text documents,
          * such as HTML, CSS, etc.
          */
        Text,
        /** The component is used for rendering custom code.
          */
        Code,
        /** The component represents a *component* type only and does not actually perform any action or operation.
          * Note 1: All components are inherently types.
          * Note 2: Don't inherit from component to set this unless needed.  Instead, inherit directly from the "Type" class.
          */
        Type
    }

    // ========================================================================================================================

    export interface ISavedComponent extends ISavedNamespaceObject {
        componentType: ComponentTypes;
        title: string;
        blocks: ISavedBlock[];
        parameters: ISavedProperties;
        localVars: ISavedProperties;
        returnVars: ISavedProperties;
        instanceProperties: ISavedProperties;
        events: ISavedEvent[];
    }

    // ========================================================================================================================

    export interface ITitleParseResult {
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
    export class Component extends NamespaceObject implements IReferencedObject {
        // --------------------------------------------------------------------------------------------------------------------

        static TITLE_TOKEN_SEARCH_REGEX = /\$(?:[a-zA-Z0-9_?]|\\\$)*/gi;
        static TITLE_TOKEN_VALIDATE_REGEX = /\$\??[a-zA-Z_$][a-zA-Z0-9_$]*/i; // (WARNING!!! Adding the 'g' (global) flag will cause '.test()' to advance in subsequent tests, and possibly fail)

        // --------------------------------------------------------------------------------------------------------------------

        /** The title of this component. */
        get title(): string { return this._title; }
        set title(title: string) {

            if (title == this._title)
                return; // (same title, nothing to do)

            // ... parse any tokens and create the parameters ...

            this._titleParseResult = Component.parseTitle(title, this.script);

            var params = this._titleParseResult.parameters;

            var newTitleParams: Property[] = [];

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
        }
        private _title: string;
        private _titleParams: Property[];

        /** Returns the parse result after setting the component's title. */
        get titleParseResult() { return this._titleParseResult; }
        private _titleParseResult: ITitleParseResult;

        /** Parses the title and returns a property list that can be added to the parameters collection. */
        static parseTitle(title: string, script?: IFlowScript): ITitleParseResult {
            if (typeof title != 'string')
                title = '' + title;

            title = title.replace(/\$\$/g, "\x01");
            var result: ITitleParseResult = { parameters: [], titleParts: title.split(Component.TITLE_TOKEN_SEARCH_REGEX) || [] };
            for (var i = 0, n = result.titleParts.length; i < n; ++i)
                result.titleParts[i] = result.titleParts[i].replace(/\u0001/g, '$'); // (convert the $$ placeholders [\x01] into a single $)

            var tokens = title.match(Component.TITLE_TOKEN_SEARCH_REGEX), token: string, isOptional: boolean;

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

                    var p = new Property(null, [script ? script.System.Any : System.Any], token, { isOptional: isOptional });
                    p._implicitlyDefined = true;

                    result.parameters.push(p);
                }

            return result;
        }

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
        get blocks() { return this._blocks; }
        protected _blocks: Block[];
        /** Gets the first block for this component.
          * All functional components have one block by default. More blocks are added if component represents an argument value
          * passed to another components parameter, or as a closure callback function [which should never be used for events].
          */
        get block() { return this._blocks[0]; }

        /** Parameter variables for this component. */
        get parameters() { return this._parameters; }
        protected _parameters = new PropertyCollection(this);

        /** Local variables for this component. */
        get localVars() { return this._localVars; }
        protected _localVars = new PropertyCollection(this);

        /** Return variables for this component. */
        get returnVars() { return this._returnVars; }
        protected _returnVars = new PropertyCollection(this);

        /** Instance variables for this component. */
        get instanceProperties() { return this._instanceProperties; }
        protected _instanceProperties = new PropertyCollection(this); // (holds vars that get rendered as object instance-based properties; these are completely separate from parameters and local vars, which are viewed together as one big list)

        /** Object components embed properties from other associated objects into sub-objects. At compile time, if there are no conflicts, the embedded objects get merged into their host objects for efficiency. */
        get embeddedTypes() { return this._embeddedTypes; }
        protected _embeddedTypes: Object[] = [];

        get instanceType() { return this._instanceType; }
        set instanceType(value) {
            if (value && (typeof value != 'object' || !(value instanceof NamespaceObject)))
                throw "Invalid instance type: Must be a 'Type' or 'Component' object.";
            var cleared = this._instanceType && !value;
            this._instanceType = value || void 0;
            if (cleared)
                this.instanceProperties.clear();
        }
        protected _instanceType: NamespaceObject; // (if set, this represents the type expected as the "$this" in custom code expressions for this component [example: the 'with' component will have this set to 'System.Object'])

        get events() { return this._events; }
        protected _events: FSEvent[] = [];

        get componentType() { return this._componentType; }
        set componentType(value) {
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
        }
        protected _componentType: ComponentTypes;

        get function() { return this._function; }
        protected _function: ICallableComponent; // (the compiled javascript)

        /** Returns the default return property, which must be one single return definition, otherwise 'undefined' is returned. */
        get defaultReturn(): Property {
            return this._returnVars.getProperty(0);
        }

        /** Returns true if this component results in a value that can be used in an operation. */
        get isOperational(): boolean {
            switch (this._componentType) {
                case ComponentTypes.Assignment:
                case ComponentTypes.Operation:
                case ComponentTypes.Unary:
                case ComponentTypes.Expression:
                case ComponentTypes.Text:
                    return true;
            }
            return !!this.defaultReturn;
        }

        get isObject(): boolean {
            return this._componentType == ComponentTypes.Object; //? || this.assignableTo(this.script.System.Object);
        }

        /** Returns true if the parent is an object type for holding data properties. */
        get hasDataObjectTypeParent(): boolean {
            return this.parent && this.parent instanceof Component && (<Component>this.parent)._componentType == ComponentTypes.Object;
        }

        /** Used to dereferences a block by index. 
         * @see referenceStr */
        private get $() { return this._blocks; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: NamespaceObject, componentType: ComponentTypes, typeName: string, signatureTitle: string, script?: IFlowScript) {
            super(parent, typeName, script); // (the title that describes the component inputs [also acts as the component "signature" for the namespace])
            this._componentType = componentType;

            if (signatureTitle) {
                if (!this.name)
                    this.name = signatureTitle;
                this.title = signatureTitle;
            }
            else if (this.name)
                this.title = this.name;
            else
                throw "A component name or title is required.";

            // ... attached some events, such as removing return vars when a corresponding parameter or local var is removed ...

            this._parameters.onremoving((col, p) => {
                var retProp = this.returnVars.getProperty(p.name);
                if (retProp)
                    retProp.remove();
            });

            this._localVars.onremoving((col, p) => {
                var retProp = this.returnVars.getProperty(p.name);
                if (retProp)
                    retProp.remove();
            });

            this.addBlock(); // (create a default block [all components get one default block])
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedComponent): ISavedComponent {
            target = target || <ISavedComponent>{};

            target.componentType = this._componentType;
            target.title = this.title;

            target.blocks = [];
            for (var i = 0, n = this._blocks.length; i < n; ++i)
                target.blocks[i] = this._blocks[i].save();

            target.parameters = this._parameters.save();
            target.localVars = this._localVars.save();
            target.returnVars = this._returnVars.save();
            target.instanceProperties = this._instanceProperties.save();
            target.events = [];

            super.save(target);

            return target;
        }

        load(target?: ISavedComponent): this {

            if (target) {
                this._componentType = target.componentType;
                this.title = target.title;

                if (target.blocks)
                    for (var i = 0, n = target.blocks.length; i < n; ++i)
                        this._blocks[i] = new Block(this).load(target.blocks[i]);
            }

            super.load(target);

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        addBlock(block?: Block): Block {
            if (block) {
                var comp = block['_component'];
                if (comp != this)
                    comp.removeBlock(block);
            }
            else block = new Block(null);
            block['_component'] = this;
            if (!this._blocks)
                this._blocks = [];
            this._blocks.push(block);
            return block;
        }

        removeBlock(block?: Block): Block {
            var i = this._blocks ? this._blocks.indexOf(block) : -1;
            if (i >= 0) {
                var block = this._blocks.splice(i, 1)[0];
                block['_component'] = null;
                return block;
            }
            throw "Cannot remove the code block: it does not belong to this component.";
        }

        // --------------------------------------------------------------------------------------------------------------------

        private _checkName(name: string, allowNullOrEmpty = false): string {
            if (name !== null) {
                if (typeof name != 'string')
                    name = '' + name;
                name = name.trim();
            }
            if (name === undefined)
                name = null;
            if (name) {
                if (name.indexOf("'") >= 0)
                    throw "Single quote not yet supported, and will cause errors."; // TODO: Fix property names containing single quote errors.
                if (name.substring(0, 3) == '$__')
                    throw "Names cannot start with the special system reserved prefix of '$__'.";
            } else
                if (!allowNullOrEmpty)
                    throw "A name is required.";
            return name;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Searches parameters, local variables, and return variables for a property matching a specified name. */
        getProperty(name: string): Property {
            name = this._checkName(name, true);
            if (!name || name == Property.DEFAULT_NAME)
                return this._returnVars.getProperty(Property.DEFAULT_NAME);
            return this._parameters.getProperty(name)
                || this._localVars.getProperty(name)
                || undefined;
        }

        /** Searches only parameters for a specified name, or index, and returns true if found. */
        hasParameter(name: string): boolean;
        hasParameter(index: number): boolean;
        hasParameter(nameOrIndex: any): boolean {
            if (isValidNumericIndex(nameOrIndex)) {
                var i = +nameOrIndex;
                return i >= 0 && i < this._parameters.length;
            }
            else {
                var name = this._checkName(nameOrIndex);
                return this._parameters.hasProperty(name);
            }
        }

        /** Searches parameters, local variables, and return variables for a property matching a specified name, and returns true if found. */
        hasProperty(name: string): boolean {
            name = this._checkName(name, true);
            if (!name || name == Property.DEFAULT_NAME)
                return this._returnVars.hasProperty(Property.DEFAULT_NAME);
            return this._parameters.hasProperty(name)
                || this._localVars.hasProperty(name);
        }

        /** Searches instance properties for a property matching a specified name. 
          * @param {boolean} ownProperty If true, then only properties that belong to this component are searched.
          */
        getInstanceProperty(name: string, ownProperty: boolean = false): Property {
            name = this._checkName(name, true);
            // ... check inheritance ...
            var type: NamespaceObject = this;
            while (type) {
                if (type instanceof Component && (<Component>type).isObject) {
                    var p = (<Component>type)._instanceProperties.getProperty(name);
                    if (p) return p;
                    if (ownProperty) break;
                }
                type = type.superType;
            }
            return;
        }

        /** Searches instance properties in the parent chain for a property matching a specified name, and returns true if found.
          * @param {boolean } ownProperty If true then only properties that belong to this object are checked.
          */
        hasInstanceProperty(name: string, ownProperty: boolean = false): boolean {
            name = this._checkName(name, true);
            // ... check inheritance ...
            var type: NamespaceObject = this;
            while (type) {
                if (type instanceof Component && (<Component>type).isObject) {
                    if ((<Component>type)._instanceProperties.hasProperty(name)) return true;
                    if (ownProperty) break;
                }
                type = type.superType;
            }
            return false;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Validates and returns the give parameter name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateParameterName(name: string, ignore?: Property): string {
            name = this._checkName(name);
            if (this._localVars.hasProperty(name, ignore))
                throw "Parameter '" + name + "' is already defined as a local variable.";
            //?if (this._returnVars.hasProperty(name, ignore))
            //    throw "Parameter '" + name + "' is already defined as a return variable.";
            if (!this._parameters.hasProperty(name, ignore)) // (must already exist via the title! [a default property is set for each title token])
                throw "Parameter '" + name + "' does not exist.  Please check the spelling, and make sure the component's title has a related token name first.";
            return name;
        }

        /** Further define component's parameter. */
        defineParameter(name: string, validTypes: NamespaceObject[], initialValue?: any, validation?: string, isOptional?: boolean, isConst?: boolean, isAlias?: boolean): Property {
            name = this._validateParameterName(name);
            var p = new Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isOptional: isOptional, isConst: isConst, isAlias: isAlias });
            p._explicitlyDefined = true;
            this._parameters.replace(p);
            return p;
        }

        /** Renames an parameter on this component. */
        renameParameter(prop: Property, newName: string): Property;
        renameParameter(prop: string, newName: string): Property;
        renameParameter(prop: any, newName: string): Property {
            var p = this._parameters.getProperty(typeof prop == "string" ? prop : (<Property>prop).name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no parameter named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateParameterName(newName, p);
            p['_name'] = newName;
            return p;
        }

        /** Removes the specified parameter from this component. */
        removeParameter(prop: Property): Property;
        removeParameter(prop: string): Property;
        removeParameter(prop: any): Property {
            var p = this._parameters.getProperty(typeof prop == "string" ? prop : (<Property>prop).name);
            if (p) {
                if (this._titleParams && this._titleParams.indexOf(p) >= 0)
                    throw "You cannot remove a component title parameter.";
                p.remove();
            }
            return p;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Validates and returns the give local variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateLocalVarName(name: string, ignore?: Property): string {
            name = this._checkName(name);
            if (this._localVars.hasProperty(name, ignore))
                throw "The local variable'" + name + "' is already defined.";
            if (this._parameters.hasProperty(name, ignore))
                throw "'" + name + "' is already defined as a parameter.";
            //?if (this._returnVars.hasProperty(name, ignore))
            //    throw "Parameter '" + name + "' is already defined as a return variable.";
            return name;
        }

        /** Defines a new local variable for this component. */
        defineLocalVar(name: string, validTypes: NamespaceObject[], initialValue?: any, validation?: string, isOptional?: boolean, isStatic?: boolean): Property {
            name = this._validateLocalVarName(name);
            var p = new Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isOptional: isOptional, isStatic: isStatic });
            p._explicitlyDefined = true;
            this._localVars.push(p);
            return p;
        }

        /** Renames an local variable on this component. */
        renameLocalVar(prop: Property, newName: string): Property;
        renameLocalVar(prop: string, newName: string): Property;
        renameLocalVar(prop: any, newName: string): Property {
            var p = this._localVars.getProperty(typeof prop == "string" ? prop : (<Property>prop).name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no local variable named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateLocalVarName(newName, p);
            p['_name'] = newName;
            return p;
        }

        /** Removes the specified local variable from this component. */
        removeLocalVar(prop: Property): Property;
        removeLocalVar(prop: string): Property;
        removeLocalVar(prop: any): Property {
            var p = this._localVars.getProperty(typeof prop == "string" ? prop : (<Property>prop).name);
            if (p)
                p.remove();
            return p;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Validates and returns the give return variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateReturnVarName(name: string): string {
            name = this._checkName(name, true);
            if (!name) {
                if (this._returnVars.length)
                    throw "Returns have already been defined for this component.  A default return must be the first definition.";
            } else {
                if (!this.getProperty(name))
                    throw "Cannot define return '" + name + "': No parameter or local variable has been defined with that name yet.";
            }
            return name;
        }

        /** Defines a new local variable to use as a return value for this component.
          * To define a default return value for this functional component, pass in 'null'/undefined for the name.
          */
        defineReturnVar(name: string, returnType: NamespaceObject = System.Any): Property {
            name = this._validateReturnVarName(name);
            var p = new Property(null, [returnType], name || Property.DEFAULT_NAME);
            p._explicitlyDefined = true;
            this._returnVars.push(p);
            return p;
        }

        /** Defines a default return value for this functional component.
          * When default returns are defined, a running expression variable tracks each executed expression and returns the last
          * expression executed.
          */
        defineDefaultReturnVar(returnType: NamespaceObject = System.Any): Property { return this.defineReturnVar(null, returnType); }

        /** Renames an return variable on this component. */
        renameReturnVar(prop: Property, newName: string): Property;
        renameReturnVar(prop: string, newName: string): Property;
        renameReturnVar(prop: any, newName: string): Property {
            var p = this._returnVars.getProperty(typeof prop == "string" ? prop : (<Property>prop).name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no local variable named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateReturnVarName(newName);
            p['_name'] = newName;
            return p;
        }

        /** Removes the specified return variable from this component. */
        removeReturnVar(prop: Property): Property;
        removeReturnVar(prop: string): Property;
        removeReturnVar(prop: any): Property {
            var p = this._returnVars.getProperty(typeof prop == "string" ? prop : (<Property>prop).name);
            if (p)
                p.remove();
            return p;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Validates and returns the give instance variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        _validateInstancePropertyName(name: string, ignore?: Property): string {
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
        }

        /** Defines a new local instance related variable for this component. */
        defineInstanceProperty(name: string, validTypes: NamespaceObject[], initialValue?: any, validation?: string, isConst?: boolean, isAlias?: boolean): Property {
            name = this._validateInstancePropertyName(name);
            var p = new Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isInstance: true, isConst: isConst, isAlias: isAlias });
            p._explicitlyDefined = true;
            this._instanceProperties.push(p);
            return p;
        }

        /** Renames an instance property on this component, or any super (inherited) component.
          * @param {boolean} ownProperty If true, then only properties that directly belong to this component can be renamed.
          */
        renameInstanceProperty(prop: Property, newName: string, ownProperty?: boolean): Property;
        renameInstanceProperty(prop: string, newName: string, ownProperty?: boolean): Property;
        renameInstanceProperty(prop: any, newName: string, ownProperty: boolean = false): Property {
            var p = this.getInstanceProperty(typeof prop == "string" ? prop : (<Property>prop).name, ownProperty);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no instance property named '" + prop + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateInstancePropertyName(newName, p);
            p['_name'] = newName;
            return p;
        }

        /** Removes the specified instance property from this component, or any super (inherited) component.
          * @param {boolean} ownProperty If true, then only properties that directly belong to this component can be removed.
          */
        removeInstanceProperty(prop: Property, ownProperty?: boolean): Property;
        removeInstanceProperty(prop: string, ownProperty?: boolean): Property;
        removeInstanceProperty(prop: any, ownProperty: boolean = false): Property {
            var p = this.getInstanceProperty(typeof prop == "string" ? prop : (<Property>prop).name, ownProperty);
            if (p)
                p.remove();
            return p;
        }

        /** Defines the instance type expected by this component (the instance type this component can work with). If this is
          * set, this component can only be called in object contexts using special statements. Example: the "with" component.
          */
        defineInstanceType(type: NamespaceObject): Component {
            this._instanceType = type;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Register a callback event. */
        registerEvent(name: string): object { // in case of errors?  Need to look into trapping the events.
            //?var ev = new Event(this, name);
            //?this._events.push(ev);
            //?return ev;
            return null;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Configures a new runtime context with the supplied arguments. */
        configureRuntimeContext(ctx: RuntimeContext, args?: ICallerArguments): RuntimeContext {
            if (typeof args == 'object')
                for (var p in args)
                    if (!Expression.NUMERIC_INDEX_REGEX.test(p) && !this.hasProperty(p))
                        throw "Component '" + this + "' does not contain a parameter or local variable named '" + p + "'.";
                    else
                        this.setArgument(p, args[p], ctx.arguments);
            //throw "Invalid arguments: There is no parameter, local, or return property named '" + name + "' in component '" + this + "'.";
            return ctx;
        }

        /** Sets an argument on any target object to a given value based on the expected parameters of this component. */
        setArgument<T>(argIndex: number, value: T, target: IContextArguments): T;
        setArgument<T>(argIndex: string, value: T, target: IContextArguments): T;
        setArgument<T>(argIndex: any, value: T, target: IContextArguments): T {
            var expectedParameters = this._parameters;

            // ... both the parameter name AND index must bet set; pull the parameter name if an index is given, or the parameter index if a name is given ...

            if (isValidNumericIndex(argIndex)) {
                var i: number = +argIndex,
                    name: string = i >= 0 && i < expectedParameters.length ? expectedParameters.getProperty(i).name : '@' + i; // (an index outside the number of parameters sets the "optional" arguments)
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
        }

        /** Gets an argument value from any target object based on the expected parameters of this component. */
        getArgument<T = any>(argIndex: number, target: IContextArguments): T;
        getArgument<T= any>(argIndex: string, target: IContextArguments): T;
        getArgument<T= any>(argIndex: any, target: IContextArguments): T {
            var expectedParameters = this._parameters;

            // ... both the parameter name AND index must bet set; pull the parameter name if an index is given, or the parameter index if a name is given ...

            if (isValidNumericIndex(argIndex)) {
                var i: number = +argIndex,
                    name: string = i >= 0 && i < expectedParameters.length ? expectedParameters.getProperty(i).name : '@' + i; // (an index outside the number of parameters sets the "optional" arguments)
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
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this component and the first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);

            // ... add the parameters for this component ...

            //add via expressions only, using ComponentReference / if (this._parameters.length)
            //    for (var i = 0, n = this._parameters.length; i < n; ++i)
            //        node.createNode(this._parameters.getProperty(i));

            if (this._blocks.length)
                this._blocks[0].createVisualTree(node, visualNodeType);

            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export class FunctionalComponent extends Component {
        constructor(parent: NamespaceObject, typeName: string, signatureTitle?: string, script?: IFlowScript) {
            super(parent, ComponentTypes.Functional, typeName, signatureTitle, script);
        }
    }

    // ========================================================================================================================

    /** Helps to build a single component using chainable calls. */
    export class ComponentBuilder {
        Component: Component;

        /** Helps to build a single component using chainable calls. See Component for more details. */
        constructor(parent: NamespaceObject, componentType: ComponentTypes, typeName: string, signatureTitle?: string, script?: IFlowScript) {
            this.Component = new Component(parent, componentType, typeName, signatureTitle, script);
        }
        /** See {Component}.defineParameter() for more details. */
        defineParameter(name: string, validTypes: NamespaceObject[], initialValue?: any, validation?: string, isOptional?: boolean, isConst?: boolean, isAlias?: boolean): ComponentBuilder {
            this.Component.defineParameter(name, validTypes, initialValue, validation, isOptional, isConst, isAlias);
            return this;
        }
        /** Similar to calling 'defineParameter()', except allows defining an enum type property with a 'fixed' or 'not fixed' flag.
          * If a property is 'fixed' to an enum, the developer can only select or enter values matching those in the enum.
          */
        defineEnumProperty<T>(name: string, enumType: Enum<T>, isFixed?: boolean, initialValue?: any, validation?: string, isOptional?: boolean, isConst?: boolean): ComponentBuilder {
            this.Component.defineParameter(name, [enumType], initialValue, validation, isOptional, isConst).isFixedtoEnum = isFixed;
            return this;
        }
        /** See {Component}.defineLocal() for more details. */
        defineLocal(name: string, validTypes: NamespaceObject[], initialValue?: any, validation?: string, isOptional?: boolean, isStatic?: boolean): ComponentBuilder {
            this.Component.defineLocalVar(name, validTypes, initialValue, validation, isOptional, isStatic);
            return this;
        }
        /** See {Component}.defineReturn() for more details. */
        defineReturn(name: string, returnType: NamespaceObject): ComponentBuilder {
            this.Component.defineReturnVar(name, returnType);
            return this;
        }
        /** See {Component}.defineInstance() for more details. */
        defineInstance(name: string, validTypes: NamespaceObject[], initialValue?: any, validation?: string): ComponentBuilder {
            this.Component.defineInstanceProperty(name, validTypes, initialValue, validation);
            return this;
        }
        /** See {Component}.defineInstanceType() for more details. */
        defineInstanceType(type: NamespaceObject): ComponentBuilder {
            this.Component.defineInstanceType(type);
            return this;
        }
        /** See {Component}.registerEvent() for more details. */
        registerEvent(name: string): ComponentBuilder {
            this.Component.registerEvent(name);
            return this;
        }
        /** Adds a new statement on a new line (See {Line}.addStatement()). */
        addStatement(action: Component, args?: IExpressionArgs | string[], returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]): ComponentBuilder {
            var _args = <IExpressionArgs>[];
            if (args)
                for (var i = 0; i < args.length; ++i)
                    if (args[i])
                        if (args[i] instanceof Expression)
                            _args[i] = <Expression>args[i];
                        else
                            _args[i] = new Constant(<string>args[i]);
            this.Component.block.newLine().addStatement(action, _args, returnTargets, eventHandlers);
            return this;
        }
    }

    // ========================================================================================================================

    export interface ISavedComponentReference extends ISavedExpression {
        /** Full type name to the source component for this expression, if any. */
        source: string;
        arguments: { [index: number]: any;[name: string]: ISavedExpression; };
        returnTargets: ISavedReturnTargetMap[];
        events: ISavedEvent[];
    }

    /** References a block for use in expressions. */
    export class ComponentReference extends Expression {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this.component ? this.component.script : null; }

        /** The component that this reference points to. */
        get component(): Component { return this._componentRef.valueOf(); }
        protected _componentRef: NamedReference<Component>; // (the component that is the source for this expression)

        // --------------------------------------------------------------------------------------------------------------------

        /** The arguments set for this expression, if any.
          * Use 'setArgument()' to set values for this object.
          */
        get arguments(): ExpressionArgs { return this._arguments; }
        protected _arguments = new ExpressionArgs(this); // (the arguments are taken from 1. the calling component's declared local variables [including parameters], or 2. other components)

        /** Returns the count of indexed values in the object (i.e. the highest index + 1). */
        get argumentLength(): number {
            //var length = 0;
            //if (this._arguments)
            //    for (var p in this._arguments) {
            //        var i = +p;
            //        if (!isNaN(i) && i >= length) // (isNan faster than regex: https://jsperf.com/opandstr-vs-regex-test)
            //            length = i + 1; // (the length is the largest index number + 1 [note: may not contain optional args, so must search of largest index])
            //    }
            return this._arguments ? this._arguments.length : 0;
        }

        get returnTargets(): ReturnTargetMaps { return this._returnTargets; }
        protected _returnTargets = new ReturnTargetMaps(this); // (these properties are also taken from the calling component's declared local variables [including parameters], which get updated upon return)

        _eventHandlers: BlockReference[]; // (blocks to use for the event handlers for this statement [always optional]; these blocks sit under the context of the underlying component)
        // TODO: Consider creating a custom collection so the type can be detected by the VisualNode

        // --------------------------------------------------------------------------------------------------------------------

        constructor(source: Component, args?: IExpressionArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[], parent?: Expression) {
            super(parent);

            if (!source || typeof source != 'object' || !(source instanceof Component))
                throw "A valid component object is required.";

            this._componentRef = source.getReference();

            this.initExpression(source, args, returnTargets, eventHandlers);
        }

        /** Initialize this expression with new arguments, return targets, and event handlers. */
        initExpression(source: Component, args?: IExpressionArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]): this {
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
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): ComponentReference {
            var compRef = new ComponentReference(this.component, null, null, null, parent);

            this._arguments.clone(compRef);

            this._returnTargets.clone(compRef);

            var eh: BlockReference[] = [];
            if (this._eventHandlers)
                for (var i = 0, n = this._eventHandlers.length; i < n; ++i)
                    eh[i] = this._eventHandlers[i].clone<BlockReference>(compRef);

            compRef.initExpression(this.component, void 0, void 0, eh);

            return compRef;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        containsChildExpression(expr: Expression): boolean {
            var _expr: Expression;

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
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Removes a child from the expression tree.  If the child is not found, null is returned, otherwise the removed expression is returned. */
        remove(child?: Expression): Expression;
        /** Removes self from the expression tree. */
        remove(): Expression;
        remove(child?: Expression): Expression {
            if (child) {
                // ... 'this' is the parent, so find the reference and remove it ...
                // ... check args ...
                var expr = this._arguments ? this._arguments.removeArgument(child) : null;
                // ... check returns ...
                if (!expr && this._returnTargets)
                    expr = this._returnTargets.removeReturn(child);
                // ... check events ...
                if (!expr && this.removeEvent)
                    expr = this.removeEvent(<BlockReference>child);
            } else
                expr = super.remove();
            return expr ? expr : null;
        }

        /** Clears the expression of all arguments, return targets, and event handlers. */
        clear() {
            this._arguments.clear();
            this._returnTargets.clear();
            this.clearEventHandlers();
        }


        // --------------------------------------------------------------------------------------------------------------------

        /** Removes an event handler. */
        removeEvent(eventHandler: BlockReference): BlockReference;
        /** Removes an event handler. */
        removeEvent(index: number): Expression;
        removeEvent(eventHandlerOrIndex: any): BlockReference {

            // ... check event handlers ...

            var expr: BlockReference;

            if (typeof eventHandlerOrIndex == 'number') {
                if (eventHandlerOrIndex < 0 || eventHandlerOrIndex >= this._eventHandlers.length)
                    throw "Event index '" + eventHandlerOrIndex + "' is out of bounds.";
                expr = this._eventHandlers.splice(i, 1)[0];
            }
            else for (var i = this._eventHandlers.length - 1; i >= 0; --i)
                if (this._eventHandlers[i] == eventHandlerOrIndex)
                    expr = this._eventHandlers.splice(i, 1)[0];

            return expr || null;
        }

        /** Removes all event handlers. */
        clearEventHandlers() {
            if (this._eventHandlers)
                for (var i = this._eventHandlers.length - 1; i >= 0; --i)
                    this._returnTargets.removeReturn(i);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedComponentReference): ISavedComponentReference {
            target = target || <ISavedComponentReference>{};

            target.source = this.component ? this.component.referenceStr : null;

            if (this._arguments)
                this._arguments.save(target);

            if (this._returnTargets)
                this._returnTargets.save(target);

            target.events = [];

            super.save(target);

            return target;
        }

        load(target?: ISavedComponentReference): this {
            if (target) {
                //if (target.arguments)
                //    for (var i = target.arguments.length - 1; i >= 0; --i)

                // super.load(target);
            }

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns available properties that can be used given the parent expression hierarchy. */
        getAvailablePropertyList(): IAvailableProperty[] {
            // ... get from any 'with' block first ...
            var withStatement = this.getParentWith(), availableProperties: IAvailableProperty[] = [];
            if (withStatement) {
                var objExpr = withStatement._arguments.getArg(0);
                if (!objExpr || !(objExpr instanceof PropertyReference)) // (a property expression argument is required to continue)
                    return null;
                var propertyType = (<PropertyReference>objExpr).property.validTypes[0];
                if (propertyType && propertyType.assignableTo(FlowScript.System.Object)) {
                    var oc = <Component>propertyType; // (the property type references an object type component)
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
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = super.createVisualTree(parent, visualNodeType);

            // ... first, each return type should be added, in order ...

            if (this._returnTargets) {
                this._returnTargets.createVisualTree(node);

                //node.appendTextNode("=");
            }

            // ... next, add the arguments, also in order ...

            this._arguments.createVisualTree(node);

            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString(): string { return "" + this.component; } // TODO: Extend this with arguments and return mappings as well.

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
