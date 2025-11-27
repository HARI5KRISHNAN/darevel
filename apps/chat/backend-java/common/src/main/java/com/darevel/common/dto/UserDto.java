package com.darevel.common.dto;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String avatar;
    private String level;
    private LocalDateTime createdAt;

    public UserDto() {
    }

    public UserDto(Long id, String name, String email, String avatar, String level, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.level = level;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
