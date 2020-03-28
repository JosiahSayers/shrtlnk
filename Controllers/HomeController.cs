using System;
using System.Diagnostics;
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
            if (!string.IsNullOrWhiteSpace(input.URL) || !string.IsNullOrWhiteSpace(input.Key))
            {
                return View("redirect", input);
            }
            return View();
        }

        public IActionResult Link()
        {
            RedirectItem input = new RedirectItem
            {
                Key = RouteData.Values["url"].ToString()
            };

            if (_DAL.IsValidLinkCode(input.Key))
            {
                input = _DAL.GetRedirectItem(input);

                if (!string.IsNullOrEmpty(input.URL))
                {
                    return RedirectPermanent(input.URL);
                }
            }
            return View("LinkNotFound", input);
        }

        [HttpPost]
        public IActionResult NewRedirectAdded(RedirectItem input)
        {
            RedirectItem redirect = new RedirectItem
            {
                URL = input.URL,
                DateAdded = DateTime.Now,
                TimesLoaded = 0
            };

            redirect = _DAL.AddNewRedirectItem(redirect);

            return View(redirect);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
