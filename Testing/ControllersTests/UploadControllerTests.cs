using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Controllers;
using PrintCetnrum_Web.Server.Models.UserModels;
using Microsoft.AspNetCore.Http;

namespace Testing
{
    public class UploadControllerTests
    {
        private AppDbContext _dbContext;
        private UploadController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new AppDbContext(options);
            _controller = new UploadController(_dbContext);
        }

        [Test]
        public async Task UploadFiles_ShouldReturnBadRequest_WhenNoFilesUploaded()
        {
            var files = new List<IFormFile>();

            var result = await _controller.UploadFiles(files, "testuser", true);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("No files uploaded.", badRequestResult.Value);
        }

        [Test]
        public async Task UploadFiles_ShouldReturnBadRequest_WhenMoreThan10FilesUploaded()
        {
            var files = new List<IFormFile>(new IFormFile[11]);

            var result = await _controller.UploadFiles(files, "testuser", true);

            var badRequestResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequestResult);
            Assert.AreEqual("Select max 10 files", badRequestResult.Value);
        }

        [Test]
        public async Task UploadFiles_ShouldReturnOk_WhenFilesUploadedSuccessfully()
        {
            var files = new List<IFormFile>
            {
                CreateMockFile("file1.pdf", 1024),
                CreateMockFile("file2.pdf", 1024)
            };

            var user = new User { Id = 1, UserName = "testuser", FirstName = "User", LastName = "Test", Email = "email@mail.com", Phone = "23243" };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var result = await _controller.UploadFiles(files, "testuser", true);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            var uploadedFiles = okResult.Value as List<object>;
            Assert.IsNotNull(uploadedFiles);
            Assert.AreEqual(2, uploadedFiles.Count);
        }

        [Test]
        public async Task GetUserFiles_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            var result = await _controller.GetUserFiles("nonExistingUser");

            var notFoundResult = result as NotFoundObjectResult;
            Assert.IsNotNull(notFoundResult);
            Assert.AreEqual("User not found.", notFoundResult.Value);
        }

        [Test]
        public async Task GetUserFiles_ShouldReturnOk_WhenUserFilesExist()
        {
            var user = new User { Id = 1, UserName = "testuser", FirstName = "User", LastName = "Test", Email = "email@mail.com", Phone = "23243"};
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var files = new List<UserFile>
            {
                new UserFile { Id = 1, FileName = "file1.pdf", UniqueName = "file1", FilePath = "/UserData/testuser/file1.pdf", UserId = 1 }
            };
            _dbContext.UserFiles.AddRange(files);
            await _dbContext.SaveChangesAsync();

            var result = await _controller.GetUserFiles("testuser");

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.IsNotNull(okResult.Value);
        }

        private IFormFile CreateMockFile(string fileName, long fileSize)
        {
            var content = new byte[fileSize];
            var file = new Mock<IFormFile>();
            file.Setup(f => f.FileName).Returns(fileName);
            file.Setup(f => f.Length).Returns(fileSize);
            file.Setup(f => f.OpenReadStream()).Returns(new MemoryStream(content));
            file.Setup(f => f.ContentType).Returns("application/pdf");
            return file.Object;
        }
    }
}
