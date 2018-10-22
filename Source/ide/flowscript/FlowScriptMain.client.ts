// ############################################################################################################################
namespace FlowScript {
    // ========================================================================================================================

    export namespace Storage {

        export var projectSaveDataSuffix = "-save";

        export function makeProjectDataKeyName(projectName: string, dataTypeName: string, version?: string | number) {
            if (!projectName) throw "A project name is required.";
            if (!dataTypeName) throw "A project data type name is required.";
            if (projectName == delimiter) projectName = ""; // (this is a work-around used to get the prefix part only)
            if (dataTypeName == delimiter) dataTypeName = ""; // (this is a work-around used to get the prefix part only)
            return storagePrefix + projectSaveDataSuffix + delimiter + projectName + (dataTypeName ? delimiter + dataTypeName : "") + (version ? delimiter + version : "");
        }

        /** Saves project data and returns a storage key that can be used to pull the data directly. */
        export function saveProjectData(projectName: string, dataTypeName: string, value: string, version?: string | number): string {
            if (!projectName) throw "A project name is required.";
            if (!dataTypeName) throw "A project data type name is required.";
            var store = getStorage(StorageType.Local);
            var key = makeProjectDataKeyName(projectName, dataTypeName, version);
            store.setItem(key, value);
            return key;
        }

        /** Loads project data. */
        export function loadProjectData(projectName: string, dataTypeName: string, version?: string | number): string {
            if (!projectName) throw "A project name is required.";
            if (!dataTypeName) throw "A project data type name is required.";
            var store = getStorage(StorageType.Local);
            var key = makeProjectDataKeyName(projectName, dataTypeName, version);
            return store.getItem(key);
        }

        export interface ISavedProjectDataInfo { projectName: string; dataName: string; version: string; toString: typeof Object.prototype.toString }

        export function getSavedProjectDataList(): ISavedProjectDataInfo[] {
            var prefix = makeProjectDataKeyName(delimiter, delimiter);
            var list: ISavedProjectDataInfo[] = [];
            var store = getStorage(StorageType.Local);
            var toStrFunc = function () { return this.projectName + (this.dataName ? ", " + this.dataName : "") + (this.version ? ", " + this.version : ""); };
            for (var i = 0, n = store.length; i < n; ++i) {
                var key = store.key(i);
                if (key.substring(0, prefix.length) == prefix) {
                    var parts = key.split(delimiter);
                    if (parts.length > 0) {
                        var _prefix = parts[0];
                        var projectName = parts.length > 1 ? parts[1] : void 0;
                        if (projectName) {
                            var dataName = parts.length > 2 ? parts[2] : void 0;
                            var version = parts.length > 3 ? parts[3] : void 0;
                            list.push({ projectName: projectName, dataName: dataName, version: version, toString: toStrFunc });
                        }
                    }
                }
            }
            return list;
        }
    }

    // ========================================================================================================================
}
