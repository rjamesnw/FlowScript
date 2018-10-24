// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface ISavedBlock extends ISavedTrackableObject { lines: ISavedLine[] }

    // ========================================================================================================================

    /** Represents a single block of script.
      * Blocks are also expressions because they can exist as arguments to other components.
      */
    export class Block extends TrackableObject implements IReferencedObject {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._component.script; }

        /** The index of this block in the component owner, if any, otherwise this is -1. */
        get index(): number { return this._component ? this._component.blocks.indexOf(this) : -1; }

        /** The component this block belongs to. */
        get component(): Component { return this._component; }
        set component(comp) { if (this._component) this._component.removeBlock(this); comp.addBlock(this); }
        private _component: Component;

        get lines() { return this._lines; }
        private _lines: Line[] = [];

        get hasLines(): boolean { return !!this._lines && !!this._lines.length; }

        get totalLines(): number { return this._lines.length; }

        /** A string path that represents this block during serialization. */
        get serializedPath(): string {
            var typePath = this._component ? this._component.fullTypeName : "";
            var i = this.index;
            return typePath + ":" + (typePath && i >= 0 ? i : this._id);
        }

        /** An instance reference string that represents this block in the system. */
        get referenceStr(): string {
            var comp = this.component;
            if (comp)
                return comp.referenceStr + ".blocks[" + this.index + "]";
            else
                return "[" + this.index + "]";
        }
        getReference(): NamedReference<Block> {
            if (this.script)
                return new NamedReference<Block>(this.script, this.referenceStr);
            else
                return new NamedReference<Block>(this, null);
        }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(containingComponent: Component) {
            super();
            this._component = containingComponent;
            if (containingComponent)
                this._component.addBlock(this);
        }

        /** Creates an expression wrapper for this block. An optional expression parent can be given. */
        createExpression(parent?: Expression) {
            return new BlockReference(this, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedBlock): ISavedBlock {
            target = target || <ISavedBlock>{};

            target.lines = [];
            for (var i = 0, n = this._lines.length; i < n; ++i)
                target.lines[i] = this._lines[i].save();

            super.save(target);

            return target;
        }

        load(target?: ISavedBlock): this {
            if (target) {
                if (target.lines)
                    for (var i = 0, n = target.lines.length; i < n; ++i)
                        this.lines[i] = new Line(this).load(target.lines[i]);
                super.load(target);
            }
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a new line for this block. */
        newLine(): Line {
            return this._lines[this._lines.length] = new Line(this);
        }

        /** Returns a new line before the given line number (where 0 is the first line). */
        insertLineBefore(lineIndex: number): Line {
            if (!lineIndex || lineIndex < 0) lineIndex = 0;
            // ... move down items ...
            for (var i = this._lines.length; i > lineIndex; --i)
                this._lines[i] = this._lines[i - 1];
            return this._lines[lineIndex] = new Line(this);
        }

        /** Returns a new line after the given line number (where 0 is the first line). */
        insertLineAfter(lineIndex: number): Line {
            if (!lineIndex || lineIndex < 0) lineIndex = 0;
            return this.insertLineBefore(lineIndex + 1);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns the 0-based line number for a line. */
        getLineIndex(line: Line): number { var i = this._lines.indexOf(line); return i >= 0 ? i : void 0; }

        /** Returns the 1-based line number for a line, used mainly for the UI. */
        getLineNumber(line: Line): number { var i = this._lines.indexOf(line); return i >= 0 ? 1 + i : void 0; }

        // --------------------------------------------------------------------------------------------------------------------

        /** Remove a line by the line number (note: the first line is 1, not 0). */
        removeLine(lineNum: number): Line;
        /** Remove a line by the line instance reference. */
        removeLine(line: Line): Line;
        removeLine(line: Line | number): Line {
            var index: number = typeof line == 'number' ? <number>line - 1 : this._lines.indexOf(<Line>line);
            if (index >= 0 && index < this._lines.length)
                return this._lines.splice(index, 1)[0];
            return void 0; // (not found, or out of bounds)
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Clears the block and returns the block instance. */
        clear(): Block {
            this._lines = [];
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this block and any containing lines. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);

            if (!this.lines.length)
                node.appendTextNode("≡?≡");
            else
                for (var i = 0, n = this._lines.length; i < n; ++i)
                    this._lines[i].createVisualTree(node, visualNodeType);

            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ISavedBlockReference extends ISavedExpression { blockPath: string; }

    /** References a block for use in expressions. */
    export class BlockReference extends Expression {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._block ? this.block.script : null; }

        /** The block object that is referenced. */
        get block() { return this._block.valueOf(); }
        private _block: NamedReference<Block>;

        /** The script lines in the referenced block. */
        get lines(): Line[] { return this.block.lines; }

        /** The component that the referenced block belongs to. */
        get component(): Component { return this.block.component; }

        get hasLines(): boolean { return this.block.hasLines; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(block: Block, parent?: Expression) {
            super(parent);

            if (!block || typeof block != 'object' || !(block instanceof Block))
                throw "A valid block object is required.";

            this._block = block.getReference();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this expression object. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);
            if (this.block)
                this.block.createVisualTree(node, visualNodeType);
            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): BlockReference {
            return new BlockReference(this.block, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedBlockReference): ISavedBlockReference {
            target = target || <ISavedBlockReference>{};

            //?if (!typePath || i < 0)
            //    throw "Cannot save a block reference to a block that is not part of a component - there would be no way to reconcile it when loading.";

            target.blockPath = this.block.serializedPath;

            super.save(target);
            return target;
        }

        load(target?: ISavedBlockReference): this {
            target = target || <ISavedBlockReference>{};

            var block = this.block;

            var typePath = block.component ? block.component.fullTypeName : null;
            var i = block.index;

            if (target.blockPath) {
                var parts = target.blockPath.split(':');

                if (parts.length)
                    if (parts.length == 1)
                        var path: string, id = parts[0];
                    else
                        var path = parts[0], id = parts[1];

                if (isNaN(+id)) {
                    // ... assume this is a GUID instead ...
                } else {
                    // ... this is a numerical index into the component blocks ...
                    if (!path) throw "A numerical block index requires a component type path.";
                    var comp = this.script.resolve(path, Component);
                    if (!comp) throw "There is no component '" + path + "'; cannot reconcile block reference '" + target.blockPath + "'.";
                    var i = +id;
                    if (i < 0) throw "The numerical block index (" + i + ") is out of bounds.";
                }
            }

            target.blockPath = typePath + ":" + (i >= 0 ? i : block._id);

            // super.load(target);
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString(): string { return "Block reference: " + (this._block && this.block.serializedPath); }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
