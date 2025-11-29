package com.darevel.docs.util;

import com.darevel.docs.dto.UserInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class SecurityUtil {

    public static UserInfo getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return UserInfo.builder()
                    .userId(jwt.getSubject())
                    .userName(jwt.getClaimAsString("preferred_username"))
                    .userEmail(jwt.getClaimAsString("email"))
                    .orgId(jwt.getClaimAsString("org_id"))
                    .build();
        }

        return null;
    }

    public static String getCurrentUserId() {
        UserInfo user = getCurrentUser();
        return user != null ? user.getUserId() : null;
    }

    public static String getCurrentUserName() {
        UserInfo user = getCurrentUser();
        return user != null ? user.getUserName() : "Unknown User";
    }

    public static String getCurrentOrgId() {
        UserInfo user = getCurrentUser();
        return user != null ? user.getOrgId() : null;
    }
}
