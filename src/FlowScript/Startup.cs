using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using FlowScript.API;
using FlowScript.JSServer.Integrations;
using FlowScript.JSServer.Integrations.Chakra;
using FlowScript.JSServer.Integrations.V8DotNet;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.PlatformAbstractions;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Swagger;
using CoreXT;

namespace FlowScript
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            // ... only add the API controller part - we don't need the views ...

            services.AddMvcCore().AddFormatterMappings().AddJsonFormatters().AddCors().AddApiExplorer();

            // ... add a UI for the API ...

            services.AddSwaggerGen(o =>
            {
                o.SwaggerDoc("v1", new Info { Title = "FlowScript API", Version = "v1" });
                var basePath = PlatformServices.Default.Application.ApplicationBasePath;
                var xmlPath = Path.Combine(basePath, "FlowScript.xml");
                o.IncludeXmlComments(xmlPath);
                o.CustomSchemaIds(x => x.FullName); // (https://stackoverflow.com/questions/46071513/swagger-error-conflicting-schemaids-duplicate-schemaids-detected-for-types-a-a)
            });
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

            app.UseExceptionHandler(a => a.Run(async context =>
            {
                var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
                var exception = exceptionHandlerPathFeature.Error;
                var result = JsonConvert.SerializeObject(exception.GetFullErrorMessage().AsError());
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(result);
            }));

            app.UseSwagger(o => // (this adds the middleware to serve the json configuration for the swagger support)
            {
                o.RouteTemplate = "api/{documentName}/fs.json";
            }) // Enable middleware to serve generated Swagger as a JSON endpoint.
             .UseSwaggerUI(o => // (this adds the web UI part of swagger)
             {
                 o.SwaggerEndpoint("/api/v1/fs.json", "FlowScript API");
                 o.RoutePrefix = "api";
                 o.InjectStylesheet("/swagger-ui/swagger-custom.css");
                 //var swaggerIndexPath = Path.Combine(HostingEnvironment.WebRootPath, "swagger-ui/index.html");
                 //if (File.Exists(swaggerIndexPath))
                 //    o.IndexStream = () => new FileStream(swaggerIndexPath, FileMode.Open);
                 //() => GetType().GetTypeInfo().Assembly
                 //    .GetManifestResourceStream("CustomUIIndex.Swagger.index.html"); // requires file to be added as an embedded resource
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

            app.UseMvc();

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("There is no resource at this location! Have a nice day. ;)" + _DefaultServerResult);
            });
        }
    }
}

// NGROK CMD: ngrok http 50094 -host-header="localhost:50094" -subdomain=botpal
// Chat box: https://codepen.io/drehimself/pen/KdXwxR
// Chat boxes: https://www.bypeople.com/css-chat/
// https://www.google.ca/search?q=free+html5+group+chat&rlz=1C1CHBF_enCA797CA797&oq=free+html5+group+&aqs=chrome.0.69i59l2j69i57j69i64.3494j0j1&sourceid=chrome&ie=UTF-8
// https://bootsnipp.com/tags/chat (interesting timeline: https://bootsnipp.com/snippets/xGGpM)
// Using WinMerge as the "git mergetool" when needed: https://ibeblog.com/2014/03/14/winmerge-as-mergetool-with-github-for-windows/
