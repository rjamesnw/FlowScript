// ############################################################################################################################
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FlowScript;
(function (FlowScript) {
    // ========================================================================================================================
    // ========================================================================================================================
    /** Represents a single component event.
      * The premise behind components is that they are built assuming normal code flow; however, things do go wrong at times,
      * and when something does go wrong, an event is raised which developers can use to execute a handler block.
      */
    var FSEvent = /** @class */ (function (_super) {
        __extends(FSEvent, _super);
        // --------------------------------------------------------------------------------------------------------------------
        function FSEvent(parent, name) {
            return _super.call(this, parent, FlowScript.ComponentTypes.Functional, name, name) || this;
        }
        // --------------------------------------------------------------------------------------------------------------------
        FSEvent.prototype.save = function (target) {
            target = target || {};
            _super.prototype.save.call(this, target);
            return target;
        };
        return FSEvent;
    }(FlowScript.Component));
    FlowScript.FSEvent = FSEvent;
    // ========================================================================================================================
})(FlowScript || (FlowScript = {}));
// ############################################################################################################################
//# sourceMappingURL=Event.js.map