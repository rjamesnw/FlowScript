using System.Collections.Generic;
using System.IO;
using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace FlowScript.API
{
    /// <summary> A controller for handling files. </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Mvc.ControllerBase"/>
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        IHostingEnvironment _HostingEnvironment;

        public FileController(IHostingEnvironment env)
        {
            _HostingEnvironment = env;
        }

        /// <summary> Returns a list of files and directories in the root. </summary>
        /// <returns> An enumerator that allows foreach to be used to process the matched items. </returns>
        [HttpGet]
        public IDataResponse Get() // Read
        {
            return Directory.EnumerateFileSystemEntries(_HostingEnvironment.ContentRootPath).AsResponse();
        }

        /// <summary> Returns a list of files and directories in the root based on a pattern. </summary>
        /// <param name="pattern"> The pattern to get. </param>
        /// <returns> An enumerator that allows foreach to be used to process the matched items. </returns>
        [HttpGet("{pattern}")]
        public IDataResponse Get(string pattern) // Read
        {
            return Directory.EnumerateFileSystemEntries(_HostingEnvironment.ContentRootPath, WebUtility.UrlDecode(pattern)).AsResponse();
        }

        /// <summary> Returns a list of files and directories in the root based on a sub-path and pattern. </summary>
        /// <param name="path"> Full pathname of the file. </param>
        /// <param name="pattern"> The pattern to get. </param>
        /// <returns> An enumerator that allows foreach to be used to process the matched items. </returns>
        [HttpGet("{path}/{pattern}")]
        public IDataResponse Get(string path, string pattern) // Read
        {
            path = ("" + WebUtility.UrlDecode(path)).Replace('/', '\\');
            if (path.StartsWith('\\') || path.Contains("..") || path.Contains(':'))
                return $"For security reasons, a path cannot contain ':' or '..', and you cannot start a path using '\\' or '/'.\r\nPath given: {path}".AsError();
            var finalPath = Path.Combine(_HostingEnvironment.ContentRootPath, path);
            if (!Directory.Exists(finalPath)) return $"The path '{finalPath}' does not exist.".AsError();
            return Directory.EnumerateFileSystemEntries(finalPath, WebUtility.UrlDecode(pattern)).AsResponse();
        }

        // POST api/values
        [HttpPost, RequestSizeLimit(100_000_000)]
        public IAPIResponse Post([FromBody]string value) // Create
        {
            return APIResponse.OK;
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public IAPIResponse Put(int id, [FromBody]string value) // Update/Replace
        {
            return APIResponse.OK;
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public IAPIResponse Delete(int id) // Delete
        {
            return APIResponse.OK;
        }
    }
}