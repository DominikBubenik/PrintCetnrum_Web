using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StampController : ControllerBase
    {
        private readonly string _stampsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UserData");
        private readonly AppDbContext _dbContext;

        public StampController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            if (!Directory.Exists(_stampsFolder))
            {
                Directory.CreateDirectory(_stampsFolder);
            }
        }

        [Authorize]
        [HttpPost("uploadStamp")]
        public async Task<IActionResult> UploadStamp([FromForm] IFormFile stampFile, [FromForm] string userName, [FromForm] string stampName, [FromForm] string type,[FromForm] string stampId)
        {
            if (stampFile == null || stampFile.Length == 0)
            {
                return BadRequest("No stamp uploaded.");
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userFolder = Path.Combine(_stampsFolder, $"{user.UserName}/Stamps");
            if (!Directory.Exists(userFolder))
            {
                Directory.CreateDirectory(userFolder);
            }

            var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(stampFile.FileName);
            var filePath = Path.Combine(userFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await stampFile.CopyToAsync(stream);
            }

            var userStamp = new UserStamp
            {
                StampName = stampName,
                UniqueName = uniqueName,
                StampPath = $"{user.UserName}/Stamps/{uniqueName}",
                StampType = type,
                UserId = user.Id
            };

            if (!string.IsNullOrEmpty(stampId) && int.TryParse(stampId, out var parsedId))
            {
                if (parsedId > 0)
                {
                    userStamp.Id = parsedId;
                    var existingStamp = await _dbContext.UserStamps.FindAsync(userStamp.Id);
                    if (existingStamp != null)
                    {
                        var existingStampPath = Path.Combine(_stampsFolder, existingStamp.StampPath.TrimStart('/'));
                        if (System.IO.File.Exists(existingStampPath))
                        {
                            System.IO.File.Delete(existingStampPath);
                        }
                        existingStamp.StampName = userStamp.StampName;
                        existingStamp.StampPath = userStamp.StampPath;
                        existingStamp.StampType = userStamp.StampType;
                        existingStamp.UserId = user.Id;
                        existingStamp.UniqueName = userStamp.UniqueName;
                        _dbContext.UserStamps.Update(existingStamp);
                    }   
                }
                else
                {
                    _dbContext.UserStamps.Add(userStamp);
                }
            }
            await _dbContext.SaveChangesAsync();

            return Ok(new { userStamp.Id, userStamp.StampName, userStamp.StampPath, userStamp.StampType });
        }

        [Authorize]
        [HttpGet("getUserStamps")]
        public async Task<IActionResult> GetUserStamps([FromQuery] string userName)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var stamps = await _dbContext.UserStamps
                .Where(us => us.UserId == user.Id)
                .ToListAsync();

            return Ok(stamps);
        }

        [Authorize]
        [HttpDelete("deleteStamp/{id}")]
        public async Task<IActionResult> DeleteStamp(int id)
        {
            var stamp = await _dbContext.UserStamps.FindAsync(id);
            if (stamp == null)
            {
                return NotFound("Stamp not found.");
            }

            var fullPath = Path.Combine(_stampsFolder, stamp.StampPath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _dbContext.UserStamps.Remove(stamp);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpGet("downloadStamp/{id}")]
        public async Task<IActionResult> DownloadStamp(int id)
        {
            var stamp = await _dbContext.UserStamps.FirstOrDefaultAsync(s => s.Id == id);
            if (stamp == null)
            {
                return NotFound("Stamp not found.");
            }

            var fullPath = Path.Combine(_stampsFolder, stamp.StampPath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("Stamp file does not exist on the server.");
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            var fileName = Path.GetFileName(fullPath);

            return File(fileBytes, "application/json", fileName);
        }

        [HttpPost("getStampWithId")]
        public async Task<IActionResult> GetStampWithId([FromBody] int id)
        {
            var stamp = await _dbContext.UserStamps.FirstOrDefaultAsync(us => us.Id == id);

            if (stamp == null)
            {
                return NotFound("No stamps found for the provided IDs.");
            }

            var relativePath = stamp.StampPath.TrimStart('/');
            var fullPath = Path.Combine(_stampsFolder, relativePath);
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("File does not exist on the server.");
            }

            var fileName = Path.GetFileName(fullPath);
            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);

            var response = new
            {
                stamp.StampName,
                stamp.StampType,
                StampFile = File(fileBytes, "application/json", fileName)
            };

            return File(fileBytes, "application/json", fileName);
        }
    }
}
