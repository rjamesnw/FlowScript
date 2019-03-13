using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using VroomJs;

namespace FlowScript.JSServer.Integrations.VroomJS
{

    public class VroomJSContext : IJSContext
    {
        public readonly VroomJSServer Server;
        public string Name { get; }
        JsContext _Context;

        public VroomJSContext(VroomJSServer server, string name)
        {
            Server = server ?? throw new ArgumentNullException(nameof(server));
            Name = name;
            _Context = Server.Engine.CreateContext();
        }

        public object Execute(string js, string scriptName = null)
        {
            if (string.IsNullOrWhiteSpace(js)) return null;
            var trycatchblock = "try { " + js + " } catch(ex) { if (typeof ex == 'object') throw ex.message+'\r\n'+ex.stack; else throw ex; }";
            try
            {
                return _Context.Execute(trycatchblock, string.IsNullOrWhiteSpace(scriptName) ? "FlowScript: anonymous JS" : scriptName);
            }
            catch (Exception ex)
            {
                var script = trycatchblock.Length <= 255 ? trycatchblock : trycatchblock.Substring(0, 256);
                throw new JsException("FlowScript: Error executing JS. First 256 characters of script: " + Environment.NewLine + script, ex);
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

    /// <summary> Returns the VroomJS JavaScript wrapper integration. </summary>
    public class VroomJSServer : IJSServer
    {
        public readonly ServerScriptManager Manager;
        public string Name { get; set; }
        public readonly JsEngine Engine;

        public VroomJSServer(ServerScriptManager manager, string name)
        {
            Manager = manager ?? throw new ArgumentNullException(nameof(manager));
            Name = name;
            Engine = new JsEngine();
            manager.AddServer(this);
        }

        /// <summary> Creates a new VroomJS context. </summary>
        /// <param name="name"> The name. </param>
        /// <returns> The new context. </returns>
        public IJSContext CreateContext(string name)
        {
            return new VroomJSContext(this, name);
        }
    }
}
