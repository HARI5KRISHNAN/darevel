package com.darevel.chat.service;

import com.darevel.chat.dto.AuthRequest;
import com.darevel.chat.dto.AuthResponse;
import com.darevel.chat.model.User;
import com.darevel.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;

    public AuthResponse register(AuthRequest request) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User already exists with email: " + request.getEmail());
        }

        // Create new user (in production, use bcrypt to hash password)
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()) // TODO: Hash this in production
                .avatar("https://ui-avatars.com/api/?name=" + encodeURIComponent(request.getName()) + "&background=random")
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Generate a simple token (in production, use JWT)
        String token = "token_" + UUID.randomUUID().toString();

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDTO.builder()
                        .id(savedUser.getId())
                        .name(savedUser.getName())
                        .email(savedUser.getEmail())
                        .avatar(savedUser.getAvatar())
                        .build())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // In production, use bcrypt.matches() to verify password
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate a simple token (in production, use JWT)
        String token = "token_" + UUID.randomUUID().toString();

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .avatar(user.getAvatar())
                        .build())
                .build();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteAllUsers() {
        userRepository.deleteAll();
    }

    private String encodeURIComponent(String s) {
        try {
            return java.net.URLEncoder.encode(s, "UTF-8").replace("+", "%20");
        } catch (java.io.UnsupportedEncodingException e) {
            return s;
        }
    }
}
