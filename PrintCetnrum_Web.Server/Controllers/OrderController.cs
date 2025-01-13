using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

            string timeStamp = DateTime.Now.ToString("yyMMddHHmmss");
            order.OrderName = $"{timeStamp}{order.UserId}";
            decimal totalPrice = 0;

            order.TotalPrice = 5;
            order.OrderCreated = DateTime.UtcNow;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpPost("add-order-items")]
        public async Task<IActionResult> AddOrderItems([FromBody] OrderItem[] items, [FromQuery] string orderName)
        {
            var order = this._context.Orders.FirstOrDefault(o => o.OrderName == orderName);
            if (order == null)
            {
                return BadRequest("No Order Found!");
            }

            decimal totalPrice = 0;

            foreach (var item in items)
            {
                item.OrderId = order.Id;
                totalPrice += item.Count * item.Price;
                this._context.OrderItems.Add(item);
            }

            order.TotalPrice = totalPrice;

            //dont forget to update order total price
            await _context.SaveChangesAsync();
            
            return Ok();

        }


        [HttpGet("get-order/{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)  
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


        [HttpGet("get-orders/{userName}")]
        public async Task<IActionResult> GetOrders(string userName)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }
 
            if (user.Role == "Admin")
            {
                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ToListAsync();

                return Ok(orders);
            }
            else
            {
                var orders = await _context.Orders
                    .Where(o => o.UserId == user.Id)
                    .Include(o => o.OrderItems)
                    .ToListAsync();

                return Ok(orders);
            }
        }

        [HttpGet("get-order-items/{id}")]
        public async Task<IActionResult> GetOrderItems(int id)
        {
            var orderExists = await _context.Orders.AnyAsync(o => o.Id == id);
            if (!orderExists)
            {
                return NotFound($"Order with ID {id} not found.");
            }

            // Fetch all order items related to the specified order
            var items = await _context.OrderItems
                .Where(oi => oi.OrderId == id)
                .ToListAsync();
            
            // Return the order items
            return Ok(items);
        }
    }
}
