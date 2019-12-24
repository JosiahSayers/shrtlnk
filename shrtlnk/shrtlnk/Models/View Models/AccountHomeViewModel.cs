using System;
using System.Collections.Generic;
using shrtlnk.Models.Developer.DTO;

namespace shrtlnk.Models.ViewModels
{
    public class AccountHomeViewModel
    {
        public DeveloperAccountDTO Account { get; set; }

        public List<DeveloperApplicationDTO> Applications { get; set; }
    }
}
