// ############################################################################################################################

namespace FlowScript {
    // ========================================================================================================================

    /** Represents an enumeration of names and related constant values.
      * Enums can be associated with properties so the developer has to pick from a predefined list of values.
      */
    export class Enum<T> extends NamespaceObject {
        private _counter = 0;

        values: {
            [name: string]: T;
            [index: number]: T;
        } = {};

        properties: {} = <any>this.values;

        // --------------------------------------------------------------------------------------------------------------------
        constructor(parent: NamespaceObject, name: string, values?: {});
        constructor(parent: NamespaceObject, name: string, values?: { [name: string]: T });
        constructor(parent: NamespaceObject, name: string, values?: any) {
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

        /**
         * Creates an expressions that references an enumeration value.
         * @param enumName The enum name.
         * @param parent An optional parent expression.
         */
        createExpression(enumName: string, parent?: Expression): EnumReference {
            return new EnumReference(this, enumName, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export interface ISavedEnumReference extends ISavedExpression { enumuType: string; }

    /** References a component property for use in expressions. */
    export class EnumReference extends Expression {
        // --------------------------------------------------------------------------------------------------------------------

        get script(): IFlowScript { return this._enumRef ? this.enumType.script : null; }

        /** The enum type that is referenced. */
        get enumType() { return this._enumRef.valueOf(); }
        get enumRef() { return this._enumRef; }
        private _enumRef: NamedReference<Enum<any>>;

        /** The enum name to pull a value for. */
        name: string;

        /**
         * Gets the enum value represented by this reference.
         */
        valueOf(): any { var t = this.enumType; return t && t.values[this.name]; }

        // --------------------------------------------------------------------------------------------------------------------

        /**
         * Constructs a reference to an enum type.
         * @param enumType The enum type.
         * @param name The name on the enum to select.
         * @param parent An optional parent expression.
         */
        constructor(enumType: Enum<any>, name: string, parent?: Expression) {
            super(parent);

            if (!enumType || typeof enumType != 'object' || !(enumType instanceof Property))
                throw "A valid property object is required.";

            this._enumRef = enumType.getReference();
            this.name = name;
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected _clone(parent?: Expression): Expression {
            return new EnumReference(this.enumType, this.name, parent);
        }

        // --------------------------------------------------------------------------------------------------------------------

        save(target?: ISavedEnumReference): ISavedEnumReference {
            target = target || <ISavedEnumReference>{};

            target.enumuType = this.enumType ? this.enumType.fullTypeName : void 0;

            super.save(target);
            return target;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString() { return this._enumRef.toString(); }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
