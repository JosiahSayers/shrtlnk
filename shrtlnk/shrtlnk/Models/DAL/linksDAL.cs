using shrtlnk.Models.Objects;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace shrtlnk.Models.DAL
{
    public class linksDAL
    {
        private readonly string _connectionString;
        private readonly string _SQL_CheckIfUrlExistsInDatabase = "SELECT * FROM links WHERE url = @url;";
        private readonly string _SQL_CheckIfKeyExistsInDatabase = "SELECT * FROM links WHERE key = @key;";
        private readonly string _SQL_GetRedirectItem = "SELECT * FROM links WHERE key = @key;";

        public linksDAL(string connectionString)
        {
            _connectionString = connectionString;
        }

        public RedirectItem AddNewRedirectItem(RedirectItem input)
        {
            RedirectItem output = new RedirectItem();
            //TODO: Implement AddNewRedirectItem
            return output;
        }

        public RedirectItem GetRedirectItem(RedirectItem input)
        {
            RedirectItem output = new RedirectItem();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(_SQL_GetRedirectItem, conn);
                cmd.Parameters.AddWithValue("@key", input.Key);

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    output.Id = Convert.ToInt32(reader["Id"]);
                    output.Key = Convert.ToString(reader["key"]);
                    output.URL = Convert.ToString(reader["url"]);
                }
            }
            return output;
        }

        public bool CheckIfUrlExistsInDatabase(RedirectItem input)
        {
            bool output = false;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(_SQL_CheckIfUrlExistsInDatabase, conn);
                cmd.Parameters.AddWithValue("@url", input.URL);

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    RedirectItem ri = new RedirectItem()
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Key = Convert.ToString(reader["key"]),
                        URL = Convert.ToString(reader["url"])
                    };

                    if (!String.IsNullOrWhiteSpace(ri.Id.ToString()) && !String.IsNullOrWhiteSpace(ri.Key) && !String.IsNullOrWhiteSpace(ri.URL))
                    {
                        output = true;
                    }
                }
            }
            return output;
        }

        public bool CheckIfKeyExistsInDatabase(RedirectItem input)
        {
            bool output = false;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(_SQL_CheckIfUrlExistsInDatabase, conn);
                cmd.Parameters.AddWithValue("@key", input.Key);

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    RedirectItem ri = new RedirectItem()
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Key = Convert.ToString(reader["key"]),
                        URL = Convert.ToString(reader["url"])
                    };

                    if (!String.IsNullOrWhiteSpace(ri.Id.ToString()) && !String.IsNullOrWhiteSpace(ri.Key) && !String.IsNullOrWhiteSpace(ri.URL))
                    {
                        output = true;
                    }
                }
            }
            return output;
        }
    }
}
