// ############################################################################################################################
// FileManager

namespace FlowScript.FileSystem {
    // ========================================================================================================================

    export enum SyncStatus {
        /** Not synchronizing. */
        None,
        /** The content is being uploaded. */
        Uploading,
        /** Upload error. */
        Error,
        /** File now exists on the remote endpoint. */
        Completed
    }

    var reviewTimerHandle: number;
    function _syncFileSystem() {
        reviewTimerHandle = void 0;
    }

    export class DirectoryItem {
        private _fileManager: FileManager;

        /** Holds the UTC time the item was stored locally. If this is undefined then the item is in memory only, which might result in data loss if not stored on the server. */
        storedLocally: Date;
        /** Holds the UTC time the item was stored remotely. If this is undefined and the item is not stored locally then the item is only in memory and that could lead to data loss. */
        storedRemotely: Date;

        /** The last time this*/
        get lastAccessed() { return this._lastAccessed; }
        /** Updates the 'lastAccessed' date+time value to the current value. Touching this directory item also refreshes the dates of all parent items. 
         * When the date of an item changes after a touch, it starts the process of reviewing and synchronizing with the backend.
         */
        touch() {
            this._lastAccessed = new Date();
            if (this._parent) this._parent.touch();
            else {
                if (typeof reviewTimerHandle == 'number')
                    clearTimeout(reviewTimerHandle);
                reviewTimerHandle = setTimeout(_syncFileSystem, 500);
            }
        }
        private _lastAccessed: Date;

        /** The sync status of this item. 
         * Note: Each directory item node syncs in sequence parent-to-child; thus, the child only syncs when the parent succeeds.  That said,
         * to be efficient, the parent will send itself AND all child directories (not files) as one JSON request.
         */
        syncStatus: SyncStatus = 0;
        lastSynced: Date;
        syncError: string;

        /** Returns a reference to the parent item.  If there is no parent, then 'null' is returned.
         */
        get parent(): DirectoryItem { return this._parent; }
        /** Sets a new parent type for this.  The current item will be removed from its parent (if any), and added to the given parent. */
        set parent(parent: DirectoryItem) {
            if (this._parent)
                this._parent.remove(this);
            if (parent)
                parent.add(this);
        }
        private _parent: DirectoryItem;

        get name(): string { return this._name; }
        private _name: string;

        //get type(): string { return this._type; }
        //private _type: string;

        private _childItems: DirectoryItem[] = [];
        private _childItemsByName: { [index: string]: DirectoryItem } = {};

        /** The full path + item name. */
        get absolutePath(): string { return this._parent && this._parent.absolutePath + '/' + this._name || this._name; }

        // --------------------------------------------------------------------------------------------------------------------

        constructor(fileManager: FileManager) { this._fileManager = fileManager; }

        toString() { return this.absolutePath; }

        // --------------------------------------------------------------------------------------------------------------------

        /** Checks if a namespace item exists.  You can also provide a nested item path.
          * For example, if the current item is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        exists(name: string, ignore?: DirectoryItem): boolean;
        /** Checks if the given namespace item exists under this item.
          */
        exists(item: DirectoryItem, ignore?: DirectoryItem): boolean;
        exists(nameOrItem: DirectoryItem | string, ignore?: DirectoryItem): boolean {
            if (nameOrItem === void 0 || nameOrItem === null || !this._childItems) return false;
            if (typeof nameOrItem === 'object' && nameOrItem instanceof DirectoryItem) {
                var item = this._childItemsByName[nameOrItem._name];
                return !!item && item != ignore;
            }
            var t = this.resolve(nameOrItem);
            return !!t && t != ignore;
        }

