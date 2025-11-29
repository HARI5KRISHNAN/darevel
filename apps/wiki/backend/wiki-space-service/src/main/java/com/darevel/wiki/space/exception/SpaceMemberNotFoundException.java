package com.darevel.wiki.space.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SpaceMemberNotFoundException extends RuntimeException {

    public SpaceMemberNotFoundException() {
        super("User is not a member of this space");
    }
}
