using System.ComponentModel.DataAnnotations;

namespace shrtlnk.Models.Developer.FormObjects
{
    public class SignInForm
    {
        [DataType(DataType.EmailAddress)]
        [Required]
        public string Email { get; set; }

        [DataType(DataType.Password)]
        [Required]
        public string Password { get; set; }   
    }
}
