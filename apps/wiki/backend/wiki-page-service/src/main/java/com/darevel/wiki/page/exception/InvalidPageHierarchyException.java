package com.darevel.wiki.page.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidPageHierarchyException extends RuntimeException {

    public InvalidPageHierarchyException(String message) {
        super(message);
    }
}
