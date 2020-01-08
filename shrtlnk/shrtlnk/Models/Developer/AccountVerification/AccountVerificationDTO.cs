using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace shrtlnk.Models.Developer.AccountVerification
{
    public class AccountVerificationDTO
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Email { get; set; }
    }
}
