package com.darevel.audit.config;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Component
public class TenantResolver {

    public UUID resolveOrgId(Jwt jwt, String fallbackHeader) {
        try {
            if (jwt != null) {
                Object claim = jwt.getClaims().get("org_id");
                if (claim instanceof String claimString && StringUtils.hasText(claimString)) {
                    return UUID.fromString(claimString);
                }
            }
            if (StringUtils.hasText(fallbackHeader)) {
                return UUID.fromString(fallbackHeader.trim());
            }
        } catch (IllegalArgumentException ex) {
            throw new AccessDeniedException("Invalid org identifier", ex);
        }
        throw new AccessDeniedException("Missing org identifier (org_id claim)");
    }

    public void assertSameOrg(UUID pathOrgId, Jwt jwt, String fallbackHeader) {
        UUID resolved = resolveOrgId(jwt, fallbackHeader);
        if (!resolved.equals(pathOrgId)) {
            throw new AccessDeniedException("Cross-tenant access is not permitted");
        }
    }
}
