namespace PrintCetnrum_Web.Server.Models.UserModels;

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public string? Street { get; set; } 
    public string? City { get; set; }    
    public string? PostCode { get; set; } 
    public bool IsAccountActive { get; set; } 
    public string? Password { get; set; }
}