﻿namespace FlowScript.Components {
  export var System: IType = {
    "name": "System",
    "types": [
      {
        "name": "Any",
        "tip": "A type that matches all other types."
      },
      {
        "name": "Property",
        "tip": "Represents a property type reference."
      },
      {
        "name": "CodeBlock",
        "tip": "Represents a block of script, usually representing code to execute when a condition or event occurs."
      },
      {
        "name": "FunctionalComponent",
        "tip": "Represents a callable component."
      },
      {
        "name": "Event",
        "tip": "Represents an asynchronous callback event that can be triggered at a future time.\\r\\nNote: It is possible for events to be synchronous in certain cases, but they should be treated as though they are not."
      },
      {
        "name": "Binary",
        "tip": "The binary namespace contains binary related component types.",
        "components": [
          {
            "name": "Not",
            "title": "not $a",
            "type": "Operation",
            "isUnary": "true",
            "returnType": "Boolean",
            "parameters": [{
              "name": "a",
              "types": "Boolean,Integer"
            }]
          },
          {
            "name": "XOR",
            "title": "xor $a",
            "type": "Operation",
            "isUnary": "true",
            "returnType": "Integer",
            "parameters": [{
              "name": "a",
              "types": "Boolean,Integer"
            }]
          },
          {
            "name": "ShiftLeft",
            "title": "$value << $count",
            "type": "Operation",
            "isUnary": "true",
            "returnType": "Integer",
            "parameters": [
              {
                "name": "value",
                "types": "Boolean,Integer"
              },
              {
                "name": "count",
                "types": "Boolean,Integer"
              }
            ]
          },
          {
            "name": "ShiftRight",
            "title": "$value >> $count",
            "type": "Operation",
            "isUnary": "true",
            "returnType": "Integer",
            "parameters": [
              {
                "name": "value",
                "types": "Boolean,Integer"
              },
              {
                "name": "count",
                "types": "Boolean,Integer"
              }
            ]
          }
        ]
      },
      {
        "name": "Comparison",
        "tip": "Contains components for comparing values.",
        "components": [
          {
            "name": "Equals",
            "title": "$a == $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value equals another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "StrictEquals",
            "title": "$a === $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value AND its type equals another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "NotEquals",
            "title": "$a != $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value does NOT equal another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "StrictNotEquals",
            "title": "$a !== $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value AND its type do NOT equal another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "LessThan",
            "title": "$a < $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value is less than another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "GreaterThan",
            "title": "$a > $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value is greater than another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "LessThanOrEqual",
            "title": "$a >= $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value is less than or equal to another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          },
          {
            "name": "GreaterThanOrEqual",
            "title": "$a >= $b",
            "type": "Operation",
            "returnType": "Boolean",
            "tip": "Tests if one value is greater than or equal to another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ]
          }
        ]
      },
      {
        "name": "Math",
        "tip": "Contains statements for comparing values.",
        "components": [
          {
            "name": "Add",
            "title": "$a + $b",
            "type": "Operation",
            "returnType": "*",
            "tip": "Adds one value to another.",
            "parameters": [
              {
                "name": "a",
                "types": "All"
              },
              {
                "name": "b",
                "types": "All"
              }
            ],
            "typeMaps": [
              {
                "types": "Boolean, Boolean",
                "result": "Integer"
              },
              {
                "types": "Boolean, Currency",
                "result": "Currency"
              },
              {
                "types": "Boolean, DateTime",
                "result": "DateTime"
              },
              {
                "types": "Boolean, Double",
                "result": "Double"
              },
              {
                "types": "Boolean, Integer",
                "result": "Integer"
              },
              {
                "types": "Currency, Boolean",
                "result": "Currency"
              },
              {
                "types": "Currency, Currency",
                "result": "Currency"
              },
              {
                "types": "Currency, Double",
                "result": "Currency"
              },
              {
                "types": "Currency, Integer",
                "result": "Currency"
              },
              {
                "types": "DateTime, Boolean",
                "result": "DateTime"
              },
              {
                "types": "DateTime, DateTime",
                "result": "DateTime"
              },
              {
                "types": "DateTime, Double",
                "result": "DateTime"
              },
              {
                "types": "DateTime, Integer",
                "result": "DateTime"
              },
              {
                "types": "Double, Boolean",
                "result": "Integer"
              },
              {
                "types": "Double, Currency",
                "result": "Currency"
              },
              {
                "types": "Double, DateTime",
                "result": "DateTime"
              },
              {
                "types": "Double, Double",
                "result": "Double"
              },
              {
                "types": "Double, Integer",
                "result": "Double"
              },
              {
                "types": "Integer, Boolean",
                "result": "Integer"
              },
              {
                "types": "Integer, Currency",
                "result": "Currency"
              },
              {
                "types": "Integer, DateTime",
                "result": "DateTime"
              },
              {
                "types": "Integer, Double",
                "result": "Double"
              },
              {
                "types": "Integer, Integer",
                "result": "Integer"
              },
              {
                "types": "String, All",
                "result": "String"
              },
              {
                "types": "All, String",
                "result": "String"
              },
              {
                "types": "Any, All",
                "result": "Any"
              },
              {
                "types": "All, Any",
                "result": "Any"
              }
            ]
          },
          {
            "name": "Multiply",
            "title": "$a * $b",
            "type": "Operation",
            "returnType": "*",
            "tip": "Multiple two numerical values.",
            "parameters": [
              {
                "name": "a",
                "types": "Double, Integer"
              },
              {
                "name": "b",
                "types": "Double, Integer"
              }
            ],
            "typeMaps": [
              {
                "types": "Double, Double",
                "result": "Double"
              },
              {
                "types": "Double, Integer",
                "result": "Double"
              },
              {
                "types": "Integer, Double",
                "result": "Double"
              },
              {
                "types": "Integer, Integer",
                "result": "Integer"
              }
            ]
          },
          {
            "name": "SQRT",
            "title": "√$a",
            "type": "Operation",
            "returnType": "Double",
            "tip": "Gets the square root of a value.",
            "parameters": [{
              "name": "a",
              "types": "Double, Integer"
            }]
          }
        ]
      },
      {
        "name": "ControlFlow",
        "tip": "Contains statements for controlling script execution flow.",
        "components": [
          {
            "name": "If",
            "title": "if $condition then $block",
            "type": "ControlFlow",
            "tip": "Executes a block of script based if a given conditioon is true (false = 0 = null = \"\", and anyything else is true).",
            "parameters": [
              {
                "name": "condition",
                "types": "Boolean"
              },
              {
                "name": "block",
                "types": "CodeBlock"
              }
            ]
          },
          {
            "name": "IfElse",
            "title": "if $condition then $block1 else $block2",
            "type": "ControlFlow",
            "tip": "Executes a block of script based if a given conditioon is true (false = 0 = null = \"\", and anyything else is true).",
            "parameters": [
              {
                "name": "condition",
                "types": "Boolean"
              },
              {
                "name": "block1",
                "types": "CodeBlock"
              },
              {
                "name": "block2",
                "types": "CodeBlock"
              }
            ]
          },
          {
            "name": "While",
            "title": "while $condition do $block",
            "type": "ControlFlow",
            "tip": "Executes a block of script while a given conditioon is true (false = 0 = null = \"\", and anyything else is true).",
            "parameters": [
              {
                "name": "condition",
                "types": "Boolean"
              },
              {
                "name": "block",
                "types": "CodeBlock"
              }
            ]
          },
          {
            "name": "DoWhile",
            "title": "do $block while $condition",
            "type": "ControlFlow",
            "tip": "Executes a block of script while a given conditioon is true (false = 0 = null = \"\", and anyything else is true).",
            "parameters": [
              {
                "name": "condition",
                "types": "Boolean"
              },
              {
                "name": "block",
                "types": "CodeBlock"
              }
            ]
          },
          {
            "name": "Loop",
            "title": "with $init while $condition loop $block and repeat with $update",
            "type": "ControlFlow",
            "tip": "Loops a given block of script while a given conditioon is true (false = 0 = null = \"\", and anything else is true).",
            "parameters": [
              {
                "name": "init",
                "types": "CodeBlock"
              },
              {
                "name": "condition",
                "types": "Boolean"
              },
              {
                "name": "block",
                "types": "CodeBlock"
              },
              {
                "name": "update",
                "types": "CodeBlock"
              }
            ]
          }
        ]
      },
      {
        "name": "Net",
        "tip": "Contains components for rendering HTML.",
        "component": {
          "name": "LoadFromURL",
          "title": "Load from url: $url, using method: $method",
          "type": "Functional",
          "parameters": [{
            "name": "url",
            "types": "String",
            "validation": "^(\\w+:\\/\\/)?((?:\\w*):(?:\\w*)@)?((?:\\w+)(?:\\.\\w+)*)?((?:\\/[-_a-zA-Z0-9.~!$&'()*+,;=:@%]+)*\\/?)?(\\?\\w+=.*)?(#.*)?$"
          }]
        }
      },
      {
        "name": "HTML",
        "tip": "Contains components for rendering HTML."
      }
    ],
    "components": [
      {
        "name": "Boolean",
        "title": "Boolean($?value)",
        "type": "Unary",
        "returnType": "Boolean",
        "tip": "Represents a boolean (true/false) type."
      },
      {
        "name": "String",
        "title": "String($?value)",
        "type": "Unary",
        "returnType": "String",
        "tip": "Represents a string of characters."
      },
      {
        "name": "Double",
        "title": "Double($?value)",
        "type": "Unary",
        "returnType": "Double",
        "tip": "Represents a 64-bit floating point number."
      },
      {
        "name": "Currency",
        "title": "Currency($?value)",
        "type": "Unary",
        "returnType": "Currency",
        "tip": "Represents currency using higher precision that a double type."
      },
      {
        "name": "Integer",
        "title": "Integer($?value)",
        "type": "Unary",
        "returnType": "Integer",
        "tip": "Represents a whole number."
      },
      {
        "name": "DateTime",
        "title": "DateTime($?value)",
        "type": "Unary",
        "returnType": "DateTime",
        "tip": "Represents the date and time in the form of a double value.",
        "parameters": [{
          "name": "value",
          "types": "DateTime,Double,Integer,String"
        }]
      },
      {
        "name": "Object",
        "title": "Object($?value)",
        "type": "Object",
        "returnType": "Object",
        "tip": "Represents a regular expression object."
      },
      {
        "name": "Array",
        "title": "Array($?value)",
        "type": "Unary",
        "returnType": "Array",
        "tip": "Represents a one dimensional array object."
      },
      {
        "name": "RegEx",
        "title": "RegEx($?value)",
        "type": "Unary",
        "returnType": "RegEx",
        "tip": "Represents a regular expression object."
      },
      {
        "name": "Assign",
        "title": "$a = $b",
        "type": "Assignment",
        "returnType": "*",
        "tip": "Assign a parameter, local variable, or return target with the value of a given expression.",
        "parameters": [
          {
            "name": "a",
            "types": "Property",
            "isAlias": "true",
            "tip": "Set a property that will received the value of 'b'."
          },
          {
            "name": "b",
            "types": "Any",
            "tip": "The value to assign to 'a'.  Though this is 'any' type, the type must be assignable to 'a' at compile time."
          }
        ]
      },
      {
        "name": "Accessor",
        "title": "$a.$b",
        "type": "Operation",
        "returnType": "*",
        "tip": "Used to access properties of an object.",
        "parameters": [
          {
            "name": "a",
            "types": "Object",
            "isAlias": "true",
            "tip": "An object type reference."
          },
          {
            "name": "b",
            "types": "String",
            "tip": "A property name on the specified object."
          }
        ]
      },
      {
        "name": "With",
        "title": "with $a do $b",
        "type": "CodeBlock",
        "returnType": "*",
        "tip": "Execute a block of lines within the context of a given object.\\r\\nEach statement in the block is checked if the object is a direct parent object, and if so, invokes the call using the object as the $quot;this$quot; context.",
        "parameters": [
          {
            "name": "a",
            "types": "Object",
            "isAlias": "true"
          },
          {
            "name": "b",
            "types": "CodeBlock"
          }
        ]
      },
      {
        "name": "WithCall",
        "title": "with $a call $b",
        "type": "Operation",
        "returnType": "*",
        "tip": "Execute a functional component call using the context of a given object.  The call is invoked using the object as the $quot;this$quot; context.",
        "parameters": [
          {
            "name": "a",
            "types": "Object",
            "isAlias": "true"
          },
          {
            "name": "b",
            "types": "FunctionalComponent"
          }
        ]
      },
      {
        "name": "PreIncrement",
        "title": "++$n",
        "type": "Operation",
        "isUnary": "true",
        "returnType": "*",
        "parameters": [{
          "name": "n",
          "types": "Double,Integer",
          "isAlias": "true"
        }]
      },
      {
        "name": "PostIncrement",
        "title": "$n++",
        "type": "Operation",
        "isUnary": "true",
        "returnType": "*",
        "parameters": [{
          "name": "n",
          "types": "Double,Integer",
          "isAlias": "true"
        }]
      },
      {
        "name": "PreDecrement",
        "title": "--$n",
        "type": "Operation",
        "isUnary": "true",
        "returnType": "*",
        "parameters": [{
          "name": "n",
          "types": "Double,Integer",
          "isAlias": "true"
        }]
      },
      {
        "name": "PostDecrement",
        "title": "$n--",
        "type": "Operation",
        "isUnary": "true",
        "returnType": "*",
        "parameters": [{
          "name": "n",
          "types": "Double,Integer",
          "isAlias": "true"
        }]
      },
      {
        "name": "Code",
        "title": "$code",
        "type": "Operation",
        "isUnary": "true",
        "returnType": "*",
        "tip": "Represents a custom block of JavaScript code.\\r\\nNote: JavaScript code must exist, even if just an empty string, otherwise the simulator will fail when this component is reached.",
        "parameters": [{
          "name": "code",
          "types": "String"
        }]
      }
    ]
  }
}