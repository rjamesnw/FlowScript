// ############################################################################################################################
// Data Tables

namespace FlowScript {
    // ========================================================================================================================

    /** The current user of the FlowScript system. 
     * The user 'id' (a GUID) is used as the root directory for projects.
     */
    export class User extends TrackableObject {
        /** Scripts owned by this user. */
        scripts: IFlowScript[] = [];

        constructor(
            public email: string,
            public firstname?: string,
            public lastname?: string
        ) { super(); }
    }

    // ========================================================================================================================

    export var currentUser = new User("");

    // ========================================================================================================================
}

// ############################################################################################################################
