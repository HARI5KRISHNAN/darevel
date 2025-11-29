package com.darevel.search.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "darevel.search")
public class SearchProperties {

    @NotBlank
    private String index = "workspace-global";

    @Positive
    private int defaultPageSize = 10;

    @Positive
    private int maxPageSize = 50;

    private Duration suggestionsCacheTtl = Duration.ofMinutes(5);

    private final Meilisearch meilisearch = new Meilisearch();
    private final Redis redis = new Redis();
    private final Ingestion ingestion = new Ingestion();
    private final Permissions permissions = new Permissions();

    @Data
    public static class Meilisearch {
        @NotBlank
        private String host = "http://localhost:7710";
        @NotBlank
        private String apiKey = "masterKey";
    }

    @Data
    public static class Redis {
        @NotEmpty
        private List<String> channels = List.of("events.chat", "events.docs", "events.mail");
    }

    @Data
    public static class Ingestion {
        private List<String> allowedTypes = List.of("docs", "chat", "mail", "files", "tasks", "wiki", "calendar");
        private String defaultVisibility = "INTERNAL";
    }

    @Data
    public static class Permissions {
        private String fallbackRole = "workspace-reader";
    }
}
