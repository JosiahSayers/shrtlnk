using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Models.ViewModels;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Authentication.Exceptions;
using shrtlnk.Services.DAL.Developer;

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
            return View();
        }

        [HttpGet]
        public IActionResult Documentation()
        {
            string protocol = HttpContext.Request.IsHttps ? "https://" : "http://";
            string baseUrl = HttpContext.Request.Host.ToUriComponent();
            string swaggerUrl = "/swagger/shrtlnk_V1.json";
            return View("Documentation", protocol + baseUrl + swaggerUrl);
        }

        [HttpGet]
        public IActionResult Register()
        {
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
                    return View("Hardfall"); // todo: Make this better based on the error that is thrown
                }

                AccountHomeViewModel vm = new AccountHomeViewModel()
                {
                    Account = auth.CurrentUser,
                    Applications = apps
                };

                return View(vm);
            }
            return View("SignIn");
        }

        [HttpGet]
        public IActionResult SignOut()
        {
            auth.SignOut();
            return View("Index");
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
                    return View("UnknownVerification");
                }

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
                DeveloperAccountDTO account = auth.CurrentUser;
                return View(new EditAccountViewModel(account));
            }
            else
            {
                return View("SignIn");
            }
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
                return View("Hardfall");
            }
        }
    }
}