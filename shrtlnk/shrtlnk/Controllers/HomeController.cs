using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models;
using shrtlnk.Models.DAL;
using shrtlnk.Models.Objects;

namespace shrtlnk.Controllers
{
    public class HomeController : Controller
    {
        private readonly linksDAL _DAL;

        public HomeController(linksDAL linksDAL)
        {
            _DAL = linksDAL;
        }

        public IActionResult Index(RedirectItem input)
        {
            if (!String.IsNullOrWhiteSpace(input.URL) || !String.IsNullOrWhiteSpace(input.Key))
            {
                return View("redirect", input);
            }
            else
            {
                return View();
            }
        }

        public IActionResult redirect(RedirectItem input)
        {
            if (_DAL.CheckIfItemExistsInDatabase(input))
            {
                input = _DAL.GetRedirectItem(input);
                return View("redirect", input);
            }
            else
            {
                RedirectItem redirect = new RedirectItem();
                redirect.Key = input.Key;

                redirect = _DAL.AddNewRedirectItem(redirect);

                return View("NewRedirectAdded", redirect);
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
