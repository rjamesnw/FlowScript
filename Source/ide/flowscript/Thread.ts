﻿// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    /** A thread wraps a single script block. 
      * One script can have many threads.
      */
    export class Thread {
        // --------------------------------------------------------------------------------------------------------------------

        private _parent: IFlowScript;
        private _block: Block;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: IFlowScript) {
            this._parent = parent;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
