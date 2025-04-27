using NUnit.Framework;
using System;
using PrintCetnrum_Web.Server.Helpers;

namespace Testing
{
    [TestFixture]
    public class PasswordHasherTest
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void HashPassword_ShouldReturnValidBase64String()
        {
            var password = "Password123!";
            var hash = PasswordHasher.HashPassword(password);
            Assert.IsNotNull(hash);
            Assert.IsTrue(IsBase64String(hash));
        }
        private bool IsBase64String(string base64)
        {
            Span<byte> buffer = new Span<byte>(new byte[base64.Length * 3 / 4]);

            return base64.Length % 4 == 0 && Convert.TryFromBase64String(base64, buffer, out int bytesParsed);
        }

        [Test]
        public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
        {
            var password = "Password123!";
            var hash = PasswordHasher.HashPassword(password);
            var result = PasswordHasher.VerifyPassword(password, hash);
            Assert.IsTrue(result);
        }

        [Test]
        public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
        {
            var password = "Password123!";
            var wrongPassword = "WrongPassword!";
            var hash = PasswordHasher.HashPassword(password);
            var result = PasswordHasher.VerifyPassword(wrongPassword, hash);
            Assert.IsFalse(result);
        }

        [Test]
        public void VerifyPassword_ShouldReturnFalse_ForEmptyPassword()
        {
            var password = "Password123!";
            var hash = PasswordHasher.HashPassword(password);
            var result = PasswordHasher.VerifyPassword("", hash);
            Assert.IsFalse(result);
        }

        [Test]
        public void HashPassword_ShouldReturnDifferentHashes_ForDifferentPasswords()
        {
            var password1 = "Password123!";
            var password2 = "DifferentPassword!";
            var hash1 = PasswordHasher.HashPassword(password1);
            var hash2 = PasswordHasher.HashPassword(password2);
            Assert.AreNotEqual(hash1, hash2);
        }
    }
}