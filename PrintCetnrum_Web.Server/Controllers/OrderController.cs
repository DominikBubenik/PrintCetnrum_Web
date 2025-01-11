using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models.OrderModels;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] Order order, [FromQuery] string userName)
        {
            if (string.IsNullOrEmpty(userName))
            {
                return BadRequest("UserName is required.");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            order.UserId = user.Id;

            decimal totalPrice = 0;

            if (order.OrderItems != null && order.OrderItems.Any())
            {
                totalPrice = order.OrderItems.Sum(item => item.Count * item.Price);
            }

            order.TotalPrice = totalPrice;
            order.OrderCreated = DateTime.UtcNow;

            //_context.Orders.Add(order);
            //await _context.SaveChangesAsync();

            return Ok(order);
            //return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpGet("get-order/{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.UserFileId)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }


        [HttpPut("update-order/{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                return BadRequest("Order ID mismatch");
            }

            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null)
            {
                return NotFound();
            }

            decimal totalPrice = order.OrderItems?.Sum(item => item.Count * item.Price) ?? 0;
            existingOrder.TotalPrice = totalPrice;
            existingOrder.IsPreparedForCustomer = order.IsPreparedForCustomer;
            existingOrder.IsTakenByCustomer = order.IsTakenByCustomer;
            existingOrder.OrderFinished = order.OrderFinished;
            existingOrder.OrderTakenTime = order.OrderTakenTime;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("delete-order/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpPatch("update-price/{id}")]
        public async Task<IActionResult> UpdateOrderPrice(int id, decimal newPrice)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.TotalPrice = newPrice;
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("get-all-orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.UserFileId)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("all-user-orders/{userName}")]
        public async Task<IActionResult> GetOrdersOfUser(string userName)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var userId = user.Id;
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ToListAsync();

            if (orders == null || !orders.Any())
            {
                return NotFound("No orders found for this user.");
            }

            return Ok(orders);
        }
    }
}
