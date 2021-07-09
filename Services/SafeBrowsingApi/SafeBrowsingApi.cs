using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using shrtlnk.Models.ApiKeys;

namespace shrtlnk.Services.SafeBrowsingApi
{
    public class SafeBrowsingApi
    {
        private readonly HttpClient http;

        private string url = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=";

        public SafeBrowsingApi(ApiKeys apiKeys, IHttpClientFactory httpFactory)
        {
            http = httpFactory.CreateClient();
            url += apiKeys.SafeBrowsingApi;
        }

        public async Task<bool> CheckUrl(string url)
        {
            Request request = new Request(url);
            Response response = await SendRequest(request);
            return response.matches == null;
        }

        private async Task<Response> SendRequest(Request request)
        {
            try
            {
                string stringifiedPayload = JsonConvert.SerializeObject(request);
                var httpRequest = new HttpRequestMessage
                {
                    Content = new StringContent(stringifiedPayload, Encoding.UTF8, "application/json"),
                    RequestUri = new Uri(url),
                    Method = HttpMethod.Post
                };
                var response = await http.SendAsync(httpRequest);
                return JsonConvert.DeserializeObject<Response>(await response.Content.ReadAsStringAsync());
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("Failed to send request", e);
                return new Response();
            }
        }
    }

    class Request
    {
        public Client client = new Client();
        public ThreatInfo threatInfo;

        public Request(string url)
        {
            threatInfo = new ThreatInfo(url);
        }
    }

    class Client
    {
        public string clientId = "shrtlnk - Josiah Sayers - shrtlnk.dev";
        public string clientVersion = "1.0.0";
    }

    class ThreatInfo
    {
        public string[] threatTypes = new string[]
        {
            "THREAT_TYPE_UNSPECIFIED",
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
        };
        public string[] platformTypes = new string[]
        {
            "ANY_PLATFORM"
        };
        public string[] threatEntryTypes = new string[]
        {
            "THREAT_ENTRY_TYPE_UNSPECIFIED",
            "URL"
        };
        public ThreatEntry[] threatEntries = new ThreatEntry[1];

        public ThreatInfo(string url)
        {
            threatEntries[0] = new ThreatEntry(url);
        }
    }

    class ThreatEntry
    {
        public string url;

        public ThreatEntry(string url)
        {
            this.url = url;
        }
    }

    class Response
    {
        public Array matches { get; set; }
    }
}
