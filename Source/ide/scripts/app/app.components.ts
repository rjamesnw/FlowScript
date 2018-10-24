namespace FlowScript.IDE {
    // ========================================================================================================================

    export var projects = new FlowScript.Projects();

    export function createIDEProject(): FlowScript.Project {
        return projects.createProject("Flow Script IDE", "FlowScript is a cross between a Visual Programming Language (VPL) and regular text-style development.");
    }

    export var flowScriptProject = createIDEProject();

    // ========================================================================================================================

    export class FlowScriptIDE_Main extends FlowScript.Core.Main {
        constructor() { super(); }

        onInit() {
            var fs = this.script;
            var appNS = fs.System.add("Tests");

            fs.Main.defineDefaultReturnVar();

            fs.Main.defineLocalVar("x", [fs.System.Double]),
                fs.Main.defineLocalVar("y", [fs.System.Double]);

            var line = fs.Main.block.newLine();
            var statement = line.addStatement(fs.System.ControlFlow.Loop, {
                0: new Block(fs.Main).newLine().addStatement(fs.System.Assign, { 0: fs.Main.getProperty("x").createExpression(), 1: new Constant(0) })
                    .block.newLine().addStatement(fs.System.Assign, { 0: fs.Main.getProperty("y").createExpression(), 1: new Constant(0) }).block.createExpression(),
                1: new ComponentReference(fs.System.Comparison.LessThan, { 0: fs.Main.getProperty("x").createExpression(), 1: new Constant(10) }),
                2: new Block(fs.Main).newLine().addStatement(fs.System.PostDecrement, { 0: fs.Main.getProperty("y").createExpression() }).block.createExpression(),
                3: new Block(fs.Main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.Main.getProperty("x").createExpression() }).block.createExpression(),
            });
        }
    }

    flowScriptProject.script.Main = new FlowScriptIDE_Main();

    // ========================================================================================================================
    
    export class Main extends Component {
        constructor() { super(null, ComponentTypes.Functional, "Main", "Main"); }

        onInit() {
            var fs = this.script;
            var appNS = fs.System.add("Tests");

            fs.Main.defineDefaultReturnVar();

            fs.Main.defineLocalVar("x", [fs.System.Double]),
                fs.Main.defineLocalVar("y", [fs.System.Double]);

            var line = fs.Main.block.newLine();
            var statement = line.addStatement(fs.System.ControlFlow.Loop, {
                0: new Block(fs.Main).newLine().addStatement(fs.System.Assign, { 0: fs.Main.getProperty("x").createExpression(), 1: new Constant(0) })
                    .block.newLine().addStatement(fs.System.Assign, { 0: fs.Main.getProperty("y").createExpression(), 1: new Constant(0) }).block.createExpression(),
                1: new ComponentReference(fs.System.Comparison.LessThan, { 0: fs.Main.getProperty("x").createExpression(), 1: new Constant(10) }),
                2: new Block(fs.Main).newLine().addStatement(fs.System.PostDecrement, { 0: fs.Main.getProperty("y").createExpression() }).block.createExpression(),
                3: new Block(fs.Main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.Main.getProperty("x").createExpression() }).block.createExpression(),
            });
        }
    }
    
    // ========================================================================================================================
}
