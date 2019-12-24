using System;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;

namespace shrtlnk.Models.ViewModels
{
    public class EditAccountViewModel
    {
        public DeveloperAccountDTO Account { get; set; }

        public ChangePasswordForm ChangePasswordForm { get; set; }

        public EditAccountViewModel()
        {
            this.Account = new DeveloperAccountDTO();
            this.ChangePasswordForm = new ChangePasswordForm();
        }

        public EditAccountViewModel(DeveloperAccountDTO account)
        {
            this.Account = account;
            this.ChangePasswordForm = new ChangePasswordForm();
        }
    }
}
