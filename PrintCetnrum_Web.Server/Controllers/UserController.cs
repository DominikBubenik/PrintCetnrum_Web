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

            if (user == null)
                return NotFound(new { message = "User Not Found" });

            return Ok(new { message = "Login success" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User userParam)
        {
            if (userParam == null)
                return BadRequest();

            var user = await _authContext.Users.SingleOrDefaultAsync(x => x.UserName == userParam.UserName);

            if (user != null)
                return BadRequest(new { message = "Username already exists" });

            await _authContext.Users.AddAsync(userParam);
            await _authContext.SaveChangesAsync();

            return Ok(new { message = "User Created Successfully" });
        }
    }
}
