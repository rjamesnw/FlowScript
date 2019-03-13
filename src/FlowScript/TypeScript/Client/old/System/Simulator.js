// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Operational codes used to control the simulator. */
    var OpCodes;
    (function (OpCodes) {
        /** Executes a single statement or expression of JavaScript code. */
        OpCodes[OpCodes["Exec"] = 0] = "Exec";
        /** Branches to an offset if a value equates to true. */
        OpCodes[OpCodes["JumpIf"] = 1] = "JumpIf";
        /** Branches to an offset if a value equates to false. */
        OpCodes[OpCodes["JumpIfNot"] = 2] = "JumpIfNot";
        /** Branches to an offset. */
        OpCodes[OpCodes["Jump"] = 3] = "Jump";
        /** Calls another component. */
        OpCodes[OpCodes["Call"] = 4] = "Call";
    })(OpCodes = FlowScript.OpCodes || (FlowScript.OpCodes = {}));
    // ========================================================================================================================
    /** Represents a component during runtime simulations. */
    var VirtualRuntimeComponent = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function VirtualRuntimeComponent(simulator, component) {
            this._simulator = simulator;
            this._sourceComponent = component;
        }
        Object.defineProperty(VirtualRuntimeComponent.prototype, "simulator", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._simulator; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualRuntimeComponent.prototype, "sourceComponent", {
            get: function () { return this._sourceComponent; },
            enumerable: true,
            configurable: true
        });
        return VirtualRuntimeComponent;
    }());
    FlowScript.VirtualRuntimeComponent = VirtualRuntimeComponent;
    ;
    ;
    /** Simulates the script by breaking down the components into executable steps. */
    var Simulator = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Simulator(compiler, mainRenderer) {
            this._compiler = compiler;
            if (!mainRenderer || !mainRenderer.isFunctionalComponent)
                throw "A main renderer must reference a functional component.";
            this._mainRenderer = mainRenderer;
        }
        Object.defineProperty(Simulator.prototype, "compiler", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._compiler; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Simulator.prototype, "mainRenderer", {
            get: function () { return this._mainRenderer; },
            enumerable: true,
            configurable: true
        });
        Simulator.prototype.hasComponentRenderer = function (typeOrComp) {
            return this._mainRenderer.hasRenderer(typeof typeOrComp == 'string' ? typeOrComp : typeOrComp.safeFullTypeName);
        };
        Simulator.prototype.getComponentRenderer = function (typeOrComp) {
            return this._mainRenderer.getRenderer(typeof typeOrComp == 'string' ? typeOrComp : typeOrComp.safeFullTypeName);
        };
        Object.defineProperty(Simulator.prototype, "eval", {
            // --------------------------------------------------------------------------------------------------------------------
            /** Allows executing code within the global execution space of the simulator. */
            get: function () { return this._eval || this._createEval(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Simulator.prototype, "rtscript", {
            /** Returns a reference to the global runtime script object (which must be initialized first by calling 'Start()' or 'Run()'). */
            get: function () { return this._rtscript; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Simulator.prototype, "main", {
            /** Returns a reference to the main functional component object (the runtime script object in 'rtscript' must be initialized first by calling 'Start()' or 'Run()'). */
            get: function () { return this._main || (this._rtscript ? this._main = this._rtscript.getType(this._mainRenderer.type.safeFullTypeName) : FlowScript.undefined); },
            enumerable: true,
            configurable: true
        });
        Simulator.prototype._createEval = function () {
            var _this = this;
            return this._eval = function (code) {
                var result = FlowScript.safeEval(code);
                _this._eval = FlowScript.safeEval("(" + _this._eval.toString() + ")");
                return result;
            };
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Enters the functional component context by moving to the first line and initializing a new component shell function.
          * Note: The current context is push onto the stack before being assigned this new entered context.
          */
        Simulator.prototype._enter = function (ctx) {
            // ... setup the new context ...
            ctx.$__lineIndex = 0;
            ctx.$__result = FlowScript.undefined;
            ctx.$__args = [];
            FlowScript.safeEval("(" + Simulator._createComponentShell.toString().replace(/ctx/g, FlowScript.Compiler.CONTEXT_VAR_NAME) + ")")(ctx); // (creates a closure to wrap the runtime simulation context for this call)
            Object.defineProperty(ctx, "value", { configurable: false, enumerable: true, get: function () { return ctx.$__lineExec.eval(FlowScript.Compiler.RUNNING_VAL_VAR_NAME); } });
            // ... make this context the new current context ...
            this.callStack.push(this.currentContext);
            this.currentContext = ctx;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Executes/evaluates the operation/action at the current line.
          * Returns true if there is another statement pending, and false otherwise.
          */
        Simulator.prototype.step = function () {
            var ctx = this.currentContext;
            if (!ctx)
                return false;
            // ... execute the line, otherwise change to the parent context (if any) ...
            if (ctx.$__lineIndex < ctx.$__compRenderer._lines.length) {
                var line = ctx.$__compRenderer._lines[ctx.$__lineIndex++]; // (always make sure this advances)
                switch (line.opcode) {
                    case OpCodes.Exec: // (execute/evaluate JS code)
                        ctx.$__lineExec(line.contents);
                        break;
                    case OpCodes.JumpIf: // (if a condition is TRUE, then jump to the specified line using an offset)
                        if (ctx.$__ && +line.args[0]) // (note: this is used to enter blocks only if FALSE, so TRUE actually makes this SKIP lines [used mainly with do...while blocks])
                            ctx.$__lineIndex += -1 + line.args[0]; // (-1 because the index has already advanced ahead one)
                        break;
                    case OpCodes.JumpIfNot: // (if a condition is FALSE, then jump to the specified line using an offset)
                        if (!ctx.$__ && +line.args[0]) // (note: this is used to enter blocks only if TRUE, so FALSE actually makes this SKIP lines [usually to the next line following the block of lines])
                            ctx.$__lineIndex += -1 + line.args[0]; // (-1 because the index has already advanced ahead one)
                        break;
                    case OpCodes.Jump: // (jump to the specified line using an offset [used with if..else and loops])
                        ctx.$__lineIndex += -1 + line.args[0]; // (-1 because the index has already advanced ahead one)
                        break;
                    case OpCodes.Call: // (transfer execution to another component)
                        var renderer = this.getComponentRenderer(line.args[0]);
                        if (!renderer)
                            throw "Call Error: Component '" + line.args[0] + "' doesn't exist, or was not included in the rendering process.";
                        var ctxID = +line.args[1] == 0 ? "" : line.args[1]; // (0 is "" - only add numbers from 1 onwards)
                        var callCtx = ctx.$__lineExec.eval(FlowScript.Compiler.LOCAL_CONTEXT_VAR_NAME + ctxID); // (get the context that is now setup for the call)
                        callCtx.$__compRenderer = renderer;
                        this._enter(callCtx);
                        return true;
                }
                if (ctx.$__lineIndex >= ctx.$__compRenderer._lines.length && this.callStack.length)
                    this.currentContext = this.callStack.pop();
                return !!this.currentContext;
            }
            return false;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Begins the simulation by creating a new root context, and queues the first instruction step of the main component.
          * Call 'step()' to advance code execution by a single action.
          * Note: The first time this function is called, nothing is executed until 'step()' is called next.  Subsequent calls
          * to this function discards the whole simulation context tree and starts the simulation over again.
          */
        Simulator.prototype.start = function (args) {
            // ... setup the execution environment with the final compiled script  ...
            var code = this._compiler.compile("$__script");
            try {
                this._rtscript = this.eval(code);
            }
            catch (e) {
                throw "Cannot start simulation - compiled code contains an error: " + FlowScript.getErrorMessage(e);
            }
            this.rootContext = new FlowScript.RuntimeContext(null);
            this.rootContext.$__compRenderer = this._mainRenderer;
            this.callStack = [];
            this._enter(this.compiler.script.Main.configureRuntimeContext(this.rootContext, args));
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Run the rest of the simulation from the current execution point and return the root runtime context.
          * Note: The returned context is of type 'ISimulationContext', which contains the running value in the dynamic 'value' property.
          */
        Simulator.prototype.run = function () {
            if (!this._rtscript)
                this.start();
            while (this.step())
                ;
            return this.rootContext;
        };
        return Simulator;
    }());
    FlowScript.Simulator = Simulator;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
FlowScript.Simulator['_createComponentShell'] = function (ctx) {
    ctx.$__lineExec = function (code) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        ctx.$__result = eval(code);
        var $__newLineEvaluator = eval("(" + ctx.$__lineExec + ")"); // (each call creates another closure layer to lock-in any previous evaluated variables)
        $__newLineEvaluator.eval = eval("(" + ctx.$__lineExec.eval.toString() + ")"); // (this is used to "peek" at values within this closure level)
        ctx.$__lineExec = $__newLineEvaluator;
        return ctx.$__result;
    };
    ctx.$__lineExec.eval = function (x) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return eval(x);
    };
    return ctx.$__lineExec;
};
// ############################################################################################################################
//# sourceMappingURL=simulator.js.map