using System.ComponentModel.DataAnnotations;

namespace PrintCetnrum_Web.Server.Models
{
    public class PrizeList
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ItemName { get; set; }

        [Required]
        public decimal Price { get; set; }  
    }
}
