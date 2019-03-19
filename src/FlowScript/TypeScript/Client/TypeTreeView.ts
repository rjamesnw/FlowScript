namespace FlowScript.UI {
    // ========================================================================================================================

    /** Contains nested TreeView nodes that represents namespace nodes and components in the current project. */
    export class TypeTreeView extends TreeView<IFlowScript, NamespaceObject>
    {
        _onTypeChanging: (node: ITreeViewItem<NamespaceObject>) => any;
        _onTypeChanged: (node: ITreeViewItem<NamespaceObject>) => void;

        private _singleClickDelayTimer: number;

        constructor(scriptEditor: ScriptEditor, view: View) {
            super(scriptEditor, view);

            // ... calculate a default max-height for this view based on the browser window size ...

            view.onresize(() => {
                var tvTypes = this.view.contentElement;
                var viewRect = tvTypes.getBoundingClientRect();
                var vpSize = Browser.getViewportSize();
                tvTypes.style.maxHeight = (vpSize.height - viewRect.top - 32) + "px";
            });
        }

        protected _onGetRootItemHandler() {
            return <NamespaceObject><any>this.source;
        };

        protected _toggleParentTreeNode(ev: MouseEvent): any {
            var children = $(ev.currentTarget).parent('li.parent_li').find(' > ul > li');

            if (children.is(":visible")) {
                children.hide('fast');
                //$(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
            } else {
                children.show('fast');
                //$(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
            }

            ev.stopPropagation();
            return false;
        }

        protected _itemClicked(ev: MouseEvent): any {
            var target = <ITreeViewItem<NamespaceObject>>ev.target;
            var doSelectionChange = true;

            if (ev.shiftKey) {
                FlowScript.UI.renamePrompt(target, target.$__treeItem.name, "Rename component name to:",
                    (el, oldValue, newValue) => { target.$__treeItem.name = newValue; target.innerHTML = target.$__treeItem.name; })
            }
            else {
                if (this._onTypeChanging) {
                    try {
                        doSelectionChange = this._onTypeChanging(target) !== false;
                    }
                    catch (ex) {
                        alert(ex);
                        doSelectionChange = false;
                    }
                }

                if (doSelectionChange)
                    this.selectedNode = target;

                if (this._onTypeChanged) {
                    try {
                        this._onTypeChanged(target);
                    }
                    catch (ex) {
                        alert(ex);
                    }
                }
            }

            ev.stopPropagation();
            return false;
        }
        //highlightedType

        protected _itemDblClicked(ev: MouseEvent): any {
            return this._toggleParentTreeNode(ev);
        }

        protected _onRenderHandler(item: NamespaceObject, parentElement: HTMLElement) { // (src: https://jsfiddle.net/jhfrench/GpdgF/)
            var treeViewItemContainer = <ITreeViewItem<typeof item>><any>document.createElement("li");
            treeViewItemContainer.$__treeItem = item;

            var caption = <ITreeViewItem<typeof item>><any>document.createElement("span");

            caption.className = "_" + item.safeName;

            if (item instanceof Component) {

                caption.className += " " + ComponentTypes[item.componentType];

                if (item.isOperational)
                    caption.className += " op";

                if (item.isObject)
                    caption.className += " object";
            }

            caption.$__treeItem = item;
            caption.innerHTML = item.name;
            caption.onmousedown = (ev: MouseEvent) => { ev.preventDefault(); };
            caption.ondblclick = (ev: MouseEvent) => {
                if (this._singleClickDelayTimer) {
                    clearTimeout(this._singleClickDelayTimer);
                    this._singleClickDelayTimer = 0;
                }
                return this._itemDblClicked(ev);
            };
            caption.onclick = (ev: MouseEvent) => {
                if (this._singleClickDelayTimer) clearTimeout(this._singleClickDelayTimer);
                this._singleClickDelayTimer = setTimeout(() => { this._itemClicked(ev) }, 300);
            };

            treeViewItemContainer.appendChild(caption);

            // ... render child types ...

            if (item.nestedItems && item.nestedItems.length) {
                // ... first, since there are children, add a class to the parent li container ...

                treeViewItemContainer.className = "parent_li";
                //? caption.onclick = toggleParentTreeNode;

                // ... then create a container for the child items ...

                var childItemsContainer = <ITreeViewItem<typeof item>><any>document.createElement("ul");
                treeViewItemContainer.appendChild(childItemsContainer);

                // ... and finally render the child items ...

                for (var i = 0, n = item.nestedItems.length; i < n; ++i)
                    this._onRenderHandler(item.nestedItems[i], childItemsContainer);
            }

            parentElement.appendChild(treeViewItemContainer);

            return treeViewItemContainer;
        };
    }

    // ============================================================================================================================
}
