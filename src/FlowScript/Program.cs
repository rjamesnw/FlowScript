using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VroomJs;

namespace FlowScript
{
    public class Program
    {
        public static void Main(string[] args)
        {
            AssemblyLoader.EnsureLoaded(); // windows only

            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                //.UseKestrel() // Request Filtering: https://stackoverflow.com/questions/51773340/asp-net-core-api-404-not-found-master
                //.UseWebRoot(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
                //.UseContentRoot(Directory.GetCurrentDirectory())
                //.UseApplicationInsights()
                .UseStartup<Startup>();
    }
}
