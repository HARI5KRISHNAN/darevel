package com.darevel.auth.service;

import com.darevel.auth.dto.AuthResponse;
import com.darevel.auth.dto.LoginRequest;
import com.darevel.auth.dto.RegisterRequest;
import com.darevel.common.dto.UserDto;
import com.darevel.auth.model.User;
import com.darevel.auth.repository.UserRepository;
import com.darevel.common.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with email " + request.getEmail() + " already exists");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAvatar(request.getAvatar());
        user.setLevel("Elementary");

        user = userRepository.save(user);

        // Generate token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, convertToDto(user));
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, convertToDto(user));
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearAllUsers() {
        userRepository.deleteAll();
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDto(user);
    }

    /**
     * Find user by email, or create a new user if they don't exist (for Keycloak SSO users)
     */
    @Transactional
    public UserDto findOrCreateUserByEmail(String email, String name) {
        return userRepository.findByEmail(email)
                .map(this::convertToDto)
                .orElseGet(() -> {
                    // Create a new user for Keycloak SSO user
                    User user = new User();
                    user.setEmail(email);
                    user.setName(name != null ? name : email.split("@")[0]);
                    user.setPasswordHash("KEYCLOAK_SSO_USER"); // Placeholder - user authenticates via Keycloak
                    user.setLevel("Elementary");
                    user = userRepository.save(user);
                    return convertToDto(user);
                });
    }

    private UserDto convertToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatar(),
                user.getLevel(),
                user.getCreatedAt()
        );
    }
}
