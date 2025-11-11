package com.darevel.notify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.darevel.notify", "com.darevel.common"})
public class NotifyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotifyServiceApplication.class, args);
    }
}
