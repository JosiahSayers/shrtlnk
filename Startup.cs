using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using shrtlnk.Models.Applications;
using shrtlnk.Models.DAL;
using shrtlnk.Models.DatabaseSettings;
using shrtlnk.Models.Developer.Account;
using shrtlnk.Models.Developer.AccountVerification;
using shrtlnk.Models.Objects;
using shrtlnk.Services.API;
using shrtlnk.Services.Applications;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Email;
using shrtlnk.Services.Logger;

namespace shrtlnk
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.Configure<DbSettings>(
                Configuration.GetSection("DatabaseSettings"));

            services.AddSingleton(sp =>
                sp.GetRequiredService<IOptions<DbSettings>>().Value);

            services.Configure<LoggerSettings>(
                Configuration.GetSection(nameof(LoggerSettings)));

            services.AddSingleton(sp =>
                sp.GetRequiredService<IOptions<LoggerSettings>>().Value);

            services.Configure<EmailSettings>(
                Configuration.GetSection(nameof(EmailSettings)));

            services.AddSingleton(sp =>
                sp.GetRequiredService<IOptions<EmailSettings>>().Value);

            services.Configure<ApiInfo>(
                Configuration.GetSection(nameof(ApiInfo)));

            services.AddSingleton(sp =>
                sp.GetRequiredService<IOptions<ApiInfo>>().Value);

            services.AddSingleton<IDeveloperAccountsService, DeveloperAccountsService>();
            services.AddSingleton<AuthenticationService>();
            services.AddSingleton<IAccountVerificationService, AccountVerificationService>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<IEmailService, EmailService>();
            services.AddSingleton<ApiAuthorizationService>();

            services.AddSingleton<IDeveloperApplications, DeveloperApplications>();
            services.AddSingleton<DeveloperApplicationsService>();

            string connectionString = Configuration.GetConnectionString("AppHarbor");

            services.AddSingleton(c => new linksDAL(connectionString));

            services.AddSingleton<ILogger, Logger>();

            services.AddHttpClient();

            services.AddDistributedMemoryCache();

            services.AddSession(options =>
            {
                options.Cookie.Name = ".shrtlnk.Session";
                options.IdleTimeout = TimeSpan.FromMinutes(10);
                options.Cookie.HttpOnly = true;
                // Make the session cookie essential
                options.Cookie.IsEssential = true;
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseSession();

            app.UseMvc(routes =>
            {
                // default routes plus any other custom routes
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");


                // Catch all Route - catches anything not caught be other routes
                routes.MapRoute(
                    name: "catch-all",
                    template: "{*url}",
                    defaults: new { controller = "Home", action = "Link" }
                );
            });
        }
    }
}
