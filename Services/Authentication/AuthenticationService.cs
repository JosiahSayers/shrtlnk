using System;
using Microsoft.AspNetCore.Http;
using shrtlnk.Models.Developer.FormObjects;
using shrtlnk.Services.Exceptions;
using shrtlnk.Services.Email;
using shrtlnk.Models.Developer.Account;
using shrtlnk.Models.Developer.AccountVerification;

namespace shrtlnk.Services.Authentication
{
  public class AuthenticationService
  {
    private readonly PasswordService passwordService;
    private readonly IDeveloperAccountsService accountsService;
    private readonly IAccountVerificationService verificationService;
    private readonly IHttpContextAccessor contextAccessor;
    private readonly string sessionKey = "_sessionEmail";
    private readonly IEmailService emailService;

    public bool IsSignedIn
    {
      get
      {
        bool signedIn = !string.IsNullOrWhiteSpace(GetEmailFromSession());
        return signedIn;
      }
    }

    public DeveloperAccountDTO CurrentUser
    {
      get
      {
        DeveloperAccountDTO account;
        try
        {
          account = accountsService.Get(GetEmailFromSession());
        }
        catch
        {
          account = null;
        }
        return account;
      }
    }

    private HttpContext Context
    {
      get
      {
        return contextAccessor.HttpContext;
      }
    }

    public AuthenticationService(IDeveloperAccountsService accountsService,
        IHttpContextAccessor contextAccessor,
        IAccountVerificationService verificationService,
        IEmailService emailService)
    {
      passwordService = new PasswordService();
      this.accountsService = accountsService;
      this.contextAccessor = contextAccessor;
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
        string salt = passwordService.GetSalt(encryptedPassword);

        account = new DeveloperAccountDTO()
        {
          FirstName = registration.FirstName,
          LastName = registration.LastName,
          Email = registration.Email,
          AccountCreationDate = DateTime.Now,
          Password = encryptedPassword,
          Salt = salt,
          Role = "Developer",
          Verified = true
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
      catch (Exception e)
      {
        if (e.GetType() == typeof(MongoDB.Driver.MongoWriteException) &&
            e.Message.Contains("duplicate key error"))
        {
          throw new EmailAlreadyExistsError();
        }

        throw new DatabaseErrorException();
      }

      SetEmailToSession(account.Email);
      return account;
    }

    public void SignOut()
    {
      Context.Session.Remove(sessionKey);
    }

    public void VerifyAccount(string verificationId)
    {
      AccountVerificationDTO verification;
      DeveloperAccountDTO account;

      try
      {
        verification = verificationService.Get(verificationId);
      }
      catch (Exception e)
      {
        if (e.GetType() == typeof(FormatException) ||
            e.GetType() == typeof(InvalidOperationException))
        {
          throw new UnknownVerificationIdException();
        }
        else
        {
          throw new DatabaseErrorException();
        }
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

    public void UpdateAccount(DeveloperAccountDTO account)
    {
      try
      {
        account = FindUpdatedFields(account);
        accountsService.Update(account);
      }
      catch
      {
        throw new DatabaseErrorException();
      }
    }

    private void SetEmailToSession(string email)
    {
      Context.Session.SetString(sessionKey, email);
    }

    private string GetEmailFromSession()
    {
      if (Context != null)
      {
        if (Context.Session != null)
        {
          return Context.Session.GetString(sessionKey);
        }
      }
      return null;
    }

    private DeveloperAccountDTO FindUpdatedFields(DeveloperAccountDTO updates)
    {
      DeveloperAccountDTO updatedAccount = CurrentUser;

      if (!string.IsNullOrWhiteSpace(updates.FirstName))
      {
        updatedAccount.FirstName = updates.FirstName;
      }

      if (!string.IsNullOrWhiteSpace(updates.LastName))
      {
        updatedAccount.LastName = updates.LastName;
      }

      if (!string.IsNullOrWhiteSpace(updates.Role))
      {
        updatedAccount.Role = updates.Role;
      }

      return updatedAccount;
    }
  }
}
