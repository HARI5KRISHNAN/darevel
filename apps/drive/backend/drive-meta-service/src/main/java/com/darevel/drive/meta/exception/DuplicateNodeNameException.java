package com.darevel.drive.meta.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateNodeNameException extends RuntimeException {

    public DuplicateNodeNameException(String name) {
        super("A node with name '%s' already exists in this folder".formatted(name));
    }
}
