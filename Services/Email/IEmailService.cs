using shrtlnk.Models.Developer.Account;
using shrtlnk.Models.Developer.AccountVerification;

namespace shrtlnk.Services.Email
{
    public interface IEmailService
    {
        void SendVerificationEmail(DeveloperAccountDTO account, AccountVerificationDTO verification);
    }
}
