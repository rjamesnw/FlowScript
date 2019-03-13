using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowScript
{
    public interface IJSContext
    {
        string Name { get; }
        object Execute(string js, string scriptName = null);
        object RunFile(string filename);
  }
}
