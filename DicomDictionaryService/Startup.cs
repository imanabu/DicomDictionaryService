using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(DicomDictionaryService.Startup))]
namespace DicomDictionaryService
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
