using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ChakraCore;
using ChakraCore.NET.API;

namespace FlowScript.JSServer.Integrations.Chakra
{

    public class ChakraContext : IJSContext
    {
        public readonly ChakraServer Server;
        public string Name { get; }
        JavaScriptContext _Context;

        public ChakraContext(ChakraServer server, string name)
        {
            Server = server ?? throw new ArgumentNullException(nameof(server));
            Name = name;
            _Context = Server.Runtime.CreateContext();
        }

        public object Execute(string js, string scriptName = null)
        {
            if (string.IsNullOrWhiteSpace(js)) return null;
            JavaScriptContext.Current = _Context;
            try
            {
                return JavaScriptContext.RunScript(js, Server.CurrentSourceContext, string.IsNullOrWhiteSpace(scriptName) ? "FlowScript: anonymous JS" : scriptName);
                // TODO: Note: Need a wrapper to make the return type the same on ever integrated JS context.
            }
            catch (Exception ex)
            {
                var msg = "";
                if (ex is JavaScriptScriptException jsex)
                {
                    msg = jsex.Error.GetProperty(JavaScriptPropertyId.FromString("message")).ToString() + Environment.NewLine;
                    msg += "   Source: " + jsex.Error.GetProperty(JavaScriptPropertyId.FromString("source")).ToString() + Environment.NewLine;
                    msg += "     on line " + jsex.Error.GetProperty(JavaScriptPropertyId.FromString("line")).ToInt32()
                        + ", column " + jsex.Error.GetProperty(JavaScriptPropertyId.FromString("line")).ToInt32() + "."
                        + Environment.NewLine;
                }
                var script = js.Length <= 255 ? js : js.Substring(0, 256);
                throw new InvalidOperationException("FlowScript: Error executing JS." + Environment.NewLine + msg + Environment.NewLine + "First 256 characters of script: " + Environment.NewLine + script, ex);
                // TODO: detect column and run and show only that part.
                // TODO: Consider own exception object for consistency.
            }
        }

        /// <summary> Executes the given file by path and name. </summary>
        /// <param name="filename">
        ///     Path and filename of the file. If a relative path is given, it is relative to the content root.
        /// </param>
        /// <returns> A JSServer. </returns>
        public object RunFile(string filename)
        {
            if (string.IsNullOrWhiteSpace(filename))
                throw new ArgumentNullException(nameof(filename));
            var _filename = filename;
            if (!filename.StartsWith("/") && !filename.StartsWith("\\"))
                _filename = Path.Combine(Server.Manager._HostingEnvironment.ContentRootPath, filename);
            if (!File.Exists(_filename) && File.Exists(filename))
                _filename = filename;
            if (!File.Exists(_filename))
                throw new FileNotFoundException("FlowScript: Could not execute the script - file not found: " + _filename, _filename);
            string contents;
            try
            {
                contents = File.ReadAllText(_filename);
            }
            catch (Exception ex)
            {
                throw new FileLoadException("FlowScript: Could not execute the script - unable to load the script file: " + _filename, _filename, ex);
            }

            return Execute(contents, filename);
        }
    }

    /// <summary> Returns the Chakra JavaScript wrapper integration. </summary>
    public class ChakraServer : IJSServer
    {
        public readonly ServerScriptManager Manager;
        public string Name { get; set; }
        public readonly JavaScriptRuntime Runtime;
        public readonly JavaScriptSourceContext CurrentSourceContext; // (a context specific to the JS host [the web server])

        public ChakraServer(ServerScriptManager manager, string name)
        {
            Manager = manager ?? throw new ArgumentNullException(nameof(manager));
            Name = name;
            CurrentSourceContext = JavaScriptSourceContext.FromIntPtr(IntPtr.Zero);
            Runtime = JavaScriptRuntime.Create();
            manager.AddServer(this);
        }

        /// <summary> Creates a new Chakra context. </summary>
        /// <param name="name"> The name. </param>
        /// <returns> The new context. </returns>
        public IJSContext CreateContext(string name)
        {
            return new ChakraContext(this, name);
        }
    }
}
