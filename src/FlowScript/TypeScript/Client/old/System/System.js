var FlowScript;
(function (FlowScript) {
    ({
        "System": {
            tip: "The root namespace.",
            types: {
                "Any": { tip: "A type that matches all other types." },
                "Property": { tip: "Represents a property type reference." },
                "CodeBlock": { tip: "Represents a block of script, usually representing code to execute when a condition or event occurs." },
                "FunctionalComponent": { tip: "Represents a callable component." },
                "Event": { tip: "Represents an asynchronous callback event that can be triggered at a future time.\r\nNote: It is possible for events to be synchronous in certain cases, but they should be treated as though they are not." },
                "Boolean": { title: "Boolean($?value)", componentType: FlowScript.ComponentTypes.Unary, returnType: "Boolean", tip: "Represents a boolean (true/false) type." },
                "String": { title: "String($?value)", componentType: FlowScript.ComponentTypes.Unary, returnType: "String", tip: "Represents a string of characters." },
                /*
                <component name="Double" title="Double($?value)" componentType="Unary" returnType="Double" tip="Represents a 64-bit floating point number.">
                </component>
                <component name="Currency" title="Currency($?value)" componentType="Unary" returnType="Currency" tip="Represents currency using higher precision that a double type.">
                </component>
                <component name="Integer" title="Integer($?value)" componentType="Unary" returnType="Integer" tip="Represents a whole number.">
                </component>
                <component name="DateTime" title="DateTime($?value)" componentType="Unary" returnType="DateTime" tip="Represents the date and time in the form of a double value.">
                  <parameter name="value" types="DateTime,Double,Integer,String" />
                </component>
                <component name="Object" title="Object($?value)" componentType="Object" returnType="Object" tip="Represents a regular expression object.">
                </component>
                <component name="Array" title="Array($?value)" componentType="Unary" returnType="Array" tip="Represents a one dimensional array object.">
                </component>
                <component name="RegEx" title="RegEx($?value)" componentType="Unary" returnType="RegEx" tip="Represents a regular expression object.">
                </component>
              
                <component name="Assign" title="$a = $b" componentType="Assignment" returnType="*" tip="Assign a parameter, local variable, or return target with the value of a given expression.">
                  <parameter name="a" types="Property" isAlias="true" tip="Set a property that will received the value of 'b'." />
                  <parameter name="b" types="Any" tip="The value to assign to 'a'.  Though this is 'any' type, the type must be assignable to 'a' at compile time." />
                </component>
              
                <component name="Accessor" title="$a.$b" componentType="Operation" returnType="*" tip="Used to access properties of an object.">
                  <parameter name="a" types="Object" isAlias="true" tip="An object type reference." />
                  <parameter name="b" types="String" tip="A property name on the specified object." />
                </component>
              
                <component name="With" title="with $a do $b" componentType="CodeBlock" returnType="*"
                           tip="Execute a block of lines within the context of a given object.\r\nEach statement in the block is checked if the object is a direct parent object, and if so, invokes the call using the object as the $quot;this$quot; context.">
                  <parameter name="a" types="Object" isAlias="true" />
                  <parameter name="b" types="CodeBlock" />
                </component>
              
                <component name="WithCall" title="with $a call $b" componentType="Operation" returnType="*"
                           tip="Execute a functional component call using the context of a given object.  The call is invoked using the object as the $quot;this$quot; context.">
                  <parameter name="a" types="Object" isAlias="true" />
                  <parameter name="b" types="FunctionalComponent" />
                </component>
              
                <component name="PreIncrement" title="++$n" componentType="Operation" isUnary="true" returnType="*">
                  <parameter name="n" types="Double,Integer" isAlias="true" />
                </component>
              
                <component name="PostIncrement" title="$n++" componentType="Operation" isUnary="true" returnType="*">
                  <parameter name="n" types="Double,Integer" isAlias="true" />
                </component>
              
                <component name="PreDecrement" title="--$n" componentType="Operation" isUnary="true" returnType="*">
                  <parameter name="n" types="Double,Integer" isAlias="true" />
                </component>
              
                <component name="PostDecrement" title="$n--" componentType="Operation" isUnary="true" returnType="*">
                  <parameter name="n" types="Double,Integer" isAlias="true" />
                </component>
              
                <component name="Code" title="$code" componentType="Operation" isUnary="true" returnType="*"
                           tip="Represents a custom block of JavaScript code.\r\nNote: JavaScript code must exist, even if just an empty string, otherwise the simulator will fail when this component is reached.">
                  <parameter name="code" types="String" />
                </component>
              
                <type name="Binary" tip="The binary namespace contains binary related component types.">
              
                  <component name="Not" title="not $a" componentType="Operation" isUnary="true" returnType="Boolean">
                    <parameter name="a" types="Boolean,Integer" />
                  </component>
              
                  <component name="XOR" title="xor $a" componentType="Operation" isUnary="true" returnType="Integer">
                    <parameter name="a" types="Boolean,Integer" />
                  </component>
              
                  <component name="ShiftLeft" title="$value &lt;&lt; $count" componentType="Operation" isUnary="true" returnType="Integer">
                    <parameter name="value" types="Boolean,Integer" />
                    <parameter name="count" types="Boolean,Integer" />
                  </component>
              
                  <component name="ShiftRight" title="$value &gt;&gt; $count" componentType="Operation" isUnary="true" returnType="Integer">
                    <parameter name="value" types="Boolean,Integer" />
                    <parameter name="count" types="Boolean,Integer" />
                  </component>
              
                </type>
              
                <type name="Comparison" tip="Contains components for comparing values.">
              
                  <component name="Equals" title="$a == $b" componentType="Operation" returnType="Boolean" tip="Tests if one value equals another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="StrictEquals" title="$a === $b" componentType="Operation" returnType="Boolean" tip="Tests if one value AND its type equals another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="NotEquals" title="$a != $b" componentType="Operation" returnType="Boolean" tip="Tests if one value does NOT equal another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="StrictNotEquals" title="$a !== $b" componentType="Operation" returnType="Boolean" tip="Tests if one value AND its type do NOT equal another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="LessThan" title="$a &lt; $b" componentType="Operation" returnType="Boolean" tip="Tests if one value is less than another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="GreaterThan" title="$a &gt; $b" componentType="Operation" returnType="Boolean" tip="Tests if one value is greater than another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="LessThanOrEqual" title="$a &gt;= $b" componentType="Operation" returnType="Boolean" tip="Tests if one value is less than or equal to another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                  <component name="GreaterThanOrEqual" title="$a &gt;= $b" componentType="Operation" returnType="Boolean" tip="Tests if one value is greater than or equal to another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                  </component>
              
                </type>
              
                <type name="Math" tip="Contains statements for comparing values.">
              
                  <component name="Add" title="$a + $b" componentType="Operation" returnType="*" tip="Tests if one value is greater than or equal to another.">
                    <parameter name="a" types="All" />
                    <parameter name="b" types="All" />
                    <typeMap types="Boolean, Boolean" result="Integer" />
                    <typeMap types="Boolean, Currency" result="Currency" />
                    <typeMap types="Boolean, DateTime" result="DateTime" />
                    <typeMap types="Boolean, Double" result="Double" />
                    <typeMap types="Boolean, Integer" result="Integer" />
                    <typeMap types="Currency, Boolean" result="Currency" />
                    <typeMap types="Currency, Currency" result="Currency" />
                    <typeMap types="Currency, Double" result="Currency" />
                    <typeMap types="Currency, Integer" result="Currency" />
                    <typeMap types="DateTime, Boolean" result="DateTime" />
                    <typeMap types="DateTime, DateTime" result="DateTime" />
                    <typeMap types="DateTime, Double" result="DateTime" />
                    <typeMap types="DateTime, Integer" result="DateTime" />
                    <typeMap types="Double, Boolean" result="Integer" />
                    <typeMap types="Double, Currency" result="Currency" />
                    <typeMap types="Double, DateTime" result="DateTime" />
                    <typeMap types="Double, Double" result="Double" />
                    <typeMap types="Double, Integer" result="Double" />
                    <typeMap types="Integer, Boolean" result="Integer" />
                    <typeMap types="Integer, Currency" result="Currency" />
                    <typeMap types="Integer, DateTime" result="DateTime" />
                    <typeMap types="Integer, Double" result="Double" />
                    <typeMap types="Integer, Integer" result="Integer" />
                    <typeMap types="String, All" result="String" />
                    <typeMap types="All, String" result="String" />
                    <typeMap types="Any, All" result="Any" />
                    <typeMap types="All, Any" result="Any" />
                  </component>
              
                  <component name="Multiply" title="$a * $b" componentType="Operation" returnType="*" tip="Multiple two numerical values.">
                    <parameter name="a" types="Double, Integer" />
                    <parameter name="b" types="Double, Integer" />
                    <typeMap types="Double, Double" result="Double" />
                    <typeMap types="Double, Integer" result="Double" />
                    <typeMap types="Integer, Double" result="Double" />
                    <typeMap types="Integer, Integer" result="Integer" />
                  </component>
              
                  <component name="SQRT" title="√$a" componentType="Operation" returnType="Double" tip="Gets the square root of a value.">
                    <parameter name="a" types="Double, Integer" />
                  </component>
                </type>
              
                <type name="ControlFlow" tip="Contains statements for controlling script execution flow.">
                  <component name="If" title="if $condition then $block" componentType="ControlFlow" tip="Executes a block of script based if a given conditioon is true (false = 0 = null = &quot;&quot;, and anyything else is true).">
                    <parameter name="condition" types="Boolean" />
                    <parameter name="block" types="CodeBlock" />
                  </component>
                  <component name="IfElse" title="if $condition then $block1 else $block2" componentType="ControlFlow" tip="Executes a block of script based if a given conditioon is true (false = 0 = null = &quot;&quot;, and anyything else is true).">
                    <parameter name="condition" types="Boolean" />
                    <parameter name="block1" types="CodeBlock" />
                    <parameter name="block2" types="CodeBlock" />
                  </component>
                  <component name="While" title="while $condition do $block" componentType="ControlFlow" tip="Executes a block of script while a given conditioon is true (false = 0 = null = &quot;&quot;, and anyything else is true).">
                    <parameter name="condition" types="Boolean" />
                    <parameter name="block" types="CodeBlock" />
                  </component>
                  <component name="DoWhile" title="do $block while $condition" componentType="ControlFlow" tip="Executes a block of script while a given conditioon is true (false = 0 = null = &quot;&quot;, and anyything else is true).">
                    <parameter name="condition" types="Boolean" />
                    <parameter name="block" types="CodeBlock" />
                  </component>
                  <component name="Loop" title="with $init while $condition loop $block and repeat with $update" componentType="ControlFlow"
                             tip="Loops a given block of script while a given conditioon is true (false = 0 = null = &quot;&quot;, and anything else is true).">
                    <parameter name="init" types="CodeBlock" />
                    <parameter name="condition" types="Boolean" />
                    <parameter name="block" types="CodeBlock" />
                    <parameter name="update" types="CodeBlock" />
                  </component>
                </type>
              
                <type name="Net" tip="Contains components for rendering HTML.">
                  <component name="LoadFromURL" title="Load from url: $url, using method: $method" componentType="Functional">
                    <parameter name="url" types="String" validation="^(\w+:\/\/)?((?:\w*):(?:\w*)@)?((?:\w+)(?:\.\w+)*)?((?:\/[-_a-zA-Z0-9.~!$&amp;'()*+,;=:@%]+)*\/?)?(\?\w+=.*)?(#.*)?$" />
                  </component>
                </type>
                */
                "HTML": {
                    tip: "Contains components for rendering HTML.",
                    types: {
                        "Node": {}
                    }
                },
            }
        }
    });
})(FlowScript || (FlowScript = {}));
//# sourceMappingURL=System.js.map