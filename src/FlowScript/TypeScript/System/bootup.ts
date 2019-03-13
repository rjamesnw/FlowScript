namespace FlowScript {
    // ========================================================================================================================

    /** The current FlowScript version. */
    export var version = "0.0.1";

    NamespaceObject.All = new Core.All();
    NamespaceObject.Inferred = new Core.Inferred();

    // ========================================================================================================================

    /** Contains the default core system types expected by the compiler. Since these core types must always exist, a default
      * type graph is created here for convenience.
      */
    export var System = createNew().System;

    // ============================================================================================================================

    if (typeof navigator != 'undefined' && navigator.userAgent)
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0 || navigator.userAgent.indexOf("Edge") >= 0)
            console.log("-=< FlowScript - v" + FlowScript.version + " >=- ");
        else
            console.log("%c -=< %cFlowScript - v" + FlowScript.version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");

    // ========================================================================================================================
}