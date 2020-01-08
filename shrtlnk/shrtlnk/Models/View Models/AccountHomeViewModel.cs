using System.Collections.Generic;
using shrtlnk.Models.Applications;
using shrtlnk.Models.Developer.Account;

namespace shrtlnk.Models.ViewModels
{
    public class AccountHomeViewModel
    {
        public DeveloperAccountDTO Account { get; set; }

        public List<DeveloperApplicationDTO> Applications { get; set; }
    }
}
