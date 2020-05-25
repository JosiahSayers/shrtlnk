using System;
using System.Data.SqlClient;

namespace shrtlnk.Models.Objects
{
    public class RedirectItem
    {
        public int Id { get; set; }

        public string Key { get; set; }

        public string URL { get; set; }

        public DateTime DateAdded { get; set; }

        public int TimesLoaded { get; set; }

        public string CreatedByApplicationId { get; set; }

        public RedirectItem() { }

        public RedirectItem(SqlDataReader reader)
        {
            this.Id = Convert.ToInt32(reader["Id"]);
            this.Key = Convert.ToString(reader["url_key"]);
            this.URL = Convert.ToString(reader["url"]);
            this.DateAdded = Convert.ToDateTime(reader["date_added"]);
            this.TimesLoaded = Convert.ToInt32(reader["times_loaded"]);
            this.CreatedByApplicationId = Convert.ToString(reader["application_id"]);
        }
    }
}
