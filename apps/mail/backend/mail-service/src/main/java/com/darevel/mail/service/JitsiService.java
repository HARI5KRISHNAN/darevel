package com.darevel.mail.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JitsiService {

    @Value("${jitsi.app-id:darevel}")
    private String appId;

    @Value("${jitsi.secret:darevel_secret_key_for_jwt_signing}")
    private String secret;

    @Value("${jitsi.domain:localhost}")
    private String domain;

    @Value("${jitsi.port:8000}")
    private int port;

    @Value("${jitsi.secure:false}")
    private boolean secure;

    public String generateToken(String useSub, String userName, String userEmail, String roomName) {
        long now = System.currentTimeMillis();
        long expiration = now + (2 * 60 * 60 * 1000); // 2 hours

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> userClaim = new HashMap<>();
        userClaim.put("id", useSub);
        userClaim.put("name", userName);
        userClaim.put("email", userEmail);
        userClaim.put("avatar", "");
        userClaim.put("moderator", true);  // Grant moderator role

        Map<String, Object> context = new HashMap<>();
        context.put("user", userClaim);

        return Jwts.builder()
                .header()
                .add("typ", "JWT")
                .and()
                .issuer(appId)
                .subject("meet.jitsi")  // Use Jitsi's internal domain, not external domain
                .audience().add("*").and()
                .claim("room", roomName != null ? roomName : "*")
                .claim("context", context)
                .issuedAt(new Date(now))
                .notBefore(new Date(now))
                .expiration(new Date(expiration))
                .signWith(key)
                .compact();
    }

    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("domain", domain);
        config.put("port", port);
        config.put("secure", secure);
        return config;
    }
}
