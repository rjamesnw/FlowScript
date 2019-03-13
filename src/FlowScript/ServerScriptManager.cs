using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using VroomJs;

namespace FlowScript
{
    public class ServerScriptManager : IEnumerable<IJSServer>
    {
        // --------------------------------------------------------------------------------------------------------------------

        public readonly JsEngine Engine;

        List<IJSServer> _Servers = new List<IJSServer>();
        Dictionary<string, IJSServer> _ServersByName = new Dictionary<string, IJSServer>();

        internal IHostingEnvironment _HostingEnvironment;

        public int Count => _Servers.Count;

        // --------------------------------------------------------------------------------------------------------------------

        public ServerScriptManager(IHostingEnvironment env)
        {
            _HostingEnvironment = env;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets a server by name. </summary>
        /// <param name="name"> The name. </param>
        /// <returns> The server. </returns>
        public IJSServer GetServer(string name) => _ServersByName.TryGetValue(name, out var server) ? server : null;

        /// <summary> Gets a server by index. See <see cref="Count"/> to get the number of servers being managed. </summary>
        /// <param name="name"> The name. </param>
        /// <returns> The server. </returns>
        public IJSServer GetServer(int index) => _Servers[index];

        /// <summary>
        ///     Creates a server by the given name.  If a server already exists it is returned. If a name is not specific then a
        ///     GUID is created.
        /// </summary>
        /// <param name="name"> The name. </param>
        /// <returns> The new server. </returns>
        public IJSServer AddServer(IJSServer server)
        {
            if (server == null) throw new ArgumentNullException(nameof(server));
            var name = server.Name ?? string.Empty;
            if (_ServersByName.TryGetValue(name, out var _server))
                return server;
            if (string.IsNullOrWhiteSpace(name))
                server.Name = name = Guid.NewGuid().ToString("N");
            _ServersByName[name] = server;
            _Servers.Add(server);
            return server;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public IEnumerator<IJSServer> GetEnumerator() => _Servers.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => ((IEnumerable)_Servers).GetEnumerator();

        // --------------------------------------------------------------------------------------------------------------------
    }
}
