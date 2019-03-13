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
    /** Represents a single block of script.
      * Blocks are also expressions because they can exist as arguments to other components.
      */
    var Block = /** @class */ (function (_super) {
        __extends(Block, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function Block(containingComponent) {
            var _this = _super.call(this) || this;
            _this._lines = [];
            _this._component = containingComponent;
            if (containingComponent)
                _this._component.addBlock(_this);
            return _this;
        }
        Object.defineProperty(Block.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._component.script; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "index", {
            /** The index of this block in the component owner, if any, otherwise this is -1. */
            get: function () { return this._component ? this._component.blocks.indexOf(this) : -1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "component", {
            /** The component this block belongs to. */
            get: function () { return this._component; },
            set: function (comp) { if (this._component)
                this._component.removeBlock(this); comp.addBlock(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "lines", {
            get: function () { return this._lines; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "hasLines", {
            get: function () { return !!this._lines && !!this._lines.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "totalLines", {
            get: function () { return this._lines.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "serializedPath", {
            /** A string path that represents this block during serialization. */
            get: function () {
                var typePath = this._component ? this._component.fullTypeName : "";
                var i = this.index;
                return typePath + ":" + (typePath && i >= 0 ? i : this._id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "referenceStr", {
            /** An instance reference string that represents this block in the system. */
            get: function () {
                var comp = this.component;
                if (comp)
                    return comp.referenceStr + ".blocks[" + this.index + "]";
                else
                    return "[" + this.index + "]";
            },
            enumerable: true,
            configurable: true
        });
        Block.prototype.getReference = function () {
            if (this.script)
                return new FlowScript.NamedReference(this.script, this.referenceStr);
            else
                return new FlowScript.NamedReference(this, null);
        };
        /** Creates an expression wrapper for this block. An optional expression parent can be given. */
        Block.prototype.createExpression = function (parent) {
            return new BlockReference(this, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Block.prototype.save = function (target) {
            target = target || {};
            target.lines = [];
            for (var i = 0, n = this._lines.length; i < n; ++i)
                target.lines[i] = this._lines[i].save();
            _super.prototype.save.call(this, target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns a new line for this block. */
        Block.prototype.newLine = function () {
            return this._lines[this._lines.length] = new FlowScript.Line(this);
        };
        /** Returns a new line before the given line number (where 0 is the first line). */
        Block.prototype.insertLineBefore = function (lineIndex) {
            if (!lineIndex || lineIndex < 0)
                lineIndex = 0;
            // ... move down items ...
            for (var i = this._lines.length; i > lineIndex; --i)
                this._lines[i] = this._lines[i - 1];
            return this._lines[lineIndex] = new FlowScript.Line(this);
        };
        /** Returns a new line after the given line number (where 0 is the first line). */
        Block.prototype.insertLineAfter = function (lineIndex) {
            if (!lineIndex || lineIndex < 0)
                lineIndex = 0;
            return this.insertLineBefore(lineIndex + 1);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns the 0-based line number for a line. */
        Block.prototype.getLineIndex = function (line) { var i = this._lines.indexOf(line); return i >= 0 ? i : void 0; };
        /** Returns the 1-based line number for a line, used mainly for the UI. */
        Block.prototype.getLineNumber = function (line) { var i = this._lines.indexOf(line); return i >= 0 ? 1 + i : void 0; };
        Block.prototype.removeLine = function (line) {
            var index = typeof line == 'number' ? line - 1 : this._lines.indexOf(line);
            if (index >= 0 && index < this._lines.length)
                return this._lines.splice(index, 1)[0];
            return void 0; // (not found, or out of bounds)
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Clears the block and returns the block instance. */
        Block.prototype.clear = function () {
            this._lines = [];
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this block and any containing lines. */
        Block.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            if (!this.lines.length)
                node.appendTextNode("≡?≡");
            else
                for (var i = 0, n = this._lines.length; i < n; ++i)
                    this._lines[i].createVisualTree(node, visualNodeType);
            return node;
        };
        return Block;
    }(FlowScript.TrackableObject));
    FlowScript.Block = Block;
    /** References a block for use in expressions. */
    var BlockReference = /** @class */ (function (_super) {
        __extends(BlockReference, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function BlockReference(block, parent) {
            var _this = _super.call(this, parent) || this;
            if (!block || typeof block != 'object' || !(block instanceof Block))
                throw "A valid block object is required.";
            _this._block = block.getReference();
            return _this;
        }
        Object.defineProperty(BlockReference.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._block ? this.block.script : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "block", {
            /** The block object that is referenced. */
            get: function () { return this._block.valueOf(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "lines", {
            /** The script lines in the referenced block. */
            get: function () { return this.block.lines; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "component", {
            /** The component that the referenced block belongs to. */
            get: function () { return this.block.component; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockReference.prototype, "hasLines", {
            get: function () { return this.block.hasLines; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Creates a visual tree snapshot for this expression object. */
        BlockReference.prototype.createVisualTree = function (parent, visualNodeType) {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new FlowScript.VisualNode(this);
            if (this.block)
                this.block.createVisualTree(node, visualNodeType);
            return node;
        };
        // --------------------------------------------------------------------------------------------------------------------
        BlockReference.prototype._clone = function (parent) {
            return new BlockReference(this.block, parent);
        };
        // --------------------------------------------------------------------------------------------------------------------
        BlockReference.prototype.save = function (target) {
            target = target || {};
            //?if (!typePath || i < 0)
            //    throw "Cannot save a block reference to a block that is not part of a component - there would be no way to reconcile it when loading.";
            target.blockPath = this.block.serializedPath;
            _super.prototype.save.call(this, target);
            return target;
        };
        BlockReference.prototype.load = function (target) {
            target = target || {};
            var block = this.block;
            var typePath = block.component ? block.component.fullTypeName : null;
            var i = block.index;
            if (target.blockPath) {
                var parts = target.blockPath.split(':');
                if (parts.length)
                    if (parts.length == 1)
                        var path, id = parts[0];
                    else
                        var path = parts[0], id = parts[1];
                if (isNaN(+id)) {
                    // ... assume this is a GUID instead ...
                }
                else {
                    // ... this is a numerical index into the component blocks ...
                    if (!path)
                        throw "A numerical block index requires a component type path.";
                    var comp = this.script.resolve(path, FlowScript.Component);
                    if (!comp)
                        throw "There is no component '" + path + "'; cannot reconcile block reference '" + target.blockPath + "'.";
                    var i = +id;
                    if (i < 0)
                        throw "The numerical block index (" + i + ") is out of bounds.";
                }
            }
            target.blockPath = typePath + ":" + (i >= 0 ? i : block._id);
            // super.load(target);
            return target;
        };
        // --------------------------------------------------------------------------------------------------------------------
        BlockReference.prototype.toString = function () { return "Block reference: " + (this._block && this.block.serializedPath); };
        return BlockReference;
    }(FlowScript.Expression));
    FlowScript.BlockReference = BlockReference;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Block.js.map