// ############################################################################################################################

/** The namespace for HTML related components. */
module FlowScript.Core.DOM {
    // ========================================================================================================================
    // Core HTML Components
    // ========================================================================================================================

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
    /** Defines the HTML namespace type. */
    export class HTML extends NamespaceObject { // (a type that is inferred by the given arguments)

        /** Represents an HTML node. */
        Node = new Node(this);
        /** Represents a list of DOM nodes. */
        NodeList = new NodeList(this);
        /** Represents a list of DOM nodes indexed by name. */
        NamedNodeMap = new NamedNodeMap(this);
        /** Represents an HTML DOM element. */
        Element = new Element(this);
        /** Represents the HTML root element. */
        HTMLElement = new HTMLElement(this);
        /** Represents an browser window document object. */
        Document = new Document(this);
        /** Enumeration of node types. */
        NodeTypes = new NodeTypes(this);
        /** Enumeration of document positions. */
        DocumentPositions = new NodeTypes(this);

        constructor(parent: NamespaceObject) {
            super(parent, "HTML");
        }

        onInit() {
            super.onInit();
=======
    export class HTMLReaderModes extends Enum<Number> {
        constructor(parent: Type) {
            super(parent, "HTMLReaderModes", {
                /** There's no more to read (end of HTML). */
                End: -1,
                /** Reading hasn't yet started. */
                NotStarted: 0,
                /** A tag was just read. The 'runningText' property holds the text prior to the tag, and the tag name is in 'tagName'. */
                Tag: 1,
                /** An attribute was just read from the last tag. The name will be placed in 'attributeName' and the value (if value) in 'attributeValue'.*/
                Attribute: 2,
                /** An ending tag bracket was just read (no more attributes). */
                EndOfTag: 3,
                /** A template token in the form '{{...}}' was just read. */
                TemplateToken: 4
            });
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts
        }
    }

    // ========================================================================================================================

    export class HTMLReader extends FSObject {
        // --------------------------------------------------------------------------------------------------------------------

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Text, "On", "on $eventName do $block");
        }
=======
        HTMLReaderModes: HTMLReaderModes;
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts

        isMarkupDeclaration: Component;

        CloneTypes = new Enum<boolean>(this, "CloneTypes", { Shallow: false, Deep: true });

        // --------------------------------------------------------------------------------------------------------------------

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
    // ========================================================================================================================
    // Node Components 

