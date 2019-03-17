// ############################################################################################################################

namespace FlowScript.Core.Net.HTTPRequest {
    // ========================================================================================================================
    // Message ID Constants

    export var MSG_LOADFAILED = "LoadFailed";

    // ========================================================================================================================

    /** A line represents a single execution step in a code component.
      */
    export class HTTPRequest extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Functional, "LoadFromURL", "Load from url: $url, using method: $method"); // Note: '$method' will be preset to the value '(default)' to the developer.
        }

        onInit() {
            var script = this.script;

            // Register some global types:

            var HTTPRequestMethods = new Enum(script.System, "HTTPRequestMethods").setValue("GET", "GET").setValue("POST", "POST");

            // Setup the expected parameters:

            this.defineParameter("url", [script.System.String], "", "^(\w+:\/\/)?((?:\w*):(?:\w*)@)?((?:\w+)(?:\.\w+)*)?((?:\/[-_a-zA-Z0-9.~!$&'()*+,;=:@%]+)*\/?)?(\?\w+=.*)?(#.*)?$");
            this.defineLocalVar("method", [HTTPRequestMethods], "GET", undefined, true);
            this.defineReturnVar("data", script.System.String);
            var evtError = this.registerEvent("error");
            var evtAbort = this.registerEvent("abort");
            var evtError = this.registerEvent("timeout");

            // Setup some messages

            script.registerMessage("Load failed: $0", MSG_LOADFAILED);

            // Set the component's script:
            //?this.addStatement(new CustomJS(this, "Get XHR Object", function HTTPRequest(ctx: RuntimeContext): any {
            //?}));

            super.onInit();
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
