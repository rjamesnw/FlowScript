//// <reference path="../typings/ace/ace.d.ts" />
//// <reference path="../typings/typescript/typescriptservices.d.ts" />
//// <reference path="../typings/requirejs/require.d.ts" />

// A wrapper for the ACE editor for use with editing code on the UI.

module FlowScript.UI {
    export module ACE {
        interface IACEMain {
            initialize(editorID?: string, outputID?: string): void;
            defaultFormatCodeOptions(): ts.FormatCodeOptions;
            loadLibFiles(libFiles: string[]): void;
            loadFile(filename: string): void;
            setCode(text: string): void;
            setOutput(text: string): void;
            getCode(): string;
            getOutput(): string;
        }

        export class ACEEditor extends TextEditor {
            private _aceEditorMain: IACEMain;

            /** The target element to render the editor in (usually a DIV block). */
            outputTarget: HTMLElement;

            constructor(view: View, target: string | HTMLElement, outputTarget?: string | HTMLElement) {
                super(view, target);
                if (outputTarget)
                    this.outputTarget = outputTarget instanceof HTMLElement ? outputTarget : view.getElementById(outputTarget);
            }

            initialize(ready?: () => void) {
                if (!require)
                    throw "'RequireJS' is not loaded.";

                if (!ts)
                    throw "'ts' TypeScript service namespace reference is required - is the 'ace/mode/typescript/typescriptServices.js' file loaded?.";

                require([
                    "FlowScript/ace/ace_ts_editor_main"
                ], (main: IACEMain) => {
                    this._aceEditorMain = main;
                    main.initialize(this.target.id, this.outputTarget.id);
                    if (ready)
                        ready();
                }, (msg: RequireError) => {
                    throw "Failed loading 'FlowScript/ace/ace_ts_editor_main' module: " + msg + "\r\n" + ((<any>msg).stack || "");
                });

            }

            /**
             * Loads an array of library files by URL.
             */
            loadLibFiles(libFiles: string[]): void { this._aceEditorMain.loadLibFiles(libFiles); }
            loadFile(filename: string): void { this._aceEditorMain.loadFile(filename); }
            setCode(text: string): void { this._aceEditorMain.setCode(text); }
            setOutput(text: string): void { this._aceEditorMain.setOutput(text); }
            getCode(): string { return this._aceEditorMain.getCode(); }
            getOutput(): string { return this._aceEditorMain.getOutput(); }
        }
    }
}