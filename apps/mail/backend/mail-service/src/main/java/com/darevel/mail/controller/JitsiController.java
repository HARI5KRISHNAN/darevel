package com.darevel.mail.controller;

import com.darevel.mail.service.JitsiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/jitsi")
public class JitsiController {

    private static final Logger log = LoggerFactory.getLogger(JitsiController.class);

    @Autowired
    private JitsiService jitsiService;

    // Extract user info from Keycloak JWT token
    private Map<String, String> getUserFromJwt(Jwt jwt) {
        Map<String, String> user = new HashMap<>();
        if (jwt != null) {
            user.put("sub", jwt.getSubject());
            user.put("name", jwt.getClaimAsString("name"));
            user.put("preferred_username", jwt.getClaimAsString("preferred_username"));
            user.put("email", jwt.getClaimAsString("email"));
        }
        return user;
    }

    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> getToken(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(value = "room", defaultValue = "*") String room) {
        Map<String, String> user = getUserFromJwt(jwt);

        if (user.get("sub") == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "User information not found in token");
            return ResponseEntity.badRequest().body(response);
        }

        String token = jitsiService.generateToken(
                user.get("sub"),
                user.get("name") != null ? user.get("name") : user.get("preferred_username"),
                user.get("email"),
                room
        );

        log.info("Jitsi token generated for {}", user.get("name"));

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("token", token);
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.get("sub"));
        userData.put("name", user.get("name") != null ? user.get("name") : user.get("preferred_username"));
        userData.put("email", user.get("email"));
        response.put("user", userData);
        response.put("expiresIn", 7200);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/token")
    public ResponseEntity<Map<String, Object>> generateTokenForRoom(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {
        Map<String, String> user = getUserFromJwt(jwt);
        String roomName = (String) body.get("roomName");

        if (user.get("sub") == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "User information not found in token");
            return ResponseEntity.badRequest().body(response);
        }

        if (roomName == null || roomName.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "Room name is required");
            return ResponseEntity.badRequest().body(response);
        }

        String token = jitsiService.generateToken(
                user.get("sub"),
                user.get("name") != null ? user.get("name") : user.get("preferred_username"),
                user.get("email"),
                roomName
        );

        log.info("Jitsi token generated for {} (room: {})", user.get("name"), roomName);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("token", token);
        response.put("roomName", roomName);
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.get("sub"));
        userData.put("name", user.get("name") != null ? user.get("name") : user.get("preferred_username"));
        userData.put("email", user.get("email"));
        response.put("user", userData);
        response.put("expiresIn", 7200);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("config", jitsiService.getConfig());
        return ResponseEntity.ok(response);
    }
}
