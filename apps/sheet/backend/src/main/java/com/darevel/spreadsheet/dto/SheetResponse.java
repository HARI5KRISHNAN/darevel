package com.darevel.spreadsheet.dto;

import java.time.LocalDateTime;

public class SheetResponse {
    private Long id;
    private String name;
    private String data;
    private String merges;
    private LocalDateTime lastSavedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SheetResponse() {
    }

    public SheetResponse(Long id, String name, String data, String merges, LocalDateTime lastSavedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.merges = merges;
        this.lastSavedAt = lastSavedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getMerges() {
        return merges;
    }

    public void setMerges(String merges) {
        this.merges = merges;
    }

    public LocalDateTime getLastSavedAt() {
        return lastSavedAt;
    }

    public void setLastSavedAt(LocalDateTime lastSavedAt) {
        this.lastSavedAt = lastSavedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
