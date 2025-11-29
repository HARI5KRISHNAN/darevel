package com.darevel.wiki.space.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SpaceMemberAlreadyExistsException extends RuntimeException {

    public SpaceMemberAlreadyExistsException() {
        super("User is already a member of this space");
    }
}
