using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrintCetnrum_Web.Server.Models.UserModels;

public class UserAddress
{
    [Key, ForeignKey("User")]
    public int UserId { get; set; }

    [MaxLength(50)]
    public string Street { get; set; }

    [MaxLength(50)]
    public string City { get; set; }

    [MaxLength(50)]
    public string PostCode { get; set; }

    public User User { get; set; }
}