using System;
using System.Runtime.Serialization;

namespace shrtlnk.Services.Authentication.Exceptions
{
    [Serializable]
    internal class PasswordEncryptionException : Exception
    {
        public PasswordEncryptionException()
        {
        }

        public PasswordEncryptionException(string message) : base(message)
        {
        }

        public PasswordEncryptionException(string message, Exception innerException) : base(message, innerException)
        {
        }

        protected PasswordEncryptionException(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }
    }
}