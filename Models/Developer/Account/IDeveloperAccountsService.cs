namespace shrtlnk.Models.Developer.Account
{
    public interface IDeveloperAccountsService
    {
        DeveloperAccountDTO Get(string email);

        DeveloperAccountDTO Create(DeveloperAccountDTO account);

        void Update(DeveloperAccountDTO accountIn);

        void Remove(DeveloperAccountDTO accountIn);

        void Remove(string email);
    }
}
