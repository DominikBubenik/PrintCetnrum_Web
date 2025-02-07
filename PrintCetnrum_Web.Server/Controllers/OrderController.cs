﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Helpers;
using PrintCetnrum_Web.Server.Models;
using PrintCetnrum_Web.Server.Models.OrderModels;
using PrintCetnrum_Web.Server.Models.UserModels;
using PrintCetnrum_Web.Server.UtilityService;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public OrderController(AppDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
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

            order.TotalPrice = order.TotalPrice;
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

        [HttpPost("send-order-ready-email/{orderId}")]
        public async Task<IActionResult> SendOrderReadyEmail(int orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null)
            {
                return NotFound("Order not found");
            }

            if (!order.IsPreparedForCustomer)
            {
                return BadRequest("Order is not marked as prepared for the customer yet");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == order.UserId);
            if (user == null)
            {
                return NotFound("User with this email not found");
            }
            var orderItems = await _context.OrderItems.Where(oi => oi.OrderId == orderId).ToListAsync();
            var orderFiles = new List<UserFile>();

            foreach (var item in orderItems)
            {
                var userFile = await _context.UserFiles
                    .Where(f => f.Id == item.UserFileId)
                    .FirstOrDefaultAsync(); 

                if (userFile != null) 
                {
                    orderFiles.Add(userFile); 
                }
            }

            string emailBody = EmailOrderReady.GenerateOrderReadyEmailBody(user.UserName, order.OrderName, order.TotalPrice, orderItems, orderFiles);


            string subject = $"Your Order {order.OrderName} is Ready!";
            var emailModel = new EmailModel(user.Email, subject, emailBody);
            _emailService.SendEmail(emailModel);

            return NoContent();
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
            
            existingOrder.TotalPrice = order.TotalPrice;
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

            var items = await _context.OrderItems
                .Where(oi => oi.OrderId == id)
                .ToListAsync();
         
            return Ok(items);
        }

        [HttpDelete("delete-order-item/{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var orderItem = await _context.OrderItems.FindAsync(id);
            if (orderItem == null)
            {
                return NotFound($"Order item with ID {id} not found.");
            }

            _context.OrderItems.Remove(orderItem);

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderItem.OrderId);
            if (order != null)
            {
                order.TotalPrice -= orderItem.Count * orderItem.Price;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("update-order-item-price/{itemId}")]
        public async Task<IActionResult> UpdateOrderItemPrice(int itemId, [FromBody] decimal newPrice)
        {
            if (newPrice < 0)
            {
                return BadRequest("Price cannot be negative.");
            }

            var orderItem = await _context.OrderItems.FindAsync(itemId);
            if (orderItem == null)
            {
                return NotFound($"Order item with ID {itemId} not found.");
            }

            var order = await _context.Orders.FindAsync(orderItem.OrderId);
            if (order == null)
            {
                return NotFound($"Order associated with item ID {itemId} not found.");
            }

            order.TotalPrice -= orderItem.Price * orderItem.Count; 
            orderItem.Price = newPrice; 
            order.TotalPrice += newPrice * orderItem.Count;
            _context.Entry(order).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
