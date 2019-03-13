namespace FlowScript.UI {
    // ========================================================================================================================

    export interface ITreeViewItem<TItem extends {}> extends HTMLElement {
        $__treeItem: TItem;
    }

    export interface ITreeViewGetRootItemHandler<TSource extends {}, TItem extends {}> { (tv: TreeView<TSource, TItem>): TItem }
    export interface ITreeViewRenderHandler<TSource extends {}, TItem extends {}> { (tv: TreeView<TSource, TItem>, item: TItem, parentContainer: HTMLElement): ITreeViewItem<TItem> }
    //? export interface ITreeViewAddHandler<TSource extends {}, TItem extends {}> { (tv: TreeView<TSource, TItem>, value: string): void }
    export interface ITreeViewRenameHandler<TSource extends {}, TItem extends {}> { (tv: TreeView<TSource, TItem>, selectedOption: ITreeViewItem<TItem>, newValue: string): void }
    export interface ITreeViewRemoveHandler<TSource extends {}, TItem extends {}> { (tv: TreeView<TSource, TItem>, selectedOption: ITreeViewItem<TItem>): void }

    export class TreeView<TSource extends {}, TItem extends {}> {

        get scriptEditor(): ScriptEditor { return this._scriptEditor; }
        _scriptEditor: ScriptEditor;

        rootItem: TItem;
        rootItemNode: ITreeViewItem<TItem>;

        /** The current node that is selected. */
        get selectedNode() { return this._selectedNode; }
        set selectedNode(value: ITreeViewItem<TItem>) {
            if (this._selectedNode) {
                this._selectedNode.style.backgroundColor = "";
            }
            this._prevSelectedNode = this._selectedNode;
            this._selectedNode = value;
            if (value) {
                value.style.backgroundColor = "#60FF5C";
            }
        }
        private _selectedNode: ITreeViewItem<TItem> = null;

        /** The previous node that was selected. */
        get prevSelectedNode() { return this._prevSelectedNode; }
        private _prevSelectedNode: ITreeViewItem<TItem> = null;

        /** The current underlying item represented by the selected node. */
        get selectedItem(): TItem { return this.selectedNode ? this.selectedNode.$__treeItem : null; }

        source: TSource;

        public get view() { return this._view; }
        private _view: View;

        //onGetRootItemHandler: ITreeViewGetRootItemHandler<TSource, TItem>;
        //onRenderHandler: ITreeViewRenderHandler<TSource, TItem>;
        //onRenameHandler: ITreeViewRenameHandler<TSource, TItem>;
        //onRemoveHandler: ITreeViewRemoveHandler<TSource, TItem>;

        constructor(scriptEditor: ScriptEditor, view: View) {
            if (!scriptEditor)
                throw "'scriptEditor' is required.'";
            if (!(scriptEditor instanceof ScriptEditor))
                throw "'scriptEditor' is not a ScriptEditor type object.'";

            this._scriptEditor = scriptEditor;

            this._view = view;
        }

        protected _onGetRootItemHandler(): TItem {
            throw "Not Implemented.";
        }

        protected _onRenderHandler(item: TItem, parentElement: HTMLElement): ITreeViewItem<TItem> {
            throw "Not Implemented.";
        }

        setSource(source: TSource) {
            this.source = source;
            this.refresh();
        }

        refresh() {
            this.rootItem = this._onGetRootItemHandler();
            this._view.clear();
            this.rootItemNode = <ITreeViewItem<TItem>><any>document.createElement("ul");
            this._view.contentElement.appendChild(this.rootItemNode);
            this._onRenderHandler(this.rootItem, this.rootItemNode);
            if (!this._view.attached)
                this._view.show();
        }

        private _locateItem(node: ITreeViewItem<TItem>, item: TItem): ITreeViewItem<TItem> {
            if (node.nodeName == 'SPAN' && node.$__treeItem == item) return node;
            // ... check child nodes ...
            var child = <ITreeViewItem<TItem>>node.firstChild;
            while (child) {
                var result = this._locateItem(child, item);
                if (result) return result;
                child = <any>child.nextSibling;
            }
            return null;
        }

        selectItem(item: TItem): ITreeViewItem<TItem> {
            if (!this.selectedNode || this.selectedNode.$__treeItem != item)
                this.selectedNode = this._locateItem(this.rootItemNode, item);
            this._scriptEditor.refreshComponentDetails();
            return this.selectedNode;
        }
    }

    // ============================================================================================================================
}
