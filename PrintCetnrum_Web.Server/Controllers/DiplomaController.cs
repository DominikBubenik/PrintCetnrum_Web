using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiplomaController : ControllerBase
    {
        private readonly string _diplomasFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UserData");
        private readonly AppDbContext _dbContext;

        public DiplomaController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            if (!Directory.Exists(_diplomasFolder))
            {
                Directory.CreateDirectory(_diplomasFolder);
            }
        }

        [Authorize]
        [HttpPost("uploadDiploma")]
        public async Task<IActionResult> UploadDiploma([FromForm] IFormFile diplomaFile, [FromForm] string userName, [FromForm] string diplomaName, [FromForm] string diplomaId)
        {
            if (diplomaFile == null || diplomaFile.Length == 0)
            {
                return BadRequest("No diploma uploaded.");
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userFolder = Path.Combine(_diplomasFolder, $"{user.UserName}/Diplomas");
            if (!Directory.Exists(userFolder))
            {
                Directory.CreateDirectory(userFolder);
            }

            var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(diplomaFile.FileName);
            var filePath = Path.Combine(userFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await diplomaFile.CopyToAsync(stream);
            }

            var userDiploma = new UserDiploma
            {
                DiplomaName = diplomaName,
                UniqueName = uniqueName,
                DiplomaPath = $"{user.UserName}/Diplomas/{uniqueName}",
                DateCreated = DateTime.Now,
                UserId = user.Id
            };

            if (!string.IsNullOrEmpty(diplomaId) && int.TryParse(diplomaId, out var parsedId))
            {
                if (parsedId > 0)
                {
                    userDiploma.Id = parsedId;
                    var existingDiploma = await _dbContext.UserDiplomas.FindAsync(userDiploma.Id);
                    if (existingDiploma != null)
                    {
                        var existingDiplomaPath = Path.Combine(_diplomasFolder, existingDiploma.DiplomaPath.TrimStart('/'));
                        if (System.IO.File.Exists(existingDiplomaPath))
                        {
                            System.IO.File.Delete(existingDiplomaPath);
                        }
                        existingDiploma.DiplomaName = userDiploma.DiplomaName;
                        existingDiploma.DiplomaPath = userDiploma.DiplomaPath;
                        existingDiploma.UserId = user.Id;
                        existingDiploma.UniqueName = userDiploma.UniqueName;
                        _dbContext.UserDiplomas.Update(existingDiploma);
                    }
                }
                else
                {
                    _dbContext.UserDiplomas.Add(userDiploma);
                }
            }
            await _dbContext.SaveChangesAsync();

            return Ok(new { userDiploma.Id, userDiploma.DiplomaName, userDiploma.DiplomaPath });
        }

        [Authorize]
        [HttpGet("getUserDiplomas")]
        public async Task<IActionResult> GetUserDiplomas([FromQuery] string userName)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var diplomas = await _dbContext.UserDiplomas
                .Where(ud => ud.UserId == user.Id)
                .ToListAsync();

            return Ok(diplomas);
        }

        [Authorize]
        [HttpDelete("deleteDiploma/{id}")]
        public async Task<IActionResult> DeleteDiploma(int id)
        {
            var diploma = await _dbContext.UserDiplomas.FindAsync(id);
            if (diploma == null)
            {
                return NotFound("Diploma not found.");
            }

            var fullPath = Path.Combine(_diplomasFolder, diploma.DiplomaPath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _dbContext.UserDiplomas.Remove(diploma);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpGet("downloadDiploma/{id}")]
        public async Task<IActionResult> DownloadDiploma(int id)
        {
            var diploma = await _dbContext.UserDiplomas.FirstOrDefaultAsync(d => d.Id == id);
            if (diploma == null)
            {
                return NotFound("Diploma not found.");
            }

            var fullPath = Path.Combine(_diplomasFolder, diploma.DiplomaPath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("Diploma file does not exist on the server.");
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            var fileName = Path.GetFileName(fullPath);

            return File(fileBytes, "application/json", fileName);
        }

        [HttpPost("getDiplomaWithId")]
        public async Task<IActionResult> GetStampWithId([FromBody] int id)
        {
            var diploma = await _dbContext.UserDiplomas.FirstOrDefaultAsync(us => us.Id == id);

            if (diploma == null)
            {
                return NotFound("No stamps found for the provided IDs.");
            }

            var relativePath = diploma.DiplomaPath.TrimStart('/');
            var fullPath = Path.Combine(_diplomasFolder, relativePath);
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
