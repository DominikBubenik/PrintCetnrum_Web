using PrintCetnrum_Web.Server.Models.UserModels;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PrintCetnrum_Web.Server.Models.OrderModels
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Order")]
        public int OrderId { get; set; }  

        public Order Order { get; set; }

        [ForeignKey("UserFile")]
        public int UserFileId { get; set; } 

        public UserFile UserFile { get; set; }

        [Required]
        public int Count { get; set; }
        [Required]
        public decimal Price { get; set; }
    }
}
