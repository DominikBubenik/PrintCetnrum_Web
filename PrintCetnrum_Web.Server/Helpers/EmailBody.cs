namespace PrintCetnrum_Web.Server.Helpers
{
    public static class EmailBody
    {
        public static string EmailStringBody(string email, string emailToken)
        {
            string resetUrl = $"https://localhost:4200/reset?email={email}&code={emailToken}";

            return $@"
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 30px auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        text-align: center;
                        padding: 10px 0;
                        font-size: 24px;
                        color: #444444;
                    }}
                    .content {{
                        margin: 20px 0;
                        line-height: 1.6;
                    }}
                    .button {{
                        display: inline-block;
                        background-color: #007BFF;
                        color: #ffffff;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        margin: 10px 0;
                    }}
                    .footer {{
                        text-align: center;
                        font-size: 12px;
                        color: #aaaaaa;
                        margin-top: 20px;
                    }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>Reset Your Password</div>
                    <div class='content'>
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your account associated with this email address: <strong>{email}</strong>.</p>
                        <p>If you did not request this, please ignore this email. Otherwise, click the button below to reset your password:</p>
                        <p>
                            <a href='{resetUrl}' class='button'>Reset Password</a>
                        </p>
                        <p>Or, you can copy and paste the following link into your browser:</p>
                       
                        <p>This link will expire in 24 hours for security purposes.</p>
                        <p>Thank you,<br/>The Print Centrum Team</p>
                    </div>
                    <div class='footer'>
                        <p>If you have any questions, feel free to contact us at support@yourwebsite.com.</p>
                        <p>&copy; 2025 Print Centrum. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
        }
    }
}
