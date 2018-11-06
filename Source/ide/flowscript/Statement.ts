// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface ISavedStatement extends ISavedComponentReference { }

    /** The root expression is call a "statement", which is a single stand-alone component call, assignment operation, or flow
      * control block.  Lines usually reference statements, and other expressions are nested within them.
      */
    export class Statement extends ComponentReference {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._line ? this._line.script : null; }

        /** The line this expression belongs to. */
        get line() { return this._line; }
        private _line: Line;

        /** The line number this statement is on. */
        get lineNumer() { return this._line ? this._line.lineNumber : void 0; }

        /** Returns the functional component this expression belongs to. */
        get functionalComponent(): Component { return this.line ? this.line.component : null; }

        get block(): Block { return this._line ? this._line.block : null; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(line: Line, action: Component, args?: IExpressionArgs, returnTargets?: IReturnTargetMap[], eventHandlers?: BlockReference[]) {
            super(action, args, returnTargets, eventHandlers, (eval('this._line = line'), null)); // (need to set the line reference first before calling into the base)
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Creates a visual tree snapshot for this component and the component's first block. */
        createVisualTree<T extends VisualNode>(parent?: VisualNode, visualNodeType?: IVisualNodeType<T>): T {
            var node = super.createVisualTree(parent, visualNodeType);
            return <T>node;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): Statement {
            return new Statement(this._line, this.component);
        }
        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedStatement): ISavedStatement {
            target = target || <ISavedStatement>{};
            super.save(target);
            return target;
        }

        load(target?: ISavedStatement): this {
            if (target) {
                super.load(target);
            }
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Removes a child expression from the expression tree. */
        remove(child: Expression): Expression;
        /** Removes self from the associated line. */
        remove(): Expression;
        remove(child?: Expression): Expression {
            if (child)
                return super.remove(child);
            else {
                if (this._line)
                    return this._line.removeStatement(this);
                return void 0;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