        /** Resolves a namespace path under this item.  You can provide a nested path if desired.
          * For example, if the current item is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          * If not found, then null is returned.
          * @param {function} typeFilter The type that the returned item must be a derivative of.
          */
        resolve<T extends DirectoryItem>(itemPath: string, typeFilter?: new (...args: any[]) => T): T {
            if (itemPath === void 0 || itemPath === null || !this._childItems) return null;
            var parts = (typeof itemPath !== 'string' ? '' + itemPath : itemPath).split('.'), t: DirectoryItem = this;
            for (var i = (parts[0] ? 0 : 1), n = parts.length; i < n; ++i) {
                // (note: 'parts[0]?0:1' is testing if the first entry is empty, which then starts at the next one [to support '.X.Y'])
                var item = t._childItemsByName[parts[i]];
                if (!item)
                    return null;
                else
                    t = item;
            }
            return <T>(typeFilter ? (t instanceof typeFilter ? t : null) : t);
        }

        /** Adds the given item under this item.
          */
        add<T extends DirectoryItem>(item: T): T {
            if (item === void 0 || item === null)
                throw "Cannot add an empty item name/path to '" + this.absolutePath + "'.";
            if (this.exists(item))
                throw "The item '" + item + "' already exists in the namespace '" + this.absolutePath + "'.";
            if (typeof item !== 'object' || !(item instanceof DirectoryItem))
                throw "The item '" + item + "' is not a valid 'DirectoryItem' object.";
            if (item.parent)
                if (item.parent == this)
                    return item;
                else
                    item.parent.remove(item);
            item._parent = this;
            if (!this._childItems)
                this._childItems = [];
            if (!this._childItemsByName)
                this._childItemsByName = {};
            this._childItems.push(item);
            this._childItemsByName[item.name] = item;
            return item;
        }

        /** Removes an item under this item. If nothing was removed, then null is returned, otherwise the removed item is returned (not the item passed in). */
        remove<T extends DirectoryItem>(item: T): T;
        /** Removes an item under this item.  If nothing was removed, then null is returned, otherwise the removed item is returned.
         *  You can provide a nested item path if desired. For example, if the current item is 'A/B' within the 'A/B/C/D' namespace,
         *  then you could pass in 'C/D'.
          */
        remove(name: string): DirectoryItem;
        remove(itemOrName: any): DirectoryItem {
            if (itemOrName === void 0 || itemOrName === null)
                throw "Cannot remove an empty name/path from directory '" + this.absolutePath + "'.";

            if (!this._childItems) return null;

            var parent: DirectoryItem; // (since types can be added as roots to other types [i.e. no parent references], need to remove item objects as immediate children, not via 'resolve()')

            if (typeof itemOrName == 'object' && itemOrName instanceof DirectoryItem) {
                var t = <DirectoryItem>itemOrName;
                if (!this._childItemsByName[t.name])
                    throw "Cannot remove item: There is no child item '" + itemOrName + "' under '" + this.absolutePath + "'.";
                parent = this;
            }
            else {
                var t = this.resolve(itemOrName);
                if (t) parent = t.parent;
            }

            if (t && parent) {
                delete parent._childItemsByName[t.name];
                var i = parent._childItems.indexOf(t);
                if (i >= 0) parent._childItems.splice(i, 1);
                t._parent = null;
            }

            return t;
        }

        getJSONStructure<T extends typeof DirectoryItem>(typeFilter?: T) {
            JSON.stringify(this, (k, v) => {
                if (!k || k == '_childItems' || k == 'name') // ('k' is empty for the root object)
                    if (!typeFilter || !v || v instanceof typeFilter) return v;
            }, 2);
            //var body = this._getJSONStructure(typeFilter, "  ");
            //return "{" + (body ? "\r\n" + body : "") + "}\r\n";
        }
        //_getJSONStructure(typeFilter: typeof DirectoryItem, margin = '') {
        //    if (!(this instanceof typeFilter)) return "";
        //    var block = margin, indent = margin + "  ", body = '';
        //    for (var i = 0, n = this._childItems.length; i < n; ++i)
        //        body += this._childItems[i]._getJSONStructure(typeFilter, indent);
        //    if (body)
        //        return block + "{\r\n" + margin + body + "}\r\n";
        //    else
        //        return 'null';
        //}
    }

    export class Directory extends DirectoryItem {
        constructor(fileManager: FileManager) { super(fileManager); }

