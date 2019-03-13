// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    export interface ISavedEvent extends ISavedComponent { }
   
    // ========================================================================================================================

    /** Represents a single component event.
      * The premise behind components is that they are built assuming normal code flow; however, things do go wrong at times,
      * and when something does go wrong, an event is raised which developers can use to execute a handler block.
      */
    export class FSEvent extends Component {
        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: Component, name: string) {
            super(parent, ComponentTypes.Functional, name, name);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedEvent): ISavedEvent {
            target = target || <ISavedEvent>{};

            super.save(target);

            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
