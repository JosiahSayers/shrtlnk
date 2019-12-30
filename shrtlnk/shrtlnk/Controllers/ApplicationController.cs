using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Models.Objects;
using shrtlnk.Services.Applications;
using shrtlnk.Services.Authentication;

namespace shrtlnk.Controllers
{
    public class ApplicationController : Controller
    {
        private readonly AuthenticationService auth;
        private readonly DeveloperApplicationsService applicationService;

        public ApplicationController(AuthenticationService auth, DeveloperApplicationsService applicationService)
        {
            this.auth = auth;
            this.applicationService = applicationService;
        }

        [HttpGet]
        public IActionResult AddNew()
        {
            if (auth.IsSignedIn)
            {
                ViewBag.AccountVerified = auth.CurrentUser.Verified;
                ViewData["Title"] = "Add a New Application";
                return View();
            }
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpPost]
        public IActionResult AddNew(AddNewApplicationForm form)
        {
            if (auth.IsSignedIn && auth.CurrentUser.Verified)
            {
                applicationService.AddNew(form);
                return RedirectToAction("AccountHome", "Developer");
            }

            ViewBag.AccountVerified = false;
            return View();
        }

        [HttpGet]
        public IActionResult Edit(string appId)
        {
            if (auth.IsSignedIn)
            {
                try
                {
                    DeveloperApplicationDTO app = applicationService.GetApp(appId);
                    ViewData["Title"] = "Edit Application";
                    return View(app);
                }
                catch
                {
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpPost]
        public IActionResult Edit(DeveloperApplicationDTO app)
        {
            if (auth.IsSignedIn)
            {
                try
                {
                    applicationService.UpdateApp(app);
                    return RedirectToAction("AccountHome", "Developer");
                }
                catch
                {
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpGet]
        public IActionResult Delete(string appId)
        {
            if (auth.IsSignedIn)
            {
                try
                {
                    DeveloperApplicationDTO app = applicationService.GetApp(appId);
                    ViewData["Title"] = "Confirm Delete";
                    return View(app);
                }
                catch
                {
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            return RedirectToAction("SignIn", "Developer");
        }

        [HttpPost]
        public IActionResult Delete(DeveloperApplicationDTO app)
        {
            if (auth.IsSignedIn)
            {
                try
                {
                    applicationService.DeleteApp(app.Id);
                    return RedirectToAction("AccountHome", "Developer");
                }
                catch
                {
                    ViewData["Title"] = "Error";
                    return View("Hardfall");
                }
            }
            ViewData["Title"] = "Confirm Delete";
            return View();
        }
    }
}
