// ############################################################################################################################

module FlowScript.Core.Math {
    // ========================================================================================================================
    // Core Math Components
    // ========================================================================================================================

    /** Defines the Math namespace type. */
    export class Math extends NamespaceObject { // (a type that is inferred by the given arguments)

        /** Add numerical values, or concatenate strings. */
        Add = new Add(this);

        /** Multiple two numerical values. */
        Multiply = new Multiply(this);

        SQRT = new SQRT(this);

        constructor(parent: NamespaceObject) {
            super(parent, "Math");
        }

        onInit() {
            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Adds two values.
      */
    export class Add extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "Add", "$a + $b"); // (#|$) + (#|$)
        }

        onInit() {
            var sys = this.script.System;

            this.addTypeMap(sys.Integer, sys.Boolean, sys.Boolean);
            this.addTypeMap(sys.Currency, sys.Boolean, sys.Currency);
            this.addTypeMap(sys.DateTime, sys.Boolean, sys.DateTime);
            this.addTypeMap(sys.Double, sys.Boolean, sys.Double);
            this.addTypeMap(sys.Integer, sys.Boolean, sys.Integer);

            this.addTypeMap(sys.Currency, sys.Currency, sys.Boolean);
            this.addTypeMap(sys.Currency, sys.Currency, sys.Currency);
            this.addTypeMap(sys.Currency, sys.Currency, sys.Double);
            this.addTypeMap(sys.Currency, sys.Currency, sys.Integer);

            this.addTypeMap(sys.DateTime, sys.DateTime, sys.Boolean);
            this.addTypeMap(sys.DateTime, sys.DateTime, sys.DateTime);
            this.addTypeMap(sys.DateTime, sys.DateTime, sys.Double);
            this.addTypeMap(sys.DateTime, sys.DateTime, sys.Integer);

            this.addTypeMap(sys.Integer, sys.Double, sys.Boolean);
            this.addTypeMap(sys.Currency, sys.Double, sys.Currency);
            this.addTypeMap(sys.DateTime, sys.Double, sys.DateTime);
            this.addTypeMap(sys.Double, sys.Double, sys.Double);
            this.addTypeMap(sys.Double, sys.Double, sys.Integer);

            this.addTypeMap(sys.Integer, sys.Integer, sys.Boolean);
            this.addTypeMap(sys.Currency, sys.Integer, sys.Currency);
            this.addTypeMap(sys.DateTime, sys.Integer, sys.DateTime);
            this.addTypeMap(sys.Double, sys.Integer, sys.Double);
            this.addTypeMap(sys.Integer, sys.Integer, sys.Integer);

            this.addTypeMap(sys.String, sys.String, NamespaceObject.All);
            this.addTypeMap(sys.String, NamespaceObject.All, sys.String);

            this.addTypeMap(sys.Any, sys.Any, NamespaceObject.All);
            this.addTypeMap(sys.Any, NamespaceObject.All, sys.Any);

            // Setup the expected parameters and return type:

            this.defineParameter("a", [sys.Any]);
            this.defineParameter("b", [sys.Any]);

            this.defineDefaultReturnVar(NamespaceObject.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** Multiply two values.
      */
    export class Multiply extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "Multiply", "$a * $b"); // (#|$) * (#|$)
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Double, sys.Integer]);
            this.defineParameter("b", [sys.Double, sys.Integer]);

            this.defineDefaultReturnVar(NamespaceObject.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)

            super.onInit();
        }
    }

    // ========================================================================================================================

    /** get the square root of a value.
      */
    export class SQRT extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "SQRT", "√$a");
        }

        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Double, sys.Integer]);

            this.defineDefaultReturnVar(sys.Double);

            super.onInit();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
