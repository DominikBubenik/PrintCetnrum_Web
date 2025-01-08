using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly string _uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UserData");
        private readonly AppDbContext _dbContext;
        public UploadController(AppDbContext dbContext)
        {
            this._dbContext = dbContext;
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        [HttpPost("uploadImage")]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] string userName, [FromForm] bool shouldPrint)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var fileName = Path.GetFileName(file.FileName);
            var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
            var filePath = Path.Combine(_uploadsFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userFile = new UserFile
            {
                FileName = fileName,
                UniqueName = uniqueName,
                FilePath = $"/UserData/{uniqueName}",
                UploadDate = DateTime.Now,
                ShouldPrint = shouldPrint,
                UserId = user.Id,
                Extension = Path.GetExtension(fileName),
                FileSize = file.Length
            };

            _dbContext.UserFiles.Add(userFile);
            await _dbContext.SaveChangesAsync();

           
            return Ok(new { filePath = $"/UserData/{uniqueName}" });
        }
    }
}
