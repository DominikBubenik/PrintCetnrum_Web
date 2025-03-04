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
        public async Task<IActionResult> UploadStamp([FromForm] IFormFile stampFile, [FromForm] string userName, [FromForm] string stampName)
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
                UserId = user.Id
            };

            _dbContext.UserStamps.Add(userStamp);
            await _dbContext.SaveChangesAsync();

            return Ok(new { userStamp.Id, userStamp.StampName, userStamp.StampPath });
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
                .Select(us => new { us.Id, us.StampName, us.StampPath })
                .ToListAsync();

            return Ok(stamps);
        }

        [Authorize]
        [HttpDelete("delete/{id}")]
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

        [HttpPost("getStampsWithId")]
        public async Task<IActionResult> GetStampsWithId([FromBody] List<int> listOfId)
        {
            if (listOfId == null || !listOfId.Any())
            {
                return BadRequest("List of IDs is empty or null.");
            }

            var stamps = await _dbContext.UserStamps
                .Where(us => listOfId.Contains(us.Id))
                .ToListAsync();

            if (!stamps.Any())
            {
                return NotFound("No stamps found for the provided IDs.");
            }

            return Ok(stamps);
        }

        [Authorize]
        [HttpPut("updateStamp/{id}")]
        public async Task<IActionResult> UpdateStamp(int id, [FromForm] IFormFile? newStampFile, [FromForm] string? newStampName)
        {
            var stamp = await _dbContext.UserStamps.FindAsync(id);
            if (stamp == null)
            {
                return NotFound("Stamp not found.");
            }

            bool isUpdated = false;

            if (!string.IsNullOrWhiteSpace(newStampName))
            {
                stamp.StampName = newStampName;
                isUpdated = true;
            }

            if (newStampFile != null && newStampFile.Length > 0)
            {
                var user = await _dbContext.Users.FindAsync(stamp.UserId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                var userFolder = Path.Combine(_stampsFolder, $"{user.UserName}/Stamps");

                var oldFilePath = Path.Combine(userFolder, stamp.UniqueName);
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }

                var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(newStampFile.FileName);
                var newFilePath = Path.Combine(userFolder, uniqueName);

                using (var stream = new FileStream(newFilePath, FileMode.Create))
                {
                    await newStampFile.CopyToAsync(stream);
                }

                stamp.UniqueName = uniqueName;
                stamp.StampPath = newFilePath;
                isUpdated = true;
            }

            if (isUpdated)
            {
                _dbContext.UserStamps.Update(stamp);
                await _dbContext.SaveChangesAsync();
            }

            return Ok(new { stamp.Id, stamp.StampName, stamp.StampPath });
        }

    }
}
