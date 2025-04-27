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
        [Required]
        public int UserFileId { get; set; }

        [Required]
        public bool IsDesignFile { get; set; }

        [Required]
        public int Count { get; set; }
        [Required]
        public decimal Price { get; set; }
        [MaxLength(50)]
        public string Color { get; set; }
        [MaxLength(50)]
        public string PaperType { get; set; }
        [MaxLength(50)]
        public string Size { get; set; }
        [MaxLength(255)]
        public string Description { get; set; }
    }
}
