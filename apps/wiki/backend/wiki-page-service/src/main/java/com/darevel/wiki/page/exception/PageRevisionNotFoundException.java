package com.darevel.wiki.page.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PageRevisionNotFoundException extends RuntimeException {

    public PageRevisionNotFoundException() {
        super("Page revision not found");
    }
}
