using System;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Authentication.Exceptions;
using shrtlnk.Services.DAL.Developer;

namespace shrtlnk.Services.Authentication
{
    public class AuthenticationService
    {
        private readonly PasswordService passwordService;
        private readonly DeveloperAccountsService accountsService;

        public AuthenticationService(DeveloperAccountsService accountsService)
        {
            passwordService = new PasswordService();
            this.accountsService = accountsService;
        }

        public DeveloperAccountDTO AuthenticateUser(SignInForm signInForm)
        {
            DeveloperAccountDTO account = accountsService.Get(signInForm.Email);

            if (account == null || string.IsNullOrEmpty(account.Email))
            {
                throw new AccountNotFoundException();
            }

            bool correctPassword = passwordService.VerifyPassword(account.Password, signInForm.Password);

            if (!correctPassword)
            {
                throw new IncorrectPasswordException();
            }

            return account;
        }

        public DeveloperAccountDTO RegisterUser(RegisterAccountForm registration)
        {
            DeveloperAccountDTO account;

            try
            {
                string encryptedPassword = passwordService.HashPassword(registration.Password);

                account = new DeveloperAccountDTO()
                {
                    FirstName = registration.FirstName,
                    LastName = registration.LastName,
                    Email = registration.Email,
                    AccountCreationDate = DateTime.Now,
                    Password = encryptedPassword
                };
            }
            catch
            {
                throw new PasswordEncryptionException();
            }

            try
            {
                accountsService.Create(account);
            }
            catch
            {
                throw new DatabaseErrorException();
            }

            return account;
        }
    }
}
