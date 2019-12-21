using shrtlnk.Models.Developer.DTO;
using System.Net;
using System.Net.Mail;

namespace shrtlnk.Services.Email
{
    public class EmailService
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
            using (var client = new SmtpClient("smtp.gmail.com"))
            {
                client.Port = 587;
                client.Credentials = new NetworkCredential(emailSettings.Username, emailSettings.Password);
                client.EnableSsl = true;
                client.Send(msg);
            }
        }
    }
}
