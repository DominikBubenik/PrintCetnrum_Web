using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrintCetnrum_Web.Server.Models.UserModels;

public class UserAuthentication
{
    [Key, ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Password { get; set; }

    [MaxLength(255)]
    public string Token { get; set; }

    [MaxLength(255)]
    public string RefreshToken { get; set; }

    public DateTime RefreshTokenExpiryTime { get; set; }

    [MaxLength(255)]
    public string ResetPasswordToken { get; set; }

    public DateTime ResetPasswordExpiry { get; set; }

    public User User { get; set; }
}
