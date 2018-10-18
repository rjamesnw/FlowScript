// ############################################################################################################################
// Data Tables

namespace FlowScript {
    // ========================================================================================================================

    export enum ColumnAccessLevels {
        /** The column can be read from, and written to. */
        ReadWrite,
        /** The column cannot be updated. */
        ReadOnly,
        /** The column is treated as if it doesn't exist. */
        Hidden
    }

    export class Column {
        get name(): string { return this._name; }
        private _name: string;

        get type(): Type { return this._type; }
        private _type: Type;

        get accessLevel(): ColumnAccessLevels { return this._accessLevel; }
        private _accessLevel: ColumnAccessLevels = ColumnAccessLevels.ReadWrite;
    }

    export class Row {
        [index: number]: any;
    }

    /** Represents a structure of data, much like a class.
      * Tables exist to replace the concept of class instances in many other languages.  In most cases, programmers create
      * methods/functions to operate on either a data structure (object with properties), or data returned from a database.
      * To mimic classes, a table with one row is created, where the columns are the properties.  As well, columns can be
      * flagged as readonly, 
      */
    export class Table extends Type {
        // --------------------------------------------------------------------------------------------------------------------

        private _super: Table; // (the "super class" table to this table - allows for inheritance)

        private _columns: Column[] = [];
        private _rows: Row[] = [];

        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: Type, tableName: string) {
            super(parent, tableName);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
