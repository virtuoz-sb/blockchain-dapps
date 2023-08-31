import { TestingModule, Test } from "@nestjs/testing";

import CipherService from "./encryption.service";

describe("encriptionService", () => {
  let sut: CipherService;
  const cipherKey = "encryptionkey_to_be_changed_kjh#";

  beforeEach(async () => {
    // findCredentialsForExchangeMock = jest.fn();

    // const keyServiceMockFactory = jest.fn<Partial<ExchangeKeyService>, []>(() => ({
    //   getDecryptedExchangeCredentials: findCredentialsForExchangeMock,
    // }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [CipherService],
    }).compile();

    sut = module.get<CipherService>(CipherService);
  });

  it("should be defined (injection set up)", () => {
    expect(sut).toBeDefined();
  });

  it("should be encrypt without errors", () => {
    const encrypted = sut.encrypt("ola", cipherKey);
    expect(encrypted).toBeDefined();
    expect(encrypted.length).toBeGreaterThanOrEqual(32); // iv 16bytes + 1 block 16 bytes= 32 bytes
  });

  it("should be decrypt without errors", () => {
    const decrypted = sut.decrypt("9bda3c7cb9c12698dadf9aaa66e5b51b6629ba565444d76cc792715d40390f85", cipherKey);
    expect(decrypted).toBe("ola");
  });

  it("should fail when decrypting invalid string", () => {
    // jest Note: You must wrap the code in a function, otherwise the error will not be caught and the assertion will fail.
    expect(() => {
      sut.decrypt("invalid", cipherKey);
    }).toThrow("decryption failed");
  });

  it("encrypt decrypt same value", () => {
    const v2 = sut.encrypt("ola", cipherKey);
    const decrypted = sut.decrypt(v2, cipherKey);
    expect(decrypted).toBe("ola");
  });

  it("should decrypt V2 without errors", () => {
    const input = "9bda3c7cb9c12698dadf9aaa66e5b51b6629ba565444d76cc792715d40390f85";
    const decrypted = sut.decrypt(input, cipherKey);
    expect(decrypted).toBe("ola");
  });

  describe("when using hmac", () => {
    it("should decryptWithHmac without errors", () => {
      const encKey = "b234567890_12345678901234567890_";
      const hmacKey = "abcdefghij_12345678901234567890_";
      const ciphered =
        "ebfe6fdc4e0ef69d2f47b0d5daa441525491a0c87aa025ca23ec4ec87ab4518aa2dd5c385fe0c4e67c974e1ea5881668fed373fa0b66272e1b249fdb8fd1dcc3";
      const decrypted = sut.decryptWithHmac(ciphered, encKey, hmacKey);
      expect(decrypted).toBe("ola");
    });

    it("decryptWithHmac should fail when ciphered data modified", () => {
      const encKey = "b234567890_12345678901234567890_";
      const hmacKey = "abcdefghij_12345678901234567890_";
      const ciphered =
        "aaaaaaaa4e0ef69d2f47b0d5daa441525491a0c87aa025ca23ec4ec87ab4518aa2dd5c385fe0c4e67c974e1ea5881668fed373fa0b66272e1b249fdb8fd1dcc3";

      expect(() => {
        sut.decryptWithHmac(ciphered, encKey, hmacKey);
      }).toThrow("hmac validation failed");
    });

    it("encrypt decrypt same value", () => {
      const hmacKey = "abcdefghij_12345678901234567890_";
      const v2 = sut.encryptWithHmac("encrypt-decrypt", cipherKey, hmacKey);
      const decrypted = sut.decryptWithHmac(v2, cipherKey, hmacKey);
      expect(decrypted).toBe("encrypt-decrypt");
    });

    it("should fail when decrypting invalid string", () => {
      const hmacKey = "abcdefghij_12345678901234567890_";
      // jest Note: You must wrap the code in a function, otherwise the error will not be caught and the assertion will fail.
      expect(() => {
        sut.decryptWithHmac("invalid", cipherKey, hmacKey);
      }).toThrow("Input buffers must have the same byte length"); // hmac failed
    });
  });
});
