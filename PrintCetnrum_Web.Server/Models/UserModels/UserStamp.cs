using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PrintCetnrum_Web.Server.Models.UserModels
{
    public class UserStamp
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StampName { get; set; }
        [Required]
        public string UniqueName { get; set; }

        [Required]
        public string StampPath { get; set; }
        [Required]
        public DateTime DateCreated { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
