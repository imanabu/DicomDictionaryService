using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DicomDictionaryService.Models
{
    public class dictItem
    {
        public string tag;
        public string vr;
        public string vm;
        public string description;
    }

    public interface IDcmDictionaryLookup
    {
       List<dictItem> Lookup(String term);
    }
}
