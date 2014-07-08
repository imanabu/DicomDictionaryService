using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DicomDictionaryService.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(String tag)
        {
            return View();
        }

        public ActionResult Vr()
        {
            return View();
        }
    }
}