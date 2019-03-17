// ############################################################################################################################

namespace FlowScript.Core.ControlFlow {
    // ========================================================================================================================
    // Core Control Flow Components
    // ========================================================================================================================

    /** Defines the Math namespace type. */
    export class ControlFlow extends NamespaceObject { // (a type that is inferred by the given arguments)

        If = new If(this);
        IfElse = new IfElse(this);
        While = new While(this);
        DoWhile = new DoWhile(this);
        /** Iterates over a block of code, similar to a "for" loop. */
        Loop = new Loop(this);

        constructor(parent: NamespaceObject) {
            super(parent, "ControlFlow");
        }

        onInit() {
            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Represents the "if" logical statement.
      */
    export class If extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.ControlFlow, "If", "if $condition then $block");
        }

        onInit() {
            // Setup the expected parameters:

            var sys = this.script.System;

            this.defineParameter("condition", [sys.Boolean]);
            this.defineParameter("block", [sys.CodeBlock]);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Represents the "if..else" logical statement.
      */
    export class IfElse extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.ControlFlow, "IfElse", "if $condition then $block1 else $block2");
        }

        onInit() {
            // Setup the expected parameters:

            var sys = this.script.System;

            this.defineParameter("condition", [sys.Boolean]);
            this.defineParameter("block1", [sys.CodeBlock]);
            this.defineParameter("block2", [sys.CodeBlock]);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Represents the "while..do" loop.
      */
    export class While extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.ControlFlow, "While", "while $condition do $block");
        }

        onInit() {
            // Setup the expected parameters:

            var sys = this.script.System;

            this.defineParameter("condition", [sys.Boolean]);
            this.defineParameter("block", [sys.CodeBlock]);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Represents the "do..while" loop.
      */
    export class DoWhile extends Component { // TODO: Consider a do...while that also can execute update code before the body, and embeds the body in an "if" statement, and fixes to "while(true) until breakout".
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.ControlFlow, "DoWhile", "do $block while $condition");
        }

        onInit() {
            // Setup the expected parameters:

            var sys = this.script.System;

            this.defineParameter("block", [sys.CodeBlock]);
            this.defineParameter("condition", [sys.Boolean]);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Iterates over a block of code, similar to a "for" loop.
      */
    export class Loop extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.ControlFlow, "Loop", "for ($init; $condition; $update) $block");
        }

        onInit() {
            // Setup the expected parameters:

            var sys = this.script.System;

            this.defineParameter("init", [sys.CodeBlock]);
            this.defineParameter("condition", [sys.Boolean]);
            this.defineParameter("block", [sys.CodeBlock]);
            this.defineParameter("update", [sys.CodeBlock]);

            super.onInit();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
