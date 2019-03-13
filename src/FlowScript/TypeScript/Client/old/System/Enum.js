// ############################################################################################################################
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
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** Represents an enumeration of names and related constant values.
      * Enums can be associated with properties so the developer has to pick from a predefined list of values.
      */
    var Enum = /** @class */ (function (_super) {
        __extends(Enum, _super);
        function Enum(parent, name, values) {
            var _this = _super.call(this, parent, name) || this;
            _this._counter = 0;
            _this.values = {};
            _this.properties = _this.values;
            values && _this.addValue(values);
            return _this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        Enum.prototype.setValue = function (name, value) {
            if (value === void 0)
                value = this._counter++;
            if (name in this.values)
                throw "Enum error: Cannot add duplicate name '" + name + "'.";
            this.values[name] = value;
            // ... try to reference the name by value as well ...
            var valIndex = typeof value == 'string' ? value : '' + value;
            if (valIndex != name) { // (don't overwrite the "name=value" entry!)
                if (valIndex in this.values)
                    throw "Enum error: Name conflict - cannot add reverse lookup for '" + name + "'='" + value + "'.";
                this.values[valIndex] = name;
            }
            return this;
        };
        Enum.prototype.addValue = function (values) {
            if (values && typeof values == 'object')
                for (var p in values)
                    if (Object.prototype.hasOwnProperty.call(values, p))
                        this.values[p] = values[p];
            return this;
        };
        return Enum;
    }(FlowScript.Type));
    FlowScript.Enum = Enum;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Enum.js.map