using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DesignFileController : ControllerBase
    {
        private readonly string _designFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UserData");
        private readonly AppDbContext _dbContext;

        public DesignFileController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            if (!Directory.Exists(_designFolder))
            {
                Directory.CreateDirectory(_designFolder);
            }
        }

        [Authorize]
        [HttpPost("uploadDesignFile")]
        public async Task<IActionResult> UploadDesignFile(
            [FromForm] IFormFile designFile, 
            [FromForm] string userName, 
            [FromForm] string fileName, 
            [FromForm] string fileId, 
            [FromForm] string type)
        {
            if (designFile == null || designFile.Length == 0) return BadRequest("No file uploaded.");

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null) return NotFound("User not found.");

            var userFolder = Path.Combine(_designFolder, $"{user.UserName}/DesignFiles");
            if (!Directory.Exists(userFolder))
            {
                 Directory.CreateDirectory(userFolder);
            }
            
            var uniqueName = $"{type}_{Guid.NewGuid()}{Path.GetExtension(designFile.FileName)}";
            var filePath = Path.Combine(userFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await designFile.CopyToAsync(stream);
            }

            var userFile = new DesignFile
            {
                FileName = fileName,
                UniqueName = uniqueName,
                FilePath = $"{user.UserName}/DesignFiles/{uniqueName}",
                DateCreated = DateTime.Now,
                Type = type,
                UserId = user.Id
            };

            if (int.TryParse(fileId, out var parsedId) && parsedId > 0)
            {
                var existingFile = await _dbContext.DesignFiles.FindAsync(parsedId);
                if (existingFile != null)
                {
                    userFile.Id = parsedId;
                    DeleteExistingFile(existingFile.FilePath);
                    existingFile.FileName= fileName;
                    existingFile.FilePath= filePath;
                    existingFile.UserId = user.Id;
                    existingFile.UniqueName = uniqueName;
                    _dbContext.DesignFiles.Update(existingFile);
                }
            }
            else
            {
                _dbContext.DesignFiles.Add(userFile);
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { userFile.Id, userFile.FileName, userFile.FilePath });
        }

        private void DeleteExistingFile(string diplomaPath)
        {
            var fullPath = Path.Combine(_designFolder, diplomaPath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }

        [Authorize]
        [HttpGet("getUserDesignFiles")]
        public async Task<IActionResult> GetUserDiplomas([FromQuery] string userName, [FromQuery] string type)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var designFiles = await _dbContext.DesignFiles.Where(d => d.UserId == user.Id && d.Type == type).ToListAsync();

            return Ok(designFiles);
        }

        [Authorize]
        [HttpDelete("deleteDesignFile/{id}")]
        public async Task<IActionResult> DeleteDesignFile(int id)
        {
            var file = await _dbContext.DesignFiles.FindAsync(id);
            if (file == null)
            {
                return NotFound("File not found.");
            }
            DeleteExistingFile(file.FilePath);
            _dbContext.DesignFiles.Remove(file);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpGet("downloadDesignFile/{id}")]
        public async Task<IActionResult> DownloadDesignFile(int id)
        {
            var file = await _dbContext.DesignFiles.FirstOrDefaultAsync(d => d.Id == id);
            if (file == null)
            {
                return NotFound("File not found.");
            }

            var fullPath = Path.Combine(_designFolder, file.FilePath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("Design file does not exist on the server.");
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            var fileName = Path.GetFileName(fullPath);

            return File(fileBytes, "application/json", fileName);
        }

        [HttpPost("getDesignFileWithId")]
        public async Task<IActionResult> GetStampWithId([FromBody] int id)
        {
            var file = await _dbContext.DesignFiles.FirstOrDefaultAsync(us => us.Id == id);
            if (file == null)
            {
                return NotFound("No stamps found for the provided IDs.");
            }

            var relativePath = file.FilePath.TrimStart('/');
            var fullPath = Path.Combine(_designFolder, relativePath);
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("File does not exist on the server.");
            }

            var fileName = Path.GetFileName(fullPath);
            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);

            return File(fileBytes, "application/json", fileName);
        }
    }
}
