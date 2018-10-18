/** this is called when the user selects to view the forum. */
function loadForum() {
    rootBodyViewContainer.createView("Forum", "/IDE/Forum").onloaded(function (view, req, ev) {
        view.buildViews(); // (search and parse views, if any)
        view.show();
    }).onerror(function (view, request, ev) { view.contentElement.innerHTML = "Communication error - please try again."; }).send();
}
//# sourceMappingURL=app_forum.js.map