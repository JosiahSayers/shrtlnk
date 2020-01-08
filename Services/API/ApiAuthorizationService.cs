using shrtlnk.Models.Applications;

namespace shrtlnk.Services.API
{
    public class ApiAuthorizationService
    {
        private readonly IDeveloperApplications applications;

        public ApiAuthorizationService(IDeveloperApplications applications)
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
