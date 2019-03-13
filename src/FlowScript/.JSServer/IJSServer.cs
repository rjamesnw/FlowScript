using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowScript
{
    public interface IJSServer
    {
        string Name { get; set; }
        IJSContext CreateContext(string name);
    }
}
