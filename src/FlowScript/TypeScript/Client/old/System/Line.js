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
    // ========================================================================================================================
    /** A line represents a single execution step in a code block.
      * A line essentially wraps a component, and acts as a single execution step in a code block.
      */
    var Line = /** @class */ (function (_super) {
        __extends(Line, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Line(parent) {
            var _this = _super.call(this, parent ? parent.script : void 0) || this;
            _this._statements = []; // (NOTE: This is an array, but only one statement per line is supported for final output at this time)
            _this._block = parent;
            return _this;
        }
        Object.defineProperty(Line.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._block ? this._block.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "block", {
            /** The block this line belongs to. */
            get: function () { return this._block; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "component", {
            /** The component that owns the code block this line belongs to. */
            get: function () { return this._block ? this._block.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "statements", {
            get: function () { return this._statements; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "hasStatements", {
            get: function () { return !!this._statements && !!this._statements.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "lineIndex", {
            /** Returns the 0-based line number for this line. */
            get: function () { return this._block ? this._block.getLineIndex(this) : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "lineNumber", {
            /** Returns the 1-based line number for this line, used mainly for the UI. */
            get: function () { return this._block ? this._block.getLineNumber(this) : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "totalLines", {
            get: function () { return this._block ? this._block.totalLines : void 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "serializedPath", {
            /** A string path that represents this block during serialization. */
            get: function () {
                var blockPath = this._block ? this._block.serializedPath : "";
                var i = this.lineNumber;
                return blockPath + "," + (blockPath && i >= 1 ? i : this._id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Line.prototype, "referenceStr", {
            /** An instance reference string that represents this block in the system. */
            get: function () {
                var block = this.block;
                if (block)
                    return block.referenceStr + ".lines[" + this.lineIndex + "]";
                else
                    return "[" + this.lineIndex + "]";
            },
            enumerable: true,
            configurable: true
        });
        Line.prototype.getReference = function () {
            if (this.script)
                return new FlowScript.NamedReference(this.script, this.referenceStr);
            else
                return new FlowScript.NamedReference(this, null);
        };
        Line.prototype.clone = function (parent) {
            var line = new Line(parent);
            for (var i = 0, n = this._statements.length; i < n; ++i)
                line.statements.push(this._statements[i].clone());
            return line;
        };
        /** Creates an expression wrapper for this line. An optional expression parent can be given. */
        Line.prototype.createExpression = function (parent) {
            return new LineReference(this, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Remove this line and all statements, and returns the removed line. */
        Line.prototype.remove = function () { if (this._block)
            return this._block.removeLine(this);
        else
            return void 0; };
        // --------------------------------------------------------------------------------------------------------------------
        Line.prototype.save = function (target) {
            target = target || {};
            target.statements = [];
            for (var i = 0, n = this._statements.length; i < n; ++i)
                target.statements[i] = this._statements[i].save();
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        Line.prototype.addStatement = function (action, args, returnTargets, eventHandlers) {
            if (this._statements.length)
                throw "Cannot add statement '" + action + "': Adding multiple statements per line is not yet supported.  Each statement must be on its own line.";
            return this._statements[this._statements.length] = new FlowScript.Statement(this, action, args, returnTargets, eventHandlers);
        };
        Line.prototype.removeStatement = function (statement) {
            var i = this._statements.indexOf(statement);
            if (i >= 0) {
                return this._statements.splice(i, 1)[0];
                //? (users my wish to keep empty lines!) if (this._statements.length == 0) // (if there are no more statements on the line, then remove the line also)
                //?    this._block.removeLine(this);
            }
            else
                return void 0;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this line and any statements. */
        Line.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            for (var i = 0, n = this._statements.length; i < n; ++i) {
                if (i > 0)
                    node.appendTextNode(" | ");
                this._statements[i].createVisualTree(node, visualNodeType);
            }
            return node;
        };
        return Line;
    }(FlowScript.TrackableObject));
    FlowScript.Line = Line;
    /** References a line for special cases. Lines are not usually used in expressions, but still may need to be
      * referenced (for instance, from the UI side, or the trash bin).
      */
    var LineReference = /** @class */ (function (_super) {
        __extends(LineReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function LineReference(line, parent) {
            var _this = _super.call(this, parent) || this;
            if (!line || typeof line != 'object' || !(line instanceof Line))
                throw "A valid line object is required.";
            _this._lineRef = line.getReference();
            return _this;
        }
        Object.defineProperty(LineReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._lineRef ? this._lineRef.valueOf().script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LineReference.prototype, "line", {
            /** The line object that is referenced. */
            get: function () { return this._lineRef.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LineReference.prototype, "component", {
            /** The component that the referenced line belongs to. */
            get: function () { return this.line.component; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this expression object. */
        LineReference.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            if (this.line)
                this.line.createVisualTree(node, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        LineReference.prototype._clone = function (parent) {
            return new LineReference(this._lineRef.valueOf(), parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        LineReference.prototype.save = function (target) {
            target = target || {};
            target.linePath = this._lineRef.valueOf().serializedPath;
            _super.prototype.save.call(this, target);
            return target;
        };
        LineReference.prototype.load = function (target) {
            target = target || {};
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        LineReference.prototype.toString = function () { return "Line reference: " + this._lineRef.valueOf().serializedPath; };
        return LineReference;
    }(FlowScript.Expression));
    FlowScript.LineReference = LineReference;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=line.js.map