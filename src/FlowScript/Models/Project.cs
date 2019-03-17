using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace FlowScript.API
{
    public class Project : APIResponseBase
    {
        public ProjectInfo Info;

        public string Script;
    }
}