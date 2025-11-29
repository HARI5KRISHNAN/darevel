package com.darevel.wiki.page.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PageSlugAlreadyExistsException extends RuntimeException {

    public PageSlugAlreadyExistsException(String slug) {
        super("Page slug already exists: " + slug);
    }
}
