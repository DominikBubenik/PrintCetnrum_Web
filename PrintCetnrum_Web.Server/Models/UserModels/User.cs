﻿using System.ComponentModel.DataAnnotations;

namespace PrintCetnrum_Web.Server.Models.UserModels
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Token { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public string ResetPasswordToken { get; set; }
        public DateTime ResetPasswordExpiry { get; set; }
        public DateTime AcountCreated { get; set; }

    }
}
