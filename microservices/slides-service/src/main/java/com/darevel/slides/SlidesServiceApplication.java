package com.darevel.slides;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.darevel.slides", "com.darevel.common"})
public class SlidesServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SlidesServiceApplication.class, args);
    }
}
