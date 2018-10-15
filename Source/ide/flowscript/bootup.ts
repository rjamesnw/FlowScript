module FlowScript {
    // ========================================================================================================================

    Type.All = new Core.All();
    Type.Inferred = new Core.Inferred();

    // ========================================================================================================================

    /** Contains the default core system types expected by the compiler. Since these core types must always exist, a default
      * type graph is created here for convenience.
      */
    export var System = createNew().System;

    // ========================================================================================================================
}