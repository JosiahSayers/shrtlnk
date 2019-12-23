using System;
using Microsoft.AspNetCore.Mvc;
using shrtlnk.Models.DAL;
using shrtlnk.Models.Objects;
using shrtlnk.Models.SimpleError;

namespace shrtlnk.Controllers.API.V1
{
    [Route("api/v1/[action]")]
    [ApiController]
    public class APIController : Controller
    {

        private readonly linksDAL _DAL;

        public APIController(linksDAL linksDAL)
        {
            _DAL = linksDAL;
        }

        [HttpPost]
        public IActionResult Link(RedirectItem newLink)
        {
            if (string.IsNullOrWhiteSpace(newLink.URL))
            {
                return BadRequest(new SimpleError("url cannot be blank."));
            }

            newLink.DateAdded = DateTime.Now;
            newLink.TimesLoaded = 0;
            RedirectItem ri = _DAL.AddNewRedirectItem(newLink);

            if (ri != null)
            {
                return StatusCode(201, new ApiPostResponse(ri));
            }
            else
            {
                return StatusCode(500, new SimpleError("A database error has occured, please try again"));
            }
        }
    }
}
