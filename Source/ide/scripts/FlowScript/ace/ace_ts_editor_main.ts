import ace = require('ace/ace');
import {Range as AceRange} from 'ace/range';
import {AutoComplete} from './AutoComplete';
import lang = require("ace/lib/lang");
import {EditorPosition} from './EditorPosition';
import {CompletionService} from './CompletionService';
import {deferredCall} from "ace/lib/lang";

//function javascriptRun(js: string) {
//    var external = window.open();
//    var script = external.window.document.createElement("script");
//    script.textContent = js;
//    external.window.document.body.appendChild(script);
//}

function readFile(path: string, cb: (data: any, textStatus: string, jqXHR: JQueryXHR) => any) {
    $.ajax({
        type: "GET",
        url: path,
        success: cb,
        error: ((jqXHR, textStatus) => console.log(textStatus))
    });
}

export function defaultFormatCodeOptions(): ts.FormatCodeOptions {
    return {
        IndentSize: 4,
        TabSize: 4,
        NewLineCharacter: "\n",
        ConvertTabsToSpaces: true,
        IndentStyle: ts.IndentStyle && ts.IndentStyle.Smart,

        InsertSpaceAfterCommaDelimiter: true,
        InsertSpaceAfterSemicolonInForStatements: true,
        InsertSpaceBeforeAndAfterBinaryOperators: true,
        InsertSpaceAfterKeywordsInControlFlowStatements: true,
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        PlaceOpenBraceOnNewLineForFunctions: false,
        PlaceOpenBraceOnNewLineForControlBlocks: false,
    };
}

var aceEditorPosition: EditorPosition = null;
var editor: AceAjax.Editor = null;
var outputEditor: AceAjax.Editor = null;
var docUpdateCount = 0;

var selectFileName = "";

var syncStop = false; //for stop sync on loadfile
var autoComplete: AutoComplete = null;
var refMarkers: number[] = [];
var errorMarkers: number[] = [];

// Start updating latest
import {getTSProject} from "../../ace/mode/typescript/tsProject";
var tsProject = getTSProject();

export function loadLibFiles(libFiles: string[]) {

    //var libFiles = ["typescripts/lib.d.ts"];
    //Shermie Added: concat ts declaration files for generate autocomplete list
    //libFiles = libFiles || ["Scripts/FlowScript/ace/environments/lib.d.ts"]; // ["Scripts/FlowScript/ace/environments/serverlib.d.ts"]; 

    // Load files here 
    libFiles.forEach(function (libfilename: string) {
        readFile(libfilename, function (content: string) {
            tsProject.languageServiceHost.addScript(libfilename, content); //? ('libfilename' should be the absolute path)
        });
    });

    // Load files in the worker
    workerOnCreate(function () {//TODO use worker init event
        libFiles.forEach(function (libfilename: string) {
            readFile(libfilename, function (content: string) {
                var params = <AceAjax.WorkerEvent<any>>{
                    data: {
                        name: libfilename, //? ('libfilename' should be the absolute path)
                        content: content
                    }
                };
                editor.getSession().$worker.emit("addLibrary", params);
            });
        });
    }, 100);
}

export function loadFile(filename: string) {
    readFile(filename, function (content: string) {
        selectFileName = filename;
        syncStop = true;
        var data = content.replace(/\r\n?/g, "\n");
        setCode(data);
        // ... the data will display in the editor, but notify the TS service for the worker compilation service o fthe new file)
        tsProject.languageServiceHost.addScript(filename, editor.getSession().getDocument().getValue());
        syncStop = false;
    });
}

function startAutoComplete(editor: AceAjax.Editor) {
    if (autoComplete.isActive() == false) {
        autoComplete.setScriptName(selectFileName);
        autoComplete.active();
    }
}

function onUpdateDocument(e: AceAjax.EditorChangeEvent) {
    if (selectFileName) {
        if (!syncStop) {
            syncTypeScriptServiceContent(selectFileName, e);
            updateMarker(e);
        }
    }
}

