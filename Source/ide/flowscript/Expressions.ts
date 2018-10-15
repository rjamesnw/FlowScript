﻿// ############################################################################################################################

module FlowScript {
    // ========================================================================================================================

    /** A map that stores the argument name under a fixed index, and the expression object under the name. */
    export interface IArgumentMap {
        [index: number]: string | any;
        [name: string]: Expression;
    }

    /** Returns the expression for a component given either the fixed argument index or name. */
    export interface IComponentReferenceArgs {
        [index: number]: Expression;
        [name: string]: Expression;
    }

    export interface ISavedExpressionArgs { arguments: { [index: number]: any;[name: string]: ISavedExpression; }; }

    export class ExpressionArgs {
        // --------------------------------------------------------------------------------------------------------------------

        /** The ComponentReference that these arguments belong to. */
        get owner(): ComponentReference { return this._owner; }
        private _owner: ComponentReference;

        /** The component that is the underlying subject of the component reference. */
        get source(): Component { return this._owner.component; }

        get args(): IArgumentMap { return this._args; }
        private _args: IArgumentMap = {};

        get isEmpty(): boolean { return isObjectEmpty(this._args); }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(owner: ComponentReference) { this._owner = owner; }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns the length of the arguments based on the highest index found in the existing numerical properties. */
        get length(): number {
            var endIndex = -1;
            for (var p in this._args) {
                var c = (<string>p).charCodeAt(0);
                if (c >= 48 && c <= 57) // (optimization: http://jsperf.com/isnan-vs-check-first-char)
                {
                    var i = +p;
                    if (i > endIndex)
                        endIndex = i;
                }
            }
            return endIndex + 1;
        }

        // --------------------------------------------------------------------------------------------------------------------

