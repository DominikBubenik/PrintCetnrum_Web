using PrintCetnrum_Web.Server.Models.OrderModels;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Helpers
{
    public static class EmailOrderReady
    {
        public static string GenerateOrderReadyEmailBody(string userName, string orderName, decimal totalPrice, List<OrderItem> orderItems, List<UserFile> orderFiles)
        {
            // Start constructing the email body
            string emailBody = $@"
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
                    .order-items {{
                        margin-top: 20px;
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
                    <div class='header'>Your Order is Ready!</div>
                    <div class='content'>
                        <p>Dear {userName},</p>
                        <p>We are happy to inform you that your order with ID <strong>{orderName}</strong> is now ready for pick-up.</p>
                        <p>Order Details:</p>
                        <div class='order-items'>
                            <ul>";

            // Add order items to the email body
            foreach (var item in orderItems)
            {
                var file = orderFiles.FirstOrDefault(f => f.Id == item.UserFileId);
                emailBody += $"<li>{file?.FileName} {item.Description} - {item.Count} x ${item.Price}</li>";
            }

            emailBody += $@"
                            </ul>
                        </div>
                        <p><strong>Total Price: </strong>${totalPrice}</p>
                        <p>Thank you for shopping with us! We look forward to serving you again.</p>
                    </div>
                    <div class='footer'>
                        <p>If you have any questions, feel free to contact us at support@yourwebsite.com.</p>
                        <p>&copy; 2025 Print Centrum. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";

            return emailBody;
        }
    }
}
