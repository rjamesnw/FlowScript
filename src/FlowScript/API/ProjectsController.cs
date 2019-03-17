using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace FlowScript.API
{
    /// <summary> A controller for handling projects. </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Mvc.ControllerBase"/>
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        // Returns a list of project names and IDs.
        [HttpGet]
        public IEnumerable<ProjectInfo> Get() // Read
        {
            return new[] { new ProjectInfo { Name = "Test 1", ID = "1" }, new ProjectInfo { Name = "Test 2", ID = "2" } };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public ProjectInfo Get(int id) // Read
        {
            return new ProjectInfo { Name = "Test " + id, ID = "" + id };
        }

        // POST api/values
        [HttpPost]
        public APIResponse Post([FromBody]string value) // Create
        {
            return APIResponse.OK;
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public APIResponse Put(int id, [FromBody]string value) // Update/Replace
        {
            return APIResponse.OK;
        }

        //// PUT api/values/5
        //[HttpPatch("{id}")]
        //public APIResponse Patch(int id, [FromBody]string value) // Update/Modify
        //{
        //    return APIResponse.OK;
        //}

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public APIResponse Delete(int id) // Delete
        {
            return APIResponse.OK;
        }
    }
}