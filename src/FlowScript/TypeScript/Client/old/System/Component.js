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
    ;
    // ========================================================================================================================
    var ComponentTypes;
    (function (ComponentTypes) {
        /** The component exists for commenting purposes only. */
        ComponentTypes[ComponentTypes["Comment"] = 0] = "Comment";
        /** The component represents a single value cast or modification (like type casting, or 'not' inversion).
          * These components are expected to only accept one argument, and return one value.
          */
        ComponentTypes[ComponentTypes["Unary"] = 1] = "Unary";
        /** The component script will be parsed for an expression that can be nested in another expression.
          * These components are expected to only accept two arguments (like math and comparison operators).
          */
        ComponentTypes[ComponentTypes["Operation"] = 2] = "Operation";
        /** The component is used for assignment of a single parameter to a single variable.
          */
        ComponentTypes[ComponentTypes["Assignment"] = 3] = "Assignment";
        /** The component is used to control execution flow (if, for, while, etc.), and cannot be used in operations.
          */
        ComponentTypes[ComponentTypes["ControlFlow"] = 4] = "ControlFlow";
        /** The component renders to a block of lines, and can be placed anywhere a code block is expected (see Core.With).
          * Note: While this can be set explicitly, most components are implicitly viewed as a 1-line blocks by default.
          */
        ComponentTypes[ComponentTypes["CodeBlock"] = 5] = "CodeBlock";
        /** The component represents a complete callable function.
          * Note: In the IDE, all scripting is done using *visual* components.  At runtime however, only "functional" components
          * remain, as compile time optimization collapses and inlines all others.
          */
        ComponentTypes[ComponentTypes["Functional"] = 6] = "Functional";
        /** The component represents a single custom expression to be rendered.
          * Examples include quick complex equations, native instance function calls, etc.
          * Note: These components expect only one 'System.Code' component line, in which the custom code is also on a single
          * line. In addition, custom expressions cannot be "stepped" into during simulations.
          */
        ComponentTypes[ComponentTypes["Expression"] = 7] = "Expression";
        /** The component represents an object type. Object types are also functional types, but convert other objects to their
          * own type where supported.
          */
        ComponentTypes[ComponentTypes["Object"] = 8] = "Object";
        /** The component is used for rendering text.
          * These components are useful for rendering text content for text-based operations.  That means the result of these
          * components can be used for passing as "string" arguments to other components, or for simply rendering text documents,
          * such as HTML, CSS, etc.
          */
        ComponentTypes[ComponentTypes["Text"] = 9] = "Text";
        /** The component is used for rendering custom code.
          */
        ComponentTypes[ComponentTypes["Code"] = 10] = "Code";
        /** The component represents a *component* type only and does not actually perform any action or operation.
          * Note 1: All components are inherently types.
          * Note 2: Don't inherit from component to set this unless needed.  Instead, inherit directly from the "Type" class.
          */
        ComponentTypes[ComponentTypes["Type"] = 11] = "Type";
    })(ComponentTypes = FlowScript.ComponentTypes || (FlowScript.ComponentTypes = {}));
    /** Components represent functional part of script code, whether is be expressions, or an entire function.  Most components
    * have input properties that produce some desired action or output.
    * Components do not have any instances.  In FlowScript, "instances" are simply data structures that have functions/methods
    * that work on them, or static functions that can be shared without any instance required at all. For data, the "Table"
    * type is used.
    * All components are "static" in nature, and can be called and/or reused at any time, as long as any required data schema
    * elements expected by the component are present.
    */
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Component(parent, componentType, typeName, signatureTitle, script) {
            var _this = _super.call(this, parent, typeName, script) || this;
            _this._parameters = new FlowScript.PropertyCollection(_this);
            _this._localVars = new FlowScript.PropertyCollection(_this);
            _this._returnVars = new FlowScript.PropertyCollection(_this);
            _this._instanceProperties = new FlowScript.PropertyCollection(_this); // (holds vars that get rendered as object instance-based properties; these are completely separate from parameters and local vars, which are viewed together as one big list)
            _this._embeddedTypes = [];
            _this._events = [];
            _this._componentType = componentType;
            if (signatureTitle) {
                if (!_this.name)
                    _this.name = signatureTitle;
                _this.title = signatureTitle;
            }
            else if (_this.name)
                _this.title = _this.name;
            else
                throw "A component name or title is required.";
            // ... attached some events, such as removing return vars when a corresponding parameter or local var is removed ...
            _this._parameters.onremoving(function (col, p) {
                var retProp = _this.returnVars.getProperty(p.name);
                if (retProp)
                    retProp.remove();
            });
            _this._localVars.onremoving(function (col, p) {
                var retProp = _this.returnVars.getProperty(p.name);
                if (retProp)
                    retProp.remove();
            });
            _this.addBlock(); // (create a default block [all components get one default block])
            return _this;
        }
        Object.defineProperty(Component.prototype, "title", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The title of this component. */
            get: function () { return this._title; },
            set: function (title) {
                if (title == this._title)
                    return; // (same title, nothing to do)
                // ... parse any tokens and create the parameters ...
                this._titleParseResult = Component.parseTitle(title, this.script);
                var params = this._titleParseResult.parameters;
                var newTitleParams = [];
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "titleParseResult", {
            /** Returns the parse result after setting the component's title. */
            get: function () { return this._titleParseResult; },
            enumerable: true,
            configurable: true
        });
        /** Parses the title and returns a property list that can be added to the parameters collection. */
        Component.parseTitle = function (title, script) {
            if (typeof title != 'string')
                title = '' + title;
            title = title.replace(/\$\$/g, "\x01");
            var result = { parameters: [], titleParts: title.split(Component.TITLE_TOKEN_SEARCH_REGEX) || [] };
            for (var i = 0, n = result.titleParts.length; i < n; ++i)
                result.titleParts[i] = result.titleParts[i].replace(/\u0001/g, '$'); // (convert the $$ placeholders [\x01] into a single $)
            var tokens = title.match(Component.TITLE_TOKEN_SEARCH_REGEX), token, isOptional;
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
                    var p = new FlowScript.Property(null, [script ? script.System.Any : FlowScript.System.Any], token, { isOptional: isOptional });
                    p._implicitlyDefined = true;
                    result.parameters.push(p);
                }
            return result;
        };
        Object.defineProperty(Component.prototype, "blocks", {
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
            get: function () { return this._blocks; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "block", {
            /** Gets the first block for this component.
              * All functional components have one block by default. More blocks are added if component represents an argument value
              * passed to another components parameter, or as a closure callback function [which should never be used for events].
              */
            get: function () { return this._blocks[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "parameters", {
            /** Parameter variables for this component. */
            get: function () { return this._parameters; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "localVars", {
            /** Local variables for this component. */
            get: function () { return this._localVars; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "returnVars", {
            /** Return variables for this component. */
            get: function () { return this._returnVars; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "instanceProperties", {
            /** Instance variables for this component. */
            get: function () { return this._instanceProperties; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "embeddedTypes", {
            /** Object components embed properties from other associated objects into sub-objects. At compile time, if there are no conflicts, the embedded objects get merged into their host objects for efficiency. */
            get: function () { return this._embeddedTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "instanceType", {
            get: function () { return this._instanceType; },
            set: function (value) {
                if (value && (typeof value != 'object' || !(value instanceof FlowScript.Type)))
                    throw "Invalid instance type: Must be a 'Type' or 'Component' object.";
                var cleared = this._instanceType && !value;
                this._instanceType = value || void 0;
                if (cleared)
                    this.instanceProperties.clear();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "events", {
            get: function () { return this._events; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "componentType", {
            get: function () { return this._componentType; },
            set: function (value) {
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "function", {
            get: function () { return this._function; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "defaultReturn", {
            /** Returns the default return property, which must be one single return definition, otherwise 'undefined' is returned. */
            get: function () {
                return this._returnVars.getProperty(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "isOperational", {
            /** Returns true if this component results in a value that can be used in an operation. */
            get: function () {
                switch (this._componentType) {
                    case ComponentTypes.Assignment:
                    case ComponentTypes.Operation:
                    case ComponentTypes.Unary:
                    case ComponentTypes.Expression:
                    case ComponentTypes.Text:
                        return true;
                }
                return !!this.defaultReturn;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "isObject", {
            get: function () {
                return this._componentType == ComponentTypes.Object; //? || this.assignableTo(this.script.System.Object);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "hasDataObjectTypeParent", {
            /** Returns true if the parent is an object type for holding data properties. */
            get: function () {
                return this.parent && this.parent instanceof Component && this.parent._componentType == ComponentTypes.Object;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "referenceStr", {
            /** An instance reference string that represents this block in the system. */
            get: function () {
                return this.fullTypeName;
            },
            enumerable: true,
            configurable: true
        });
        Component.prototype.getReference = function () {
            if (this.script)
                return new FlowScript.NamedReference(this.script, this.referenceStr);
            else
                return new FlowScript.NamedReference(this, null);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.prototype.save = function (target) {
            target = target || {};
            target.title = this.title;
            target.blocks = [];
            for (var i = 0, n = this._blocks.length; i < n; ++i)
                target.blocks[i] = this._blocks[i].save();
            target.parameters = this._parameters.save();
            target.localVars = this._localVars.save();
            target.returnVars = this._returnVars.save();
            target.instanceProperties = this._instanceProperties.save();
            target.events = [];
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.prototype.addBlock = function (block) {
            if (block) {
                var comp = block['_component'];
                if (comp != this)
                    comp.removeBlock(block);
            }
            else
                block = new FlowScript.Block(null);
            block['_component'] = this;
            if (!this._blocks)
                this._blocks = [];
            this._blocks.push(block);
            return block;
        };
        Component.prototype.removeBlock = function (block) {
            var i = this._blocks ? this._blocks.indexOf(block) : -1;
            if (i >= 0) {
                var block = this._blocks.splice(i, 1)[0];
                block['_component'] = null;
                return block;
            }
            throw "Cannot remove the code block: it does not belong to this component.";
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.prototype._checkName = function (name, allowNullOrEmpty) {
            if (allowNullOrEmpty === void 0) { allowNullOrEmpty = false; }
            if (name !== null) {
                if (typeof name != 'string')
                    name = '' + name;
                name = name.trim();
            }
            if (name === FlowScript.undefined)
                name = null;
            if (name) {
                if (name.indexOf("'") >= 0)
                    throw "Single quote not yet supported, and will cause errors."; // TODO: Fix property names containing single quote errors.
                if (name.substring(0, 3) == '$__')
                    throw "Names cannot start with the special system reserved prefix of '$__'.";
            }
            else if (!allowNullOrEmpty)
                throw "A name is required.";
            return name;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches parameters, local variables, and return variables for a property matching a specified name. */
        Component.prototype.getProperty = function (name) {
            name = this._checkName(name, true);
            if (!name || name == FlowScript.Property.DEFAULT_NAME)
                return this._returnVars.getProperty(FlowScript.Property.DEFAULT_NAME);
            return this._parameters.getProperty(name)
                || this._localVars.getProperty(name)
                || FlowScript.undefined;
        };
        Component.prototype.hasParameter = function (nameOrIndex) {
            if (FlowScript.isValidNumericIndex(nameOrIndex)) {
                var i = +nameOrIndex;
                return i >= 0 && i < this._parameters.length;
            }
            else {
                var name = this._checkName(nameOrIndex);
                return this._parameters.hasProperty(name);
            }
        };
        /** Searches parameters, local variables, and return variables for a property matching a specified name, and returns true if found. */
        Component.prototype.hasProperty = function (name) {
            name = this._checkName(name, true);
            if (!name || name == FlowScript.Property.DEFAULT_NAME)
                return this._returnVars.hasProperty(FlowScript.Property.DEFAULT_NAME);
            return this._parameters.hasProperty(name)
                || this._localVars.hasProperty(name);
        };
        /** Searches instance properties for a property matching a specified name.
          * @param {boolean} ownProperty If true, then only properties that belong to this component are searched.
          */
        Component.prototype.getInstanceProperty = function (name, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            name = this._checkName(name, true);
            // ... check inheritance ...
            var type = this;
            while (type) {
                if (type instanceof Component && type.isObject) {
                    var p = type._instanceProperties.getProperty(name);
                    if (p)
                        return p;
                    if (ownProperty)
                        break;
                }
                type = type.superType;
            }
            return;
        };
        /** Searches instance properties in the parent chain for a property matching a specified name, and returns true if found.
          * @param {boolean } ownProperty If true then only properties that belong to this object are checked.
          */
        Component.prototype.hasInstanceProperty = function (name, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            name = this._checkName(name, true);
            // ... check inheritance ...
            var type = this;
            while (type) {
                if (type instanceof Component && type.isObject) {
                    if (type._instanceProperties.hasProperty(name))
                        return true;
                    if (ownProperty)
                        break;
                }
                type = type.superType;
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give parameter name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateParameterName = function (name, ignore) {
            name = this._checkName(name);
            if (this._localVars.hasProperty(name, ignore))
                throw "Parameter '" + name + "' is already defined as a local variable.";
            //?if (this._returnVars.hasProperty(name, ignore))
            //    throw "Parameter '" + name + "' is already defined as a return variable.";
            if (!this._parameters.hasProperty(name, ignore)) // (must already exist via the title! [a default property is set for each title token])
                throw "Parameter '" + name + "' does not exist.  Please check the spelling, and make sure the component's title has a related token name first.";
            return name;
        };
        /** Further define component's parameter. */
        Component.prototype.defineParameter = function (name, validTypes, initialValue, validation, isOptional, isConst, isAlias) {
            name = this._validateParameterName(name);
            var p = new FlowScript.Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isOptional: isOptional, isConst: isConst, isAlias: isAlias });
            p._explicitlyDefined = true;
            this._parameters.replace(p);
            return p;
        };
        Component.prototype.renameParameter = function (prop, newName) {
            var p = this._parameters.getProperty(typeof prop == "string" ? prop : prop.name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no parameter named '" + name + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateParameterName(newName, p);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeParameter = function (prop) {
            var p = this._parameters.getProperty(typeof prop == "string" ? prop : prop.name);
            if (p) {
                if (this._titleParams && this._titleParams.indexOf(p) >= 0)
                    throw "You cannot remove a component title parameter.";
                p.remove();
            }
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give local variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateLocalVarName = function (name, ignore) {
            name = this._checkName(name);
            if (this._localVars.hasProperty(name, ignore))
                throw "The local variable'" + name + "' is already defined.";
            if (this._parameters.hasProperty(name, ignore))
                throw "'" + name + "' is already defined as a parameter.";
            //?if (this._returnVars.hasProperty(name, ignore))
            //    throw "Parameter '" + name + "' is already defined as a return variable.";
            return name;
        };
        /** Defines a new local variable for this component. */
        Component.prototype.defineLocalVar = function (name, validTypes, initialValue, validation, isOptional, isStatic) {
            name = this._validateLocalVarName(name);
            var p = new FlowScript.Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isOptional: isOptional, isStatic: isStatic });
            p._explicitlyDefined = true;
            this._localVars.push(p);
            return p;
        };
        Component.prototype.renameLocalVar = function (prop, newName) {
            var p = this._localVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no local variable named '" + name + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateLocalVarName(newName, p);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeLocalVar = function (prop) {
            var p = this._localVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (p)
                p.remove();
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give return variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateReturnVarName = function (name) {
            name = this._checkName(name, true);
            if (!name) {
                if (this._returnVars.length)
                    throw "Returns have already been defined for this component.  A default return must be the first definition.";
            }
            else {
                if (!this.getProperty(name))
                    throw "Cannot define return '" + name + "': No parameter or local variable has been defined with that name yet.";
            }
            return name;
        };
        /** Defines a new local variable to use as a return value for this component.
          * To define a default return value for this functional component, pass in 'null'/undefined for the name.
          */
        Component.prototype.defineReturnVar = function (name, returnType) {
            if (returnType === void 0) { returnType = FlowScript.System.Any; }
            name = this._validateReturnVarName(name);
            var p = new FlowScript.Property(null, [returnType], name || FlowScript.Property.DEFAULT_NAME);
            p._explicitlyDefined = true;
            this._returnVars.push(p);
            return p;
        };
        /** Defines a default return value for this functional component.
          * When default returns are defined, a running expression variable tracks each executed expression and returns the last
          * expression executed.
          */
        Component.prototype.defineDefaultReturnVar = function (returnType) {
            if (returnType === void 0) { returnType = FlowScript.System.Any; }
            return this.defineReturnVar(null, returnType);
        };
        Component.prototype.renameReturnVar = function (prop, newName) {
            var p = this._returnVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no local variable named '" + name + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateReturnVarName(newName);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeReturnVar = function (prop) {
            var p = this._returnVars.getProperty(typeof prop == "string" ? prop : prop.name);
            if (p)
                p.remove();
            return p;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Validates and returns the give instance variable name for adding or renaming operations.  If the name exists, or is not valid, an exception is thrown. */
        Component.prototype._validateInstancePropertyName = function (name, ignore) {
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
        };
        /** Defines a new local instance related variable for this component. */
        Component.prototype.defineInstanceProperty = function (name, validTypes, initialValue, validation) {
            name = this._validateInstancePropertyName(name);
            var p = new FlowScript.Property(null, validTypes, name, { initialValue: initialValue, validation: validation, isInstance: true });
            p._explicitlyDefined = true;
            this._instanceProperties.push(p);
            return p;
        };
        Component.prototype.renameInstanceProperty = function (prop, newName, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            var p = this.getInstanceProperty(typeof prop == "string" ? prop : prop.name, ownProperty);
            if (!p)
                if (typeof prop == "string")
                    throw "There is no instance property named '" + name + "' on component '" + this.fullTypeName + "'.";
                else
                    throw "Invalid argument value for 'prop': A name or property object was expected.";
            newName = this._validateInstancePropertyName(newName, p);
            p['_name'] = newName;
            return p;
        };
        Component.prototype.removeInstanceProperty = function (prop, ownProperty) {
            if (ownProperty === void 0) { ownProperty = false; }
            var p = this.getInstanceProperty(typeof prop == "string" ? prop : prop.name, ownProperty);
            if (p)
                p.remove();
            return p;
        };
        /** Defines the instance type expected by this component (the instance type this component can work with). If this is
          * set, this component can only be called in object contexts using special statements. Example: the "with" component.
          */
        Component.prototype.defineInstanceType = function (type) {
            this._instanceType = type;
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Register a callback event. */
        Component.prototype.registerEvent = function (name) {
            //?var ev = new Event(this, name);
            //?this._events.push(ev);
            //?return ev;
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Configures a new runtime context with the supplied arguments. */
        Component.prototype.configureRuntimeContext = function (ctx, args) {
            if (typeof args == 'object')
                for (var p in args)
                    if (!FlowScript.Expression.NUMERIC_INDEX_REGEX.test(p) && !this.hasProperty(p))
                        throw "Component '" + this + "' does not contain a parameter or local variable named '" + p + "'.";
                    else
                        this.setArgument(p, args[p], ctx.arguments);
            //throw "Invalid arguments: There is no parameter, local, or return property named '" + name + "' in component '" + this + "'.";
            return ctx;
        };
        Component.prototype.setArgument = function (argIndex, value, target) {
            var exptectedParameters = this._parameters;
            // ... both the parameter name AND index must bet set; pull the parameter name if an index is given, or the parameter index if a name is given ...
            if (FlowScript.isValidNumericIndex(argIndex)) {
                var i = +argIndex, name = i >= 0 && i < exptectedParameters.length ? exptectedParameters.getProperty(i).name : '@' + i; // (an index outside the number of parameters sets the "optional" arguments)
                if (i < 0)
                    throw "Cannot set argument at '" + i + "' to '" + value + "': Argument index must be >= 0";
            }
            else {
                name = argIndex;
                i = exptectedParameters.indexOf(name); // (check first if there's a matching parameter by the same name, and if so, set the target property name)
                if (i < 0)
                    throw "Cannot set argument '" + name + "' to '" + value + "': There is no parameter '" + name + "' defined on component '" + this + "'.";
            }
            var existingValue = target[name];
            if (value === void 0) { // (setting an argument to 'undefined' removes and returns the parameter value)
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
            return existingValue;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the first block. */
        Component.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            // ... add the parameters for this component ...
            //add via expressions only, using ComponentReference / if (this._parameters.length)
            //    for (var i = 0, n = this._parameters.length; i < n; ++i)
            //        node.createNode(this._parameters.getProperty(i));
            if (this._blocks.length)
                this._blocks[0].createVisualTree(node, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Component.TITLE_TOKEN_SEARCH_REGEX = /\$(?:[a-zA-Z0-9_?]|\\\$)*/gi;
        Component.TITLE_TOKEN_VALIDATE_REGEX = /\$\??[a-zA-Z_$][a-zA-Z0-9_$]*/i; // (WARNING!!! Adding the 'g' (global) flag will cause '.test()' to advance in subsequent tests, and possibly fail)
        return Component;
    }(FlowScript.Type));
    FlowScript.Component = Component;
    // ========================================================================================================================
    var FunctionalComponent = /** @class */ (function (_super) {
        __extends(FunctionalComponent, _super);
        function FunctionalComponent(parent, typeName, signatureTitle, script) {
            return _super.call(this, parent, ComponentTypes.Functional, typeName, signatureTitle, script) || this;
        }
        return FunctionalComponent;
    }(Component));
    FlowScript.FunctionalComponent = FunctionalComponent;
    // ========================================================================================================================
    /** Helps to build a single component using chainable calls. */
    var ComponentBuilder = /** @class */ (function () {
        /** Helps to build a single component using chainable calls. See Component for more details. */
        function ComponentBuilder(parent, componentType, typeName, signatureTitle, script) {
            this.Component = new Component(parent, componentType, typeName, signatureTitle, script);
        }
        /** See {Component}.defineParameter() for more details. */
        ComponentBuilder.prototype.defineParameter = function (name, validTypes, initialValue, validation, isOptional, isConst, isAlias) {
            this.Component.defineParameter(name, validTypes, initialValue, validation, isOptional, isConst, isAlias);
            return this;
        };
        /** Similar to calling 'defineParameter()', except allows defining an enum type property with a 'fixed' or 'not fixed' flag.
          * If a property is 'fixed' to an enum, the developer can only select or enter values matching those in the enum.
          */
        ComponentBuilder.prototype.defineEnumProperty = function (name, enumType, isFixed, initialValue, validation, isOptional, isConst) {
            this.Component.defineParameter(name, [enumType], initialValue, validation, isOptional, isConst).isFixedtoEnum = isFixed;
            return this;
        };
        /** See {Component}.defineLocal() for more details. */
        ComponentBuilder.prototype.defineLocal = function (name, validTypes, initialValue, validation, isOptional, isStatic) {
            this.Component.defineLocalVar(name, validTypes, initialValue, validation, isOptional, isStatic);
            return this;
        };
        /** See {Component}.defineReturn() for more details. */
        ComponentBuilder.prototype.defineReturn = function (name, returnType) {
            this.Component.defineReturnVar(name, returnType);
            return this;
        };
        /** See {Component}.defineInstance() for more details. */
        ComponentBuilder.prototype.defineInstance = function (name, validTypes, initialValue, validation) {
            this.Component.defineInstanceProperty(name, validTypes, initialValue, validation);
            return this;
        };
        /** See {Component}.defineInstanceType() for more details. */
        ComponentBuilder.prototype.defineInstanceType = function (type) {
            this.Component.defineInstanceType(type);
            return this;
        };
        /** See {Component}.registerEvent() for more details. */
        ComponentBuilder.prototype.registerEvent = function (name) {
            this.Component.registerEvent(name);
            return this;
        };
        /** Adds a new statement on a new line (See {Line}.addStatement()). */
        ComponentBuilder.prototype.addStatement = function (action, args, returnTargets, eventHandlers) {
            var _args = [];
            if (args)
                for (var i = 0; i < args.length; ++i)
                    if (args[i])
                        if (args[i] instanceof FlowScript.Expression)
                            _args[i] = args[i];
                        else
                            _args[i] = new FlowScript.Constant(args[i]);
            this.Component.block.newLine().addStatement(action, _args, returnTargets, eventHandlers);
            return this;
        };
        return ComponentBuilder;
    }());
    FlowScript.ComponentBuilder = ComponentBuilder;
    /** References a block for use in expressions. */
    var ComponentReference = /** @class */ (function (_super) {
        __extends(ComponentReference, _super);
        // TODO: Consider creating a custom collection so the type can be detected by the VisualNode
        // --------------------------------------------------------------------------------------------------------------------
        function ComponentReference(source, args, returnTargets, eventHandlers, parent) {
            var _this = _super.call(this, parent) || this;
            _this._arguments = new FlowScript.ExpressionArgs(_this); // (the arguments are taken from 1. the calling component's declared local variables [including parameters], or 2. other components)
            if (!source || typeof source != 'object' || !(source instanceof Component))
                throw "A valid component object is required.";
            _this._componentRef = source.getReference();
            _this.initExpression(source, args, returnTargets, eventHandlers);
            return _this;
        }
        Object.defineProperty(ComponentReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this.component ? this.component.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "component", {
            /** The component that this referenced points to. */
            get: function () { return this._componentRef.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "arguments", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The arguments set for this expression, if any.
              * Use 'setArgument()' to set values for this object.
              */
            get: function () { return this._arguments; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "argumentLength", {
            /** Returns the count of indexed values in the object (i.e. the highest index + 1). */
            get: function () {
                //var length = 0;
                //if (this._arguments)
                //    for (var p in this._arguments) {
                //        var i = +p;
                //        if (!isNaN(i) && i >= length) // (isNan faster than regex: https://jsperf.com/opandstr-vs-regex-test)
                //            length = i + 1; // (the length is the largest index number + 1 [note: may not contain optional args, so must search of largest index])
                //    }
                return this._arguments ? this._arguments.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentReference.prototype, "returnTargets", {
            get: function () { return this._returnTargets; },
            enumerable: true,
            configurable: true
        });
        /** Initialize this expression with new arguments, return targets, and event handlers. */
        ComponentReference.prototype.initExpression = function (source, args, returnTargets, eventHandlers) {
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
        };
        // --------------------------------------------------------------------------------------------------------------------
        ComponentReference.prototype._clone = function (parent) {
            var compRef = new ComponentReference(this.component, null, null, null, parent);
            this._arguments.clone(compRef);
            this._returnTargets.clone(compRef);
            var eh = [];
            if (this._eventHandlers)
                for (var i = 0, n = this._eventHandlers.length; i < n; ++i)
                    eh[i] = this._eventHandlers[i].clone(compRef);
            compRef.initExpression(this.component, void 0, void 0, eh);
            return compRef;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        ComponentReference.prototype.containsChildExpression = function (expr) {
            var _expr;
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
        };
        ComponentReference.prototype.remove = function (child) {
            if (child) {
                // ... 'this' is the parent, so find the reference and remove it ...
                // ... check args ...
                var expr = this._arguments ? this._arguments.removeArgument(child) : null;
                // ... check returns ...
                if (!expr && this._returnTargets)
                    expr = this._returnTargets.removeReturn(child);
                // ... check events ...
                if (!expr && this.removeEvent)
                    expr = this.removeEvent(child);
            }
            else
                expr = _super.prototype.remove.call(this);
            return expr ? expr : null;
        };
        /** Clears the expression of all arguments, return targets, and event handlers. */
        ComponentReference.prototype.clear = function () {
            this._arguments.clear();
            this._returnTargets.clear();
            this.clearEventHandlers();
        };
        ComponentReference.prototype.removeEvent = function (eventHandlerOrIndex) {
            // ... check event handlers ...
            var expr;
            if (typeof eventHandlerOrIndex == 'number') {
                if (eventHandlerOrIndex < 0 || eventHandlerOrIndex >= this._eventHandlers.length)
                    throw "Event index '" + eventHandlerOrIndex + "' is out of bounds.";
                expr = this._eventHandlers.splice(i, 1)[0];
            }
            else
                for (var i = this._eventHandlers.length - 1; i >= 0; --i)
                    if (this._eventHandlers[i] == eventHandlerOrIndex)
                        expr = this._eventHandlers.splice(i, 1)[0];
            return expr || null;
        };
        /** Removes all event handlers. */
        ComponentReference.prototype.clearEventHandlers = function () {
            if (this._eventHandlers)
                for (var i = this._eventHandlers.length - 1; i >= 0; --i)
                    this._returnTargets.removeReturn(i);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ComponentReference.prototype.save = function (target) {
            target = target || {};
            target.source = this.component ? this.component.fullTypeName : null;
            if (this._arguments)
                this._arguments.save(target);
            if (this._returnTargets)
                this._returnTargets.save(target);
            target.events = [];
            _super.prototype.save.call(this, target);
            return target;
        };
        ComponentReference.prototype.load = function (target) {
            target = target || {};
            // super.load(target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns available properties that can be used given the parent expression hierarchy. */
        ComponentReference.prototype.getAvailablePropertyList = function () {
            // ... get from any 'with' block first ...
            var withStatement = this.getParentWith(), availableProperties = [];
            if (withStatement) {
                var objExpr = withStatement._arguments.getArg(0);
                if (!objExpr || !(objExpr instanceof FlowScript.PropertyReference)) // (a property expression argument is required to continue)
                    return null;
                var propertyType = objExpr.property.validTypes[0];
                if (propertyType && propertyType.assignableTo(FlowScript.System.Object)) {
                    var oc = propertyType; // (the property type references an object type component)
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
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        ComponentReference.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = _super.prototype.createVisualTree.call(this, parent, visualNodeType);
            // ... first, each return type should be added, in order ...
            if (this._returnTargets) {
                this._returnTargets.createVisualTree(node);
                node.appendTextNode("=");
            }
            // ... next, add the arguments, also in order ...
            this._arguments.createVisualTree(node);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ComponentReference.prototype.toString = function () { return "" + this.component; }; // TODO: Extend this with arguments and return mappings as well.
        return ComponentReference;
    }(FlowScript.Expression));
    FlowScript.ComponentReference = ComponentReference;
    /** The root expression is call a "statement", which is a single stand-alone component call, assignment operation, or flow
      * control block.  Lines usually reference statements, and other expressions are nested within them.
      */
    var Statement = /** @class */ (function (_super) {
        __extends(Statement, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Statement(line, action, args, returnTargets, eventHandlers) {
            return _super.call(this, action, args, returnTargets, eventHandlers, (eval('this._line = line'), null)) || this;
        }
        Object.defineProperty(Statement.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._line ? this._line.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "line", {
            /** The line this expression belongs to. */
            get: function () { return this._line; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "lineNumer", {
            /** The line number this statement is on. */
            get: function () { return this._line ? this._line.lineNumber : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "functionalComponent", {
            /** Returns the functional component this expression belongs to. */
            get: function () { return this.line ? this.line.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Statement.prototype, "block", {
            get: function () { return this._line ? this._line.block : null; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        Statement.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = _super.prototype.createVisualTree.call(this, parent, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Statement.prototype._clone = function (parent) {
            return new Statement(this._line, this.component);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Statement.prototype.save = function (target) {
            target = target || {};
            _super.prototype.save.call(this, target);
            return target;
        };
        Statement.prototype.remove = function (child) {
            if (child)
                return _super.prototype.remove.call(this, child);
            else {
                if (this._line)
                    return this._line.removeStatement(this);
                return void 0;
            }
        };
        return Statement;
    }(ComponentReference));
    FlowScript.Statement = Statement;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Component.js.map