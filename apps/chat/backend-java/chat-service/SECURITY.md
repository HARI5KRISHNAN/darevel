# Chat Service Security Features

## WebSocket Security Enhancements

### Dynamic Destination Routing
- **Fixed**: Removed `@SendTo` annotations that caused routing issues
- **Improved**: Using `SimpMessagingTemplate` for dynamic destination resolution
- Messages now correctly route to `/topic/messages/{channelId}`
- Call signals route to `/topic/call-signal/{userId}`

### WebSocket Endpoints
- **Primary**: `ws://localhost:8082/ws` (raw WebSocket)
- **Fallback**: `ws://localhost:8082/ws` (SockJS for older browsers)
- **Production**: Use WSS (TLS) via reverse proxy (Nginx/ALB)

## Encryption Features

### Server-Side Encryption (Optional)

The chat service supports **optional** server-side encryption using AES-GCM. This is **disabled by default** because:
- End-to-End Encryption (E2EE) is preferred for privacy
- Server-side encryption is only needed when the server must process plaintext (search, moderation)

#### Enable Server-Side Encryption
```yaml
chat:
  encryption:
    enabled: true
```

Or via environment variable:
```bash
CHAT_ENCRYPTION_ENABLED=true
```

### Encryption Components

#### 1. CryptoUtil
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **IV Length**: 12 bytes (96 bits)
- **Tag Length**: 128 bits
- **Key Generation**: Secure random AES-256 keys
- **Base64 Encoding**: For database storage

#### 2. AttachmentEncryptionService
- Encrypts file attachments with unique AES keys
- Wraps AES keys using KMS (Key Management Service)
- **KMS Integration Required**: Replace placeholder with:
  - AWS KMS (`aws-java-sdk-kms`)
  - Google Cloud KMS (`google-cloud-kms`)
  - Azure Key Vault (`azure-security-keyvault-keys`)
  - HashiCorp Vault

#### 3. Message Entity Encryption Fields
```java
@Column(name = "encryption_iv")
private String encryptionIv;

@Column(name = "wrapped_message_key")
private String wrappedMessageKey;

@Column(name = "is_encrypted")
private Boolean isEncrypted = false;
```

### Database Schema Updates

Run these migrations to add encryption fields:

```sql
ALTER TABLE messages ADD COLUMN encryption_iv VARCHAR(255);
ALTER TABLE messages ADD COLUMN wrapped_message_key TEXT;
ALTER TABLE messages ADD COLUMN is_encrypted BOOLEAN DEFAULT false;
```

## Security Best Practices

### Production Deployment

1. **Use WSS (WebSocket Secure)**
   - Configure TLS termination at reverse proxy (Nginx/ALB)
   - Update client to use `wss://` instead of `ws://`

2. **Integrate Real KMS**
   ```java
   // Replace in AttachmentEncryptionService.KmsClient:
   public byte[] wrapKey(byte[] keyToWrap) {
       // AWS KMS Example:
       KmsClient kmsClient = KmsClient.create();
       EncryptRequest request = EncryptRequest.builder()
           .keyId("arn:aws:kms:region:account:key/xxx")
           .plaintext(SdkBytes.fromByteArray(keyToWrap))
           .build();
       return kmsClient.encrypt(request).ciphertextBlob().asByteArray();
   }
   ```

3. **Never Log Plaintext**
   - Message content is never logged in production mode
   - Encryption keys are never logged
   - Use structured logging with sensitive data redaction

4. **Use E2EE for Maximum Privacy**
   - Clients encrypt messages with recipient's public key
   - Server stores and relays ciphertext without decrypting
   - Disable server-side encryption (`chat.encryption.enabled=false`)

5. **Secure Database**
   - Enable PostgreSQL SSL/TLS
   - Use encrypted storage (AWS RDS encryption, Azure encryption at rest)
   - Restrict database access to service IPs only

## Testing

### Test WebSocket Routing
```javascript
// Client connects to WebSocket
const socket = new SockJS('http://localhost:8082/ws');
const stompClient = Stomp.over(socket);

// Subscribe to channel messages
stompClient.subscribe('/topic/messages/dm-1-2', (message) => {
    console.log('Received:', JSON.parse(message.body));
});

// Send message
stompClient.send('/app/chat/dm-1-2/send', {}, JSON.stringify({
    userId: 1,
    content: 'Hello!'
}));
```

### Test Call Signaling
```javascript
// Subscribe to call signals for user 2
stompClient.subscribe('/topic/call-signal/2', (signal) => {
    console.log('Incoming call signal:', JSON.parse(signal.body));
});

// Send call signal to user 2
stompClient.send('/app/call-signal/2', {}, JSON.stringify({
    type: 'offer',
    from: 1,
    to: 2,
    channelId: 'dm-1-2',
    offer: { /* WebRTC SDP */ }
}));
```

### Test Encryption
```bash
# Enable encryption
CHAT_ENCRYPTION_ENABLED=true ./mvnw spring-boot:run

# Send encrypted message via API
curl -X POST http://localhost:8082/api/chat/dm-1-2/messages \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"content":"Secret message"}'

# Verify database stores ciphertext
psql -d darevel_chat -c "SELECT content, encryption_iv, is_encrypted FROM messages ORDER BY id DESC LIMIT 1;"
```

## Security Warnings

⚠️ **DO NOT USE IN PRODUCTION WITHOUT:**
1. Real KMS integration (current KMS client is a placeholder)
2. TLS/WSS for WebSocket connections
3. Database encryption at rest
4. Proper key rotation policies
5. Security audit and penetration testing

⚠️ **PREFER E2EE OVER SERVER-SIDE ENCRYPTION:**
- Server-side encryption means the server can read messages
- E2EE ensures only sender and recipient can read messages
- Use server-side encryption only when server processing is required

## References

- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#websocket)
- [NIST AES-GCM Recommendations](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-38d.pdf)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)
