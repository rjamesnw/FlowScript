// ############################################################################################################################
// Data Tables
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
    var ColumnAccessLevels;
    (function (ColumnAccessLevels) {
        /** The column can be read from, and written to. */
        ColumnAccessLevels[ColumnAccessLevels["ReadWrite"] = 0] = "ReadWrite";
        /** The column cannot be updated. */
        ColumnAccessLevels[ColumnAccessLevels["ReadOnly"] = 1] = "ReadOnly";
        /** The column is treated as if it doesn't exist. */
        ColumnAccessLevels[ColumnAccessLevels["Hidden"] = 2] = "Hidden";
    })(ColumnAccessLevels = FlowScript.ColumnAccessLevels || (FlowScript.ColumnAccessLevels = {}));
    var Column = /** @class */ (function () {
        function Column() {
            this._accessLevel = ColumnAccessLevels.ReadWrite;
        }
        Object.defineProperty(Column.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Column.prototype, "type", {
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Column.prototype, "accessLevel", {
            get: function () { return this._accessLevel; },
            enumerable: true,
            configurable: true
        });
        return Column;
    }());
    FlowScript.Column = Column;
    var Row = /** @class */ (function () {
        function Row() {
        }
        return Row;
    }());
    FlowScript.Row = Row;
    /** Represents a structure of data, much like a class.
      * Tables exist to replace the concept of class instances in many other languages.  In most cases, programmers create
      * methods/functions to operate on either a data structure (object with properties), or data returned from a database.
      * To mimic classes, a table with one row is created, where the columns are the properties.  As well, columns can be
      * flagged as readonly,
      */
    var Table = /** @class */ (function (_super_1) {
        __extends(Table, _super_1);
        // --------------------------------------------------------------------------------------------------------------------
        function Table(parent, tableName) {
            var _this = _super_1.call(this, parent, tableName) || this;
            _this._columns = [];
            _this._rows = [];
            return _this;
        }
        return Table;
    }(FlowScript.Type));
    FlowScript.Table = Table;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=table.js.map