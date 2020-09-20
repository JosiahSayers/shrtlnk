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
using shrtlnk.Services.Logger;

namespace shrtlnk.Controllers
{
    [AutoValidateAntiforgeryToken]
    public class DeveloperController : Controller
    {
        private readonly AuthenticationService auth;
        private readonly IDeveloperApplications applications;
        private readonly ILogger logger;
        private static readonly string sessionEmailVerified = "email_verified";

        public DeveloperController(AuthenticationService auth, IDeveloperApplications applications, ILogger logger)
        {
            this.auth = auth;
            this.applications = applications;
            this.logger = logger;
        }

        [HttpGet]
        public IActionResult Index()
        {
            logger.Info("Developer Portal: Home - Requested");
            ViewData["Title"] = "Developer Portal";
            return View();
        }

        [HttpGet]
        public IActionResult Documentation()
        {
            logger.Info("Developer Portal: Documentation - Requested");
            ViewData["Title"] = "Developer Documentation";
            string protocol = "https://";
            string baseUrl = HttpContext.Request.Host.ToUriComponent();
            string swaggerUrl = "/swagger/shrtlnk_V2.json";
            return View("Documentation", protocol + baseUrl + swaggerUrl);
        }

        [HttpGet]
        public IActionResult Register()
        {
            logger.Info("Developer Portal: Register - Requested");
            ViewData["Title"] = "Register";
            return View();
        }

        [HttpPost]
        public IActionResult Register(RegisterAccountForm registration)
        {
            logger.Info("Developer Portal: Register - Posted");
            try
            {
                if (ModelState.IsValid)
                {
                    DeveloperAccountDTO account = auth.RegisterUser(registration);
                    logger.Info("Developer Portal: Register - Posted - New User Created", account.ForLogging());
                    return RedirectToAction("AccountHome");
                }

                ViewBag.FormError = true;
                return View();
            }
            catch (Exception e)
            {
                logger.Error("Developer Portal: Regiester - Posted ERROR", e);
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
            logger.Info("Developer Portal: SignIn - Requested");
            ViewData["Title"] = "Sign In";
            ViewBag.EmailVerified |= HttpContext.Session.GetString(sessionEmailVerified) == "true";
            return View();
        }

        [HttpPost]
        public IActionResult SignIn(SignInForm signInForm)
        {
            logger.Info("Developer Portal: SignIn - Posted");
            try
            {
                DeveloperAccountDTO account = auth.AuthenticateUser(signInForm);
                logger.Info("Developer Portal: SignIn - Posted - Successfully Signed In", account.ForLogging());
                return RedirectToAction("AccountHome");
            }
            catch (Exception e)
            {
                logger.Info("Developer Portal: SignIn - Posted ERROR", e);
                return View();
            }
        }

        [HttpGet]
        public IActionResult AccountHome()
        {
            logger.Info("Developer Portal: AccountHome - Requested");
            if (auth.IsSignedIn)
            {
                DeveloperAccountDTO user;
                List<DeveloperApplicationDTO> apps;
                ViewBag.EmailVerified |= HttpContext.Session.GetString(sessionEmailVerified) == "true";
                try
                {
                    user = auth.CurrentUser;
                    logger.Info("Developer Portal: AccountHome - Requested - Account Info", user.ForLogging());
                    apps = applications.GetByDeveloper(user.Email);
                }
                catch (Exception e)
                {
                    logger.Error("Developer Portal: AccountHome - Requested ERROR", e);
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
            logger.Info("Developer Portal: SignOut - Requested");
            auth.SignOut();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public IActionResult VerifyEmail(string verificationId)
        {
            logger.Info("Developer Portal: VerifyEmail - Requested", verificationId);
            try
            {
                auth.VerifyAccount(verificationId);
            }
            catch (Exception e)
            {
                logger.Error("Developer Portal: VerifyEmail - Requested ERROR", e);
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
            logger.Info("Developer Portal: EditAccount - Requested");
            if (auth.IsSignedIn)
            {
                ViewData["Title"] = "Edit Account";
                DeveloperAccountDTO account = auth.CurrentUser;
                logger.Info("Developer Portal: EditAccount - Requested - Account Info", account.ForLogging());
                return View(new EditAccountViewModel(account));
            }
            logger.Info("Developer Portal: EditAccount - Requested - Not Signed In");
            return RedirectToAction("SignIn");
        }

        [HttpPost]
        public IActionResult EditAccount(EditAccountViewModel editedAccount)
        {
            logger.Info("Developer Portal: EditAccount - Posted", editedAccount.Account.ForLogging());
            try
            {
                auth.UpdateAccount(editedAccount.Account);
                return RedirectToAction("AccountHome");
            }
            catch (Exception e)
            {
                logger.Error("Developer Portal: EditAccount - Posted ERROR", e);
                ViewData["Title"] = "Error";
                return View("Hardfall");
            }
        }
    }
}