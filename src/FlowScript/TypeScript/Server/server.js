var location;
var navigator;
var window;
var document;
/** The root namespace for the FlowScript system. */
var FlowScript;
(function (FlowScript) {
    /** The shared base class for both client and server side scripts. */
    class FlowScriptBase {
    }
    FlowScript.FlowScriptBase = FlowScriptBase;
})(FlowScript || (FlowScript = {}));
var FlowScript;
(function (FlowScript) {
    class FlowScriptServer extends FlowScript.FlowScriptBase {
        constructor() {
            super(...arguments);
            this.y2 = 1;
        }
        main() {
        }
    }
    FlowScript.FlowScriptServer = FlowScriptServer;
})(FlowScript || (FlowScript = {}));
//# sourceMappingURL=server.js.map