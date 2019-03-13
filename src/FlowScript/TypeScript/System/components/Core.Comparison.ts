// ############################################################################################################################

/** Contains components used for comparisons.
  */
module FlowScript.Core.Comparison {

    /** Defines the Comparison namespace type. */
    export class Comparison extends NamespaceObject {

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

        constructor(parent: NamespaceObject) {
            super(parent, "Comparison");
        }

        onInit() {
            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value equals another.
      */
    export class Equals extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "Equals", "$a == $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value AND its type equals another. 
      */
    export class StrictEquals extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "StrictEquals", "$a === $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value does NOT equal another.
      */
    export class NotEquals extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "NotEquals", "$a != $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value AND its type do NOT equal another. 
      */
    export class StrictNotEquals extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "StrictNotEquals", "$a !== $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is less than another. 
      */
    export class LessThan extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "LessThan", "$a < $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is greater than another. 
      */
    export class GreaterThan extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "GreaterThan", "$a > $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is less than or equal to another. 
      */
    export class LessThanOrEqual extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "LessThanOrEqual", "$a <= $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Tests if one value is greater than or equal to another. 
      */
    export class GreaterThanOrEqual extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "GreaterThanOrEqual", "$a >= $b");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [NamespaceObject.All]);
            this.defineParameter("b", [NamespaceObject.All]);

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
