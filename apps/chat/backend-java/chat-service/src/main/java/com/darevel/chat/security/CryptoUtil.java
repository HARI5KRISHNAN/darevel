package com.darevel.chat.security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

public final class CryptoUtil {

    private CryptoUtil() {}

    public static final int AES_KEY_SIZE = 256; // bits
    public static final int GCM_IV_LENGTH = 12; // bytes
    public static final int GCM_TAG_LENGTH = 128; // bits

    public static SecretKey generateAesKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(AES_KEY_SIZE);
        return keyGen.generateKey();
    }

    public static EncryptedResult encryptAesGcm(byte[] plaintext, SecretKey key) throws Exception {
        byte[] iv = new byte[GCM_IV_LENGTH];
        SecureRandom rnd = new SecureRandom();
        rnd.nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);

        byte[] ciphertext = cipher.doFinal(plaintext);

        return new EncryptedResult(iv, ciphertext);
    }

    public static byte[] decryptAesGcm(EncryptedResult encrypted, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, encrypted.getIv());
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        return cipher.doFinal(encrypted.getCipherText());
    }

    // Utilities to encode keys/ciphertext to base64 for DB/storage
    public static String base64(byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }

    public static byte[] fromBase64(String s) {
        return Base64.getDecoder().decode(s);
    }

    public static SecretKey secretKeyFromBytes(byte[] keyBytes) {
        return new SecretKeySpec(keyBytes, "AES");
    }

    public static class EncryptedResult {
        private final byte[] iv;
        private final byte[] cipherText;

        public EncryptedResult(byte[] iv, byte[] cipherText) {
            this.iv = iv;
            this.cipherText = cipherText;
        }

        public byte[] getIv() { return iv; }
        public byte[] getCipherText() { return cipherText; }
    }
}
