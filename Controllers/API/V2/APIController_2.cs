using System;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Applications;
using shrtlnk.Models.DAL;
using shrtlnk.Models.Objects;
using shrtlnk.Models.SimpleError;
using shrtlnk.Services.API;
using shrtlnk.Services.Logger;

namespace shrtlnk.Controllers.API.V1
{
    [Route("api/v2/[action]")]
    [ApiController]
    public class APIController_2 : Controller
    {
        private readonly linksDAL _DAL;
        private readonly string header_apiKey = "api-key";
        private readonly ApiAuthorizationService apiAuth;
        private readonly IDeveloperApplications applications;
        private readonly ILogger logger;

        public APIController_2(linksDAL linksDAL, ApiAuthorizationService apiAuth, IDeveloperApplications developerApplications, ILogger logger)
        {
            _DAL = linksDAL;
            this.apiAuth = apiAuth;
            this.applications = developerApplications;
            this.logger = logger;
        }

        [HttpPost]
        public IActionResult Link(RedirectItem newLink)
        {

            string apiKey = HttpContext.Request.Headers[header_apiKey];

            logger.Info("API POST /link - Request using APY key " + apiKey, newLink);

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                var e = new SimpleError("API Key is missing");
                logger.Error("API POST /link", e);
                return BadRequest(e);
            }
            else if (string.IsNullOrWhiteSpace(newLink.URL))
            {
                var e = new SimpleError("url cannot be blank.");
                logger.Error("API POST /link", e);
                return BadRequest();
            }

            try
            {
                DeveloperApplicationDTO app = applications.GetByApiKey(apiKey);
                if (app != null)
                {
                    newLink.DateAdded = DateTime.Now;
                    newLink.TimesLoaded = 0;
                    newLink.CreatedByApplicationId = app.Id;
                    RedirectItem ri = _DAL.AddNewRedirectItem(newLink);

                    if (ri != null)
                    {
                        logger.Info("API POST /link - successfully created", ri);
                        return StatusCode(201, new ApiPostResponse(ri));
                    }
                    else
                    {
                        var e = new SimpleError("An error has occured, please try again");
                        logger.Error("API POST /link", e);
                        return StatusCode(500, e);
                    }
                }
                else
                {
                    var e = new SimpleError("Invalid API Key");
                    logger.Error("API POST /link", e);
                    return BadRequest(e);
                }
            }
            catch (Exception e)
            {
                if (e.GetType() == typeof(FormatException) && e.Message.Contains("is not a valid 24 digit hex string") ||
                    e.GetType() == typeof(InvalidOperationException) && e.Message.Contains("Sequence contains no elements"))
                {
                    logger.Error("API POST /link - Invalid API Key " + apiKey, e);
                    return BadRequest(new SimpleError("Invalid API Key"));
                }

                logger.Error("Unknown error occured", e);
                return StatusCode(500, new SimpleError("An error has occured, please try again"));
            }
        }
    }
}
