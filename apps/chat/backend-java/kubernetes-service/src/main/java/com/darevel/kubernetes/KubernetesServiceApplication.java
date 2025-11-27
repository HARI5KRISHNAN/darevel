package com.darevel.kubernetes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KubernetesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KubernetesServiceApplication.class, args);
    }
}
