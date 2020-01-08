using System.Net;
using System.Net.Mail;
using shrtlnk.Models.Developer.Account;
using shrtlnk.Models.Developer.AccountVerification;

namespace shrtlnk.Services.Email
{
    public class EmailService : IEmailService
    {
        private EmailTemplates templates = new EmailTemplates();
        private readonly EmailSettings emailSettings;

        public EmailService(EmailSettings emailSettings)
        {
            this.emailSettings = emailSettings;
        }

        public void SendVerificationEmail(DeveloperAccountDTO account, AccountVerificationDTO verification)
        {
            using (MailMessage msg = templates.VerificationEmail(account, verification))
            {
                SendMessage(msg);
            }
        }

        private void SendMessage(MailMessage msg)
        {
            using (var client = new SmtpClient(emailSettings.URL))
            {
                client.Port = emailSettings.Port;
                client.Credentials = new NetworkCredential(emailSettings.Username, emailSettings.Password);
                client.EnableSsl = emailSettings.EnableSSL;
                client.Send(msg);
            }
        }
    }
}
