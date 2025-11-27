package com.darevel.chat.security;

import javax.crypto.SecretKey;
import java.util.Base64;

import com.darevel.chat.security.CryptoUtil.EncryptedResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AttachmentEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentEncryptionService.class);

    // Replace these stubs with your KMS client (AWS KMS / Google KMS / Azure Key Vault)
    private final KmsClient kmsClient = new KmsClient();

    /**
     * Encrypts raw bytes, wraps AES key with KMS master key, and returns metadata.
     */
    public AttachmentEncryptedPackage encryptAndWrapKey(byte[] fileBytes) throws Exception {
        SecretKey aesKey = CryptoUtil.generateAesKey();
        EncryptedResult encrypted = CryptoUtil.encryptAesGcm(fileBytes, aesKey);

        // Wrap the AES key with KMS — replace with real KMS call
        byte[] wrappedKey = kmsClient.wrapKey(aesKey.getEncoded());

        AttachmentEncryptedPackage pkg = new AttachmentEncryptedPackage();
        pkg.setIvBase64(CryptoUtil.base64(encrypted.getIv()));
        pkg.setCiphertextBase64(CryptoUtil.base64(encrypted.getCipherText()));
        pkg.setWrappedKeyBase64(Base64.getEncoder().encodeToString(wrappedKey));

        return pkg;
    }

    /**
     * Decrypt using wrapped key retrieved from KMS.
     */
    public byte[] unwrapAndDecrypt(AttachmentEncryptedPackage pkg) throws Exception {
        byte[] wrappedKey = Base64.getDecoder().decode(pkg.getWrappedKeyBase64());
        byte[] aesKeyBytes = kmsClient.unwrapKey(wrappedKey); // uses KMS to unwrap
        SecretKey aesKey = CryptoUtil.secretKeyFromBytes(aesKeyBytes);

        EncryptedResult encrypted = new EncryptedResult(
                CryptoUtil.fromBase64(pkg.getIvBase64()),
                CryptoUtil.fromBase64(pkg.getCiphertextBase64())
        );

        return CryptoUtil.decryptAesGcm(encrypted, aesKey);
    }

    // Simple DTO for passing encrypted data/metadata
    public static class AttachmentEncryptedPackage {
        private String ivBase64;
        private String ciphertextBase64;
        private String wrappedKeyBase64;

        // getters & setters
        public String getIvBase64() { return ivBase64; }
        public void setIvBase64(String ivBase64) { this.ivBase64 = ivBase64; }
        public String getCiphertextBase64() { return ciphertextBase64; }
        public void setCiphertextBase64(String ciphertextBase64) { this.ciphertextBase64 = ciphertextBase64; }
        public String getWrappedKeyBase64() { return wrappedKeyBase64; }
        public void setWrappedKeyBase64(String wrappedKeyBase64) { this.wrappedKeyBase64 = wrappedKeyBase64; }
    }

    /**
     * Placeholder KMS client. Replace with your cloud provider's SDK or HashiCorp Vault.
     */
    private static class KmsClient {
        // Wrap (encrypt) key with master key
        public byte[] wrapKey(byte[] keyToWrap) {
            // TODO: Replace with AWS KMS Encrypt / GCP KMS encryptKey / Azure KeyVault wrapKey
            log.warn("KmsClient.wrapKey called — replace with real KMS integration");
            return keyToWrap; // insecure stub: DO NOT use in production
        }

        // Unwrap (decrypt) key using KMS
        public byte[] unwrapKey(byte[] wrappedKey) {
            log.warn("KmsClient.unwrapKey called — replace with real KMS integration");
            return wrappedKey; // insecure stub: DO NOT use in production
        }
    }
}
