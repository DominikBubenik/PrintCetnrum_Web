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
using PrintCetnrum_Web.Server.Helpers;
using PrintCetnrum_Web.Server.Models;
using PrintCetnrum_Web.Server.Models.UserModels;
using PrintCetnrum_Web.Server.UtilityService;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class UserController(AppDbContext authContext, IConfiguration configuration, IEmailService emailService)
        : ControllerBase
    {
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] UserDto userParam)
        {
            if (userParam == null)
                return BadRequest();

            var user = await authContext.Users
                .FirstOrDefaultAsync(x => x.UserName == userParam.UserName || x.Email == userParam.UserName);

            if (user == null || !user.IsAccountActive)
                return NotFound(new { message = "User Not Found" });
            var userAuthentication = await authContext.UserAuthentications.FirstOrDefaultAsync(x => x.UserId == user.Id);

            if (!PasswordHasher.VerifyPassword(userParam.Password, userAuthentication.Password))
            {
                return BadRequest(new { Message = "Password is Incorrect" });
            }

            userAuthentication.Token = CreateJwt(user);
            var newAccessToken = userAuthentication.Token;
            var newRefreshToken = CreateRefreshToken();
            userAuthentication.RefreshToken = newRefreshToken;
            userAuthentication.RefreshTokenExpiryTime = DateTime.Now.AddDays(5);
            await authContext.SaveChangesAsync();

            return Ok(new TokenApiDto()
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        [HttpGet("getUser/{userName}")]
        public async Task<IActionResult> GetUser(string userName)
        {
            if (string.IsNullOrEmpty(userName))
            {
                return BadRequest(new { message = "User Not Found" });
            }

            var user = await authContext.Users.FirstOrDefaultAsync(x => x.UserName == userName);
            if (user == null)
            {
                return NotFound(new { message = "User Not Found" });
            }
            return Ok(user);
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDto userParam)
        {
            if (userParam == null)
                return BadRequest();
            
            if (await CheckEmailExistAsync(userParam.Email))
                return BadRequest(new { Message = "Email Already Exist" });
            
            if (await CheckUsernameExistAsync(userParam.UserName))
                return BadRequest(new { Message = "Username Already Exist" });

            //psawword strength checking
            //var passMessage = CheckPasswordStrength(userParam.Password);
            //if (!string.IsNullOrEmpty(passMessage))
            //    return BadRequest(new { Message = passMessage.ToString() });
            var hashedPassword = PasswordHasher.HashPassword(userParam.Password);
            
            var user = new User
            {
                FirstName = userParam.FirstName,
                LastName = userParam.LastName,
                UserName = userParam.UserName,
                Email = userParam.Email,
                Phone = userParam.Phone,
                IsAccountActive = true,  
                AccountCreated = DateTime.Now,
                RoleId = 2, 
                Authentication = new UserAuthentication
                {
                    Password = hashedPassword,
                    Token = "" 
                }
            };
            
            await authContext.Users.AddAsync(user);
            await authContext.SaveChangesAsync();

            return Ok(new { message = "User Created Successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await authContext.Users
                .Select(user => new UserDto 
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserName = user.UserName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role.Name,
                    Street = user.Address.Street,
                    City = user.Address.City,
                    Postcode = user.Address.PostCode,
                    IsActive = user.IsAccountActive
                })
                .ToListAsync();

            if (users.Count == 0)
                return NotFound(new { message = "No users found" });

            return Ok(users);
        }

        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDto updatedUser)
        {
            if (updatedUser == null || id != updatedUser.Id)
                return BadRequest();

            var user = await authContext.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User Not Found" });
            var userAddress = await authContext.UserAddresses.FirstOrDefaultAsync(address => address.UserId == user.Id);

            if (userAddress == null)
            {
                userAddress = new UserAddress
                {
                    UserId = user.Id,
                    Street = updatedUser.Street,
                    City = updatedUser.City,
                    PostCode = updatedUser.Postcode
                };
                await authContext.UserAddresses.AddAsync(userAddress);
            }
            else
            {
                userAddress.Street = updatedUser.Street;
                userAddress.City = updatedUser.City;
                userAddress.PostCode = updatedUser.Postcode;
            }

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.UserName = updatedUser.UserName;
            user.Email = updatedUser.Email;
            user.Phone = updatedUser.Phone;
            user.IsAccountActive = updatedUser.IsActive;

            await authContext.SaveChangesAsync();
            return Ok(new { message = "User Updated Successfully" });
        }

        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await authContext.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User Not Found" });

            var userOrders = await authContext.Orders.Where(a => a.UserId == id).ToListAsync();

            foreach (var order in userOrders)
            {
                var orderItems = await authContext.OrderItems.Where(a => a.OrderId == order.Id).ToListAsync();
                foreach (var orderItem in orderItems)
                {
                    authContext.OrderItems.Remove(orderItem);
                }

                authContext.Orders.Remove(order);
            }
            UploadController uploadController = new UploadController(authContext);
            var userFiles = await authContext.UserFiles.Where(a => a.UserId == id).ToListAsync();
            foreach (var file in userFiles)
            {
                await uploadController.DeleteFile(file.Id);
            }
            authContext.Users.Remove(user);
            await authContext.SaveChangesAsync();

            return Ok(new { message = "User Deleted Successfully" });
        }

        [Authorize]
        [HttpPut("set-activity/{id}/{activity}")]
        public async Task<IActionResult> SetActivity(int id, bool activity)
        {
            var userName = User.Identity?.Name;
            var userToVerify = await authContext.Users.FirstOrDefaultAsync(x => x.UserName == userName);
            var userToChange = await authContext.Users.FindAsync(id);
            if (userToChange == null)
                return NotFound(new { message = "User Not Found" });

            var userRole = await authContext.Roles.FirstOrDefaultAsync(r => r.Id == userToVerify.RoleId);
            if (activity == true && userRole.Name != "Admin")
            {
                return BadRequest(new { message = "Only Admin can do changes" });
            }

            if (userToChange.UserName != userName && userRole.Name != "Admin")
            {
                return BadRequest(new { message = "You can do changes only to your profile" });
            }
            userToChange.IsAccountActive = activity;
           
            authContext.Users.Update(userToChange);
            await authContext.SaveChangesAsync();

            var status = activity ? "activated" : "deactivated";
            return Ok(new { message = $"User {status} successfully" });
        }


        private Task<bool> CheckEmailExistAsync(string email)
            => authContext.Users.AnyAsync(x => x.Email == email);

        private Task<bool> CheckUsernameExistAsync(string username)
            => authContext.Users.AnyAsync(x => x.UserName == username);

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
            var userRole = authContext.Roles.FirstOrDefault(r => r.Id == user.RoleId);
            var identity = new ClaimsIdentity(new Claim[]
            {
                new(ClaimTypes.Role, userRole.Name),
                new(ClaimTypes.Name,$"{user.UserName}")
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

            var tokenInUser = authContext.Users.Any(a => a.Authentication.RefreshToken == refreshToken);
            if (tokenInUser)
            {
                return CreateRefreshToken();
            }
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

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] TokenApiDto tokenApiDto)
        {
            if (tokenApiDto is null)
                return BadRequest("Invalid Client Request");
            string accessToken = tokenApiDto.AccessToken;
            string refreshToken = tokenApiDto.RefreshToken;
            var principal = GetPrincipleFromExpiredToken(accessToken);
            var username = principal.Identity.Name;
            var user = await authContext.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user is null || user.Authentication.RefreshToken != refreshToken || user.Authentication.RefreshTokenExpiryTime <= DateTime.Now)
                return BadRequest("Invalid Request");
            var newAccessToken = CreateJwt(user);
            var newRefreshToken = CreateRefreshToken();
            user.Authentication.RefreshToken = newRefreshToken;
            await authContext.SaveChangesAsync();
            return Ok(new TokenApiDto()
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
            });
        }

        [HttpPost("send-reset-email/{email}")]
        public async Task<IActionResult> SendEmail(string email)
        {
            var user = await authContext.Users.FirstOrDefaultAsync(a => a.Email == email);
            if (user is null)
            {
                return NotFound(new { StatusCode = 404, Message = "email Does Not Exist" });
            }

            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var emailToken = Convert.ToBase64String(tokenBytes);
            user.Authentication.ResetPasswordToken = emailToken;
            user.Authentication.ResetPasswordExpiry = DateTime.Now.AddDays(1);
            string from = configuration["EmailSettings:From"];
            var emailModel = new EmailModel(email, "Reset Password", 
                EmailBody.EmailStringBody(email, emailToken));
            emailService.SendEmail(emailModel);
            authContext.Entry(user).State = EntityState.Modified;
            await authContext.SaveChangesAsync();
            return Ok(new
            {
                StatusCode = 200,
                Message = "Email Sent!"
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var newToken = resetPasswordDto.EmailToken.Replace(" ", "+");
            var user = await authContext.Users.AsNoTracking()
                .FirstOrDefaultAsync(a => a.Email == resetPasswordDto.Email);
            if (user is null)
            {
                return NotFound(new
                {
                    StatusCode = 404,
                    Message = "email Does Not Exist"
                });
            }

            var tokenCode = user.Authentication.ResetPasswordToken;
            DateTime emailTokenExpiry = user.Authentication.ResetPasswordExpiry;
            if (tokenCode != resetPasswordDto.EmailToken || emailTokenExpiry < DateTime.Now)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Invalid Reset Link"
                });
            }

            user.Authentication.Password = PasswordHasher.HashPassword(resetPasswordDto.NewPassword);
            authContext.Entry(user).State = EntityState.Modified;
            await authContext.SaveChangesAsync();
            return Ok(new
            {
                StatusCode = 200,
                Message = "Password Reset Successful"
            });
        }
    }
}
