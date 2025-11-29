package com.darevel.billing.controller.dto;

public record CancelSubscriptionRequest(Boolean immediate, String reason) {

    public boolean cancelImmediately() {
        return Boolean.TRUE.equals(immediate);
    }
}
