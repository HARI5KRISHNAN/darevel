package com.darevel.access.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.Duration;
import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "darevel.access")
public class AccessProperties {

    private Duration permissionCacheTtl = Duration.ofMinutes(10);
    private Duration assignmentCacheTtl = Duration.ofMinutes(5);

    private final Redis redis = new Redis();
    private final Defaults defaults = new Defaults();

    @Data
    public static class Redis {
        @NotBlank
        private String assignmentChannel = "access.assignment.events";
        @NotBlank
        private String permissionChannel = "access.permission.events";
    }

    @Data
    public static class Defaults {
        @NotEmpty
        private List<String> bootstrapRoles = List.of("workspace-admin", "workspace-editor", "workspace-viewer");
        @NotBlank
        private String fallbackRole = "workspace-viewer";
    }
}
