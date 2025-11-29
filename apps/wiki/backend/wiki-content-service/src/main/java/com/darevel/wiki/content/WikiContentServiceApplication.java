package com.darevel.wiki.content;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WikiContentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WikiContentServiceApplication.class, args);
    }
}
