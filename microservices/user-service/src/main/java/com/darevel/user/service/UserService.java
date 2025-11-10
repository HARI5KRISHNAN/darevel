package com.darevel.user.service;

import com.darevel.common.dto.UserDTO;
import com.darevel.common.exception.ResourceNotFoundException;
import com.darevel.user.entity.User;
import com.darevel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userId = jwt.getSubject();
        String email = jwt.getClaim("email");
        String name = jwt.getClaim("name");

        // Get or create user
        User user = userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(userId)
                            .email(email)
                            .name(name)
                            .build();
                    return userRepository.save(newUser);
                });

        return mapToDTO(user, authentication);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToDTO(user, null);
    }

    @Transactional
    public UserDTO updateProfile(Authentication authentication, UserDTO userDTO) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userId = jwt.getSubject();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser, authentication);
    }

    private UserDTO mapToDTO(User user, Authentication authentication) {
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        if (authentication != null) {
            List<String> roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(role -> role.replace("ROLE_", ""))
                    .collect(Collectors.toList());
            builder.roles(roles);
        }

        return builder.build();
    }
}
