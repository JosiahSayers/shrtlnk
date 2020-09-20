using System;
namespace shrtlnk.Services.Logger
{
    public interface ILogger
    {
        void Info(string message, object json);
        void Info(string message);

        void Error(string message, object json);
    }
}
