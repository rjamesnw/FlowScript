namespace FlowScript.UI {
    // ========================================================================================================================

    /** Creates a menu object to work with the script editor context menu. */
    export class Menu {

        get scriptEditor() { return this._scriptEditor; }
        _scriptEditor: ScriptEditor;

        menuRoot: HTMLElement;
        menuTitle: HTMLElement;
        menuClose: HTMLElement;
        menuBody: Views;

        onHide: { (menu: Menu): any };

        onOptionSelected: (menu: Menu, name: string) => void;

        x = 0;
        y = 32;

        private _dragOfsX: number;
        private _dragOfsY: number;
        private _dragStart = false;

        get isVisible(): boolean { return this.menuRoot && this.menuRoot.style && this.menuRoot.style.display != "none"; }

        constructor(scriptEditor: ScriptEditor, elementOrID: HTMLElement | string) {
            this._scriptEditor = scriptEditor;

            if (elementOrID instanceof HTMLElement)
                this.menuRoot = elementOrID;
            else {
                this.menuRoot = this._scriptEditor.view.getElementById(elementOrID);

                if (!this.menuRoot)
                    throw "There is no menu with ID '" + elementOrID + "'.";
            }

            this.menuTitle = <HTMLElement>this.menuRoot.querySelector("#menuTitle");
            this.menuClose = <HTMLElement>this.menuRoot.querySelector("#menuClose");
            if (this.menuClose)
                this.menuClose.onclick = () => { if (!this.onHide || this.onHide(this) !== false) this.hide(); };

            this.menuBody = this._scriptEditor.view.getViewContainer("menuBody");
            if (!this.menuBody)
                throw "There is no menu body container with the name 'menuBody'.";

            this.menuBody.rootNode.addEventListener("click", (ev) => { // (watch for click on any button)
                var el = <HTMLElement>ev.target;
                if (el && el.nodeName == "BUTTON" && el.id) {
                    if (this.onOptionSelected)
                        this.onOptionSelected(this, (<HTMLElement>ev.target).id);
                    ev.stopImmediatePropagation();
                }
            }, true);

            // ... hook into resize events on all views ...

            for (var i = 0, n = this.menuBody.count; i < n; ++i)
                this.menuBody.views[i].onresize((v) => { this._onResized(); });

            this.setPos(this.x, this.y);

            // ... setup drag-n-drop for this menu ...

            this.menuRoot.addEventListener("mousedown", (ev: MouseEvent) => {
                this._dragOfsX = this.x - mouseX; this._dragOfsY = this.y - mouseY; this._dragStart = true;
                ev.preventDefault();
                return false;
            }, false);
            window.addEventListener("mouseup", (ev: MouseEvent) => {
                this._dragStart = false;
                ev.preventDefault();
                return false;
            }, true);
            window.addEventListener("mousemove", (ev: MouseEvent) => {
                if (this._dragStart) this.setPos(mouseX + this._dragOfsX, mouseY + this._dragOfsY);
                this.moveInView();
                ev.preventDefault();
            }, true);
        }

        setPos(x: number, y: number): this {
            if (x === void 0) x = mouseX;
            if (y === void 0) y = mouseY;
            this.x = x;
            this.y = y;
            this.menuRoot.style.left = x + 'px';
            this.menuRoot.style.top = y + 'px';
            return this;
        }

        /** Reposition the menu to be within the viewport. */
        moveInView(): this {
            // ... keep within the view port ...

            var vpSize = Browser.getViewportSize();
            var menuSize = this.menuRoot.getBoundingClientRect();

            var x = this.x, y = this.y;

            if (x < 0) x = 0;
            if (x + menuSize.width > vpSize.width) x = vpSize.width - menuSize.width;

            if (y < 64) y = 64;
            if (y + menuSize.height > vpSize.height) y = vpSize.height - menuSize.height;

            this.setPos(x, y);

            return this;
        }

        private _onResized() { this.moveInView(); }

        /**
         * Show the menu by view name.
         * @param menuName The view menu for the menu to show.
         * @param hideSelections A string list of names (element IDs) of menu items to hide.  Pass in 'null' to keep the same selections as as last time.
         */
        show(menuName: string, menuTitle?: string, hideSelections: { [index: string]: boolean } = {}): this {
            var menuView = this.menuBody.showView(menuName);
            // ... show all selections by default, unless specific element IDs are given ...
            for (var i = 0, n = menuView.contentElement.childNodes.length; i < n; ++i) {
                var el = <HTMLElement>menuView.contentElement.childNodes[i];
                if (el.style)
                    el.style.display = hideSelections && (!(el.id in hideSelections) || hideSelections[el.id]) ? "" : "none";
            }
            if (this.menuTitle)
                this.menuTitle.innerHTML = menuTitle || menuView.rootElement.title || "";
            this.menuRoot.style.display = "";
            return this;
        }

        hide(): this { this.menuRoot.style.display = "none"; return this; }
    }

    // ============================================================================================================================
}