    export class Node_removeChild extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Text, "Node_removeChild", "remove child node $oldChild");
        }

        onInit() {
            var sys = this.script.System;
            this.defineParameter("oldChild", [sys.HTML.Node]);
            this.defineDefaultReturnVar(sys.HTML.Node);
            super.onInit();
        }
    }

    export class Node_appendChild extends Component {
        constructor(parent: NamespaceObject) {
            super(parent, ComponentTypes.Text, "Node_appendChild", "append child node $newChild");
        }
=======
        constructor(parent: Type) {
            super(parent, null, "Node");
        }

        onInit() {
            // Setup the expected parameters and return types:
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts

            var sys = this.script.System;

            this.HTMLReaderModes = new HTMLReaderModes(this);

            this.defineInstanceProperty("__splitRegEx", [sys.String],
                /<!(?:--[\S\s]*?--)?[\S\s]*?>|<script\b[\S\s]*?<\/script[\S\s]*?>|<style\b[\S\s]*?<\/style[\S\s]*?>|<\![A-Z0-9]+|<\/[A-Z0-9]+|<[A-Z0-9]+|\/?>|&[A-Z]+;?|&#[0-9]+;?|&#x[A-F0-9]+;?|(?:'[^<>]*?'|"[^<>]*?")|=|\s+|\{\{[^\{\}]*?\}\}/gi.toString(),
                null, true
            ).setDescription("(The RegEx will identify areas that MAY need to delimited for parsing [not a guarantee].  The area outside of the delimiters is usually"
                +" defined by the delimiter types, so the delimiters are moved out into their own array for quick parsing (this also allows the host browser's native"
                +" environment to do much of the parsing instead of JavaScript).");

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
        constructor(parent: NamespaceObject) {
            super(parent, null, "NodeList");
        }
=======
            this.defineInstanceProperty("partIndex", [sys.Integer]);
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts

            this.defineInstanceProperty("textStartIndex", [sys.Integer])
                .setDescription("The start index of the running text.");

            this.defineInstanceProperty("textEndIndex", [sys.Integer])
                .setDescription("The end index of the running text. This is also the start index of the next tag, if any (since text runs between tags)."
                +" (this advances with every read so text can be quickly extracted from the source HTML instead of adding array items [just faster])");

            this.defineInstanceProperty("__lastTextEndIndex", [sys.Integer])
                .setDescription("For backing up from a read ([)see '__readNext()' && '__goBack()').");

            this.defineInstanceProperty("nonDelimiters", [sys.Array.createTemplateType([sys.String])])
                .setDescription("A list of text parts that correspond to each delimiter (i.e. TDTDT [T=Text, D=Delimiter]).");

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
        constructor(parent: NamespaceObject) {
            super(parent, null, "NamedNodeMap");
        }
=======
            this.defineInstanceProperty("delimiters", [sys.Array.createTemplateType([sys.String])])
                .setDescription("A list of the delimiters that correspond to each of the text parts (i.e. TDTDT [T=Text, D=Delimiter]).");
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts

            this.defineInstanceProperty("text", [sys.String]).setDescription("The text that was read.");
            this.defineInstanceProperty("delimiter", [sys.String]).setDescription("The delimiter that was read.");
            this.defineInstanceProperty("runningText", [sys.String]).setDescription("The text that runs between indexes 'textStartIndex' and 'textEndIndex-1' (inclusive).");
            this.defineInstanceProperty("tagBracket", [sys.String]).setDescription("The bracket sequence before the tag name, such as '<' or '</'. */.");
            this.defineInstanceProperty("tagName", [sys.String]).setDescription("The tag name, if a tag was read.");
            this.defineInstanceProperty("attributeName", [sys.String]).setDescription("The attribute name, if attribute was read.");
            this.defineInstanceProperty("attributeValue", [sys.String]).setDescription("The attribute value, if attribute was read.");
            var readMode = this.defineInstanceProperty("readMode", [this.HTMLReaderModes]).setDescription("The attribute value, if attribute was read.");
            this.defineInstanceProperty("strictMode", [sys.Boolean]).setDescription([
                "If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).",
                "This can greatly help identify possible areas of page errors."]);
            

            this.isMarkupDeclaration = new ComponentBuilder(this, ComponentTypes.Expression, "isMarkupDeclaration", "$reader is markup declaration?")
                .defineInstanceType(this).defineParameter("$reader", [this]).defineReturn(null, sys.Boolean)
                .addStatement(sys.Comparison.Equals, [readMode.createExpression(), this.HTMLReaderModes.createExpression("Tag")]).Component
                .setDescription("Returns true if tag current tag block is a mark-up declaration in the form \"<!...>\", where '...' is any text EXCEPT the start of a comment ('--').");

            //this.isSupported = new ComponentBuilder(this, ComponentTypes.Expression, "isSupported", "$feature and $version are supported?")
            //    .defineInstanceType(this).defineParameter("feature", [sys.String]).defineParameter("version", [sys.String]).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.isSupported($feature, $version)"]).Component;

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
    export class NodeTypes extends Enum<Number> {
        constructor(parent: NamespaceObject) {
            super(parent, "NodeTypes", {
                ELEMENT_NODE: 1,
                ATTRIBUTE_NODE: 2,
                TEXT_NODE: 3,
                CDATA_SECTION_NODE: 4,
                ENTITY_REFERENCE_NODE: 5,
                ENTITY_NODE: 6,
                PROCESSING_INSTRUCTION_NODE: 7,
                COMMENT_NODE: 8,
                DOCUMENT_NODE: 9,
                DOCUMENT_TYPE_NODE: 10,
                DOCUMENT_FRAGMENT_NODE: 11,
                NOTATION_NODE: 12
            });
        }
    }

    export class DocumentPositions extends Enum<Number> {
        constructor(parent: NamespaceObject) {
            super(parent, "DocumentPositions", {
                DISCONNECTED: 1,
                PRECEDING: 2,
                FOLLOWING: 4,
                CONTAINS: 8,
                CONTAINED_BY: 16,
                IMPLEMENTATION_SPECIFIC: 32
            });
        }
    }
=======
            //this.isEqualNode = new ComponentBuilder(this, ComponentTypes.Expression, "isEqualNode", "$node is equal?")
            //    .defineInstanceType(this).defineParameter("node", [sys.HTML.Node]).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.isEqualNode($node)"]).Component;

            //this.lookupPrefix = new ComponentBuilder(this, ComponentTypes.Expression, "lookupPrefix", "lookup prefix $namespaceURI")
            //    .defineInstanceType(this).defineParameter("namespaceURI", [sys.String]).defineReturn(null, sys.String)
            //    .addStatement(sys.Code, ["$this.lookupPrefix($namespaceURI)"]).Component;
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts

            //this.isDefaultNamespace = new ComponentBuilder(this, ComponentTypes.Expression, "isDefaultNamespace", "$prefix is the default?")
            //    .defineInstanceType(this).defineParameter("prefix", [sys.String]).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.isDefaultNamespace($prefix)"]).Component;

            //this.compareDocumentPosition = new ComponentBuilder(this, ComponentTypes.Expression, "compareDocumentPosition", "compare position of $node")
            //    .defineInstanceType(this).defineParameter("node", [sys.HTML.Node]).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.compareDocumentPosition($node)"]).Component;

            //this.normalize = new ComponentBuilder(this, ComponentTypes.Expression, "normalize")
            //    .defineInstanceType(this).addStatement(sys.Code, ["$this.normalize()"]).Component;

            //this.isSameNode = new ComponentBuilder(this, ComponentTypes.Expression, "isSameNode", "$node is the same?")
            //    .defineInstanceType(this).defineParameter("node", [sys.HTML.Node]).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.isSameNode($node)"]).Component;

            //this.hasAttributes = new ComponentBuilder(this, ComponentTypes.Expression, "hasAttributes", "attributes exist?")
            //    .defineInstanceType(this).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.hasAttributes()"]).Component;

<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts
        constructor(parent: NamespaceObject) {
            super(parent, null, "Node");
        }
=======
            //this.lookupNamespaceURI = new ComponentBuilder(this, ComponentTypes.Expression, "lookupNamespaceURI", "lookup namespace URI by $prefix")
            //    .defineInstanceType(this).defineParameter("prefix", [sys.String]).defineReturn(null, sys.String)
            //    .addStatement(sys.Code, ["$this.lookupNamespaceURI($prefix)"]).Component;
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts

            //this.cloneNode = new ComponentBuilder(this, ComponentTypes.Expression, "cloneNode", "$cloneType clone this node")
            //    .defineInstanceType(this).defineEnumProperty("cloneType", this.CloneTypes, true).defineReturn(null, sys.HTML.Node)
            //    .addStatement(sys.Code, ["$this.cloneNode($prefix)"]).Component;

            //this.hasChildNodes = new ComponentBuilder(this, ComponentTypes.Expression, "hasChildNodes", "child nodes exist?")
            //    .defineInstanceType(this).defineReturn(null, sys.Boolean)
            //    .addStatement(sys.Code, ["$this.hasChildNodes()"]).Component;

            //this.replaceChild = new ComponentBuilder(this, ComponentTypes.Expression, "replaceChild", "replace $oldChild with $newChild")
            //    .defineInstanceType(this).defineParameter("oldChild", [sys.HTML.Node]).defineParameter("newChild", [sys.HTML.Node]).defineReturn(null, sys.HTML.Node)
            //    .addStatement(sys.Code, ["$this.replaceChild($newChild, $oldChild)"]).Component;

            //this.insertBefore = new ComponentBuilder(this, ComponentTypes.Expression, "insertBefore", "insert $newNode before $?existingChild")
            //    .defineInstanceType(this).defineParameter("newNode", [sys.HTML.Node]).defineParameter("existingChild", [sys.HTML.Node]).defineReturn(null, sys.HTML.Node)
            //    .addStatement(sys.Code, ["$this.insertBefore($newChild, $oldChild)"]).Component;

            /*
                /removeChild(oldChild: Node): Node;
                /appendChild(newChild: Node): Node;
                /isSupported(feature: string, version: string): boolean;
                /isEqualNode(arg: Node): boolean;
                /lookupPrefix(namespaceURI: string): string;
                /isDefaultNamespace(namespaceURI: string): boolean;
                /compareDocumentPosition(other: Node): number;
                /normalize(): void ;
                /isSameNode(other: Node): boolean;
                /hasAttributes(): boolean;
                /lookupNamespaceURI(prefix: string): string;
                /cloneNode(deep?: boolean): Node;
                /hasChildNodes(): boolean;
                /replaceChild(newChild: Node, oldChild: Node): Node;
                /insertBefore(newChild: Node, refChild?: Node): Node;
            */

            this.defineInstanceProperty("ELEMENT_NODE", [sys.Integer], 1);
            this.defineInstanceProperty("ATTRIBUTE_NODE", [sys.Integer], 2);
            this.defineInstanceProperty("TEXT_NODE", [sys.Integer], 3);
            this.defineInstanceProperty("CDATA_SECTION_NODE", [sys.Integer], 4);
            this.defineInstanceProperty("ENTITY_REFERENCE_NODE", [sys.Integer], 5);
            this.defineInstanceProperty("ENTITY_NODE", [sys.Integer], 6);
            this.defineInstanceProperty("PROCESSING_INSTRUCTION_NODE", [sys.Integer], 7);
            this.defineInstanceProperty("COMMENT_NODE", [sys.Integer], 8);
            this.defineInstanceProperty("DOCUMENT_NODE", [sys.Integer], 9);
            this.defineInstanceProperty("DOCUMENT_TYPE_NODE", [sys.Integer], 10);
            this.defineInstanceProperty("DOCUMENT_FRAGMENT_NODE", [sys.Integer], 11);
            this.defineInstanceProperty("NOTATION_NODE", [sys.Integer], 12);

            this.defineInstanceProperty("DOCUMENT_POSITION_DISCONNECTED", [sys.Integer], 1);
            this.defineInstanceProperty("DOCUMENT_POSITION_PRECEDING", [sys.Integer], 2);
            this.defineInstanceProperty("DOCUMENT_POSITION_FOLLOWING", [sys.Integer], 4);
            this.defineInstanceProperty("DOCUMENT_POSITION_CONTAINS", [sys.Integer], 8);
            this.defineInstanceProperty("DOCUMENT_POSITION_CONTAINED_BY", [sys.Integer], 16);
            this.defineInstanceProperty("DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", [sys.Integer], 32);

            this.defineDefaultReturnVar(sys.String);

            super.onInit();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
<<<<<<< HEAD:src/FlowScript/TypeScript/System/components/Core.DOM.ts

    export class Element extends FSObject {
        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: NamespaceObject) {
            super(parent, parent.script.System.HTML.Node, "Element");
        }

        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineInstanceProperty("name", [sys.String]);
            this.defineInstanceProperty("id", [sys.String]);

            this.defineDefaultReturnVar(sys.String);

            super.onInit();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export class HTMLElement extends FSObject {
        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: NamespaceObject) {
            super(parent, parent.script.System.HTML.Element, "HTMLElement");
        }

        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineDefaultReturnVar(sys.String);

            super.onInit();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    export class Document extends FSObject {
        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: NamespaceObject) {
            super(parent, parent.script.System.HTML.Element, "Document");
        }

        onInit() {
            // Setup the expected parameters and return types:

            var sys = this.script.System;

            this.defineDefaultReturnVar(sys.String);

            super.onInit();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
=======
>>>>>>> 20a79577a5a7963be48507c6c36717d4172d9e7c:Source/ide/flowscript/components/Core.HTML.ts
}

// ############################################################################################################################
