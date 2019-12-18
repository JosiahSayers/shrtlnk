using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Authentication.Exceptions;
using shrtlnk.Services.DAL.Developer;

namespace shrtlnk.Controllers
{
    public class DeveloperController : Controller
    {
        private readonly DeveloperAccountsService accounts;
        private readonly AuthenticationService auth;
        private readonly string sessionEmail = "_Email";

        public DeveloperController(DeveloperAccountsService accounts, AuthenticationService auth)
        {
            this.accounts = accounts;
            this.auth = auth;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Documentation()
        {
            return View();
        }

        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(RegisterAccountForm registration)
        {
            try
            {
                DeveloperAccountDTO account = auth.RegisterUser(registration);
                HttpContext.Session.SetString(sessionEmail, account.Email);
                return StatusCode(201, account);
            }
            catch
            {
                return StatusCode(500);
            }
        }

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

        [HttpGet]
        public IActionResult SessionEmail()
        {
            return StatusCode(200, new TestObject(HttpContext.Session.GetString(sessionEmail)));
        }
    }
}

public class TestObject
{
    public string Email { get; set; }

    public TestObject(string email)
    {
        Email = email;
    }
}