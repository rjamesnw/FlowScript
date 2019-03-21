// ############################################################################################################################
// Data Tables

namespace FlowScript.FileSystem {
    // ========================================================================================================================

    export enum SyncStatus {
        /** File exits in local storage. */
        Local,
        /** Uploading file or directory to the remote endpoint. */
        Uploading,
        /** Upload error; file is still local. */
        UploadError,
        /** File exists on the remote endpoint. */
        Remote
    }

    export class DirectoryItem {
        private _fileManager: FileManager;

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
        exists(nameOrItem: any, ignore?: DirectoryItem): boolean {
            if (nameOrItem === void 0 || nameOrItem === null || !this._childItems) return false;
            var paramType = typeof nameOrItem;
            if (paramType === 'object' && nameOrItem instanceof DirectoryItem) {
                var item = this._childItems[(<DirectoryItem>nameOrItem)._name];
                return !!item && item != ignore;
            }
            var t = this.resolve(nameOrItem);
            return !!t && t != ignore;
        }

        /** Resolves a namespace path under this item.  You can provide a nested path if desired.
          * For example, if the current item is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          * If not found, then null is returned.
          * @param {function} requiredItem A required item reference that the returned item must be an instance of.
          */
        resolve<T extends { new(...args: any[]): any }>(itemPath: string, requiredItem?: T): DirectoryItem {
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
            return requiredItem ? (t instanceof requiredItem ? t : null) : t;
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

        remove<T extends DirectoryItem>(item: T): T;
        /** removes a item under this item.  You can provide a nested item path if desired.
          * For example, if the current item is 'A.B' within the 'A.B.C.D' namespace, then you could pass in 'C.D'.
          */
        remove(name: string): DirectoryItem;
        remove(itemOrName: any): DirectoryItem {
            if (itemOrName === void 0 || itemOrName === null)
                throw "Cannot remove an empty name/path from directory '" + this.absolutePath + "'.";

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
    }

    export class Directory extends DirectoryItem {
        constructor(fileManager: FileManager) { super(fileManager); }

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
    }

    export class File extends DirectoryItem {
        constructor(fileManager: FileManager) { super(fileManager); }
    }

    /** Manages files in a virtual file system. This allows project files to be stored locally and synchronized with the server when a connection is available.
     * For off-line storage to work, the browser must support local storage.
     */
    export class FileManager {
        // --------------------------------------------------------------------------------------------------------------------

        /** The URL endpoint for the FlowScript project files API. */
        static apiEndpoint = "/api/Files";

        /** The root directory represents the API endpoint at 'FileManager.apiEndpoint'. */
        readonly root: Directory;

        // --------------------------------------------------------------------------------------------------------------------

        constructor() {
            this.root = new Directory(this);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
