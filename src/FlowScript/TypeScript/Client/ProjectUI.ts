// ========================================================================================================================
// Project UI

namespace FlowScript.UI {
    // ========================================================================================================================

    function _defaultCreateProjectHandler(solution: Solution, project: ISavedProject) {
        return new ProjectUI(solution, project.name, project.description);
    };

    Solution.onCreateProject = _defaultCreateProjectHandler;

    /**
     * Extends the 'Projects' class to provide UI integration functions specific to the IDE.
     */
    export class ProjectUI extends Project {

        /** The current project focused for editing. */
        static currentProject: ProjectUI;

        get scriptEditor(): ScriptEditor {
            if (!this._scriptEditor)
                throw "There is no editor set for project '" + this.name + "': You must call 'setEditor()' first to associated an editor.";
            return this._scriptEditor;
        }
        private _scriptEditor: ScriptEditor;

        /** The current component being edited (defaults to 'main'). */
        get currentComponent(): Component { return this._currentComponent; }
        set currentComponent(comp: Component) { this._currentComponent = comp; }
        private _currentComponent: Component;

        /** Triggered when the project is activated within the parent Views instance. */
        onActivated = new EventDispatcher<Project, { (project: Project): void }>(this);

        // --------------------------------------------------------------------------------------------------------------------

        constructor(solution: Solution, title: string, description?: string) {
            super(solution, title, description);

            this.onExpressionBinItemAdded.add(this._onExpressionBinItemAdded);
            this.onExpressionBinItemRemoved.add(this._onExpressionBinItemRemoved);
        }

        /** Sets the editor that this project will render to. */
        setEditor(scriptEditor: ScriptEditor) {
            if (!scriptEditor)
                throw "'scriptEditor' is required.'";
            if (!(scriptEditor instanceof ScriptEditor))
                throw "'scriptEditor' is not a ScriptEditor type object.'";
            this._scriptEditor = scriptEditor;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Active the project and bring it into view. */
        activate() {
            ProjectUI.currentProject = this;
            this._scriptEditor.currentProject = this;

            // ... if there is no current component as the focus for editing, set one (usually the 'main' component) ...
            if (!this._currentComponent)
                this._currentComponent = this._script.Main;

            this._onRender();

            this._scriptEditor.view.show();

            this.onActivated.trigger(this);
        }

        // --------------------------------------------------------------------------------------------------------------------

        private _onExpressionBinItemAdded(item: Expression) {
            this.scriptEditor.refreshScratchSpace();
        }

        private _onExpressionBinItemRemoved(item: Expression) {
            this.scriptEditor.refreshScratchSpace();
        }

        private _onRender() {
            this.scriptEditor.view.setElementValueById("txtProjTitle", this.name);
            this.scriptEditor.view.setElementValueById("txtProjDesc", this.description);

            this.scriptEditor.typeTree.setSource(this.script); // (build the type tree)
            this.scriptEditor.typeTree.selectItem(this._currentComponent); // (select the current component in the type tree)
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}

// ========================================================================================================================
