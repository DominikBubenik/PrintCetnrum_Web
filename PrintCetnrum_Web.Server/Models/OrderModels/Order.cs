using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Models.OrderModels
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string OrderName { get; set; }

        [Required]
        public DateTime OrderCreated { get; set; }

        [Required]
        public bool IsPreparedForCustomer { get; set; }

        [Required]
        public bool IsTakenByCustomer { get; set; }

        [Required]
        public decimal TotalPrice { get; set; }
        public DateTime? OrderFinished { get; set; }
        public DateTime? OrderTakenTime { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public User User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; }
    }
}
