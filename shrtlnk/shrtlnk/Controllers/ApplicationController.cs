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
                return View();
            }
            else
            {
                return RedirectToAction("SignIn", "Developer");
            }
        }

        [HttpPost]
        public IActionResult AddNew(AddNewApplicationForm form)
        {
            if (auth.CurrentUser.Verified)
            {
                applicationService.AddNew(form);
                return RedirectToAction("AccountHome", "Developer");
            }
            else
            {
                ViewBag.AccountVerified = false;
                return View();
            }
        }

        [HttpGet]
        public IActionResult Edit(string appId)
        {
            if (auth.IsSignedIn)
            {
                try
                {
                    DeveloperApplicationDTO app = applicationService.GetApp(appId);
                    return View(app);
                }
                catch
                {
                    return View("Hardfall");
                }
            }
            else
            {
                return RedirectToAction("SignIn", "Developer");
            }
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
                    return View("Hardfall");
                }
            }
            else
            {
                return RedirectToAction("SignIn", "Developer");
            }
        }

        [HttpGet]
        public IActionResult Delete(string appId)
        {
            if (auth.IsSignedIn)
            {
                try
                {
                    DeveloperApplicationDTO app = applicationService.GetApp(appId);
                    return View(app);
                }
                catch
                {
                    return View("Hardfall");
                }
            }
            else
            {
                return RedirectToAction("SignIn", "Developer");
            }
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
                    return View("Hardfall");
                }
            }

            return View();
        }
    }
}
