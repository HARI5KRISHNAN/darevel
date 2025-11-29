package com.darevel.search.model;

import org.springframework.util.Assert;

public record SearchContext(String userId, String orgId) {

    public SearchContext {
        Assert.hasText(userId, "userId header is required");
        Assert.hasText(orgId, "orgId header is required");
    }
}
