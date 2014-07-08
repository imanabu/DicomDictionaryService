using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using System.Web.UI.WebControls;
using Dicom;
using DicomDictionaryService.Models;

namespace DicomDictionaryService.Controllers
{

    [RoutePrefix("lookup")]
    public class DictionaryController : ApiController
    {
        [HttpGet]
        [Route("{tag}")]
        public List<dictItem> Get(String tag)
        {
            var dict = new DictionaryLookup();
            return dict.Lookup(tag);
        }
    }
}
