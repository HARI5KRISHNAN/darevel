package com.darevel.preview.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI previewOpenApi() {
        SecurityScheme scheme = new SecurityScheme()
            .name("bearer-jwt")
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT");
        return new OpenAPI()
            .info(new Info().title("Preview Service API").version("v1"))
            .components(new Components().addSecuritySchemes("bearer-jwt", scheme))
            .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
