//? declare var $: any;
import {AutoComplete}  from "./AutoComplete";

export class AutoCompleteView {

    private selectedClassName = 'ace_autocomplete_selected';

    public wrap: HTMLDivElement;
    public listElement: HTMLUListElement;

    constructor(public editor: AceAjax.Editor, public autoComplete: AutoComplete) {
        this.wrap = document.createElement('div');
        this.listElement = document.createElement('ul');
        this.wrap.className = 'ace_autocomplete';
        this.wrap.style.display = 'none';
        this.listElement.style.listStyleType = 'none';
        this.wrap.style.position = 'fixed';
        this.wrap.style.zIndex = '1000';
        this.wrap.appendChild(this.listElement);
    }

    show() {
        return this.wrap.style.display = 'block';
    };

    hide() {
        return this.wrap.style.display = 'none';
    };

    setPosition(coords: { pageX: number, pageY: number }) {
        var bottom: number, editorBottom: number, top: number;
        top = coords.pageY + 20;
        editorBottom = $(this.editor.container).offset().top + $(this.editor.container).height();
        bottom = top + $(this.wrap).height();
        if (bottom < editorBottom) {
            this.wrap.style.top = top + 'px';
            return this.wrap.style.left = coords.pageX + 'px';
        } else {
            this.wrap.style.top = (top - $(this.wrap).height() - 20) + 'px';
            return this.wrap.style.left = coords.pageX + 'px';
        }
    };

    current(): Element {
        var child: Element, children: NodeList, p: string;
        children = this.listElement.childNodes;
        for (p in children) {
            child = <Element>children[p];
            if (child.className === this.selectedClassName)
                return child;
        }
        return null;
    };

    focusNext() {
        var curr = this.current();
        var focus = <HTMLElement>curr.nextSibling;

        if (focus) {
            //Shermie Added: Hide the doc of previous selected item and Show the doc of current selected item
            var _child = <HTMLElement>curr.querySelector(".label-doc");
            _child.style.display = "none";
            _child = <HTMLElement>focus.querySelector(".label-doc");
            _child.style.display = "";

            curr.className = '';
            focus.className = this.selectedClassName;

            return this.adjustPosition();
        }
    };

    focusPrev() {
        var curr = this.current();
        var focus = <HTMLElement>curr.nextSibling;

        if (focus) {
            //Shermie Added: Hide the doc of previous selected item and Show the doc of current selected item
            var _child = <HTMLElement>curr.querySelector(".label-doc");
            _child.style.display = "none";
            _child = <HTMLElement>focus.querySelector(".label-doc");
            _child.style.display = "";

            curr.className = '';
            focus.className = this.selectedClassName;
            return this.adjustPosition();
        }
    };

    ensureFocus() {
        if (!this.current()) {
            var firstChild = <Element>this.listElement.firstChild;
            if (firstChild) {
                firstChild.className = this.selectedClassName;
                //Shermie Added: Show the doc of the selected item
                var _child = <HTMLElement>firstChild.querySelector(".label-doc");
                _child.style.display = "";
                return this.adjustPosition();
            }
        }
    };

    adjustPosition() {
        var elm: Element, elmOuterHeight: number, newMargin: string, pos: JQueryCoordinates, preMargin: number, wrapHeight: number;
        elm = this.current();
        if (elm) {
            newMargin = '';
            wrapHeight = $(this.wrap).height();
            elmOuterHeight = $(elm).outerHeight();
            preMargin = parseInt($(this.listElement).css("margin-top").replace('px', ''), 10);
            pos = $(elm).position();
            if (pos.top >= (wrapHeight - elmOuterHeight)) {
                newMargin = (preMargin - elmOuterHeight) + 'px';
                $(this.listElement).css("margin-top", newMargin);
            }
            if (pos.top < 0) {
                //newMargin = (-pos.top + preMargin) + 'px';

                //Shermie Modified: set scrollbar to top
                newMargin = 0 + 'px';
                $(this.listElement).css("margin-top", newMargin);
                $('.ace_autocomplete').scrollTop(0);
                return $(this.listElement);
            }
        }
    };


}