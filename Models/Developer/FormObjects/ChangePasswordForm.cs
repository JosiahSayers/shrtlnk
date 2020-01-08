using System.ComponentModel.DataAnnotations;

namespace shrtlnk.Models.Developer.FormObjects
{
    public class ChangePasswordForm
    {
        [DataType(DataType.Password)]
        [Display(Name = "Current Password")]
        [Required]
        public string CurrentPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "New Password")]
        [Required]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        [Compare("NewPassword")]
        [Required]
        public string ConfirmNewPassword { get; set; }
    }
}
