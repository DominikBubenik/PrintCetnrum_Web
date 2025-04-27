using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Controllers;
using PrintCetnrum_Web.Server.Models.OrderModels;
using PrintCetnrum_Web.Server.Models.UserModels;
using PrintCetnrum_Web.Server.UtilityService;

namespace Testing
{
    public class OrderControllerTest
    {
        private AppDbContext _dbContext;
        private OrderController _controller;
        private Mock<IEmailService> _emailServiceMock;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new AppDbContext(options);
            _emailServiceMock = new Mock<IEmailService>();
            _controller = new OrderController(_dbContext, _emailServiceMock.Object);
        }

        [Test]
        public async Task CreateOrder_ShouldReturnOk_WhenUserExists()
        {
            var user = new User
            {
                Id = 1,
                UserName = "testuser",
                Email = "testuser@example.com",
                FirstName = "Test",
                LastName = "User",
                Phone = "123456789"
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var order = new Order
            {
                IsPreparedForCustomer = false,
                IsTakenByCustomer = false,
                TotalPrice = 0
            };

            var result = await _controller.CreateOrder(order, "testuser");

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var createdOrder = okResult?.Value as Order;
            Assert.IsNotNull(createdOrder);
            Assert.AreEqual(user.Id, createdOrder.UserId);
        }

        [Test]
        public async Task AddOrderItems_ShouldReturnOk_WhenOrderExists()
        {
            var user = new User
            {
                Id = 2,
                UserName = "orderuser",
                Email = "orderuser@example.com",
                FirstName = "Order",
                LastName = "User",
                Phone = "987654321"
            };
            var order = new Order
            {
                Id = 1,
                UserId = user.Id,
                OrderName = "2404261234561",
                OrderCreated = DateTime.UtcNow,
                IsPreparedForCustomer = false,
                IsTakenByCustomer = false,
                TotalPrice = 0
            };
            _dbContext.Users.Add(user);
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();

            var items = new[]
            {
                new OrderItem
                {
                    UserFileId = 1,
                    IsDesignFile = false,
                    Count = 2,
                    Price = 5,
                    Color = "Color",
                    PaperType = "Matte",
                    Size = "A4",
                    Description = "Test item"
                }
            };

            var result = await _controller.AddOrderItems(items, order.OrderName);

            Assert.IsInstanceOf<OkResult>(result);
            var updatedOrder = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == order.Id);
            Assert.AreEqual(10, updatedOrder.TotalPrice); // 2 * 5
        }

        [Test]
        public async Task GetOrder_ShouldReturnOk_WhenOrderExists()
        {
            var order = new Order
            {
                Id = 3,
                UserId = 1,
                OrderName = "240426654321",
                OrderCreated = DateTime.UtcNow,
                IsPreparedForCustomer = false,
                IsTakenByCustomer = false,
                TotalPrice = 20
            };
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();

            var result = await _controller.GetOrder(order.Id);

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            var returnedOrder = okResult?.Value as Order;
            Assert.IsNotNull(returnedOrder);
            Assert.AreEqual(order.Id, returnedOrder.Id);
        }

        [Test]
        public async Task DeleteOrder_ShouldReturnNoContent_WhenOrderExists()
        {
            var order = new Order
            {
                Id = 4,
                UserId = 1,
                OrderName = "240426987654",
                OrderCreated = DateTime.UtcNow,
                IsPreparedForCustomer = false,
                IsTakenByCustomer = false,
                TotalPrice = 50
            };
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();

            var result = await _controller.DeleteOrder(order.Id);

            Assert.IsInstanceOf<NoContentResult>(result);
            var deletedOrder = await _dbContext.Orders.FindAsync(order.Id);
            Assert.IsNull(deletedOrder);
        }

        [Test]
        public async Task UpdateOrderItemPrice_ShouldReturnNoContent_WhenOrderItemExists()
        {
            var order = new Order
            {
                Id = 5,
                UserId = 1,
                OrderName = "240426222333",
                OrderCreated = DateTime.UtcNow,
                IsPreparedForCustomer = false,
                IsTakenByCustomer = false,
                TotalPrice = 100
            };
            var orderItem = new OrderItem
            {
                Id = 1,
                OrderId = order.Id,
                UserFileId = 1,
                IsDesignFile = false,
                Count = 2,
                Price = 25
            };
            _dbContext.Orders.Add(order);
            _dbContext.OrderItems.Add(orderItem);
            await _dbContext.SaveChangesAsync();

            var result = await _controller.UpdateOrderItemPrice(orderItem.Id, 30);

            Assert.IsInstanceOf<NoContentResult>(result);
            var updatedItem = await _dbContext.OrderItems.FindAsync(orderItem.Id);
            Assert.AreEqual(30, updatedItem.Price);
        }
    }
}
