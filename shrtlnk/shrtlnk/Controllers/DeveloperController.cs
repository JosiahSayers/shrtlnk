using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Authentication.Exceptions;

namespace shrtlnk.Controllers
{
    public class DeveloperController : Controller
    {
        private readonly AuthenticationService auth;
        private readonly string sessionEmail = "_Email";

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

        [ValidateAntiForgeryToken]
        [HttpPost]
        public IActionResult Register(RegisterAccountForm registration)
        {
            try
            {
                DeveloperAccountDTO account = auth.RegisterUser(registration);
                HttpContext.Session.SetString(sessionEmail, account.Email);
                return StatusCode(201);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [HttpGet]
        public IActionResult SignIn()
        {
            return View();
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public IActionResult SignIn(SignInForm signInForm)
        {
            try
            {
                DeveloperAccountDTO account = auth.AuthenticateUser(signInForm);
                HttpContext.Session.SetString(sessionEmail, account.Email);
                return StatusCode(200);
            }
            catch (Exception e)
            {
                if (e.GetType() == new IncorrectPasswordException().GetType() ||
                    e.GetType() == new AccountNotFoundException().GetType())
                {
                    return Unauthorized();
                }
                else
                {
                    return StatusCode(500);
                }
            }
        }
    }
}