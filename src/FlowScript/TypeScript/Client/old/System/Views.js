var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FlowScript;
(function (FlowScript) {
    /**
     * Common 'Views' and 'View' shared properties and functions.
     */
    var ViewBase = /** @class */ (function () {
        function ViewBase() {
        }
        Object.defineProperty(ViewBase.prototype, "parent", {
            // --------------------------------------------------------------------------------------------------------------------
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewBase.prototype, "rootNode", {
            /** The root node for this view. */
            get: function () { return this._rootNode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewBase.prototype, "rootElement", {
            /** The root element for this view. This is 'rootNode', or 'null' is 'rootNode' is not an 'HTMLElement' type.*/
            get: function () {
                if (this._rootNode instanceof HTMLElement)
                    return this._rootNode;
                else
                    throw "'rootNode' is not an HTMLElement based object.";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewBase.prototype, "contentElement", {
            /** The node where content will be stored for this view. This defaults to 'rootElement', unless otherwise specified. */
            get: function () { return this._contentElement || this.rootElement; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns all elements from within this view type object that matches the given query string. */
        ViewBase.prototype.queryElements = function (query) {
            var node = this._rootNode;
            if (node.querySelectorAll)
                return this._rootNode.querySelectorAll(query);
            else
                for (var i = 0, n = this._rootNode.childNodes.length; i < n; ++i) {
                    var node = this._rootNode.childNodes[i];
                    if (node.querySelectorAll) {
                        var result = node.querySelectorAll(query);
                        if (result)
                            return result;
                    }
                }
            return null;
        };
        /** Returns the first matching element from within this view that matches the given query string. */
        ViewBase.prototype.queryElement = function (query) {
            var node = this._rootNode;
            if (node.querySelector)
                return this._rootNode.querySelector(query);
            else
                for (var i = 0, n = this._rootNode.childNodes.length; i < n; ++i) {
                    var node = this._rootNode.childNodes[i];
                    if (node.querySelector) {
                        var result = node.querySelector(query);
                        if (result)
                            return result;
                    }
                }
            return null;
        };
        /** Returns the first matching element from within this view that has the given ID. */
        ViewBase.prototype.getElementById = function (id) { return this.queryElement("#" + id); };
        /** Returns all elements from within this view that contains the given attribute name. */
        ViewBase.prototype.getElementsByAttribute = function (name) { return this.queryElements("[" + name + "]"); };
        /** Sets the value of an input element from within the root element for this view that matches the given ID, then returns the element that was set.
         * If there is no value property, the 'innerHTML' property is assumed.
         * If 'ignoreErrors' is false (default) and no element is found, an error is thrown.
         */
        ViewBase.prototype.setElementValueById = function (id, value, ignoreErrors) {
            if (value === void 0) { value = ""; }
            if (ignoreErrors === void 0) { ignoreErrors = false; }
            var el = this.getElementById(id);
            if (!el)
                if (!ignoreErrors)
                    throw "There is no element with an ID of '" + id + "' in this view.";
                else
                    return null;
            var hasValue = ('value' in el), hasInnerHTML = ('innerHTML' in el);
            if (!hasValue && !hasInnerHTML)
                throw "Element ID '" + id + "' within this view does not represent an element with a 'value' or 'innerHTML' property.";
            if (hasValue)
                el.value = value;
            else
                el.innerHTML = value;
            return el;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Searches the given node and all parents for a view based object. */
        ViewBase.getViewBase = function (fromNode, includeSelf) {
            if (includeSelf === void 0) { includeSelf = true; }
            var el = fromNode;
            if (el) {
                if (el.$__view)
                    if (includeSelf)
                        return el.$__view;
                    else if (!el.parentNode && el.$__view.parent)
                        // (if there is no parent node to move to, BUT this node has a view object, then the view object is detached, sub jump to the parent's node)
                        return ViewBase.getViewBase(el.$__view.parent._rootNode);
                do {
                    el = el.parentNode;
                    if (el && el.$__view)
                        return el.$__view;
                } while (el);
            }
            return null;
        };
        /**
         * Traverse the view object parent hierarchy to find a view that this view based object is contained within.
         * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
         */
        ViewBase.prototype.getParentView = function () {
            if (this._parent)
                if (this._parent instanceof View)
                    return this._parent;
                else
                    return this._parent.getParentView();
            return null;
        };
        /**
         * Traverse the view object parent hierarchy to find a views container that this view based object is contained within.
         * Note: This does not search the parent DOM nodes, only the view object specific hierarchy.
         */
        ViewBase.prototype.getParentViewsContainer = function () {
            if (this._parent)
                if (this._parent instanceof Views)
                    return this._parent;
                else
                    return this._parent.getParentViewsContainer();
            return null;
        };
        ViewBase.getView = function (fromNode, includeSelf) {
            if (includeSelf === void 0) { includeSelf = true; }
            var v = ViewBase.getViewBase(fromNode, includeSelf);
            if (v)
                if (v instanceof View)
                    return v;
                else
                    return ViewBase.getView(v._rootNode, false);
            return null;
        };
        ViewBase.getViewsContainer = function (fromNode, includeSelf) {
            if (includeSelf === void 0) { includeSelf = true; }
            var vc = ViewBase.getViewBase(fromNode, includeSelf);
            if (vc)
                if (vc instanceof Views)
                    return vc;
                else
                    return ViewBase.getViewsContainer(vc._rootNode, false);
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /**
         * Builds view containers and views from elements within this container.
         */
        //* When calling this function with no parameters, the default root page view is established, and the other containers
        //* and views are extracted and added in nested form based on nested associations.
        //* @param rootElement The element to start build the views from.
        ViewBase.prototype.buildViews = function () {
            // ... look for 'data-view-container' attributes in the root view and extract those now ...
            var containerElements = this.getElementsByAttribute('data-view-container');
            var viewContainers = [];
            for (var i = 0, n = containerElements.length; i < n; ++i)
                if (!containerElements[i].$__view) // (make sure this is not already wrapped in a view object)
                    viewContainers.push(new Views(containerElements[i]));
            // ... look for 'data-view' attributes on elements and attach those elements to their container parents ...
            var views = this.getElementsByAttribute('data-view');
            for (var i = 0, n = views.length; i < n; ++i) {
                var vEl = views[i], vname = vEl.attributes && vEl.attributes.getNamedItem("data-view").value || null;
                if (!vEl.$__view) { // (only add if not already added)
                    var parentContainer = ViewBase.getViewsContainer(vEl, false);
                    if (!parentContainer)
                        throw "View '" + vname + "' (element '" + vEl.nodeName + "') does not have a parent views container.";
                    parentContainer.createViewFromElement(vname, vEl);
                }
            }
            // ... hook up the view containers to the proper views they are contained in ...
            for (var i = 0, n = viewContainers.length; i < n; ++i) {
                var vc = viewContainers[i];
                var v = ViewBase.getView(vc._rootNode, false);
                if (v && vc.parent != v) {
                    if (v)
                        v.addViewContainer(vc); // (adds the container to the list if missing - which is usually true when building for the first time)
                }
            }
            return this;
        };
        return ViewBase;
    }());
    FlowScript.ViewBase = ViewBase;
    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        function View(name, urlOrElement, queryOrChildrenOnly, parent) {
            var _this = _super.call(this) || this;
            _this.queryOrChildrenOnly = queryOrChildrenOnly;
            _this._name = name || typeof urlOrElement == 'object' && (urlOrElement.id || urlOrElement.nodeName);
            if (urlOrElement instanceof Node && urlOrElement.nodeName == "HTML") {
                // ... the HTML element needs to be hooked up a special way ...
                _this._rootNode = urlOrElement;
                _this._contentElement = urlOrElement.querySelector("body"); // (note: in most cases, 'this._contentElement' being the 'body', usually also doubles as a view container)
                window.addEventListener("resize", function () { _this._doOnResize(); });
                _this._doOnResize(); // (this isn't called at least once by default when adding the event, so do so now)
            }
            else {
                // ... all other elements will be meshed with an iframe to capture resize events ...
                _this._rootNode = document.createElement("div"); // (give all views a default DIV container)
                _this.rootElement.innerHTML = "<iframe style=width:100%;height:100%;position:absolute;border:none;background-color:transparent;allowtransparency=true;visibility:hidden></iframe><div></div>";
                var iframe = _this._rootNode.firstChild;
                iframe.onload = function () {
                    if (iframe.contentWindow)
                        iframe.contentWindow.addEventListener("resize", function () { _this._doOnResize(); });
                    _this._doOnResize(); // (this isn't called at least once by default when adding the event, so do so now)
                };
                _this._contentElement = _this._rootNode.lastChild;
                if (urlOrElement instanceof HTMLElement) {
                    if (urlOrElement.attributes)
                        urlOrElement.attributes.removeNamedItem("data-view"); // (just in case, to prevent finding this node again)
                    // ... add element, or its children, to this view ...
                    if (queryOrChildrenOnly) {
                        if (urlOrElement.childNodes) // (make sure this node supports children)
                            for (var nodes = urlOrElement.childNodes, i = nodes.length - 1; i >= 0; --i) {
                                var child = nodes[i];
                                urlOrElement.removeChild(child);
                                _this.contentElement.insertBefore(child, _this.contentElement.firstChild);
                            }
                    }
                    else {
                        // ... add the element to the container element for this view (remove from any existing parent first) ...
                        if (urlOrElement.parentElement)
                            urlOrElement.parentElement.removeChild(urlOrElement);
                        _this.contentElement.appendChild(urlOrElement);
                        _this._contentElement = urlOrElement; // (this given element is now the content container)
                    }
                }
                else if (urlOrElement) {
                    _this._url = "" + urlOrElement;
                    _this._request = new FlowScript.Net.CachedRequest(_this._url, queryOrChildrenOnly);
                }
            }
            if (_this._rootNode)
                _this._rootNode.$__view = _this;
            var parentContainer = ViewBase.getViewsContainer(_this._rootNode, false) || parent;
            if (parentContainer)
                parentContainer.addView(_this);
            return _this;
        }
        Object.defineProperty(View.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        /** Holds a list of view containers that are managed by this view. */
        View.prototype.childViewContainers = function () { return this._childViewContainers; };
        /** Returns true if this view is the current view in the parent 'Views' container. */
        View.prototype.isCurrentView = function () { return this.parent.currentView == this; };
        Object.defineProperty(View.prototype, "scriptsApplied", {
            /** Set to true when scripts are evaluated so they are not evaluated more than once. */
            get: function () { return this._scriptsApplied; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "attached", {
            /** This is true if this view is the one showing in the parent views container. */
            get: function () { return this._parent ? this.parent.currentView == this : false; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "originalHTML", {
            get: function () { return this._request.result; },
            enumerable: true,
            configurable: true
        });
        /** Adds a callback that gets executed ONCE when the view is shown.
          * This can be used in view scripts to executed callbacks to run just after a view is attached for the first time.
          */
        View.prototype.oninit = function (func) {
            if (!this._oninitHandlers)
                this._oninitHandlers = [];
            this._oninitHandlers.push(func);
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Returns a new 'Views' container that wraps an element nested within this view.
          * Note: If the element exists outside this view, it will not be found.
          * @param elementID The ID of a nested child element within this view.
          * @param existingContentViewName If specified, any child elements of the target element are saved into a new view under this view container.
          * If not specified, the child elements will be cleared out when a view becomes shown.
          * @param showExistingContent If true (default), any existing contents remain visible once copied into a new view.
          * Set this to 'false' to hide the existing contents.
          */
        View.prototype.createViewContainer = function (elementID, existingContentViewName, showExistingContent) {
            if (showExistingContent === void 0) { showExistingContent = true; }
            var el = this.getElementById(elementID);
            if (!el)
                throw "There is no element with ID '" + elementID + "' contained within this view.";
            if (el.$__view)
                if (el.$__view instanceof Views)
                    return el.$__view;
                else
                    throw "Element '" + elementID + "' is already connected to view '" + el.$__view.name + "'.";
            var view = ViewBase.getViewBase(el, false) || this; // (get the child view container to the proper view that will manage it)
            if (view instanceof Views)
                throw "Element '" + elementID + "' is contained within a views container, and not a view. You can only create view containers from elements that have a view in the parent hierarchy.";
            if (!(view instanceof View))
                throw "Element '" + elementID + "' does not contained a view in the parent hierarchy, which is required.";
            var views = new Views(el);
            //? view.addViewContainer(views);
            // ... move any existing elements in this container into a view if requested; otherwise they will be removed when a view is set ...
            if (existingContentViewName && el.firstChild) {
                var viewName = "" + existingContentViewName;
                var view = views.createViewFromElement(viewName, el, true);
                if (showExistingContent)
                    view.show();
            }
            return views;
        };
        /** Adds a view container to this view and returns it. The container is first removed from any existing view parent. */
        View.prototype.addViewContainer = function (views) {
            var parentView = views['_parent'];
            if (parentView == this)
                return views; // (already added)
            if (parentView instanceof View)
                parentView.removeViewContainer(views);
            if (views['_parent'] != this) {
                views['_parent'] = this;
                if (!this._childViewContainers)
                    this._childViewContainers = [];
                this._childViewContainers.push(views);
            }
            return views;
        };
        /** Removes a view container from this view and returns it. If the container doesn't exist, 'undefined' is returned. */
        View.prototype.removeViewContainer = function (views) {
            views['_parent'] = null;
            if (this._childViewContainers) {
                var i = this._childViewContainers.indexOf(views);
                if (i >= 0)
                    return this._childViewContainers.splice(i, 1)[0];
            }
            return void 0;
        };
        /** Find an immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
        View.prototype.getViewContainer = function (name, recursive) {
            if (recursive === void 0) { recursive = false; }
            if (this._childViewContainers) {
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i) {
                    var vc = this._childViewContainers[i];
                    if (vc.name == name)
                        return vc;
                }
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    this._childViewContainers[i].getViewContainer(name, recursive);
            }
            return null;
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a callback that gets executed each time this view is shown. */
        View.prototype.onshow = function (func) {
            if (!this._onshowHandlers)
                this._onshowHandlers = [];
            this._onshowHandlers.push(func);
            return this;
        };
        View.prototype.show = function () {
            if (this.parent)
                this.parent.showView(this);
            return this;
        };
        View.prototype._doOnShow = function () {
            // ... run all the one-time init handlers, if any, and remove them ...
            if (this._oninitHandlers && this._oninitHandlers.length) {
                for (var i = 0, len = this._oninitHandlers.length; i < len; ++i)
                    this._oninitHandlers[i].call(this, this);
                this._oninitHandlers.length = 0; // (these only run once)
            }
            // ... run all the on-show handlers, if any ...
            if (this._onshowHandlers && this._onshowHandlers.length)
                for (var i = 0, len = this._onshowHandlers.length; i < len; ++i)
                    this._onshowHandlers[i].call(this, this);
            // ... if this view is showing, which means all child views are also showing, so recursively run the handlers ...
            if (this._childViewContainers && this._childViewContainers.length)
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                        vc.views[i2]._doOnShow();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a callback that gets executed each time this view is shown. */
        View.prototype.onhide = function (func) {
            if (!this._onhideHandlers)
                this._onhideHandlers = [];
            this._onhideHandlers.push(func);
            return this;
        };
        View.prototype.hide = function () {
            if (this.attached)
                this.parent.hideCurrentView();
            return this;
        };
        View.prototype._doOnHide = function () {
            // ... run all the on-hide handlers, if any ...
            if (this._onhideHandlers && this._onhideHandlers.length)
                for (var i = 0, len = this._onhideHandlers.length; i < len; ++i)
                    this._onhideHandlers[i].call(this, this);
            // ... if this view is hidden, which means all child views are also hidden, so recursively run the handlers ...
            if (this._childViewContainers && this._childViewContainers.length)
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                        vc.views[i2]._doOnHide();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Adds a callback that gets executed each time this view changes size. */
        View.prototype.onresize = function (func) {
            if (!this._onresizeHandlers)
                this._onresizeHandlers = [];
            this._onresizeHandlers.push(func);
            return this;
        };
        View.prototype._doOnResize = function () {
            // ... run all the on-hide handlers, if any ...
            if (this._onresizeHandlers && this._onresizeHandlers.length)
                for (var i = 0, len = this._onresizeHandlers.length; i < len; ++i)
                    this._onresizeHandlers[i].call(this, this);
            // ... if this view is resized, that means all child views may also be changed, so recursively run the handlers ...
            if (this._childViewContainers && this._childViewContainers.length)
                for (var i = 0, n = this._childViewContainers.length; i < n; ++i)
                    for (var vc = this._childViewContainers[i], i2 = 0, n2 = vc.count; i2 < n2; ++i2)
                        vc.views[i2]._doOnResize();
        };
        // --------------------------------------------------------------------------------------------------------------------
        /** Clears all children from the root node. The view is blank after calling this. */
        View.prototype.clear = function () { FlowScript.Utilities.HTML.clearChildNodes(this.contentElement); };
        /** Clears all children from the root node and reloads the view. If the view is not loaded yet, then the view is cleared only. */
        View.prototype.reset = function () { this.contentElement.innerHTML = this._request && this._request.result ? this._request.result : ""; };
        // --------------------------------------------------------------------------------------------------------------------
        //?private _executeScripts() {
        //    if (!this._scriptsApplied) {
        //        this._scriptsApplied = true; // (do first to make sure this doesn't get called again in the evaluation)
        //        try {
        //            if (this._scripts && this._scripts.length) {
        //                View.scriptView = this;
        //                for (var i = 0, len = this._scripts.length; i < len; ++i) {
        //                    var script = this._scripts[i];
        //                    var scriptElement = document.createElement("script"); // TODO: copy attributes also? (ideas: http://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml)
        //                    if (script.code)
        //                        scriptElement.text = script.code;
        //                    script.newScriptNode = scriptElement;
        //                    if (script.originalScriptNode)
        //                        script.originalScriptNode.parentNode.replaceChild(scriptElement, script.originalScriptNode);
        //                    else
        //                        document.body.appendChild(scriptElement);
        //                    if (script.src)
        //                        scriptElement.src = script.src; // (this allows debugging with maps if available!)
        //                    //FlowScript.evalGlobal(this._scripts.join("\r\n\r\n"));
        //                }
        //            }
        //        }
        //        finally {
        //            View.scriptView = void 0;
        //        }
        //    }
        //}
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.onloaded = function (func) {
            var _this = this;
            this._request.onloaded(function (req, ev) {
                if (_this.contentElement && !_this.contentElement.innerHTML) { // (only set once - don't clear anything existing)
                    _this.contentElement.innerHTML = req.result;
                    // ... load any scripts if found before triggering the callback ...
                    var scripts = _this.contentElement.getElementsByTagName("script");
                    if (scripts.length) {
                        var checkCompleted = function () {
                            for (var i = 0, len = _this._scripts.length; i < len; ++i)
                                if (!_this._scripts[i].applied) {
                                    loadScript(_this._scripts[i]);
                                    return;
                                }
                            func.call(_this, _this, req, ev);
                        };
                        var loadScript = function (script) {
                            View.loadedView = _this;
                            //script.originalScriptNode.parentNode.replaceChild(script.newScriptNode, script.originalScriptNode);
                            script.originalScriptNode.parentNode.removeChild(script.originalScriptNode);
                            document.body.appendChild(script.newScriptNode);
                            if (!script.src) {
                                if (script.code)
                                    script.newScriptNode.text = script.code;
                                script.applied = true; // (no synchronous loading required)
                                checkCompleted();
                            }
                            else {
                                script.newScriptNode.onload = function (_ev) {
                                    View.loadedView = void 0;
                                    script.applied = true;
                                    checkCompleted();
                                };
                                script.newScriptNode.onerror = function (_ev) {
                                    View.loadedView = void 0;
                                    _this._request._doOnError(_ev);
                                };
                                script.newScriptNode.src = script.src;
                            }
                        };
                        if (!_this._scripts)
                            _this._scripts = [];
                        for (var i = 0, len = scripts.length; i < len; ++i)
                            _this._scripts.push({ originalScriptNode: scripts[i], src: scripts[i].src, code: scripts[i].text, newScriptNode: document.createElement('script') });
                        loadScript(_this._scripts[0]);
                    }
                    else
                        func.call(_this, _this, req, ev);
                }
                else
                    func.call(_this, _this, req, ev);
            });
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.onerror = function (func) {
            var _this = this;
            this._request.onerror(function (req, ev) { func.call(_this, _this, req, ev); });
            return this;
        };
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.thenLoad = function (name, url, payload, delay) {
            if (delay === void 0) { delay = 0; }
            var view = this.parent.createView(name, url, payload);
            view._request = this._request.thenLoad(url, payload, delay);
            return view;
        };
        // --------------------------------------------------------------------------------------------------------------------
        View.prototype.send = function () { this._request.send(); return this; };
        return View;
    }(ViewBase));
    FlowScript.View = View;
    /**
     * Holds a list of views dynamically loaded from the server.
     */
    var Views = /** @class */ (function (_super) {
        __extends(Views, _super);
        function Views(viewsContainerOrID, containerName) {
            var _this = _super.call(this) || this;
            _this._views = [];
            if (viewsContainerOrID instanceof Node)
                _this._rootNode = viewsContainerOrID;
            else if (viewsContainerOrID) {
                _this._rootNode = document.getElementById("" + viewsContainerOrID);
                if (!_this._rootNode)
                    throw "No element with an ID of '" + viewsContainerOrID + "' could be found.";
                if (_this._rootNode.$__view != _this)
                    throw "The specified element is already associated with a view.";
            }
            if (_this._rootNode) {
                _this._rootNode.$__view = _this;
                if (_this._rootNode instanceof Element) {
                    if (_this._rootNode.attributes)
                        _this._rootNode.attributes.removeNamedItem("data-view-container"); // (just in case, to prevent finding this node again)
                    if (!containerName) {
                        if (_this._rootNode.attributes) {
                            var attr = _this._rootNode.attributes.getNamedItem("data-view-container");
                            containerName = attr && attr.value;
                        }
                        if (!containerName)
                            containerName = _this._rootNode.id || _this._rootNode.nodeName;
                    }
                }
            }
            _this._name = containerName || "";
            // ... check if there is a parent 'view' object we need to associated with ...
            var parentView = ViewBase.getView(_this._rootNode, false);
            if (parentView)
                parentView.addViewContainer(_this);
            return _this;
        }
        Object.defineProperty(Views.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "count", {
            /** Returns the number of views in this container. */
            get: function () { return this._views.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "views", {
            /** Returns the list of all views in this container. */
            get: function () { return this._views; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "currentView", {
            get: function () { return this._currentView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "firstView", {
            /** Returns the first view in the collection, or 'null' if empty. */
            get: function () { return this._views && this._views.length && this._views[0] || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Views.prototype, "lastView", {
            /** Returns the last view in the collection, or 'null' if empty. */
            get: function () { return this._views && this._views.length && this._views[this._views.length - 1] || null; },
            enumerable: true,
            configurable: true
        });
        Views.prototype.addView = function (view, hidden) {
            if (hidden === void 0) { hidden = !!(this._views && this._views.length); }
            var parent = view["_parent"];
            if (parent)
                if (parent == this)
                    return view;
                else
                    parent.removeView(view);
            this._views.push(view);
            view["_parent"] = this;
            if (hidden && view.rootNode && view.rootNode.parentNode) // (remove from view when added, until the user decides to show it later)
                view.rootNode.parentNode.removeChild(view.rootNode);
            return view;
        };
        Views.prototype.removeView = function (view) {
            var i = this._views.indexOf(view);
            if (i >= 0) {
                view = this._views.splice(i, 1)[0];
                view["_parent"] = null;
            }
            else
                view = FlowScript.undefined;
            return view;
        };
        /**
         * Creates a new view from HTML loaded from a given URL.
         * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
         * @param name A name for this view.
         * @param url The URL to load the view from. If not specified, a blank view is created.
         * @param payload URL query values. Ignored if 'url' is not specified.
         */
        Views.prototype.createView = function (name, url, payload, rootNode) {
            var view = this.getView(name);
            if (view)
                return view;
            view = new View(name, url, payload, this);
            this.addView(view);
            return view;
        };
        /**
         * Creates a new view from a DOM element, or its children.
         * If a view with the same name exists, the view is returned as is, and all other arguments are ignored.
         * @param name A name for this view.
         * @param element The element to associated with the view (will be removed from any existing parent).  This is the element that will be added and removed from the parent Views container.
         * @param childrenOnly If true, only the children of the specified element are moved into the new view.
         */
        Views.prototype.createViewFromElement = function (name, elementOrID, childrenOnly) {
            var view = this.getView(name);
            if (view)
                return view;
            var element = elementOrID instanceof HTMLElement ? elementOrID : this.getElementById(elementOrID);
            if (!element)
                throw "Element '" + elementOrID + "' does not exist within this view.";
            return new View(name, element, childrenOnly, this);
        };
        Views.prototype.getView = function (name) {
            for (var i = 0, len = this._views.length; i < len; ++i)
                if (this._views[i].name == name)
                    return this._views[i];
            return null;
        };
        Views.prototype.showView = function (viewOrName) {
            var _view;
            if (_view === null || viewOrName instanceof View) {
                _view = viewOrName;
            }
            else {
                _view = this.getView('' + viewOrName);
                if (!_view)
                    throw "There's no view named '" + viewOrName + "' (case sensitive).";
            }
            if (this._currentView != _view) {
                FlowScript.Utilities.HTML.clearChildNodes(this.contentElement);
                if (this._currentView)
                    this._currentView['_doOnHide']();
                if (_view && _view.rootNode) {
                    this.contentElement.appendChild(_view.rootNode);
                    this._currentView = _view;
                    _view['_doOnShow']();
                }
                else
                    this._currentView = null;
            }
            return _view;
        };
        Views.prototype.hideCurrentView = function () {
            this.showView(null);
        };
        /** Find the next immediate child container with the specified name.  If 'recursive' is true, all nested child containers are also searched. */
        Views.prototype.getViewContainer = function (name, recursive) {
            if (recursive === void 0) { recursive = false; }
            if (this._views)
                for (var i = 0, n = this._views.length; i < n; ++i) {
                    var vc = this._views[i].getViewContainer(name, recursive);
                    if (vc)
                        return vc;
                }
            return null;
        };
        /**
         * Builds view containers and views from elements, starting with the document root, which is 'window.document' by
         * default if no root is specified. The root document object is the default container when building views.
         * When calling this function with no parameters, the default root page view is established, and the other containers
         * and views are extracted and added in nested form based on nested associations.
         * @param rootElement The element to start build the views from.
         */
        Views.buildViews = function (documentRoot) {
            if (documentRoot === void 0) { documentRoot = document; }
            var rootContainer = new Views(documentRoot);
            return rootContainer.buildViews();
        };
        return Views;
    }(ViewBase));
    FlowScript.Views = Views;
})(FlowScript || (FlowScript = {}));
//# sourceMappingURL=views.js.map