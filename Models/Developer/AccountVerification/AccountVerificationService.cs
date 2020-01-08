using MongoDB.Driver;
using System.Linq;
using shrtlnk.Models.DatabaseSettings;

namespace shrtlnk.Models.Developer.AccountVerification
{
    public class AccountVerificationService : IAccountVerificationService
    {
        private readonly IMongoCollection<AccountVerificationDTO> _db;

        public AccountVerificationService(DbSettings settings)
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
            av = GetByEmail(av.Email);
            return av;
        }

        public AccountVerificationDTO Get(string id) =>
            _db.Find(av => av.Id == id).First();

        public AccountVerificationDTO GetByEmail(string email) =>
            _db.Find(av => av.Email == email).First();

        public void Remove(string id) =>
            _db.DeleteOne(av => av.Id == id);
    }
}