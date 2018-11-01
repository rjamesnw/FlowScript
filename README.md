# FlowScript #

FlowScript is a visual programming language (VPL) used for build client and server applications using a browser. It is built using TypeScript and NodeJS. FlowScript started under the name CircuitScript around 2010, but was later renamed to FlowScript in 2014 within a private repo during the prototype phase.  It is now being release in alpha (still a WIP) on GitHub as of Oct 30, 2018.

### Version ###

* Version: Alpha
* [FlowScript Site](https://flowscript.org) *(Not live; WIP)*

### How do I get set up? ###

* Visual Studio Code is used as the IDE, and TypeScript as the "language" platform.
* To setup a new VS Code environment you can run `install_extensions.cmd`.
* Dependencies for development: NodeJS, NPM, nodemon (`install -g install nodemon`)
* Don't forget to run `npm install` from the command line within the workspace path to restore the required node modules.
* Database configuration: MySQL v(TBD)+
* How to run tests: At the moment, simple tests are being run by loading the path at `Source\ide\scripts\tests\simple\index.html` in the browser. Since the `ide` folder is the web root, the page can be loaded at `http://localhost:8080/scripts/tests/simple`.
* Deployment instructions: You run the NodeJS server project (the config called `Launch Server`) to serve the project's site and handle server side flow scripts. A simple browser is all that is needed to run the website on the client side (`http://localhost:8080/`).

### Contribution guidelines ###

* Writing tests: 
* Code review: I will review all pull requests.
* Other guidelines: 
    1. All code must be documented using JSDoc comments.  That means all class, functions, properties, etc.  The code within the function bodies should have blank lines and comments separating ideas.  Since many other developers may have to work on your code/changes, it can be hard to understand the reasoning for any quirks that may be related on conditions not immediately apparent in the current context, or simply just because if a particular conviction.

        Make sure to document the parameters as well, such as `@param {string} value  ...description...`.
    
        If I cannot read the comments and immediately understand what is going on, I will most likely reject the pull request.

    2. Naming conventions are strict, but simple: 
        1. All functions and properties must be in typical JS notation (camel case, such as "myPropOrFunc"), and without underscores (in most cases). 
        2. All private properties or functions on a class must be prefixed with an underscore (example: "_myPrivatePropOrFunc").
        3. All types are in Pascal case (example: "MyClassType").
        4. All interfaces are in Pascal case, and start with "I" (example: "IMyCoolInterface").

    3. No jQuery or any other library in the VPL system or runtime. The system must be stand alone and without any dependency on other libraries.  While the system is VPL, it still needs to be low level for maximum speed efficiency (especially where the runtime is involved). This also applies to code generated by core system components and FlowScript component libraries.  3rd party components and/or libraries are free to make whatever dependencies within their own code-component JS scriptlets.

    4. No modules. Everything compiles into a single script and loads as such.

### Examples: ###

Coming soon...

### Editor Screen Shots ###

Note: This is the old editor.  A new one is being worked on.

##### Editor: #####
![Editor](https://github.com/rjamesnw/FlowScript/blob/master/Screenshots/Editor.png)

### Who do I talk to? ###

* Repo owner or admin: [James W.](https://www.quora.com/How-long-did-it-take-you-to-write-your-own-programming-language)
* Other community or team contact: N/A (yet)

### FAQ ###

#### What is FlowScript? ####
In a nutshell, FlowScript is a type of visual programming language (VPL). The goal of FlowScript is to reduce the amount of typing involved, and to help constrain the connections between components (functions and objects), such that there would be less coding errors, and thus, less time taken for debugging. The end result when compiling is pure efficient JavaScript, which can easily integrate with any client and server environment. We hope you'll find the somewhat new concept very pleasant to work worth, allowing you to focus more on the flow of creativity, and less on syntax and semantics.

#### Can I trust this system to be efficient and fast? ####
The development of the FlowScript system is backed by years of experience in dozens of languages, from assembly coding, up to various high level languages. Also with many years developing JavaScript libraries, and rigorous testing of the compiled code, you can be assured the output JavaScript is the fastest possible (at the time it was designed).

#### What makes FlowScript different from other programming concepts? ####
The biggest difference is the extensibility and data flow. Here are some main highlights:
* First, FlowScript allows one to easily create new components (representing functions and objects) from other components. These components can easily be applied to other projects, and even shared with the FlowScript community. You can even create your libraries using FlowScript, and output TypeScript definitions for end users.
* Second, FlowScript allows returning multiple values at once, without the need to return these values in objects. This was tailored specifically to allow for efficient game development. It allows multiple input and output data points via a special stack system designed to prevent the need to create objects for returning these values.
* Finally, debugging is actually done entirely in JavaScript itself! FlowScript is designed to render various statements and expressions in a step-sequencer that resembles a form of assembly language processing. This allows stepping through code and analyzing state entirely in the IDE. When ready, the final release compiled output is rendered as pure well-formatted JavaScript (and soon, optional TypeScript definition files as well).
