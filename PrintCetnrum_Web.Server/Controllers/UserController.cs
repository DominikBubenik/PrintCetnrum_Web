using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

            var user = await _authContext.Users
                .SingleOrDefaultAsync(x => x.UserName == userParam.UserName);

            System.Console.WriteLine("toto je meno " + userParam.UserName);
            if (user == null)
                return NotFound(new { message = "User Not Found" });

            if (!PasswordHasher.VerifyPassword(userParam.Password, user.Password))
            {
                return BadRequest(new { Message = "Password is Incorrect" });
            }

            user.Token = CreateJwt(user);
            var newAccessToken = user.Token;
            var newRefreshToken = CreateRefreshToken();
            //user.RefreshToken = newRefreshToken;
            //user.RefreshTokenExpiryTime = DateTime.Now.AddDays(5);
            await _authContext.SaveChangesAsync();

            return Ok(new
            {
                Token = user.Token,
                message = "Login success"
            });
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

            //psawword strength checking
            //var passMessage = CheckPasswordStrength(userParam.Password);
            //if (!string.IsNullOrEmpty(passMessage))
            //    return BadRequest(new { Message = passMessage.ToString() });

            userParam.Password = PasswordHasher.HashPassword(userParam.Password);
            userParam.Role = "User";
            userParam.Token = "";
            await _authContext.Users.AddAsync(userParam);
            await _authContext.SaveChangesAsync();

            return Ok(new { message = "User Created Successfully" });
        }

        [Authorize]
        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authContext.Users
                .Select(user => new
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserName = user.UserName,
                    Email = user.Email,
                    Role = user.Role
                })
                .ToListAsync();
            return Ok(users);
        }

        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            if (updatedUser == null || id != updatedUser.Id)
                return BadRequest();

            var user = await _authContext.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User Not Found" });

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.UserName = updatedUser.UserName;
            user.Email = updatedUser.Email;
            if (!string.IsNullOrEmpty(updatedUser.Password))
            {
                user.Password = PasswordHasher.HashPassword(updatedUser.Password);
            }

            await _authContext.SaveChangesAsync();
            return Ok(new { message = "User Updated Successfully" });
        }

        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _authContext.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User Not Found" });

            _authContext.Users.Remove(user);
            await _authContext.SaveChangesAsync();

            return Ok(new { message = "User Deleted Successfully" });
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

        private string CreateJwt(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("your-very-secure-secret-key-that-is-at-least-256-bits-long");
            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name,$"{user.UserName}")
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256); //HmacSha256

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(10),
                SigningCredentials = credentials
            };
            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);
        }

        private string CreateRefreshToken()
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var refreshToken = Convert.ToBase64String(tokenBytes);

            //var tokenInUser = _authContext.Users.Any(a => a.RefreshToken == refreshToken);
            //if (tokenInUser)
            //{
            //    return CreateRefreshToken();
            //}
            return refreshToken;
        }

        private ClaimsPrincipal GetPrincipleFromExpiredToken(string token)
        {
            var key = Encoding.ASCII.GetBytes("your-very-secure-secret-key-that-is-at-least-256-bits-long");
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = false
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("This is Invalid Token");
            return principal;

        }

        //[HttpPost("refresh")]
        //public async Task<IActionResult> Refresh([FromBody] TokenApiDto tokenApiDto)
        //{
        //    if (tokenApiDto is null)
        //        return BadRequest("Invalid Client Request");
        //    string accessToken = tokenApiDto.AccessToken;
        //    string refreshToken = tokenApiDto.RefreshToken;
        //    var principal = GetPrincipleFromExpiredToken(accessToken);
        //    var username = principal.Identity.Name;
        //    var user = await _authContext.Users.FirstOrDefaultAsync(u => u.Username == username);
        //    if (user is null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
        //        return BadRequest("Invalid Request");
        //    var newAccessToken = CreateJwt(user);
        //    var newRefreshToken = CreateRefreshToken();
        //    user.RefreshToken = newRefreshToken;
        //    await _authContext.SaveChangesAsync();
        //    return Ok(new TokenApiDto()
        //    {
        //        AccessToken = newAccessToken,
        //        RefreshToken = newRefreshToken,
        //    });
        //}

    }
}
