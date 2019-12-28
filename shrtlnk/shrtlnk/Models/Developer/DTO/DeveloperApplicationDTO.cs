using System;
using System.ComponentModel.DataAnnotations;
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

        public string Website { get; set; }

        public string DeveloperId { get; set; }

        public string ApiKey { get; set; }

        public string Status { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime CreationDate { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime DeletionDate { get; set; }

        public string DeleteReason { get; set; }

        public string DeletedByAccountId { get; set; }

        public int LastUsedApiVersion { get; set; }

        public int OriginalApiVersion { get; set; }

        [Display(Name = "API Version your app is currently consuming")]
        public int CurrentSetApiVersion { get; set; }
    }
}