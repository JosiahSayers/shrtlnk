using System;
namespace shrtlnk.Models.SimpleError
{
    public class SimpleError
    {
        public string message { get; }

        public SimpleError(string message)
        {
            this.message = message;
        }
    }
}
