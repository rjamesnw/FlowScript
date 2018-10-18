define(["require", "exports", "ace/worker/worker_client"], function (require, exports, worker_client_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createWorker(session) {
        var worker = new worker_client_1.WorkerClient(
        // WorkerClient will load `ace`. 
        ["ace"], 
        // The worker client is itself located in this file
        "ace/mode/typescript/typescript_worker", 
        // And within the file it wants this member as the worker class
        "TypeScriptWorker");
        worker.attachToDocument(session.getDocument());
        worker.on("terminate", function () {
            session.clearAnnotations();
        });
        //? AceAjax.WorkerEvent<any> ????????????
        worker.on("compileErrors", function (msg) {
            session.setAnnotations(msg.data);
            session._emit("compileErrors", { data: msg.data });
        });
        worker.on("compiled", function (msg) {
            session._emit("compiled", { data: msg.data });
        });
        return worker;
    }
    exports.createWorker = createWorker;
    ;
});
//# sourceMappingURL=typescript_create_worker.js.map