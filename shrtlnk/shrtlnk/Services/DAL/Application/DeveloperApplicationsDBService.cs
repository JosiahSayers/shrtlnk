using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using shrtlnk.Models.Developer.DatabaseSettings;
using shrtlnk.Models.Developer.DTO;

namespace shrtlnk.Services.DAL.Developer
{
    public class DeveloperApplicationsDBService
    {
        private readonly IMongoCollection<DeveloperApplicationDTO> _db;

        public DeveloperApplicationsDBService(DatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);

            _db = database.GetCollection<DeveloperApplicationDTO>(settings.DeveloperApplicationsCollectionName);
        }

        public DeveloperApplicationDTO Get(string appId) =>
            _db.Find(app => app.Id == appId).FirstOrDefault();

        public List<DeveloperApplicationDTO> GetByDeveloper(string developerId) =>
            _db.Find(app => app.DeveloperId == developerId).ToList();

        public DeveloperApplicationDTO Create(DeveloperApplicationDTO account)
        {
            _db.InsertOne(account);
            return account;
        }

        public void Update(DeveloperApplicationDTO appIn) =>
            _db.ReplaceOne(app => app.Id == appIn.Id, appIn);

        public void Remove(DeveloperApplicationDTO appIn) =>
            _db.DeleteOne(app => app.Id == appIn.Id);

        public void Remove(string appId) =>
            _db.DeleteOne(app => app.Id == appId);

        public bool ApiKeyExists(string apiKey) =>
            _db.Find(app => app.ApiKey == apiKey).ToList().Count > 0;
    }
}