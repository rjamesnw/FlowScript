// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Manages the margins used for rendering FlowScript to code.
      */
    var Margin = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Margin(marginCharacters) {
            if (marginCharacters === void 0) { marginCharacters = "    "; }
            this.marginCharacters = marginCharacters;
            this._margins = [""];
            this._currentLevel = 0;
        }
        // --------------------------------------------------------------------------------------------------------------------
        /** Advance to the next margin level. */
        Margin.prototype.next = function () {
            ++this._currentLevel;
            if (this._currentLevel > Margin.MAX_MARGINS)
                throw "Warning: The current level has exceeded the maximum default margin levels allowed.  This usually means there's a rendering error.  To increase this limit, update 'Margin.MAX_MARGINS'.";
            var m = this._margins[this._currentLevel];
            if (m == FlowScript.undefined)
                m = this._margins[this._currentLevel] = this._margins[this._currentLevel - 1] + this.marginCharacters;
            return m;
        };
        /** Backup to the previous margin level. */
        Margin.prototype.previous = function () {
            if (this._currentLevel <= 0)
                throw "Error: The current margin level is going out of alignment - there's a bug in the rendering process.";
            return this._margins[--this._currentLevel];
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the current margin for the current level. */
        Margin.prototype.toString = function (indexLevel) { return this._margins[indexLevel !== FlowScript.undefined ? indexLevel : this._currentLevel]; };
        // --------------------------------------------------------------------------------------------------------------------
        Margin.MAX_MARGINS = 100;
        return Margin;
    }());
    FlowScript.Margin = Margin;
    /** Represents a single rendered line of code. */
    var RenderedLine = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function RenderedLine(margin, contents, source, opcode, args) {
            this.margin = margin;
            this.contents = contents;
            this.marginLevel = margin._currentLevel;
            this.source = source;
            this.opcode = opcode;
            this.args = args;
        }
        RenderedLine.prototype.toString = function (margin) { return (margin !== FlowScript.undefined ? margin : "") + this.margin.toString(this.marginLevel) + this.contents; };
        return RenderedLine;
    }());
    FlowScript.RenderedLine = RenderedLine;
    /** When compiling scripts for final output or simulation, this class is used to hold the rendered hierarchy for types and functional components. */
    var TypeRenderer = /** @class */ (function () {
        function TypeRenderer(compilerOrParent, source, isSimulation) {
            if (isSimulation === void 0) { isSimulation = false; }
            this._lines = [];
            this._renderers = {};
            this._localVars = [];
            /** Used to separate local context objects for functional component calls, and to aid in call cleanup. */
            this.callStack = [];
            /** Used to separate nested loop counters. */
            this.loopID = 0;
            this._objContextVars = [];
            this._margin = new Margin();
            // --------------------------------------------------------------------------------------------------------------------
            // The following functions are used to add special lines for simulation purposes.
            this._internalRunningValVarName = Compiler.CONTEXT_VAR_NAME + ".$__";
            this._checkType(source);
            this._parent = compilerOrParent instanceof TypeRenderer ? compilerOrParent : null;
            this._compiler = compilerOrParent instanceof Compiler ? compilerOrParent : this._parent._compiler;
            this._source = source;
            if (isSimulation)
                this.root._isSimulation = true; // (once this is set, it should not be changed)
        }
        Object.defineProperty(TypeRenderer.prototype, "isFunctionalComponent", {
            get: function () { return this._source && this._source instanceof FlowScript.Component && this._source.componentType == FlowScript.ComponentTypes.Functional; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "component", {
            /** Returns the source typed as a component. The source component of each TypeRenderer node is the containing component of any rendered lines. */
            get: function () { return this._source; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "type", {
            /** The type that is the source for this renderer entry. */
            get: function () { return this._source; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "isSimulation", {
            /** Returns true if this rendering is for simulation purposes only, and thus cannot be used to render final code. */
            get: function () { return this.root._isSimulation; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "lastLineIndex", {
            /** The index of the last line added. */
            get: function () { return this._lines.length - 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "nextLineIndex", {
            /** The index of the next line to be added. */
            get: function () { return this._lines.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "objContextVar", {
            /** If this is set, then any expression component found with '$this' will be replaced with the object reference in this
              * string.  This property is used in rendering the core "with" components.
              * Note: Any '$this' token encountered while this property is not yet set will cause an error.
              */
            get: function () { return this._objContextVars[this._objContextVars.length - 1]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "compiler", {
            get: function () { return this._compiler; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRenderer.prototype, "root", {
            get: function () { return this._parent ? this._parent.root : this; },
            enumerable: true,
            configurable: true
        });
        /** Creates a root level type renderer that will wrap the 'main' script in 'compiler.script'. */
        TypeRenderer.createRootTypeRenderer = function (compiler, isSimulation) {
            if (isSimulation === void 0) { isSimulation = false; }
            return new TypeRenderer(compiler, new FlowScript.Type(null, "root", compiler.script), isSimulation);
        };
        TypeRenderer.prototype._checkType = function (type) {
            if (!type)
                throw "A valid type or component is required.";
            if (type instanceof FlowScript.Component && type.componentType !== FlowScript.ComponentTypes.Functional)
                throw "Only basic types and functional component types can be registered.";
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a new rendered line for the underlying component, along with the current margin level, and returns the line index. */
        TypeRenderer.prototype.addLine = function (source, line, opcode) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            if (opcode !== FlowScript.undefined)
                this.root._isSimulation = true; // (make sure this flag is set)
            else if (this.isSimulation)
                opcode = FlowScript.OpCodes.Exec; // (all lines in simulation mode default to execution/evaluation one after the other)
            return this._lines.push(new RenderedLine(this._margin, line, source, opcode, args)) - 1;
        };
        /** Inserts a new rendered line at a specific line number for the underlying component, prefixed with the current margin level.
          * Note: The first line starts at index 0.
          */
        TypeRenderer.prototype.insertLine = function (index, source, line, opcode) {
            var args = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                args[_i - 4] = arguments[_i];
            }
            if (index < 0 || index > this._lines.length)
                throw "Insert error: index not within or around existing lines.";
            if (opcode !== FlowScript.undefined)
                this.root._isSimulation = true; // (make sure this flag is set)
            else if (this.isSimulation)
                opcode = FlowScript.OpCodes.Exec; // (all lines in simulation mode default to execution/evaluation one after the other)
            this._lines.splice(index, 0, new RenderedLine(this._margin, line, source, opcode, args));
        };
        TypeRenderer.prototype.addLocalVar = function (name) {
            if (this._localVars.indexOf(name) < 0)
                this._localVars.push(name);
            return name;
        };
        /** See 'objContextVar'. */
        TypeRenderer.prototype.addContextVar = function (varPath) {
            this._objContextVars.push(varPath);
            return varPath;
        };
        /** See 'objContextVar'. */
        TypeRenderer.prototype.removeLastContextVar = function () {
            return this._objContextVars.pop();
        };
        /** Inserts the current list of local variable names and clears the list.
         * @param source The source reference to log for this request.
         */
        TypeRenderer.prototype.insertDeclarations = function (source) {
            if (this._localVars.length)
                this.insertLine(this.isSimulation ? 0 : 1, source, "var " + this._localVars.join(', ') + ";");
            // (note: for simulations, insert at beginning, otherwise the first line is the function parameter declarations)
            this._localVars.length = 0;
        };
        /** Prepends text before the start of a previously added line. */
        TypeRenderer.prototype.prefixLastLine = function (prefix) {
            if (!this._lines.length)
                throw "This renderer does not have any lines yet.";
            this._lines[this._lines.length - 1].contents = prefix + this._lines[this._lines.length - 1].contents;
        };
        /** Appends text at the end of a previously added line. */
        TypeRenderer.prototype.appendLastLine = function (suffix) {
            if (!this._lines.length)
                throw "This renderer does not have any lines yet.";
            this._lines[this._lines.length - 1].contents = this._lines[this._lines.length - 1].contents + suffix;
        };
        /** Go to the next margin. */
        TypeRenderer.prototype.nextMargin = function () {
            this._margin.next();
        };
        /** Go to the previous margin. */
        TypeRenderer.prototype.previousMargin = function () {
            this._margin.previous();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Renders the underlying compiled component and all nested components to an array of code lines.
         * @param {string} targetVar The left side of an assignment operation that will receive the rendered function when executed.
         */
        TypeRenderer.prototype.render = function (targetVar, margin, codeLines) {
            if (margin === void 0) { margin = new Margin(); }
            if (codeLines === void 0) { codeLines = []; }
            if (this.isSimulation)
                throw "This component renderer can only be used for simulations and cannot output final code.";
            var hasLines = this._lines.length > 0;
            var hasNestedComponents = !FlowScript.isObjectEmpty(this._renderers);
            var isRoot = !this._parent;
            codeLines.push(margin + targetVar + " = (function() {");
            margin.next();
            if (hasLines) {
                if (this.isFunctionalComponent) {
                    codeLines.push(margin + "var " + Compiler.RUNNING_VAL_VAR_NAME + " = " + this._lines[0]);
                    // ... add rest of function body ...
                    for (var i = 1, n = this._lines.length; i < n; ++i) // (note: this starts at 1 as the first line depends on any nested components)
                        codeLines.push(this._lines[i].toString(margin)); // (note: statements are already indented due to functional component rendering)
                    // ... set expected argument names ...
                    if (this.component.parameters && this.component.parameters.length) {
                        var argNames = [];
                        for (var i = 0, n = this.component.parameters.length; i < n; ++i)
                            argNames.push("'" + this.component.parameters.getProperty(i).name + "'"); // (in case not all parameters were supplied arguments by caller)
                        codeLines.push(margin + Compiler.RUNNING_VAL_VAR_NAME + ".parameterNames = [" + argNames.join(', ') + "];"); // (in case not all parameters were supplied arguments by caller)
                    }
                    codeLines.push(margin + Compiler.RUNNING_VAL_VAR_NAME + ".context = {};"); // (a root context placeholder is required by default for all individual component function objects)
                }
                else {
                    // ... this component is not functional, but has lines, so just export them as text lines into a string object as a place to hold them ...
                    // (note: this MUST be a string object in order to add nested type objects next, if any)
                    codeLines.push(margin + "var " + Compiler.RUNNING_VAL_VAR_NAME + " = new String(\"" + FlowScript.Utilities.replace(this._lines[0].toString(), '"', '\\"') + "\"");
                    margin.next();
                    for (var i = 1, n = this._lines.length; i < n; ++i) // (note: this starts at 1 as the first line depends on any nested components)
                        codeLines.push(margin + "+ \"" + FlowScript.Utilities.replace(this._lines[i].toString(margin), '"', '\\"') + "\"");
                    codeLines[codeLines.length - 1] += ");"; // (need to terminate the last line of the string object construction properly)
                    margin.previous();
                }
            }
            else
                codeLines.push(margin + "var " + Compiler.RUNNING_VAL_VAR_NAME + " = {};");
            for (var typeName in this._renderers)
                this._renderers[typeName].render(Compiler.RUNNING_VAL_VAR_NAME + "." + this._renderers[typeName]._source.safeName, margin, codeLines);
            if (isRoot) { // (an internal script dereference is needed at the first block scope for all nested components)
                codeLines.push(margin + "var " + Compiler.SCRIPT_VAR_NAME + " = new FlowScript.RuntimeScript({ types: " + Compiler.RUNNING_VAL_VAR_NAME + " });");
                // (note: the root component is the root 'System' type, which needs to be accessible by nested components during execution)
                codeLines.push(margin + "return " + Compiler.SCRIPT_VAR_NAME + ";");
            }
            else
                codeLines.push(margin + "return " + Compiler.RUNNING_VAL_VAR_NAME + ";");
            margin.previous();
            codeLines.push(margin + "})();");
            return codeLines;
        };
        // --------------------------------------------------------------------------------------------------------------------
        TypeRenderer.prototype.toString = function (targetVar) {
            if (!targetVar && this._source)
                targetVar = Compiler.USER_RTSCRIPT_VAR_NAME;
            var codeLines = this.render(targetVar);
            return codeLines.join("\r\n") + "\r\n";
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Updates the underlying renderer hierarchy to match the namespace hierarchy of the specified type. */
        TypeRenderer.prototype.registerType = function (type) {
            this._checkType(type);
            var types = [], root = this.root, rend = root;
            while (type) {
                types.push(type);
                type = type.parent;
            }
            //?if (types[types.length - 1].safeName != root._source.safeName)
            //    throw "The root renderer source name '" + root._source.safeName + "' does not match the root type name for component '" + types[types.length - 1].safeFullTypeName + "'.  Root names must always match, since the root name is always based on the main entry component.";
            // ... traverse the component's type hierarchy to find the proper renderer ...
            for (var i = types.length - 1; i >= 0; --i) {
                var nextRend = rend._renderers[types[i].safeName];
                rend = nextRend ? nextRend : rend._renderers[types[i].safeName] = new TypeRenderer(rend, types[i], this.isSimulation);
            }
            return rend;
        };
        /** Returns an existing functional component render by the safe full type name, or null if the type is not yet registered. */
        TypeRenderer.prototype.getRenderer = function (safeFullTypeName) {
            var names = safeFullTypeName.split('.');
            var renderer = this.root;
            //?if (renderer._source.safeName != names[0])
            //    throw "The root renderer source name '" + renderer._source.safeName + "' does not match the root type name for type '" + safeFullTypeName + "'.  Root names must always match, since the root name is always based on the main entry component.";
            for (var i = 0, n = names.length; i < n; ++i)
                if (!(names[i] in renderer._renderers))
                    return null;
                else
                    renderer = renderer._renderers[names[i]];
            return renderer;
        };
        /** Checks if a functional component renderer exists for the specified full safe type. */
        TypeRenderer.prototype.hasRenderer = function (safeFullTypeName) { return this.getRenderer(safeFullTypeName) != null; };
        /** Adds a script to execute JavaScript code.
          * This is the same as calling 'addLine', except it adds an explicit opcode for the line(s), and splits the script by any line endings.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.exec = function (source, jscript) {
            var lines = jscript.split(/\n/g);
            for (var i = 0, n = lines.length; i < n; ++i)
                this.addLine(source, lines[i].trim(), FlowScript.OpCodes.Exec);
            return this.lastLineIndex;
        };
        /** Adds a line to evaluate a single operation, and sets the current running value with the result.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.eval = function (source, expressionCode) {
            return this.addLine(source, this.compiler._renderAssignment(this._internalRunningValVarName, expressionCode + ";"), FlowScript.OpCodes.Exec);
        };
        /** Adds a line to evaluate an operation on a previously set left argument, and the current value (see 'pushOpArg').
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.evalOp = function (source, operationType) {
            if (operationType.fullTypeName == this.compiler.script.System.Assign.fullTypeName)
                throw "Assignment operations must be added by calling 'assign()'.";
            // (note: The right side of the operation is always evaluated first, to support assignment operation patterns, and will be on the top of the value stack)
            return this.eval(source, this.compiler._renderOp(this._internalRunningValVarName, operationType, Compiler.CONTEXT_VAR_NAME + ".$__args.pop()"));
        };
        /** Adds a line to evaluate an operation on a previously set left argument, and the current value (see 'pushOpArg').
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.assign = function (source, leftSideVar) {
            // (note: Since the left side of an assignment is always a variable, it can be set directly with the running value)
            return this.eval(source, this.compiler._renderAssignment(leftSideVar, this._internalRunningValVarName));
        };
        /** Adds a line to evaluate a unary operation on the current running value by adding the required operation semantics.
          * Returns the index of the added line.
          *
          * @param {string} varName A variable to set, which overrides the default behaviour of using the running value.
          */
        TypeRenderer.prototype.evalUnary = function (source, operationType, varName) {
            return this.eval(source, this.compiler._renderUnary(varName || this._internalRunningValVarName, operationType));
        };
        /** Adds the current value to the operation argument stack.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.pushOpArg = function () {
            this.addLine(null, Compiler.CONTEXT_VAR_NAME + ".$__args.push(" + this._internalRunningValVarName + ");", FlowScript.OpCodes.Exec);
        };
        /** Adds a line to call another functional component.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.call = function (source, compType, ctxID) {
            var callIndex = this.addLine(source, null, FlowScript.OpCodes.Call, compType, ctxID);
            // ... since this is a SIMULATED call transfer request, set the current running value to the running value of the calling context ...
            var localCtxName = Compiler.LOCAL_CONTEXT_VAR_NAME + (ctxID || "");
            this.eval(null, this._compiler._renderAssignment(Compiler.RUNNING_VAL_VAR_NAME, localCtxName + ".$__lineExec.eval('" + Compiler.RUNNING_VAL_VAR_NAME + "')") + ";");
            return callIndex;
        };
        /** Adds a line to jump to another line.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.jump = function (source, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - this.nextLineIndex;
            return this.addLine(source, null, FlowScript.OpCodes.Jump, offset);
        };
        /** Updates a previously added "jump" line with the proper line index.  If no line index is specified, the index following the current last line is assumed.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.updateJump = function (jumpLineIndex, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - jumpLineIndex;
            this._lines[jumpLineIndex].args[0] = offset;
        };
        /** Adds a line to jump to another line if the current running value is TRUE (used with 'while' loops).
          * Use 'updateJump' to update the line index target when available.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.jumpIf = function (source, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - this.nextLineIndex;
            return this.addLine(source, null, FlowScript.OpCodes.JumpIf, offset);
        };
        /** Adds a line to jump to another line if the current running value is FALSE (used for control flow [i.e. 'if..then...']).
          * Use 'updateJump' to update the line index target when available.
          * Returns the index of the added line.
          */
        TypeRenderer.prototype.jumpIfNot = function (source, targetLineIndex) {
            var offset = (targetLineIndex !== FlowScript.undefined ? targetLineIndex : this.nextLineIndex) - this.nextLineIndex;
            return this.addLine(source, null, FlowScript.OpCodes.JumpIfNot, offset);
        };
        return TypeRenderer;
    }());
    FlowScript.TypeRenderer = TypeRenderer;
    /** The compiler reads the FlowScript type graph, starting at the "main" component, and outputs the resulting code.  The
      * compiler also supports runtime simulations that you can watch in real time, or step through for debugging purposes.
      * It's possible to extend this class and override the required methods needed to translate various aspects of the
      * compiler for targeting other languages.
      */
    var Compiler = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Compiler(script) {
            this._script = script;
        }
        Object.defineProperty(Compiler.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Returns the script for this compiler, which is usually a reference to a 'main' script component. */
            get: function () { return this._script; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Compiler.prototype, "debugging", {
            /** True if a simulation was started in debug mode. */
            get: function () { return this._debugging; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        Compiler.prototype._checkMain = function () {
            if (!this.script.Main || this.script.Main.componentType != FlowScript.ComponentTypes.Functional)
                throw "Error: Cannot add script to compiler without a proper main component.  A proper function-based component is required.";
        };
        /** Compiles the underlying script into code.
          * @param {string} targetVar The target variable that will receive the 'RuntimeScript' reference.  If not specified, this is '$fs' by default.
          */
        Compiler.prototype.compile = function (targetVar) {
            this._checkMain();
            // ... create a default root level renderer ...
            var rootRenderer = TypeRenderer.createRootTypeRenderer(this);
            // ... render the main functional component ...
            this._renderFunctionalComponent(rootRenderer, this.script.Main);
            return rootRenderer.toString(targetVar);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Initializes the simulation of the underlying script. */
        Compiler.prototype.compileSimulation = function () {
            this._checkMain();
            // ... create a default root level renderer ...
            var rootRenderer = TypeRenderer.createRootTypeRenderer(this, true);
            // ... render the main functional component ...
            var mainRenderer = this._renderFunctionalComponent(rootRenderer, this.script.Main, true);
            return new FlowScript.Simulator(this, mainRenderer);
        };
        // --------------------------------------------------------------------------------------------------------------------
        ///** Attempts to render a given source object. The source object can be any component type, such as a block, line, statement, or expression. */
        //? _render(source: {}): TypeRenderer {
        //    var renderer = TypeRenderer.createRootTypeRenderer(this);
        //    if (source instanceof Component) {
        //        var comp = <Component>source;
        //        switch (comp.componentType) {
        //            case ComponentTypes.Functional:
        //                this._renderFunctionalComponent(renderer, comp, false);
        //                break;
        //            case ComponentTypes.Assignment:
        //            case ComponentTypes.Operation:
        //            case ComponentTypes.Unary:
        //                this._renderExpression(renderer, new Expression(comp));
        //                break;
        //            case ComponentTypes.ControlFlow:
        //                this._renderControlFlow(renderer, new Expression(comp));
        //                break;
        //            case ComponentTypes.Comment:
        //                break;
        //            case ComponentTypes.Text:
        //                //?renderer.addLine(source, this._renderText(<Component>source));
        //                break;
        //        }
        //    } else if (source instanceof BlockReference) {
        //        this._renderBlockExpression(renderer, <BlockReference>source, false);
        //    } else if (source instanceof Line) {
        //        var line = <Line>source;
        //        if (line.statements.length)
        //            this._renderStatement(renderer, line.statements[0]);
        //    } else if (source instanceof Statement) {
        //        this._renderStatement(renderer, <Statement>source);
        //    } else if (source instanceof Expression) {
        //        var result = this._renderExpression(renderer, <Expression>source);
        //        renderer.addLine(source, result);
        //    }
        //    return renderer;
        //}
        // --------------------------------------------------------------------------------------------------------------------
        /** Takes a functional component and renders */
        Compiler.prototype._renderFunctionalComponent = function (renderer, comp, isSimulation) {
            if (isSimulation === void 0) { isSimulation = false; }
            try {
                if (comp.componentType != FlowScript.ComponentTypes.Functional)
                    throw "The component given is not a \"functional\" component.";
                if (!renderer)
                    throw "A renderer reference is required.";
                renderer = renderer.registerType(comp);
                this._renderComponentFunctionEntry(renderer, comp);
                var functionBody = "";
                // ... go through the block lines and translate the statements ...
                for (var i = 0, n = comp.block.lines.length; i < n; ++i) {
                    var line = comp.block.lines[i];
                    var statement = line.statements[0];
                    if (statement) {
                        this._renderStatement(renderer, statement);
                        //if (i == n - 1) {
                        //    // ... process any default returns on the last line ...
                        //    if (comp.defaultReturn && statement.source.componentType != ComponentTypes.Functional && statement.source.componentType != ComponentTypes.ControlFlow)
                        //        renderer.prefixLastLine(Compiler.CONTEXT_VAR_NAME + ".argument" + this._renderPropertyAccessor(comp.defaultReturn.name) + " = ");
                        //}
                    }
                }
                this._renderComponentFunctionExit(renderer, comp);
                return renderer;
            }
            catch (e) {
                throw "Error in functional component '" + comp.fullTypeName + "': " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderComponentFunctionEntry = function (renderer, comp) {
            if (!renderer.isSimulation)
                renderer.addLine(comp, "function (" + Compiler.CONTEXT_VAR_NAME + ") {");
            if (renderer.component.defaultReturn)
                renderer.addLocalVar(Compiler.RUNNING_VAL_VAR_NAME);
            renderer.nextMargin();
        };
        Compiler.prototype._renderComponentFunctionExit = function (renderer, comp) {
            // ... insert any local vars used ...
            renderer.insertDeclarations(comp);
            // ... always return the running value (which may simply be the 'undefined' value) ...
            if (renderer.component.defaultReturn)
                renderer.addLine(null, "return " + Compiler.RUNNING_VAL_VAR_NAME + ";");
            // ... add final brace ...
            renderer.previousMargin();
            if (!renderer.isSimulation)
                renderer.addLine(comp, "};");
        };
        Compiler.prototype._verifyArgCount = function (compRef, expectedCount) {
            if (compRef.argumentLength != expectedCount)
                throw "Exactly " + expectedCount + " argument" + (expectedCount != 1 ? 's are' : ' is') + " expected.";
        };
        Compiler.prototype._renderStatement = function (renderer, statement) {
            if (statement)
                try {
                    // Note: A statement contains an actionable component (like assignments, and component calls), but never single operations.
                    var action = statement.component, code;
                    switch (action.componentType) {
                        case FlowScript.ComponentTypes.ControlFlow:
                            this._renderControlFlow(renderer, statement);
                            break;
                        case FlowScript.ComponentTypes.Comment: // (noop)
                            break;
                        case FlowScript.ComponentTypes.Code:
                            this._verifyArgCount(statement, 1);
                            this._renderCode(renderer, statement.arguments.getArg(0));
                            break;
                        default:
                            var result = this._renderExpression(renderer, statement, statement.component.isOperational); // (a value is returned if this is an operation)
                            if (statement.component.isOperational)
                                if (renderer.isSimulation) {
                                    if (renderer.component.defaultReturn)
                                        renderer.assign(statement, Compiler.RUNNING_VAL_VAR_NAME);
                                }
                                else if (result != Compiler.RUNNING_VAL_VAR_NAME)
                                    if (renderer.component.defaultReturn)
                                        renderer.addLine(statement, this._renderAssignment(Compiler.RUNNING_VAL_VAR_NAME, result) + ";");
                                    else
                                        renderer.addLine(statement, result);
                            break;
                    }
                    this._renderCallCleanups(renderer);
                }
                catch (e) {
                    throw "Invalid statement '" + statement.component + "' on line " + statement.lineNumer + ": " + FlowScript.getErrorMessage(e);
                }
        };
        Compiler.prototype._renderControlFlow = function (renderer, compRef) {
            try {
                switch (compRef.component.fullTypeName) {
                    case this.script.System.ControlFlow.If.fullTypeName:
                        this._verifyArgCount(compRef, 2);
                        this._renderIf(renderer, compRef, compRef.arguments.getArg(0, true), compRef.arguments.getArg(1));
                        break;
                    case this.script.System.ControlFlow.IfElse.fullTypeName:
                        this._verifyArgCount(compRef, 3);
                        this._renderIfElse(renderer, compRef, compRef.arguments.getArg(0, true), compRef.arguments.getArg(1), compRef.arguments.getArg(2));
                        break;
                    case this.script.System.ControlFlow.While.fullTypeName:
                        this._verifyArgCount(compRef, 2);
                        this._renderWhile(renderer, compRef, compRef.arguments.getArg(0, true), compRef.arguments.getArg(1));
                        break;
                    case this.script.System.ControlFlow.DoWhile.fullTypeName:
                        this._verifyArgCount(compRef, 2);
                        this._renderDoWhile(renderer, compRef, compRef.arguments.getArg(0), compRef.arguments.getArg(1, true));
                        break;
                    case this.script.System.ControlFlow.Loop.fullTypeName:
                        this._verifyArgCount(compRef, 4);
                        this._renderLoop(renderer, compRef, compRef.arguments.getArg(0), compRef.arguments.getArg(1, true), compRef.arguments.getArg(2), compRef.arguments.getArg(3, true));
                        break;
                    default:
                        throw "The component '" + compRef.component + "' is not a recognized control flow component.";
                }
            }
            catch (e) {
                throw "Error in control flow expression '" + compRef.component + "': " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderIf = function (renderer, expr, condition, block) {
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                var ifIndex = renderer.jumpIfNot(expr, 0);
            else
                renderer.addLine(expr, "if (" + conditionStr + ") {");
            renderer.nextMargin();
            this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            if (renderer.isSimulation)
                renderer.updateJump(ifIndex);
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderIfElse = function (renderer, expr, condition, block1, block2) {
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                var ifIndex = renderer.jumpIfNot(expr, 0);
            else
                renderer.addLine(expr, "if (" + conditionStr + ") {");
            renderer.nextMargin();
            this._renderExpression(renderer, block1, false);
            renderer.previousMargin();
            if (renderer.isSimulation) {
                var trueBlockExitIndex = renderer.jump(expr);
                renderer.updateJump(ifIndex);
            }
            else
                renderer.addLine(expr, "} else {");
            renderer.nextMargin();
            this._renderExpression(renderer, block2, false);
            renderer.previousMargin();
            if (renderer.isSimulation)
                renderer.updateJump(trueBlockExitIndex);
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderWhile = function (renderer, expr, condition, block) {
            var whileCondEvalIndex = renderer.nextLineIndex;
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                var whileIndex = renderer.jumpIfNot(expr);
            else
                renderer.addLine(expr, "while (" + conditionStr + ") {");
            renderer.nextMargin();
            this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            if (renderer.isSimulation) {
                renderer.jump(expr, whileCondEvalIndex);
                renderer.updateJump(whileIndex);
            }
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderDoWhile = function (renderer, expr, block, condition) {
            if (renderer.isSimulation)
                var doIndex = renderer.nextLineIndex;
            else
                renderer.addLine(expr, "do {");
            renderer.nextMargin();
            this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            var conditionStr = this._renderExpression(renderer, condition, true);
            if (renderer.isSimulation)
                renderer.jumpIf(expr, doIndex);
            else
                renderer.addLine(expr, "} while (" + conditionStr + ");");
        };
        Compiler.prototype._renderLoop = function (renderer, expr, init, condition, block, update) {
            // ... this is similar to a "for" loop, but not exactly the same ...
            if (init)
                this._renderExpression(renderer, init);
            if (renderer.isSimulation)
                renderer.eval(null, this._renderAssignment(counterStr, '0'));
            var loopCondEvalIndex = renderer.nextLineIndex;
            var conditionStr = this._renderExpression(renderer, condition, true);
            var counterStr = Compiler.LOOP_COUNTER_VAR_NAME + (renderer.loopID++ || "");
            renderer.addLocalVar(counterStr);
            if (renderer.isSimulation)
                var loopIndex = renderer.jumpIfNot(expr);
            else
                renderer.addLine(expr, "for (" + counterStr + " = 0; " + conditionStr + "; ++" + counterStr + ") {");
            renderer.nextMargin();
            //if (renderer.isSimulation)
            //    var updateBlockIndex = renderer.jumpIfNot(null);
            //else
            //    renderer.addLine(expr, "if (" + counterStr + ") {");
            //renderer.nextMargin();
            this._renderExpression(renderer, update);
            //renderer.previousMargin();
            //if (renderer.isSimulation)
            //    renderer.updateJump(updateBlockIndex);
            //else
            //    renderer.addLine(expr, "}");
            if (block)
                this._renderExpression(renderer, block, false);
            renderer.previousMargin();
            if (renderer.isSimulation) {
                renderer.jump(expr, loopCondEvalIndex);
                renderer.updateJump(loopIndex);
            }
            else
                renderer.addLine(expr, "}");
        };
        Compiler.prototype._renderConstantExpression = function (renderer, expr) {
            var code = this._renderConstant(expr.value);
            if (renderer.isSimulation)
                (renderer.eval(expr, code), code = FlowScript.undefined);
            return code;
        };
        Compiler.prototype._renderPropertyExpression = function (renderer, expr, assignment) {
            if (assignment === void 0) { assignment = false; }
            if (typeof expr !== 'object' || !(expr instanceof FlowScript.PropertyReference))
                throw "A valid property reference is required for the left side of an assignment operation.";
            var prop = expr.property;
            if (assignment && prop._isConst)
                throw "Property '" + expr + "' is marked as a constant and cannot be assigned to.";
            if (prop._isInstance)
                var code = this._renderInstanceProperty(prop); // TODO Doesn't this need an instance reference as the second arg?
            else
                var code = this._renderCtxArg(prop);
            if (renderer.isSimulation && !assignment)
                (renderer.eval(expr, code), code = FlowScript.undefined);
            return code;
        };
        Compiler.prototype._renderBlockExpression = function (renderer, blockExpr, operation) {
            if (operation)
                throw "A block cannot be part of an operation expression sequence.";
            if (!(blockExpr instanceof FlowScript.BlockReference))
                throw "Block argument is not a block reference.";
            var block = blockExpr.block;
            if (block.hasLines)
                for (var lineIndex = 0, n = block.lines.length; lineIndex < n; ++lineIndex) {
                    var line = block.lines[lineIndex];
                    if (line && line.statements && line.statements.length)
                        this._renderStatement(renderer, line.statements[0]);
                }
        };
        Compiler.prototype._renderWithExpression = function (renderer, objExpr, opExpr) {
            //objContextVar
            if (!(objExpr instanceof FlowScript.PropertyReference))
                throw "Object expression argument is not a property reference.";
            if (!objExpr.component.isObject)
                throw "Object expression argument is a property of a non-object component.  The property must exist on an object type component.";
            renderer.addContextVar(this._renderPropertyExpression(renderer, objExpr, true)); // ("with" sets the context for the '$this' token to be used with for custom code and expressions [see '_renderCode()'])
            var code = this._renderExpression(renderer, opExpr, true);
            renderer.removeLastContextVar();
            return code;
        };
        Compiler.prototype._renderWithBlock = function (renderer, objExpr, blockExpr) {
            //objContextVar
            if (!(objExpr instanceof FlowScript.PropertyReference))
                throw "Object expression argument is not a property reference.";
            if (!objExpr.component.isObject)
                throw "Object expression argument is a property of a non-object component.  The property must exist on an object type component.";
            if (!(blockExpr instanceof FlowScript.BlockReference))
                throw "Block expression argument is not a block reference.";
            var block = blockExpr.block;
            if (block.hasLines) {
                var objProp = objExpr.property;
                if (objProp.component == renderer.component) {
                    // ... render containing component properties as normal 'arg' references ...
                    renderer.addContextVar(this._renderPropertyExpression(renderer, objExpr, true));
                }
                else {
                    // ... this is a property from an object type, and not the containing component; double check inheritance, then render the object instance property path ...
                    if (!objExpr.component.hasInstanceProperty(objProp.name))
                        throw "Component object of type '" + objExpr.component + "' does not contain an instance property named '" + objProp.name + "'.";
                    renderer.addContextVar(renderer.objContextVar + this._renderPropertyExpression(renderer, objExpr, true));
                }
                // ("with" sets the context for the '$this' token to be used with for custom code and expressions [see '_renderCode()'])
                this._renderBlockExpression(renderer, blockExpr, false);
                renderer.removeLastContextVar();
            }
        };
        Compiler.prototype._renderExpression = function (renderer, expr, operation, assignment) {
            if (operation === void 0) { operation = false; }
            if (assignment === void 0) { assignment = false; }
            try {
                if (!expr)
                    throw "Expression is missing.";
                if (assignment)
                    operation = true; // (force this, as all assignments are also operations)
                if (expr instanceof FlowScript.PropertyReference)
                    return this._renderPropertyExpression(renderer, expr, assignment);
                else if (assignment)
                    throw "A property expression is required for the left side of an assignment operation.";
                if (expr instanceof FlowScript.Constant)
                    return this._renderConstantExpression(renderer, expr);
                if (expr instanceof FlowScript.BlockReference) {
                    this._renderBlockExpression(renderer, expr, operation);
                    return;
                }
                if (!expr.component)
                    throw "Expression doesn't have a component source.  Basic (non-derived) expressions must reference a component source to define the expression's behavior (in contrast, derived expression types are special cases [i.e. Constant, Property, Block, etc.] which are normally checked by type).";
                //if (expr.source.componentType != ComponentTypes.Expression && objContextVar)
                //    throw "Renderer error: object context variable '" + objContextVar + "' given, but the containing component is not an expression.";
                switch (expr.component.componentType) {
                    case FlowScript.ComponentTypes.Expression:
                        if (!expr.component.block.lines || !expr.component.block.lines.length || expr.component.block.lines.length > 1
                            || !expr.component.block.lines[0].statements || !expr.component.block.lines[0].statements.length)
                            throw "Custom expressions must contain one 'Code' line statement.";
                        var codeStatement = expr.component.block.lines[0].statements[0];
                        if (codeStatement.component.componentType != FlowScript.ComponentTypes.Code)
                            throw "The only component allowed within a custom expression block is a single 'Code' component that defines the expression or operation to perform.";
                        this._verifyArgCount(codeStatement, 1);
                        return this._renderCode(renderer, codeStatement.arguments.getArg(0));
                    case FlowScript.ComponentTypes.Operation:
                    case FlowScript.ComponentTypes.Assignment:
                        var compRef = expr;
                        if (compRef.component.parameters.length != 2)
                            throw "The component is not valid for operations.  Operational components must have two parameters.";
                        this._verifyArgCount(compRef, 2);
                        var prop0 = compRef.component.parameters.getProperty(0); // (get expected value type info for the left side)
                        var prop1 = compRef.component.parameters.getProperty(1); // (get expected value type info for the right side)
                        var arg0 = compRef.arguments.getArg(0), arg1 = compRef.arguments.getArg(1);
                        if (prop0._isAlias && !(arg0 instanceof FlowScript.PropertyReference))
                            throw "The left side of this operation must be a property.";
                        if (prop1._isAlias && !(arg1 instanceof FlowScript.PropertyReference))
                            throw "The right side of this operation must be a property.";
                        var isAssignment = compRef.component.componentType == FlowScript.ComponentTypes.Assignment;
                        var rightSide = this._renderExpression(renderer, arg1, true);
                        if (renderer.isSimulation && !isAssignment)
                            renderer.pushOpArg(); // (push the running value before evaluating the right side [or it will be overwritten])
                        var leftSide = this._renderExpression(renderer, arg0, true, isAssignment);
                        if (renderer.isSimulation) {
                            if (isAssignment)
                                renderer.assign(compRef, leftSide); // (will assign the running value to the left side variable)
                            else
                                renderer.evalOp(compRef, compRef.component); // (will pop the right side, and execute op with current running value as left side)
                            return FlowScript.undefined;
                        }
                        else
                            return this._renderOp(leftSide, expr.component, rightSide);
                    case FlowScript.ComponentTypes.Unary:
                    case FlowScript.ComponentTypes.Object:
                        var compRef = expr;
                        if (compRef.component.parameters.length != 1)
                            throw "The component is not valid for unary operations.  Unary components must have one parameter.";
                        this._verifyArgCount(compRef, 1);
                        var prop = compRef.component.parameters.getProperty(0);
                        var arg = compRef.arguments.getArg(0);
                        if (prop._isAlias && !(arg instanceof FlowScript.PropertyReference))
                            throw "The argument for this unary operation type must be a property.";
                        var code = this._renderExpression(renderer, arg, true, prop._isAlias);
                        if (renderer.isSimulation) {
                            renderer.evalUnary(compRef, compRef.component, prop._isAlias && code || FlowScript.undefined);
                            return FlowScript.undefined;
                        }
                        else
                            return this._renderUnary(code, compRef.component);
                    case FlowScript.ComponentTypes.Functional:
                        return this._renderComponentCall(renderer, expr, operation);
                    default:
                        throw "Invalid expression in component '" + expr.functionalComponent + "': The component '" + expr.component + "' is not valid for expressions.";
                }
            }
            catch (e) {
                throw "Invalid '" + expr.component + "' expression: " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderComponentCall = function (renderer, compRef, operation) {
            try {
                if (!compRef.component)
                    throw "Expression doesn't have a source to render a call for.";
                if (operation) {
                    if (!compRef.returnTargets.isEmpty)
                        throw "Functional components used as expressions cannot have return targets.";
                    else if (!compRef.component.defaultReturn)
                        throw "The component is used in an expression, but doesn't define a default return.";
                }
                // ... before this call can be made, the component being called must also be rendered.
                this._renderFunctionalComponent(renderer, compRef.component);
                // ... setup a context for the call ...
                var currentCtxID = renderer.callStack.push(compRef) - 1, currentCtxIDStr = currentCtxID || ""; //?, extraArgNames: string[] = [];
                var compLocalName = renderer.addLocalVar(Compiler.COMPONENT_REF_VAR_NAME + currentCtxIDStr);
                var localCtxName = renderer.addLocalVar(Compiler.LOCAL_CONTEXT_VAR_NAME + currentCtxIDStr);
                //?for (var i = expr.source.parameters.length, n = expr.argumentLength; i < n; ++i)
                //    extraArgNames.push("'" + expr._arguments[i] + "'");
                renderer.addLine(compRef, compLocalName + " = " + Compiler.SCRIPT_VAR_NAME + ".types." + compRef.component.safeFullTypeName + ";");
                renderer.addLine(compRef, compLocalName + ".context = " + localCtxName + " = " + compLocalName + ".context.next || " + Compiler.CONTEXT_VAR_NAME + ".getNextContext(" + compLocalName + ", " + compRef.argumentLength + ");");
                // ... setup context arguments with the argument values to prepare for the call ...
                var argIndexes = compRef.arguments.getArgIndexes(); // (note: the arguments are sorted by default before returning, just in case)
                for (var i = 0, n = argIndexes.length; i < n; ++i) {
                    var argIndex = argIndexes[i];
                    var argExpr = compRef.arguments.getArg(argIndex);
                    var argName = compRef.arguments.getArgName(argIndex);
                    if (!compRef.component.hasParameter(argName))
                        throw "Error: Argument with name '" + argName + "' does not have a corresponding property name for component '" + compRef.component + "'.";
                    var rightSide = this._renderExpression(renderer, argExpr, true); // (note: 'this._renderExpression' must always be called to allow simulations to add "op codes", or return a results to use otherwise)
                    if (renderer.isSimulation)
                        renderer.assign(argExpr, this._renderCtxArg(argName, localCtxName));
                    else
                        renderer.addLine(argExpr, this._renderCtxArg(argName, localCtxName) + " = " + rightSide + ";");
                }
                // ... set rest of unused parameters to undefined by default ...
                for (var i = 0, n = compRef.component.parameters.length; i < n; ++i) {
                    var param = compRef.component.parameters.getProperty(i);
                    if (!compRef.arguments.isArgSet(param.name)) {
                        if (!param._isOptional)
                            throw "No argument value was supplied for required parameter '" + param.name + "'.";
                        renderer.addLine(param, localCtxName + this._renderPropertyAccessor(param.name) + " = void 0;");
                    }
                }
                // ... render the call ...
                var callstr = compLocalName + "(" + localCtxName + ")";
                if (renderer.isSimulation) {
                    renderer.call(compRef, compRef.component.safeFullTypeName, currentCtxID);
                }
                else {
                    if (operation)
                        return callstr; // (this is an operational call that can be inserted into an expression, so return the call string)
                    else // ... add non-operational call as a statement (add line to renderer) ...
                        renderer.addLine(compRef, Compiler.RUNNING_VAL_VAR_NAME + " = " + callstr + ";");
                    return; // (this is a non-operational call, so return 'undefined' just in case, for "assertion" purposes)
                } // (else add as a single unary type operation [return a string] - but, cleanup must be done by the caller!)
            }
            catch (e) {
                throw "Failed to render call to component '" + compRef.component + "': " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderCallCleanups = function (renderer) {
            // ... cleanup all calls rendered up to this point ...
            while (renderer.callStack.length)
                this._renderCallCleanup(renderer);
        };
        /** This unwinds the context stack back by one after rendering a functional component call. */
        Compiler.prototype._renderCallCleanup = function (renderer) {
            try {
                if (!renderer.callStack.length)
                    throw "Call cleanup failure: number of calls doesn't match the number of cleanups.";
                var compRef = renderer.callStack.pop();
                var currentCtxID = renderer.callStack.length, currentCtxIDStr = currentCtxID || "";
                var compLocalName = Compiler.COMPONENT_REF_VAR_NAME + currentCtxIDStr;
                var localCtxName = Compiler.LOCAL_CONTEXT_VAR_NAME + currentCtxIDStr;
                // ... first, resolve any return targets ...
                var returnTargets = compRef.returnTargets.maps;
                for (var i = 0, n = returnTargets.length; i < n; ++i) {
                    if (!returnTargets[i].target)
                        throw "The target value of a return target mapping is required.";
                    var leftSide = this._renderCtxArg(returnTargets[i].target.property);
                    var srcExpr = returnTargets[i].source;
                    if (!srcExpr || srcExpr instanceof FlowScript.PropertyReference) {
                        // ... this is a property reference, so render as such ...
                        // (if 'srcExpr' is null/undefined, then treat the source as "default", which is the current running value)
                        var prop = srcExpr && srcExpr.property || null;
                        var rightSide = prop && prop.name != FlowScript.Property.DEFAULT_NAME ? this._renderCtxArg(prop, localCtxName) : Compiler.RUNNING_VAL_VAR_NAME;
                    }
                    else if (compRef instanceof FlowScript.Expression) {
                        //? ... this is a fixed constant value, so just dump the value ...
                        //var constant = <Constant>srcExpr;
                        //var rightSide = <string>constant.value;
                        var rightSide = this._renderExpression(renderer, compRef, true, true);
                    }
                    else
                        throw "Return target source expression is not a valid expression object.";
                    renderer.addLine(returnTargets[i], this._renderAssignment(leftSide, rightSide) + ";");
                }
                // ... finally, move the context stack pointer back ...
                renderer.addLine(null, compLocalName + ".context = " + localCtxName + ".previous;");
            }
            catch (e) {
                throw "Failed to clean up rendered call: " + FlowScript.getErrorMessage(e);
            }
        };
        Compiler.prototype._renderCtxArg = function (property, ctxPath) {
            if (typeof property == 'object' && property instanceof FlowScript.Property && property.name == FlowScript.Property.DEFAULT_NAME)
                throw "Cannot render a default property as a context argument.";
            return (ctxPath || Compiler.CONTEXT_VAR_NAME) + ".arguments" + this._renderPropertyAccessor((typeof property == 'string' ? property : property.name));
        };
        Compiler.prototype._renderInstanceProperty = function (property, objectVarPath) {
            if (typeof property == 'object' && property instanceof FlowScript.Property)
                if (property.name == FlowScript.Property.DEFAULT_NAME)
                    throw "Cannot render a default property as an instance property.";
                else if (!property._isInstance)
                    throw "Property '" + property + "' is not an instance property.";
            return (objectVarPath || "") + this._renderPropertyAccessor((typeof property == 'string' ? property : property.name));
        };
        Compiler.prototype._renderDeclaration = function (varname, value) {
            return "var " + varname + (value !== FlowScript.undefined ? " = " + this._renderConstant(value) : "") + ";";
        };
        Compiler.prototype._renderAssignment = function (varpath, source) {
            return this._renderOp(varpath, this.script.System.Assign, source);
        };
        Compiler.prototype._renderConstant = function (value) {
            if (typeof value == 'function') {
                /** Extracts the given function contents and puts it inline to the specified context.
                  * This makes it easier to use code completion to define functions instead of passing in code strings.
                  * A containing component reference is required in order to replace any tokens found with the proper values.
                  * Note: The function name and parameters are stripped out; only the main block contents remain (without the braces).
                  */
                var code = value.toString().match(FlowScript.Core.Code.FUNCTION_CONTENTS_REGEX)[0].trim();
                if (code[code.length - 1] != ";")
                    code += ";"; // (make sure the last character in the code block ends with a semicolon, to be safe)
                return code;
            }
            return typeof value == 'string' ? value = '"' + value + '"' : '' + value;
        };
        Compiler.prototype._renderOp = function (renderedLValue, operationTypeName, renderedRValue) {
            if (typeof operationTypeName == 'object' && operationTypeName instanceof FlowScript.Type)
                operationTypeName = operationTypeName.fullTypeName;
            switch (operationTypeName) {
                case this.script.System.Assign.fullTypeName:
                    return renderedLValue + " = " + renderedRValue;
                case this.script.System.Accessor.fullTypeName:
                    return renderedLValue + "." + renderedRValue;
                case this.script.System.Comparison.Equals.fullTypeName:
                    return renderedLValue + " == " + renderedRValue;
                case this.script.System.Comparison.NotEquals.fullTypeName:
                    return renderedLValue + " != " + renderedRValue;
                case this.script.System.Comparison.StrictEquals.fullTypeName:
                    return renderedLValue + " === " + renderedRValue;
                case this.script.System.Comparison.StrictNotEquals.fullTypeName:
                    return renderedLValue + " !=== " + renderedRValue;
                case this.script.System.Comparison.LessThan.fullTypeName:
                    return renderedLValue + " < " + renderedRValue;
                case this.script.System.Comparison.GreaterThan.fullTypeName:
                    return renderedLValue + " > " + renderedRValue;
                case this.script.System.Comparison.LessThanOrEqual.fullTypeName:
                    return renderedLValue + " <= " + renderedRValue;
                case this.script.System.Comparison.GreaterThanOrEqual.fullTypeName:
                    return renderedLValue + " >= " + renderedRValue;
                case this.script.System.Math.Add.fullTypeName:
                    return renderedLValue + " + " + renderedRValue;
                case this.script.System.Math.Multiply.fullTypeName:
                    return renderedLValue + " * " + renderedRValue;
                case this.script.System.Binary.ShiftLeft.fullTypeName:
                    return renderedLValue + " << " + renderedRValue;
                case this.script.System.Binary.ShiftRight.fullTypeName:
                    return renderedLValue + " >> " + renderedRValue;
                default:
                    throw "Operation type '" + operationTypeName + "' is not a recognized/supported operation.";
            }
        };
        Compiler.prototype._renderUnary = function (renderedValue, operationTypeName) {
            if (typeof operationTypeName == 'object' && operationTypeName instanceof FlowScript.Type)
                operationTypeName = operationTypeName.fullTypeName;
            switch (operationTypeName) {
                case this.script.System.Boolean.fullTypeName:
                    return "!!" + renderedValue;
                case this.script.System.Double.fullTypeName:
                    return "+" + renderedValue;
                case this.script.System.Integer.fullTypeName:
                    return "+" + renderedValue + "|0";
                case this.script.System.String.fullTypeName:
                    return "''+" + renderedValue;
                case this.script.System.PreIncrement.fullTypeName:
                    return "++" + renderedValue;
                case this.script.System.PostIncrement.fullTypeName:
                    return renderedValue + "++";
                case this.script.System.PreDecrement.fullTypeName:
                    return "--" + renderedValue;
                case this.script.System.PostDecrement.fullTypeName:
                    return renderedValue + "--";
                case this.script.System.Binary.Not.fullTypeName:
                    return "!" + renderedValue;
                case this.script.System.Binary.XOR.fullTypeName:
                    return "~" + renderedValue;
                case this.script.System.Object.fullTypeName:
                    return "Object(" + renderedValue + ")";
                case this.script.System.Math.SQRT.fullTypeName:
                    return "Math.sqrt(" + renderedValue + ")";
                default:
                    throw "Unary type '" + operationTypeName + "' is not a recognized/supported operation.";
            }
        };
        Compiler.prototype._renderPropertyAccessor = function (propertyName) {
            if (FlowScript.Expression.NUMERIC_INDEX_REGEX.test(propertyName))
                return "[" + propertyName + "]";
            else
                return FlowScript.Expression.VALID_IDENTIFIER_REGEX.test(propertyName) ? "." + propertyName : "['" + propertyName + "']";
        };
        Compiler.prototype._renderCode = function (renderer, codeExpr) {
            var code = this._renderExpression(renderer, codeExpr);
            var objContextVar = renderer.objContextVar;
            if (!objContextVar && renderer.component.hasDataObjectTypeParent)
                objContextVar = "this";
            var containingComponent = renderer.component;
            var componentIsExpression = containingComponent.componentType == FlowScript.ComponentTypes.Expression;
            var tokens = code.match(FlowScript.Core.Code.PROPERTY_TOKEN_REGEX), token;
            var thisFound = false;
            if (tokens) {
                var nonTokenText = code.split(FlowScript.Core.Code.PROPERTY_TOKEN_REGEX, FlowScript.undefined, tokens);
                var newCode = tokens[0];
                for (var i = 0, n = tokens.length; i < n; ++i) { // note: nonTokenText[i+1] is ALWAYS the text that follows the token
                    token = tokens[i];
                    if (token == "$$")
                        newCode += "$" + nonTokenText[i + 1];
                    else {
                        token = token.substring(1);
                        if (!token)
                            throw "Code token parameter '" + nonTokenText[i] + "»" + tokens[i] + "«" + nonTokenText[i + 1] + "' within component '" + containingComponent + "' is empty or invalid.";
                        if (token != "this")
                            newCode += this._renderCtxArg(token) + nonTokenText[i + 1];
                        else {
                            if (componentIsExpression && nonTokenText[i])
                                throw "Code token parameter '»" + nonTokenText[i] + "«" + tokens[i] + nonTokenText[i + 1] + "' within component '" + containingComponent + "' is invalid: No characters are allowed before '$this' because the containing component is an expression.";
                            // ... make sure '$this' is valid - check if containing component has a parent object ...
                            if (containingComponent.parent instanceof FlowScript.Component && containingComponent.parent.componentType == FlowScript.ComponentTypes.Object) {
                                newCode += objContextVar + nonTokenText[i + 1];
                                thisFound = true;
                            }
                            else
                                throw "Code token parameter '" + nonTokenText[i] + "»" + tokens[i] + "«" + nonTokenText[i + 1] + "' is invalid: component '" + containingComponent + "' is not a child of an object type.";
                        }
                    }
                }
                ///** Since the compiler cannot convert custom code to other languages, developers must supply the conversion here themselves.
                //  * Note: Using these components in apps can limit a compiler's ability to target other languages for that app.
                //  */
            }
            if (objContextVar && !thisFound)
                throw "Code token parameter '$this' is required, but not found in custom code within component '" + containingComponent + "'.";
            if (!componentIsExpression)
                renderer.exec(codeExpr, code);
            return code;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Used for final rendering only (not used for simulations). */
        Compiler.CONTEXT_VAR_NAME = "ctx";
        Compiler.LOCAL_CONTEXT_VAR_NAME = "$__ctx";
        Compiler.RUNNING_VAL_VAR_NAME = "$__";
        Compiler.COMPONENT_REF_VAR_NAME = "$__comp";
        Compiler.SCRIPT_VAR_NAME = "$__script";
        Compiler.USER_RTSCRIPT_VAR_NAME = "$fs";
        Compiler.LOOP_COUNTER_VAR_NAME = "$__i";
        return Compiler;
    }());
    FlowScript.Compiler = Compiler;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Compiler.js.map