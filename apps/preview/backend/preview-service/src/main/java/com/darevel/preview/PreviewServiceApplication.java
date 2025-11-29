package com.darevel.preview;

import com.darevel.preview.config.properties.GeminiProperties;
import com.darevel.preview.config.properties.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({StorageProperties.class, GeminiProperties.class})
public class PreviewServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PreviewServiceApplication.class, args);
    }
}
