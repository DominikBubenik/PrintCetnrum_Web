using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class UserController : Controller
    {
        private readonly AppDbContext _authContext;

        public UserController(AppDbContext authContext)
        {
            _authContext = authContext;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userParam)
        {
            if (userParam == null)
                return BadRequest();

            var user = await _authContext.Users.SingleOrDefaultAsync(x => x.UserName == userParam.UserName && x.Password == userParam.Password);

            System.Console.WriteLine("toto je meno " + userParam.UserName +  "  " + userParam.Password);
            if (user == null)
                return NotFound(new { message = "User Not Found" });

            return Ok(new { message = "Login success" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User userParam)
        {
            if (userParam == null)
                return BadRequest();
            
            // check email
            if (await CheckEmailExistAsync(userParam.Email))
                return BadRequest(new { Message = "Email Already Exist" });

            //check username
            if (await CheckUsernameExistAsync(userParam.UserName))
                return BadRequest(new { Message = "Username Already Exist" });

            var passMessage = CheckPasswordStrength(userParam.Password);
            if (!string.IsNullOrEmpty(passMessage))
                return BadRequest(new { Message = passMessage.ToString() });

            userParam.Password = PasswordHasher.HashPassword(userParam.Password);
            userParam.Role = "User";
            userParam.Token = "";
            await _authContext.Users.AddAsync(userParam);
            await _authContext.SaveChangesAsync();

            return Ok(new { message = "User Created Successfully" });
        }

        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authContext.Users
                .Select(user => new
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email
                })
                .ToListAsync();
            return Ok(users);
        }

        private Task<bool> CheckEmailExistAsync(string? email)
            => _authContext.Users.AnyAsync(x => x.Email == email);

        private Task<bool> CheckUsernameExistAsync(string? username)
            => _authContext.Users.AnyAsync(x => x.UserName == username);

        private static string CheckPasswordStrength(string pass)
        {
            StringBuilder sb = new StringBuilder();
            if (pass.Length < 9)
                sb.Append("Minimum password length should be 8" + Environment.NewLine);
            if (!(Regex.IsMatch(pass, "[a-z]") && Regex.IsMatch(pass, "[A-Z]") && Regex.IsMatch(pass, "[0-9]")))
                sb.Append("Password should be AlphaNumeric" + Environment.NewLine);
            if (!Regex.IsMatch(pass, "[<,>,@,!,#,$,%,^,&,*,(,),_,+,\\[,\\],{,},?,:,;,|,',\\,.,/,~,`,-,=]"))
                sb.Append("Password should contain special charcter" + Environment.NewLine);
            return sb.ToString();
        }
    }
}
