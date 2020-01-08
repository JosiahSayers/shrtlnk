using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Applications;
using shrtlnk.Models.Developer.Account;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Models.ViewModels;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Exceptions;

namespace shrtlnk.Controllers
{
    [AutoValidateAntiforgeryToken]
    public class DeveloperController : Controller
    {
        private readonly AuthenticationService auth;
        private readonly DeveloperApplicationsDBService applications;
        private static readonly string sessionEmailVerified = "email_verified";

        public DeveloperController(AuthenticationService auth, DeveloperApplicationsDBService applications)
        {
            this.auth = auth;
            this.applications = applications;
        }

        [HttpGet]
        public IActionResult Index()
        {
            ViewData["Title"] = "Developer Portal";
            return View();
        }

        [HttpGet]
        public IActionResult Documentation()
        {
            ViewData["Title"] = "Developer Documentation";
            string protocol = "https://";
            string baseUrl = HttpContext.Request.Host.ToUriComponent();
            string swaggerUrl = "/swagger/shrtlnk_V2.json";
            return View("Documentation", protocol + baseUrl + swaggerUrl);
        }

        [HttpGet]
        public IActionResult Register()
        {
            ViewData["Title"] = "Register";
            return View();
        }

        [HttpPost]
        public IActionResult Register(RegisterAccountForm registration)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    DeveloperAccountDTO account = auth.RegisterUser(registration);
                    return RedirectToAction("AccountHome");
                }

                ViewBag.FormError = true;
                return View();
            }
            catch (Exception e)
            {
                if (e.GetType() == typeof(EmailAlreadyExistsError))
                {
                    ViewBag.EmailAlreadyExists = true;
                }
                else
                {
                    ViewBag.DatabaseError = true;
                }
                return View();
            }
        }

        [HttpGet]
        public IActionResult SignIn()
        {
            ViewData["Title"] = "Sign In";
            ViewBag.EmailVerified |= HttpContext.Session.GetString(sessionEmailVerified) == "true";
            return View();
        }

        [HttpPost]
        public IActionResult SignIn(SignInForm signInForm)
        {
            try
            {
                DeveloperAccountDTO account = auth.AuthenticateUser(signInForm);
                return RedirectToAction("AccountHome");
            }
            catch (Exception e)
            {
                if (e.GetType() == typeof(IncorrectPasswordException) ||
                    e.GetType() == typeof(AccountNotFoundException))
                {
                    // Add logging
                }
                return View();
            }
        }

        [HttpGet]
        public IActionResult AccountHome()
        {
            if (auth.IsSignedIn)
            {
                DeveloperAccountDTO user;
                List<DeveloperApplicationDTO> apps;
                ViewBag.EmailVerified |= HttpContext.Session.GetString(sessionEmailVerified) == "true";
                try
                {
                    user = auth.CurrentUser;
                    apps = applications.GetByDeveloper(user.Email);
                }
                catch
                {
                    ViewData["Title"] = "Error";
                    return View("Hardfall"); // todo: Make this better based on the error that is thrown
                }

                AccountHomeViewModel vm = new AccountHomeViewModel()
                {
                    Account = auth.CurrentUser,
                    Applications = apps
                };
                ViewData["Title"] = "Account Home";
                return View(vm);
            }
            return RedirectToAction("SignIn");
        }

        [HttpGet]
        public IActionResult SignOut()
        {
            auth.SignOut();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public IActionResult VerifyEmail(string verificationId)
        {
            try
            {
                auth.VerifyAccount(verificationId);
            }
            catch (Exception e)
            {
                if (e.GetType() == typeof(UnknownVerificationIdException))
                {
                    ViewData["Title"] = "Unknown Verification Code";
                    return View("UnknownVerification");
                }
                ViewData["Title"] = "Error";
                return View("Hardfall");
            }

            HttpContext.Session.SetString(sessionEmailVerified, "true");
            return RedirectToAction("AccountHome");
        }

        [HttpGet]
        public IActionResult EditAccount()
        {
            if (auth.IsSignedIn)
            {
                ViewData["Title"] = "Edit Account";
                DeveloperAccountDTO account = auth.CurrentUser;
                return View(new EditAccountViewModel(account));
            }
            return RedirectToAction("SignIn");
        }

        [HttpPost]
        public IActionResult EditAccount(EditAccountViewModel editedAccount)
        {
            try
            {
                auth.UpdateAccount(editedAccount.Account);
                return RedirectToAction("AccountHome");
            }
            catch
            {
                ViewData["Title"] = "Error";
                return View("Hardfall");
            }
        }
    }
}