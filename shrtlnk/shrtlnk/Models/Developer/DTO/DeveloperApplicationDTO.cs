using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace shrtlnk.Models.Developer.DTO
{
    public class DeveloperApplicationDTO
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Name { get; set; }

        public string URL { get; set; }

        public string Type { get; set; }

        public string DeveloperId { get; set; }

        public string ApiKey { get; set; }
    }
}