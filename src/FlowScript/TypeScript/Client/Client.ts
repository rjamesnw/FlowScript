namespace FlowScript {

    /** The currently active editor that the user has focused. */
    export var activeEditor: monaco.editor.IStandaloneCodeEditor;

    /** All editor instances created on the page by ID. */
    export var editors: { [index: string]: monaco.editor.IStandaloneCodeEditor } = {};

    export class FlowScriptClient extends FlowScriptBase {
    }
}

var rootViewContainer = FlowScript.Views.buildViews();
var rootBodyViewContainer = rootViewContainer.getViewContainer("renderBody");
var projects = new FlowScript.Projects();
var rootPath = "/";
var rootViewsPath = rootPath + "views";

function setInput(id: string, newValue = "") {
    if (id) {
        var el = <HTMLInputElement>document.getElementById(id);
        if (el) el.value = (newValue === void 0 || newValue === null ? "" : newValue);
    }
}

function getInput(id: string): string {
    if (id) {
        var el = <HTMLInputElement>document.getElementById(id);
        if (el)
            return el.value;
        else
            return null; // (not found)
    }
    else return null; // (no id)
}

function newProject() {
    rootBodyViewContainer.createView("NewProjectForm", rootViewsPath + "/NewProjectForm.html").onloaded((view, req, ev) => {
        view.buildViews();
        view.show();
        setInput("projTitle");
        setInput("projDesc");
    }).onerror((view, request, ev) => { view.contentElement.innerHTML = "Communication error - please try again."; }).send();
}

function createProject() {
    var projectTitle = getInput("projTitle");
    var projectDesc = getInput("projDesc");

    if (!projectTitle) {
        alert("A project title is required.");
        return;
    }

    var newProject = projects.createProject(projectTitle, projectDesc, FlowScript.UI.ProjectUI);

    if (FlowScript.debugging)
        FlowScript.Tests.populateProject(newProject);

    rootBodyViewContainer.createView("ScriptEditor", rootViewsPath + "/ScriptEditor.html").onloaded((view, req, ev) => {
        view.buildViews();
        newProject.setEditor(new FlowScript.UI.ScriptEditor(view));
        newProject.activate(); // (this will shows the view automatically)
    }).onerror((view, request, ev) => { view.contentElement.innerHTML = "Communication error - please try again."; }).send();
}

function openProject() {
    var dataList = FlowScript.Storage.getSavedProjectDataList();
    var i = 1;
    var selection = (alert("Open which project?\r\n" + dataList.select((d) => (i++) + ". " + d.toString() + "\r\n").join("")), prompt("Which one?"));
    alert("You selected " + selection);
}

function saveProject() {
    if (!FlowScript.UI.ProjectUI.currentProject)
        alert("No project is currently active.");
    else {
        FlowScript.UI.ProjectUI.currentProject.saveToStorage();
        alert("Project saved.");
    }
}

function newComponent() {
    //if (editorContainer)
    //    editorContainer.innerHTML = "<span id='root'>[click/press here to start]</span>";
}


// ============================================================================================================================
// Bootstrap mobile-menu fix (see: https://stackoverflow.com/a/46123072/1236397).

$(".navbar-nav li a:not('.dropdown-toggle')").on('click', function () {
    $('.navbar-collapse').collapse('hide');
    if (FlowScript.UI.ProjectUI.currentProject)
        FlowScript.UI.ProjectUI.currentProject.scriptEditor.unselectNode();
});

// ============================================================================================================================
// Capture and show uncaught errors.

window.onerror = function (event: any, source?: string, row?: number, col?: number): void {
    var div = document.createElement("DIV");
    div.className = "alert alert-danger";
    if (typeof event != "object") event = { message: event };
    event.source = source;
    event.lineNumber = row;
    event.columnNumber = col;
    div.innerHTML = "<span style='color:#800000'>" + FlowScript.getErrorMessage(event).replace(/\r\n/g, "<br/>") + "</span><br />";
    document.body.insertBefore(div, document.body.firstChild);
};

window.onload = function () {
    var btnStart = document.getElementById("btnStart");
    btnStart && (btnStart.onclick = () => { location.href = "editor.html"; });
};

// ============================================================================================================================