// TODO check column
function updateMarker(data: AceAjax.EditorChangeEvent) {
    var action = data.action;
    var action = data.action;
    var start = aceEditorPosition.getPositionChars(data.start);
    var end = aceEditorPosition.getPositionChars(data.end);
    var newText = editor.getSession().getTextRange(new AceRange(data.start.row, data.start.column, data.end.row, data.end.column));

    var markers = editor.getSession().getMarkers(true);
    var line_count = 0;
    var isNewLine = editor.getSession().getDocument().isNewLine;

    if (action == "insert") {
        if (isNewLine(newText)) {
            line_count = 1;
        }
    } else if (action == "remove") {
        if (isNewLine(newText)) {
            line_count = -1;
        }
    }

    if (line_count != 0) {

        var markerUpdate = function (id: number) {
            var marker = markers[id];
            var row = data.start.row;

            if (line_count > 0) {
                row = +1;
            }

            if (marker && marker.range.start.row > row) {
                marker.range.start.row += line_count;
                marker.range.end.row += line_count;
            }
        };

        errorMarkers.forEach(markerUpdate);
        refMarkers.forEach(markerUpdate);
        (<any>editor).onChangeFrontMarker();
    }

}

//sync LanguageService content and ace editor content
function syncTypeScriptServiceContent(script: string, data: AceAjax.EditorChangeEvent) {

    var action = data.action;
    var start = aceEditorPosition.getPositionChars(data.start);
    var end = aceEditorPosition.getPositionChars(data.end);
    var newText = editor.getSession().getTextRange(new AceRange(data.start.row, data.start.column, data.end.row, data.end.column));
    if (action == "insert") {
        editLanguageService(script, start, start, newText);
    } else if (action == "remove") {
        editLanguageService(script, start, end, "");
    }
    else {
        console.error('unknown action:', action)
    }
};


function editLanguageService(name: string, minChar: number, limChar: number, newText: string) {
    tsProject.languageServiceHost.editScript(name, minChar, limChar, newText);
}

function onChangeCursor(e: AceAjax.EditorChangeEvent) {
    if (!syncStop) {
        try {
            deferredShowOccurrences.schedule(200);
        } catch (ex) {
            //TODO
        }
    }
};

function languageServiceIndent() {
    var cursor = editor.getCursorPosition();
    var lineNumber = cursor.row;

    var text = editor.session.getLine(lineNumber);
    var matches = text.match(/^[\t ]*/);
    var preIndent = 0;
    var wordLen = 0;

    if (matches) {
        wordLen = matches[0].length;
        for (var i = 0; i < matches[0].length; i++) {
            var elm = matches[0].charAt(i);
            var spaceLen = (elm == " ") ? 1 : editor.session.getTabSize();
            preIndent += spaceLen;
        };
    }

    var smartIndent = tsProject.languageService.getIndentationAtPosition(selectFileName, lineNumber, defaultFormatCodeOptions());

    if (preIndent > smartIndent) {
        editor.indent();
    } else {
        var indent = smartIndent - preIndent;

        if (indent > 0) {
            editor.getSelection().moveCursorLineStart();
            editor.commands.exec("inserttext", editor, { text: " ", times: indent });
        }

        if (cursor.column > wordLen) {
            cursor.column += indent;
        } else {
            cursor.column = indent + wordLen;
        }

        editor.getSelection().moveCursorToPosition(cursor);
    }
}

function refactor() {
    var references = tsProject.languageService.getOccurrencesAtPosition(selectFileName, aceEditorPosition.getCurrentCharPosition());

    references.forEach(function (ref) {
        var getpos = aceEditorPosition.getAcePositionFromChars;
        var start = getpos(ref.textSpan.start);
        var end = getpos(ref.textSpan.start + ref.textSpan.length);
        var range = new AceRange(start.row, start.column, end.row, end.column);
        editor.selection.addRange(range);
    });
}

function showOccurrences() {
    var session = editor.getSession();
    refMarkers.forEach(function (id: number) {
        session.removeMarker(id);
    });

    let references = tsProject.languageService.getOccurrencesAtPosition(selectFileName, aceEditorPosition.getCurrentCharPosition());
    if (!references) {
        // none found. This is a valid response
        return;
    }
    references.forEach(function (ref) {
        //TODO check script name
        // console.log(ref.unitIndex);
        var getpos = aceEditorPosition.getAcePositionFromChars;
        var start = getpos(ref.textSpan.start);
        var end = getpos(ref.textSpan.start + ref.textSpan.length);
        var range = new AceRange(start.row, start.column, end.row, end.column);
        refMarkers.push(session.addMarker(range, "typescript-ref", "text", true));
    });
}

var deferredShowOccurrences = deferredCall(showOccurrences);

/** Keeps running the func till worker is present */
function workerOnCreate(func: { (worker: any): void }, timeout: number) {
    if (editor.getSession().$worker) {
        func(editor.getSession().$worker);
    } else {
        setTimeout(function () {
            workerOnCreate(func, timeout);
        });
    }
}

