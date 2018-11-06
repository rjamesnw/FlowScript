define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Clone an object (shallow).
     *
     * @param target the object to clone
     */
    function clone(target) {
        return assign(Array.isArray(target) ? [] : {}, target);
    }
    /**
     * Assign all properties of a list of object to an object.
     *
     * @param target the object that will receive properties.
     * @param items objects which properties will be assigned to a target.
     */
    function assign(target, ...items) {
        return items.reduce(function (target, source) {
            return Object.keys(source).reduce((target, key) => {
                target[key] = source[key];
                return target;
            }, target);
        }, target);
    }
    //--------------------------------------------------------------------------
    //
    //  LanguageServiceHost factory
    //
    //--------------------------------------------------------------------------
    /**
     * LanguageServiceHost factory.
     *
     * @param currentDir the current directory opened in the editor
     * @param defaultLibFileName the absolute file name of the `lib.d.ts` files associated to the language service host instance.
     */
    function createLanguageServiceHost(currentDir, defaultLibFileName) {
        /**
         * CompilationSettings;
         */
        var compilationSettings;
        /**
         * A map associating absolute file name to ScriptInfo.
         */
        var fileNameToScript = Object.create(null);
        /**
         * Add a script to the LanguageServiceHost.
         *
         * @param fileName the absolute path of the file.
         * @param content the file content.
         */
        function addScript(fileName, content) {
            var script = createScriptInfo(content);
            fileNameToScript[fileName] = script;
        }
        /**
         * Remove a script from the LanguageServiceHost.
         *
         * @param fileName the absolute path of the file.
         */
        function removeScript(fileName) {
            delete fileNameToScript[fileName];
        }
        /**
         * Remove all script from the LanguageServiceHost.
         *
         * @param fileName the absolute path of the file.
         */
        function removeAll() {
            fileNameToScript = Object.create(null);
        }
        function hasScript(fileName) {
            return !!fileNameToScript[fileName];
        }
        /**
         * Update a script.
         *
         * @param fileName the absolute path of the file.
         * @param content the new file content.
         */
        function updateScript(fileName, content) {
            var script = fileNameToScript[fileName];
            if (script) {
                if (script.getContent() == content) {
                    return;
                }
                script.updateContent(content);
                return;
            }
            throw new Error('No script with name \'' + fileName + '\'');
        }
        /**
         * Edit a script.
         *
         * @param fileName the absolute path of the file
         * @param minChar the index in the file content where the edition begins.
         * @param limChar the index  in the file content where the edition ends.
         * @param newText the text inserted.
         */
        function editScript(fileName, minChar, limChar, newText) {
            var script = fileNameToScript[fileName];
            if (script) {
                script.editContent(minChar, limChar, newText);
                return;
            }
            throw new Error('No script with name \'' + fileName + '\'');
        }
        /**
         * Set the `isOpen` status of a script.
         *
         * @param fileName the absolute file name.
         * @param isOpen open status.
         */
        function setScriptIsOpen(fileName, isOpen) {
            var script = fileNameToScript[fileName];
            if (script) {
                script.setIsOpen(isOpen);
                return;
            }
            throw new Error('No script with name \'' + fileName + '\'');
        }
        /**
         * Set the language service host compilation settings.
         *
         * @param the settings to be applied to the host
         */
        function setCompilationSettings(settings) {
            compilationSettings = Object.freeze(clone(settings));
        }
        /**
         * Retrieve the content of a given script.
         *
         * @param fileName the absolute path of the file.
         */
        function getScriptContent(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return script.getContent();
            }
            return null;
        }
        /**
         * Return the version of a script for the given file name.
         *
         * @param fileName the absolute path of the file.
         */
        function getScriptVersion(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return '' + script.getVersion();
            }
            return '0';
        }
        /**
         * Return the 'open status' of a script for the given file name.
         *
         * @param fileName the absolute path of the file.
         */
        function getScriptIsOpen(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return script.getIsOpen();
            }
            return false;
        }
        /**
         * Return an IScriptSnapshot instance for the given file name.
         *
         * @param fileName the absolute path of the file.
         */
        function getScriptSnapshot(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return script.getScriptSnapshot();
            }
            return null;
        }
        return {
            //ts.Logger implementation
            log: () => null,
            error: () => null,
            trace: () => null,
            // LanguageServiceHost implementation
            addScript,
            removeScript,
            removeAll,
            updateScript,
            hasScript,
            editScript,
            getScriptContent,
            setCompilationSettings,
            setScriptIsOpen,
            // ts.LanguageServiceHost implementation
            getCompilationSettings: () => compilationSettings,
            getScriptFileNames: () => Object.keys(fileNameToScript),
            getCurrentDirectory: () => currentDir,
            getDefaultLibFileName: () => defaultLibFileName,
            getScriptVersion,
            getScriptIsOpen,
            getScriptSnapshot,
        };
    }
    exports.createLanguageServiceHost = createLanguageServiceHost;
    /**
     * ScriptInfo factory.
     *
     * @param content the content of the file associated to this script.
     */
    function createScriptInfo(content) {
        /**
         * The script current version.
         */
        var scriptVersion = 1;
        /**
         * The script edit history.
         */
        var editRanges = [];
        /**
         * the `isOpen` status of the Script
         */
        var isOpen = false;
        /**
         * An array mapping the start of lines in the script to their position in the file.
         */
        var _lineStarts;
        /**
         * A flag true if `_lineStarts` needs to be recomputed
         */
        var _lineStartIsDirty = true;
        /**
         * Retrieve the script `_lineStarts`, recompute them if needed.
         */
        function getLineStarts() {
            if (_lineStartIsDirty) {
                _lineStarts = ts.computeLineStarts(content);
                _lineStartIsDirty = false;
            }
            return _lineStarts;
        }
        /**
         * Update the script content.
         *
         * @param newContent the new content of the file associated to the script.
         */
        function updateContent(newContent) {
            if (newContent !== content) {
                content = newContent;
                _lineStartIsDirty = true;
                editRanges = [];
                scriptVersion++;
            }
        }
        /**
         * Edit the script content.
         *
         * @param minChar the index in the file content where the edition begins
         * @param limChar the index  in the file content where the edition ends
         * @param newText the text inserted
         */
        function editContent(minChar, limChar, newText) {
            // Apply edits
            var prefix = content.substring(0, minChar);
            var middle = newText;
            var suffix = content.substring(limChar);
            content = prefix + middle + suffix;
            _lineStartIsDirty = true;
            // Store edit range + new length of script
            editRanges.push({
                span: { start: minChar, length: limChar - minChar },
                newLength: newText.length
            });
            // Update version #
            scriptVersion++;
        }
        /**
         * Retrieve the script `_lineStarts`, recompute them if needed.
         */
        function getScriptSnapshot() {
            // save the state of the script
            var lineStarts = getLineStarts();
            var textSnapshot = content;
            var version = scriptVersion;
            var snapshotRanges = editRanges.slice();
            /**
             * Retrieve the edits history between two script snapshot.
             *
             * @param oldSnapshot the old snapshot to compare this one with.
             */
            function getChangeRange(oldSnapshot) {
                var unchanged = { span: { start: 0, length: 0 }, newLength: 0 };
                function collapseChangesAcrossMultipleVersions(changes) {
                    if (changes.length === 0) {
                        return unchanged;
                    }
                    if (changes.length === 1) {
                        return changes[0];
                    }
                    var change0 = changes[0];
                    var oldStartN = change0.span.start;
                    var oldEndN = change0.span.start + change0.span.length;
                    var newEndN = oldStartN + change0.newLength;
                    for (var i = 1; i < changes.length; i++) {
                        var nextChange = changes[i];
                        var oldStart1 = oldStartN;
                        var oldEnd1 = oldEndN;
                        var newEnd1 = newEndN;
                        var oldStart2 = nextChange.span.start;
                        var oldEnd2 = nextChange.span.start + nextChange.span.length;
                        var newEnd2 = oldStart2 + nextChange.newLength;
                        oldStartN = Math.min(oldStart1, oldStart2);
                        oldEndN = Math.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
                        newEndN = Math.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
                    }
                    return { span: { start: oldStartN, length: oldEndN - oldStartN }, newLength: newEndN - oldStartN };
                }
                ;
                var scriptVersion = oldSnapshot.version || 0;
                if (scriptVersion === version) {
                    return unchanged;
                }
                var initialEditRangeIndex = editRanges.length - (version - scriptVersion);
                if (initialEditRangeIndex < 0) {
                    return null;
                }
                var entries = editRanges.slice(initialEditRangeIndex);
                return collapseChangesAcrossMultipleVersions(entries);
            }
            return {
                getText: (start, end) => textSnapshot.substring(start, end),
                getLength: () => textSnapshot.length,
                getChangeRange,
                getLineStartPositions: () => lineStarts,
                version: version
            };
        }
        return {
            getContent: () => content,
            getVersion: () => scriptVersion,
            getIsOpen: () => isOpen,
            setIsOpen: val => isOpen = val,
            getEditRanges: () => editRanges,
            getLineStarts,
            getScriptSnapshot,
            updateContent,
            editContent
        };
    }
});
//# sourceMappingURL=languageServiceHost.js.map