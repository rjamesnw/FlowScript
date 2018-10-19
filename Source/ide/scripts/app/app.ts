var rootViewContainer = FlowScript.Views.buildViews();

var rootBodyViewContainer = rootViewContainer.getViewContainer("renderBody");


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
    rootBodyViewContainer.createView("NewProjectForm", "/IDE/NewProjectForm").onloaded((view, req, ev) => {
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

    rootBodyViewContainer.createView("ScriptEditor", "/IDE/ScriptEditor").onloaded((view, req, ev) => {
        view.buildViews();
        newProject.setEditor(new FlowScript.UI.ScriptEditor(view));
        newProject.activate(); // (this will shows the view automatically)
    }).onerror((view, request, ev) => { view.contentElement.innerHTML = "Communication error - please try again."; }).send();
}

function openProject() {
    var dataList = FlowScript.Storage.getSavedProjectDataList();
    var i = 1;
    var selection = (alert("Open which project?\r\n" + dataList.select((d) => (i++) + ". " + d.toString() + "\r\n").join("")), prompt("Which one?"));
}

function saveProject() {
    if (!FlowScript.UI.ProjectUI.currentProject)
        alert("No project is currently active.");
    else {
        var key = FlowScript.UI.ProjectUI.currentProject.save();
        alert("Project saved under '" + key + "'.");
    }
}

function newComponent() {
    //if (editorContainer)
    //    editorContainer.innerHTML = "<span id='root'>[click/press here to start]</span>";
}


// ============================================================================================================================
// Bootstrap mobile-menu fix (see: http://stackoverflow.com/questions/21203111/bootstrap-3-collapsed-menu-doesnt-close-on-click).

$(document).on('click', '.navbar-collapse.in', function (e) {

    if ($(e.target).is('a') && ($(e.target).attr('class') != 'dropdown-toggle')) {
        $(this).collapse('hide');
        if (FlowScript.UI.ProjectUI.currentProject)
            FlowScript.UI.ProjectUI.currentProject.scriptEditor.unselectNode();
    }

});

// ============================================================================================================================
// Capture and show uncaught errors.

window.onerror = function (event: any, source?: string, fileno?: number, columnNumber?: number): void {
    var div = document.createElement("DIV");
    div.className = "alert alert-danger";
    div.innerHTML = "<span style='color:#800000'>" + FlowScript.getErrorMessage(event).replace(/\r\n/g, "<br/>") + "</span><br />";
    document.body.insertBefore(div, document.body.firstChild);
};

// ============================================================================================================================
