using System;
using System.Security.Cryptography;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Models.Objects;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.DAL.Developer;

namespace shrtlnk.Services.Applications
{
    public class DeveloperApplicationsService
    {
        private readonly DeveloperApplicationsDBService applications;
        private readonly AuthenticationService auth;

        public DeveloperApplicationsService(DeveloperApplicationsDBService applications, AuthenticationService auth)
        {
            this.applications = applications;
            this.auth = auth;
        }

        public DeveloperApplicationDTO AddNew(AddNewApplicationForm form)
        {
            DeveloperApplicationDTO newApp = new DeveloperApplicationDTO()
            {
                Name = form.Name,
                Website = form.Website,
                DeveloperId = auth.CurrentUser.Email,
                Status = ApplicationStatus.Valid,
                CreationDate = DateTime.Now,
                ApiKey = GenerateApiKey()
            };
            applications.Create(newApp);

            return newApp;
        }

        private string GenerateApiKey()
        {
            string apiKey;
            do
            {
                byte[] key = new byte[128 / 4];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(key);
                }

                apiKey = Convert.ToBase64String(key);
            }
            while (applications.ApiKeyExists(apiKey));

            return apiKey;
        }
    }
}
