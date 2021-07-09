using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models;
using shrtlnk.Models.Applications;
using shrtlnk.Models.DAL;
using shrtlnk.Models.Objects;
using shrtlnk.Services.Logger;
using shrtlnk.Services.SafeBrowsingApi;

namespace shrtlnk.Controllers
{
    public class HomeController : Controller
    {
        private readonly linksDAL _DAL;
        private static readonly string _applicationId = "5ecc0250f5ec5e000524459d";
        private static readonly string _applicationApiKey = "KLcR+i29Jewi9HMTOotn+0Vl6LYsEeV67iNMtW1wDVw=";
        private readonly ILogger _logger;
        private readonly SafeBrowsingApi _sba;
        private readonly IDeveloperApplications _applications;

        public HomeController(linksDAL linksDAL, ILogger logger, SafeBrowsingApi sba, IDeveloperApplications applications)
        {
            _DAL = linksDAL;
            _logger = logger;
            _sba = sba;
            _applications = applications;
        }

        public IActionResult Index(RedirectItem input)
        {
            if (!string.IsNullOrWhiteSpace(input.URL) || !string.IsNullOrWhiteSpace(input.Key))
            {
                return View("redirect", input);
            }
            _logger.Info("Home page requested");
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
        public async Task<IActionResult> NewRedirectAdded(RedirectItem input)
        {
            bool isSafe = await _sba.CheckUrl(input.URL);
            if (!isSafe)
            {
                var app = _applications.GetByApiKey(_applicationApiKey);
                app.UnsafeURLSubmissions++;
                _applications.Update(app);
                _logger.Info("Unsafe link submitted through website", input);
                return View("Hardfall");
            }

            RedirectItem redirect = new RedirectItem
            {
                URL = input.URL,
                DateAdded = DateTime.Now,
                TimesLoaded = 0,
                CreatedByApplicationId = _applicationId
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
