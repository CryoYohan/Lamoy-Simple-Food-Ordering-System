using System.Net;
using System.Net.Mail;

namespace backend.Services
{
    public class EmailService
    {
        private readonly string _smtpServer;
        private readonly int _port;
        private readonly string _senderName;
        private readonly string _senderEmail;
        private readonly string _username;
        private readonly string _password;

        public EmailService()
        {
            _smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER")!;
            _port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT")!);
            _senderName = Environment.GetEnvironmentVariable("SMTP_SENDER_NAME")!;
            _senderEmail = Environment.GetEnvironmentVariable("SMTP_EMAIL")!;
            _username = Environment.GetEnvironmentVariable("SMTP_EMAIL")!;
            _password = Environment.GetEnvironmentVariable("SMTP_PASSWORD")!;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var smtp = new SmtpClient(_smtpServer, _port)
            {
                Credentials = new NetworkCredential(_username, _password),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_senderEmail, _senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            await smtp.SendMailAsync(mail);
        }
    }
}