export function setCode(text: string): void {
    editor.setValue(text);
    editor.moveCursorTo(0, 0);
}

export function setOutput(text: string): void {
    if (outputEditor) {
        outputEditor.setOptions({ readOnly: false }); // (can't change the editor content unless 'readOnly' is first cleared)
        outputEditor.getSession().getDocument().setValue(text);
        outputEditor.setOptions({ readOnly: true });
    }
}

export function getCode(): string {
    return editor.getValue();
}

export function getOutput(): string {
    //outputEditor.getSession().getDocument().getValue();
    return outputEditor.getValue();
}

export function initialize(editorID = "editor", outputID = "output") {
    editor = ace.edit(editorID);
    editor.$blockScrolling = Infinity; // (to disable an "obsolete" message about auto scrolling cursor into view when selection changes)
    editor.setTheme("./theme/tomorrow");
    editor.getSession().setMode('./mode/typescript');
    document.getElementById(editorID).style.fontSize = '14px';

    var outputElement = document.getElementById(outputID);
    if (outputElement) {
        outputEditor = ace.edit(outputID);
        outputEditor.setTheme("./theme/tomorrow");
        outputEditor.getSession().setMode('./mode/javascript');
        outputEditor.setOptions({
            readOnly: true // (disable editing the TS JS output, as it is auto rendered)
            //highlightActiveLine: false,
            //highlightGutterLine: false
        });
        outputElement.style.fontSize = '14px';
    }

    editor.addEventListener("change", onUpdateDocument);
    editor.addEventListener("changeSelection", onChangeCursor);

    editor.commands.addCommands([{
        name: "autoComplete",
        bindKey: "Ctrl-Space",
        exec: function (editor: AceAjax.Editor) {
            startAutoComplete(editor);
        }
    }]);

    editor.commands.addCommands([{
        name: "refactor",
        bindKey: "F2",
        exec: function (editor: AceAjax.Editor) {
            refactor();
        }
    }]);

    editor.commands.addCommands([{
        name: "indent",
        bindKey: "Tab",
        exec: function (editor: AceAjax.Editor) {
            languageServiceIndent();
        },
        multiSelectAction: "forEach"
    }]);

    aceEditorPosition = new EditorPosition(editor);
    autoComplete = new AutoComplete(editor, selectFileName, new CompletionService(editor));

    // override editor onTextInput
    var originalTextInput = editor.onTextInput;
    editor.onTextInput = function (text) {
        originalTextInput.call(editor, text);
        //if(text == "."){
        //    editor.execCommand("autoComplete");

        //}else 
        //Shermie Modified
        if (editor.getSession().getDocument().isNewLine(text)) {
            var lineNumber = editor.getCursorPosition().row;
            var indent = tsProject.languageService.getIndentationAtPosition(selectFileName, lineNumber, defaultFormatCodeOptions());
            if (indent > 0) {
                editor.commands.exec("inserttext", editor, { text: " ", times: indent });
            }
        }
        else if (text != " " && text != "" && text.match(/[^-!$%^&*_+|~=`){}\[\]:";'<>?\/]/)) { // != ";" && text != "=") {
            editor.execCommand("autoComplete");
        }
    };

    editor.addEventListener("mousedown", function (e: AceAjax.EditorChangeEvent) {
        if (autoComplete.isActive()) {
            autoComplete.deactivate();
        }
    });

    editor.getSession().on("compiled", function (e: AceAjax.WorkerEvent<string>) {
        setOutput(e.data);
    });

    editor.getSession().on("compileErrors", function (e: AceAjax.WorkerEvent<AceAjax.IAnnotationsExt[]>) {
        var session = editor.getSession();
        errorMarkers.forEach(function (id: number) {
            session.removeMarker(id);
        });
        e.data.forEach(function (error) {
            var getpos = aceEditorPosition.getAcePositionFromChars;
            var start = getpos(error.minChar);
            var end = getpos(error.limChar);
            var range = new AceRange(start.row, start.column, end.row, end.column);
            errorMarkers.push(session.addMarker(range, "typescript-error", "text", true));
        });
    });

    //$("#javascript-run").click(function (e: AceAjax.WorkerEvent<any>) {
    //    javascriptRun(outputEditor.getSession().doc.getValue());
    //});

    //$("#select-sample").change(function (e: AceAjax.WorkerEvent<any>) {
    //    var path = "samples/" + $(this).val();
    //    loadFile(path);
    //});

};
