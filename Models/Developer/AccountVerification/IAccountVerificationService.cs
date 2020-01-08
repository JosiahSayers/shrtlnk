namespace shrtlnk.Models.Developer.AccountVerification
{
    public interface IAccountVerificationService
    {
        AccountVerificationDTO GenerateVerificationCode(string email);

        AccountVerificationDTO Get(string id);

        AccountVerificationDTO GetByEmail(string email);

        void Remove(string id);
    }
}
