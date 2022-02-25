using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace shrtlnk.Services.Authentication
{
  public class PasswordService
  {
    private readonly int saltIndex = 0;
    private readonly int keyIndex = 1;

    public string HashPassword(string password)
    {
      byte[] salt = GenerateSalt();
      byte[] key = Encrypt(password, salt);

      return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }

    public string GetSalt(string storedHash)
    {
      return ByteArrayToString(Convert.FromBase64String(storedHash.Split('.')[saltIndex]));
    }

    public bool VerifyPassword(string storedHash, string passwordToCheck)
    {
      string[] parts = storedHash.Split('.');
      byte[] salt = Convert.FromBase64String(parts[saltIndex]);
      byte[] key = Convert.FromBase64String(parts[keyIndex]);

      byte[] check = Encrypt(passwordToCheck, salt);

      return CheckEquality(key, check);
    }

    private byte[] GenerateSalt()
    {
      byte[] salt = new byte[128 / 8];
      using (var rng = RandomNumberGenerator.Create())
      {
        rng.GetBytes(salt);
      }

      return salt;
    }

    private byte[] Encrypt(string password, byte[] salt)
    {
      return KeyDerivation.Pbkdf2(
          password: password,
          salt: salt,
          prf: KeyDerivationPrf.HMACSHA512,
          iterationCount: 10000,
          numBytesRequested: 256 / 8);
    }

    private bool CheckEquality(byte[] one, byte[] two)
    {
      bool equal = true;

      if (one.Length == two.Length)
      {
        for (int i = 0; i < one.Length && equal; i++)
        {
          equal = one[i] == two[i];
        }
      }
      else
      {
        equal = false;
      }

      return equal;
    }

    private string ByteArrayToString(byte[] arr)
    {
      string allBytes = "[";
      for (int i = 0; i < arr.Length; i++)
      {
        allBytes += arr[i];
        if (i + 1 < arr.Length)
        {
          allBytes += ",";
        }
      }
      allBytes += "]";
      return allBytes;
    }
  }
}
