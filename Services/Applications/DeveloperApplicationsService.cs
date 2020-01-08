using System;
using System.Security.Cryptography;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Models.Objects;
using shrtlnk.Services.Authentication;
using shrtlnk.Services.Exceptions;
using shrtlnk.Models.Applications;
using shrtlnk.Models.Developer.Account;

namespace shrtlnk.Services.Applications
{
    public class DeveloperApplicationsService
    {
        private readonly IDeveloperApplications applications;
        private readonly AuthenticationService auth;
        private readonly ApiInfo apiInfo;

        public DeveloperApplicationsService(
            IDeveloperApplications applications,
            AuthenticationService auth,
            ApiInfo apiInfo)
        {
            this.applications = applications;
            this.auth = auth;
            this.apiInfo = apiInfo;
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
                ApiKey = GenerateApiKey(),
                OriginalApiVersion = apiInfo.CurrentVersion,
                CurrentSetApiVersion = apiInfo.CurrentVersion
            };
            applications.Create(newApp);

            return newApp;
        }

        public DeveloperApplicationDTO GetApp(string id)
        {
            DeveloperApplicationDTO app;
            try
            {
                app = applications.Get(id);
            }
            catch
            {
                throw new DatabaseErrorException();
            }

            if (IsCurrentUserAppOwner(app))
            {
                return app;
            }
            else
            {
                throw new NotAppOwnerException();
            }
        }

        public void UpdateApp(DeveloperApplicationDTO updatedApp)
        {
            DeveloperApplicationDTO currentApp = applications.Get(updatedApp.Id);
            if (IsCurrentUserAppOwner(currentApp))
            {
                if (!string.IsNullOrWhiteSpace(updatedApp.Name))
                {
                    currentApp.Name = updatedApp.Name;
                }

                if (!string.IsNullOrWhiteSpace(updatedApp.Website))
                {
                    currentApp.Website = updatedApp.Website;
                }

                if (updatedApp.CurrentSetApiVersion > 0)
                {
                    currentApp.CurrentSetApiVersion = updatedApp.CurrentSetApiVersion;
                }

                applications.Update(currentApp);
            }
            else
            {
                throw new NotAppOwnerException();
            }
        }

        public void DeleteApp(string appId)
        {
            if (IsCurrentUserAppOwner(applications.Get(appId)))
            {
                applications.Remove(appId);
            }
            else
            {
                throw new NotAppOwnerException();
            }
        }

        private bool IsCurrentUserAppOwner(DeveloperApplicationDTO app)
        {
            try
            {
                DeveloperAccountDTO currentUser = auth.CurrentUser;
                return currentUser.Email == app.DeveloperId;
            }
            catch
            {
                throw new DatabaseErrorException();
            }
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
