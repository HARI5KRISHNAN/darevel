package com.darevel.permissions;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.darevel.permissions", "com.darevel.common"})
public class PermissionsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PermissionsServiceApplication.class, args);
    }
}