        /** Returns the directory path minus the filename (up to the last name that is followed by a directory separator,). 
         * Since the file API does not support special character such as '.' or '..', these are ignored as directory characters (but not removed).
         * Examples:
         * - "/A/B/C/" => "/A/B/C"
         * - "A/B/C" => "A/B"
         * - "//A/B/C//" => "/A/B/C"
         * - "/" => "/"
         * - "" => ""
         */
        static getDirectoryPath(filepath: string) { // "/" 2:[0:,1:]
            if (!filepath) return "";
            var parts = filepath.replace(/\\/g, '/').split('/'), i1 = 0, i2 = parts.length - 2;
            while (i1 < parts.length && !parts[i1]) i1++;
            while (i2 > i1 && !parts[i2]) i2--;
            return (i1 > 0 ? "/" : "") + parts.slice(i1, i2 + 1).join('/');
        }

        getFile(filePath: string): File {
            var item = this.resolve(filePath);
            if (!(item instanceof File)) return null;
            return item;
        }

        getDirectory(path: string): Directory {
            var item = this.resolve(path);
            if (!(item instanceof Directory)) return null;
            return item;
        }

        createFile(filePath: string): File {

        }

        getJSONStructure() {

        }
    }

    export class File extends DirectoryItem {
        get contents() { return this._contents; }
        set contents(value: string) { this._contents = value; this.touch(); }
        private _contents: string; // (a binary string with the file contents)

        constructor(fileManager: FileManager, content?: string) { super(fileManager); if (content !== void 0) this._contents = content; }

        toBase64() { return Utilities.Encoding.base64Encode(this.contents); }
        fromBase64(contentsB64: string) { this.contents = Utilities.Encoding.base64Decode(contentsB64); }

        saveToLocal() {
            var store = Storage.getStorage(Storage.StorageType.Local);
            store.setItem(this.absolutePath, this.contents);
        }

        loadFromLocal() {
            var store = Storage.getStorage(Storage.StorageType.Local);
            this.contents = store.getItem(this.absolutePath);
        }
    }

    /** Manages files in a virtual file system. This allows project files to be stored locally and synchronized with the server when a connection is available.
     * For off-line storage to work, the browser must support local storage.
     * Note: The 'FlowScript.currentUser' object determines the user-specific root directory for projects.
     */
    export class FileManager {
        // --------------------------------------------------------------------------------------------------------------------

        /** The URL endpoint for the FlowScript project files API. */
        static apiEndpoint = "/api/files";

        /** Just a local property that checks for and returns 'FlowScript.currentUser'. */
        static get currentUser() { if (FlowScript.currentUser) return FlowScript.currentUser; throw "'FlowScript.currentUser' is required!"; } // (added for convenience, and to make sure TS knows it needs to be defined before this class)

        /** The API endpoint to the directory for the current user. */
        static get currentUserEndpoint() { return Utilities.append(this.apiEndpoint, currentUser._id, '/'); }

        /** The root directory represents the API endpoint at 'FileManager.apiEndpoint'. */
        readonly root: Directory;

        // --------------------------------------------------------------------------------------------------------------------

        constructor(
            /** The URL endpoint for the FlowScript project files API. Defaults to 'FileManager.apiEndpoint'. */
            public apiEndpoint = FileManager.apiEndpoint) {
            this.root = new Directory(this);
        }

        /** Creates a directory under the user root endpoint. */
        createDirectory(path: string): Directory {
            var item = this.add(path);
            if (!(item instanceof Directory)) return null;
            return item;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export var restrictedFilenameRegex = /\/\\\?%\*:\|"<>\./g;

    export function isValidFileName(name: string) {
        return name && restrictedFilenameRegex.test(name);
    }

    /** Manages the global file system for FlowScript by utilizing local storage space and remote server space. 
     * The file manager tries to keep recently accessed files local (while backed up to remove), and off-loads
     * less-accessed files to save space.
     */
    export var fileManager: FileManager;


    // ========================================================================================================================
}

// ############################################################################################################################
