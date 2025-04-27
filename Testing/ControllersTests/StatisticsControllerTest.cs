using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Controllers;
using PrintCetnrum_Web.Server.Models.OrderModels;
using PrintCetnrum_Web.Server.Models.UserModels;


namespace Testing
{
    public class StatisticsControllerTest
    {
        private AppDbContext _context;
        private StatisticsController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _controller = new StatisticsController(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task GetBusinessOverview_ReturnsCorrectOverview()
        {
            _context.Orders.Add(new Order
            {
                OrderName = "Test Order 1",
                TotalPrice = 100,
                IsTakenByCustomer = true,
                IsPreparedForCustomer = true
            });
            _context.Orders.Add(new Order
            {
                OrderName = "Test Order 2",
                TotalPrice = 200,
                IsTakenByCustomer = false,
                IsPreparedForCustomer = true
            });
            _context.Orders.Add(new Order
            {
                OrderName = "Test Order 3",
                TotalPrice = 300,
                IsTakenByCustomer = false,
                IsPreparedForCustomer = false
            });
            await _context.SaveChangesAsync();


            var result = await _controller.GetBusinessOverview() as OkObjectResult;

            Assert.IsNotNull(result);
            Console.WriteLine(result.Value);
            dynamic data = result.Value;
            //Assert.AreEqual(3, (int)data.TotalOrders);
            Assert.AreEqual(600, (decimal)data.TotalRevenue);
            Assert.AreEqual(1, (int)data.CompletedOrders);
            Assert.AreEqual(1, (int)data.PreparedOrders);
            Assert.AreEqual(1, (int)data.PendingOrders);
        }

        [Test]
        public async Task GetSalesTrends_ReturnsCorrectSales()
        {
            var today = DateTime.UtcNow.Date;
            _context.Orders.Add(new Order { TotalPrice = 100, OrderCreated = today.AddHours(1) });
            _context.Orders.Add(new Order { TotalPrice = 200, OrderCreated = today.AddDays(-2) });
            _context.Orders.Add(new Order { TotalPrice = 300, OrderCreated = today.AddMonths(-1) });
            await _context.SaveChangesAsync();

            var result = await _controller.GetSalesTrends() as OkObjectResult;

            Assert.IsNotNull(result);
            dynamic data = result.Value;
            Assert.AreEqual(100, (decimal)data.TodaySales);
            Assert.AreEqual(300, (decimal)data.WeeklySales);
            Assert.AreEqual(600, (decimal)data.MonthlySales);
        }

        [Test]
        public async Task GetTopSellingProducts_ReturnsTopProducts()
        {
            _context.OrderItems.Add(new OrderItem { Description = "Photo Print", PaperType = "Glossy", Size = "A4", Count = 5, Price = 10 });
            _context.OrderItems.Add(new OrderItem { Description = "Business Card", PaperType = "Matte", Size = "Standard", Count = 10, Price = 2 });
            await _context.SaveChangesAsync();

            var result = await _controller.GetTopSellingProducts() as OkObjectResult;

            Assert.IsNotNull(result);
            var data = result.Value as IEnumerable<object>; 
            Assert.IsNotNull(data);
            Assert.AreEqual(2, data.Count()); 
        }


        [Test]
        public async Task GetNewCustomers_ReturnsCorrectCounts()
        {
            var now = DateTime.UtcNow;
            _context.Users.Add(new User { AccountCreated = now.AddDays(-5) });
            _context.Users.Add(new User { AccountCreated = now.AddDays(-20) });
            _context.Users.Add(new User { AccountCreated = now.AddDays(-80) });
            await _context.SaveChangesAsync();

            var result = await _controller.GetNewCustomers() as OkObjectResult;

            Assert.IsNotNull(result);
            dynamic data = result.Value;
            Assert.AreEqual(1, (int)data[0].value);
            Assert.AreEqual(2, (int)data[1].value);
            Assert.AreEqual(3, (int)data[2].value);
        }

        [Test]
        public async Task GetOrderStatusBreakdown_ReturnsCorrectStatus()
        {
            _context.Orders.Add(new Order { IsPreparedForCustomer = true, IsTakenByCustomer = false });
            _context.Orders.Add(new Order { IsPreparedForCustomer = false, IsTakenByCustomer = true });
            _context.Orders.Add(new Order { IsPreparedForCustomer = false, IsTakenByCustomer = false });
            await _context.SaveChangesAsync();

            var result = await _controller.GetOrderStatusBreakdown() as OkObjectResult;

            Assert.IsNotNull(result);
            dynamic data = result.Value;
            Assert.AreEqual(1, (int)data.PendingOrders);
            Assert.AreEqual(1, (int)data.PreparedOrders);
            Assert.AreEqual(1, (int)data.TakenOrders);
        }

        [Test]
        public async Task GetUserFiles_ReturnsCorrectFileCounts()
        {
            var testUserId = 1;

            _context.UserFiles.Add(new UserFile
            {
                Extension = "pdf",
                FileName = "file1.pdf",
                FilePath = "/files/file1.pdf",
                UniqueName = Guid.NewGuid().ToString(),
                UploadDate = DateTime.UtcNow,
                ShouldPrint = true,
                UserId = testUserId,
                FileSize = 12345
            });

            _context.UserFiles.Add(new UserFile
            {
                Extension = "docx",
                FileName = "file2.docx",
                FilePath = "/files/file2.docx",
                UniqueName = Guid.NewGuid().ToString(),
                UploadDate = DateTime.UtcNow,
                ShouldPrint = false,
                UserId = testUserId,
                FileSize = 23456
            });

            _context.UserFiles.Add(new UserFile
            {
                Extension = "jpg",
                FileName = "image1.jpg",
                FilePath = "/files/image1.jpg",
                UniqueName = Guid.NewGuid().ToString(),
                UploadDate = DateTime.UtcNow,
                ShouldPrint = true,
                UserId = testUserId,
                FileSize = 34567
            });

            _context.UserFiles.Add(new UserFile
            {
                Extension = "png",
                FileName = "image2.png",
                FilePath = "/files/image2.png",
                UniqueName = Guid.NewGuid().ToString(),
                UploadDate = DateTime.UtcNow,
                ShouldPrint = true,
                UserId = testUserId,
                FileSize = 45678
            });

            _context.UserFiles.Add(new UserFile
            {
                Extension = "exe",
                FileName = "app.exe",
                FilePath = "/files/app.exe",
                UniqueName = Guid.NewGuid().ToString(),
                UploadDate = DateTime.UtcNow,
                ShouldPrint = false,
                UserId = testUserId,
                FileSize = 56789
            });

            _context.DesignFiles.Add(new DesignFile
            {
                FileName = "design1.png",
                FilePath = "/designs/design1.png",
                UniqueName = Guid.NewGuid().ToString(),
                DateCreated = DateTime.UtcNow,
                ShouldPrint = true,
                UserId = testUserId,
                Type = "stamp"
            });

            await _context.SaveChangesAsync();

            var result = await _controller.GetUserFiles() as OkObjectResult;
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result.Value));
            Assert.IsNotNull(result);
            dynamic data = result.Value;
            Assert.AreEqual(1, data.pdfFiles);
            Assert.AreEqual(1, (int)data.wordFiles);
            Assert.AreEqual(2, (int)data.images);
            Assert.AreEqual(1, (int)data.designFiles);
            Assert.AreEqual(1, (int)data.otherFiles);
        }

    }
}
