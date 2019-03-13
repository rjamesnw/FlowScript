// ############################################################################################################################
//? Note display examples: [№|$|#|"|○|…|*]  /  (numerical expected) <conditional expected> {code block expected} /** comment */

/** The core namespace contains all the very basic low level components that can be used as building blocks.
  * You can think of them as the individual "Lego" pieces that would be use to create the larger parts of a more complex design.
  */
namespace FlowScript.Core {
    // ========================================================================================================================
    // Core Value Types

    /** A script based type that matches all other types. */
    export class Any extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Any", "$Any");
        }
        onInit() {
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            return true;
        }
    }

    export class Boolean extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Boolean", "Boolean($?value)");
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.String);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Boolean.fullTypeName:
                case this.script.System.Integer.fullTypeName:
                case this.script.System.Double.fullTypeName:
                case this.script.System.Currency.fullTypeName:
                case this.script.System.String.fullTypeName:
                case this.script.System.Object.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class String extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "String", "String($?value)");
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.String);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Boolean.fullTypeName:
                case this.script.System.Integer.fullTypeName:
                case this.script.System.Double.fullTypeName:
                case this.script.System.Currency.fullTypeName:
                case this.script.System.String.fullTypeName:
                case this.script.System.DateTime.fullTypeName:
                case this.script.System.RegEx.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class Double extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Double", "Double($?value)");
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.Double);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Boolean.fullTypeName:
                case this.script.System.Integer.fullTypeName:
                case this.script.System.Double.fullTypeName:
                case this.script.System.Currency.fullTypeName:
                case this.script.System.String.fullTypeName:
                case this.script.System.DateTime.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class Currency extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Currency", "Currency($?value)");
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.Currency);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Boolean.fullTypeName:
                case this.script.System.Integer.fullTypeName:
                case this.script.System.Double.fullTypeName:
                case this.script.System.Currency.fullTypeName:
                case this.script.System.String.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class Integer extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Integer", "Integer($?value)");
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.Integer);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Boolean.fullTypeName:
                case this.script.System.Integer.fullTypeName:
                case this.script.System.Double.fullTypeName:
                case this.script.System.Currency.fullTypeName:
                case this.script.System.String.fullTypeName:
                case this.script.System.DateTime.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class DateTime extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "DateTime", "DateTime($?value)");
        }
        onInit() {
            this.defineParameter("value", [this.script.System.Double, this.script.System.Integer, this.script.System.String, this.script.System.DateTime]);
            this.defineDefaultReturnVar(this.script.System.DateTime);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Boolean.fullTypeName:
                case this.script.System.Integer.fullTypeName:
                case this.script.System.Double.fullTypeName:
                case this.script.System.Currency.fullTypeName:
                case this.script.System.String.fullTypeName:
                case this.script.System.Object.fullTypeName:
                case this.script.System.DateTime.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class FSObject extends Component {

        constructor(parent: NamespaceObject, superType?: FSObject, title: string = "Object($?value)") {
            super(parent, ComponentTypes.Type, "Object", title);
            if (superType)
                this.superType = superType;
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.Object);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Object.fullTypeName:
                case this.script.System.String.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    /** Represents an array of items.
      * Arrays are templates, which default to arrays of "Any" type.  When creating arrays, call "{Type}.createTemplateType()"
      * to set the type of each item.
      */
    export class Array extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Array", "Array($?Array)");
        }
        onInit(defaultType?: NamespaceObject, expectedBaseType?: NamespaceObject) {
            this.defineTemplateParameter("T", defaultType, expectedBaseType);
            this.defineDefaultReturnVar(this.script.System.Array);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Array.fullTypeName:
                case this.script.System.Object.fullTypeName:
                case this.script.System.String.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class RegEx extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Unary, "Regex", "Regex($?RegEx)");
        }
        onInit() {
            this.defineDefaultReturnVar(this.script.System.RegEx);
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.RegEx.fullTypeName:
                case this.script.System.Object.fullTypeName:
                case this.script.System.String.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class Property extends NamespaceObject {
        constructor(parent: NamespaceObject) {
            super(parent, "Property");
        }
        onInit() {
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.Property.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class CodeBlock extends NamespaceObject { // (a block of script)
        constructor(parent: NamespaceObject) {
            super(parent, "CodeBlock");
        }
        onInit() {
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.CodeBlock.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class FunctionalComponent extends NamespaceObject {
        constructor(parent: NamespaceObject) {
            super(parent, "FunctionalComponent");
        }
        onInit() {
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.FunctionalComponent.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class ExpressionList extends NamespaceObject { // (eg: '(x=1,y=x, z=y)')
        constructor(parent: NamespaceObject) {
            super(parent, "ExpressionList");
        }
        onInit() {
            super.onInit();
        }
        assignableTo(type: Component): boolean {
            if (typeof type !== 'object' || !(type instanceof Component)) return false;
            switch (type.fullTypeName) {
                case this.script.System.ExpressionList.fullTypeName:
                    return true;
            }
            return super.assignableTo(type);
        }
    }

    export class System extends NamespaceObject { // (a type that is inferred by the given arguments)
        // *** Contains all the basic/primitive system types ***

        /** Represents all types. */
        Any: Any;
        /** Represents a boolean (true/false) type. */
        Boolean: Boolean;
        /** Represents a string of characters. */
        String: String;
        /** Represents a 64-bit floating point number. */
        Double: Double;
        /** Represents currency using higher precision that a double type. */
        Currency: Currency;
        /** Represents a whole number. */
        Integer: Integer;
        /** Represents the date and time in the form of a double value. */
        DateTime: DateTime;
        /** Represents a regular expression object. */
        Object: FSObject;
        /** Represents a one dimensional array object. */
        Array: Array;
        /** Represents a regular expression object. */
        RegEx: RegEx;

        /** Represents a property type reference. */
        Property: Property;
        /** Represents a block of script, usually representing code to execute when a condition or event occurs. */
        CodeBlock: CodeBlock; // (a block of script)
        /** Represents a callable component. */
        FunctionalComponent: FunctionalComponent;
        /** Represents an asynchronous callback event that can be triggered at a future time.
          * Note: It is possible for events to be synchronous in certain cases, but they should be treated as though they are not.
          */
        Event: Event;

        /** Assign a parameter, local variable, or return target with the value of a given expression. */
        Assign: Assign;

        /** Used to access properties of an object. */
        Accessor: Accessor;

        /** Execute a block of lines within the context of a given object. 
          * Each statement in the block is checked if the object is a direct parent object, and if so, invokes the call using
          * the object as the "this" context.
          */
        With: With;

        /** Execute a functional component call using the context of a given object.  The call is invoked using the object as
          * the "this" context.
          */
        WithCall: WithCall;

        PreIncrement: PreIncrement;
        PostIncrement: PostIncrement;
        PreDecrement: PreDecrement;
        PostDecrement: PostDecrement;

        //?ToBoolean: ToBoolean;
        //?ToDouble: ToDouble;
        //?ToInt: ToInt;
        //?ToString: ToString;

        /** The Math namespace contains mathematical related component types. */
        Math: Math.Math;

        /** The binary namespace contains binary related component types. */
        Binary: Binary.Binary;

        /** Contains statements for controlling script execution flow. */
        ControlFlow: ControlFlow.ControlFlow;

        /** Contains statements for comparing values. */
        Comparison: Comparison.Comparison;

        /** Contains components for rendering HTML. */
        HTML: DOM.HTML;

        /** Represents a custom code block. */
        Code: Code;

        /** Represents a list of expressions (eg. '(x=1, y=x, z=y)). */
        ExpressionList: ExpressionList;

        constructor(script: IFlowScript) {
            super(script, "System");

            script.System = this; // (this reference needs to exist before settings the other types)

            this.Any = new Any(this);
            this.Boolean = new Boolean(this);
            this.String = new String(this);
            this.Double = new Double(this);
            this.Currency = new Currency(this);
            this.Integer = new Integer(this);
            this.DateTime = new DateTime(this);
            this.Object = new FSObject(this);
            this.Array = new Array(this);
            this.RegEx = new RegEx(this);

            this.Property = new Property(this);
            this.CodeBlock = new CodeBlock(this); // (a block of script)
            this.FunctionalComponent = new FunctionalComponent(this);
            this.Event = new Event(this);

            this.Assign = new Assign(this);
            this.Accessor = new Accessor(this);

            this.With = new With(this);
            this.WithCall = new WithCall(this);

            this.PreIncrement = new PreIncrement(this);
            this.PostIncrement = new PostIncrement(this);
            this.PreDecrement = new PreDecrement(this);
            this.PostDecrement = new PostDecrement(this);

            this.Math = new Math.Math(this);

            this.Binary = new Binary.Binary(this);

            this.ControlFlow = new ControlFlow.ControlFlow(this);

            this.Comparison = new Comparison.Comparison(this);

            this.Code = new Code(this);

            this.ExpressionList = new ExpressionList(this);
        }

        onInit() {
            super.onInit();
        }
    }

    // ========================================================================================================================

    export class Main extends Component {
        constructor(typeName = "Main", signatureTitle: string = null, script?: IFlowScript) {
            super(script, ComponentTypes.Functional, typeName, signatureTitle);
        }
        onInit() {
            super.onInit();
        }
    }

    // ========================================================================================================================
    // Core components
    // ========================================================================================================================

    export class Operator extends Component {
        private _typeMapping: { result: NamespaceObject; ifTypes: NamespaceObject[] }[] = [];
        constructor(parent: NamespaceObject, typeName: string, title: string, isUnary: boolean = false) {
            super(parent, isUnary ? ComponentTypes.Unary : ComponentTypes.Operation, typeName, title);
        }
        onInit() {
            super.onInit();
        }
        addTypeMap(result: NamespaceObject, ...ifTypes: NamespaceObject[]) {
            this._typeMapping.push({ result: result, ifTypes: ifTypes });
        }
        /** Returns the resulting type when given the specified arguments. */
        getResultTypeWhen(args: NamespaceObject[]): NamespaceObject {
            if (typeof args !== 'object' || !args.length) return undefined;
            mapSearch: for (var i = 0, n = this._typeMapping.length; i < n; ++i) {
                for (var i2 = 0, types = this._typeMapping[i].ifTypes, n2 = types.length; i2 < n2 && i2 < args.length; ++i2)
                    if (!types[i2].is(args[i2]))
                        continue mapSearch;
                return this._typeMapping[i].result;
            }
            return undefined;
        }
    }

    // ========================================================================================================================

    export class Comment extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Comment, "Comment", "/** $comment */");
        }
        onInit() {
            var script = this.script;
            // Setup the expected parameters and return types:
            this.defineParameter("comment", [script.System.String]);
            super.onInit();
        }
    }

    // ========================================================================================================================

    export class Assign extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "Assign", "$a = $b");
            this._componentType = ComponentTypes.Assignment;
        }
        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Property], undefined, undefined, undefined, undefined, true);
            this.defineParameter("b", [sys.Any]);  // (this is "any", but the type must be assignable to 'a' at compile time)

            this.defineDefaultReturnVar(sys.Boolean);

            super.onInit();
        }
    }

    // ========================================================================================================================

    export class Accessor extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "Accessor", "$a.$b");
        }
        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Object], undefined, undefined, undefined, undefined, true);
            this.defineParameter("b", [sys.String]);

            this.defineDefaultReturnVar(NamespaceObject.Inferred);

            super.onInit();
        }
    }

    // ========================================================================================================================

    export class With extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.CodeBlock, "With", "with $a do $b"); // using the object referenced by '$a', execute expression '$b' (which may reference properties of '$a' as a shortcut)
        }
        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Object], undefined, undefined, undefined, undefined, true);
            this.defineParameter("b", [sys.CodeBlock]);

            this.instanceType = sys.Object;

            this.defineDefaultReturnVar(NamespaceObject.Inferred);

            super.onInit();
        }
    }

    // ========================================================================================================================

    export class WithCall extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "WithCall", "with $a call $b");
        }
        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineParameter("a", [sys.Object], undefined, undefined, undefined, undefined, true);
            this.defineParameter("b", [sys.FunctionalComponent]);

            this.defineDefaultReturnVar(NamespaceObject.Inferred);

            super.onInit();
        }
    }

    // ========================================================================================================================

    export class PreIncrement extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "PreIncrement", "++$n", true);
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("n", [sys.Double, sys.Integer], undefined, undefined, undefined, undefined, true);

            this.defineDefaultReturnVar(NamespaceObject.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)

            super.onInit();
        }
    }

    export class PostIncrement extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "PostIncrement", "$n++", true);
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("n", [sys.Double, sys.Integer], undefined, undefined, undefined, undefined, true);

            this.defineDefaultReturnVar(NamespaceObject.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
        }
        onInit() {
            super.onInit();
        }
    }

    export class PreDecrement extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "PreDecrement", "--$n", true);
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("n", [sys.Double, sys.Integer], undefined, undefined, undefined, undefined, true);

            this.defineDefaultReturnVar(NamespaceObject.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)

            super.onInit();
        }
    }

    export class PostDecrement extends Operator {
        constructor(parent: NamespaceObject) {
            super(parent, "PostDecrement", "$n--", true);
        }
        onInit() {
            // Setup the expected parameters and return type:

            var sys = this.script.System;

            this.defineParameter("n", [sys.Double, sys.Integer], undefined, undefined, undefined, undefined, true);

            this.defineDefaultReturnVar(NamespaceObject.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)

            super.onInit();
        }
    }

    // ========================================================================================================================

    ///** Returns the inverse of the given boolean value.
    //  */
    //?export class ToBoolean extends Operator {
    //    constructor(parent: Type) {
    //        super(parent, "bool($a)", true);

    //        var sys = this.script.System;

    //        // Setup the expected parameters and return types:

    //        this.defineParameter("a", [sys.Any]);

    //        this.defineReturn(null, sys.Boolean);
    //    }
    //init() {
    //    super.init();
    //}
    //}

    //// ========================================================================================================================

    ///** Returns the inverse of the given boolean value.
    //  */
    //?export class ToInt extends Operator {
    //    constructor(parent: Type) {
    //        super(parent, "int($a)", true);

    //        var sys = this.script.System;

    //        // Setup the expected parameters and return types:

    //        this.defineParameter("a", [sys.Any]);

    //        this.defineReturn(null, sys.Integer);
    //    }
    //init() {
    //    super.init();
    //}
    //}
    //// ========================================================================================================================

    ///** Returns the inverse of the given boolean value.
    //  */
    //?export class ToDouble extends Operator {
    //    constructor(parent: Type) {
    //        super(parent, "double($a)", true);

    //        var sys = this.script.System;

    //        // Setup the expected parameters and return types:

    //        this.defineParameter("a", [sys.Any]);

    //        this.defineReturn(null, sys.Double);
    //    }
    //init() {
    //    super.init();
    //}
    //}
    //}

    //// ========================================================================================================================

    ///** Returns the inverse of the given boolean value.
    //  */
    //?export class ToString extends Operator {
    //    constructor(parent: Type) {
    //        super(parent, "string($a)", true);

    //        var sys = this.script.System;

    //        // Setup the expected parameters and return types:

    //        this.defineParameter("a", [sys.Any]);

    //        this.defineReturn(null, sys.String);
    //    }
    //init() {
    //    super.init();
    //}
    //}
    //}

    // ========================================================================================================================

    export interface ICodeLanguages {
        [name: string]: string;
        JavaScript: string;
        CSharp: string;
        VB: string;
    }

    /** Represents a custom block of JavaScript code.
      * Note: JavaScript code must exist, even if just an empty string, otherwise the simulator will fail when this component is reached.
      */
    export class Code extends Component {
        static FUNCTION_CONTENTS_REGEX = /^function .*{([^\0]*?)}$/;
        static PROPERTY_TOKEN_REGEX = /\$\$|\$[a-zA-Z_][a-zA-Z0-9_]*/gi; // (no optional '?' flag allowed in this one)

        CodeLanguages = new Enum<ICodeLanguages>(this, "CodeLanguages", { JavaScript: "JavaScript", CSharp: "CSharp", VB: "VB" });

        Code: string;

        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Type, "Code", "Code($code)");
        }
        onInit() {
            var sys = this.script.System;
            this.defineParameter("code", [sys.String]);
            super.onInit();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################

namespace FlowScript.Components {

    export interface IType {
        name: string;
        types?: ITypes;
        components?: IComponents;
        tip?: string;
    }

    export interface ITypes {
        [index: string]: IComponent | IType;
    }

    export interface IParameter {
        name: string;
        /** Comma separated list of valid types for this property. */
        types: string;
        /** True if this property is an alias for another property. */
        isAlias: boolean;
        tip?: string;
    }

    export interface IParameters {
        [index: string]: IParameter;
    }

    export interface IComponent extends IType {
        title?: string;
        componentType?: ComponentTypes;
        parameters?: IParameters;
        returnType?: string;
    }

    export interface IComponents extends ITypes {
        [index: string]: IComponent;
    }
}

// ############################################################################################################################
