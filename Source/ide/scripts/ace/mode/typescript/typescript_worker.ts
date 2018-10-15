/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import {DocumentPositionUtil} from "./DocumentPositionUtil";
import oop = require("ace/lib/oop");
import {Mirror} from "ace/worker/mirror";
import lang = require("ace/lib/lang");
import {Document} from "ace/document";

// The worker copy of the project
import {getTSProject} from "./tsProject";
var tsProject = getTSProject();

function setupInheritanceCall(sender: AceAjax.Sender) {
    this.sender = sender;

    var doc = this.doc = new Document("");

    var deferredUpdate = this.deferredUpdate = lang.deferredCall(this.onUpdate.bind(this));

    var _self = this;

    sender.on("change", function (e) {
        var data: (AceAjax.Delta | string[] | string)[] = e.data;
        if ((<any>data[0]).start) {
            // (array of 'AceAjax.Delta' objects)
            doc.applyDeltas(<AceAjax.Delta[]>data);
        } else {
            // (array of strings or string arrays)
            for (var i = 0; i < data.length; i += 2) {
                var d: AceAjax.Delta;
                if (Array.isArray(data[i + 1])) {
                    d = { action: "insert", start: <AceAjax.Delta>data[i], lines: <string[]>data[i + 1] };
                } else {
                    d = { action: "remove", start: <AceAjax.Delta>data[i], end: <AceAjax.Delta>data[i + 1] };
                }
                doc.applyDelta(d, true);
            }
        }
        if (_self.$timeout)
            return deferredUpdate.schedule(_self.$timeout);
        _self.onUpdate();
    });

    sender.on("addLibrary", function (e) {
        _self.addlibrary(e.data.name, e.data.content);
    });

    this.setOptions();

    sender.emit("initAfter");
};

export class TypeScriptWorker {

    deferredUpdate: any; // from mirror
    doc: any; // from mirror
    constructor(public sender: AceAjax.Sender) {
        // Code from `mirror.js` TODO: find a better way 
        setupInheritanceCall.call(this, sender);
    }

    options: any;
    setOptions = (options: {}) => {
        this.options = options || {
        };
    };

    changeOptions = (newOptions: {}) => {
        oop.mixin(this.options, newOptions);
        this.deferredUpdate.schedule(100);
    };

    addlibrary = (filename: string, content: string) => {
        tsProject.languageServiceHost.addScript(filename, content);
    };

    getCompletionsAtPosition = (fileName: string, pos: number, isMemberCompletion: boolean, id: string) => {
        var ret = tsProject.languageService.getCompletionsAtPosition(fileName, pos);
        this.sender.callback(ret, id);
    };

    onUpdate = () => {
        // TODO: get the name of the actual file
        var fileName = "temp.ts";

        if (tsProject.languageServiceHost.hasScript(fileName)) {
            tsProject.languageServiceHost.updateScript(fileName, this.doc.getValue());
        }
        else {
            tsProject.languageServiceHost.addScript(fileName, this.doc.getValue());
        }

        var services = tsProject.languageService;
        var output = services.getEmitOutput(fileName);
        var jsOutput = output.outputFiles.map(o => o.text).join('\n');

        var allDiagnostics: ts.Diagnostic[] = services.getCompilerOptionsDiagnostics()
            .concat(services.getSyntacticDiagnostics(fileName))
            .concat(services.getSemanticDiagnostics(fileName));

        this.sender.emit("compiled", jsOutput);

        var annotations: AceAjax.IAnnotationsExt[] = [];

        allDiagnostics.forEach((error) => {
            let message = ts.flattenDiagnosticMessageText(error.messageText, "\n");
            var pos = DocumentPositionUtil.getPosition(this.doc, error.start);
            annotations.push({
                row: pos.row,
                column: pos.column,
                text: message,
                minChar: error.start,
                limChar: error.start + error.length,
                type: "error",
                raw: message
            });
        });

        this.sender.emit("compileErrors", annotations);
    };

}

// Complete the inheritance
oop.inherits(TypeScriptWorker, Mirror);


(function () {
    var proto = this;

    ["getTypeAtPosition", "getSignatureAtPosition", "getDefinitionAtPosition"]
        .forEach(function (item: string) {
            proto[item] = function (fileName: string, pos: number, id: string) {
                var ret = (<{ [index: string]: (fileName: string, position: number) => ts.DefinitionInfo[] }><{}>tsProject.languageService)[item](fileName, pos);
                this.sender.callback(ret, id);
            };
        });

    ["getReferencesAtPosition", "getOccurrencesAtPosition", "getImplementorsAtPosition"]
        .forEach(function (item: string) {
            proto[item] = function (fileName: string, pos: number, id: string) {
                var referenceEntries = (<{ [index: string]: (fileName: string, position: number) => ts.ReferenceEntry[] }><{}>tsProject.languageService)[item](fileName, pos);
                var ret = referenceEntries.map(function (ref: any) {
                    return {
                        unitIndex: ref.unitIndex,
                        minChar: ref.ast.minChar,
                        limChar: ref.ast.limChar
                    };
                });
                this.sender.callback(ret, id);
            };
        });

    ["getNavigateToItems", "getScriptLexicalStructure", "getOutliningRegions "]
        .forEach(function (item: string) {
            proto[item] = function (value: any, id: string) {
                var navs = (<{ [index: string]: (searchValue: string, maxResultCount?: number) => ts.NavigateToItem[] }><{}>tsProject.languageService)[item](value);
                this.sender.callback(navs, id);
            };
        });

}).call(TypeScriptWorker.prototype);
