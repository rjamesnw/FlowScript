var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    var Project = /** @class */ (function () {
        // --------------------------------------------------------------------------------------------------------------------
        function Project(
        /** The title of the project. */ title, 
        /** The project's description. */ description) {
            this.title = title;
            this.description = description;
            this._expressionBin = [];
            this.onExpressionBinItemAdded = new FlowScript.EventDispatcher(this);
            this.onExpressionBinItemRemoved = new FlowScript.EventDispatcher(this);
            this._script = FlowScript.createNew();
        }
        Object.defineProperty(Project.prototype, "script", {
            // --------------------------------------------------------------------------------------------------------------------
            /** The script instance for this project. */
            get: function () { return this._script; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Project.prototype, "expressionBin", {
            // --------------------------------------------------------------------------------------------------------------------
            // Create a type of trash-bin to hold expressions so the user can restore them, or delete permanently.
            /** Holds a list of expressions the developer has removed from scripts. This renders to a global space, which allows
              * developers to move expressions easily between scripts.
              * Use 'addExpressionToBin()' and 'removeExpressionFromBin()' to modify this list, which also triggers the UI to update.
              */
            get: function () { return this._expressionBin; },
            enumerable: true,
            configurable: true
        });
        // --------------------------------------------------------------------------------------------------------------------
        Project.prototype.save = function () {
            return this.script.saveToStorage(this.title);
        };
        // --------------------------------------------------------------------------------------------------------------------
        Project.prototype.addToBin = function (expr, triggerEvent) {
            if (triggerEvent === void 0) { triggerEvent = true; }
            if (this._expressionBin.indexOf(expr) < 0) {
                this._expressionBin.push(expr);
                if (triggerEvent)
                    this.onExpressionBinItemAdded.trigger(expr, this);
            }
        };
        Project.prototype.removeFromBin = function (expr, triggerEvent) {
            if (triggerEvent === void 0) { triggerEvent = true; }
            var i = this._expressionBin.indexOf(expr);
            if (i >= 0) {
                var expr = this._expressionBin.splice(i, 1)[0];
                if (triggerEvent)
                    this.onExpressionBinItemRemoved.trigger(expr, this);
            }
        };
        Project.prototype.isInBin = function (expr) { return this._expressionBin.indexOf(expr) >= 0; };
        // --------------------------------------------------------------------------------------------------------------------
        Project.prototype._findChildNode = function (node, fstype) {
            if (node) {
                for (var i = 0, len = node.childNodes.length; i < len; ++i)
                    if (node.childNodes[i]["$__fs_type"] == fstype)
                        return node.childNodes[i];
            }
            else
                return null;
        };
        return Project;
    }());
    FlowScript.Project = Project;
    // ========================================================================================================================
    /**
     * Holds a collection of projects.
     */
    var Projects = /** @class */ (function () {
        function Projects() {
            this._projects = [];
        }
        Object.defineProperty(Projects.prototype, "count", {
            get: function () { return this._projects.length; },
            enumerable: true,
            configurable: true
        });
        Projects.prototype.createProject = function (title, description, projectType) {
            var project = new (projectType || Project)(title, description);
            this._projects.push(project);
            return project;
        };
        return Projects;
    }());
    FlowScript.Projects = Projects;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
//# sourceMappingURL=projects.js.map