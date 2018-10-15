// ############################################################################################################################

/** Contains components used for comparisons.
  */
module FlowScript.Core.Comparison {

    /** Defines the Comparison namespace type. */
    export class Comparison extends Type {

        /** Tests if one value equals another. */
        Equals = new Equals(this);

        /** Tests if one value AND its type equals another. */
        StrictEquals = new StrictEquals(this);

        /** Tests if one value does NOT equal another. */
        NotEquals = new NotEquals(this);

        /** Tests if one value AND its type do NOT equal another. */
        StrictNotEquals = new StrictNotEquals(this);

        /** Tests if one value is less than another.  */
        LessThan = new LessThan(this);

        /** Tests if one value is greater than another.  */
        GreaterThan = new GreaterThan(this);

        /** Tests if one value is less than or equal to another. */
        LessThanOrEqual = new LessThanOrEqual(this);

        /** Tests if one value is greater than or equal to another. */
        GreaterThanOrEqual = new GreaterThanOrEqual(this);

        constructor(parent: Type) {
            super(parent, "Comparison");
        }

        init() {
            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value equals another.
      */
    export class Equals extends Operator {
        constructor(parent: Type) {
            super(parent, "Equals", "$a == $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value AND its type equals another. 
      */
    export class StrictEquals extends Operator {
        constructor(parent: Type) {
            super(parent, "StrictEquals", "$a === $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value does NOT equal another.
      */
    export class NotEquals extends Operator {
        constructor(parent: Type) {
            super(parent, "NotEquals", "$a != $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value AND its type do NOT equal another. 
      */
    export class StrictNotEquals extends Operator {
        constructor(parent: Type) {
            super(parent, "StrictNotEquals", "$a !== $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is less than another. 
      */
    export class LessThan extends Operator {
        constructor(parent: Type) {
            super(parent, "LessThan", "$a < $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is greater than another. 
      */
    export class GreaterThan extends Operator {
        constructor(parent: Type) {
            super(parent, "GreaterThan", "$a > $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is less than or equal to another. 
      */
    export class LessThanOrEqual extends Operator {
        constructor(parent: Type) {
            super(parent, "LessThanOrEqual", "$a <= $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is greater than or equal to another. 
      */
    export class GreaterThanOrEqual extends Operator {
        constructor(parent: Type) {
            super(parent, "GreaterThanOrEqual", "$a >= $b");
        }

        init() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [Type.All]);
            this.defineParameter("b", [Type.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.init();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
