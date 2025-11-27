package com.darevel.dashboard.service;

import com.darevel.dashboard.exception.ResourceNotFoundException;
import com.darevel.dashboard.model.User;
import com.darevel.dashboard.model.UserPreferences;
import com.darevel.dashboard.repository.UserPreferencesRepository;
import com.darevel.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional(readOnly = true)
    public User getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "keycloakId", keycloakId));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Transactional
    public User createOrUpdateUser(User user) {
        return userRepository.findByKeycloakId(user.getKeycloakId())
                .map(existingUser -> {
                    existingUser.setName(user.getName());
                    existingUser.setEmail(user.getEmail());
                    existingUser.setPicture(user.getPicture());
                    existingUser.setRoles(user.getRoles());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    log.info("Creating new user: {}", user.getEmail());
                    User newUser = userRepository.save(user);

                    // Create default preferences
                    UserPreferences prefs = new UserPreferences();
                    prefs.setUser(newUser);
                    prefs.setTheme("light");
                    prefs.setLanguage("en");
                    prefs.setNotifications(createDefaultNotifications());
                    userPreferencesRepository.save(prefs);

                    return newUser;
                });
    }

    @Transactional(readOnly = true)
    public UserPreferences getUserPreferences(Long userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserPreferences", "userId", userId));
    }

    @Transactional
    public UserPreferences updateUserPreferences(Long userId, UserPreferences preferences) {
        UserPreferences existing = userPreferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserPreferences", "userId", userId));

        existing.setTheme(preferences.getTheme());
        existing.setLanguage(preferences.getLanguage());
        existing.setNotifications(preferences.getNotifications());
        existing.setDashboardLayout(preferences.getDashboardLayout());

        return userPreferencesRepository.save(existing);
    }

    private Map<String, Boolean> createDefaultNotifications() {
        Map<String, Boolean> notifications = new HashMap<>();
        notifications.put("email", true);
        notifications.put("push", true);
        return notifications;
    }
}
