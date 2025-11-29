package com.darevel.wiki.space.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SpaceKeyAlreadyExistsException extends RuntimeException {

    public SpaceKeyAlreadyExistsException(String key) {
        super("Space key already exists: " + key);
    }
}
