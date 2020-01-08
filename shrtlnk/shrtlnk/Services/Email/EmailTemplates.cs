using System.Net.Mail;
using shrtlnk.Models.Developer.Account;
using shrtlnk.Models.Developer.AccountVerification;

namespace shrtlnk.Services.Email
{
    public class EmailTemplates
    {
        private static string shrtlnkEmail = "shrtlnkdev@gmail.com";
        private static string shrtlnk = "shrtlnk";
        private static MailAddress shrtlnkMailAddress = new MailAddress(shrtlnkEmail, shrtlnk);

        public MailMessage VerificationEmail(DeveloperAccountDTO account, AccountVerificationDTO verification)
        {
            MailMessage msg = new MailMessage();
            msg.To.Add(new MailAddress(account.Email, account.FirstName));
            msg.From = shrtlnkMailAddress;
            msg.Subject = "Please verify your email address - shrtlnk";
            msg.Body = VerificationEmailBody(account.FirstName, verification.Id);
            msg.IsBodyHtml = true;
            return msg;
        }

        private string VerificationEmailBody(string firstName, string shrtlnkId)
        {
            string verificationUrl = "https://shrtlnk.dev/developer/verifyemail?verificationid=" + shrtlnkId;
            string body =
                "<h1>shrtlnk</h1>" +
                "<h3>Please verify your email address</h3>" +
                "<br>" +
                "<p>Hey there, " + firstName + "! Use the link below to verify your email:</p>" +
                "<br>" +
                @"<a href=""" + verificationUrl + @""">" + verificationUrl + "</a>";
            return body;
        }
    }
}
