// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface IReferencedObject {
        referenceStr: string;
        getReference(): NamedReference<{}>;
    }

    /**
     * References types in the type tree. This is used to track types, instead of pointers, since types can be deleted and
     * recreated, invalidating all references to the deleted type object.  A named reference uses a dot-delimited root path
     * and target path to the referenced object.  Only strings are accepted in order to allow saving references during
     * serialization.
     */
    export class NamedReference<T extends object> {
        // private static _references: NamedReference<any>[] = [];
        private _root: object;
        root: string;
        path: string;

        private get _fullPath() {
            return this.root && this.path && this.root + "." + this.path || this.root || this.path;
        }

        get fullPath() {
            if (this._root)
                throw "Cannot get the full path for reference '" + this + "' because the root object cannot be resolved from the global scope."
                + " This typically means you used 'fromInstance()' to create a reference, and thus an absolute path (from the global scope) cannot be determined.";
            return this._fullPath;
        }

        /**
         * Creates a new reference.
         * @param {string} path Dot-delimited identifiers that are the path to the value pointed to by this reference.
         * @param {string} root An optional dot-delimited identifiers that resolve to a root object used to resolve the path. 
         * If not specified, the path is assume to be an absolute path.
         */
        constructor(path: string, root?: string) {
            root = '' + root;
            path = '' + path;
            if (root && root.charAt)
                while (root.length && root.charAt(root.length - 1) == '.') root = path.substr(0, root.length - 1);
            if (path && path.charAt)
                while (path.length && path.charAt(0) == '.') path = path.substr(1);
            this.root = root;
            this.path = path;
        }

        /** Creates a reference from a root object instance.  Note that because a direct instance reference is made, the reference cannot be serialized (saved).
         * NEVER CALL THIS FUNCTION, except for very special cases.
         */
        static fromInstance<T extends object>(rootObject: T, path: string): NamedReference<T> {
            var ref = new NamedReference<T>(path, null);
            ref._root = rootObject;
            return ref;
        }

        /** Creates a reference to an object under a specific script.
         */
        static fromScriptPath<T extends object>(script: IFlowScript, path: string): NamedReference<T> {
            var ref = new NamedReference<T>(path, rootName + ".$(" + script._id + ")");
            return ref;
        }

        /** Returns the dot-delimited path represented by this reference. */
        toString() { return this._fullPath; }
        valueOf(): T {
            try {
                var root = this._root;
                if (!root && this.root) {
                    root = eval(this.root);
                    if (root === null || root === void 0)
                        throw "Root path resolves to null or undefined.";
                }
                return root && (this.path ? eval("root." + this.path) : root) || eval(this.path);
            }
            catch (ex) {
                if (this._root)
                    throw "Failed to resolve path '" + this.path + "' from the root object '" + this._root + "': " + ex;
                else
                    throw "Failed to resolve path '" + this.path + "' from the root path '" + this.root + "': " + ex;
            }
        }

        /** Returns true if this reference represents a null/empty reference. */
        get isNull(): boolean { return !this.root && !this.path; }

        ///**
        // * Checks if the give root + path is valid for this reference.
        // */
        //? get isValid(): boolean {
        //    if (!this.root || typeof this.root != OBJECT) return false; // (path is not valid by default with no root exists)
        //    if (!this.path) return true; // (an empty path is valid, as it references the root object)
        //    var names = this.path.split(',');
        //    var o = this.root;
        //    for (var i = 0, n = names.length; i < n; ++i) {
        //        if (typeof o != OBJECT) return false; // (cannot get a property name of a non-object)
        //        var name = names[i];
        //        if (name in o)
        //            o = o[name];
        //        else
        //            return false;
        //    }
        //    return true;
        //}
    }

    // ========================================================================================================================
}