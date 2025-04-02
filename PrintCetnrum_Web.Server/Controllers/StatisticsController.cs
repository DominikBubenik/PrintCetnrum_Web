using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]  // Restrict to admins only
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatisticsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets total sales, order count, and other key statistics.
        /// </summary>
        [HttpGet("overview")]
        public async Task<IActionResult> GetBusinessOverview()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders.SumAsync(o => o.TotalPrice);
            var completedOrders = await _context.Orders.CountAsync(o => o.OrderFinished != null);
            var pendingOrders = totalOrders - completedOrders;
            var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            return Ok(new
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                CompletedOrders = completedOrders,
                PendingOrders = pendingOrders,
                AverageOrderValue = avgOrderValue
            });
        }

        /// <summary>
        /// Gets daily, weekly, and monthly revenue trends.
        /// </summary>
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

        /// <summary>
        /// Gets the top 5 selling items based on total quantity ordered.
        /// </summary>
        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var topProducts = await _context.OrderItems
                .GroupBy(oi => new { oi.Description, oi.PaperType, oi.Size })  // Group by product attributes
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

        /// <summary>
        /// Gets the number of new customers in the last month.
        /// </summary>
        [HttpGet("new-customers")]
        public async Task<IActionResult> GetNewCustomers()
        {
            var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);

            var newCustomers = await _context.Users
                .Where(u => u.AccountCreated >= oneMonthAgo)
                .CountAsync();

            return Ok(new { NewCustomers = newCustomers });
        }

        /// <summary>
        /// Gets a breakdown of orders by status.
        /// </summary>
        [HttpGet("order-status")]
        public async Task<IActionResult> GetOrderStatusBreakdown()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var preparedOrders = await _context.Orders.CountAsync(o => o.IsPreparedForCustomer);
            var takenOrders = await _context.Orders.CountAsync(o => o.IsTakenByCustomer);
            var finishedOrders = await _context.Orders.CountAsync(o => o.OrderFinished != null);

            return Ok(new
            {
                TotalOrders = totalOrders,
                PreparedOrders = preparedOrders,
                TakenOrders = takenOrders,
                FinishedOrders = finishedOrders
            });
        }
    }
}