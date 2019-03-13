// ############################################################################################################################
//? Note display examples: [№|$|#|"|○|…|*]  /  (numerical expected) <conditional expected> {code block expected} /** comment */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/** The core namespace contains all the very basic low level components that can be used as building blocks.
  * You can think of them as the individual "Lego" pieces that would be use to create the larger parts of a more complex design.
  */
var FlowScript;
(function (FlowScript) {
    var Core;
    (function (Core) {
        // ========================================================================================================================
        // Core Value Types
        /** A script based type that matches all other types. */
        var Any = /** @class */ (function (_super) {
            __extends(Any, _super);
            function Any(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Any", "$Any") || this;
            }
            Any.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            Any.prototype.assignableTo = function (type) {
                return true;
            };
            return Any;
        }(FlowScript.Component));
        Core.Any = Any;
        var Boolean = /** @class */ (function (_super) {
            __extends(Boolean, _super);
            function Boolean(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Boolean", "Boolean($?value)") || this;
            }
            Boolean.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.String);
                _super.prototype.init.call(this);
            };
            Boolean.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Boolean;
        }(FlowScript.Component));
        Core.Boolean = Boolean;
        var String = /** @class */ (function (_super) {
            __extends(String, _super);
            function String(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "String", "String($?value)") || this;
            }
            String.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.String);
                _super.prototype.init.call(this);
            };
            String.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
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
                return _super.prototype.assignableTo.call(this, type);
            };
            return String;
        }(FlowScript.Component));
        Core.String = String;
        var Double = /** @class */ (function (_super) {
            __extends(Double, _super);
            function Double(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Double", "Double($?value)") || this;
            }
            Double.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.Double);
                _super.prototype.init.call(this);
            };
            Double.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.DateTime.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Double;
        }(FlowScript.Component));
        Core.Double = Double;
        var Currency = /** @class */ (function (_super) {
            __extends(Currency, _super);
            function Currency(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Currency", "Currency($?value)") || this;
            }
            Currency.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.Currency);
                _super.prototype.init.call(this);
            };
            Currency.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Currency;
        }(FlowScript.Component));
        Core.Currency = Currency;
        var Integer = /** @class */ (function (_super) {
            __extends(Integer, _super);
            function Integer(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Integer", "Integer($?value)") || this;
            }
            Integer.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.Integer);
                _super.prototype.init.call(this);
            };
            Integer.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Boolean.fullTypeName:
                    case this.script.System.Integer.fullTypeName:
                    case this.script.System.Double.fullTypeName:
                    case this.script.System.Currency.fullTypeName:
                    case this.script.System.String.fullTypeName:
                    case this.script.System.DateTime.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Integer;
        }(FlowScript.Component));
        Core.Integer = Integer;
        var DateTime = /** @class */ (function (_super) {
            __extends(DateTime, _super);
            function DateTime(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "DateTime", "DateTime($?value)") || this;
            }
            DateTime.prototype.init = function () {
                this.defineParameter("value", [this.script.System.Double, this.script.System.Integer, this.script.System.String, this.script.System.DateTime]);
                this.defineDefaultReturnVar(this.script.System.DateTime);
                _super.prototype.init.call(this);
            };
            DateTime.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
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
                return _super.prototype.assignableTo.call(this, type);
            };
            return DateTime;
        }(FlowScript.Component));
        Core.DateTime = DateTime;
        var Object = /** @class */ (function (_super) {
            __extends(Object, _super);
            function Object(parent, superType, title) {
                if (title === void 0) { title = "Object($?value)"; }
                var _this = _super.call(this, parent, FlowScript.ComponentTypes.Type, "Object", title) || this;
                if (superType)
                    _this.superType = superType;
                return _this;
            }
            Object.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.Object);
                _super.prototype.init.call(this);
            };
            Object.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Object;
        }(FlowScript.Component));
        Core.Object = Object;
        /** Represents an array of items.
          * Arrays are templates, which default to arrays of "Any" type.  When creating arrays, call "{Type}.createTemplateType()"
          * to set the type of each item.
          */
        var Array = /** @class */ (function (_super) {
            __extends(Array, _super);
            function Array(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Array", "Array($?Array)") || this;
            }
            Array.prototype.init = function (defaultType, expectedBaseType) {
                this.defineTemplateParameter("T", defaultType, expectedBaseType);
                this.defineDefaultReturnVar(this.script.System.Array);
                _super.prototype.init.call(this);
            };
            Array.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Array.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Array;
        }(FlowScript.Component));
        Core.Array = Array;
        var RegEx = /** @class */ (function (_super) {
            __extends(RegEx, _super);
            function RegEx(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Unary, "Regex", "Regex($?RegEx)") || this;
            }
            RegEx.prototype.init = function () {
                this.defineDefaultReturnVar(this.script.System.RegEx);
                _super.prototype.init.call(this);
            };
            RegEx.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.RegEx.fullTypeName:
                    case this.script.System.Object.fullTypeName:
                    case this.script.System.String.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return RegEx;
        }(FlowScript.Component));
        Core.RegEx = RegEx;
        var Property = /** @class */ (function (_super) {
            __extends(Property, _super);
            function Property(parent) {
                return _super.call(this, parent, "Property") || this;
            }
            Property.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            Property.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.Property.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return Property;
        }(FlowScript.Type));
        Core.Property = Property;
        var CodeBlock = /** @class */ (function (_super) {
            __extends(CodeBlock, _super);
            function CodeBlock(parent) {
                return _super.call(this, parent, "CodeBlock") || this;
            }
            CodeBlock.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            CodeBlock.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.CodeBlock.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return CodeBlock;
        }(FlowScript.Type));
        Core.CodeBlock = CodeBlock;
        var FunctionalComponent = /** @class */ (function (_super) {
            __extends(FunctionalComponent, _super);
            function FunctionalComponent(parent) {
                return _super.call(this, parent, "FunctionalComponent") || this;
            }
            FunctionalComponent.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            FunctionalComponent.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.FunctionalComponent.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return FunctionalComponent;
        }(FlowScript.Type));
        Core.FunctionalComponent = FunctionalComponent;
        var ExpressionList = /** @class */ (function (_super) {
            __extends(ExpressionList, _super);
            function ExpressionList(parent) {
                return _super.call(this, parent, "ExpressionList") || this;
            }
            ExpressionList.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            ExpressionList.prototype.assignableTo = function (type) {
                if (typeof type !== 'object' || !(type instanceof FlowScript.Component))
                    return false;
                switch (type.fullTypeName) {
                    case this.script.System.ExpressionList.fullTypeName:
                        return true;
                }
                return _super.prototype.assignableTo.call(this, type);
            };
            return ExpressionList;
        }(FlowScript.Type));
        Core.ExpressionList = ExpressionList;
        var System = /** @class */ (function (_super) {
            __extends(System, _super);
            function System(script) {
                var _this = _super.call(this, script, "System") || this;
                script.System = _this; // (this reference needs to exist before settings the other types)
                _this.Any = new Any(_this);
                _this.Boolean = new Boolean(_this);
                _this.String = new String(_this);
                _this.Double = new Double(_this);
                _this.Currency = new Currency(_this);
                _this.Integer = new Integer(_this);
                _this.DateTime = new DateTime(_this);
                _this.Object = new Object(_this);
                _this.Array = new Array(_this);
                _this.RegEx = new RegEx(_this);
                _this.Property = new Property(_this);
                _this.CodeBlock = new CodeBlock(_this); // (a block of script)
                _this.FunctionalComponent = new FunctionalComponent(_this);
                _this.Event = new Core.Event(_this);
                _this.Assign = new Assign(_this);
                _this.Accessor = new Accessor(_this);
                _this.With = new With(_this);
                _this.WithCall = new WithCall(_this);
                _this.PreIncrement = new PreIncrement(_this);
                _this.PostIncrement = new PostIncrement(_this);
                _this.PreDecrement = new PreDecrement(_this);
                _this.PostDecrement = new PostDecrement(_this);
                _this.Math = new Core.Math.Math(_this);
                _this.Binary = new Core.Binary.Binary(_this);
                _this.ControlFlow = new Core.ControlFlow.ControlFlow(_this);
                _this.Comparison = new Core.Comparison.Comparison(_this);
                _this.Code = new Code(_this);
                _this.ExpressionList = new ExpressionList(_this);
                return _this;
            }
            System.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            return System;
        }(FlowScript.Type));
        Core.System = System;
        // ========================================================================================================================
        var Main = /** @class */ (function (_super) {
            __extends(Main, _super);
            function Main(script) {
                return _super.call(this, script, FlowScript.ComponentTypes.Functional, "Main", null) || this;
            }
            Main.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            return Main;
        }(FlowScript.Component));
        Core.Main = Main;
        // ========================================================================================================================
        // Core components
        // ========================================================================================================================
        var Operator = /** @class */ (function (_super) {
            __extends(Operator, _super);
            function Operator(parent, typeName, title, isUnary) {
                if (isUnary === void 0) { isUnary = false; }
                var _this = _super.call(this, parent, isUnary ? FlowScript.ComponentTypes.Unary : FlowScript.ComponentTypes.Operation, typeName, title) || this;
                _this._typeMapping = [];
                return _this;
            }
            Operator.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            Operator.prototype.addTypeMap = function (result) {
                var ifTypes = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    ifTypes[_i - 1] = arguments[_i];
                }
                this._typeMapping.push({ result: result, ifTypes: ifTypes });
            };
            /** Returns the resulting type when given the specified arguments. */
            Operator.prototype.getResultTypeWhen = function (args) {
                if (typeof args !== 'object' || !args.length)
                    return FlowScript.undefined;
                mapSearch: for (var i = 0, n = this._typeMapping.length; i < n; ++i) {
                    for (var i2 = 0, types = this._typeMapping[i].ifTypes, n2 = types.length; i2 < n2 && i2 < args.length; ++i2)
                        if (!types[i2].is(args[i2]))
                            continue mapSearch;
                    return this._typeMapping[i].result;
                }
                return FlowScript.undefined;
            };
            return Operator;
        }(FlowScript.Component));
        Core.Operator = Operator;
        // ========================================================================================================================
        var Comment = /** @class */ (function (_super) {
            __extends(Comment, _super);
            function Comment(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.Comment, "Comment", "/** $comment */") || this;
            }
            Comment.prototype.init = function () {
                var script = this.script;
                // Setup the expected parameters and return types:
                this.defineParameter("comment", [script.System.String]);
                _super.prototype.init.call(this);
            };
            return Comment;
        }(FlowScript.Component));
        Core.Comment = Comment;
        // ========================================================================================================================
        var Assign = /** @class */ (function (_super) {
            __extends(Assign, _super);
            function Assign(parent) {
                var _this = _super.call(this, parent, "Assign", "$a = $b") || this;
                _this._componentType = FlowScript.ComponentTypes.Assignment;
                return _this;
            }
            Assign.prototype.init = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Property], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.Any]); // (this is "any", but the type must be assignable to 'a' at compile time)
                this.defineDefaultReturnVar(sys.Boolean);
                _super.prototype.init.call(this);
            };
            return Assign;
        }(Operator));
        Core.Assign = Assign;
        // ========================================================================================================================
        var Accessor = /** @class */ (function (_super) {
            __extends(Accessor, _super);
            function Accessor(parent) {
                return _super.call(this, parent, "Accessor", "$a.$b") || this;
            }
            Accessor.prototype.init = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Object], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.String]);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred);
                _super.prototype.init.call(this);
            };
            return Accessor;
        }(Operator));
        Core.Accessor = Accessor;
        // ========================================================================================================================
        var With = /** @class */ (function (_super) {
            __extends(With, _super);
            function With(parent) {
                return _super.call(this, parent, FlowScript.ComponentTypes.CodeBlock, "With", "with $a do $b") || this;
            }
            With.prototype.init = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Object], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.CodeBlock]);
                this.instanceType = sys.Object;
                this.defineDefaultReturnVar(FlowScript.Type.Inferred);
                _super.prototype.init.call(this);
            };
            return With;
        }(FlowScript.Component));
        Core.With = With;
        // ========================================================================================================================
        var WithCall = /** @class */ (function (_super) {
            __extends(WithCall, _super);
            function WithCall(parent) {
                return _super.call(this, parent, "WithCall", "with $a call $b") || this;
            }
            WithCall.prototype.init = function () {
                // Setup the expected parameters and return types:
                var sys = this.script.System;
                this.defineParameter("a", [sys.Object], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineParameter("b", [sys.FunctionalComponent]);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred);
                _super.prototype.init.call(this);
            };
            return WithCall;
        }(Operator));
        Core.WithCall = WithCall;
        // ========================================================================================================================
        var PreIncrement = /** @class */ (function (_super) {
            __extends(PreIncrement, _super);
            function PreIncrement(parent) {
                return _super.call(this, parent, "PreIncrement", "++$n", true) || this;
            }
            PreIncrement.prototype.init = function () {
                // Setup the expected parameters and return type:
                var sys = this.script.System;
                this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                _super.prototype.init.call(this);
            };
            return PreIncrement;
        }(Operator));
        Core.PreIncrement = PreIncrement;
        var PostIncrement = /** @class */ (function (_super) {
            __extends(PostIncrement, _super);
            function PostIncrement(parent) {
                var _this = _super.call(this, parent, "PostIncrement", "$n++", true) || this;
                // Setup the expected parameters and return type:
                var sys = _this.script.System;
                _this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                _this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                return _this;
            }
            PostIncrement.prototype.init = function () {
                _super.prototype.init.call(this);
            };
            return PostIncrement;
        }(Operator));
        Core.PostIncrement = PostIncrement;
        var PreDecrement = /** @class */ (function (_super) {
            __extends(PreDecrement, _super);
            function PreDecrement(parent) {
                return _super.call(this, parent, "PreDecrement", "--$n", true) || this;
            }
            PreDecrement.prototype.init = function () {
                // Setup the expected parameters and return type:
                var sys = this.script.System;
                this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                _super.prototype.init.call(this);
            };
            return PreDecrement;
        }(Operator));
        Core.PreDecrement = PreDecrement;
        var PostDecrement = /** @class */ (function (_super) {
            __extends(PostDecrement, _super);
            function PostDecrement(parent) {
                return _super.call(this, parent, "PostDecrement", "$n--", true) || this;
            }
            PostDecrement.prototype.init = function () {
                // Setup the expected parameters and return type:
                var sys = this.script.System;
                this.defineParameter("n", [sys.Double, sys.Integer], FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, FlowScript.undefined, true);
                this.defineDefaultReturnVar(FlowScript.Type.Inferred); // ("inferred" means to invoke the type map to determine the resulting type base on supplied arguments)
                _super.prototype.init.call(this);
            };
            return PostDecrement;
        }(Operator));
        Core.PostDecrement = PostDecrement;
        /** Represents a custom block of JavaScript code.
          * Note: JavaScript code must exist, even if just an empty string, otherwise the simulator will fail when this component is reached.
          */
        var Code = /** @class */ (function (_super) {
            __extends(Code, _super);
            function Code(parent) {
                var _this = _super.call(this, parent, FlowScript.ComponentTypes.Type, "Code", "Code($code)") || this;
                _this.CodeLanguages = new FlowScript.Enum(_this, "CodeLanguages", { JavaScript: "JavaScript", CSharp: "CSharp", VB: "VB" });
                return _this;
            }
            Code.prototype.init = function () {
                var sys = this.script.System;
                this.defineParameter("code", [sys.String]);
                _super.prototype.init.call(this);
            };
            Code.FUNCTION_CONTENTS_REGEX = /^function .*{([^\0]*?)}$/;
            Code.PROPERTY_TOKEN_REGEX = /\$\$|\$[a-zA-Z_][a-zA-Z0-9_]*/gi; // (no optional '?' flag allowed in this one)
            return Code;
        }(FlowScript.Component));
        Core.Code = Code;
        // ========================================================================================================================
    })(Core = FlowScript.Core || (FlowScript.Core = {}));
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Core.js.map