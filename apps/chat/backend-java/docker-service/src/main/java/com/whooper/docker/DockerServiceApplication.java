package com.whooper.docker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DockerServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(DockerServiceApplication.class, args);
    }
}
