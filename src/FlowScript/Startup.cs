using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using FlowScript.JSServer.Integrations;
using FlowScript.JSServer.Integrations.Chakra;
using FlowScript.JSServer.Integrations.V8DotNet;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

namespace FlowScript
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        ServerScriptManager _ServerScriptManager;
        IJSServer _DefaultServer;
        IJSContext _DefaultContext;
        object _DefaultServerResult;
        Exception _StartupException;

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            try
            {
                _ServerScriptManager = new ServerScriptManager(env);
                _DefaultServer = new V8DotNetServer(_ServerScriptManager, "Default FlowScript Server");
                _DefaultContext = _DefaultServer.CreateContext("Default Context");
                _DefaultServerResult = _DefaultContext.RunFile(Path.Combine(env.ContentRootPath, "TypeScript/Server/server.js"));
            }
            catch (Exception ex)
            {
                _StartupException = ex;
            }

            if (env.IsDevelopment() || _StartupException != null)
            {
                app.UseDeveloperExceptionPage();
            }

            if (_StartupException != null)
                app.Run((context) =>
                {
                    if (_StartupException != null) throw new Exception("FlowScript Startup Error: ", _StartupException);
                    return Task.CompletedTask;
                });

            app.UseFileServer(new FileServerOptions
            {
                FileProvider = new PhysicalFileProvider(env.WebRootPath)
            });

            if (env.IsDevelopment()) // (in development include the typescript files, etc., for debugging on the client side as well)
                app.UseFileServer(new FileServerOptions
                {
                    FileProvider = new PhysicalFileProvider(env.ContentRootPath)
                });

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("There is no resource at this location! Have a nice day. ;)" + _DefaultServerResult);
            });
        }
    }
}
