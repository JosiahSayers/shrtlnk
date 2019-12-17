using MongoDB.Bson.Serialization.Attributes;

namespace shrtlnk.Models.Developer.DTO
{
    public class DeveloperAccountDTO
    {
        [BsonId]
        public string Email { get; set; }

        public string Name { get; set; }

        public string Password { get; set; }
    }
}