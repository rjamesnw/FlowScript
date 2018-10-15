//declare var require: any;
//declare var $: any;


declare namespace AceAjax {
    interface IAnnotationsExt extends Annotation {
        minChar: number,
        limChar: number,
        raw: string
    }

    interface HashHandler {
        attach: () => void;
        detach: () => void;
    }
}

// Depends on ace
declare module "ace/ace" {
    export = ace;
}

declare module "ace/range" {
    var _: { Range: typeof AceAjax.Range };
    export = _;
}

declare module "ace/lib/lang" {
    var lang: AceAjax.Lang;
    export = lang;
}

declare module "ace/keyboard/hash_handler" {
    var _: { HashHandler: typeof AceAjax.HashHandler }; // add type here also?
    export = _;
}

declare module "ace/lib/event_emitter" {
    var _: { EventEmitter: AceAjax.EventEmitter };
    export = _;
}

declare module "ace/lib/oop" {
    var oop: AceAjax.OOP;
    export = oop;
}

declare module "ace/worker/mirror" {
    var _: { Mirror: typeof AceAjax.Mirror };
    export = _;
}

declare module "ace/document" {
    var _: { Document: typeof AceAjax.Document };
    export = _;
}

declare module "ace/worker/worker_client" {
    var _: {
        UIWorkerClient: typeof AceAjax.UIWorkerClient;
        WorkerClient: typeof AceAjax.WorkerClient;
    };
    export = _;
}

declare module "ace/mode/typescript/typescriptServices" {
    var _: typeof ts;
    export = _;
}

// hopefully we wouldn't need this eventually. 
// But the files in the worker are really stingy about relative paths and we are forced to use full paths
//declare var define:any;
