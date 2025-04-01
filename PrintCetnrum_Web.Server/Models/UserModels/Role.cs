using System.ComponentModel.DataAnnotations;

namespace PrintCetnrum_Web.Server.Models.UserModels;

public class Role
{
    [Key]
    public int Id { get; set; }

    [MaxLength(100), Required]
    public string Name { get; set; }
}