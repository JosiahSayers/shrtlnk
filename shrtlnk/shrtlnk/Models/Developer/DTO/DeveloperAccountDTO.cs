using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace shrtlnk.Models.Developer.DTO
{
    public class DeveloperAccountDTO
    {
        [BsonId]
        public string Email { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Password { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime AccountCreationDate { get; set; }

        public string Role { get; set; }

        public bool IsAdmin { get
            {
                return Role == "admin";
            }
        }
    }
}