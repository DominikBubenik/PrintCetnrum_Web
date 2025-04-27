using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatisticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetBusinessOverview()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders.SumAsync(o => o.TotalPrice);
            var completedOrders = await _context.Orders.CountAsync(o => o.IsTakenByCustomer);
            var preparedOrders = await _context.Orders.CountAsync(o => !o.IsTakenByCustomer && o.IsPreparedForCustomer);
            var pendingOrders = totalOrders - completedOrders - preparedOrders;
            var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            return Ok(new
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                CompletedOrders = completedOrders,
                PreparedOrders = preparedOrders,
                PendingOrders = pendingOrders,
                AverageOrderValue = avgOrderValue
            });
        }

        [HttpGet("sales-trends")]
        public async Task<IActionResult> GetSalesTrends()
        {
            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var dailySales = await _context.Orders
                .Where(o => o.OrderCreated >= today)
                .SumAsync(o => o.TotalPrice);

            var weeklySales = await _context.Orders
                .Where(o => o.OrderCreated >= startOfWeek)
                .SumAsync(o => o.TotalPrice);

            var monthlySales = await _context.Orders
                .Where(o => o.OrderCreated >= startOfMonth)
                .SumAsync(o => o.TotalPrice);

            return Ok(new
            {
                TodaySales = dailySales,
                WeeklySales = weeklySales,
                MonthlySales = monthlySales
            });
        }

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var topProducts = await _context.OrderItems
                .GroupBy(oi => new { oi.Description, oi.PaperType, oi.Size })
                .Select(group => new
                {
                    Product = $"{group.Key.Description} ({group.Key.PaperType}, {group.Key.Size})",
                    TotalSold = group.Sum(oi => oi.Count),
                    TotalRevenue = group.Sum(oi => oi.Count * oi.Price)
                })
                .OrderByDescending(p => p.TotalSold)
                .Take(5)
                .ToListAsync();

            return Ok(topProducts);
        }

        [HttpGet("new-customers")]
        public async Task<IActionResult> GetNewCustomers()
        {
            var now = DateTime.UtcNow;

            var last7Days = now.AddDays(-7);
            var last30Days = now.AddDays(-30);
            var last90Days = now.AddDays(-90);

            var count7 = await _context.Users.CountAsync(u => u.AccountCreated >= last7Days);
            var count30 = await _context.Users.CountAsync(u => u.AccountCreated >= last30Days);
            var count90 = await _context.Users.CountAsync(u => u.AccountCreated >= last90Days);

            var chartData = new[]
            {
                new { name = "Last 7 Days", value = count7 },
                new { name = "Last 30 Days", value = count30 },
                new { name = "Last 90 Days", value = count90 }
            };

            return Ok(chartData);
        }

        [HttpGet("order-status")]
        public async Task<IActionResult> GetOrderStatusBreakdown()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var preparedOrders = await _context.Orders.CountAsync(o => o.IsPreparedForCustomer && !o.IsTakenByCustomer);
            var takenOrders = await _context.Orders.CountAsync(o => o.IsTakenByCustomer);
            var pendingOrders = totalOrders - preparedOrders - takenOrders;

            return Ok(new
            {
                PendingOrders = pendingOrders,
                PreparedOrders = preparedOrders,
                TakenOrders = takenOrders
            });
        }

        [HttpGet("user-files")]
        public async Task<IActionResult> GetUserFiles()
        {
            var pdfFiles = await _context.UserFiles.CountAsync(f => f.Extension == "pdf");
            var wordFiles = await _context.UserFiles.CountAsync(f => f.Extension == "doc" || f.Extension == "docx");
            var images = await _context.UserFiles.CountAsync(f =>
                f.Extension == "jpg" || f.Extension == "png" || f.Extension == "jpeg");
            var designFiles = await _context.DesignFiles.CountAsync();
            var otherFiles = await _context.UserFiles.CountAsync() - pdfFiles - wordFiles - images;
            return Ok(new
            {
                pdfFiles = pdfFiles,
                wordFiles = wordFiles,
                images = images,
                designFiles = designFiles,
                otherFiles = otherFiles
            });
        }
    }
}