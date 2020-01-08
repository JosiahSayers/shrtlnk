using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace shrtlnk.Models.Objects
{
    public class RedirectItem
    {
        public int Id { get; set; }

        public string Key { get; set; }

        public string URL { get; set; }

        public DateTime DateAdded { get; set; }

        public int TimesLoaded { get; set; }
    }
}
