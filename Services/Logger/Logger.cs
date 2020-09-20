using System;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace shrtlnk.Services.Logger
{
    public class Logger : ILogger
    {
        private readonly HttpClient http;
        private readonly LoggerSettings loggerSettings;

        public Logger(IHttpClientFactory httpFactory, LoggerSettings settings)
        {
            http = httpFactory.CreateClient();
            loggerSettings = settings;
        }

        public void Info(string message, object json)
        {
            LogRequest payload = new LogRequest(message, json, LogLevel.Info);
            SendRequest(payload);
        }

        public void Info(string message)
        {
            LogRequest payload = new LogRequest(message, LogLevel.Info);
            SendRequest(payload);
        }

        public void Error(string message, object json)
        {
            LogRequest payload = new LogRequest(message, json, LogLevel.Error);
            SendRequest(payload);
        }

        private async void SendRequest(LogRequest request)
        {
            try
            {
                string stringifiedPayload = JsonConvert.SerializeObject(request);
                var httpRequest = new HttpRequestMessage
                {
                    Content = new StringContent(stringifiedPayload, Encoding.UTF8, "application/json"),
                    Headers =
                    {
                        { "clientId", loggerSettings.ClientId }
                    },
                    RequestUri = new Uri(loggerSettings.Url),
                    Method = HttpMethod.Post
                };
                var response = await http.SendAsync(httpRequest);
            }
            catch (Exception e)
            {
                Console.Error.WriteLine(e);
            }

        }
    }
}
