﻿using Microsoft.AspNetCore.Mvc;
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
                return RedirectToAction();
            }
            else
            {
                ViewBag.AccountVerified = false;
                return View();
            }
        }
    }
}
