package com.darevel.excel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.darevel.excel", "com.darevel.common"})
public class ExcelServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExcelServiceApplication.class, args);
    }
}
