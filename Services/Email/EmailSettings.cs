using System;
namespace shrtlnk.Services.Email
{
    public class EmailSettings
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public string URL { get; set; }

        public int Port { get; set; }

        public bool EnableSSL { get; set; }
    }
}
