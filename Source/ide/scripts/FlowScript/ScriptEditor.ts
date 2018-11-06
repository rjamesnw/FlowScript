namespace FlowScript.UI {
    // ========================================================================================================================
    // Mouse position events (for pop-ups, etc.)
    export var mouseX: number;
    export var mouseY: number;

    document.addEventListener("mousemove", handleMouseMove);

    function handleMouseMove(event: MouseEvent) {
        var eventDoc: Document, doc: HTMLElement, body: HTMLElement, pageX: number, pageY: number;

        event = event || <MouseEvent>window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && (<any>event.target)['ownerDocument']) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            (<any>event).pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            (<any>event).pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }

        // Use event.pageX / event.pageY here
        mouseX = event.pageX;
        mouseY = event.pageY;
    }

    // ========================================================================================================================

    export function renamePrompt(element: HTMLElement, currentValue: string, promptText: string, onrename: { (el: HTMLElement, oldValue: string, newValue: string): void }) {
        var newValue = currentValue;
        while (true) {
            var newValue = prompt(promptText, newValue);
            if (newValue && newValue != currentValue)
                try { onrename(element, currentValue, newValue); break; }
                catch (ex) { alert(ex); }
            else
                break;
        }
    }

    // ========================================================================================================================
    // Tabbing 

    export function showTab(name: string) {
        $('.nav-tabs a[href="#' + name + '"]').tab('show');
    };

    // ========================================================================================================================

    export class ScriptEditor {

        get view(): View { return this._view; }
        private _view: View;

        paramsEditor: ListEditor;
        localVarsEditor: ListEditor;
        returnVarsEditor: ListEditor;
        instanceVarsEditor: ListEditor;

        typeTree: TypeTreeView;
        private treeViewContainer: Views;
        compNamespace: HTMLElement;
        compName: HTMLElement;
        compTitle: HTMLElement;
        compType: HTMLSelectElement;
        instType: HTMLElement;

        private btnCancelTypeSelect: HTMLButtonElement;
        private btnNoTypeSelect: HTMLButtonElement;

        currentProject: ProjectUI;

        aceEditor: FlowScript.UI.ACE.ACEEditor;

        // ========================================================================================================================

        /** Sets the project to use for this editor. */
        setProject(project: ProjectUI) {
            this.currentProject = project;
        }

        // ========================================================================================================================

        /** The element of the view where components render to. */
        blocksContainer: HTMLElement;
        /** Holds the tabs for TypeScript code editors. */
        codeContainer: HTMLElement;
        codeBlocksRootNode: HTMLElement;
        menu: Menu;
        private expressionMenuTitle: HTMLElement;
        private exprMenuClose: HTMLButtonElement;
        private exprMenu_remove: HTMLButtonElement;
        private exprMenu_move: HTMLButtonElement;
        private exprMenu_clone: HTMLButtonElement;
        private exprMenu_setConstant: HTMLButtonElement;

        /** The node the user selected in the visual tree. */
        private selectedNode: VisualNode = null;
        /** The currently select visual node representing an expression, or the top most expression node if the current node does not represent an expression. */
        private selectedExpressionNode: VisualNode;
        /** The currently select visual node representing a component reference argument (component parameter), or the top most parameter node if the current node does not represent an expression. */
        private selectedParameterNode: VisualNode; // (note: this says "parameter", thinking from a user perspective, but this is also an "argument", from a component reference perspective)
        /** The currently select visual node representing a component reference, or the top most component reference node if the current node does not represent a component reference. */
        private selectedComponentReferenceNode: VisualNode;
        /** The parameter name, if 'selectedParameterNode' is set. */
        private selectedParamName: string;
        /** The parameter index, if 'selectedParameterNode' is set. */
        private selectedParamIndex: number;
        /** The line that is the parent of the statement that contains the selected node. */
        private selectedLineNode: VisualNode;

        // ------------------------------------------------------------------------------------------------------------------------

        /**
         * Constructs a new ScriptEditor object to wrap the script editing UI.
         * @param view The view that contains the UI to wrap.
         */
        constructor(view: View) {
            if (!view || !(view instanceof View)) throw "A view object is required.";
            this._view = view;
            this._initUI();
        }

        /** Calls all '_initUI_*' functions to hook up the view UI elements for this editor instance. */
        private _initUI() {
            this._initUI_PropertyEditors();
            this._initUI_TypeTree();
            this._initUI_EditorMenu();
            this._initUI_ScratchContainer();
            this._initUI_CodeOutput();
        }

        /**
         * Connects the property editor UI elements to the script editor.
         */
        private _initUI_PropertyEditors() {
            // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
            // ... hookup the list boxes ...

            function paramsEditorRefresh(collection: PropertyCollection, p: Property, data: ListEditor, ev?: IEventDispatcher<PropertyCollection>) { data.refresh(); }

            this.paramsEditor = new ListEditor(this, "Parameters", "tbParam", "btnAddParam", "btnRemoveParam", "selParams",
                (editor): PropertyCollection => { // get values
                    var comp = this.currentProject ? this.currentProject.currentComponent : null;
                    var props = comp ? comp.parameters : null;
                    if (editor._component != comp) {
                        if (editor._component) {
                            editor._component.parameters._addedEvent.remove(paramsEditorRefresh);
                            editor._component.parameters._removedEvent.remove(paramsEditorRefresh);
                        }
                        editor._component = comp;
                        if (comp) {
                            comp.parameters.onadded(paramsEditorRefresh, editor);
                            comp.parameters.onremoved(paramsEditorRefresh, editor);
                        }
                    }
                    return props;
                },
                (editor, value) => { // add
                    editor._component.defineParameter(value, [System.Any]);
                    editor.selectedIndex = editor.listBox.length - 1;
                },
                (editor, selectedOption, newValue, index) => { // rename
                    editor._component.renameParameter(selectedOption.$__fs_property, newValue);
                    editor.setCurrentValue(newValue);
                },
                (editor, selectedOption, index) => { // remove
                    var selectedProp = selectedOption.$__fs_property;
                    if (editor._component.returnVars.hasProperty(selectedProp.name))
                        if (!confirm("Removing this also removes the return variable of the same name; continue?"))
                            return;
                    editor._component.removeParameter(selectedProp);
                    this.currentProject.addToBin(selectedProp.createExpression(), false);
                });

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            function localVarsEditorRefresh(collection: PropertyCollection, p: Property, data: ListEditor, ev?: IEventDispatcher<PropertyCollection>) { data.refresh(); }

            this.localVarsEditor = new ListEditor(this, "Local Variables", "tbLocal", "btnAddLocal", "btnRemoveLocal", "selLocals",
                (editor): PropertyCollection => { // get values
                    var comp = this.currentProject ? this.currentProject.currentComponent : null;
                    var props = comp ? comp.localVars : null;
                    if (editor._component != comp) {
                        if (editor._component) {
                            editor._component.localVars._addedEvent.remove(localVarsEditorRefresh);
                            editor._component.localVars._removedEvent.remove(localVarsEditorRefresh);
                        }
                        editor._component = comp;
                        if (comp) {
                            comp.localVars.onadded(localVarsEditorRefresh, editor);
                            comp.localVars.onremoved(localVarsEditorRefresh, editor);
                        }
                    }
                    return props;
                },
                (editor, value) => { // add
                    editor._component.defineLocalVar(value, [System.Any]);
                    editor.selectedIndex = editor.listBox.length - 1;
                },
                (editor, selectedOption, newValue, index) => { // rename
                    editor._component.renameLocalVar(selectedOption.$__fs_property, newValue);
                    editor.setCurrentValue(newValue);
                },
                (editor, selectedOption, index) => { // remove
                    var selectedProp = selectedOption.$__fs_property;
                    if (editor._component.returnVars.hasProperty(selectedProp.name))
                        if (!confirm("Removing this also removes the return variable of the same name; continue?"))
                            return;
                    editor._component.removeLocalVar(selectedProp);
                    this.currentProject.addToBin(selectedProp.createExpression(), false);
                });

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            function returnVarsEditorRefresh(collection: PropertyCollection, p: Property, data: ListEditor, ev?: IEventDispatcher<PropertyCollection>) { data.refresh(); }

            this.returnVarsEditor = new ListEditor(this, "Return Variables", "tbReturn", "btnAddReturn", "btnRemoveReturn", "selReturns",
                (editor): PropertyCollection => { // get values
                    var comp = this.currentProject ? this.currentProject.currentComponent : null;
                    var props = comp ? comp.returnVars : null;
                    if (editor._component != comp) {
                        if (editor._component) {
                            editor._component.returnVars._addedEvent.remove(returnVarsEditorRefresh);
                            editor._component.returnVars._removedEvent.remove(returnVarsEditorRefresh);
                        }
                        editor._component = comp;
                        if (comp) {
                            comp.returnVars.onadded(returnVarsEditorRefresh, editor);
                            comp.returnVars.onremoved(returnVarsEditorRefresh, editor);
                        }
                    }
                    return props;
                },
                (editor, value) => { // add
                    editor._component.defineReturnVar(value, System.Any);
                    editor.selectedIndex = editor.listBox.length - 1;
                },
                (editor, selectedOption, newValue, index) => { // rename
                    editor._component.renameReturnVar(selectedOption.$__fs_property, newValue);
                    editor.setCurrentValue(newValue);
                },
                (editor, selectedOption, index) => { // remove
                    var selectedProp = selectedOption.$__fs_property;
                    editor._component.removeReturnVar(selectedProp);
                    this.currentProject.addToBin(selectedProp.createExpression(), false);
                });

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            function instanceVarsEditorRefresh(collection: PropertyCollection, p: Property, data: ListEditor, ev?: IEventDispatcher<PropertyCollection>) { data.refresh(); }

            this.instanceVarsEditor = new ListEditor(this, "Instance Variables", "tbInstance", "btnAddInstance", "btnRemoveInstance", "selInstances",
                (editor): PropertyCollection => { // get values
                    var comp = this.currentProject ? this.currentProject.currentComponent : null;
                    var props = comp ? comp.instanceProperties : null;
                    if (editor._component != comp) {
                        if (editor._component) {
                            editor._component.instanceProperties._addedEvent.remove(instanceVarsEditorRefresh);
                            editor._component.instanceProperties._removedEvent.remove(instanceVarsEditorRefresh);
                        }
                        editor._component = comp;
                        if (comp) {
                            comp.instanceProperties.onadded(instanceVarsEditorRefresh, editor);
                            comp.instanceProperties.onremoved(instanceVarsEditorRefresh, editor);
                        }
                    }
                    return props;
                },
                (editor, value) => { // add
                    editor._component.defineInstanceProperty(value, [System.Any]);
                    editor.selectedIndex = editor.listBox.length - 1;
                },
                (editor, selectedOption, newValue, index) => { // rename
                    editor._component.renameInstanceProperty(selectedOption.$__fs_property, newValue);
                    editor.setCurrentValue(newValue);
                },
                (editor, selectedOption, index) => { // remove
                    var selectedProp = selectedOption.$__fs_property;
                    editor._component.removeInstanceProperty(selectedProp);
                    this.currentProject.addToBin(selectedProp.createExpression(), false);
                });
        }


        typePrompt(ok: { (node: ITreeViewItem<Type>): boolean }, msg?: string) {
            alert(msg || "Please select a type from the tree.");
            var containerEl = this.typeTree.view.rootElement;
            containerEl.style.backgroundColor = "#f0fff0";
            this.btnCancelTypeSelect.style.display = ""
            this.btnNoTypeSelect.style.display = ""
        }

        cancelTypePrompt() {
            var containerEl = this.typeTree.view.rootElement;
            containerEl.style.backgroundColor = "";
            this.btnCancelTypeSelect.style.display = "none";
            this.btnNoTypeSelect.style.display = "none";
        }

        /**
         * Connects the type tree editor UI elements to the script editor.
         */
        private _initUI_TypeTree() {
            this.compNamespace = this._view.getElementById("compNamespace");
            this.compName = this._view.getElementById("compName");

            this.treeViewContainer = this._view.getViewContainer("treeViewContainer");
            this.typeTree = new TypeTreeView(this, this.treeViewContainer.getView("tvTypes"));
            this.typeTree._onTypeChanging = (node) => {
                var title = "Type Menu";
                if (node.$__treeItem)
                    if (node.$__treeItem instanceof Component)
                        title = "<span title=\"" + node.$__treeItem.fullTypeName.replace(/"/g, "&quot;") + "\">Component '" + node.$__treeItem.name + "'</span>";
                    else
                        title = "<span title=\"" + node.$__treeItem.fullTypeName.replace(/"/g, "&quot;") + "\">Namespace type '" + node.$__treeItem.name + "'</span>";

                this.showTypeMenu("typeMenu", title);
            };
            this.typeTree._onTypeChanged = (node) => {
                if (node.$__treeItem instanceof Component) {
                    var comp = <Component>node.$__treeItem;
                    if (comp.componentType == ComponentTypes.Code) {
                        this.aceEditor.setCode((<FlowScript.Core.Code>comp).Code || "");
                    }
                }
                this.refreshComponentDetails(true);
            };

            this.btnCancelTypeSelect = this._view.getElementById<HTMLButtonElement>("btnCancelTypeSelect");
            this.btnCancelTypeSelect.onclick = (ev) => { this.cancelTypePrompt(); };

            this.btnNoTypeSelect = this._view.getElementById<HTMLButtonElement>("btnNoTypeSelect");
            this.btnNoTypeSelect.onclick = (ev) => { if (this.typeTree._onTypeChanging) this.typeTree._onTypeChanging(null); this.cancelTypePrompt(); };

            this.compTitle = this._view.getElementById("compTitle");
            this.compTitle.innerHTML = "";
            this.compTitle.onclick = (ev: MouseEvent) => {
                if (this.typeTree.selectedNode) {
                    var type = this.typeTree.selectedNode.$__treeItem;
                    if (type instanceof Component) {
                        var comp = <Component>type;
                        renamePrompt(this.compTitle, comp.title, "Rename component title to:", (el, oldValue, newValue) => { comp.title = newValue; this.refreshComponentDetails(true); })
                    }
                }
            };

            this.compType = this._view.getElementById<HTMLSelectElement>("compType");
            this.compType.innerHTML = "";
            var opt = document.createElement("option");
            opt.value = "";
            opt.innerHTML = "<i>(undefined)</i>";
            this.compType.add(opt);
            for (var enumName in ComponentTypes) {
                var i = +enumName;
                if (isNaN(i)) {
                    var opt = document.createElement("option");
                    opt.value = ComponentTypes[enumName];
                    opt.innerHTML = enumName;
                    this.compType.add(opt);
                }
            }
            this.compType.onchange = (ev: Event) => {
                //var typeTree = ScriptEditor.typeTree;
                if (this.typeTree.selectedNode && this.compType.selectedIndex > 0) {
                    var type = this.typeTree.selectedNode.$__treeItem;
                    if (type instanceof Component) {
                        var comp = <Component>type;
                        var opt = <HTMLOptionElement>this.compType.options[this.compType.selectedIndex];
                        comp.componentType = +opt.value;
                    }
                }
                else if (this.compType.selectedIndex == 0) {
                    if (this.typeTree.selectedNode && this.typeTree.selectedNode.$__treeItem instanceof Component) {
                        alert("You cannot set a component type to undefined.");
                        //?compType.value = "" + (<Component>typeTree.selectedItem.$__treeItem).componentType;
                    }
                }
                this.refreshComponentDetails(true);
            };

            this.instType = this._view.getElementById("instType");
            this.instType.innerHTML = "";
            this.instType.onclick = (ev: MouseEvent) => {
                if (this.typeTree.selectedNode) {
                    var type = this.typeTree.selectedNode.$__treeItem;
                    if (type instanceof Component) {
                        var comp = <Component>type;
                        this.typePrompt((node) => {
                            if (node) {
                                var selType = node.$__treeItem;
                                if (!(selType instanceof Component))
                                    throw "The selected type '" + selType + "' is not a component.";
                                var selObjComp = <Component>selType;
                                if (selObjComp.componentType != ComponentTypes.Object)
                                    throw "The selected component '" + selObjComp + "'is not an object type.";
                            } else selObjComp = null;
                            comp.instanceType = selObjComp;
                            this.cancelTypePrompt();
                            this.refreshComponentDetails(true);
                            return true;
                        }, "Please select a type that the current component will work on.  The type must represent an object instance type.");
                    }
                }
            };
        }

        /**
         * Connects the scratch bin container UI elements to the script editor.
         */
        private _initUI_ScratchContainer() {
            this.scratchContainer = this._view.getElementById("scratchContainer");
        }

        /**
         * Connects the code output UI elements to the script editor.
         */
        private _initUI_CodeOutput() {
            this.blocksContainer = this._view.getElementById("blocksContainer");
            this.codeContainer = this._view.getElementById("codeContainer");
            this.blockCodeOutput = this._view.getElementById<HTMLDivElement>("blockCodeOutput");
            this.aceEditor = new FlowScript.UI.ACE.ACEEditor(this.view, "tseditor", "tsoutput");
            this.aceEditor.initialize(() => {
                //this.editor.loadLibFiles(["Scripts/FlowScript/ace/environments/serverlib.d.ts"]);
                this.aceEditor.loadFile("Scripts/FlowScript/ace/environments/empty.ts");
                this.view.getElementById('btnSaveCode').onclick = () => {
                    (<FlowScript.Core.Code>this.currentProject.currentComponent).Code = this.aceEditor.getCode();
                    alert("Saved.");
                };
            });
        }

        /**
         * Connects the type tree editor UI elements to the script editor.
         */
        private _initUI_EditorMenu() {
            this.menu = new Menu(this, "menu");
            this.menu.onOptionSelected = (menu, itemID) => {
                switch (itemID) {
                    case "exprMenu_Pick": this._onPickExpr(); break;
                    case "exprMenu_Drop": this._onDropExpr(); break;
                    case "exprMenu_Remove": this._onRemoveExpr(); break;
                    case "exprMenu_Clone": this._onCloneExpr(); break;
                    case "exprMenu_SetConstant": this._onSetConst(); break;
                    case "exprMenu_AddLineAbove": this._onAddBlockLineAbove(); break;
                    case "exprMenu_AddLineBelow": this._onAddBlockLineBelow(); break;

                    case "typeMenu_Edit": this._onEditType(); break;
                    case "typeMenu_Rename": this._onRenameType(); break;
                    case "typeMenu_Add": this._onAddType(); break;
                    case "typeMenu_Remove": this._onRemoveType(); break;
                }
            };
        }

        // --------------------------------------------------------------------------------------------------------------------

        hideAllEditors() {
            this.blocksContainer.classList.remove("active");
            this.codeContainer.classList.remove("active");
        }

        showBlockEditor() {
            this.blocksContainer.classList.add("active");
            this.codeContainer.classList.remove("active");
        }

        showCodeEditor() {
            this.blocksContainer.classList.remove("active");
            this.codeContainer.classList.add("active");
        }

        // --------------------------------------------------------------------------------------------------------------------

        private _onPickExpr() {
        }

        private _onDropExpr() {
        }

        private _onRemoveExpr() {
            var expr: Expression;

            try {
                if (this.selectedNode)
                    if (this.selectedNode.type == VisualNodeTypes.ComponentParameter) {
                        // ... remove an argument in this parameter position ...
                        var compRef = this.selectedNode.componentRef;
                        expr = compRef.arguments.getArg(this.selectedNode.paramName);
                        if (expr)
                            expr = expr.remove();
                        else
                            alert("There is no argument set for parameter '" + this.selectedNode.paramName + "' of component reference '" + this.selectedNode.component + "'.");
                    } else if (this.selectedNode.type == VisualNodeTypes.Line) {
                        var line = this.selectedNode.asLine.remove();
                        if (line)
                            if (line.hasStatements)
                                expr = line.createExpression();
                            else
                                this.renderVisualCode(); // (because there is no expression to put in the bin, we need to do a refresh here now)
                    } else if (this.selectedExpressionNode) {
                        // ... remove the selected expression ...
                        if (this.currentProject.isInBin(this.selectedExpressionNode.asExpression))
                            this.currentProject.removeFromBin(this.selectedExpressionNode.asExpression); // (removed for good when removed from the bin)
                        else
                            expr = this.selectedExpressionNode.asExpression.remove();
                    }
            }
            catch (ex) {
                alert(ex);
            }

            if (expr) {
                this.currentProject.addToBin(expr, false);
                this.refreshComponentDetails(); // (eventually refreshes and visual code calls 'unselectNode()')
            }
            else
                this.unselectNode();
        }

        private _onSetConst() {
            if (!this.selectedParameterNode) {
                alert("There is no parameter selected.");
                this.unselectNode();
            }
            else {
                var compRef = this.selectedParameterNode.componentRef;

                if (compRef) {
                    var value = <any>prompt("Enter a constant value:", "");
                    if (value !== null) {
                        if (value == "=true")
                            value = true;
                        else if (value == "=false")
                            value = false;
                        else if (value[0] == '=') {
                            var n = +value.substring(1);
                            if (!isNaN(n))
                                value = n;
                        } else if (value[0] == '"' && value[value.length - 1] == '"')
                            value = value.substring(1, value.length - 1);
                        else if (isNaN(+value))
                            value = value.trim ? value.trim() : value;
                        else
                            value = +value;

                        var existingExpr = compRef.arguments.getArg(this.selectedParamName);

                        try {
                            compRef.arguments.setArg(this.selectedParamName, new Constant(value));
                        }
                        catch (ex) {
                            alert(ex);
                        }

                        if (existingExpr)
                            this.currentProject.addToBin(existingExpr, false);

                        this.refreshComponentDetails();
                    }
                }
                else {
                    alert("There is no component reference in the parent hierarchy.");
                    this.unselectNode();
                }
            }
        }

        private _onCloneExpr() {
            if (this.selectedExpressionNode) {
                try {
                    if (!this.selectedExpressionNode.asExpression) {
                        alert("The current selection is not an expression, nor is nested in a parent expression.");
                        return;
                    }
                    var clone = this.selectedExpressionNode.expression.clone();
                    this.currentProject.addToBin(clone);
                }
                catch (ex) {
                    alert(ex);
                }
            }
            this.unselectNode();
        }

        /** The expression selected to move. */
        private selectedMoveExpressionNode: VisualNode;

        //? private _onMoveExpr() {
        //    if (this.selectedExpressionNode) {
        //        this.selectedMoveExpressionNode = this.selectedExpressionNode;

        //        this.hideBlockMenu();
        //    }
        //    else
        //        this.unselectNode();
        //}

        private _onAddBlockLineAbove() {
            var line: Line = this.selectedNode.line;
            if (line) {
                line.block.insertLineBefore(line.lineIndex);
                this.refreshComponentDetails();
            }
            else alert("No line could be determined from the selection.");
        }

        private _onAddBlockLineBelow() {
            var line: Line = this.selectedNode.line;
            if (line) {
                line.block.insertLineAfter(line.lineIndex);
                this.refreshComponentDetails();
            }
            else alert("No line could be determined from the selection.");
        }

        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

        private _onEditType() {
            var comp: Component = this.typeTree.selectedItem instanceof Component ? <Component>this.typeTree.selectedItem : null;
            if (comp) {
                if (comp.componentType == ComponentTypes.Functional || comp.componentType == ComponentTypes.Code) {
                    this.hideTypeMenu(false);
                    this.refreshComponentDetails();
                    showTab("editor");
                }
                else alert("You can only edit functional or code components.");
            }
            else alert("Type nodes act like namespaces, and do not have blocks or code to edit.");
        }

        private _onRenameType() {
            var selType: Type = this.typeTree.selectedItem;
            if (selType) {
                var type = this.typeTree.selectedNode.$__treeItem;
                if (type) {
                    renamePrompt(this.typeTree.selectedNode, type.name, "Rename type to:",
                        (el, oldValue, newValue) => { type.name = newValue; this.typeTree.refresh(); this.refreshComponentDetails(); })
                }
            }
            else alert("The selected type is not a component.");
        }

        private _onAddType() {
        }

        private _onRemoveType() {
        }

        // --------------------------------------------------------------------------------------------------------------------

        private static _hideNodeMenu(menu: Menu) { menu.scriptEditor.unselectNode(); };

        hideBlockMenu() {
            if (this.selectedNode)
                this.selectedNode._HideSelectedStyle();
            if (this.menu)
                this.menu.hide();
        }

        showBlockMenu(menuName: string, menuTitle?: string, hideSelections?: { [index: string]: string }, x?: number, y?: number) {
            if (this.selectedNode)
                this.selectedNode._ShowSelectedStyle();
            if (this.menu) {
                this.menu.setPos(x, y).show(menuName, menuTitle, hideSelections);
                this.menu.onHide = ScriptEditor._hideNodeMenu;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        private static _hideTypeMenu(menu: Menu) { menu.scriptEditor.hideTypeMenu(); return false; };

        hideTypeMenu(restorePreviousSelection = true) {
            if (this.menu.isVisible) {
                if (restorePreviousSelection && this.typeTree && this.typeTree.prevSelectedNode)
                    this.typeTree.selectedNode = this.typeTree.prevSelectedNode;
                this.menu.hide();
                this.refreshComponentDetails(true);
            }
        }

        showTypeMenu(menuName: string, menuTitle: string, hideSelections?: { [index: string]: string }, x?: number, y?: number) {
            if (this.menu.isVisible)
                this.hideTypeMenu();
            this.menu.setPos(x, y).show(menuName, menuTitle, hideSelections);
            this.menu.onHide = ScriptEditor._hideTypeMenu;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /**
      * Selects a given node in the UI.
      * @param node The node to select.
      * @param title A title for the pop-up window that shows when nodes are selected.
      * @param promptX The 'X' position for the selection pop-up menu.
      * @param promptY The 'Y' position for the selection pop-up menu.
      */
        selectNode(node: VisualNode, menuName = "exprMenu", menuTitle?: string, hideSelections?: { [index: string]: string }, promptX?: number, promptY?: number) {
            this.unselectNode();

            if (node) {
                this.selectedNode = node;

                this.selectedExpressionNode = this.getVisualNode(this.selectedNode, Expression); // (get the nearest expression node from the this selected node)
                this.selectedParameterNode = this.getVisualNode(this.selectedExpressionNode, void 0, VisualNodeTypes.ComponentParameter); // (get the nearest parameter node from the nearest selected expression node [for setting arguments to parameters])
                this.selectedParamName = this.selectedParameterNode ? (this.selectedParameterNode.paramName || null) : null;
                this.selectedParamIndex = this.selectedParamName ? +this.selectedParameterNode.paramIndex : -1;
                this.selectedComponentReferenceNode = this.getVisualNode(this.selectedParameterNode, ComponentReference); // (get the nearest component reference node from the nearest selected parameter node [the parent component reference to the selected parameter])
                this.selectedLineNode = this.getVisualNode(this.selectedExpressionNode, Line);

                var selMoveExprNode = this.selectedMoveExpressionNode; // (get the expression selected to move, then clear the select reference)
                this.selectedMoveExpressionNode = null;

                if (selMoveExprNode && this.selectedNode) { // (if 'selMoveExprNode' exists, and a current selection is made, then this is a move operation)
                    if (!this.selectedParameterNode) {
                        alert("There is no parameter selected.");
                        this.unselectNode();
                    }
                    else {
                        var compRef = this.selectedParameterNode.componentRef;

                        if (!compRef) {
                            alert("There is no component reference for the selected parameter.");
                            this.unselectNode();
                        }
                        else {
                            try {
                                //var existingExpr = selectedExpression.getArgument(selectedParamName);
                                this.currentProject.removeFromBin(selMoveExprNode.asExpression, false); // (in case the moved expression was in the bin)
                                selMoveExprNode.asExpression.remove(); // (remove from wherever it is now)
                                var replacedExpr = compRef.arguments.setArg(this.selectedParamName, selMoveExprNode.asExpression); // (add to new spot)
                                if (replacedExpr)
                                    this.currentProject.addToBin(replacedExpr, false);
                            }
                            catch (ex) {
                                alert(ex);
                            }

                            this.refreshComponentDetails();
                        }
                    }
                }
                else {
                    this.showBlockMenu(menuName, menuTitle, hideSelections, promptX, promptY);
                }
            }
        }

        unselectNode() {
            if (this.selectedNode) {
                this.hideBlockMenu();
                this.selectedNode = null;
                this.selectedExpressionNode = null;
                this.selectedParameterNode = null;
                this.selectedParamName = null;
                this.selectedParamIndex = -1;
                this.selectedComponentReferenceNode = null;
                this.selectedLineNode = null;
            }
        }

        ///** 
        // * Same as 'selectNode()', except it selects the current node as a component reference parameter argument, or the nearest parent if nested.
        // * @param fromNode The node to start the search from.
        // * @param title See 'selectNode()'.
        // * @param promptX See 'selectNode()'.
        // * @param promptY See 'selectNode()'.
        // */
        //? selectParameter(fromNode?: IVisualNodeElement, title = "Parameter Menu", promptX?: number, promptY?: number) {
        //    this.selectNode(this.getParameterNode(fromNode || this.selectedNode), title, promptX, promptY);
        //}

        /**
         * Returns the first visual node from a given node, or its parents, that matches given criteria.
         * If no criteria is given, the function simply extracts the visual node from the given node object as is.
         * @param node The node to begin searching from.
         * @param itemType The type of the underlying visual node item to find. If not specified, the parameter is ignored.
         * @param nodeType The type of visual node to find. If not specified, the parameter is ignored.
         */
        getVisualNode(node: HTMLElement | IVisualNodeElement | VisualNode, itemType?: { new (...args: any[]): any }, nodeType?: VisualNodeTypes): VisualNode {
            if (node === null || typeof node != 'object') return null;
            var vn = node instanceof VisualNode ? node : (<IVisualNodeElement>node).$__fs_vnode;
            if (vn) {
                if ((itemType === void 0 || vn.item instanceof itemType) && (nodeType === void 0 || vn.type == nodeType))
                    return vn;
                else
                    return this.getVisualNode(vn.parent, itemType, nodeType);
            } else if ((<HTMLElement>node).parentElement)
                return this.getVisualNode((<HTMLElement>node).parentElement, itemType, nodeType);
            else
                return null;
        }

        /** Returns the first parent parameter from a given node, or its parents. */
        getParameterNode(node: HTMLElement | IVisualNodeElement | VisualNode): VisualNode {
            return this.getVisualNode(node, void 0, VisualNodeTypes.ComponentParameter);
        }

        // --------------------------------------------------------------------------------------------------------------------

        refreshComponentDetails(detailsOnly?: boolean) {
            var tv = this.typeTree;

            this.currentProject.currentComponent = null; // (gets updated later with type selected in the tree, if any)

            if (this.currentProject && tv.selectedItem) {
                if (!tv.selectedItem || !(tv.selectedItem instanceof Component)) {
                    this.compTitle.innerHTML = "<i>(n/a)</i>";
                    this.compType.selectedIndex = -1;
                    this.instType.innerHTML = "<i>(n/a)</i>";
                    this.hideAllEditors();
                }
                else {
                    var comp = this.currentProject.currentComponent = <Component>tv.selectedItem;
                    this.compNamespace.innerHTML = comp.namespace;
                    this.compName.innerHTML = comp.name;
                    this.compTitle.innerHTML = comp.title;
                    this.compType.value = "" + comp.componentType;
                    this.instType.innerHTML = comp.instanceType ? comp.instanceType.fullTypeName : "<i>(none)</i>";
                    if (comp.componentType == ComponentTypes.Code)
                        this.showCodeEditor();
                    else if (comp.componentType == ComponentTypes.Functional)
                        this.showBlockEditor();
                    else
                        this.hideAllEditors();
                }
            }
            else {
                this.compNamespace.innerHTML = "";
                this.compName.innerHTML = "";
                this.compTitle.innerHTML = "";
                this.compType.selectedIndex = -1;
                this.instType.innerHTML = "";
                this.hideAllEditors();
            }

            if (!detailsOnly) {
                this.refreshAllPropertyLists();
                this.renderVisualCode(false)
                this.refreshScratchSpace();
            }

            this.refreshCodeOutput(); // (have to always to this just in case, as names and titles affect the rendered code)
        }

        // --------------------------------------------------------------------------------------------------------------------

        refreshAllPropertyLists() {
            this.paramsEditor.refresh();
            this.localVarsEditor.refresh();
            this.returnVarsEditor.refresh();
            this.instanceVarsEditor.refresh();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Renders the script as visual elements. */
        renderVisualCode(includeCodeOutputRefresh = true) {
            this.unselectNode();

            Utilities.HTML.clearChildNodes(this.blocksContainer);

            if (this.currentProject && this.currentProject.currentComponent) {
                var visualTreeRoot = this.currentProject.currentComponent.block.createVisualTree(null);

                visualTreeRoot.onNodeSelected.add((subject, title, ev) => { this.selectNode(subject, "exprMenu", title); });

                this.codeBlocksRootNode = visualTreeRoot.render();

                this.blocksContainer.appendChild(this.codeBlocksRootNode);
            }

            if (includeCodeOutputRefresh)
                this.refreshCodeOutput();
        }

        // --------------------------------------------------------------------------------------------------------------------

        scratchContainer: HTMLElement; // (this is where blocks can be "dumped" until needed later)

        refreshScratchSpace() {
            Utilities.HTML.clearChildNodes(this.scratchContainer);

            if (this.currentProject) {
                var exprBin = this.currentProject.expressionBin;
                if (exprBin && exprBin.length) {

                    for (var i = 0, n = exprBin.length; i < n; ++i) {
                        var expr = exprBin[i];
                        if (i > 0)
                            this.scratchContainer.appendChild(document.createTextNode(" | "));
                        var vn = expr.createVisualTree();
                        vn.onNodeSelected.add((subject, title, ev) => { this.selectNode(subject, "exprMenu", title); });
                        this.scratchContainer.appendChild(vn.render());
                    }
                }
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
        // Code Output
        blockCodeOutput: HTMLDivElement;

        refreshCodeOutput() {
            Utilities.HTML.clearChildNodes(this.blockCodeOutput);

            if (this.currentProject && this.currentProject.script)
                try {
                    var compiler = this.currentProject.script.getCompiler();
                    var code = compiler.compile();
                    //var simulator = compiler.compileSimulation();
                    this.blockCodeOutput.innerHTML = "<div class='alert alert-success' role='alert'><pre>" + code + "</pre></div>";;
                }
                catch (ex) {
                    this.blockCodeOutput.innerHTML = "<div class='alert alert-danger' role='alert'>" + ex + "</div>";
                }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}

// ============================================================================================================================

$(document).on('click', '.navbar', function (e) {

    if ($(e.target).is('a')) {
        if (FlowScript.UI.ProjectUI.currentProject)
            FlowScript.UI.ProjectUI.currentProject.scriptEditor.unselectNode();
    }

});

$(document).on('click', '.nav-tabs', function (e) {

    if ($(e.target).is('a')) {
        if (FlowScript.UI.ProjectUI.currentProject) {
            FlowScript.UI.ProjectUI.currentProject.scriptEditor.unselectNode();
            FlowScript.UI.ProjectUI.currentProject.scriptEditor.hideTypeMenu();
        }
    }

});

// ============================================================================================================================
