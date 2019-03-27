// ############################################################################################################################
// Data Tables

namespace FlowScript {
    // ========================================================================================================================

    /** The current user of the FlowScript system. 
     * The user 'id' (a GUID) is used as the root directory for projects.
     */
    export class User extends TrackableObject {

        /** Returns the current user object. */
        static get current() { return _currentUser; }

        /** Triggered when the current user is about to change.  If any handler returns false then the request is cancelled (such as if the current project is not saved yet). */
        static readonly onCurrentUserChanging = new EventDispatcher<typeof User, (oldUser: User, newUser: User) => boolean>(User);

        /** Triggered when the current user has changed. This event cannot be cancelled - use the 'onCurrentUserChanging' event for that. */
        static readonly onCurrentUserChanged = new EventDispatcher<typeof User, (oldUser: User, newUser: User) => void>(User, false, false);

        /** Starts the process of changing the current user. */
        static async changeCurrentUser(user: User) {
            return new Promise<void>((resolve, reject) => {
                this.onCurrentUserChanging.triggerAsync(_currentUser, user)
                    .then(() => this.onCurrentUserChanged.triggerAsync(_currentUser, user), reject) // (any exception in the previous promise will trigger 'reject')
                    .then(resolve, reject); // (any exception in the previous 'then' will trigger 'reject')
            });
        }

        /** Holds a mapping of this user ID to global roles associated with the user. */
        readonly _security = new UserAccess();

        /** Scripts owned by this user. */
        scripts: IFlowScript[] = [];

        constructor(
            public email: string,
            public firstname?: string,
            public lastname?: string
        ) { super(); }
    }

    // ========================================================================================================================

    var _currentUser = new User("");

    // ========================================================================================================================
}

// ############################################################################################################################
