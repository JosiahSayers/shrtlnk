using MongoDB.Driver;
using System.Linq;
using shrtlnk.Models.Developer.DatabaseSettings;
using shrtlnk.Models.Developer.DTO;

namespace shrtlnk.Services.DAL.Developer
{
    public class AccountVerificationService
    {
        private readonly IMongoCollection<AccountVerificationDTO> _db;

        public AccountVerificationService(DatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);

            _db = database.GetCollection<AccountVerificationDTO>(settings.AccountVerificationCollectionName);
        }

        public AccountVerificationDTO GenerateVerificationCode(string email)
        {
            AccountVerificationDTO av = new AccountVerificationDTO()
            {
                Email = email
            };
            _db.InsertOne(av);
            av = Get(av.Email);
            return av;
        }

        public AccountVerificationDTO Get(string id) =>
            _db.Find(av => av.Id == id).First();

        public void Remove(string id) =>
            _db.DeleteOne(av => av.Id == id);
    }
}