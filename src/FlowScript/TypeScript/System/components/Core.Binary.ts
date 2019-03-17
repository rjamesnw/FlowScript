// ############################################################################################################################

namespace FlowScript.Core.Binary {
    // ========================================================================================================================
    // Core Math Components
    // ========================================================================================================================

    /** Defines the Math namespace type. */
    export class Binary extends NamespaceObject { // (a type that is inferred by the given arguments)

        /** Returns the inverse boolean value of a given expression. */
        Not = new Not(this);

        /** Returns the eXclusive OR of a given expression. */
        XOR = new XOR(this);

        /** Shifts all bits of an integer value to the left a number of times. */
        ShiftLeft = new ShiftLeft(this);

        /** Shifts all bits of an integer value to the right a number of times. */
        ShiftRight = new ShiftRight(this);

        constructor(parent: NamespaceObject) {
            super(parent, "Binary");
        }
        onInit() {
            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Returns the inverse of the given boolean value.
      */
    export class Not extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "Not", "not $a", true); // 
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Boolean]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Returns the eXclusive OR of a given value.
      */
    export class XOR extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "XOR", "xor $a", true); // 
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Integer]);

            this.defineDefaultReturnVar(sys.Integer);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Shifts all bits of an integer value to the left a number of times.
      */
    export class ShiftLeft extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "ShiftLeft", "$value << $count"); // 
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("value", [sys.Integer]);
            this.defineParameter("count", [sys.Integer]);

            this.defineDefaultReturnVar(sys.Integer);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Shifts all bits of an integer value to the right a number of times.
      */
    export class ShiftRight extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "ShiftRight", "$value >> $count"); // 
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("value", [sys.Integer]);
            this.defineParameter("count", [sys.Integer]);

            this.defineDefaultReturnVar(sys.Integer);

            super.onInit();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
