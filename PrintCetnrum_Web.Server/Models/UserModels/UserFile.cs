using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PrintCetnrum_Web.Server.Models.UserModels
{
    public class UserFile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; }
        [Required]
        public string UniqueName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [Required]
        public DateTime UploadDate { get; set; }

        [Required]
        public bool ShouldPrint { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public User User { get; set; }

        public string Extension { get; set; }

        public long FileSize { get; set; }
    }
}
