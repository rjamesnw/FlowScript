define(["require", "exports", "./languageServiceHost"], function (require, exports, languageServiceHost_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // We are running in the worker?
    // Load up ts ourselves
    if (typeof importScripts !== 'undefined') {
        // Path needs to be relative to `ace/worker`
        importScripts('../mode/typescript/typescriptServices.js');
    }
    /**
     * Wraps up `langaugeService` `languageServiceHost` in a single package
     */
    var TsProject = /** @class */ (function () {
        function TsProject() {
            this.languageServiceHost = languageServiceHost_1.createLanguageServiceHost("", "");
            this.languageService = ts.createLanguageService(this.languageServiceHost, ts.createDocumentRegistry());
        }
        return TsProject;
    }());
    exports.TsProject = TsProject;
    var tsProject = null;
    function getTSProject() {
        return tsProject ? tsProject : tsProject = new TsProject();
    }
    exports.getTSProject = getTSProject;
});
//# sourceMappingURL=tsProject.js.map