        apply(args: IComponentReferenceArgs) {
            if (args)
                for (var p in args)
                    if (typeof args[p] != 'object' || !(args[p] instanceof Expression))
                        throw "Cannot add argument '" + p + "': the value is not a valid expression object.";
                    else
                        this._setArg(p, args[p]);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /**
      * Returns the numerical argument indexes found in the 'args' object as an array of integers.
      * This is sorted by default to make sure the numerical properties were iterated in order, unless 'sorted' is false.
      * Note: This call is much faster if sorting is not required.
      */
        getArgIndexes(sorted = true): number[] {
            var indexes: number[] = [];
            for (var p in this) {
                var c = (<string>p).charCodeAt(0);
                if (c >= 48 && c <= 57) // (optimization: http://jsperf.com/isnan-vs-check-first-char)
                    indexes.push(+p);
            }
            return sorted ? indexes.sort((a, b) => a - b) : indexes;
        }

        /**
         * Returns the argument names found in this object as an array of strings.
         * This is sorted by default to make sure the argument names match the argument indexes, unless 'sorted' is false.
         * Note: This call is much faster if sorting is not required.
         */
        getArgNames(sorted = true): string[] {
            var names: string[] = [];
            if (sorted) {
                var indexes = this.getArgIndexes(true); // (request to make sure they are in order)
                for (var i = 0, n = indexes.length; i < n; ++i)
                    names.push(this._args[indexes[i]]); // (the value of each index holds the argument name)
            }
            else { // (note: much faster if sorting is not needed)
                for (var p in this._args) {
                    var c = (<string>p).charCodeAt(0);
                    if (p.substr(0, 3) != "$__" && (c < 48 || c > 57)) // (see optimization test: http://jsperf.com/compare-hasownproperty-vs-substring-test)
                        names.push(p);
                }
            }
            return names;
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedExpressionArgs): ISavedExpressionArgs {
            target = target || <ISavedExpressionArgs>{};

            target.arguments = {};

            for (var p in this._args) {
                var argValue: string | Expression = this._args[p];
                if (typeof argValue == 'string') // (indexes 0:, 1:, etc., all hold the actual parameter names for each argument expression given)
                    target.arguments[+p] = argValue;
                else if (typeof argValue == 'object' && argValue instanceof Expression)
                    target.arguments[p] = argValue.save();
            }

            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Sets an expression's argument to a given expression. */
        private _setArg(argIndex: number, expr: Expression): Expression;
        private _setArg(argIndex: string, expr: Expression): Expression;
        private _setArg(arg: any, expr: Expression): Expression {
            if (expr.parent)
                if (expr.parent != this._owner)
                    expr.remove();

            expr['_parent'] = this._owner; // (no parent defined, so default to this)

            //? if (expr.containingComponent != this.containingComponent)
            //    throw "Expression error: Argument expression '" + argIndex + ":<" + expr.source + ">' belongs to another component ('" + expr.containingComponent + "').  You can't reuse existing expressions in another components '" + this.containingComponent + "'.";

            if (expr instanceof Statement)
                throw "Argument expression '" + expr.component + "' for parameter '" + arg + "' of component '" + this.source + "' is a line level statement, and is not allowed as an argument.";

            if (expr instanceof LineReference)
                throw "Argument expression '" + expr.component + "' for parameter '" + arg + "' of component '" + this.source + "' is a line reference, and is not allowed as an argument.";

            if (typeof expr.component != 'object' || !(expr instanceof Constant) && !(expr.component instanceof Component))
                throw "Cannot set parameter '" + arg + "' of component '" + this.source + "' to the given expression: the 'source' component reference for the specified expression is missing or invalid.";

            this._owner.cyclicalCheck(expr); // (make the owner if this ExpressionArgs instance [a component reference] is not also a child of the expression being set!)

            return this.source.setArgument(arg, expr, this._args);
        }

        setArg(argIndex: number, operation: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[]): Expression;
        setArg(argName: string, operation: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[]): Expression;
        setArg(argIndex: number, expression: Expression): Expression;
        setArg(argName: string, expression: Expression): Expression;
        setArg(arg: any, argObj: Component | Expression, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[]): Expression {
            if (!this.source.hasParameter(arg))
                throw "Component '" + this.source + "' doesn't have a parameter named '" + arg + "'.";
            if (typeof argObj != 'object')
                throw "Cannot set argument '" + arg + "': the argument value is not an object reference (Component or Expression).";
            var argIsExpr = argObj instanceof Expression, argIsComp = argObj instanceof Component;
            if (!argIsExpr && !argIsComp)
                throw "Cannot set argument '" + arg + "': the specified argument value is not an 'Expression' or 'Component' type.";
            if (argIsExpr) {
                return this._setArg(arg, <Expression>argObj);
            } else
                return this._setArg(arg, new ComponentReference(<Component>argObj, args, returnTargets, null, this._owner));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns the name of an argument given its argument index. */
        getArgName(argIndex: number, required?: boolean): string {
            return this._args[argIndex];
        }

        /** Returns the argument expression given an argument index.
          * @param {number} index The index of the argument to get the expression for.
          * Note: This is one of the index values returned by 'getArgIndexes()', or at least on of the argument index numerical
          * values stored in this ExpressionArgs instance.
          */
        getArg(argIndex: number, required?: boolean): Expression;
        getArg(argName: string, required?: boolean): Expression;
        getArg(arg: any, required?: boolean): Expression {
            if (!this.source.hasParameter(arg))
                throw "Component '" + this.source + "' does not have a parameter '" + ((+arg + 1) || arg) + "'.";

            var argExpr: Expression;

            if (isValidNumericIndex(arg)) {
                var argName = this._args[arg];
                if (argName === void 0) return void 0;
                argExpr = this._args[argName];
            }
            else
                argExpr = this._args[arg];

            if (!argExpr && required)
                throw "Argument '" + ((+arg + 1) || arg) + "' of component reference '" + this._owner + "' is missing a required argument value.";

            return argExpr;
        }

        isArgSet(arg: number): boolean;
        isArgSet(arg: string): boolean;
        isArgSet(arg: any): boolean {
            if (isValidNumericIndex(arg)) {
                var argName = this._args[arg];
                return argName !== void 0 && this._args[argName] !== void 0;
            }
            else return this._args[arg] !== void 0;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Removes an expression by argument name or reference. */
        removeArgument(name: string): Expression;
        /** Removes an expression by argument name or reference. */
        removeArgument(index: number): Expression;
        /** Removes an expression by argument name or reference. */
        removeArgument(expr: Expression): Expression;
        removeArgument(nameOrIndexOrExpr: any): Expression {

            if (typeof nameOrIndexOrExpr == 'object' && nameOrIndexOrExpr instanceof Expression) {
                var expr: Expression = nameOrIndexOrExpr;

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
        }

        /** Removes all arguments. */
        clear() {
            if (this._args)
                for (var p in this._args)
                    if (!isNaN(+p))
                        this.removeArgument(+p);
        }

        // --------------------------------------------------------------------------------------------------------------------

        containsExpression(expr: Expression): boolean {
            var _expr: Expression;

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
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);

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

                node.appendTextNode(titleParts[i], VisualNodeTypes.ComponentTitlePart);

                if (i < parameters.length) {
                    var param = parameters[i]; // (this is the expected PARAMETER property declaration for this argument position)
                    //? var argIndex = argIndexes[i]; // (this is the ARGUMENT index from the component REFERENCE)
                    var argExpr = this.getArg(i, false); // (this is the ARGUMENT expression from the component REFERENCE)

                    // ... first, create a parameter container node to hold the argument(s) ...

                    var paramContainer = node.createNode(param, VisualNodeTypes.ComponentParameter);
                    paramContainer.title = "Parameter '" + param + "' of component " + this.source.name;
                    paramContainer.paramName = param.name;
                    paramContainer.paramIndex = i;
                    paramContainer.appendTextNode("[");

                    if (argExpr) {
                        var argNode = paramContainer.createNode(argExpr, VisualNodeTypes.Argument);
                        argNode.paramName = param.name;
                        argNode.paramIndex = i;
                        argExpr.createVisualTree(argNode, visualNodeType);
                    }
                    else paramContainer.appendTextNode("«" + param.name + "»");

                    paramContainer.appendTextNode("]");
                }

            }

            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------

        clone(forExpr: ComponentReference): ExpressionArgs {
            var args = forExpr.arguments;

            args.clear();

            if (this._args)
                for (var p in this._args) {
                    var c = (<string>p).charCodeAt(0);
                    if (c >= 48 && c <= 57) {
                        var paramName: string = this._args[+p];
                        args.setArg(+p, this._args[paramName].clone(forExpr));
                    }
                }

            return args;
        }
    }

    // ========================================================================================================================

    export interface IReturnTargetMap {
        source: Expression;
        target: PropertyReference;
    }

    export class ReturnTargetMap implements IReturnTargetMap {
        constructor(public source: Expression, public target: PropertyReference) {
        }
    }

    export interface ISavedReturnTargetMap { source: ISavedExpression; target: ISavedExpression; }
    export interface ISavedReturnTargetMaps { returnTargets: ISavedReturnTargetMap[]; }

    export class ReturnTargetMaps {
        // --------------------------------------------------------------------------------------------------------------------

        /** The expression that these arguments belong to. */
        get owner(): ComponentReference { return this._owner; }
        private _owner: ComponentReference;

        /** The component that is the return target for the owning expression. */
        get source(): Component { return this._owner.component; }

        /** Returns an array of maps between a given expression, and a target property on the calling component context. */
        get maps() { return this._maps; }
        protected _maps: IReturnTargetMap[] = [];

        get isEmpty(): boolean { return !!this._maps.length; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(owner: ComponentReference) { this._owner = owner; }

        // --------------------------------------------------------------------------------------------------------------------

        addTarget(source: Expression, target: PropertyReference) {
            this._maps.push(new ReturnTargetMap(source, target));
        }

        addTargetMap(targetMap: IReturnTargetMap) {
            if (targetMap)
                this._maps.push(targetMap);
        }

        addTargetMaps(targets: IReturnTargetMap[]) {
            if (targets && targets.length)
                for (var i = 0, n = targets.length; i < n; ++i)
                    this.addTargetMap(targets[i]);
        }

        // --------------------------------------------------------------------------------------------------------------------

        indexOfReturnTarget(target: PropertyReference): number {
            for (var i = 0, n = this._maps.length; i < n; ++i)
                if (this._maps[i].target == target) return i;
            return -1;
        }

        // --------------------------------------------------------------------------------------------------------------------

        mapReturnTarget(source: Expression, target: PropertyReference): void {
            if (!this._owner.functionalComponent)
                throw "Cannot set return target: No containing component value exists.";

            if (typeof source != 'object')
                throw "A source property is required, or 'null' to select the default source.";
            if (typeof target != 'object')
                throw "A target property is required.";

            if (!source) {
                var defaultProperty = this.source.getProperty(null);
                if (!defaultProperty) throw "Source component '" + this.source + "' does not have a default return defined.";
                source = defaultProperty.createExpression(this._owner);
            } else if (source instanceof PropertyReference) {
                var propExpr = <PropertyReference>source;
                if (!this.source.hasProperty(propExpr.name))
                    throw "The source property is not valid: The component '" + this.source + "' does not have a property named '" + source + "'.";
            }

            if (!target || !target.name || target.name == Property.DEFAULT_NAME)
                throw "The target of a return mapping cannot be a default property definition.  Default properties exist only to declare the return type of a functional component call.";
            else if (!this._owner.functionalComponent.hasProperty(target.name))
                throw "The target property is not valid: The containing component '" + this._owner.functionalComponent + "' does not have a property named '" + target + "'.";

            var i = this.indexOfReturnTarget(target);
            if (i >= 0)
                throw "The return target '" + target + "' was already mapped with a value from '" + this._maps[i].source + "'.";

            this._owner.cyclicalCheck(source);
            this._owner.cyclicalCheck(target);

            this._maps.push({ source: source, target: target });
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedReturnTargetMaps): ISavedReturnTargetMaps {
            target = target || <ISavedReturnTargetMaps>{};

            target.returnTargets = [];

            for (var i = 0, n = this._maps.length; i < n; ++i) {
                var rt = this._maps[i];
                target.returnTargets[i].source = rt.source ? rt.source.save() : null;
                target.returnTargets[i].target = rt.target ? rt.target.save() : null;
            }

            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Removes a return value mapping. */
        removeReturn(name: string): Expression;
        /** Removes a return value mapping. */
        removeReturn(index: number): Expression;
        /** Removes a return value mapping. */
        removeReturn(prop: Expression): Expression;
        removeReturn(nameOrIndexOrExpr: any): Expression {

            if (typeof nameOrIndexOrExpr == 'object' && nameOrIndexOrExpr instanceof Expression) {
                var expr: Expression = nameOrIndexOrExpr;

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
                else throw "'" + i + "' is not a valid index value."
            }

            return null;
        }

        /** Removes all return mappings. */
        clear() {
            if (this._maps)
                for (var i = this._maps.length - 1; i >= 0; --i)
                    this.removeReturn(i);
        }

        // --------------------------------------------------------------------------------------------------------------------

        containsExpression(expr: Expression): boolean {
            var _expr: Expression;

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
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);

            // ... first, each return type should be added, in order ...

            for (var i = 0, n = this._maps.length; i < n; ++i)
                node.createNode(this._maps[i]);

            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------

        clone(forExpr: ComponentReference): ReturnTargetMaps {
            var rtMaps = forExpr.returnTargets;

            rtMaps.clear();

            for (var i = 0, n = this._maps.length; i < n; ++i)
                rtMaps.addTarget(this._maps[i].source.clone(forExpr),
                    this._maps[i].target.clone<PropertyReference>(forExpr));

            return rtMaps;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface IAvailableProperty {
        /** The parent expression that is the source for this selectable property. */
        source: any;
        /** A property that the user can use as an argument. */
        property: Property;
    }

    /** Returns true if the given value is numeric (a number type, or string with digits only [i.e. '0'...'10'...etc.; '+1.0' is invalid]).
     * This function is optimized to test as quickly as possible. For example, 'true' is returned immediately if 'value' is a number type.
     */
    export function isValidNumericIndex(value: string | number): boolean {
        var type = typeof value;
        if (type == 'number') return true;
        var str: string = type == 'string' ? <string>value : '' + value;
        if (str.length == 1) { // (there's a faster test for only one character)
            var c = str.charCodeAt(0);
            if (c >= 48 && c <= 57) return true; // (optimization: http://jsperf.com/isnan-vs-check-first-char)
        }
        return Expression.NUMERIC_INDEX_REGEX.test(str);
    }

    // ========================================================================================================================

    export interface ISavedExpression extends ISavedTrackableObject, ISavedReturnTargetMaps, ISavedExpressionArgs {
        comment: string;
    }

    // ========================================================================================================================

    /** The smallest executable element within FlowScript which specifies some action to be carried out.
     * An expression (in FlowScript) usually encompasses a component reference, arguments, return value targets, and event handlers.
     */
    export class Expression extends TrackableObject {
        // --------------------------------------------------------------------------------------------------------------------

        /** A regex used to test for numerical indexes. See 'isValidNumericIndex()' also. */
        static NUMERIC_INDEX_REGEX = /^0|[1-9][0-9]*$/;

        /** A regex used to test for valid identifiers for the system. */
        static VALID_IDENTIFIER_REGEX = /^[a-zA-z_$][a-zA-z0-9_$]*$/;

        // --------------------------------------------------------------------------------------------------------------------

        get parent(): Expression { return this._parent; }
        protected _parent: Expression;

        get script(): IFlowScript { return this._parent ? this._parent.script : null; }

        /** A developer comment for this expression. */
        comment: string;

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns the functional component this expression belongs to, or null otherwise.
          * Functional components (components that usually render to final code in some way [i.e. functions, operations, etc.])
          * have blocks with lines consisting of statements and expressions.  This function searches the parent expression tree
          * for the nearest functional component.
          */
        get functionalComponent(): Component { return this._parent ? this._parent.functionalComponent : null; }

        /** The statement this expression belongs to, or null otherwise. */
        get statement(): Statement { return this instanceof Statement ? <Statement><any>this : this._parent ? this._parent.statement : null; }

        /** The line this expression belongs to, or null otherwise. */
        get line(): Line { return this._parent ? this._parent.line : null; }

        /** Return the nearest containing block expression if any, or null otherwise. */
        get blockExpression(): BlockReference { return this instanceof BlockReference ? <BlockReference><any>this : this._parent ? this._parent.blockExpression : null; }

        /** The block this expression belongs to, or null otherwise (simple shortcut for getting the 'blockExpression.block' reference). */
        get block(): Block { var bexpr = this.blockExpression; return bexpr ? bexpr.block : null; }

        /** Return the nearest containing property expression if any, or null otherwise. */
        get propertyExpression(): PropertyReference { return this instanceof PropertyReference ? <PropertyReference><any>this : this._parent ? this._parent.propertyExpression : null; }

        /** The property this expression is under, or null otherwise (simple shortcut for getting the 'propertyExpression.property' reference). */
        get property(): Property { var pexpr = this.propertyExpression; return pexpr ? pexpr.property : null; }

        // --------------------------------------------------------------------------------------------------------------------

        /** The component that this expression references, or null if the expression doesn't reference components. */
        get component(): Component { return null; }

        //?get expressions() { return this._expressions; }
        //?private _expressions: Expression[] = []; // (NOTE: This is an array, but only one statement per line is supported at this time for final output rendering)

        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: Expression = null) {
            super();
            this._parent = parent;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Searches all children for the given expression reference. This is used to prevent cyclical references within expressions. */
        containsChildExpression(expr: Expression): boolean {
            return false;
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedExpression): ISavedExpression {
            target = target || <ISavedExpression>{};

            super.save(target);

            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Copy this expression to a new expression instance for use elsewhere.
          * Since it is not permitted to use expression references in multiple places, a new instance is always required.
          * Closing expressions is a convenient way to duplicate expressions for use in multiple places.
          * Alternatively, an ExpressionReference object can reference other expressions.
          */
        clone<T extends Expression>(parent?: Expression): T {
            return <T>this._clone(parent);
        }

        protected _clone(parent?: Expression): Expression {
            return new Expression(parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Removes a child from the expression tree.  If the child is not found, null is returned, otherwise the removed expression is returned. */
        remove(child?: Expression): Expression;
        /** Removes self from the expression tree. */
        remove(): Expression;
        remove(child?: Expression): Expression {
            if (child) {
                // ... 'this' is the parent, so find the reference and remove it ...
                return null; // (not found)
            } else {
                // ... no child given, so assume self ...
                if (this._parent)
                    var expr = this._parent.remove(this);
            }
            return expr ? expr : null;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Calls 'expr.containsChildExpression(this)' on the given expression using 'this' expression and generates a cyclical error if found. */
        cyclicalCheck(expr: Expression) {
            if (expr)
                if (typeof expr != 'object' || !(expr instanceof Expression))
                    throw "Expressions.cyclicalCheck(expr): 'expr' is not an Expression object.";
                else if (expr.containsChildExpression(this))
                    throw "Cyclical error: You cannot use parent expressions (directly or indirectly) within themselves, or any nested child expressions. Clone the expression first and try again.";
        }

        /** Returns the immediate parent "with" statement, or 'null' if none. */
        getParentWith(): Statement {
            // ... statements can be nested due to nested blocks, so traverse the statements and any parent blocks ...
            var expr = this.blockExpression, statement: Statement;
            while (expr && (statement = expr.statement)) {
                if (statement.component.fullTypeName == System.With.fullTypeName)
                    return statement;
                expr = statement.blockExpression;
            }
            return null;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this expression object. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);
            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ISavedExpressionReference extends ISavedExpression { expression: ISavedExpression; }

    /** References an expression for indirect use with other expressions. */
    export class ExpressionReference extends Expression { //? Not sure if this is necessary, since other references exist (block, property, etc); perhaps for constants...?
        // --------------------------------------------------------------------------------------------------------------------

        /** The indirect expression that is referenced by this expression. */
        get expression() { return this._expr; }
        private _expr: Expression;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(expr: Expression, parent?: Expression) {
            super(parent);

            if (!expr || typeof expr != 'object' || !(expr instanceof Expression))
                throw "A valid expression object is required.";

            this._expr = expr;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): Expression {
            return new ExpressionReference(this._expr, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedExpressionReference): ISavedExpressionReference {
            target = target || <ISavedExpressionReference>{};

            target.expression = this.expression.save();

            super.save(target);
            return target;
        }

        load(target?: ISavedExpressionReference): ISavedExpressionReference {
            target = target || <ISavedExpressionReference>{};
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString(): string { return "Expression reference: " + this._expr; }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ISavedConstant extends ISavedExpression { value: string; valueType: string; }

    /** A constant value expression.
      */
    export class Constant extends Expression {
        // --------------------------------------------------------------------------------------------------------------------

        /* Holds a constant value reference. */
        value: any;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(value: any) {
            super(null);
            this.value = value;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): Expression {
            return new Constant(this.value);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedConstant): ISavedConstant {
            target = target || <ISavedConstant>{};

            target.valueType = typeof this.value;

            if (target.valueType == 'object') {
                if (typeof this.value.save == 'function')
                    target.value = this.value.save(); // (just in case, support 
                else if (typeof JSON != 'object' || !JSON.stringify)
                    throw "Cannot serialize a constant object reference - 'JSON.stringify()' is required, but not found in this environment.";
                else
                    target.value = JSON.stringify(this.value);
            }
            else target.value = '' + this.value;

            super.save(target);
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
