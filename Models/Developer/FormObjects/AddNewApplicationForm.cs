using System.ComponentModel.DataAnnotations;

namespace shrtlnk.Models.Developer.FormObjects
{
    public class AddNewApplicationForm
    {
        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Application Name")]
        public string Name { get; set; }

        [DataType(DataType.Url)]
        [Display(Name = "URL of application. (If this is a mobile app, put the URL to the app store page if it is available. Otherwise, leave blank for now and fill in later.)")]
        public string Website { get; set; }
    }
}
