using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Controllers;
using PrintCetnrum_Web.Server.Helpers;
using PrintCetnrum_Web.Server.Models.UserModels;
using PrintCetnrum_Web.Server.Models;

namespace Testing;

public class UserControllerTest
{
    private AppDbContext _dbContext;
    private UserController _controller;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("TestDatabase")
            .Options;
        _dbContext = new AppDbContext(options);
        _controller = new UserController(_dbContext, null, null);
        _dbContext.Users.RemoveRange(_dbContext.Users);
        _dbContext.SaveChangesAsync();
    }

    [Test]
    public async Task Authenticate_ShouldReturnOk_WhenValidUserCredentials()
    {
        var user = new User { Id = 1, UserName = "testuser", FirstName = "User", LastName = "Test", Email = "email@mail.com", Phone = "23243" };
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var userParam = new UserDto { UserName = "testuser", Password = "password123" };
        var result = await _controller.Authenticate(userParam);
        Assert.IsNotNull(result);
    }

    [Test]
    public async Task Authenticate_ShouldReturnNotFound_WhenUserNotFound()
    {
        var userParam = new UserDto { UserName = "nonexistentuser", Password = "password123" };
        var result = await _controller.Authenticate(userParam);
        var notFoundResult = result as NotFoundObjectResult;
        Assert.IsNotNull(notFoundResult);
    }

   [Test]
public async Task Authenticate_ShouldReturnBadRequest_WhenIncorrectPassword()
{
    var user = new User 
    { 
        Id = 1, 
        UserName = "testuser", 
        FirstName = "User", 
        LastName = "Test", 
        Email = "email@mail.com", 
        Phone = "23243" 
    };
    _dbContext.Users.Add(user);
    await _dbContext.SaveChangesAsync();
    var correctPasswordHash = PasswordHasher.HashPassword("correctpassword");

    var userAuthentication = new UserAuthentication
    {
        UserId = user.Id,
        Password = correctPasswordHash,
        Token = "someToken",
        RefreshToken = "someRefreshToken",
        RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(1),
        ResetPasswordToken = "someResetPasswordToken",
        ResetPasswordExpiry = DateTime.UtcNow.AddHours(1)
    };
    _dbContext.UserAuthentications.Add(userAuthentication);
    await _dbContext.SaveChangesAsync();

    var userParam = new UserDto 
    { 
        UserName = "testuser", 
        Password = "wrongpassword" 
    };

    var result = await _controller.Authenticate(userParam);
    var badRequestResult = result as BadRequestObjectResult;
    Assert.IsNotNull(badRequestResult);
}


    [Test]
    public async Task GetUser_ShouldReturnOk_WhenUserExists()
    {
        var user = new User { Id = 1, UserName = "testuser", FirstName = "User", LastName = "Test", Email = "email@mail.com", Phone = "23243" };
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var result = await _controller.GetUser("testuser");
        var okResult = result as OkObjectResult;
        Assert.IsNotNull(okResult);
        var returnedUser = okResult.Value as User;
        Assert.IsNotNull(returnedUser);
        Assert.AreEqual("testuser", returnedUser.UserName);
    }

    [Test]
    public async Task GetUser_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        var result = await _controller.GetUser("nonexistentuser");
        var notFoundResult = result as NotFoundObjectResult;
        Assert.IsNotNull(notFoundResult);
    }

    [Test]
    public async Task Register_ShouldReturnOk_WhenUserIsRegistered()
    {
        _dbContext.Users.RemoveRange(_dbContext.Users);
        await _dbContext.SaveChangesAsync();

        var userParam = new UserDto
        {
            UserName = "newuser5",
            Password = "Password12345!",
            FirstName = "New",
            LastName = "User",
            Email = "newuser5@mail.com",
            Phone = "12345"
        };

        var result = await _controller.Register(userParam);

        Assert.IsNotNull(result);

        var addedUser = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.UserName == "newuser5");
        Assert.IsNotNull(addedUser);
    }

    [Test]
    public async Task Register_ShouldReturnBadRequest_WhenEmailExists()
    {
        var user = new User { Id = 1, UserName = "testuser", FirstName = "User", LastName = "Test", Email = "email@mail.com", Phone = "23243" };
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var userParam = new UserDto { UserName = "newuser", Password = "password123", FirstName = "New", LastName = "User", Email = "email@mail.com", Phone = "12345" };
        var result = await _controller.Register(userParam);
        var badRequestResult = result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult);
    }

    [Test]
    public async Task Register_ShouldReturnBadRequest_WhenUsernameExists()
    {
        var user = new User { Id = 1, UserName = "testuser", FirstName = "User", LastName = "Test", Email = "email@mail.com", Phone = "23243" };
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var userParam = new UserDto { UserName = "testuser", Password = "password123", FirstName = "New", LastName = "User", Email = "newuser@mail.com", Phone = "12345" };
        var result = await _controller.Register(userParam);
        var badRequestResult = result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult);
    }
}
