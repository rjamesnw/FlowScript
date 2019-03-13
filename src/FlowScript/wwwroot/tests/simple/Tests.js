var FlowScript;
(function (FlowScript) {
    var Tests;
    (function (Tests) {
        window.onerror = function (event, source, fileno, columnNumber) {
            document.writeln("<span style='color:#800000'>" + FlowScript.getErrorMessage(event) + "</span><br />");
        };
        function assert(msg, value, expected) {
            document.writeln(msg + " returned " + value + " - " + (value === expected ? "Pass" : "Fail (expected value: " + expected + ")") + "<br />");
        }
        var fs = FlowScript.createNew();
        var appNS = fs.add("Tests");
        // ########################################################################################################################
        // Test running value
        // ########################################################################################################################
        // ... first create a custom component with the required behavior, then register the type in the correct namespace ...
        class Dist2DTest extends FlowScript.Component {
            // 1. The derived component class name is only the initial reference, and is not the type that gets loaded from a save.
            // 2. Any variables placed on the class will never get saved and restored. This class exists only for definition construction.
            // 3. The constructor is ONLY used to build the type hierarchy.
            // 4. The 'init()' function is used to initialize 
            constructor(parent) {
                super(parent, FlowScript.ComponentTypes.Functional, "DeltaDistance2D", "distance $dx, $dy"); // Note: ID balloons to be shown in the IDE until the params are entered (to prevent the need for labels taking up space).
            }
            onInit() {
                // ... get a proper script reference (since this type can be applied to many different script environments) ...
                var sys = this.script.System; // (get the current script environment this type was added to)
                // (WARNING: NEVER RELY ON SCRIPT VARIABLES WRAPPED IN CLOSURES - this is because component types are instantiated for each new script instance)
                // ... setup the expected parameters for this component (without "$") ...
                var p_dx = this.defineParameter("dx", [sys.Integer, sys.Double]).createExpression();
                var p_dy = this.defineParameter("dy", [sys.Integer, sys.Double]).createExpression();
                // ... setup the return values (there can be more than one named return value) ...
                this.defineReturnVar(null, sys.Double);
                // ... set the script function to execute ...
                var line = this.block.newLine();
                var sqrt = line.addStatement(sys.Math.SQRT);
                var add = sqrt.arguments.setArg(0, sys.Math.Add);
                add.arguments.setArg(0, sys.Math.Multiply, { 0: p_dx, 1: p_dx });
                add.arguments.setArg(1, sys.Math.Multiply, { 0: p_dy, 1: p_dy });
            }
        }
        Tests.Dist2DTest = Dist2DTest;
        // ... get a reference to an instance of the component type to use as the function for this test ...
        var ds = new Dist2DTest(appNS); // (component will exist in the "appNS" namespace type path)
        fs.initialize();
        // ... add a new statement in the main block to call the new custom component ...
        fs.Main.title = "main $x, $y";
        fs.Main.defineReturnVar(null, fs.System.Double);
        var line = fs.Main.block.newLine();
        var statement = line.addStatement(ds, {
            dx: fs.Main.defineParameter("x", [fs.System.Double]).createExpression(),
            1: fs.Main.defineParameter("y", [fs.System.Double]).createExpression() // (note: can set '1:' or 'dy:' here for defining arguments),
        });
        // ... run the script ...
        var compiler = fs.getCompiler();
        var code = compiler.compile();
        var simulator = compiler.compileSimulation();
        //document.writeln("Dist2D(10, 10)  = " + simulator.run([10, 10]).arguments['result']); // only allowed if pulling from indexed arguments dynamically - test this later
        var rootCtx = simulator.start({ x: 20, y: 20 }).run();
        assert("distance (dx:20), (dy:20)", (rootCtx.value * 10000 | 0) / 10000, 28.2842); // (reduce precision in case this is not exact between browsers/systems)
        // ########################################################################################################################
        // Test if
        // ########################################################################################################################
        line = fs.Main.block.clear().newLine();
        statement = line.addStatement(fs.System.ControlFlow.If, {
            0: new FlowScript.Constant(true),
            1: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.Double, { 0: new FlowScript.Constant(123.456) }).block.createExpression()
        });
        compiler = fs.getCompiler();
        //var code = compiler.compile();
        simulator = compiler.compileSimulation();
        rootCtx = simulator.run();
        assert("if (true) then [123.456]", rootCtx.value, 123.456);
        // ########################################################################################################################
        // Test if .. else
        // ########################################################################################################################
        line = fs.Main.block.clear().newLine();
        statement = line.addStatement(fs.System.ControlFlow.IfElse, {
            0: new FlowScript.Constant(false),
            1: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.Double, { 0: new FlowScript.Constant(123.456) }).block.createExpression(),
            2: new FlowScript.Block(fs.Main).createExpression()
        });
        compiler = fs.getCompiler();
        //?var code = compiler.compile();
        simulator = compiler.compileSimulation();
        rootCtx = simulator.run();
        assert("if (false) then [123.456] else []", rootCtx.value, FlowScript.undefined);
        // ########################################################################################################################
        // Test while
        // ########################################################################################################################
        line = fs.Main.block.clear().newLine();
        line.addStatement(fs.System.Assign, { 0: fs.Main.getProperty("x").createExpression(), 1: new FlowScript.Constant(0) });
        line = fs.Main.block.newLine();
        statement = line.addStatement(fs.System.ControlFlow.While, {
            0: new FlowScript.ComponentReference(fs.System.Comparison.LessThan, { 0: fs.Main.getProperty("x").createExpression(), 1: new FlowScript.Constant(10) }),
            1: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.Main.getProperty("x").createExpression() }).block.createExpression(),
        });
        compiler = fs.getCompiler();
        //var code = compiler.compile();
        simulator = compiler.compileSimulation();
        rootCtx = simulator.run();
        assert("x = 0 | while (x<10) [++x]", rootCtx.value, 10);
        // ########################################################################################################################
        // Test do .. while
        // ########################################################################################################################
        line = fs.Main.block.clear().newLine();
        line.addStatement(fs.System.Assign, { 0: fs.Main.getProperty("x").createExpression(), 1: new FlowScript.Constant(0) });
        line = fs.Main.block.newLine();
        statement = line.addStatement(fs.System.ControlFlow.DoWhile, {
            0: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.Main.getProperty("x").createExpression() }).block.createExpression(),
            1: new FlowScript.ComponentReference(fs.System.Comparison.LessThan, { 0: fs.Main.getProperty("x").createExpression(), 1: new FlowScript.Constant(10) }),
        });
        compiler = fs.getCompiler();
        //var code = compiler.compile();
        simulator = compiler.compileSimulation();
        rootCtx = simulator.run();
        assert("x = 0 | do [++x] while (x<10)", rootCtx.value, 10);
        // ########################################################################################################################
        // Test advanced looping
        // ########################################################################################################################
        line = fs.Main.block.clear().newLine();
        //line = fs.Main.block.newLine();
        statement = line.addStatement(fs.System.ControlFlow.Loop, {
            0: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.Assign, { 0: fs.Main.getProperty("x").createExpression(), 1: new FlowScript.Constant(0) })
                .block.newLine().addStatement(fs.System.Assign, { 0: fs.Main.getProperty("y").createExpression(), 1: new FlowScript.Constant(0) }).block.createExpression(),
            1: new FlowScript.ComponentReference(fs.System.Comparison.LessThan, { 0: fs.Main.getProperty("x").createExpression(), 1: new FlowScript.Constant(10) }),
            2: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.PostDecrement, { 0: fs.Main.getProperty("y").createExpression() }).block.createExpression(),
            3: new FlowScript.Block(fs.Main).newLine().addStatement(fs.System.PreIncrement, { 0: fs.Main.getProperty("x").createExpression() }).block.createExpression(),
        });
        compiler = fs.getCompiler();
        // var code = compiler.compile();
        simulator = compiler.compileSimulation();
        rootCtx = simulator.run();
        assert("with [x = 0, y = 0] while (x<10) loop [y--] and repeat with [++x]", rootCtx.value, -9);
    })(Tests = FlowScript.Tests || (FlowScript.Tests = {}));
})(FlowScript || (FlowScript = {}));
//# sourceMappingURL=Tests.js.map