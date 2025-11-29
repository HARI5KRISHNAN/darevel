package com.darevel.access;

import com.darevel.access.config.AccessProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableConfigurationProperties(AccessProperties.class)
public class AuthzServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthzServiceApplication.class, args);
    }
}
