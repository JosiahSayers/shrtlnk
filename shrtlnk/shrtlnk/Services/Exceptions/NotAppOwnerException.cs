using System;
using System.Runtime.Serialization;

namespace shrtlnk.Services.Exceptions
{
    [Serializable]
    internal class NotAppOwnerException : Exception
    {
        public NotAppOwnerException()
        {
        }

        public NotAppOwnerException(string message) : base(message)
        {
        }

        public NotAppOwnerException(string message, Exception innerException) : base(message, innerException)
        {
        }

        protected NotAppOwnerException(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }
    }
}