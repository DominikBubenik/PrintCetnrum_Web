using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrintCetnrum_Web.Server.Models.UserModels;

public class DesignFile
{
    [Key]
    public int Id { get; set; }
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; }
    [Required]
    [MaxLength(255)]
    public string UniqueName { get; set; }
    [Required]
    [MaxLength(255)]
    public string FilePath { get; set; }
    [Required]
    public DateTime DateCreated { get; set; }
    [Required]
    public bool ShouldPrint { get; set; }
    [MaxLength(50)]
    public string Type { get; set; }
    [ForeignKey("User")]
    public int UserId { get; set; }
    public User User { get; set; }
}