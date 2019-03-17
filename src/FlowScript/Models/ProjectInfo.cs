using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace FlowScript.API
{
    /// <summary> Holds information about a project in the 'Projects' folder. </summary>

    public class ProjectInfo : APIResponseBase
    {
        public string Name;

        /// <summary> This is a GUID assigned to the project when it gets created. </summary>
        public string ID;
    }
}