using System;
namespace shrtlnk.Services.Logger
{
    public class LogRequest
    {
        public string message { get; }
        public object json { get; }
        public string level { get; }

        public LogRequest(string message, object json, string level)
        {
            this.message = message;
            this.json = json;
            this.level = level;
        }

        public LogRequest(string message, string level)
        {
            this.message = message;
            this.level = level;
        }
    }

    public static class LogLevel
    {
        public static string Debug = "debug";
        public static string Info = "info";
        public static string Warn = "warn";
        public static string Error = "error";
        public static string Fatal = "fatal";
        public static string Trace = "trace";
    }
}
