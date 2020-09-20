using System;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Applications;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Applications;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Logger;

namespace shrtlnk.Controllers
{
    public class ApplicationController : Controller
    {
        private readonly AuthenticationService auth;
        private readonly DeveloperApplicationsService applicationService;
        private readonly ILogger logger;

        public ApplicationController(AuthenticationService auth, DeveloperApplicationsService applicationService, ILogger logger)
        {
            this.auth = auth;
            this.applicationService = applicationService;
            this.logger = logger;
        }

        [HttpGet]
        public IActionResult AddNew()
        {
            
            if (auth.IsSignedIn)
            {
                ViewBag.AccountVerified = auth.CurrentUser.Verified;
                logger.Info("Developer Applications: AddNew - Requested - Account Info", auth.CurrentUser.ForLogging());
                ViewData["Title"] = "Add a New Application";
                return View();
            }
            logger.Info("Developer Applications: AddNew - Requested - Not Signed In");
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpPost]
        public IActionResult AddNew(AddNewApplicationForm form)
        {
            if (auth.IsSignedIn && auth.CurrentUser.Verified)
            {
                logger.Info("Developer Applications: AddNew - Posted - Account Info", auth.CurrentUser.ForLogging());
                var app = applicationService.AddNew(form);
                logger.Info("Developer Applications: AddNew - Posted - New Application", app);
                return RedirectToAction("AccountHome", "Developer");
            }
            logger.Info("Developer Applications: AddNew - Posted - Not signed in or not verified", auth.CurrentUser?.ForLogging());
            ViewBag.AccountVerified = false;
            return View();
        }

        [HttpGet]
        public IActionResult Edit(string appId)
        {
            logger.Info("Developer Applications: Edit - Requested", appId);
            if (auth.IsSignedIn)
            {
                try
                {
                    DeveloperApplicationDTO app = applicationService.GetApp(appId);
                    logger.Info("Developer Applications: Edit - Requested - Application Info", app);
                    ViewData["Title"] = "Edit Application";
                    return View(app);
                }
                catch (Exception e)
                {
                    logger.Error("Developer Applications: Edit - Error", e);
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            logger.Info("Developer Applications: Edit - Requested - Not signed in");
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpPost]
        public IActionResult Edit(DeveloperApplicationDTO app)
        {
            logger.Info("Developer Applications: Edit - Posted", app);
            if (auth.IsSignedIn)
            {
                try
                {
                    applicationService.UpdateApp(app);
                    logger.Info("Developer Applications: Edit - Posted - App Successfully Updated", app);
                    return RedirectToAction("AccountHome", "Developer");
                }
                catch (Exception e)
                {
                    logger.Error("Developer Applications: Edit - Error", e);
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            logger.Info("Developer Applications: Edit - Posted - Not signed in");
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpGet]
        public IActionResult Delete(string appId)
        {
            logger.Info("Developer Applications: Delete - Requested", appId);
            if (auth.IsSignedIn)
            {
                try
                {
                    DeveloperApplicationDTO app = applicationService.GetApp(appId);
                    logger.Info("Developer Applications: Delete - Requested - App Successfully Retrieved", app);
                    ViewData["Title"] = "Confirm Delete";
                    return View(app);
                }
                catch (Exception e)
                {
                    logger.Error("Developer Applications: Delete - Requested ERROR", e);
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            logger.Info("Developer Applications: Delete - Requested - Not signed in", appId);
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpPost]
        public IActionResult Delete(DeveloperApplicationDTO app)
        {
            logger.Info("Developer Applications: Delete - Posted", app);
            if (auth.IsSignedIn)
            {
                try
                {
                    applicationService.DeleteApp(app.Id);
                    logger.Info("Developer Applications: Delete - Posted - App Successfully Deleted", app);
                    return RedirectToAction("AccountHome", "Developer");
                }
                catch (Exception e)
                {
                    logger.Error("Developer Applications: Delete - Posted ERROR", e);
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            logger.Info("Developer Applications: Delete - Posted - Not signed in", app);
            ViewData["Title"] = "Confirm Delete";
            return View();
        }
    }
}
