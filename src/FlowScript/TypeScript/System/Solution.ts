namespace FlowScript {
    // ========================================================================================================================

    function _defaultCreateProjectHandler(solution: Solution, project: ISavedProject) {
        return new Project(solution, project.name, project.description);
    };

    export interface ISavedSolution extends ISavedTrackableObject {
        name: string;
        description?: string;
        directory?: string;
        /** If this is a string, then it represents a GUID that references a project instead. */
        projects?: (ISavedProject | string)[];
        //comments: string[];
    }

    /**
    * Holds a collection of projects.
    * When a project instance is created, the default 'Solution.onCreateProject' handler is used, which can be overidden for derived project types.
    */
    export class Solution extends TrackableObject {
        /** The function used to create project instances when a project is created from saved project data.
         * Host programs can hook into this to create and return derived types instead (such as ProjectUI.ts).
         */
        static get onCreateProject() { return this._onCreateProject || _defaultCreateProjectHandler; }
        static set onCreateProject(value) { if (typeof value != 'function') throw "Solution.onCreateProject: Set failed - value is not a function."; this._onCreateProject = value; }
        private static _onCreateProject = _defaultCreateProjectHandler;


        get count() { return this._projects.length; }

        /* All projects for the current user. */
        get projects() { return this._projects; }
        private _projects: Project[] = []; // (the loaded projects that are currently active)

        /* A list of users, by ID, that are allowed . */
        get userIDs() { return this._userIDs; }
        private _userIDs: string[] = []; // (the loaded projects that are currently active)

        //x get unloadedProjects() { return this._unloadedProjects; }
        //x private _unloadedProjects: ISavedProject[] = []; // (the unloaded projects)

        /** The file storage directory for all projects. */
        readonly directory: FileSystem.Directory;

        /** A list of user IDs and assigned roles for this project. */
        readonly userSecurity = new UserAccess();

        constructor() {
            super();
            this.directory = FileSystem.fileManager.createDirectory(this._id);
        }

        /**
         * Creates a new project with the given title and description.
         * @param name The project title.
         * @param description The project description.
         */
        createProject(name: string, description?: string): Project {
            var info: ISavedProject = { name, description };
            var project = Solution.onCreateProject(this, info);
            this._projects.push(project);
            return project;
        }

        /** Compiles a list of all projects, both locally and remotely. */
        async refreshProjects() {
            return new Promise<Solution[]>((ok, err) => {
                var unloadedProjects = this._unloadedProjects;

            });
        }
    }

    // ========================================================================================================================
}