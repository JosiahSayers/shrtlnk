using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Authentication.Exceptions;

namespace shrtlnk.Controllers
{
    [AutoValidateAntiforgeryToken]
    public class DeveloperController : Controller
    {
        private readonly AuthenticationService auth;
        private static readonly string sessionEmailVerified = "email_verified";

        public DeveloperController(AuthenticationService auth)
        {
            this.auth = auth;
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
                ViewBag.EmailVerified |= HttpContext.Session.GetString(sessionEmailVerified) == "true";
                return View(auth.CurrentUser);
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

        public IActionResult SignedIn()
        {
            bool signedIn = auth.IsSignedIn;
            return signedIn ? Ok() : StatusCode(401);
        }
    }
}