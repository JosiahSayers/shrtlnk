using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.DAL.Developer;

namespace shrtlnk.Controllers
{
    public class DeveloperController : Controller
    {
        private readonly DeveloperAccountsService accounts;
        private readonly AuthenticationService auth;

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
        public IActionResult Register(DeveloperAccountDTO newAccount)
        {
            newAccount.Password = auth.HashPassword(newAccount.Password);
            accounts.Create(newAccount);
            return StatusCode(201);
        }

        [HttpPost]
        public IActionResult SignIn(DeveloperAccountDTO signInData)
        {
            DeveloperAccountDTO accountFromDB = accounts.Get(signInData.Email);

            if (accountFromDB != null)
            {
                if (auth.VerifyPassword(accountFromDB.Password, signInData.Password))
                {
                    return StatusCode(200);
                }
                else
                {
                    return StatusCode(403);
                }
            }
            else
            {
                return StatusCode(500);
            }
        }
    }
}