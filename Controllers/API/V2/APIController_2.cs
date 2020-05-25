using System;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.Applications;
using shrtlnk.Models.DAL;
using shrtlnk.Models.Objects;
using shrtlnk.Models.SimpleError;
using shrtlnk.Services.API;

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

        public APIController_2(linksDAL linksDAL, ApiAuthorizationService apiAuth, IDeveloperApplications developerApplications)
        {
            _DAL = linksDAL;
            this.apiAuth = apiAuth;
            this.applications = developerApplications;
        }

        [HttpPost]
        public IActionResult Link(RedirectItem newLink)
        {
            string apiKey = HttpContext.Request.Headers[header_apiKey];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return BadRequest(new SimpleError("API Key is missing"));
            }
            else if (string.IsNullOrWhiteSpace(newLink.URL))
            {
                return BadRequest(new SimpleError("url cannot be blank."));
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
                        return StatusCode(201, new ApiPostResponse(ri));
                    }
                    else
                    {
                        return StatusCode(500, new SimpleError("An error has occured, please try again"));
                    }
                }
                else
                {
                    return BadRequest(new SimpleError("Invalid API Key"));
                }
            }
            catch (Exception e)
            {
                if (e.GetType() == typeof(FormatException) && e.Message.Contains("is not a valid 24 digit hex string") ||
                    e.GetType() == typeof(InvalidOperationException) && e.Message.Contains("Sequence contains no elements"))
                {
                    return BadRequest(new SimpleError("Invalid API Key"));
                }
                return StatusCode(500, new SimpleError("An error has occured, please try again"));
            }
        }
    }
}
