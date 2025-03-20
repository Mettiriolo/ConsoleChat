using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System;
using System.Security.Cryptography;

namespace RazorPageChat.Services
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string hashedPassword, string providedPassword);
    }

    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            // 生成随机的盐值
            byte[] salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // 使用PBKDF2算法派生密钥
            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            // 将盐值和哈希值组合起来存储
            return $"{Convert.ToBase64String(salt)}:{hashed}";
        }

        public bool VerifyPassword(string hashedPassword, string providedPassword)
        {
            // 分离出存储的盐值和哈希值
            var parts = hashedPassword.Split(':', 2);
            if (parts.Length != 2)
            {
                return false;
            }

            var salt = Convert.FromBase64String(parts[0]);
            var storedHash = parts[1];

            // 使用相同的盐值和算法重新计算哈希值
            string computedHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: providedPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            // 比较计算得到的哈希值和存储的哈希值
            return storedHash == computedHash;
        }
    }
} 