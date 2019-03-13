using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using V8.Net;

namespace FlowScript.JSServer.Integrations.V8DotNet
{

    public class V8DotNetContext : IJSContext
    {
        public readonly V8DotNetServer Server;
        public string Name { get; }
        Context _Context; // (does not yet support contexts!)

        public V8DotNetContext(V8DotNetServer server, string name)
        {
            Server = server ?? throw new ArgumentNullException(nameof(server));
            Name = name;
            _Context = server.Engine.CreateContext(); // (does not yet support contexts!)
        }

        public object Execute(string js, string scriptName = null)
        {
            if (string.IsNullOrWhiteSpace(js)) return null;
            try
            {
                Server.Engine.SetContext(_Context); // TODO: Make sure the native side doesn't keep setting the same setting when already set. ;)
                return Server.Engine.Execute(js, string.IsNullOrWhiteSpace(scriptName) ? "FlowScript: anonymous JS" : scriptName);
            }
            catch (Exception ex)
            {
                var script = js.Length <= 255 ? js : js.Substring(0, 256);
                throw new InvalidOperationException("FlowScript: Error executing JS. First 256 characters of script: " + Environment.NewLine + script, ex);
                // TODO: detect column and run and show only that part.
                // TODO: Consider own exception object for consistency.
            }
        }

        /// <summary> Executes the given file by path and name. </summary>
        /// <param name="filename">
        ///     Path and filename of the file. If a relative path is given, it is relative to the content root.
        /// </param>
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

    /// <summary> Returns the V8.NET JavaScript wrapper integration. </summary>
    public class V8DotNetServer : IJSServer
    {
        public readonly ServerScriptManager Manager;
        public string Name { get; set; }
        public readonly V8Engine Engine;

        public V8DotNetServer(ServerScriptManager manager, string name)
        {
            Manager = manager ?? throw new ArgumentNullException(nameof(manager));
            Name = name;
            Engine = new V8Engine(false);
            manager.AddServer(this);
        }

        /// <summary> Creates a new VroomJS context. </summary>
        /// <param name="name"> The name. </param>
        /// <returns> The new context. </returns>
        public IJSContext CreateContext(string name)
        {
            return new V8DotNetContext(this, name);
        }
    }
}
