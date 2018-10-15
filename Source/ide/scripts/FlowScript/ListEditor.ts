module FlowScript.UI {
    // ========================================================================================================================

    export interface IListEditorOptionItem extends HTMLOptionElement { $__fs_property: Property; }

    export interface IListEditorGetValuesHandler { (editor: ListEditor): PropertyCollection }
    export interface IListEditorAddHandler { (editor: ListEditor, value: string): void }
    export interface IListEditorRenameHandler { (editor: ListEditor, selectedOption: IListEditorOptionItem, newValue: string, index: number): void }
    export interface IListEditorRemoveHandler { (editor: ListEditor, selectedOption: IListEditorOptionItem, index: number): void }

    // ========================================================================================================================

    /**
     * Wraps functionality of a single select (list box style) UI element.
     */
    export class ListEditor {
        get scriptEditor(): ScriptEditor { return this._scriptEditor; }
        private _scriptEditor: ScriptEditor;

        _component: Component;

        editBox: HTMLInputElement;
        addBtn: HTMLButtonElement;
        removeBtn: HTMLButtonElement;
        listBox: HTMLSelectElement;

        get enteredValue() { return this.editBox.value; }

        get selectedIndex() { return this.listBox.selectedIndex; }
        set selectedIndex(value) {
            this.listBox.selectedIndex = value;
            if (this.listBox.onchange)
                this.listBox.onchange(null);
        }

        get selectedOption() { return this.listBox.selectedIndex < 0 ? null : <HTMLOptionElement>this.listBox.options[this.listBox.selectedIndex]; }
        get selectedValue() { var opt = this.selectedOption; return opt ? opt.value : null; }

        constructor(scriptEditor: ScriptEditor, title: string, editBox: HTMLInputElement, addBtn: HTMLButtonElement, removeBtn: HTMLButtonElement, listBox: HTMLSelectElement,
            ongetvalues: IListEditorGetValuesHandler, onadd: IListEditorAddHandler, onrename: IListEditorRenameHandler, onremove: IListEditorRemoveHandler);
        constructor(scriptEditor: ScriptEditor, title: string, editBox: string, addBtn: string, removeBtn: string, listBox: string,
            ongetvalues: IListEditorGetValuesHandler, onadd: IListEditorAddHandler, onrename: IListEditorRenameHandler, onremove: IListEditorRemoveHandler);
        constructor(scriptEditor: ScriptEditor, public title: string, editBox: any, addBtn: any, removeBtn: any, listBox: any,
            public ongetvalues: IListEditorGetValuesHandler, public onadd: IListEditorAddHandler, public onrename: IListEditorRenameHandler, public onremove: IListEditorRemoveHandler) {

            if (!scriptEditor)
                throw "'scriptEditor' is required.'";
            if (!(scriptEditor instanceof ScriptEditor))
                throw "'scriptEditor' is not a ScriptEditor type object.'";

            this._scriptEditor = scriptEditor;

            if (typeof editBox == "string")
                this.editBox = <HTMLInputElement>this._scriptEditor.view.getElementById(editBox);
            else
                this.editBox = editBox;

            if (typeof addBtn == "string")
                this.addBtn = <HTMLButtonElement>this._scriptEditor.view.getElementById(addBtn);
            else
                this.addBtn = addBtn;

            if (typeof removeBtn == "string")
                this.removeBtn = <HTMLButtonElement>this._scriptEditor.view.getElementById(removeBtn);
            else
                this.removeBtn = removeBtn;

            if (typeof listBox == "string")
                this.listBox = <HTMLSelectElement>this._scriptEditor.view.getElementById(listBox);
            else
                this.listBox = listBox;

            this.listBox.onchange = (ev: Event) => {
                this.editBox.value = this.selectedValue;
            };

            this.editBox.onkeypress = (ev: KeyboardEvent) => {
                if (ev.keyCode == 13) {
                    try {
                        if (this.listBox.selectedIndex >= 0)
                            this.onrename(this, <IListEditorOptionItem>this.selectedOption, this.enteredValue, this.selectedIndex);
                        else {
                            this.onadd(this, this.enteredValue);
                        }
                    }
                    catch (ex) { alert("" + ex); }
                    this._scriptEditor.refreshComponentDetails();
                }
            };

            this.addBtn.onclick = (ev: Event) => {
                try {
                    this.onadd(this, this.enteredValue);
                }
                catch (ex) { alert("" + ex); }
                this._scriptEditor.refreshComponentDetails();
            };

            this.removeBtn.onclick = (ev: Event) => {
                try {
                    if (this.selectedIndex < 0)
                        throw "You must select an item first before you can remove it.";
                    else
                        this.onremove(this, <IListEditorOptionItem>this.selectedOption, this.selectedIndex);
                }
                catch (ex) { alert("" + ex); }
                this._scriptEditor.refreshComponentDetails();
            };
        }

        /** Refreshes the listbox items. */
        refresh(): void {
            var currentSelectedIndex = this.listBox.selectedIndex;
            var propCollection = this.ongetvalues(this);
            this.editBox.value = "";
            Utilities.HTML.clearChildNodes(this.listBox);
            if (propCollection)
                for (var i = 0, len = propCollection.length; i < len; ++i) {
                    var prop = propCollection.getProperty(i);
                    this.addValue(prop.name, prop);
                }
            this.listBox.selectedIndex = currentSelectedIndex < this.listBox.length ? currentSelectedIndex : -1;
        }

        addValue(value: string, prop?: Property): void {
            value = value.trim();
            if (!value) throw "The value cannot be blank.";
            var opt = this.getOption(value);
            if (!opt) {
                opt = document.createElement("option");
                opt.value = value;
                opt.innerHTML = value;
                (<IListEditorOptionItem><any>opt).$__fs_property = prop;
                this.listBox.add(opt);
                this.listBox.selectedIndex = this.listBox.options.length - 1;
            }
            else throw "Sorry, cannot add '" + value + "' as it already exists.";
        }

        setCurrentValue(value: string): void {
            value = value.trim();
            if (!value) { alert("The value cannot be blank."); return; }
            if (this.listBox.selectedIndex >= 0) {
                var opt = <HTMLOptionElement>this.listBox.options[this.listBox.selectedIndex];
                var existingOpt = this.getOption(value);
                if (!existingOpt || existingOpt == opt) {
                    opt.value = value;
                    opt.innerHTML = value;
                }
                else throw "Sorry, cannot rename to '" + value + "' as it already exists.";
            }
        }

        remove(value: string): void;
        remove(value: HTMLOptionElement): void;
        remove(value: any): void {
            var opt = typeof value == "string" ? this.getOption(value) : <HTMLOptionElement>value;
            if (opt)
                this.listBox.removeChild(opt);
        }

        getOption(value: string): HTMLOptionElement {
            for (var i = 0, len = this.listBox.options.length; i < len; ++i) {
                var opt = <HTMLOptionElement>this.listBox.options[i];
                if (opt.value == value)
                    return opt;
            }
            return null;
        }
    }

    // ========================================================================================================================
}
