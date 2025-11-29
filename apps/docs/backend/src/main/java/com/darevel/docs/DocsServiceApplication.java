package com.darevel.docs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DocsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocsServiceApplication.java, args);
    }
}
