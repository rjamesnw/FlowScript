import {WorkerClient} from "ace/worker/worker_client";

export function createWorker(session: AceAjax.IEditSession) {

    var worker = new WorkerClient(
        // WorkerClient will load `ace`. 
        ["ace"],
        // The worker client is itself located in this file
        "ace/mode/typescript/typescript_worker",
        // And within the file it wants this member as the worker class
        "TypeScriptWorker"
    );

    worker.attachToDocument(session.getDocument());

    worker.on("terminate", function () {
        session.clearAnnotations();
    });
    //? AceAjax.WorkerEvent<any> ????????????
    worker.on("compileErrors", function (msg: AceAjax.WorkerEvent<AceAjax.IAnnotationsExt[]>) {
        session.setAnnotations(msg.data);
        session._emit("compileErrors", <AceAjax.WorkerEvent<AceAjax.IAnnotationsExt[]>>{ data: msg.data });

    });

    worker.on("compiled", function (msg: AceAjax.WorkerEvent<string>) {
        session._emit("compiled", <AceAjax.WorkerEvent<string>>{ data: msg.data });
    });

    return worker;
};
