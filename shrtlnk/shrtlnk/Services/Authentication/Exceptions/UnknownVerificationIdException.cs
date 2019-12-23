using System;
using System.Runtime.Serialization;

namespace shrtlnk.Services.Authentication.Exceptions
{
    [Serializable]
    internal class UnknownVerificationIdException : Exception
    {
        public UnknownVerificationIdException()
        {
        }

        public UnknownVerificationIdException(string message) : base(message)
        {
        }

        public UnknownVerificationIdException(string message, Exception innerException) : base(message, innerException)
        {
        }

        protected UnknownVerificationIdException(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }
    }
}