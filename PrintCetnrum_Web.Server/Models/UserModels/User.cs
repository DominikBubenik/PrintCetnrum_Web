using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrintCetnrum_Web.Server.Models.UserModels
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        public string FirstName { get; set; }

        [MaxLength(50)]
        public string LastName { get; set; }

        [MaxLength(50), Required]
        public string UserName { get; set; }

        [MaxLength(255), Required]
        public string Email { get; set; }

        public bool IsAccountActive { get; set; } = true;

        public DateTime AccountCreated { get; set; } = DateTime.UtcNow;

        [ForeignKey("Role")]
        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        public Role Role { get; set; }
        public UserAuthentication Authentication { get; set; }
        public UserAddress? Address { get; set; }
    }
}