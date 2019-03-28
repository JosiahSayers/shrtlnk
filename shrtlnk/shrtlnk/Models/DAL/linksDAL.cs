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
        private readonly string _SQL_GetRedirectItem = "SELECT * FROM links WHERE url_key = @key";
        private readonly string _SQL_GetRedirectItemFromUrl = "SELECT * FROM links WHERE url = @url";
        private readonly string _SQL_AddNewRedirectItem = "INSERT INTO links (url_key, url) VALUES (@key, @url);";

        public linksDAL(string connectionString)
        {
            _connectionString = connectionString;
        }

        public RedirectItem AddNewRedirectItem(RedirectItem input)
        {
            int httpsSubstring = input.URL.Length > 11 ? 12 : input.URL.Length;
            if(input.URL.Substring(0, httpsSubstring) != "https://www." || input.URL.Substring(0,httpsSubstring - 1) != "http://www.")
            {
                input.URL = "http://www." + input.URL;
            }

            if (CheckIfUrlExistsInDatabase(input))
            {
                input = GetRedirectItemFromURL(input);
            }
            else
            {
                while (String.IsNullOrWhiteSpace(input.Key))
                {
                    input.Key = CreateNewUrlKey();
                    if (CheckIfKeyExistsInDatabase(input))
                    {
                        input.Key = "";
                    }
                }

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand(_SQL_AddNewRedirectItem, conn);
                    cmd.Parameters.AddWithValue("@key", input.Key);
                    cmd.Parameters.AddWithValue("@url", input.URL);

                    cmd.ExecuteNonQuery();
                }
            }
            return input;
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
                    output.Key = Convert.ToString(reader["url_key"]);
                    output.URL = Convert.ToString(reader["url"]);
                }
            }
            return output;
        }

        public RedirectItem GetRedirectItemFromURL(RedirectItem input)
        {
            RedirectItem output = new RedirectItem();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(_SQL_GetRedirectItemFromUrl, conn);
                cmd.Parameters.AddWithValue("@url", input.URL);

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    output.Id = Convert.ToInt32(reader["Id"]);
                    output.Key = Convert.ToString(reader["url_key"]);
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
                        Key = Convert.ToString(reader["url_key"]),
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
                SqlCommand cmd = new SqlCommand(_SQL_GetRedirectItem, conn);
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

        private string CreateNewUrlKey()
        {
            string output = "";
            Random random = new Random();

            string[] characters = new string[] { "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };
            
            for(int i=0; i<6; i++)
            {
                output += characters[random.Next(0, characters.Length)];
            }

            return output;
        }
    }
}
