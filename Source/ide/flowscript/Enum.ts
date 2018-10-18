// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    /** Represents an enumeration of names and related constant values.
      * Enums can be associated with properties so the developer has to pick from a predefined list of values.
      */
    export class Enum<T> extends Type {
        private _counter = 0;

        values: {
            [name: string]: T;
            [index: number]: T;
        } = {};

        properties: {} = <any>this.values;

        // --------------------------------------------------------------------------------------------------------------------
        constructor(parent: Type, name: string, values?: {});
        constructor(parent: Type, name: string, values?: { [name: string]: T });
        constructor(parent: Type, name: string, values?: any) {
            super(parent, name);
            values && this.addValue(values);
        }

        // --------------------------------------------------------------------------------------------------------------------

        setValue(name: string, value: T): Enum<T> {
            if (value === void 0) value = <any>this._counter++;
            if (name in this.values)
                throw "Enum error: Cannot add duplicate name '" + name + "'.";
            this.values[name] = value;
            // ... try to reference the name by value as well ...
            var valIndex: string = typeof value == 'string' ? <string><any>value : '' + value;
            if (valIndex != name) { // (don't overwrite the "name=value" entry!)
                if (valIndex in this.values)
                    throw "Enum error: Name conflict - cannot add reverse lookup for '" + name + "'='" + value + "'.";
                this.values[valIndex] = <any>name;
            }
            return this;
        }

        addValue(values?: { [name: string]: T }): Enum<T> {
            if (values && typeof values == 'object')
                for (var p in values)
                    if (Object.prototype.hasOwnProperty.call(values, p))
                        this.values[p] = values[p];
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
