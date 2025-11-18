package com.darevel.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.darevel.chat", "com.darevel.common"})
public class ChatServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatServiceApplication.class, args);
    }
}
