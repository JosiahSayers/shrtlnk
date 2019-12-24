using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using shrtlnk.Models.Developer.DatabaseSettings;
using shrtlnk.Models.Developer.DTO;
using MongoDB.Bson;

namespace shrtlnk.Services.DAL.Developer
{
    public class DeveloperAccountsService
    {
        private readonly IMongoCollection<DeveloperAccountDTO> _db;

        public DeveloperAccountsService(DatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);

            _db = database.GetCollection<DeveloperAccountDTO>(settings.DeveloperAccountsCollectionName);
        }

        public DeveloperAccountDTO Get(string email) =>
            _db.Find<DeveloperAccountDTO>(account => account.Email == email).FirstOrDefault();

        public DeveloperAccountDTO Create(DeveloperAccountDTO account)
        {
            _db.InsertOne(account);
            return account;
        }

        public void Update(DeveloperAccountDTO accountIn) =>
            _db.ReplaceOne(account => account.Email == accountIn.Email, accountIn);

        public void Remove(DeveloperAccountDTO accountIn) =>
            _db.DeleteOne(account => account.Email == accountIn.Email);

        public void Remove(string email) =>
            _db.DeleteOne(account => account.Email == email);
    }
}