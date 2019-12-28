using System;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Services.DAL.Developer;

namespace shrtlnk.Services.API
{
    public class ApiAuthorizationService
    {
        private readonly DeveloperApplicationsDBService applications;

        public ApiAuthorizationService(DeveloperApplicationsDBService applications)
        {
            this.applications = applications;
        }

        public bool ValidateApiKey(string key)
        {
            DeveloperApplicationDTO app = applications.GetByApiKey(key);
            return app != null;
        }
    }
}
