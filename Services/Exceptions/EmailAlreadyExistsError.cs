using System;
using System.Runtime.Serialization;

namespace shrtlnk.Services.Exceptions
{
    [Serializable]
    internal class EmailAlreadyExistsError : Exception
    {
        public EmailAlreadyExistsError()
        {
        }

        public EmailAlreadyExistsError(string message) : base(message)
        {
        }

        public EmailAlreadyExistsError(string message, Exception innerException) : base(message, innerException)
        {
        }

        protected EmailAlreadyExistsError(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }
    }
}