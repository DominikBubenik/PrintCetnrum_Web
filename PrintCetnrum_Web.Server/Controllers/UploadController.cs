using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Context;
using PrintCetnrum_Web.Server.Models;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly string _uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        private readonly AppDbContext _dbContext;
        public UploadController(AppDbContext dbContext)
        {
            this._dbContext = dbContext;
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        [Authorize]
        [HttpPost("uploadFiles")]
        public async Task<IActionResult> UploadFiles(List<IFormFile> files, [FromForm] string userName, [FromForm] bool shouldPrint)
        {
            if (files == null || !files.Any())
            {
                return BadRequest("No files uploaded.");
            }
            var maxFilesSize = 15 * 1024 * 1024; // 15MB per file
            
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userFolder = Path.Combine($"{_uploadsFolder}/UserData", user.UserName);
            if (!Directory.Exists(userFolder))
            {
                Directory.CreateDirectory(userFolder);
            }

            var uploadedFiles = new List<object>();
            int currentSize = 0;
            foreach (var file in files)
            {
                if (file.Length == 0)
                {
                    continue; // Skip empty files
                }
                currentSize += (int)file.Length;
                if (currentSize > maxFilesSize)
                {
                    return BadRequest($"Files are too large. Maximum size allowed is 15MB.");
                }
                var fileName = Path.GetFileName(file.FileName);
                var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
                var filePath = Path.Combine(userFolder, uniqueName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var userFile = new UserFile
                {
                    FileName = fileName,
                    UniqueName = uniqueName,
                    FilePath = $"/UserData/{user.UserName}/{uniqueName}",
                    UploadDate = DateTime.Now,
                    ShouldPrint = shouldPrint,
                    UserId = user.Id,
                    Extension = Path.GetExtension(fileName),
                    FileSize = file.Length
                };

                _dbContext.UserFiles.Add(userFile);
                uploadedFiles.Add(new
                {
                    userFile.Id,
                    userFile.FileName,
                    userFile.FilePath
                });
            }
            await _dbContext.SaveChangesAsync();
            return Ok(uploadedFiles);
        }


        [Authorize]
        [HttpGet("getUserFiles")]
        public async Task<IActionResult> GetUserFiles([FromQuery] string userName)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var files = await _dbContext.UserFiles
                .Where(uf => uf.UserId == user.Id)
                .Select(uf => new
                {
                    uf.Id,
                    uf.FileName,
                    uf.UniqueName,
                    uf.FilePath,
                    uf.Extension,
                    uf.UploadDate,
                    uf.ShouldPrint
                })
                .ToListAsync();

            return Ok(files);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFile(int id)
        {
            var file = await _dbContext.UserFiles.FindAsync(id);

            if (file == null)
            {
                return NotFound("File not found.");
            }
            var relativePath = file.FilePath.TrimStart('/');
            var fullPath = Path.Combine( _uploadsFolder, relativePath);

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _dbContext.UserFiles.Remove(file);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpPut("updatePrintStatus/{id}")]
        public async Task<IActionResult> UpdatePrintStatus(int id, [FromBody] bool shouldPrint)
        {
            var file = await _dbContext.UserFiles.FindAsync(id);

            if (file == null)
            {
                return NotFound("File not found.");
            }

            file.ShouldPrint = shouldPrint;
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpGet("getUserFile/{id}")]
        public async Task<IActionResult> GetUserFile(int id)
        {
            var file = await _dbContext.UserFiles
                .FirstOrDefaultAsync(uf => uf.Id == id);

            if (file == null)
            {
                return NotFound("File not found.");
            }
            return Ok(file);
        }

        [Authorize]
        [HttpPut("replaceFile/{id}")]
        public async Task<IActionResult> ReplaceUserFile(int id, [FromForm] IFormFile newFile)
        {
            var currentFile = await _dbContext.UserFiles
                .FirstOrDefaultAsync(uf => uf.Id == id);

            if (currentFile == null)
            {
                return NotFound("File not found.");
            }

            if (newFile == null || newFile.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == currentFile.UserId);
            if (user == null)
            {
                return BadRequest("User Id is incorrect!");
            }
            var maxFileSize = 10 * 1024 * 1024; // 10MB
            if (newFile.Length > maxFileSize)
            {
                return BadRequest("File is too large.");
            }

            var fileName = Path.GetFileName(newFile.FileName);
            var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
            var filePath = Path.Combine($"{_uploadsFolder}/UserData/{user.UserName}", uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await newFile.CopyToAsync(stream);
            }

            var userFile = new UserFile
            {
                FileName = fileName,
                UniqueName = uniqueName,
                FilePath = $"/UserData/{user.UserName}/{uniqueName}",
                UploadDate = DateTime.Now,
                ShouldPrint = currentFile.ShouldPrint, 
                UserId = currentFile.UserId,
                Extension = Path.GetExtension(fileName),
                FileSize = newFile.Length
            };

            _dbContext.UserFiles.Add(userFile);
            await _dbContext.SaveChangesAsync();

            var oldFilePath = Path.Combine(_uploadsFolder, currentFile.FilePath);
            if (System.IO.File.Exists(oldFilePath))
            {
                System.IO.File.Delete(oldFilePath);
            }

            _dbContext.UserFiles.Remove(currentFile);
            await _dbContext.SaveChangesAsync();

            return Ok(new { newFileId = userFile.Id });
        }



        [Authorize]
        [HttpGet("downloadFile/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var file = await _dbContext.UserFiles.FirstOrDefaultAsync(f => f.Id == id);
            if (file == null)
            {
                return NotFound("File not found.");
            }
            var relativePath = file.FilePath.TrimStart('/');
            var fullPath = Path.Combine(_uploadsFolder, relativePath);
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("File does not exist on the server.");
            }

            var fileName = Path.GetFileName(fullPath);
            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            var mimeType = GetMimeType(file.Extension);

            return File(fileBytes, mimeType, fileName);
        }

        private string GetMimeType(string fileExtension)
        {
            // You can customize the MIME types as needed
            switch (fileExtension.ToLower())
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".pdf":
                    return "application/pdf";
                case ".doc":
                case ".docx":
                    return "application/msword";
                case ".xls":
                case ".xlsx":
                    return "application/vnd.ms-excel";
                case ".txt":
                    return "text/plain";
                case ".csv":
                    return "text/csv";
                case ".zip":
                    return "application/zip";
                case ".mp3":
                    return "audio/mpeg";
                case ".mp4":
                    return "video/mp4";
                default:
                    return "application/octet-stream"; // Fallback for unknown types
            }
        }

        [HttpPost("getFilesWithId")]
        public async Task<IActionResult> GetFilesWithId([FromBody] List<int> listOfId)
        {
            if (listOfId == null || !listOfId.Any())
            {
                return BadRequest("List of IDs is empty or null.");
            }

            List<UserFile> files = new List<UserFile>();
            foreach (var id in listOfId)
            {
                files.Add(await _dbContext.UserFiles.FirstOrDefaultAsync(o => o.Id == id));
            }

         

            if (!files.Any())
            {
                return NotFound("No files found for the provided IDs.");
            }

            return Ok(files);
        }

    }
}
