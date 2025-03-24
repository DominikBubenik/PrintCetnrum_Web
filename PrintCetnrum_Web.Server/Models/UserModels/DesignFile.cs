using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrintCetnrum_Web.Server.Models.UserModels;

public class DesignFile
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
    public DateTime DateCreated { get; set; }
    public string Type { get; set; }
    [ForeignKey("User")]
    public int UserId { get; set; }
    public User User { get; set; }
}