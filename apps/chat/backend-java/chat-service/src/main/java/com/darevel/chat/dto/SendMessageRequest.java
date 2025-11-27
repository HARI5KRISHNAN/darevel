package com.darevel.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SendMessageRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Content is required")
    private String content;

    public SendMessageRequest() {
    }

    public SendMessageRequest(Long userId, String content) {
        this.userId = userId;
        this.content = content;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
