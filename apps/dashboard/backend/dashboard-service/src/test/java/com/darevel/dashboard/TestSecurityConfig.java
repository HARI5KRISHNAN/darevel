package com.darevel.dashboard;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.time.Instant;
import java.util.Map;

@TestConfiguration
public class TestSecurityConfig {

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> Jwt.withTokenValue(token)
                .headers(headers -> headers.put("alg", "none"))
                .claims(claims -> claims.putAll(Map.of(
                        "sub", "11111111-2222-3333-4444-555555555555",
                        "org_id", "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
                )))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
    }
}
