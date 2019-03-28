﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GcpShrtlnk.Models;
using GcpShrtlnk.Models.DAL;
using GcpShrtlnk.Models.Objects;

namespace GcpShrtlnk.Controllers
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

        public IActionResult L(string id)
        {
            RedirectItem input = new RedirectItem();

            input.Key = RouteData.Values["url"].ToString();

            input = _DAL.GetRedirectItem(input);

            if (!String.IsNullOrWhiteSpace(input.URL))
            {
                return View("Redirect", input);
            }
            else
            {
                return View("LinkNotFound", input);
            }
        }

        [HttpPost]
        public IActionResult NewRedirectAdded(RedirectItem input)
        {
            RedirectItem redirect = new RedirectItem();
            redirect.URL = input.URL;

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
