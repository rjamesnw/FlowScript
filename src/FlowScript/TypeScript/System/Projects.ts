namespace FlowScript {
    // ========================================================================================================================

    export class Project {
        // --------------------------------------------------------------------------------------------------------------------

        /** The script instance for this project. */
        get script() { return this._script; }
        protected _script: IFlowScript;

        // --------------------------------------------------------------------------------------------------------------------
        // Create a type of trash-bin to hold expressions so the user can restore them, or delete permanently.

        /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
          * developers to move expressions easily between scripts.
          * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
          */
        get expressionBin() { return this._expressionBin; }
        private _expressionBin: Expression[] = [];
        onExpressionBinItemAdded = new EventDispatcher<Project, { (item: Expression, project: Project): void }>(this);
        onExpressionBinItemRemoved = new EventDispatcher<Project, { (item: Expression, project: Project): void }>(this);

        /** Returns the expression that was picked by the user for some operation. In the future this may also be used during drag-n-drop operations. */
        get pickedExpression() { return this._pickedExpression; }
        private _pickedExpression: Expression;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(
            /** The title of the project. */ public title: string,
            /** The project's description. */ public description?: string
        ) {
            this._script = FlowScript.createNew();
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(): string {
            return this.script.saveToStorage(this.title);
        }

        // --------------------------------------------------------------------------------------------------------------------

        addToBin(expr: Expression, triggerEvent = true) {
            if (this._expressionBin.indexOf(expr) < 0) {
                this._expressionBin.push(expr);
                if (triggerEvent)
                    this.onExpressionBinItemAdded.trigger(expr, this);
            }
        }

        removeFromBin(expr: Expression, triggerEvent = true) {
            var i = this._expressionBin.indexOf(expr);
            if (i >= 0) {
                var expr = this._expressionBin.splice(i, 1)[0];
                if (triggerEvent)
                    this.onExpressionBinItemRemoved.trigger(expr, this);
            }
        }

        isInBin(expr: Expression) { return this._expressionBin.indexOf(expr) >= 0; }

        // --------------------------------------------------------------------------------------------------------------------

        pick(expr: Expression) {
            this._pickedExpression = expr;
        }

        // --------------------------------------------------------------------------------------------------------------------

        //private _findChildNode(node: HTMLElement, fstype: Type): HTMLElement { //?
        //    if (node) {
        //        for (var i = 0, len = node.childNodes.length; i < len; ++i)
        //            if ((<any>node.childNodes[i])["$__fs_type"] == fstype)
        //                return <HTMLElement>node.childNodes[i];
        //    }
        //    else return null;
        //}

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    /**
     * Holds a collection of projects.
     */
    export class Projects {
        get count() { return this._projects.length; }

        _projects: Project[] = [];

        /**
         * Creates a new project with the given title and description.
         * @param title The project title.
         * @param description The project description.
         */
        createProject(title: string, description?: string): Project;
        /**
         * Creates a new project with the given title and description.
         * @param title The project title.
         * @param description The project description.
         * @param projectType An object of type 'Project' to use to create this project entry.
         */
        createProject<T extends Project>(title: string, description?: string, projectType?: { new(title: string, description?: string): T }): T;
        createProject(title: string, description?: string, projectType?: typeof Project): Project {
            var project = new (projectType || Project)(title, description);
            this._projects.push(project);
            return project;
        }
    }

    // ========================================================================================================================
}