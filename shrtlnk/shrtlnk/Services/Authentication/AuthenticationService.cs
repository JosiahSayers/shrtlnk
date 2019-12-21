using System;
using Microsoft.AspNetCore.Http;
using shrtlnk.Models.Developer.DTO;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Authentication.Exceptions;
using shrtlnk.Services.DAL.Developer;
using shrtlnk.Services.Email;

namespace shrtlnk.Services.Authentication
{
    public class AuthenticationService
    {
        private readonly PasswordService passwordService;
        private readonly DeveloperAccountsService accountsService;
        private readonly AccountVerificationService verificationService;
        private readonly HttpContext context;
        private readonly string sessionKey = "_sessionEmail";
        private readonly EmailService emailService;

        public bool IsSignedIn { get
            {
                bool signedIn = !String.IsNullOrWhiteSpace(GetEmailFromSession());
                return signedIn;
            }
        }

        public DeveloperAccountDTO CurrentUser { get
            {
                return accountsService.Get(GetEmailFromSession());
            }
        }

        public AuthenticationService(DeveloperAccountsService accountsService,
            IHttpContextAccessor accessor,
            AccountVerificationService verificationService,
            EmailService emailService)
        {
            passwordService = new PasswordService();
            this.accountsService = accountsService;
            context = accessor.HttpContext;
            this.verificationService = verificationService;
            this.emailService = emailService;
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

            SetEmailToSession(account.Email);
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
                    Password = encryptedPassword,
                    Role = "Developer"
                };
            }
            catch
            {
                throw new PasswordEncryptionException();
            }

            try
            {
                accountsService.Create(account);
                AccountVerificationDTO av = verificationService.GenerateVerificationCode(account.Email);
                emailService.SendVerificationEmail(account, av);
            }
            catch
            {
                throw new DatabaseErrorException();
            }

            SetEmailToSession(account.Email);
            return account;
        }

        public void SignOut()
        {
            context.Session.Remove(sessionKey);
        }

        public void VerifyAccount(string verificationId)
        {
            AccountVerificationDTO verification;
            DeveloperAccountDTO account;

            try
            {
                verification = verificationService.Get(verificationId);
            }
            catch
            {
                verification = null;
                throw new DatabaseErrorException();
            }

            if (verification != null)
            {
                try
                {
                    account = accountsService.Get(verification.Email);
                    account.Verified = true;
                    accountsService.Update(account);
                    verificationService.Remove(verification.Id);
                }
                catch
                {
                    throw new DatabaseErrorException();
                }
            }
        }

        private void SetEmailToSession(string email)
        {
            context.Session.SetString(sessionKey, email);
        }

        private string GetEmailFromSession()
        {
            return context.Session.GetString(sessionKey);
        }
    }
}
