namespace FlowScript.IDE {
    // ========================================================================================================================

    export var projects = new FlowScript.Projects();

    export function createIDEProject(): FlowScript.Project {
        return projects.createProject("Flow Script IDE", "FlowScript is a cross between a Visual Programming Language (VPL) and regular text-style development.");
    }

    export var flowScriptProject = createIDEProject();

    // ========================================================================================================================

    export class Main extends Component {
        constructor() { super(null, ComponentTypes.Functional, "Main", "Main"); }

        onInit() {
            var fs = this.script;
            var appNS = fs.System.add("Tests");

            fs.main.defineDefaultReturnVar();

            fs.main.defineLocalVar("x", [fs.System.Double]),
                fs.main.defineLocalVar("y", [fs.System.Double]);

            var line = fs.main.block.newLine();
            var statement = line.addStatement(fs.System.ControlFlow.Loop, {
                0: new Block(fs.main).newLine().addStatement(fs.System.Assign, { 0: fs.main.getProperty("x").createExpression(), 1: new Constant(0) })
                    .block.newLine().addStatement(fs.System.Assign, { 0: fs.main.getProperty("y").createExpression(), 1: new Constant(0) }).block.createExpression(),
                1: new ComponentReference(fs.System.Comparison.LessThan, { 0: fs.main.getProperty("x").createExpression(), 1: new Constant(10) }),
                2: new Block(fs.main).newLine().addStatement(fs.System.PostDecrement, { 0: fs.main.getProperty("y").createExpression() }).block.createExpression(),
                3: new Block(fs.main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.main.getProperty("x").createExpression() }).block.createExpression(),
            });
        }
    }

    flowScriptProject.script.main = new Main();

    // ========================================================================================================================
    
    export class Main extends Component {
        constructor() { super(null, ComponentTypes.Functional, "Main", "Main"); }

        onInit() {
            var fs = this.script;
            var appNS = fs.System.add("Tests");

            fs.main.defineDefaultReturnVar();

            fs.main.defineLocalVar("x", [fs.System.Double]),
                fs.main.defineLocalVar("y", [fs.System.Double]);

            var line = fs.main.block.newLine();
            var statement = line.addStatement(fs.System.ControlFlow.Loop, {
                0: new Block(fs.main).newLine().addStatement(fs.System.Assign, { 0: fs.main.getProperty("x").createExpression(), 1: new Constant(0) })
                    .block.newLine().addStatement(fs.System.Assign, { 0: fs.main.getProperty("y").createExpression(), 1: new Constant(0) }).block.createExpression(),
                1: new ComponentReference(fs.System.Comparison.LessThan, { 0: fs.main.getProperty("x").createExpression(), 1: new Constant(10) }),
                2: new Block(fs.main).newLine().addStatement(fs.System.PostDecrement, { 0: fs.main.getProperty("y").createExpression() }).block.createExpression(),
                3: new Block(fs.main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.main.getProperty("x").createExpression() }).block.createExpression(),
            });
        }
    }
    
    // ========================================================================================================================
}
