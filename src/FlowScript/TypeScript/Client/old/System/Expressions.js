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
    var ExpressionArgs = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function ExpressionArgs(owner) {
            this._args = {};
            this._owner = owner;
        }
        Object.defineProperty(ExpressionArgs.prototype, "owner", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The ComponentReference that these arguments belong to. */
            get: function () { return this._owner; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "source", {
            /** The component that is the underlying subject of the component reference. */
            get: function () { return this._owner.component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "args", {
            get: function () { return this._args; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "isEmpty", {
            get: function () { return FlowScript.isObjectEmpty(this._args); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpressionArgs.prototype, "length", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns the length of the arguments based on the highest index found in the existing numerical properties. */
            get: function () {
                var endIndex = -1;
                for (var p in this._args) {
                    var c = p.charCodeAt(0);
                    if (c >= 48 && c <= 57) // (optimization: http://jsperf.com/isnan-vs-check-first-char)
                     {
                        var i = +p;
                        if (i > endIndex)
                            endIndex = i;
                    }
                }
                return endIndex + 1;
            },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.apply = function (args) {
            if (args)
                for (var p in args)
                    if (typeof args[p] != 'object' || !(args[p] instanceof Expression))
                        throw "Cannot add argument '" + p + "': the value is not a valid expression object.";
                    else
                        this._setArg(p, args[p]);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /**
      * Returns the numerical argument indexes found in the 'args' object as an array of integers.
      * This is sorted by default to make sure the numerical properties were iterated in order, unless 'sorted' is false.
      * Note: This call is much faster if sorting is not required.
      */
        ExpressionArgs.prototype.getArgIndexes = function (sorted) {
            if (sorted === void 0) { sorted = true; }
            var indexes = [];
            for (var p in this) {
                var c = p.charCodeAt(0);
                if (c >= 48 && c <= 57) // (optimization: http://jsperf.com/isnan-vs-check-first-char)
                    indexes.push(+p);
            }
            return sorted ? indexes.sort(function (a, b) { return a - b; }) : indexes;
        };
        /**
         * Returns the argument names found in this object as an array of strings.
         * This is sorted by default to make sure the argument names match the argument indexes, unless 'sorted' is false.
         * Note: This call is much faster if sorting is not required.
         */
        ExpressionArgs.prototype.getArgNames = function (sorted) {
            if (sorted === void 0) { sorted = true; }
            var names = [];
            if (sorted) {
                var indexes = this.getArgIndexes(true); // (request to make sure they are in order)
                for (var i = 0, n = indexes.length; i < n; ++i)
                    names.push(this._args[indexes[i]]); // (the value of each index holds the argument name)
            }
            else { // (note: much faster if sorting is not needed)
                for (var p in this._args) {
                    var c = p.charCodeAt(0);
                    if (p.substr(0, 3) != "$__" && (c < 48 || c > 57)) // (see optimization test: http://jsperf.com/compare-hasownproperty-vs-substring-test)
                        names.push(p);
                }
            }
            return names;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.save = function (target) {
            target = target || {};
            target.arguments = {};
            for (var p in this._args) {
                var argValue = this._args[p];
                if (typeof argValue == 'string') // (indexes 0:, 1:, etc., all hold the actual parameter names for each argument expression given)
                    target.arguments[+p] = argValue;
                else if (typeof argValue == 'object' && argValue instanceof Expression)
                    target.arguments[p] = argValue.save();
            }
            return target;
        };
        ExpressionArgs.prototype._setArg = function (arg, expr) {
            if (expr.parent)
                if (expr.parent != this._owner)
                    expr.remove();
            expr['_parent'] = this._owner; // (no parent defined, so default to this)
            //? if (expr.containingComponent != this.containingComponent)
            //    throw "Expression error: Argument expression '" + argIndex + ":<" + expr.source + ">' belongs to another component ('" + expr.containingComponent + "').  You can't reuse existing expressions in another components '" + this.containingComponent + "'.";
            if (expr instanceof FlowScript.Statement)
                throw "Argument expression '" + expr.component + "' for parameter '" + arg + "' of component '" + this.source + "' is a line level statement, and is not allowed as an argument.";
            if (expr instanceof FlowScript.LineReference)
                throw "Argument expression '" + expr.component + "' for parameter '" + arg + "' of component '" + this.source + "' is a line reference, and is not allowed as an argument.";
            if (typeof expr.component != 'object' || !(expr instanceof Constant) && !(expr.component instanceof FlowScript.Component))
                throw "Cannot set parameter '" + arg + "' of component '" + this.source + "' to the given expression: the 'source' component reference for the specified expression is missing or invalid.";
            this._owner.cyclicalCheck(expr); // (make the owner if this ExpressionArgs instance [a component reference] is not also a child of the expression being set!)
            return this.source.setArgument(arg, expr, this._args);
        };
        ExpressionArgs.prototype.setArg = function (arg, argObj, args, returnTargets) {
            if (!this.source.hasParameter(arg))
                throw "Component '" + this.source + "' doesn't have a parameter named '" + arg + "'.";
            if (typeof argObj != 'object')
                throw "Cannot set argument '" + arg + "': the argument value is not an object reference (Component or Expression).";
            var argIsExpr = argObj instanceof Expression, argIsComp = argObj instanceof FlowScript.Component;
            if (!argIsExpr && !argIsComp)
                throw "Cannot set argument '" + arg + "': the specified argument value is not an 'Expression' or 'Component' type.";
            if (argIsExpr) {
                return this._setArg(arg, argObj);
            }
            else
                return this._setArg(arg, new FlowScript.ComponentReference(argObj, args, returnTargets, null, this._owner));
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the name of an argument given its argument index. */
        ExpressionArgs.prototype.getArgName = function (argIndex, required) {
            return this._args[argIndex];
        };
        ExpressionArgs.prototype.getArg = function (arg, required) {
            if (!this.source.hasParameter(arg))
                throw "Component '" + this.source + "' does not have a parameter '" + ((+arg + 1) || arg) + "'.";
            var argExpr;
            if (isValidNumericIndex(arg)) {
                var argName = this._args[arg];
                if (argName === void 0)
                    return void 0;
                argExpr = this._args[argName];
            }
            else
                argExpr = this._args[arg];
            if (!argExpr && required)
                throw "Argument '" + ((+arg + 1) || arg) + "' of component reference '" + this._owner + "' is missing a required argument value.";
            return argExpr;
        };
        ExpressionArgs.prototype.isArgSet = function (arg) {
            if (isValidNumericIndex(arg)) {
                var argName = this._args[arg];
                return argName !== void 0 && this._args[argName] !== void 0;
            }
            else
                return this._args[arg] !== void 0;
        };
        ExpressionArgs.prototype.removeArgument = function (nameOrIndexOrExpr) {
            if (typeof nameOrIndexOrExpr == 'object' && nameOrIndexOrExpr instanceof Expression) {
                var expr = nameOrIndexOrExpr;
                if (!expr.parent)
                    return nameOrIndexOrExpr; // (the expression is not attached anywhere)
                nameOrIndexOrExpr = null;
                for (var p in this._args)
                    if (this._args[p] == expr) {
                        nameOrIndexOrExpr = p;
                        break;
                    }
                if (!nameOrIndexOrExpr)
                    return null;
            }
            return this.source.setArgument(nameOrIndexOrExpr, void 0, this._args);
        };
        /** Removes all arguments. */
        ExpressionArgs.prototype.clear = function () {
            if (this._args)
                for (var p in this._args)
                    if (!isNaN(+p))
                        this.removeArgument(+p);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.containsExpression = function (expr) {
            var _expr;
            for (var p in this._args) {
                _expr = this._args[p];
                if (_expr && typeof _expr == 'object' && _expr instanceof Expression) {
                    if (expr == _expr)
                        return true;
                    else if (_expr.containsChildExpression(expr))
                        return true;
                }
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        ExpressionArgs.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            // ... next, add the arguments, also in order ...
            //? var argIndexes = this.getArgIndexes();
            var titleParseResult = this.source.titleParseResult;
            var parameters = titleParseResult.parameters;
            var titleParts = titleParseResult.titleParts; // (if not empty, there is always 1 more title part than parameters)
            //? for (var i = 0, n = argIndexes.length; i < n; ++i) {
            //    var argIndex = argIndexes[i];
            //    var argNode = node.appendNode(node.createNode(argIndex, VisualNodeTypes.Argument));
            //    var argExpr = this.getArg(argIndex);
            //    if (argExpr)
            //        argExpr.createVisualTree(argNode);
            //}
            for (var i = 0, n = titleParts.length; i < n; ++i) {
                node.appendTextNode(titleParts[i], FlowScript.VisualNodeTypes.ComponentTitlePart);
                if (i < parameters.length) {
                    var param = parameters[i]; // (this is the expected PARAMETER property declaration for this argument position)
                    //? var argIndex = argIndexes[i]; // (this is the ARGUMENT index from the component REFERENCE)
                    var argExpr = this.getArg(i, false); // (this is the ARGUMENT expression from the component REFERENCE)
                    // ... first, create a parameter container node to hold the argument(s) ...
                    var paramContainer = node.createNode(param, FlowScript.VisualNodeTypes.ComponentParameter);
                    paramContainer.title = "Parameter '" + param + "' of component " + this.source.name;
                    paramContainer.paramName = param.name;
                    paramContainer.paramIndex = i;
                    paramContainer.appendTextNode("[");
                    if (argExpr) {
                        var argNode = paramContainer.createNode(argExpr, FlowScript.VisualNodeTypes.Argument);
                        argNode.paramName = param.name;
                        argNode.paramIndex = i;
                        argExpr.createVisualTree(argNode, visualNodeType);
                    }
                    else
                        paramContainer.appendTextNode("«" + param.name + "»");
                    paramContainer.appendTextNode("]");
                }
            }
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionArgs.prototype.clone = function (forExpr) {
            var args = forExpr.arguments;
            args.clear();
            if (this._args)
                for (var p in this._args) {
                    var c = p.charCodeAt(0);
                    if (c >= 48 && c <= 57) {
                        var paramName = this._args[+p];
                        args.setArg(+p, this._args[paramName].clone(forExpr));
                    }
                }
            return args;
        };
        return ExpressionArgs;
    }());
    FlowScript.ExpressionArgs = ExpressionArgs;
    var ReturnTargetMap = /** @class */ (function () {
        function ReturnTargetMap(source, target) {
            this.source = source;
            this.target = target;
        }
        return ReturnTargetMap;
    }());
    FlowScript.ReturnTargetMap = ReturnTargetMap;
    var ReturnTargetMaps = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function ReturnTargetMaps(owner) {
            this._maps = [];
            this._owner = owner;
        }
        Object.defineProperty(ReturnTargetMaps.prototype, "owner", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The expression that these arguments belong to. */
            get: function () { return this._owner; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReturnTargetMaps.prototype, "source", {
            /** The component that is the return target for the owning expression. */
            get: function () { return this._owner.component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReturnTargetMaps.prototype, "maps", {
            /** Returns an array of maps between a given expression, and a target property on the calling component context. */
            get: function () { return this._maps; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReturnTargetMaps.prototype, "isEmpty", {
            get: function () { return !!this._maps.length; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.addTarget = function (source, target) {
            this._maps.push(new ReturnTargetMap(source, target));
        };
        ReturnTargetMaps.prototype.addTargetMap = function (targetMap) {
            if (targetMap)
                this._maps.push(targetMap);
        };
        ReturnTargetMaps.prototype.addTargetMaps = function (targets) {
            if (targets && targets.length)
                for (var i = 0, n = targets.length; i < n; ++i)
                    this.addTargetMap(targets[i]);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.indexOfReturnTarget = function (target) {
            for (var i = 0, n = this._maps.length; i < n; ++i)
                if (this._maps[i].target == target)
                    return i;
            return -1;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.mapReturnTarget = function (source, target) {
            if (!this._owner.functionalComponent)
                throw "Cannot set return target: No containing component value exists.";
            if (typeof source != 'object')
                throw "A source property is required, or 'null' to select the default source.";
            if (typeof target != 'object')
                throw "A target property is required.";
            if (!source) {
                var defaultProperty = this.source.getProperty(null);
                if (!defaultProperty)
                    throw "Source component '" + this.source + "' does not have a default return defined.";
                source = defaultProperty.createExpression(this._owner);
            }
            else if (source instanceof FlowScript.PropertyReference) {
                var propExpr = source;
                if (!this.source.hasProperty(propExpr.name))
                    throw "The source property is not valid: The component '" + this.source + "' does not have a property named '" + source + "'.";
            }
            if (!target || !target.name || target.name == FlowScript.Property.DEFAULT_NAME)
                throw "The target of a return mapping cannot be a default property definition.  Default properties exist only to declare the return type of a functional component call.";
            else if (!this._owner.functionalComponent.hasProperty(target.name))
                throw "The target property is not valid: The containing component '" + this._owner.functionalComponent + "' does not have a property named '" + target + "'.";
            var i = this.indexOfReturnTarget(target);
            if (i >= 0)
                throw "The return target '" + target + "' was already mapped with a value from '" + this._maps[i].source + "'.";
            this._owner.cyclicalCheck(source);
            this._owner.cyclicalCheck(target);
            this._maps.push({ source: source, target: target });
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.save = function (target) {
            target = target || {};
            target.returnTargets = [];
            for (var i = 0, n = this._maps.length; i < n; ++i) {
                var rt = this._maps[i];
                target.returnTargets[i].source = rt.source ? rt.source.save() : null;
                target.returnTargets[i].target = rt.target ? rt.target.save() : null;
            }
            return target;
        };
        ReturnTargetMaps.prototype.removeReturn = function (nameOrIndexOrExpr) {
            if (typeof nameOrIndexOrExpr == 'object' && nameOrIndexOrExpr instanceof Expression) {
                var expr = nameOrIndexOrExpr;
                for (var i = this._maps.length - 1; i >= 0; --i) {
                    var rt = this._maps[i];
                    if (rt.source == expr) {
                        this._maps.splice(i, 1);
                        return expr;
                    }
                }
            }
            else {
                var i = +nameOrIndexOrExpr;
                if (isNaN(i)) {
                    if (i < 0 || i > this._maps.length)
                        throw "Index '" + i + "' is outside the bounds for the return targets (current targets: '" + this._maps.length + "').";
                    var map = this._maps.splice(i, 1);
                    return map && map.length ? map[0].source : null;
                }
                else
                    throw "'" + i + "' is not a valid index value.";
            }
            return null;
        };
        /** Removes all return mappings. */
        ReturnTargetMaps.prototype.clear = function () {
            if (this._maps)
                for (var i = this._maps.length - 1; i >= 0; --i)
                    this.removeReturn(i);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.containsExpression = function (expr) {
            var _expr;
            for (var i = this._maps.length - 1; i >= 0; --i) {
                var rt = this._maps[i];
                if (rt) {
                    if (rt.source)
                        if (rt.source == expr)
                            return true;
                        else if (rt.source.containsChildExpression(expr))
                            return true;
                    if (rt.target)
                        if (rt.target == expr)
                            return true;
                        else if (rt.target.containsChildExpression(expr))
                            return true;
                }
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this component and the component's first block. */
        ReturnTargetMaps.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            // ... first, each return type should be added, in order ...
            for (var i = 0, n = this._maps.length; i < n; ++i)
                node.createNode(this._maps[i]);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ReturnTargetMaps.prototype.clone = function (forExpr) {
            var rtMaps = forExpr.returnTargets;
            rtMaps.clear();
            for (var i = 0, n = this._maps.length; i < n; ++i)
                rtMaps.addTarget(this._maps[i].source.clone(forExpr), this._maps[i].target.clone(forExpr));
            return rtMaps;
        };
        return ReturnTargetMaps;
    }());
    FlowScript.ReturnTargetMaps = ReturnTargetMaps;
    /** Returns true if the given value is numeric (a number type, or string with digits only [i.e. '0'...'10'...etc.; '+1.0' is invalid]).
     * This function is optimized to test as quickly as possible. For example, 'true' is returned immediately if 'value' is a number type.
     */
    function isValidNumericIndex(value) {
        var type = typeof value;
        if (type == 'number')
            return true;
        var str = type == 'string' ? value : '' + value;
        if (str.length == 1) { // (there's a faster test for only one character)
            var c = str.charCodeAt(0);
            if (c >= 48 && c <= 57)
                return true; // (optimization: http://jsperf.com/isnan-vs-check-first-char)
        }
        return Expression.NUMERIC_INDEX_REGEX.test(str);
    }
    FlowScript.isValidNumericIndex = isValidNumericIndex;
    // ========================================================================================================================
    /** The smallest executable element within FlowScript which specifies some action to be carried out.
     * An expression (in FlowScript) usually encompasses a component reference, arguments, return value targets, and event handlers.
     */
    var Expression = /** @class */ (function (_super) {
        __extends(Expression, _super);
        //?get expressions() { return this._expressions; }
        //?private _expressions: Expression[] = []; // (NOTE: This is an array, but only one statement per line is supported at this time for final output rendering)
        // --------------------------------------------------------------------------------------------------------------------
        function Expression(parent) {
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this) || this;
            _this._parent = parent;
            return _this;
        }
        Object.defineProperty(Expression.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "script", {
            get: function () { return this._parent ? this._parent.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "functionalComponent", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns the functional component this expression belongs to, or null otherwise.
              * Functional components (components that usually render to final code in some way [i.e. functions, operations, etc.])
              * have blocks with lines consisting of statements and expressions.  This function searches the parent expression tree
              * for the nearest functional component.
              */
            get: function () { return this._parent ? this._parent.functionalComponent : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "statement", {
            /** The statement this expression belongs to, or null otherwise. */
            get: function () { return this instanceof FlowScript.Statement ? this : this._parent ? this._parent.statement : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "line", {
            /** The line this expression belongs to, or null otherwise. */
            get: function () { return this._parent ? this._parent.line : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "blockExpression", {
            /** Return the nearest containing block expression if any, or null otherwise. */
            get: function () { return this instanceof FlowScript.BlockReference ? this : this._parent ? this._parent.blockExpression : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "block", {
            /** The block this expression belongs to, or null otherwise (simple shortcut for getting the 'blockExpression.block' reference). */
            get: function () { var bexpr = this.blockExpression; return bexpr ? bexpr.block : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "propertyExpression", {
            /** Return the nearest containing property expression if any, or null otherwise. */
            get: function () { return this instanceof FlowScript.PropertyReference ? this : this._parent ? this._parent.propertyExpression : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "property", {
            /** The property this expression is under, or null otherwise (simple shortcut for getting the 'propertyExpression.property' reference). */
            get: function () { var pexpr = this.propertyExpression; return pexpr ? pexpr.property : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Expression.prototype, "component", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The component that this expression references, or null if the expression doesn't reference components. */
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        Expression.prototype.containsChildExpression = function (expr) {
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Expression.prototype.save = function (target) {
            target = target || {};
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Copy this expression to a new expression instance for use elsewhere.
          * Since it is not permitted to use expression references in multiple places, a new instance is always required.
          * Closing expressions is a convenient way to duplicate expressions for use in multiple places.
          * Alternatively, an ExpressionReference object can reference other expressions.
          */
        Expression.prototype.clone = function (parent) {
            return this._clone(parent);
        };
        Expression.prototype._clone = function (parent) {
            return new Expression(parent);
        };
        Expression.prototype.remove = function (child) {
            if (child) {
                // ... 'this' is the parent, so find the reference and remove it ...
                return null; // (not found)
            }
            else {
                // ... no child given, so assume self ...
                if (this._parent)
                    var expr = this._parent.remove(this);
            }
            return expr ? expr : null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Calls 'expr.containsChildExpression(this)' on the given expression using 'this' expression and generates a cyclical error if found. */
        Expression.prototype.cyclicalCheck = function (expr) {
            if (expr)
                if (typeof expr != 'object' || !(expr instanceof Expression))
                    throw "Expressions.cyclicalCheck(expr): 'expr' is not an Expression object.";
                else if (expr.containsChildExpression(this))
                    throw "Cyclical error: You cannot use parent expressions (directly or indirectly) within themselves, or any nested child expressions. Clone the expression first and try again.";
        };
        /** Returns the immediate parent "with" statement, or 'null' if none. */
        Expression.prototype.getParentWith = function () {
            // ... statements can be nested due to nested blocks, so traverse the statements and any parent blocks ...
            var expr = this.blockExpression, statement;
            while (expr && (statement = expr.statement)) {
                if (statement.component.fullTypeName == FlowScript.System.With.fullTypeName)
                    return statement;
                expr = statement.blockExpression;
            }
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this expression object. */
        Expression.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** A regex used to test for numerical indexes. See 'isValidNumericIndex()' also. */
        Expression.NUMERIC_INDEX_REGEX = /^0|[1-9][0-9]*$/;
        /** A regex used to test for valid identifiers for the system. */
        Expression.VALID_IDENTIFIER_REGEX = /^[a-zA-z_$][a-zA-z0-9_$]*$/;
        return Expression;
    }(FlowScript.TrackableObject));
    FlowScript.Expression = Expression;
    /** References an expression for indirect use with other expressions. */
    var ExpressionReference = /** @class */ (function (_super) {
        __extends(ExpressionReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function ExpressionReference(expr, parent) {
            var _this = _super.call(this, parent) || this;
            if (!expr || typeof expr != 'object' || !(expr instanceof Expression))
                throw "A valid expression object is required.";
            _this._expr = expr;
            return _this;
        }
        Object.defineProperty(ExpressionReference.prototype, "expression", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The indirect expression that is referenced by this expression. */
            get: function () { return this._expr; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionReference.prototype._clone = function (parent) {
            return new ExpressionReference(this._expr, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionReference.prototype.save = function (target) {
            target = target || {};
            target.expression = this.expression.save();
            _super.prototype.save.call(this, target);
            return target;
        };
        ExpressionReference.prototype.load = function (target) {
            target = target || {};
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        ExpressionReference.prototype.toString = function () { return "Expression reference: " + this._expr; };
        return ExpressionReference;
    }(Expression));
    FlowScript.ExpressionReference = ExpressionReference;
    /** A constant value expression.
      */
    var Constant = /** @class */ (function (_super) {
        __extends(Constant, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Constant(value) {
            var _this = _super.call(this, null) || this;
            _this.value = value;
            return _this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        Constant.prototype._clone = function (parent) {
            return new Constant(this.value);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Constant.prototype.save = function (target) {
            target = target || {};
            target.valueType = typeof this.value;
            if (target.valueType == 'object') {
                if (typeof this.value.save == 'function')
                    target.value = this.value.save(); // (just in case, support 
                else if (typeof JSON != 'object' || !JSON.stringify)
                    throw "Cannot serialize a constant object reference - 'JSON.stringify()' is required, but not found in this environment.";
                else
                    target.value = JSON.stringify(this.value);
            }
            else
                target.value = '' + this.value;
            _super.prototype.save.call(this, target);
            return target;
        };
        return Constant;
    }(Expression));
    FlowScript.Constant = Constant;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Expressions.js.map