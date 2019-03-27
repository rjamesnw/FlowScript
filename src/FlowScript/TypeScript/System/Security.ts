// ############################################################################################################################
// User Access Security

namespace FlowScript {
    // ========================================================================================================================

    export enum UserRoles {
        /** The user has no access. */
        None,
        /** The user has full access as administrator. */
        Admin,
        /** The user has read access. */
        Viewer,
        /** The user is allowed to make modifications. Implies read access, but does not include creation access. */
        Editor,
        /** The user can create and modify. */
        Creator,
        /** The user can delete/remove. */
        Purger
    }

    export class UserAccessEntry {
        constructor(public userID: string, public roles: UserRoles[]) { }

        /** Returns true if the specified role exists in this access entry. */
        hasRole(role: UserRoles) {
            if (this.roles)
                for (var i = 0, n = this.roles.length; i < n; ++i)
                    if (this.roles[i] == role)
                        return true;
            return false;
        }
    }

    export class UserAccess {
        private _userIDs: UserAccessEntry[] = [];

        get length() { return this._userIDs.length; }

        /** Assigns a user ID and one or more roles. If roles already exist, the given roles are merged (existing roles are note replaced). */
        add(userID: string, ...roles: UserRoles[]): UserAccessEntry {
            var entry = this.getItem(userID);
            if (!entry) {
                entry = new UserAccessEntry(userID, roles);
                this._userIDs.push(entry);
            } else {
                if (!entry.roles)
                    entry.roles = roles;
                else
                    entry.roles.push(...roles);
            }
            return entry;
        }

        /** Removes a user's access. */
        revoke(index: number): boolean;
        /** Removes a user's access. */
        revoke(id: string): boolean;
        revoke(indexOrID: number | string): boolean {
            var i = typeof indexOrID == 'number' ? indexOrID : this.indexOf(indexOrID);
            return i >= 0 ? (this._userIDs.splice(i, 1), true) : false;
        }

        /** Finds the index of the entry with the specific user ID. */
        indexOf(userID: string) {
            for (var i = 0, n = this.length; i < n; ++i)
                if (this._userIDs[i].userID == userID)
                    return i;
            return -1;
        }

        /** Gets a user access entry using an index. */
        getItem(index: number): UserAccessEntry;
        /** Gets a user access entry using the user ID. */
        getItem(userID: string): UserAccessEntry;
        getItem(indexOrID: number | string): UserAccessEntry {
            return this._userIDs[typeof indexOrID == 'number' ? indexOrID : this.indexOf(indexOrID)];
        }
    }

    // ========================================================================================================================
}

// ############################################################################################################################
