package com.darevel.access.service;

import com.darevel.access.config.AccessProperties;
import java.time.Duration;
import java.util.Collection;
import java.util.Objects;
import java.util.UUID;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class PermissionCacheService {

    private final StringRedisTemplate redisTemplate;
    private final Duration permissionTtl;

    public PermissionCacheService(StringRedisTemplate redisTemplate, AccessProperties properties) {
        this.redisTemplate = redisTemplate;
        this.permissionTtl = properties.getPermissionCacheTtl();
    }

    public void cacheResult(UUID workspaceId, UUID userId, String permissionCode, String resourceKey, boolean granted) {
        String key = cacheKey(workspaceId, userId, permissionCode, resourceKey);
        redisTemplate.opsForValue().set(key, Boolean.toString(granted), permissionTtl);
    }

    public Boolean getCachedResult(UUID workspaceId, UUID userId, String permissionCode, String resourceKey) {
        String key = cacheKey(workspaceId, userId, permissionCode, resourceKey);
        String value = redisTemplate.opsForValue().get(key);
        return value == null ? null : Boolean.valueOf(value);
    }

    public void evictUser(UUID workspaceId, UUID userId) {
        String pattern = String.format("authz:%s:%s:*", workspaceId, userId);
        redisTemplate.keys(pattern).forEach(redisTemplate::delete);
    }

    public void evictUsers(UUID workspaceId, Collection<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        userIds.forEach(userId -> evictUser(workspaceId, userId));
    }

    public void evictWorkspace(UUID workspaceId) {
        String pattern = String.format("authz:%s:*", workspaceId);
        redisTemplate.keys(pattern).forEach(redisTemplate::delete);
    }

    private String cacheKey(UUID workspaceId, UUID userId, String permissionCode, String resourceKey) {
        String resourceSegment = Objects.requireNonNullElse(resourceKey, "*");
        return String.format("authz:%s:%s:%s:%s", workspaceId, userId, permissionCode, resourceSegment);
    }
}
