// ############################################################################################################################
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    /** The type of node determines how it should be rendered in the UI. */
    var VisualNodeTypes;
    (function (VisualNodeTypes) {
        VisualNodeTypes[VisualNodeTypes["Undefined"] = 0] = "Undefined";
        /** The visual element will represent a component. */
        VisualNodeTypes[VisualNodeTypes["Component"] = 1] = "Component";
        /** The visual element will represent a part of the component title. */
        VisualNodeTypes[VisualNodeTypes["ComponentTitlePart"] = 2] = "ComponentTitlePart";
        /** The visual element will represent a component parameter. */
        VisualNodeTypes[VisualNodeTypes["ComponentParameter"] = 3] = "ComponentParameter";
        /** The visual element will represent a component. */
        VisualNodeTypes[VisualNodeTypes["ComponentReference"] = 4] = "ComponentReference";
        /** The visual element will represent a block - usually in a component. */
        VisualNodeTypes[VisualNodeTypes["Block"] = 5] = "Block";
        /** The visual element will represent a block reference. */
        VisualNodeTypes[VisualNodeTypes["BlockReference"] = 6] = "BlockReference";
        /** The visual element will represent a block line. */
        VisualNodeTypes[VisualNodeTypes["Line"] = 7] = "Line";
        /** The visual element will represent a block line. */
        VisualNodeTypes[VisualNodeTypes["LineReference"] = 8] = "LineReference";
        /** The visual element will represent a statement expression. */
        VisualNodeTypes[VisualNodeTypes["Statement"] = 9] = "Statement";
        /** The visual element will represent a constant expression. */
        VisualNodeTypes[VisualNodeTypes["Constant"] = 10] = "Constant";
        /** The visual element will represent an expression, or nested expression. */
        VisualNodeTypes[VisualNodeTypes["Expression"] = 11] = "Expression";
        /** The visual element will represent return targets. */
        VisualNodeTypes[VisualNodeTypes["ReturnTargets"] = 12] = "ReturnTargets";
        /** The visual element will represent a single return target. */
        VisualNodeTypes[VisualNodeTypes["ReturnTarget"] = 13] = "ReturnTarget";
        /** The visual element will represent a property. */
        VisualNodeTypes[VisualNodeTypes["Property"] = 14] = "Property";
        /** The visual element will represent property reference. */
        VisualNodeTypes[VisualNodeTypes["PropertyReference"] = 15] = "PropertyReference";
        /** The visual element will represent expression arguments. */
        VisualNodeTypes[VisualNodeTypes["Arguments"] = 16] = "Arguments";
        /** The visual element will represent a single argument. */
        VisualNodeTypes[VisualNodeTypes["Argument"] = 17] = "Argument";
        /** The visual element will represent a list of event mappings. */
        VisualNodeTypes[VisualNodeTypes["EventHandlers"] = 18] = "EventHandlers";
        /** The visual element will represent a single event mapping. */
        VisualNodeTypes[VisualNodeTypes["EventHandler"] = 19] = "EventHandler";
        /** The visual element holds text only for display purposes. */
        VisualNodeTypes[VisualNodeTypes["Text"] = 20] = "Text";
    })(VisualNodeTypes = FlowScript.VisualNodeTypes || (FlowScript.VisualNodeTypes = {}));
    // ========================================================================================================================
    var VisualNode = /** @class */ (function () {
        function VisualNode(item, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Undefined; }
            this._children = [];
            // --------------------------------------------------------------------------------------------------------------------
            // Events
            /** Triggered when a node is added or inserted. An 'index' parameter holds the new position. */
            this.onNodeAdded = new FlowScript.EventDispatcher(this);
            /** Triggered when a node is removed. */
            this.onNodeRemoved = new FlowScript.EventDispatcher(this);
            /** Triggered when a node is selected. */
            this.onNodeSelected = new FlowScript.EventDispatcher(this);
            if (typeof nodeType == 'number' && nodeType > 0)
                this._type = nodeType;
            else if (typeof item == 'object' && item !== null) {
                if (item instanceof FlowScript.Component)
                    this._type = VisualNodeTypes.Component;
                else if (item instanceof FlowScript.Statement)
                    this._type = VisualNodeTypes.Statement;
                else if (item instanceof FlowScript.ComponentReference)
                    this._type = VisualNodeTypes.ComponentReference;
                else if (item instanceof FlowScript.Block)
                    this._type = VisualNodeTypes.Block;
                else if (item instanceof FlowScript.BlockReference)
                    this._type = VisualNodeTypes.BlockReference;
                else if (item instanceof FlowScript.Line)
                    this._type = VisualNodeTypes.Line;
                else if (item instanceof FlowScript.LineReference)
                    this._type = VisualNodeTypes.LineReference;
                else if (item instanceof FlowScript.Property)
                    this._type = VisualNodeTypes.Property;
                else if (item instanceof FlowScript.PropertyReference)
                    this._type = VisualNodeTypes.PropertyReference;
                else if (item instanceof FlowScript.Constant)
                    this._type = VisualNodeTypes.Constant;
                else if (item instanceof FlowScript.Expression)
                    this._type = VisualNodeTypes.Expression;
                else if (item instanceof FlowScript.ReturnTargetMaps)
                    this._type = VisualNodeTypes.ReturnTargets;
                else if (item instanceof FlowScript.ReturnTargetMap)
                    this._type = VisualNodeTypes.ReturnTarget;
                else if (item instanceof FlowScript.ExpressionArgs)
                    this._type = VisualNodeTypes.Arguments;
                else // ... else assume this is a text node (default if there are no other matching types) ...
                    this._type = VisualNodeTypes.Text;
            }
            else // ... else assume this is a text node (default if there are no other matching types) ...
             if (!nodeType)
                throw "A type is required if no object value is given.";
            if (this._type != VisualNodeTypes.Text)
                this._item = item.getReference ? item.getReference() : item;
            else
                this._item = "" + item;
        }
        Object.defineProperty(VisualNode.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            /** References the parent visual node. */
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "children", {
            /** References the children nested in this visual node. */
            get: function () { return this._children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "type", {
            /** The 'VisualNodeTypes' type this node represents. */
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "item", {
            get: function () { return this._item instanceof FlowScript.NamedReference ? this._item.valueOf() : this._item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "componentRef", {
            /** Returns the current the underlying component reference, or the closest parent component reference.
             * If no component reference is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && this.item instanceof FlowScript.ComponentReference ? this.item : this._parent ? this._parent.componentRef : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "component", {
            /** Returns the current node as a component, or the closest parent component (including any associated with a component reference).
             * If no component is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && (this.item instanceof FlowScript.Component && this.item || this.item instanceof FlowScript.ComponentReference && this.item.component) || this._parent && this._parent.component || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asComponent", {
            /** For component type nodes, returns the component referenced by this node, or null otherwise. */
            get: function () { return this._type == VisualNodeTypes.Component ? this.item : this._type == VisualNodeTypes.ComponentReference ? this.item.component : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "block", {
            /** Returns the current node as a block, or the closest parent block (including any associated with a reference).
             * If no block is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && (this.item instanceof FlowScript.Block && this.item || this.item instanceof FlowScript.BlockReference && this.item.block) || this._parent && this._parent.block || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asBlock", {
            /** For block type nodes, returns the block referenced by this node, or null otherwise. */
            get: function () { return this._type == VisualNodeTypes.Block ? this.item : this._type == VisualNodeTypes.BlockReference ? this.item.block : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "line", {
            /** Returns the current node as a line, or the closest parent line (including any associated with a reference).
             * If no line is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && (this.item instanceof FlowScript.Line && this.item || this.item instanceof FlowScript.LineReference && this.item.line) || this._parent && this._parent.line || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asLine", {
            /** For line type nodes, returns the line referenced by this node, or null otherwise. */
            get: function () { return this._type == VisualNodeTypes.Line ? this.item : this._type == VisualNodeTypes.LineReference ? this.item.line : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "expression", {
            /** Returns the current node as an expression, or the closest parent expression.
             * If no expression is found, null is returned.
             */
            get: function () { return typeof this.item == 'object' && this.item instanceof FlowScript.Expression ? this.item : this._parent ? this._parent.expression : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "asExpression", {
            /** For expression type nodes, returns the expression referenced by this node, or null otherwise. */
            get: function () { return typeof this.item == 'object' && this.item instanceof FlowScript.Expression ? this.item : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "rootNode", {
            /** Returns the topmost root node in the tree. */
            get: function () { return this.parent ? this.parent : this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "selectedNode", {
            /** Returns the selected node, which is tracked by the root node in the tree. */
            get: function () { var rn = this.rootNode; return rn._selectedNode || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "isSelected", {
            /** Returns true if this node is selected. */
            get: function () { return this.rootNode._selectedNode == this; },
            set: function (value) {
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "containerElement", {
            /** The element that holds the rendered child nodes. If not specified after rendering the parent, 'visualElement' is assumed. */
            get: function () { return this._containerElement || this.visualElement; },
            set: function (value) { this._containerElement = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualNode.prototype, "text", {
            /** The text to display for this node, if any (for text nodes). */
            get: function () { return typeof this.item == 'string' ? this.item : "" + this.item; },
            enumerable: true,
            configurable: true
        });
        VisualNode.prototype.createNode = function (item, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Undefined; }
            var node = this._CreateNode(item, nodeType);
            return this.appendNode(node);
        };
        VisualNode.prototype._CreateNode = function (item, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Undefined; }
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            return new this.constructor(item, nodeType);
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._castTo = function (type, throwOnError) {
            if (throwOnError === void 0) { throwOnError = true; }
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
            return item;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a visual node to this node. */
        VisualNode.prototype.appendNode = function (node) {
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
        };
        /** Adds a visual node to this node. */
        VisualNode.prototype.appendTextNode = function (text, nodeType) {
            if (nodeType === void 0) { nodeType = VisualNodeTypes.Text; }
            var node = new VisualNode(text, nodeType);
            return this.appendNode(node);
        };
        /** Inserts a visual node into this node. */
        VisualNode.prototype.insertNode = function (node, index) {
            if (node && this._children.indexOf(node) < 0) {
                // ... remove from an existing parent first ...
                if (node._parent)
                    node._parent.removeNode(node);
                delete node._selectedNode; // (no longer a root, if it was a root before)
                // ... complete insert ...
                if (index < 0)
                    index = 0;
                if (index > this._children.length)
                    index = this._children.length;
                this._children.splice(index, 0, node);
                node._parent = this;
                this.onNodeAdded.trigger(node, index, this);
            }
            return node;
        };
        /** Removes a visual node from this node.*/
        VisualNode.prototype.removeNode = function (node) {
            var i = this._children.indexOf(node);
            if (i >= 0) {
                var removedNode = this._children.splice(i, 1)[0];
                removedNode._parent = null;
                this._doAdded(removedNode, i);
                return removedNode;
            }
            return void 0;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches the parent hierarchy with the given expression.  This is used to detect cyclical references. */
        VisualNode.prototype.isInParent = function (expr) {
            if (expr)
                if (typeof expr != 'object')
                    throw "Expression is not an object.";
                else if (!(expr instanceof FlowScript.Expression))
                    throw "'expr' argument is not an expression object.";
                else if (this._parent)
                    if (this._parent.item == expr)
                        return true;
                    else
                        return this._parent.isInParent(expr);
            return false;
        };
        /** Calls 'isInParent()' with the given expression and generates a cyclical error if found. */
        VisualNode.prototype.cyclicalCheck = function (expr) {
            if (this.isInParent(expr))
                throw "Cyclical error: You cannot use parent expressions (directly or indirectly) within themselves, or any nested child expressions. Clone the expression first and try again.";
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Begins rendering the visual tree. */
        VisualNode.prototype.render = function (node) {
            if (node === void 0) { node = null; }
            if (this._parent)
                return this._render(this._parent._children.indexOf(this), this._parent._children.length, this._parent.containerElement || null);
            else
                return this._render(void 0, void 0, null);
        };
        VisualNode.prototype._render = function (index, count, parentElement) {
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
                    FlowScript.log(msg, FlowScript.LogMessageTypes.Error, false);
                    var errorEl = this.createElement("div");
                    errorEl.innerHTML = "<b>Error: " + msg + "</b>";
                    return errorEl;
            }
        };
        VisualNode.prototype._renderChildren = function (parentElement) {
            for (var i = 0, n = this._children.length; i < n; ++i)
                this._children[i]._render(i, n, parentElement || this.containerElement);
            return parentElement;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype.createElement = function (name, parentElement) {
            var element = document.createElement(name);
            element.$__fs_vnode = this;
            if (parentElement)
                parentElement.appendChild(element);
            return element;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype.createVisualElement = function (name, parentElement) {
            return this.visualElement = this.createElement(name, parentElement);
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype.createContainerElement = function (name, parentElement) {
            return this.containerElement = this.createElement(name, parentElement);
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._createErrorElement = function (msg) {
            var el = this.createElement("div");
            el.innerHTML = "<font color='red'><b>" + FlowScript.log(msg, FlowScript.LogMessageTypes.Error, false) + "</b></font>";
            return el;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._doSelect = function (ev, title, subject) {
            if (subject === void 0) { subject = this; }
            this.onNodeSelected.trigger(subject, title, ev);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doSelect(ev, title, subject);
            ev.stopPropagation();
        };
        VisualNode.prototype._doAdded = function (subject, index) {
            this.onNodeAdded.trigger(subject, index, this);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doAdded(subject, index);
        };
        VisualNode.prototype._doRemoved = function (subject, index) {
            this.onNodeRemoved.trigger(subject, index, this);
            // ... by default, propagate all events up to the root for easy handling by a single function ...
            if (this._parent)
                this._parent._doRemoved(subject, index);
        };
        // --------------------------------------------------------------------------------------------------------------------
        /**
         * Render this visual node as a text node.
         */
        VisualNode.prototype.renderText = function (index, count, parentElement) {
            var element = this.visualElement = this.createElement("span", parentElement);
            element.className = "text";
            element.innerHTML = this.text;
            return element;
        };
        /**
         * Render this visual node as a component reference.
         */
        VisualNode.prototype.renderComponent = function (index, count, parentElement) {
            var _this = this;
            var compRef = this._castTo(FlowScript.ComponentReference, false);
            var comp = compRef ? compRef.component : this._castTo(FlowScript.Component);
            if (!comp)
                return this._createErrorElement("Error: This visual node does not reference a component instance.");
            var element = this.createVisualElement("span", parentElement);
            element.className = compRef ? "component_reference" : "component";
            if (parentElement)
                if (!parentElement.$__fs_vnode) {
                    element.title = "Component '" + comp.name + "'";
                    element.onclick = function (ev) { return _this._doSelect(ev, element.title); };
                }
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderReturnTargets = function (index, count, parentElement) {
            var element = this.createVisualElement("div", parentElement);
            element.className = "returns";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderReturnTarget = function (index, count, parentElement) {
            var element = this.createVisualElement("span", parentElement);
            element.className = "return";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderArguments = function (index, count, parentElement) {
            var element = this.createVisualElement("div", parentElement);
            element.className = "arguments";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderArgument = function (index, count, parentElement) {
            var element = this.createVisualElement("span", parentElement);
            element.className = "argument";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderComponentTitlePart = function (index, count, parentElement) {
            var element = this.createVisualElement("span", parentElement);
            element.className = "titlepart";
            element.innerHTML = this.text;
            return element;
        };
        VisualNode.prototype.renderComponentParameter = function (index, count, parentElement) {
            var _this = this;
            var element = this.createVisualElement("span", parentElement);
            element.className = "parameter";
            element.title = this.title;
            element.onclick = function (ev) { return _this._doSelect(ev, ev.currentTarget.$__fs_vnode.title); };
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderBlock = function (index, count, parentElement) {
            var _this = this;
            var blockRef = this._castTo(FlowScript.BlockReference, false);
            var block = blockRef ? blockRef.block : this._castTo(FlowScript.Block);
            if (!block)
                return this._createErrorElement("Error: This visual node does not reference a block instance.");
            var element = this.createVisualElement("div", parentElement);
            element.className = blockRef ? "block_referernce" : "block";
            element.onclick = function (ev) { _this._doSelect(ev, "Code Block"); ev.stopPropagation(); };
            if (!blockRef) {
                var linesContainer = this.createContainerElement("div", element);
                linesContainer.className = "lines";
                var lineCount = this.asBlock.lines.length;
                if (!lineCount) {
                    var lineContainer = this.createElement("div", linesContainer);
                    lineContainer.className = "line emptyLine";
                    lineContainer.innerHTML = "-?-";
                }
                else
                    this._renderChildren();
            }
            else
                this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderLine = function (index, count, parentElement) {
            var _this = this;
            var lineRef = this._castTo(FlowScript.LineReference, false);
            var line = lineRef ? lineRef.line : this._castTo(FlowScript.Line);
            if (!line)
                return this._createErrorElement("Error: This visual node does not reference a line instance.");
            var lineNum = index, lineCount = count;
            var element = this.createVisualElement("div", parentElement);
            element.className = lineRef ? "line_reference" : "line";
            element.onclick = function (ev) { _this._doSelect(ev, "Block Line"); ev.stopPropagation(); };
            if (lineCount > 1) {
                var lineNumberElement = this.createElement("span", element);
                lineNumberElement.className = "linenumber";
                lineNumberElement.innerHTML = lineNum + ": ";
            }
            var statementsContainer = this.createContainerElement("div", element);
            statementsContainer.className = "statements";
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderStatement = function (index, count, parentElement) {
            var _this = this;
            var statement = this._castTo(FlowScript.Statement, false);
            if (!statement)
                return this._createErrorElement("Error: This visual node does not reference a statement instance.");
            var element = this.createVisualElement("span", parentElement);
            element.className = "statement";
            element.title = "Statement expression for component '" + statement.component.fullTypeName + "' (" + statement.component.title + ").";
            element.onclick = function (ev) { _this._doSelect(ev, "Statement Expression (" + statement.component.name + ")"); ev.stopPropagation(); };
            this._renderChildren();
            return element;
        };
        VisualNode.prototype.renderProperty = function (index, count, parentElement) {
            var propRef = this._castTo(FlowScript.PropertyReference, false);
            var prop = propRef ? propRef.property : this._castTo(FlowScript.Property);
            if (!prop)
                if (propRef.propertyRef.path)
                    return this.renderValue(propRef, this.visualElement, "property", "?", "property", "Property '" + propRef.propertyRef.path + "' of component '" + propCompName + "'.", onclick);
                else
                    return this._createErrorElement("Error: This visual node does not reference a property instance.");
            if (propRef) {
                var element = this.createVisualElement("span", parentElement);
                element.className = "property_reference";
            }
            else
                element = parentElement;
            var propCompName = prop.component ? prop.component.fullTypeName : "?";
            var funcComp = propRef && propRef.functionalComponent;
            var showCompNamePrefix = !prop.component || funcComp && funcComp.fullTypeName != prop.component.fullTypeName;
            var displayText = showCompNamePrefix ? propCompName + "." + prop.name : prop.name;
            return this.renderValue(propRef, this.visualElement, "property", displayText, "property", "Property '" + prop.name + "' of component '" + propCompName + "'.", onclick);
        };
        VisualNode.prototype.renderConstant = function (index, count, parentElement) {
            var constant = this._castTo(FlowScript.Constant, false);
            if (!constant)
                return this._createErrorElement("Error: This visual node does not reference a constant instance.");
            return this.visualElement = this.renderValue(constant, parentElement, "constant", constant.value, typeof constant.value, "Constant value '" + constant.value + "'.", onclick);
        };
        VisualNode.prototype.renderValue = function (valueExpr, parentElement, className, value, valueType, title, onclick) {
            var _this = this;
            var element = this.createElement("span", parentElement);
            element.className = className;
            element.title = title;
            element.innerHTML = valueType == 'string' ? '"' + value + '"' : valueType == 'number' ? value : valueType == 'boolean' ? "<i>" + ('' + value).toUpperCase() + "</i>" : value;
            element.onclick = function (ev) { _this._doSelect(ev, "Argument Value"); ev.stopPropagation(); };
            return element;
        };
        // --------------------------------------------------------------------------------------------------------------------
        VisualNode.prototype._ShowSelectedStyle = function () {
            if (this.visualElement) {
                this.visualElement.style.background = "#f0fff0";
                this.visualElement.style.border = "1px solid black";
            }
        };
        VisualNode.prototype._HideSelectedStyle = function () {
            if (this.visualElement) {
                this.visualElement.style.background = "";
                this.visualElement.style.border = "";
            }
        };
        return VisualNode;
    }());
    FlowScript.VisualNode = VisualNode;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=visualtree.js.map