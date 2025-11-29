package com.darevel.drive.meta.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidNodeMoveException extends RuntimeException {

    public InvalidNodeMoveException(String message) {
        super(message);
    }
}
