using System.Collections.Generic;

namespace shrtlnk.Models.Applications
{
    public interface IDeveloperApplications
    {
         DeveloperApplicationDTO Get(string appId);

         List<DeveloperApplicationDTO> GetByDeveloper(string developerId);

         DeveloperApplicationDTO GetByApiKey(string key);

         DeveloperApplicationDTO Create(DeveloperApplicationDTO account);

         void Update(DeveloperApplicationDTO appIn);

         void Remove(DeveloperApplicationDTO appIn);

         void Remove(string appId);

         bool ApiKeyExists(string apiKey);
    }
}
