// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    /** Adds special properties to the runtime context for simulation purposes. */
    export interface ISimulationContext extends RuntimeContext {
        /** Used to execute a single line of code within the context of the currently executing component. */
        $__lineExec?: _ILineEvaluator;
        /** The result of previous code evaluation. */
        $__result?: any;
        /** The argument stack for nested operations. */
        $__args?: any[];
        /** Points to the next action to execute. */
        $__lineIndex?: number;
        /** A reference to the component renderer this context was created for. */
        $__compRenderer?: TypeRenderer;
        /** This is a running value that is set with the resulting value at each operational line. Non-operational lines do not change this. */
        $__?: any;
        /** This is a dynamic running value that is set to each operation or component as it evaluates. */
        value?: any;
    }

    /** Operational codes used to control the simulator. */
    export enum OpCodes {
        /** Executes a single statement or expression of JavaScript code. */
        Exec,
        /** Branches to an offset if a value equates to true. */
        JumpIf,
        /** Branches to an offset if a value equates to false. */
        JumpIfNot,
        /** Branches to an offset. */
        Jump,
        /** Calls another component. */
        Call,
        /** Exits the current component. */
        Return
    }


    // ========================================================================================================================

    /** Represents a component during runtime simulations. */
    export class VirtualRuntimeComponent {
        // --------------------------------------------------------------------------------------------------------------------

        get simulator() { return this._simulator; }
        private _simulator: Simulator;

        get sourceComponent() { return this._sourceComponent; }
        private _sourceComponent: Component;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(simulator: Simulator, component: Component) {
            this._simulator = simulator;
            this._sourceComponent = component;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface _IGlobalEvaluator { (code: string): any; };
    export interface _ILineEvaluator extends IFunctionalComponentMetadata {
        (code: string, ...args: any[]): _ILineEvaluator;
        /** Use this to get and set variables within a executing context. */
        eval(x: string, ...args: any[]): any;
    };

    /** Simulates the script by breaking down the components into executable steps. */
    export class Simulator {
        // --------------------------------------------------------------------------------------------------------------------

        get compiler() { return this._compiler; }
        private _compiler: Compiler;

        get mainRenderer() { return this._mainRenderer; }
        private _mainRenderer: TypeRenderer;

        rootContext: ISimulationContext;

        currentContext: ISimulationContext;

        callStack: ISimulationContext[];

        // --------------------------------------------------------------------------------------------------------------------

        constructor(compiler: Compiler, mainRenderer: TypeRenderer) {
            this._compiler = compiler;
            if (!mainRenderer || !mainRenderer.isFunctionalComponent)
                throw "A main renderer must reference a functional component.";
            this._mainRenderer = mainRenderer;
        }

        // --------------------------------------------------------------------------------------------------------------------

        hasComponentRenderer(type: string): boolean;
        hasComponentRenderer(component: Component): boolean;
        hasComponentRenderer(typeOrComp: any): boolean {
            return this._mainRenderer.hasRenderer(typeof typeOrComp == 'string' ? typeOrComp : (<Type>typeOrComp).safeFullTypeName);
        }

        getComponentRenderer(type: string): TypeRenderer;
        getComponentRenderer(component: Component): TypeRenderer;
        getComponentRenderer(typeOrComp: any): TypeRenderer {
            return this._mainRenderer.getRenderer(typeof typeOrComp == 'string' ? typeOrComp : (<Type>typeOrComp).safeFullTypeName);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Allows executing code within the global execution space of the simulator. */
        get eval() { return this._eval || this._createEval(); }
        private _eval: _IGlobalEvaluator;

        /** Returns a reference to the global runtime script object (which must be initialized first by calling 'Start()' or 'Run()'). */
        get rtscript() { return this._rtscript; }
        private _rtscript: RuntimeScript;

        /** Returns a reference to the main functional component object (the runtime script object in 'rtscript' must be initialized first by calling 'Start()' or 'Run()'). */
        get main() { return this._main || (this._rtscript ? this._main = this._rtscript.getType(this._mainRenderer.type.safeFullTypeName) : undefined); }
        private _main: { (ctx: RuntimeContext): any; };

        private _createEval(): _IGlobalEvaluator {
            var _this = this;
            return this._eval = function (code: string): any {
                var result = safeEval(code);
                _this._eval = safeEval("(" + _this._eval.toString() + ")");
                return result;
            };
        }

        // --------------------------------------------------------------------------------------------------------------------

        private static _createComponentShell: (ctx: ISimulationContext) => _ILineEvaluator;

        // --------------------------------------------------------------------------------------------------------------------

        /** Enters the functional component context by moving to the first line and initializing a new component shell function.
          * Note: The current context is push onto the stack before being assigned this new entered context.
          */
        _enter(ctx: ISimulationContext): void {
            // ... setup the new context ...

            ctx.$__lineIndex = 0;
            ctx.$__result = undefined;
            ctx.$__args = [];

            safeEval("(" + Simulator._createComponentShell.toString().replace(/ctx/g, Compiler.CONTEXT_VAR_NAME) + ")")(ctx); // (creates a closure to wrap the runtime simulation context for this call)

            Object.defineProperty(ctx, "value", { configurable: false, enumerable: true, get: function () { return ctx.$__lineExec.eval(Compiler.RUNNING_VAL_VAR_NAME); } });

            // ... make this context the new current context ...

            this.callStack.push(this.currentContext);
            this.currentContext = ctx;
        }

        /** Exits the current functional component context by popping the previous context from the stack.
          */
        _exit(ctx: ISimulationContext): boolean {
            if (this.callStack.length) {
                this.currentContext = this.callStack.pop();
                if (this.currentContext)
                    this.currentContext.$__ = ctx.$__;
                return !!this.currentContext;
            }
            this.currentContext = null;
            return false;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Executes/evaluates the operation/action at the current line.
          * Returns true if there is another statement pending, and false otherwise.
          */
        step(): boolean {
            var ctx = this.currentContext;
            if (!ctx) return false;

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
                        var renderer = this.getComponentRenderer(<string>line.args[0]);
                        if (!renderer)
                            throw "Call Error: Component '" + line.args[0] + "' doesn't exist, or was not included in the rendering process.";
                        var ctxID = +line.args[1] == 0 ? "" : line.args[1]; // (0 is "" - only add numbers from 1 onwards)
                        // (the context ID is used to identify nested contexts in cases where blocks may be used as parameters)
                        var callCtx = ctx.$__lineExec.eval(Compiler.LOCAL_CONTEXT_VAR_NAME + ctxID); // (get the context that is now setup for the call)
                        callCtx.$__compRenderer = renderer;
                        this._enter(callCtx);
                        return true;
                    case OpCodes.Return: // (return from the current component; if an arguments exists, assume it's a var name)
                        return this._exit(ctx);
                }

                if (ctx.$__lineIndex >= ctx.$__compRenderer._lines.length)
                    return this._exit(ctx);

                return true;
            }
            return false;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Begins the simulation by creating a new root context, and queues the first instruction step of the main component.
          * Call 'step()' to advance code execution by a single action.
          * Note: The first time this function is called, nothing is executed until 'step()' is called next.  Subsequent calls
          * to this function discards the whole simulation context tree and starts the simulation over again.
          */
        start(args?: ICallerArguments): Simulator {
            // ... setup the execution environment with the final compiled script  ...
            var code = this._compiler.compile("$__script");
            try {
                this._rtscript = this.eval(code);
            }
            catch (e) {
                throw "Cannot start simulation - compiled code contains an error: " + getErrorMessage(e);
            }
            this.rootContext = new RuntimeContext(null);
            this.rootContext.$__compRenderer = this._mainRenderer;
            this.callStack = [];
            this._enter(this.compiler.script.Main.configureRuntimeContext(this.rootContext, args));
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Run the rest of the simulation from the current execution point and return the root runtime context.
          * Note: The returned context is of type 'ISimulationContext', which contains the running value in the dynamic 'value' property.
          */
        run(): ISimulationContext {
            if (!this._rtscript)
                this.start();
            while (this.step());
            return this.rootContext;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

FlowScript.Simulator['_createComponentShell'] = function (ctx: FlowScript.ISimulationContext): FlowScript._ILineEvaluator {
    ctx.$__lineExec = <any>function (code: string, ...args: any[]) {
        ctx.$__result = eval(code);
        var $__newLineEvaluator = <FlowScript._ILineEvaluator>eval("(" + ctx.$__lineExec + ")"); // (each call creates another closure layer to lock-in any previous evaluated variables)
        $__newLineEvaluator.eval = eval("(" + ctx.$__lineExec.eval.toString() + ")"); // (this is used to "peek" at values within this closure level)
        ctx.$__lineExec = $__newLineEvaluator;
        return ctx.$__result;
    };
    ctx.$__lineExec.eval = function (x: string, ...args: any[]): any {
        return eval(x);
    };
    return ctx.$__lineExec;
};

// ############################################################################################################################
