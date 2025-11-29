package com.darevel.dashboard.context;

import com.darevel.dashboard.config.DashboardProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Component
public class DashboardRequestContextResolver {

    private static final String HEADER_USER_ID = "X-Darevel-User-Id";
    private static final String HEADER_USER_NAME = "X-Darevel-User-Name";
    private static final String HEADER_ORG_ID = "X-Darevel-Org-Id";
    private static final String HEADER_ORG_NAME = "X-Darevel-Org-Name";
    private static final String HEADER_TEAM_ID = "X-Darevel-Team-Id";
    private static final String HEADER_TEAM_NAME = "X-Darevel-Team-Name";

    private final DashboardProperties properties;

    public DashboardRequestContextResolver(DashboardProperties properties) {
        this.properties = properties;
    }

    public DashboardRequestContext resolve() {
        HttpServletRequest request = currentRequest();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UUID headerUserId = parseUuid(header(request, HEADER_USER_ID));
        UUID headerOrgId = parseUuid(header(request, HEADER_ORG_ID));
        UUID headerTeamId = parseUuid(header(request, HEADER_TEAM_ID));

        String headerUserName = header(request, HEADER_USER_NAME);
        String headerOrgName = header(request, HEADER_ORG_NAME);
        String headerTeamName = header(request, HEADER_TEAM_NAME);

        UUID jwtUserId = extractUuidClaim(authentication, "sub");
        UUID jwtOrgId = extractUuidClaim(authentication, "org_id");
        UUID jwtTeamId = extractUuidClaim(authentication, "team_id");

        String jwtUserName = extractStringClaim(authentication, "name");
        String jwtOrgName = extractStringClaim(authentication, "org_name");
        String jwtTeamName = extractStringClaim(authentication, "team_name");

        UUID userId = firstNonNull(headerUserId, jwtUserId, properties.demo().userId());
        UUID orgId = firstNonNull(headerOrgId, jwtOrgId, properties.demo().orgId());
        UUID teamId = firstNonNull(headerTeamId, jwtTeamId, properties.demo().teamId());

        String userName = firstNonBlank(headerUserName, jwtUserName, properties.demo().userName());
        String orgName = firstNonBlank(headerOrgName, jwtOrgName, properties.demo().orgName());
        String teamName = firstNonBlank(headerTeamName, jwtTeamName, properties.demo().teamName());

        return new DashboardRequestContext(userId, orgId, teamId, userName, teamName, orgName);
    }

    public UUID normalizeIdentifier(String rawIdentifier, UUID fallback) {
        if (!StringUtils.hasText(rawIdentifier)) {
            return fallback;
        }
        try {
            return UUID.fromString(rawIdentifier);
        } catch (IllegalArgumentException ex) {
            return UUID.nameUUIDFromBytes(rawIdentifier.getBytes(StandardCharsets.UTF_8));
        }
    }

    private UUID extractUuidClaim(Authentication authentication, String claimName) {
        return Optional.ofNullable(authentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .map(JwtAuthenticationToken.class::cast)
                .map(JwtAuthenticationToken::getToken)
                .map(token -> token.getClaimAsString(claimName))
                .map(this::parseUuid)
                .orElse(null);
    }

    private String extractStringClaim(Authentication authentication, String claimName) {
        return Optional.ofNullable(authentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .map(JwtAuthenticationToken.class::cast)
                .map(JwtAuthenticationToken::getToken)
                .map(token -> token.getClaimAsString(claimName))
                .filter(StringUtils::hasText)
                .orElse(null);
    }

    private UUID parseUuid(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private HttpServletRequest currentRequest() {
        return Optional.ofNullable(RequestContextHolder.getRequestAttributes())
                .filter(ServletRequestAttributes.class::isInstance)
                .map(ServletRequestAttributes.class::cast)
                .map(ServletRequestAttributes::getRequest)
                .orElse(null);
    }

    private String header(HttpServletRequest request, String name) {
        if (request == null) {
            return null;
        }
        return request.getHeader(name);
    }

    @SafeVarargs
    private static <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }
}
