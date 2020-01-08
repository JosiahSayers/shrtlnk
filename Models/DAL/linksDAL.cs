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
        private readonly string _SQL_AddNewRedirectItem = "INSERT INTO links (url_key, url, date_added, times_loaded) VALUES (@key, @url, @date_added, @times_loaded);";
        private readonly string _SQL_IncrementLoadCount = "UPDATE links SET times_loaded = @times_loaded WHERE url_key = @url_key";
        private readonly string[] characters =
            { "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u",
            "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };


        public linksDAL(string connectionString)
        {
            _connectionString = connectionString;
        }

        public RedirectItem AddNewRedirectItem(RedirectItem input)
        {
            if(!(input.URL.Contains("https://") || input.URL.Contains("http://")))
            {
                input.URL = "http://" + input.URL;
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

                try
                {
                    using (SqlConnection conn = new SqlConnection(_connectionString))
                    {
                        conn.Open();
                        SqlCommand cmd = new SqlCommand(_SQL_AddNewRedirectItem, conn);
                        cmd.Parameters.AddWithValue("@key", input.Key);
                        cmd.Parameters.AddWithValue("@url", input.URL);
                        cmd.Parameters.AddWithValue("@date_added", input.DateAdded);
                        cmd.Parameters.AddWithValue("@times_loaded", input.TimesLoaded);

                        cmd.ExecuteNonQuery();
                    }
                }
                catch
                {
                    input = null;
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
                    output.DateAdded = Convert.ToDateTime(reader["date_added"]);
                    output.TimesLoaded = Convert.ToInt32(reader["times_loaded"]);
                }
            }

            if (!string.IsNullOrWhiteSpace(output.URL))
            {
                output.TimesLoaded = IncrementLoadCount(output);
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
                    output.DateAdded = Convert.ToDateTime(reader["date_added"]);
                    output.TimesLoaded = Convert.ToInt32(reader["times_loaded"]);
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
                        URL = Convert.ToString(reader["url"]),
                        DateAdded = Convert.ToDateTime(reader["date_added"]),
                        TimesLoaded = Convert.ToInt32(reader["times_loaded"])
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
                        Key = Convert.ToString(reader["url_key"]),
                        URL = Convert.ToString(reader["url"]),
                        DateAdded = Convert.ToDateTime(reader["date_added"]),
                        TimesLoaded = Convert.ToInt32(reader["times_loaded"])
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
            
            for(int i=0; i<6; i++)
            {
                output += characters[random.Next(0, characters.Length)];
            }

            return output;
        }

        public bool IsValidLinkCode(string code)
        {
            bool output = true;

            if (!string.IsNullOrWhiteSpace(code))
            {
                for (int i = 0; i < code.Length && output; i++)
                {
                    output = characters.Contains(code[i].ToString());
                }
            }

            return output;
        }

        private int IncrementLoadCount(RedirectItem input)
        {
            input.TimesLoaded++;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(_SQL_IncrementLoadCount, conn);
                cmd.Parameters.AddWithValue("@url_key", input.Key);
                cmd.Parameters.AddWithValue("@times_loaded", input.TimesLoaded);

                cmd.ExecuteNonQuery();
            }
            return input.TimesLoaded;
        }
    }
}
