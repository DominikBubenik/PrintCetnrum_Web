using PrintCetnrum_Web.Server.Models.OrderModels;
using PrintCetnrum_Web.Server.Models.UserModels;

public static class EmailOrderReady
{
    public static string GenerateOrderReadyEmailBody(string userName, string orderName, decimal totalPrice, List<OrderItem> orderItems, List<UserFile> orderFiles)
    {
        string emailBody = $@"
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 640px;
                    margin: 30px auto;
                    background: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    font-size: 26px;
                    font-weight: bold;
                    color: #3B62D9;
                    text-align: center;
                    margin-bottom: 20px;
                }}
                .content {{
                    font-size: 16px;
                    color: #333333;
                    line-height: 1.6;
                }}
                .order-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }}
                .order-table th {{
                    background-color: #3B62D9;
                    color: white;
                    padding: 12px;
                    text-align: left;
                }}
                .order-table td {{
                    padding: 12px;
                    border: 1px solid #dddddd;
                    text-align: left;
                }}
                .total-price {{
                    font-weight: bold;
                    font-size: 18px;
                    margin-top: 20px;
                    text-align: right;
                    color: #3B62D9;
                }}
                .footer {{
                    font-size: 12px;
                    color: #999999;
                    text-align: center;
                    margin-top: 30px;
                }}
                a {{
                    color: #3B62D9;
                    text-decoration: none;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>🎉 Your Order is Ready!</div>
                <div class='content'>
                    <p>Hi <strong>{userName}</strong>,</p>
                    <p>Your order <strong>{orderName}</strong> is ready for pickup.</p>

                    <table class='order-table'>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>";

        foreach (var item in orderItems)
        {
            var file = orderFiles.FirstOrDefault(f => f.Id == item.UserFileId);
            emailBody += $@"
                            <tr>
                                <td>{file?.FileName ?? "Unnamed File"}</td>
                                <td>{item.Description ?? "No description"}</td>
                                <td>{item.Count}</td>
                                <td>${item.Price:F2}</td>
                            </tr>";
        }

        emailBody += $@"
                        </tbody>
                    </table>

                    <p class='total-price'>Total: ${totalPrice:F2}</p>

                    <p>Thank you for choosing <strong>PrintCentrum</strong>. We look forward to seeing you again soon!</p>
                </div>

                <div class='footer'>
                    <p>If you have any questions, feel free to contact us at <a href='mailto:321tlac@gmail.com'>321tlac@gmail.com</a>.</p>
                    <p>&copy; 2025 PrintCentrum Púchov</p>
                </div>
            </div>
        </body>
        </html>";

        return emailBody;
    }
}
