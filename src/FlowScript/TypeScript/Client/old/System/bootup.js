var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    FlowScript.Type.All = new FlowScript.Core.All();
    FlowScript.Type.Inferred = new FlowScript.Core.Inferred();
    // ========================================================================================================================
    /** Contains the default core system types expected by the compiler. Since these core types must always exist, a default
      * type graph is created here for convenience.
      */
    FlowScript.System = FlowScript.createNew().System;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
//# sourceMappingURL=bootup.js.map