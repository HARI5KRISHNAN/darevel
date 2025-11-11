package com.darevel.drive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.darevel.drive", "com.darevel.common"})
public class DriveServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DriveServiceApplication.class, args);
    }
}
