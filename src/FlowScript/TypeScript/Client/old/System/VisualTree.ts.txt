// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    /** The type of node determines how it should be rendered in the UI. */
    export enum VisualNodeTypes {
        Undefined,
        /** The visual element will represent a component. */
        Component,
        /** The visual element will represent a part of the component title. */
        ComponentTitlePart,
        /** The visual element will represent a component parameter. */
        ComponentParameter,
        /** The visual element will represent a component. */
        ComponentReference,
        /** The visual element will represent a block - usually in a component. */
        Block,
        /** The visual element will represent a block reference. */
        BlockReference,
        /** The visual element will represent a block line. */
        Line,
        /** The visual element will represent a block line. */
        LineReference,
        /** The visual element will represent a statement expression. */
        Statement,
        /** The visual element will represent a constant expression. */
        Constant,
        /** The visual element will represent an expression, or nested expression. */
        Expression,
        /** The visual element will represent return targets. */
        ReturnTargets,
        /** The visual element will represent a single return target. */
        ReturnTarget,
        /** The visual element will represent a property. */
        Property,
        /** The visual element will represent property reference. */
        PropertyReference,
        /** The visual element will represent expression arguments. */
        Arguments,
        /** The visual element will represent a single argument. */
        Argument,
        /** The visual element will represent a list of event mappings. */
        EventHandlers,
        /** The visual element will represent a single event mapping. */
        EventHandler,
        /** The visual element holds text only for display purposes. */
        Text
    }

    export interface IVisualNodeAppendEvent { (subject: VisualNode, index: number, currentNode: VisualNode): void; }
    export interface IVisualNodeRemoveEvent { (subject: VisualNode, index: number, currentNode: VisualNode): void; }

    export interface IHTMLElementClickEvent { (ev: Event): void; }
    export interface IVisualNodeSelectedEvent { (subject: VisualNode, title?: string, ev?: Event): void; }

    export interface IVisualNodeType<T extends VisualNode> { new (item: any, nodeType?: VisualNodeTypes): T }

    export interface IVisualNodeElement extends HTMLElement {
        $__fs_vnode: VisualNode;
    }

    export interface IVisualNodeVisitor<TNode extends VisualNode, TReturn> {
        // Visit a single node only.
        visitNode(node: TNode, index: number, count: number): TReturn;
        // 
        visitNodes(node: TNode, index: number, count: number, childrenOnly?: boolean): TReturn;
        visitComponent(node: TNode, index: number, count: number): TReturn;
        visitBlock(node: TNode, index: number, count: number): TReturn;
        visitLine(node: TNode, index: number, count: number): TReturn;
        visitStatement(node: TNode, index: number, count: number): TReturn;
        visitProperty(node: TNode, index: number, count: number): TReturn;
        visitConstant(node: TNode, index: number, count: number): TReturn;
    }

    // ========================================================================================================================

    export class VisualNode {
        // --------------------------------------------------------------------------------------------------------------------

        /** References the parent visual node. */
        get parent() { return this._parent; }
        protected _parent: VisualNode;

        /** References the children nested in this visual node. */
        get children() { return this._children; }
        protected _children: VisualNode[] = [];

        /** The 'VisualNodeTypes' type this node represents. */
        get type() { return this._type; }
        protected _type: VisualNodeTypes;

        get item() { return this._item instanceof NamedReference ? this._item.valueOf() : this._item; }
        protected _item: NamedReference<any> | any;

        /** Returns the current the underlying component reference, or the closest parent component reference.
         * If no component reference is found, null is returned.
         */
        get componentRef(): ComponentReference { return typeof this.item == 'object' && this.item instanceof ComponentReference ? this.item : this._parent ? this._parent.componentRef : null; }

        /** Returns the current node as a component, or the closest parent component (including any associated with a component reference).
         * If no component is found, null is returned.
         */
        get component(): Component { return typeof this.item == 'object' && (this.item instanceof Component && this.item || this.item instanceof ComponentReference && (<ComponentReference>this.item).component) || this._parent && this._parent.component || null; }

        /** For component type nodes, returns the component referenced by this node, or null otherwise. */
        get asComponent(): Component { return this._type == VisualNodeTypes.Component ? this.item : this._type == VisualNodeTypes.ComponentReference ? (<ComponentReference>this.item).component : null; }

        /** Returns the current node as a block, or the closest parent block (including any associated with a reference).
         * If no block is found, null is returned.
         */
        get block(): Block { return typeof this.item == 'object' && (this.item instanceof Block && this.item || this.item instanceof BlockReference && (<BlockReference>this.item).block) || this._parent && this._parent.block || null; }

        /** For block type nodes, returns the block referenced by this node, or null otherwise. */
        get asBlock(): Block { return this._type == VisualNodeTypes.Block ? this.item : this._type == VisualNodeTypes.BlockReference ? (<BlockReference>this.item).block : null; }

        /** Returns the current node as a line, or the closest parent line (including any associated with a reference).
         * If no line is found, null is returned.
         */
        get line(): Line { return typeof this.item == 'object' && (this.item instanceof Line && this.item || this.item instanceof LineReference && (<LineReference>this.item).line) || this._parent && this._parent.line || null; }

        /** For line type nodes, returns the line referenced by this node, or null otherwise. */
        get asLine(): Line { return this._type == VisualNodeTypes.Line ? this.item : this._type == VisualNodeTypes.LineReference ? (<LineReference>this.item).line : null; }

        /** Returns the current node as an expression, or the closest parent expression.
         * If no expression is found, null is returned.
         */
        get expression(): Expression { return typeof this.item == 'object' && this.item instanceof Expression ? this.item : this._parent ? this._parent.expression : null; }

        /** For expression type nodes, returns the expression referenced by this node, or null otherwise. */
        get asExpression(): Expression { return typeof this.item == 'object' && this.item instanceof Expression ? this.item : null; }

        /** Returns the topmost root node in the tree. */
        get rootNode(): VisualNode { return this.parent ? this.parent : this; }

        /** Returns the selected node, which is tracked by the root node in the tree. */
        get selectedNode(): VisualNode { var rn = this.rootNode; return rn._selectedNode || null; }
        private _selectedNode: VisualNode;

        /** Returns true if this node is selected. */
        get isSelected(): boolean { return this.rootNode._selectedNode == this; }
        set isSelected(value: boolean) {
            var rn = this.rootNode;
            if (value && rn._selectedNode != this) {
                if (rn._selectedNode)
                    rn._selectedNode._HideSelectedStyle();
                rn._selectedNode = this;
                this._ShowSelectedStyle();
            }
            else if (!value && rn._selectedNode == this) {
                if (rn._selectedNode)
                    rn._selectedNode._HideSelectedStyle();
                rn._selectedNode = null;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Any visual UI element to track with this node. */
        visualElement: IVisualNodeElement;

        /** The element that holds the rendered child nodes. If not specified after rendering the parent, 'visualElement' is assumed. */
        get containerElement(): IVisualNodeElement { return this._containerElement || this.visualElement; }
        set containerElement(value: IVisualNodeElement) { this._containerElement = value; }
        private _containerElement: IVisualNodeElement;

        /** The text to display for this node, if any (for text nodes). */
        get text(): string { return typeof this.item == 'string' ? this.item : "" + this.item; }

        /** Any text that should pop up when the user mouses over an element. */
        title: string;

        /** For argument nodes, this is the argument name. */
        paramName: string;

        /** For argument nodes, this is the argument index. */
        paramIndex: number;

        // --------------------------------------------------------------------------------------------------------------------
        // Events

        /** Triggered when a node is added or inserted. An 'index' parameter holds the new position. */
        onNodeAdded = new EventDispatcher<VisualNode, IVisualNodeAppendEvent>(this);

        /** Triggered when a node is removed. */
        onNodeRemoved = new EventDispatcher<VisualNode, IVisualNodeRemoveEvent>(this);

        /** Triggered when a node is selected. */
        onNodeSelected = new EventDispatcher<VisualNode, IVisualNodeSelectedEvent>(this);

        // --------------------------------------------------------------------------------------------------------------------

        constructor(comp: Component);
        constructor(compRef: ComponentReference);
        constructor(block: Block);
        constructor(blockRef: BlockReference);
        constructor(line: Line);
        constructor(lineRef: LineReference);
        constructor(statement: Statement);
        constructor(prop: Property, nodeType: VisualNodeTypes);
        constructor(propRef: PropertyReference);
        constructor(constant: Constant);
        constructor(expr: Expression, nodeType?: VisualNodeTypes);
        constructor(returnTargetMap: ReturnTargetMap);
        constructor(expressionArgs: ExpressionArgs);
        constructor(returnTargets: ReturnTargetMaps);
        constructor(item: string, nodeType?: VisualNodeTypes);
        constructor(item: number, nodeType?: VisualNodeTypes);
        constructor(item: any, nodeType = VisualNodeTypes.Undefined) {
            if (typeof nodeType == 'number' && nodeType > 0)
                this._type = nodeType;
            else if (typeof item == 'object' && item !== null) {
                if (item instanceof Component)
                    this._type = VisualNodeTypes.Component;
                else if (item instanceof Statement)
                    this._type = VisualNodeTypes.Statement;
                else if (item instanceof ComponentReference)
                    this._type = VisualNodeTypes.ComponentReference;
                else if (item instanceof Block)
                    this._type = VisualNodeTypes.Block;
                else if (item instanceof BlockReference)
                    this._type = VisualNodeTypes.BlockReference;
                else if (item instanceof Line)
                    this._type = VisualNodeTypes.Line;
                else if (item instanceof LineReference)
                    this._type = VisualNodeTypes.LineReference;
                else if (item instanceof Property)
                    this._type = VisualNodeTypes.Property;
                else if (item instanceof PropertyReference)
                    this._type = VisualNodeTypes.PropertyReference;
                else if (item instanceof Constant)
                    this._type = VisualNodeTypes.Constant;
                else if (item instanceof Expression)
                    this._type = VisualNodeTypes.Expression;
                else if (item instanceof ReturnTargetMaps)
                    this._type = VisualNodeTypes.ReturnTargets;
                else if (item instanceof ReturnTargetMap)
                    this._type = VisualNodeTypes.ReturnTarget;
                else if (item instanceof ExpressionArgs)
                    this._type = VisualNodeTypes.Arguments;
                else // ... else assume this is a text node (default if there are no other matching types) ...
                    this._type = VisualNodeTypes.Text;
            }
            else // ... else assume this is a text node (default if there are no other matching types) ...
                if (!nodeType)
                    throw "A type is required if no object value is given.";

            if (this._type != VisualNodeTypes.Text)
                this._item = (<IReferencedObject>item).getReference ? (<IReferencedObject>item).getReference() : item;
            else
                this._item = "" + item;
        }

        /** Returns a new node based on this node type.
          * Note: Derived types usually override this to return a visual node of their own type. This allows creating a visual
          * tree tailored to the needs of the target user environment (this is usually a browser in most cases).
          * Warning: Derived types accepting more parameters than expected by the base constructor MUST do one of two things:
          *   1. Override the '_CreateNode()' function to provide an implementation that handles the extra parameters, or ...
          *   2. Copy ALL overloads of "createNode()" from the base (here) and re-implement on the derived type.
          *   This is because the constructor of the current instance is used via this function to create new nodes, and passes
          *   only what it expects.  Any other parameters expected by derived types will be undefined.
          */
        createNode(comp: Component): this;
        createNode(compRef: ComponentReference): this;
        createNode(block: Block): this;
        createNode(blockRef: BlockReference): this;
        createNode(line: Line): this;
        createNode(lineRef: LineReference): this;
        createNode(statement: Statement): this;
        createNode(prop: Property, nodeType: VisualNodeTypes): this;
        createNode(propRef: PropertyReference): this;
        createNode(constant: Constant): this;
        createNode(expr: Expression, nodeType?: VisualNodeTypes): this;
        createNode(returnTargets: ReturnTargetMaps): this;
        createNode(returnTargetMap: ReturnTargetMap): this;
        createNode(expressionArgs: ExpressionArgs): this;
        createNode(item: string, nodeType?: VisualNodeTypes): this;
        createNode(item: number, nodeType?: VisualNodeTypes): this;
        createNode(item: any, nodeType = VisualNodeTypes.Undefined): this {
            var node = this._CreateNode(item, nodeType);
            return <this>this.appendNode(node);
        }

        protected _CreateNode(item: any, nodeType = VisualNodeTypes.Undefined, ...args: any[]) {
            return new (<typeof VisualNode><any>(<Object>this).constructor)(item, nodeType);
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _castTo<T>(type: { new (...args: any[]): T; }, throwOnError = true): T {
            var item = this.item;
            if (typeof item != 'object')
                if (throwOnError)
                    throw "Invalid cast: item is not an object.";
                else
                    return null;
            if (!(item instanceof type))
                if (throwOnError)
                    throw "Invalid cast: item is not of the specified type.";
                else
                    return null;
            return <T>item;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Adds a visual node to this node. */
        appendNode(node: VisualNode): VisualNode {
            if (node && this._children.indexOf(node) < 0) {
                // ... remove from an existing parent first ...
                if (node._parent)
                    node._parent.removeNode(node);
                // ... add to this node ...
                delete node._selectedNode; // (no longer a root, if it was a root before)
                var i = this._children.push(node) - 1;
                node._parent = this;
                this._doAdded(node, i);
            }
            return node;
        }

        /** Adds a visual node to this node. */
        appendTextNode(text: string, nodeType = VisualNodeTypes.Text): VisualNode {
            var node = new VisualNode(text, nodeType);
            return this.appendNode(node);
        }

        /** Inserts a visual node into this node. */
        insertNode(node: VisualNode, index: number): VisualNode {
            if (node && this._children.indexOf(node) < 0) {
                // ... remove from an existing parent first ...
                if (node._parent)
                    node._parent.removeNode(node);
                delete node._selectedNode; // (no longer a root, if it was a root before)
                // ... complete insert ...
                if (index < 0) index = 0;
                if (index > this._children.length) index = this._children.length;
                this._children.splice(index, 0, node);
                node._parent = this;
                this.onNodeAdded.trigger(node, index, this);
            }
            return node;
        }

        /** Removes a visual node from this node.*/
        removeNode(node: VisualNode): VisualNode {
            var i = this._children.indexOf(node);
            if (i >= 0) {
                var removedNode = this._children.splice(i, 1)[0];
                removedNode._parent = null;
                this._doAdded(removedNode, i);
                return removedNode;
            }
            return void 0;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Searches the parent hierarchy with the given expression.  This is used to detect cyclical references. */
        isInParent(expr: Expression): boolean {
            if (expr)
                if (typeof expr != 'object')
                    throw "Expression is not an object.";
                else if (!(expr instanceof Expression))
                    throw "'expr' argument is not an expression object.";
                else if (this._parent)
                    if (this._parent.item == expr)
                        return true;
                    else
                        return this._parent.isInParent(expr);
            return false;
        }

        /** Calls 'isInParent()' with the given expression and generates a cyclical error if found. */
        cyclicalCheck(expr: Expression) {
            if (this.isInParent(expr))
                throw "Cyclical error: You cannot use parent expressions (directly or indirectly) within themselves, or any nested child expressions. Clone the expression first and try again.";
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Begins rendering the visual tree. */
        render(node: VisualNode = null): IVisualNodeElement {
            if (this._parent)
                return this._render(this._parent._children.indexOf(this), this._parent._children.length, this._parent.containerElement || null);
            else
                return this._render(void 0, void 0, null);
        }

        private _render(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            switch (this._type) {
                case VisualNodeTypes.Component: return this.renderComponent(index, count, parentElement);
                case VisualNodeTypes.ComponentReference: return this.renderComponent(index, count, parentElement);
                case VisualNodeTypes.ComponentTitlePart: return this.renderComponentTitlePart(index, count, parentElement);
                case VisualNodeTypes.ComponentParameter: return this.renderComponentParameter(index, count, parentElement);
                case VisualNodeTypes.Arguments: return this.renderArguments(index, count, parentElement);
                case VisualNodeTypes.Argument: return this.renderArgument(index, count, parentElement);
                case VisualNodeTypes.ReturnTargets: return this.renderReturnTargets(index, count, parentElement);
                case VisualNodeTypes.ReturnTarget: return this.renderReturnTarget(index, count, parentElement);
                case VisualNodeTypes.Block: return this.renderBlock(index, count, parentElement);
                case VisualNodeTypes.BlockReference: return this.renderBlock(index, count, parentElement);
                case VisualNodeTypes.Line: return this.renderLine(index, count, parentElement);
                case VisualNodeTypes.LineReference: return this.renderLine(index, count, parentElement);
                case VisualNodeTypes.Statement: return this.renderStatement(index, count, parentElement);
                case VisualNodeTypes.Property: return this.renderProperty(index, count, parentElement);
                case VisualNodeTypes.PropertyReference: return this.renderProperty(index, count, parentElement);
                case VisualNodeTypes.Constant: return this.renderConstant(index, count, parentElement);
                //case VisualNodeTypes.EventHandlers: return this.renderEventHandlers(index, count, parentElement);
                //case VisualNodeTypes.EventHandler: return this.renderEventHandler(index, count, parentElement);
                case VisualNodeTypes.Text: return this.renderText(index, count, parentElement);
                default:
                    var msg = "Visual node type '" + VisualNodeTypes[this._type] + "' is not recognized.";
                    log(msg, LogMessageTypes.Error, false);
                    var errorEl = this.createElement("div");
                    errorEl.innerHTML = "<b>Error: " + msg + "</b>";
                    return errorEl;
            }
        }

        protected _renderChildren(parentElement?: IVisualNodeElement): IVisualNodeElement { // (note: 'parentElement' is provided, as the container for child objects my not be the root visual element)
            for (var i = 0, n = this._children.length; i < n; ++i)
                this._children[i]._render(i, n, parentElement || this.containerElement);

            return parentElement;
        }

        // --------------------------------------------------------------------------------------------------------------------

        createElement<T extends HTMLElement>(name: string, parentElement?: HTMLElement): T & IVisualNodeElement {
            var element = <T & IVisualNodeElement>document.createElement(name);
            element.$__fs_vnode = this;
            if (parentElement)
                parentElement.appendChild(element);
            return element;
        }

        // --------------------------------------------------------------------------------------------------------------------

        createVisualElement<T extends HTMLElement>(name: string, parentElement?: HTMLElement): T & IVisualNodeElement {
            return this.visualElement = this.createElement<T>(name, parentElement);
        }

        // --------------------------------------------------------------------------------------------------------------------

        createContainerElement<T extends HTMLElement>(name: string, parentElement?: HTMLElement): T & IVisualNodeElement {
            return this.containerElement = this.createElement<T>(name, parentElement);
        }

        // --------------------------------------------------------------------------------------------------------------------

        private _createErrorElement(msg: string): IVisualNodeElement {
            var el = this.createElement("div");
            el.innerHTML = "<font color='red'><b>" + log(msg, LogMessageTypes.Error, false) + "</b></font>";
            return el;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _doSelect(ev: Event, title: string, subject = this): void {
            this.onNodeSelected.trigger(subject, title, ev);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doSelect(ev, title, subject);
            ev.stopPropagation();
        }

        protected _doAdded(subject: VisualNode, index: number): void {
            this.onNodeAdded.trigger(subject, index, this);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doAdded(subject, index);
        }

        protected _doRemoved(subject: VisualNode, index: number): void {
            this.onNodeRemoved.trigger(subject, index, this);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doRemoved(subject, index);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /**
         * Render this visual node as a text node.
         */
        renderText(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.visualElement = this.createElement("span", parentElement);
            element.className = "text";
            element.innerHTML = this.text;
            return element;
        }

        /**
         * Render this visual node as a component reference.
         */
        renderComponent(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var compRef = this._castTo(ComponentReference, false);
            var comp = compRef ? compRef.component : this._castTo(Component);
            if (!comp) return this._createErrorElement("Error: This visual node does not reference a component instance.");

            var element = this.createVisualElement("span", parentElement);

            element.className = compRef ? "component_reference" : "component";

            if (parentElement)
                if (!(<IVisualNodeElement><any>parentElement).$__fs_vnode) {
                    element.title = "Component '" + comp.name + "'";
                    element.onclick = (ev: Event) => this._doSelect(ev, element.title);
                }

            this._renderChildren();

            return element;
        }

        renderReturnTargets(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.createVisualElement("div", parentElement);
            element.className = "returns";
            this._renderChildren();
            return element;
        }

        renderReturnTarget(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.createVisualElement("span", parentElement);
            element.className = "return";
            this._renderChildren();
            return element;
        }

        renderArguments(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.createVisualElement("div", parentElement);
            element.className = "arguments";
            this._renderChildren();
            return element;
        }

        renderArgument(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.createVisualElement("span", parentElement);
            element.className = "argument";
            this._renderChildren();
            return element;
        }

        renderComponentTitlePart(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.createVisualElement("span", parentElement);
            element.className = "titlepart";
            element.innerHTML = this.text;
            return element;
        }

        renderComponentParameter(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var element = this.createVisualElement("span", parentElement);
            element.className = "parameter";
            element.title = this.title;
            element.onclick = (ev: Event) => this._doSelect(ev, (<IVisualNodeElement>ev.currentTarget).$__fs_vnode.title);
            this._renderChildren();
            return element;
        }

        renderBlock(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var blockRef = this._castTo(BlockReference, false);
            var block = blockRef ? blockRef.block : this._castTo(Block);
            if (!block) return this._createErrorElement("Error: This visual node does not reference a block instance.");

            var element = this.createVisualElement("div", parentElement);
            element.className = blockRef ? "block_referernce" : "block";
            element.onclick = (ev: Event) => { this._doSelect(ev, "Code Block"); ev.stopPropagation(); };

            if (!blockRef) {
                var linesContainer = this.createContainerElement("div", element);
                linesContainer.className = "lines";

                var lineCount = this.asBlock.lines.length;
                if (!lineCount) {
                    var lineContainer = this.createElement("div", linesContainer);
                    lineContainer.className = "line emptyLine";
                    lineContainer.innerHTML = "-?-";
                }
                else this._renderChildren();
            }
            else this._renderChildren();

            return element;
        }

        renderLine(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var lineRef = this._castTo(LineReference, false);
            var line = lineRef ? lineRef.line : this._castTo(Line);
            if (!line) return this._createErrorElement("Error: This visual node does not reference a line instance.");

            var lineNum = index, lineCount = count;

            var element = this.createVisualElement("div", parentElement);
            element.className = lineRef ? "line_reference" : "line";
            element.onclick = (ev: Event) => { this._doSelect(ev, "Block Line"); ev.stopPropagation(); };

            if (lineCount > 1) {
                var lineNumberElement = this.createElement("span", element);
                lineNumberElement.className = "linenumber";
                lineNumberElement.innerHTML = lineNum + ": ";
            }

            var statementsContainer = this.createContainerElement("div", element);
            statementsContainer.className = "statements";

            this._renderChildren();

            return element;
        }

        renderStatement(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var statement = this._castTo(Statement, false);
            if (!statement) return this._createErrorElement("Error: This visual node does not reference a statement instance.");

            var element = this.createVisualElement("span", parentElement);
            element.className = "statement";
            element.title = "Statement expression for component '" + statement.component.fullTypeName + "' (" + statement.component.title + ").";
            element.onclick = (ev: Event) => { this._doSelect(ev, "Statement Expression (" + statement.component.name + ")"); ev.stopPropagation(); };

            this._renderChildren();

            return element;
        }

        renderProperty(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var propRef = this._castTo(PropertyReference, false);
            var prop = propRef ? propRef.property : this._castTo(Property);
            if (!prop)
                if (propRef.propertyRef.path)
                    return this.renderValue(propRef, this.visualElement, "property", "?", "property", "Property '" + propRef.propertyRef.path + "' of component '" + propCompName + "'.", onclick);
                else
                    return this._createErrorElement("Error: This visual node does not reference a property instance.");

            if (propRef) {
                var element = this.createVisualElement("span", parentElement);
                element.className = "property_reference";
            }
            else element = parentElement;

            var propCompName = prop.component ? prop.component.fullTypeName : "?";
            var funcComp = propRef && propRef.functionalComponent;
            var showCompNamePrefix = !prop.component || funcComp && funcComp.fullTypeName != prop.component.fullTypeName;
            var displayText = showCompNamePrefix ? propCompName + "." + prop.name : prop.name;

            return this.renderValue(propRef, this.visualElement, "property", displayText, "property", "Property '" + prop.name + "' of component '" + propCompName + "'.", onclick);
        }

        renderConstant(index: number, count: number, parentElement: IVisualNodeElement): IVisualNodeElement {
            var constant = this._castTo(Constant, false);
            if (!constant) return this._createErrorElement("Error: This visual node does not reference a constant instance.");
            return this.visualElement = this.renderValue(constant, parentElement, "constant", constant.value, typeof constant.value, "Constant value '" + constant.value + "'.", onclick);
        }

        renderValue(valueExpr: Expression, parentElement: IVisualNodeElement, className: string, value: string, valueType: string, title: string, onclick?: IHTMLElementClickEvent): IVisualNodeElement {
            var element = this.createElement("span", parentElement);
            element.className = className;
            element.title = title;
            element.innerHTML = valueType == 'string' ? '"' + value + '"' : valueType == 'number' ? value : valueType == 'boolean' ? "<i>" + ('' + value).toUpperCase() + "</i>" : value;
            element.onclick = (ev: Event) => { this._doSelect(ev, "Argument Value"); ev.stopPropagation(); };
            return element;
        }

        // --------------------------------------------------------------------------------------------------------------------

        _ShowSelectedStyle() {
            if (this.visualElement) {
                this.visualElement.style.background = "#f0fff0";
                this.visualElement.style.border = "1px solid black";
            }
        }

        _HideSelectedStyle() {
            if (this.visualElement) {
                this.visualElement.style.background = "";
                this.visualElement.style.border = "";
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
