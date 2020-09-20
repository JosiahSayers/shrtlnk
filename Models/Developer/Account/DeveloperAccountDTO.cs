using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace shrtlnk.Models.Developer.Account
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

        public bool Verified { get; set; }

        public DeveloperAccountDTO ForLogging()
        {
            return new DeveloperAccountDTO
            {
                Email = Email,
                FirstName = FirstName,
                LastName = LastName,
                AccountCreationDate = AccountCreationDate,
                Role = Role
            };
        }
    }
}