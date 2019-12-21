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
            return View();
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
                else
                {
                    return View();
                }
            }
            catch
            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult SignIn()
        {
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
                if (e.GetType() == new IncorrectPasswordException().GetType() ||
                    e.GetType() == new AccountNotFoundException().GetType())
                {
                    // Add logging
                }
                return View();
            }
        }

        public IActionResult AccountHome()
        {
            if (auth.IsSignedIn)
            {
                return View(auth.CurrentUser);
            }
            else
            {
                return View("SignIn");
            }
        }

        public IActionResult SignOut()
        {
            auth.SignOut();
            return View("Index");
        }

        public IActionResult SignedIn()
        {
            bool signedIn = auth.IsSignedIn;
            return signedIn ? Ok() : StatusCode(401);
        }

        public IActionResult VerifyEmail(string verification)
        {
            try
            {
                auth.VerifyAccount(verification);
            }
            catch
            {
                return View("Hardfall");
            }

            return RedirectToAction("AccountHome");
        }
    }
}