using PrintCetnrum_Web.Server.Models;

namespace PrintCetnrum_Web.Server.UtilityService
{
    public interface IEmailService
    {
        void SendEmail(EmailModel emailModel);
    }
}
