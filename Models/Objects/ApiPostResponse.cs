using System;
namespace shrtlnk.Models.Objects
{
    public class ApiPostResponse
    {
        public string url { get; }
        public string key { get; }
        public string shrtlnk { get; }

        public ApiPostResponse(RedirectItem ri)
        {
            this.url = ri.URL;
            this.key = ri.Key;
            this.shrtlnk = "https://shrtlnk.dev/" + ri.Key;
        }
    }
}
