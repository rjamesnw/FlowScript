// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface ISavedLine extends ISavedTrackableObject { statements: ISavedExpression[] }

    // ========================================================================================================================

    /** A line represents a single execution step in a code block.
      * A line essentially wraps a component, and acts as a single execution step in a code block.
      */
    export class Line extends TrackableObject implements IReferencedObject {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._block ? this._block.script : null; }

        /** The block this line belongs to. */
        get block() { return this._block; }
        private _block: Block;

        /** The component that owns the code block this line belongs to. */
        get component(): Component { return this._block ? this._block.component : null; }

        get statements() { return this._statements; }
        private _statements: Statement[] = []; // (NOTE: This is an array, but only one statement per line is supported for final output at this time)

        get hasStatements(): boolean { return !!this._statements && !!this._statements.length; }

        /** Returns the 0-based line number for this line. */
        get lineIndex(): number { return this._block ? this._block.getLineIndex(this) : void 0; }

        /** Returns the 1-based line number for this line, used mainly for the UI. */
        get lineNumber(): number { return this._block ? this._block.getLineNumber(this) : void 0; }

        get totalLines(): number { return this._block ? this._block.totalLines : void 0; }

        /** A string path that represents this block during serialization. */
        get serializedPath(): string {
            var blockPath = this._block ? this._block.serializedPath : "";
            var i = this.lineNumber;
            return blockPath + "," + (blockPath && i >= 1 ? i : this._id);
        }

        /** An instance reference string that represents this block in the system. */
        get referenceStr(): string {
            var block = this.block;
            if (block)
                return block.referenceStr + ".lines[" + this.lineIndex + "]";
            else
                return "[" + this.lineIndex + "]";
        }
        getReference(): NamedReference<Line> {
            if (this.script)
                return new NamedReference<Line>(this.script, this.referenceStr);
            else
                return new NamedReference<Line>(this, null);
        }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: Block) {
            super(parent ? parent.script : void 0);
            this._block = parent;
        }

        clone(parent: Block): Line {
            var line = new Line(parent);
            for (var i = 0, n = this._statements.length; i < n; ++i)
                line.statements.push(<Statement>this._statements[i].clone());
            return line;
        }

        /** Creates an expression wrapper for this line. An optional expression parent can be given. */
        createExpression(parent?: Expression) {
            return new LineReference(this, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Remove this line and all statements, and returns the removed line. */
        remove(): Line { if (this._block) return this._block.removeLine(this); else return void 0; }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedLine): ISavedLine {
            target = target || <ISavedLine>{};

            target.statements = [];
            for (var i = 0, n = this._statements.length; i < n; ++i)
                target.statements[i] = this._statements[i].save();

            super.save(target);

            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        addStatement(action: Component, args?: IComponentReferenceArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]): Statement {
            if (this._statements.length)
                throw "Cannot add statement '" + action + "': Adding multiple statements per line is not yet supported.  Each statement must be on its own line.";
            return this._statements[this._statements.length] = new Statement(this, action, args, returnTargets, eventHandlers);
        }

        removeStatement(statement: Statement): Statement {
            var i = this._statements.indexOf(statement);
            if (i >= 0) {
                return this._statements.splice(i, 1)[0];
                //? (users my wish to keep empty lines!) if (this._statements.length == 0) // (if there are no more statements on the line, then remove the line also)
                //?    this._block.removeLine(this);
            } else
                return void 0;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this line and any statements. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);

            for (var i = 0, n = this._statements.length; i < n; ++i) {
                if (i > 0)
                    node.appendTextNode(" | ");
                this._statements[i].createVisualTree(node, visualNodeType);
            }

            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ISavedLineReference extends ISavedExpression { linePath: string; }

    /** References a line for special cases. Lines are not usually used in expressions, but still may need to be 
      * referenced (for instance, from the UI side, or the trash bin).
      */
    export class LineReference extends Expression {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._lineRef ? this._lineRef.valueOf().script : null; }

        /** The line object that is referenced. */
        get line() { return this._lineRef.valueOf(); }
        private _lineRef: NamedReference<Line>;

        /** The component that the referenced line belongs to. */
        get component(): Component { return this.line.component; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(line: Line, parent?: Expression) {
            super(parent);

            if (!line || typeof line != 'object' || !(line instanceof Line))
                throw "A valid line object is required.";

            this._lineRef = line.getReference();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this expression object. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = visualNodeType ? new visualNodeType(this) : parent ? parent.createNode(this) : new VisualNode(this);
            if (this.line)
                this.line.createVisualTree(node, visualNodeType);
            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): LineReference {
            return new LineReference(this._lineRef.valueOf(), parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedLineReference): ISavedLineReference {
            target = target || <ISavedLineReference>{};

            target.linePath = this._lineRef.valueOf().serializedPath;

            super.save(target);
            return target;
        }

        load(target?: ISavedLineReference): ISavedLineReference {
            target = target || <ISavedLineReference>{};
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString(): string { return "Line reference: " + this._lineRef.valueOf().serializedPath; }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
