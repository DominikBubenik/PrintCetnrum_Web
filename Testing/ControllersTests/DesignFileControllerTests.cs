using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Controllers;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models.UserModels;
using Moq;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace Testing
{
    [TestFixture]
    public class DesignFileControllerTests
    {
        private AppDbContext _dbContext;
        private DesignFileController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new AppDbContext(options);
            _controller = new DesignFileController(_dbContext);
        }

        [Test]
        public async Task UploadDesignFile_ShouldReturnBadRequest_WhenFileIsNull()
        {
            var result = await _controller.UploadDesignFile(null, "testuser", "filename", "0", "type");
            Assert.IsInstanceOf<BadRequestObjectResult>(result);
        }

        [Test]
        public async Task UploadDesignFile_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(100);
            var result = await _controller.UploadDesignFile(mockFile.Object, "nonexistentuser", "filename", "0", "type");
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task UploadDesignFile_ShouldReturnOk_WhenUploadSucceeds()
        {
            var user = new User
            {
                Id = 1,
                UserName = "testuser",
                Email = "testuser@example.com",
                FirstName = "Test",
                LastName = "User",
                Phone = "123-456-7890"
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var content = "Fake file content";
            var fileName = "testfile.txt";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            IFormFile file = new FormFile(ms, 0, ms.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/plain"
            };

            var result = await _controller.UploadDesignFile(file, "testuser", "CustomFileName", "0", "design");

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult?.Value);
        }


        [Test]
        public async Task GetUserDesignFiles_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            var result = await _controller.GetUserDiplomas("ghostuser", "design");
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task GetUserDesignFiles_ShouldReturnOk_WhenUserExists()
        {
            var user = new User
            {
                Id = 2,
                UserName = "existinguser",
                Email = "existinguser@example.com",
                FirstName = "Existing",
                LastName = "User",
                Phone = "123-456-7890"
            };

            _dbContext.Users.Add(user);
            _dbContext.DesignFiles.Add(new DesignFile
            {
                FileName = "file1",
                FilePath = "existinguser/DesignFiles/file1.txt",
                Type = "design",
                UserId = user.Id,
                DateCreated = DateTime.Now,
                UniqueName = "unique_name_456"
            });
            await _dbContext.SaveChangesAsync();

            var result = await _controller.GetUserDiplomas("existinguser", "design");

            Assert.IsInstanceOf<OkObjectResult>(result);
            var okResult = result as OkObjectResult;
            Assert.IsInstanceOf<List<DesignFile>>(okResult?.Value);
            var files = okResult?.Value as List<DesignFile>;
            Assert.IsTrue(files?.Count > 0);
        }
    }
}
