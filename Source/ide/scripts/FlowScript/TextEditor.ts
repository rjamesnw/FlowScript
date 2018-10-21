// A wrapper for the ACE editor for use with editing code on the UI.

module FlowScript.UI {
    export class TextEditor {

        /** The view the editor is on, if any. */
        view: View;

        /** The target element to render the editor in (usually a DIV block). */
        target: HTMLElement;

        constructor(view: View, target: string | HTMLElement) {
            this.view = view;

            if (!target)
                throw "A target is required for the editor UI.";

            this.target = target instanceof HTMLElement ? target : view.getElementById(target);
        }

        /**
         * Once the text editor is constructed, call this when ready to initialize the editor for the first time before use.
         * In some cases, this may trigger loading of other dependencies for derived types.
         */
        initialize(ready?: () => void): void { if (ready) ready(); }
    }
}